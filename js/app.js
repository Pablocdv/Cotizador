/**
 * Main Application Logic
 */

document.addEventListener('DOMContentLoaded', async () => {
    // UI Elements
    const materialSelect = document.getElementById('materialSelect');
    const widthInput = document.getElementById('widthInput');
    const heightInput = document.getElementById('heightInput');
    const dolarInput = document.getElementById('dolarInput');
    const statusBadge = document.getElementById('dataStatus');
    const whatsappBtn = document.getElementById('whatsappBtn');

    // Display Elements
    const totalArsEl = document.getElementById('totalArs');
    const totalUsdEl = document.getElementById('totalUsd');
    const summaryMaterial = document.getElementById('summaryMaterial');
    const summaryDimensions = document.getElementById('summaryDimensions');
    const summaryArea = document.getElementById('summaryArea');
    const summaryPrice = document.getElementById('summaryPrice');

    // State
    let materials = [];

    // Initialize
    async function init() {
        try {
            statusBadge.textContent = "Conectando...";
            materials = await fetchMaterialData(); // from api.js

            if (materials && materials.length > 0) {
                populateMaterials(materials);
                statusBadge.textContent = "Datos Actualizados";
                statusBadge.classList.add("success");
                materialSelect.disabled = false;
            } else {
                throw new Error("No data");
            }
        } catch (e) {
            statusBadge.textContent = "Error de Conexión";
            statusBadge.classList.add("error");
            materialSelect.innerHTML = "<option>Error al cargar precios</option>";
        }
    }

    function populateMaterials(data) {
        materialSelect.innerHTML = '<option value="">Seleccione Material...</option>';
        data.forEach(mat => {
            const opt = document.createElement('option');
            opt.value = mat.price;
            opt.textContent = mat.name; // Display only name
            opt.dataset.name = mat.name;
            materialSelect.appendChild(opt);
        });
    }

    function updateCalculation() {
        const width = parseFloat(widthInput.value) || 0;
        const height = parseFloat(heightInput.value) || 0;
        const price = parseFloat(materialSelect.value) || 0;
        const dolar = parseFloat(dolarInput.value) || 0;

        const result = calculateCost(width, height, price, dolar); // from calculator.js

        // Update UI
        totalArsEl.textContent = formatCurrency(result.ars, 'ARS');
        totalUsdEl.textContent = `USD ${formatCurrency(result.usd, 'USD')}`;

        // Summary
        const selectedOpt = materialSelect.options[materialSelect.selectedIndex];
        summaryMaterial.textContent = selectedOpt && selectedOpt.value ? selectedOpt.dataset.name : '-';
        summaryDimensions.textContent = width > 0 && height > 0 ? `${width} x ${height} cm` : '-';
        summaryArea.textContent = result.area > 0 ? result.area.toFixed(2) + " m²" : '- m²';
        summaryPrice.textContent = price > 0 ? `USD ${formatCurrency(price, 'USD')}` : '-';

        return { ...result, materialName: selectedOpt ? selectedOpt.dataset.name : '' };
    }

    function sendToWhatsapp() {
        const width = widthInput.value;
        const height = heightInput.value;
        const dolar = parseFloat(dolarInput.value) || 0;

        // Get fresh calculation
        const result = updateCalculation();

        if (!result.materialName || !width || !height) {
            alert("Por favor complete todos los campos para cotizar.");
            return;
        }

        const msg = `*COTIZACIÓN*%0A%0A*Material:* ${result.materialName}%0A*Medidas:* ${width}x${height} cm (${result.area.toFixed(2)} m²)%0A*Precio Unitario:* USD ${formatCurrency(parseFloat(materialSelect.value), 'USD')}%0A*Dólar:* $${dolar}%0A%0A*TOTAL ESTIMADO:* $${formatCurrency(result.ars, 'ARS')}`;

        window.open(`https://wa.me/?text=${msg}`, '_blank');
    }

    // Event Listeners
    materialSelect.addEventListener('change', updateCalculation);
    widthInput.addEventListener('input', updateCalculation);
    heightInput.addEventListener('input', updateCalculation);
    dolarInput.addEventListener('input', updateCalculation);
    whatsappBtn.addEventListener('click', sendToWhatsapp);

    // Run
    init();
});
