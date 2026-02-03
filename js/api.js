/**
 * API Logic for fetching and parsing Google Sheet CSV
 */

const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQOf98asUFDCGY2gRpbbMmB3KQyWbZbZcDv7FAhxp5lTvvRuZegS9AdhnwKNVRBldvHPsCEgecllMyT/pub?gid=0&single=true&output=csv";

// Helper to parse CSV manually (handling quotes)
function parseCSV(text) {
    const rows = [];
    const re = /(?:\s*\n|\r\n|\n|\r|^)(?:"((?:[^"]|"")*)"|([^",\r\n]*))(?:,|$)/g;
    let row = [];
    let match;
    let idx = 0;
    while ((match = re.exec(text)) !== null) {
        if (idx++ > 100000) break; // Safety break
        const quoted = match[1];
        const unquoted = match[2];
        const val = quoted !== undefined ? quoted.replace(/""/g, '"') : (unquoted || '');
        row.push(val.trim());
        const nextChar = text[re.lastIndex - 1];
        if (nextChar === '\n' || nextChar === '\r') {
            rows.push(row);
            row = [];
        }
    }
    if (row.length) rows.push(row);
    return rows;
}

// Fetch data using multiple proxies for robustness
async function fetchMaterialData() {
    // Strategy: Try proxies sequentially
    const proxies = [
        // Primary: AllOrigins
        url => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
        // Secondary: CORSProxy.io (often reliable)
        url => `https://corsproxy.io/?${encodeURIComponent(url)}`,
        // Fallback: Direct (works if user installs CORS extension or in some dev environments)
        url => url
    ];

    let lastError = null;

    for (const makeUrl of proxies) {
        const fetchUrl = makeUrl(CSV_URL);
        console.log(`Trying fetch via: ${fetchUrl}`);

        try {
            const response = await fetch(fetchUrl);
            if (!response.ok) throw new Error(`Status ${response.status}`);
            const text = await response.text();

            // Validate content (must resemble CSV)
            if (!text || text.length < 10 || !text.includes('MATERIAL')) {
                throw new Error("Contenido inválido o vacío");
            }

            const rows = parseCSV(text);

            // Find header row index
            let headerRowIndex = -1;
            // Scan first 10 rows for headers
            for (let i = 0; i < Math.min(rows.length, 10); i++) {
                // Check basically for key columns
                const r = rows[i].map(c => c.toUpperCase());
                if (r.some(c => c.includes('MATERIAL')) && r.some(c => c.includes('U$S'))) {
                    headerRowIndex = i;
                    break;
                }
            }

            if (headerRowIndex === -1) throw new Error("No se encontraron encabezados (MATERIAL / U$S)");

            const headers = rows[headerRowIndex].map(h => h.toUpperCase());
            // Flexible header matching
            const matIndex = headers.findIndex(h => h.includes('MATERIAL'));
            const priceIndex = headers.findIndex(h => h.includes('U$S'));

            if (matIndex === -1 || priceIndex === -1) throw new Error("Columnas no encontradas");

            const materials = [];

            for (let i = headerRowIndex + 1; i < rows.length; i++) {
                const row = rows[i];
                if (!row[matIndex]) continue;

                const name = row[matIndex];
                const rawPrice = row[priceIndex];

                if (name && rawPrice) {
                    // Clean price: remove $, commas if american format mixups, spaces
                    const price = parseFloat(rawPrice.replace(/[$\s]/g, '').replace(',', '.')) || 0;
                    if (price > 0) {
                        materials.push({ name, price });
                    }
                }
            }

            console.log(`Loaded ${materials.length} materials successfully.`);
            return materials; // Success!

        } catch (error) {
            console.warn(`Failed with proxy ${fetchUrl}:`, error);
            lastError = error;
            // Continue to next proxy
        }
    }

    console.error("All fetch attempts failed.");
    throw lastError || new Error("No se pudo conectar con la hoja de cálculo. Por favor habilita CORS o revisa la URL.");
}
