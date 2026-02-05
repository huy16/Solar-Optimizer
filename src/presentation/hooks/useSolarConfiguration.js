import { useState, useCallback } from 'react';
import { BESS_OPTIONS, INVERTER_OPTIONS, INVERTER_DB, BESS_DB } from '../../data/sources/HardwareDatabase';
import { execute as optimizeSystem } from '../../domain/usecases/OptimizeSystem';

export const useSolarConfiguration = (initialParams, initialTechParams) => {
    // --- STATE SYSTEM CONFIG ---
    const [inv1Id, setInv1Id] = useState(INVERTER_OPTIONS[0]?.value || '');
    const [inv1Qty, setInv1Qty] = useState(0);
    const [inv2Id, setInv2Id] = useState('');
    const [inv2Qty, setInv2Qty] = useState(0);

    const [selectedBess, setSelectedBess] = useState(BESS_OPTIONS[0]?.value || 'custom');
    const [bessKwh, setBessKwh] = useState(0);
    const [bessMaxPower, setBessMaxPower] = useState(0);
    const [isGridCharge, setIsGridCharge] = useState(false);
    const [bessStrategy, setBessStrategy] = useState('self-consumption'); // 'self-consumption' | 'peak-shaving'

    // --- STATE PARAMETERS ---
    const [params, setParams] = useState(initialParams);
    const [techParams, setTechParams] = useState(initialTechParams);
    const [targetKwp, setTargetKwp] = useState(0);


    // Auto Select Inverter
    // Auto Suggest Configuration (Inverter + BESS)
    const handleMagicSuggest = useCallback(() => {
        if (targetKwp <= 0) return;

        // 1. Select Inverter (DC/AC ~ 1.25)
        const targetAC = targetKwp / 1.25;
        const bestInv = INVERTER_DB.reduce((prev, curr) =>
            Math.abs(curr.acPower - targetAC) < Math.abs(prev.acPower - targetAC) ? curr : prev
        );

        if (bestInv) {
            const qty = Math.ceil(targetAC / bestInv.acPower);
            setInv1Id(bestInv.id);
            setInv1Qty(qty);
            setInv2Id('');
            setInv2Qty(0);
        }

        // 2. Suggest BESS (approx 20% of Solar Capacity, 2h duration)
        // ONLY suggest if currently 'custom' with 0 capacity (initial state)
        if (selectedBess === 'custom' && bessKwh === 0) {
            const suggestedKwh = Math.round(targetKwp * 0.2); // 20% penetration
            setBessKwh(suggestedKwh);
            setBessMaxPower(Math.round(suggestedKwh / 2)); // 2-hour system
        }
    }, [targetKwp, selectedBess, bessKwh]);

    // Handle System Optimization
    const handleOptimize = useCallback((processedData, prices, financialParams) => {
        if (!processedData || processedData.length === 0) return;

        const result = optimizeSystem(processedData, prices, financialParams, techParams);
        if (result && result.best) {
            const { kwp, bessKwh: bestBessKwh, bessKw: bestBessKw } = result.best;

            // Apply recommended Solar size
            setTargetKwp(kwp);

            // Apply recommended BESS size
            setSelectedBess('custom');
            setBessKwh(bestBessKwh);
            setBessMaxPower(bestBessKw);

            // Auto-select inverters for the new Solar size
            // Note: We can simplify this by just calling handleMagicSuggest 
            // but we need to ensure targetKwp state update is processed.
            // For now, let's just let the user click Magic Suggest if needed or just do it here.
            const targetAC = kwp / 1.25;
            const bestInv = INVERTER_DB.reduce((prev, curr) =>
                Math.abs(curr.acPower - targetAC) < Math.abs(prev.acPower - targetAC) ? curr : prev
            );
            if (bestInv) {
                const qty = Math.ceil(targetAC / bestInv.acPower);
                setInv1Id(bestInv.id);
                setInv1Qty(qty);
                setInv2Id('');
                setInv2Qty(0);
            }
            return result.best;
        }
        return null;
    }, [techParams]);

    // Handle BESS-only Optimization (Fixed Solar Size)
    const handleOptimizeBess = useCallback((processedData, prices, financialParams) => {
        if (!processedData || processedData.length === 0) return;

        const result = optimizeSystem(processedData, prices, financialParams, { ...techParams, fixedKwp: targetKwp });
        if (result && result.best) {
            const { bessKwh: bestBessKwh, bessKw: bestBessKw } = result.best;

            // Apply recommended BESS size only
            setSelectedBess('custom');
            setBessKwh(bestBessKwh);
            setBessMaxPower(bestBessKw);
            return result.best;
        }
        return null;
    }, [techParams, targetKwp]);

    // Handle BESS Selection
    const handleBessSelect = useCallback((val) => {
        setSelectedBess(val);
        if (val === 'none') {
            setBessKwh(0);
            setBessMaxPower(0);
            return;
        }
        // Fix: Lookup from BESS_DB (full object) not BESS_OPTIONS (dropdown label/value)
        const selectedModel = BESS_DB.find(m => m.id === val);
        if (selectedModel) {
            setBessKwh(selectedModel.capacity);
            setBessMaxPower(selectedModel.maxPower);
        }
    }, []);

    // Calculate Totals
    const inv1 = INVERTER_DB.find(i => i.id === inv1Id);
    const inv2 = INVERTER_DB.find(i => i.id === inv2Id);
    const totalACPower = (inv1 ? inv1.acPower * inv1Qty : 0) + (inv2 ? inv2.acPower * inv2Qty : 0);

    // Sync inverter max AC to tech params (auto update limit)
    const inverterMaxAcKw = totalACPower > 0 ? totalACPower : (targetKwp / 1.1); // Fallback if no inverter selected

    return {
        inv1Id, setInv1Id,
        inv1Qty, setInv1Qty,
        inv2Id, setInv2Id,
        inv2Qty, setInv2Qty,
        selectedBess, handleBessSelect,
        bessKwh, setBessKwh,
        bessMaxPower, setBessMaxPower,
        isGridCharge, setIsGridCharge,
        params, setParams,
        techParams, setTechParams,
        targetKwp, setTargetKwp,
        handleMagicSuggest,
        handleOptimize,
        handleOptimizeBess,
        bessStrategy, setBessStrategy,
        totalACPower,
        inverterMaxAcKw
    };
};
