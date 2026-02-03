/**
 * Pure calculator functions
 */

function calculateCost(widthCm, heightCm, pricePerM2, dollarRate) {
    if (!widthCm || !heightCm || !pricePerM2) return { usd: 0, ars: 0, area: 0 };

    // Convert cm to meters
    const widthM = widthCm / 100;
    const heightM = heightCm / 100;

    // Area in M2
    const area = widthM * heightM;

    // Total Price USD
    const totalUsd = area * pricePerM2;

    // Total Price ARS
    const totalArs = totalUsd * dollarRate;

    return {
        usd: totalUsd,
        ars: totalArs,
        area: area
    };
}

function formatCurrency(amount, currency = 'ARS') {
    if (currency === 'USD') {
        return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    return amount.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
