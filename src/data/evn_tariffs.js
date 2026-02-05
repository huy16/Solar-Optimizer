export const EVN_TARIFFS = {
    "manufacturing": {
        label: "Sản xuất (Manufacturing)",
        voltage_levels: [
            {
                id: "110kv_plus",
                label: "Cap 110kV trở lên",
                prices: { normal: 1811, peak: 3266, off_peak: 1146 }
            },
            {
                id: "22kv_110kv",
                label: "Cap 22kV - 110kV",
                prices: { normal: 1833, peak: 3398, off_peak: 1190 }
            },
            {
                id: "6kv_22kv",
                label: "Cap 6kV - 22kV",
                prices: { normal: 1899, peak: 3508, off_peak: 1234 }
            },
            {
                id: "under_6kv",
                label: "Cap duoi 6kV (Hạ áp)",
                prices: { normal: 1987, peak: 3640, off_peak: 1300 }
            }
        ]
    },
    "business": {
        label: "Kinh doanh (Business)",
        voltage_levels: [
            {
                id: "22kv_plus",
                label: "Cap 22kV trở lên",
                prices: { normal: 2887, peak: 5025, off_peak: 1609 }
            },
            {
                id: "6kv_22kv",
                label: "Cap 6kV - 22kV",
                prices: { normal: 3108, peak: 5202, off_peak: 1829 }
            },
            {
                id: "under_6kv",
                label: "Cap duoi 6kV (Hạ áp)",
                prices: { normal: 3152, peak: 5422, off_peak: 1918 }
            }
        ]
    },
    "admin": {
        label: "Hành chính sự nghiệp (Admin)",
        voltage_levels: [
            {
                id: "6kv_plus",
                label: "Cap 6kV trở lên",
                prices: { normal: 1989, peak: 1989, off_peak: 1989 } // Placeholder if not in snippet
            },
            {
                id: "under_6kv",
                label: "Cap duoi 6kV",
                prices: { normal: 2092, peak: 2092, off_peak: 2092 }
            }
        ]
    }
};

// Default Ratios if user doesn't specify
const DEFAULT_RATIOS = {
    normal: 0.60,
    peak: 0.25,
    off_peak: 0.15
};

export const calculateBlendedPrice = (customerType, voltageLevel, ratios = DEFAULT_RATIOS) => {
    const group = EVN_TARIFFS[customerType];
    if (!group) return 2000;

    // Find exact or closest voltage level
    const level = group.voltage_levels.find(v => v.id === voltageLevel) || group.voltage_levels[0];
    const p = level.prices;

    // Weighted Average
    return Math.round((p.normal * ratios.normal) + (p.peak * ratios.peak) + (p.off_peak * ratios.off_peak));
};
