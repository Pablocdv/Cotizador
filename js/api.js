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
    while ((match = re.exec(text)) !== null) {
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

// Fetch data using AllOrigins as proxy for CORS
async function fetchMaterialData() {
    const proxyUrl = "https://api.allorigins.win/raw?url=" + encodeURIComponent(CSV_URL);

    try {
        const response = await fetch(proxyUrl);
        if (!response.ok) throw new Error("Error en la red");
        const text = await response.text();
        const rows = parseCSV(text);

        // Map data: Looking for 'MATERIAL' and 'M2 U$S' columns (E and F -> Index 4 and 5)
        // Or specific headers

        // Find header row index
        let headerRowIndex = -1;
        for (let i = 0; i < rows.length; i++) {
            if (rows[i].includes('MATERIAL') && rows[i].includes('M2 U$S')) {
                headerRowIndex = i;
                break;
            }
        }

        if (headerRowIndex === -1) throw new Error("No se encontraron encabezados válidos");

        const headers = rows[headerRowIndex];
        const matIndex = headers.indexOf('MATERIAL');
        const priceIndex = headers.indexOf('M2 U$S');

        const materials = [];

        for (let i = headerRowIndex + 1; i < rows.length; i++) {
            const row = rows[i];
            const name = row[matIndex];
            // Remove '$' and parse
            const rawPrice = row[priceIndex];

            if (name && rawPrice) {
                const price = parseFloat(rawPrice.replace(/[$,]/g, '')) || 0;
                if (price > 0) {
                    materials.push({ name, price });
                }
            }
        }

        return materials;

    } catch (error) {
        console.error("Fetch Error:", error);
        return null;
    }
}
