export function formatPercentage(percentage) {
    const roundedPercentage = parseFloat(percentage).toFixed(2);
    return roundedPercentage.endsWith('.00') ? roundedPercentage.slice(0, -3) + "%" : roundedPercentage + "%";
}