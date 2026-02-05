/**
 * Generates a synthetic load profile (8760 hours) from monthly consumption data.
 * @param {number[]} monthlyData - Array of 12 monthly kWh values (Jan-Dec).
 * @param {string} profileType - Type of daily profile.
 * @param {number} year - The year to generate data for (default: current year).
 * @param {Object} options - Advanced options
 * @param {number[]} options.workSchedule - Array of 7 ints (0=Off, 1=On) for Mon-Sun. Default [1,1,1,1,1,1,1].
 * @param {boolean} options.hasCooling - If true, boost afternoon load in Summer (May-Jul).
 * @param {number} options.baseLoadPct - The percentage of load during Non-Working days (0-100). Default 15.
 * @returns {Array<{timestamp: Date, consumption: number}>} - Hourly data points.
 */

// Daily Profile Weights (0-23 hours) - Extracted from "Solar Calculation tool_V2.xlsm"
export const LOAD_PROFILES = {
    "Kinh doanh - Dinh ban dem": [1.6, 1.5, 1.4, 1.5, 1.6, 2.1, 2.6, 3.1, 3.9, 4.1, 4.2, 4.3, 4.3, 4.4, 4.3, 4.9, 6.4, 6.5, 7, 7, 7, 7, 5.7, 3.6],
    "Kinh doanh - Dinh ban ngay": [1.4, 1.4, 1.3, 1.3, 1.3, 1.3, 1.3, 1.3, 5.4, 7.5, 7.6, 7.8, 7.2, 7.2, 7.8, 7.6, 7.5, 7.4, 5.8, 4.6, 1.5, 1.5, 1.5, 1.5],
    "Kinh doanh - 2 Dinh": [1, 1, 1, 1, 1, 1.6, 2.5, 3.4, 6.4, 7.2, 7.3, 7.1, 5, 4.8, 6.8, 7.3, 7.2, 6.8, 5.4, 4.3, 4.1, 3.5, 2.8, 1.5],
    "San xuat - Phu tai deu": [4.2, 4.2, 4.2, 4.2, 4.2, 4.2, 4.2, 4.2, 4.2, 4.2, 4.2, 4.2, 4.2, 4.2, 4.2, 4.2, 4.2, 4.2, 4.2, 4.2, 4.2, 4.2, 4.2, 4.2],
    "San xuat - 2 Dinh": [1, 1, 1, 1, 1, 1.6, 2.5, 3.4, 6.4, 7.2, 8.2, 7.3, 5, 7.5, 8.3, 8.2, 7.2, 6.7, 5.5, 4, 2.5, 1.5, 1, 1],
    "San xuat - 3 Dinh": [3.6, 4.4, 4.5, 4.6, 4.5, 4.3, 4.1, 3.3, 3.6, 4.4, 4.6, 4.6, 4.5, 4.3, 4.1, 3.3, 3.6, 4.4, 4.5, 4.6, 4.5, 4.3, 4.1, 3.3],
    "Sinh hoat - Phu tai ngay": [2.8, 2.4, 2.3, 2.2, 2.2, 2.5, 2.9, 3.6, 4.2, 4.5, 4.6, 4.8, 4.9, 4.9, 4.9, 5, 5.5, 6.1, 6.3, 5.9, 5.4, 4.8, 4, 3.3],
    "Sinh hoat - Ngay va Dem": [2.2, 2, 1.9, 1.9, 2.1, 3, 4.8, 6.6, 6.7, 5.5, 4.4, 3.9, 3.8, 3.6, 3.6, 3.8, 4.5, 5.6, 6.5, 6.4, 5.7, 4.9, 3.8, 2.8],
    "Sinh hoat - Phu tai chieu toi": [2.4, 1.8, 1.6, 1.5, 1.6, 2.1, 2.8, 3.7, 3.9, 3.7, 3.4, 3.2, 3.2, 3.1, 3.7, 4.8, 6.5, 8.1, 9.1, 8.3, 7.7, 6.2, 4.3, 3.3],
    "Sinh hoat - Phu tai dem khuya": [5.4, 4.8, 4.3, 4, 3.6, 3.4, 3.3, 3.5, 3.4, 3.3, 3.2, 3.2, 3.2, 3.2, 3.2, 3.3, 3.6, 4.3, 5.1, 5.6, 5.7, 5.8, 5.8, 5.8],
    "Bach Hoa Xanh": [1.9, 1.9, 1.9, 1.9, 1.9, 2.5, 4.7, 5.3, 5.7, 5.5, 5.7, 5.9, 5.9, 5.7, 5.7, 5.3, 5.3, 5.1, 4.9, 4.7, 4.4, 4.4, 1.9, 1.9],
    "Dien May Xanh": [0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 1.3, 4, 7.3, 7.7, 7.8, 7.7, 7.2, 7.1, 7.1, 7, 6.2, 6.2, 5.8, 5.9, 5, 0.9, 0.9],
    "Vinamilk DN": [4.1, 4, 4.3, 4.3, 3.8, 3.8, 4.8, 4.9, 4.7, 4.7, 4, 3, 1.9, 2.5, 3.7, 4.7, 4.7, 4, 4.3, 4.8, 4.6, 4.6, 4.7, 4.9],
    "Benh vien": [3.3, 3.3, 3.3, 3.3, 4.4, 4.4, 4.4, 4.4, 4.4, 4.4, 4.7, 4.7, 4.4, 4.4, 4.4, 4.4, 4.4, 4.7, 4.7, 4.7, 4.4, 4.4, 3.3, 3.3],
    "SAKAGUCHI 2": [3.7, 3.7, 3.7, 3.6, 3.5, 3.9, 3.8, 3.9, 4.2, 4.4, 4.6, 4.8, 4.4, 4.4, 4.4, 4.6, 4.6, 4.5, 4.4, 4.5, 4, 4.2, 4.1, 4.1],
    "CHUNG CU - RIVANA": [3.8, 3.8, 3.8, 3.8, 2.5, 2.5, 2.5, 2.5, 2.5, 2.8, 3, 2.8, 2.5, 2.5, 2.5, 2.5, 2.5, 8.9, 8.9, 8.9, 8.9, 7.6, 3.8, 4.2],
    "RO UNIFORMS 1": [0.2, 0.2, 0.2, 0.2, 4.6, 4.6, 4.6, 4.6, 6.8, 6.1, 5.4, 6.1, 4.6, 6.8, 6.8, 6.8, 6.8, 5.4, 5.4, 5.4, 3.6, 4.6, 0.2, 0],
    "VICTORY": [0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 7.3, 7.3, 7.3, 10.9, 7.3, 7.3, 7.3, 7.3, 7.3, 7.3, 7.3, 3.1, 3.1, 0.9, 0.9, 0.9, 0.9, 0.9],
    "VUBD": [3.8, 3.8, 3.8, 3.8, 4.4, 4.4, 4.4, 4.4, 4.4, 4.4, 4, 4, 4.4, 4.4, 4.4, 4.4, 4.4, 4, 4, 4, 4.4, 4.4, 3.8, 3.8],
    "SOVIGAZ": [4.1, 4.1, 4.1, 4.1, 4.2, 4.2, 4.2, 4.2, 4.2, 4.2, 4.2, 4.2, 4.2, 4.2, 4.2, 4.2, 4.2, 4.2, 4.2, 4.2, 4.1, 4.1, 4.1, 4.1]
};

export const generateSyntheticProfile = (monthlyData, profileType = 'Kinh doanh - Dinh ban ngay', year = new Date().getFullYear(), options = {}) => {
    const {
        workSchedule = [1, 1, 1, 1, 1, 1, 1], // Mon-Sun (1=Work, 0=Off)
        hasCooling = false,
        baseLoadPct = 15 // % of Max Load used on Off days
    } = options;

    const data = [];

    // 1. Select Base Profile
    let baseProfile = LOAD_PROFILES[profileType] || LOAD_PROFILES['Kinh doanh - Dinh ban ngay'];

    // 2. Normalize weights (Sum=1)
    const totalWeight = baseProfile.reduce((a, b) => a + b, 0);
    const normalizedProfile = baseProfile.map(w => w / totalWeight);

    // 3. Helper: Get Working Days in Month
    const getWorkingDays = (m, y) => {
        let count = 0;
        const days = new Date(y, m + 1, 0).getDate();
        for (let d = 1; d <= days; d++) {
            const dayOfWeek = (new Date(y, m, d).getDay() + 6) % 7; // Convert Sun(0) to Mon(0) logic? No, JS Day 0=Sun.
            // Let's standardise: 1=Mon, ..., 6=Sat, 0=Sun. 
            // workSchedule index 0=Mon, 6=Sun. 
            // JS getDay(): 0=Sun, 1=Mon.
            // Map JS Day to Schedule Index: (day + 6) % 7. 
            // e.g. Sun(0) -> 6. Mon(1) -> 0.
            const scheduleIdx = (new Date(y, m, d).getDay() + 6) % 7;
            if (workSchedule[scheduleIdx] === 1) count++;
        }
        return count;
    };

    const daysInYear = 365 + (year % 4 === 0 ? 1 : 0);

    for (let month = 0; month < 12; month++) {
        const monthlyKWh = monthlyData[month] || 0;
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const workingDays = getWorkingDays(month, year);
        const offDays = daysInMonth - workingDays;

        // Calculate Energy Split
        // Energy_Month = (Daily_Work * WorkDays) + (Daily_Off * OffDays)
        // Assume Daily_Off = Daily_Work * (baseLoadPct / 100) * (some_factor) 
        // Actually, easier: assume profile scale.
        // Let Average Daily Work Load = X.
        // Average Daily Off Load = X * (baseLoadPct / Avg_Profile_Pct). 
        // Simplification: Let's assume OffDay consumption is roughly baseLoadPct% of a WorkDay.

        const offDayRatio = baseLoadPct / 100; // e.g. 0.15
        // monthlyKWh = (WorkDays * avgDailyWork) + (OffDays * avgDailyWork * offDayRatio)
        // monthlyKWh = avgDailyWork * (WorkDays + OffDays * offDayRatio)

        let avgDailyWork = 0;
        const denominator = workingDays + (offDays * offDayRatio);
        if (denominator > 0) avgDailyWork = monthlyKWh / denominator;

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dayOfWeek = date.getDay(); // 0=Sun
            const scheduleIdx = (dayOfWeek + 6) % 7; // 0=Mon
            const isWorkDay = workSchedule[scheduleIdx] === 1;

            // Determine Daily Scale
            let dailyTotal = isWorkDay ? avgDailyWork : (avgDailyWork * offDayRatio);

            // Factor randomization
            const dailyRandom = 0.9 + Math.random() * 0.2; // +/- 10%
            dailyTotal *= dailyRandom;

            // Apply Cooling Factor (Summer: May(4) - Jul(6))
            let coolingBoost = 1.0;
            if (hasCooling && isWorkDay && (month >= 4 && month <= 6)) {
                coolingBoost = 1.15; // 15% boost
            }

            for (let hour = 0; hour < 24; hour++) {
                const timestamp = new Date(year, month, day, hour, 0, 0);

                let weight = normalizedProfile[hour];

                if (!isWorkDay) {
                    weight = 1 / 24; // Flat line
                }

                // Apply Cooling Factor (Summer: May(4) - Jul(6))
                if (hasCooling && isWorkDay && hour >= 12 && hour <= 16) {
                    weight *= 1.2;
                }

                let loadKw = dailyTotal * weight;

                // 1. EV Charging (Peak at Evening 18:00 - 22:00)
                if (options.evCharging && hour >= 18 && hour <= 22) {
                    // Add approx 10-15% of peak load to the night profile
                    const evBoost = (dailyTotal / 24) * 0.15; // 15% of avg hourly load as extra
                    loadKw += evBoost;
                }

                // 2. Extra Load Types
                if (options.extraLoadType === 'heatpump') {
                    // Heat Pump: 24/7 steady load (+5% of avg)
                    loadKw += (dailyTotal / 24) * 0.05;
                } else if (options.extraLoadType === 'machinery' && hour >= 8 && hour <= 17) {
                    // Industrial Machinery: Daytime peaks (+15%)
                    loadKw += (dailyTotal / 24) * 0.15;
                }

                data.push({
                    timestamp: timestamp,
                    consumption: Math.max(0, loadKw)
                });
            }
        }
    }

    return data;
};
