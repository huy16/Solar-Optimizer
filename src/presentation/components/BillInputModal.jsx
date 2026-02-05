import React, { useState, useEffect, useMemo, useRef } from 'react';
import { X, Zap, Calendar, Snowflake, ArrowBigRight, BarChart3, AlertCircle, Info, MapPin, Table, RefreshCw, Activity, Flame, TrendingUp, Car, HardHat } from 'lucide-react';
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { LOAD_PROFILES } from '../../utils/loadProfileGenerator';
import ALL_PROVINCES from '../../data/provinces.json';

export const BillInputModal = ({ onClose, onComplete, title = "Advanced EVN Bill Input", lang = 'vi' }) => {
    // Basic Data State
    const [monthlyData, setMonthlyData] = useState(Array(12).fill(0));

    // Advanced Configuration State
    const [province, setProvince] = useState('TP. Hồ Chí Minh');
    const [customerGroup, setCustomerGroup] = useState('business'); // business, manufacture, consumer
    const [voltageLevel, setVoltageLevel] = useState('medium'); // low, medium, high

    // Default to a valid key from LOAD_PROFILES if possible, or fallback
    const [profileSector, setProfileSector] = useState("Kinh doanh - Dinh ban ngay");
    const [workSchedule, setWorkSchedule] = useState('mon_sat'); // mon_fri, mon_sat, all_days

    const [seasonalCooling, setSeasonalCooling] = useState(false);
    const [viewMode, setViewMode] = useState('kwh'); // kwh, vnd
    const [chartTab, setChartTab] = useState('year'); // year, day
    const [manualPrice, setManualPrice] = useState('');
    const [isManualPrice, setIsManualPrice] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showProvinceList, setShowProvinceList] = useState(false);
    const [priceEscalation, setPriceEscalation] = useState(3);
    const [evCharging, setEvCharging] = useState(false);
    const [extraLoadType, setExtraLoadType] = useState('none'); // none, heatpump, machinery
    const dropdownRef = useRef(null);

    const dt = {
        vi: {
            config: "Cấu hình",
            evn_tariff: "Cài đặt Biểu giá EVN",
            evn_desc: "Cấu hình đối tượng và cấp điện áp",
            location: "Vị trí dự án",
            customer_group: "Nhóm khách hàng",
            business: "Kinh doanh",
            manufacture: "Sản xuất",
            consumer: "Sinh hoạt",
            voltage_level: "Cấp điện áp",
            high: "Cao thế (> 110kV)",
            medium: "Trung thế (22kV - 110kV)",
            low: "Hạ thế (< 6kV)",
            est_price: "Đơn giá dự tính",
            custom_price: "Tùy chỉnh",
            apply_custom: "Dùng giá này",
            op_profile: "Hồ sơ vận hành",
            unit_kwh: "Đơn vị: kWh",
            unit_vnd: "Đơn vị: VNĐ",
            fill_all: "Dàn đều",
            distribute: "Phân bổ mùa",
            sector: "Lĩnh vực / Đặc thù",
            sector_help: "Dùng để giả lập biểu đồ tải (Load Curve) dựa trên tổng điện năng tháng.",
            office: "Văn phòng (8h - 17h)",
            supermarket: "Siêu thị / TTTM",
            factory_1: "Nhà máy - 1 Ca",
            factory_2: "Nhà máy - 2 Ca",
            factory_3: "Nhà máy - 24/7",
            schedule: "Lịch làm việc",
            mon_fri: "T2 - T6",
            mon_sat: "T2 - T7",
            all_days: "Cả tuần",
            seasonal: "Làm mát theo mùa",
            seasonal_desc: "Tăng tải 15-20% vào mùa hè",
            ov_title: "Tổng quan Tiêu thụ",
            ov_desc: "Xu hướng sử dụng điện trong năm",
            no_data: "Chưa có dữ liệu",
            monthly_inputs: "Nhập số liệu tháng (kWh)",
            total_energy: "Tổng năng lượng",
            monthly_avg: "Trung bình tháng",
            back: "Quay lại",
            generate: "Tạo Profile",
            view_year: "Năm",
            view_day: "Ngày (Mẫu)",
            hourly_weights: "Tỷ trọng tiêu thụ theo giờ",
            months: ['Th1', 'Th2', 'Th3', 'Th4', 'Th5', 'Th6', 'Th7', 'Th8', 'Th9', 'Th10', 'Th11', 'Th12'],
            price_escalation: "Tăng giá điện dự kiến",
            ev_charging: "Giả lập Sạc xe điện",
            ev_desc: "Tăng đỉnh tải vào 18h - 22h",
            extra_load: "Phụ tải bổ sung",
            extra_load_help: "Giả lập phụ tải: Bơm nhiệt (tải nền 24/7) hoặc Máy sản xuất (tăng tải giờ hành chính).",
            none: "Không có",
            heatpump: "Bơm nhiệt (Heat Pump)",
            machinery: "Máy sản xuất / Dây chuyền"
        },
        en: {
            config: "Configuration",
            evn_tariff: "EVN Tariff Settings",
            evn_desc: "Configure customer type & voltage",
            location: "Project Location",
            customer_group: "Customer Group",
            business: "Business",
            manufacture: "Manufacturing",
            consumer: "Residential",
            voltage_level: "Voltage Level",
            high: "High Voltage (> 110kV)",
            medium: "Medium Voltage (22kV - 110kV)",
            low: "Low Voltage (< 6kV)",
            est_price: "Estimated Price",
            custom_price: "Custom",
            apply_custom: "Use this price",
            op_profile: "Operation Profile",
            unit_kwh: "Unit: kWh",
            unit_vnd: "Unit: VNĐ",
            fill_all: "Fill All",
            distribute: "Seasonal Dist",
            sector: "Business Sector / Type",
            sector_help: "Determines the daily load curve shape for simulation (since only monthly total is known).",
            office: "Office Building (8am-5pm)",
            supermarket: "Supermarket / Mall",
            factory_1: "Factory - 1 Shift",
            factory_2: "Factory - 2 Shifts",
            factory_3: "Factory - 24/7",
            schedule: "Work Schedule",
            mon_fri: "Mon - Fri",
            mon_sat: "Mon - Sat",
            all_days: "All Days",
            seasonal: "Seasonal Cooling",
            seasonal_desc: "Boost load by 15-20% during Summer",
            ov_title: "Consumption Overview",
            ov_desc: "Visualizing usage trend across the year",
            no_data: "No data inputs yet",
            monthly_inputs: "Monthly Inputs (kWh)",
            total_energy: "Total Energy",
            monthly_avg: "Monthly Avg",
            back: "Back",
            generate: "Generate Profile",
            view_year: "Year",
            view_day: "Day (Pattern)",
            hourly_weights: "Hourly consumption weights",
            months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            price_escalation: "Annual Price Escalation",
            ev_charging: "EV Charging Simulation",
            ev_desc: "Adds load peaks from 18:00 - 22:00",
            extra_load: "Additional Load Profiles",
            extra_load_help: "Simulate specific loads: Heat Pumps (24/7 base) or Machinery (boosts 8am-5pm).",
            none: "None",
            heatpump: "Heat Pump (24/7 Base)",
            machinery: "Industrial Machinery"
        }
    };

    const t = dt[lang] || dt.vi;

    // Province List from JSON
    const PROVINCES = useMemo(() => {
        return [...ALL_PROVINCES]
            .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [searchTerm]);

    // Handle Click Outside for Dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowProvinceList(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Constants for estimation (Fake Price for UI Demo)
    const SCHEDULE_MAP = {
        mon_fri: [1, 1, 1, 1, 1, 0, 0],
        mon_sat: [1, 1, 1, 1, 1, 1, 0],
        all_days: [1, 1, 1, 1, 1, 1, 1]
    };

    const EST_PRICES = {
        business: { low: 2666, medium: 2444, high: 2300 },
        manufacture: { low: 1800, medium: 1600, high: 1500 },
        consumer: { low: 2000, medium: 1900, high: 1800 }
    };

    const autoPrice = EST_PRICES[customerGroup]?.[voltageLevel] || 2000;
    const currentPrice = isManualPrice ? (Number(manualPrice) || autoPrice) : autoPrice;

    // Derived Metrics
    const totalEnergy = useMemo(() => {
        return monthlyData.reduce((acc, val) => {
            const num = Number(val);
            return acc + (isNaN(num) ? 0 : num);
        }, 0);
    }, [monthlyData]);

    const formatCompact = (val, type = 'kwh') => {
        if (!val || val === 0) return '0';
        if (type === 'vnd') {
            if (val >= 1000000000) return (val / 1000000000).toFixed(val % 1000000000 === 0 ? 0 : 1) + ' Tỷ';
            if (val >= 1000000) return (val / 1000000).toFixed(val % 1000000 === 0 ? 0 : 1) + ' Tr';
            return val.toLocaleString();
        } else {
            if (val >= 1000000) return (val / 1000000).toFixed(val % 1000000 === 0 ? 0 : 1) + ' M';
            if (val >= 1000) return (val / 1000).toFixed(val % 1000 === 0 ? 0 : 1) + ' k';
            return val.toLocaleString();
        }
    };

    const monthlyAvg = useMemo(() => totalEnergy / 12, [totalEnergy]);

    const chartData = useMemo(() => {
        return t.months.map((m, i) => {
            const val = Number(monthlyData[i]) || 0;
            return {
                name: m,
                value: val,
                cost: val * currentPrice
            };
        });
    }, [monthlyData, currentPrice, t.months]);

    const dailyPreviewData = useMemo(() => {
        const weights = LOAD_PROFILES[profileSector] || LOAD_PROFILES["Kinh doanh - Dinh ban ngay"];

        // Calculate a simulated average daily total for preview (e.g., 100 kWh)
        const dummyDailyTotal = 100;

        return weights.map((w, i) => {
            let loadKw = dummyDailyTotal * w;

            // 1. EV Charging (Peak at Evening 18:00 - 22:00)
            if (evCharging && i >= 18 && i <= 22) {
                loadKw += (dummyDailyTotal / 24) * 0.15;
            }

            // 2. Extra Load Types
            if (extraLoadType === 'heatpump') {
                loadKw += (dummyDailyTotal / 24) * 0.05;
            } else if (extraLoadType === 'machinery' && i >= 8 && i <= 17) {
                loadKw += (dummyDailyTotal / 24) * 0.15;
            }

            return {
                hour: `${i}h`,
                weight: loadKw / dummyDailyTotal // Convert back to weight for the chart
            };
        });
    }, [profileSector, evCharging, extraLoadType]);

    const handleInputChange = (index, value) => {
        const newData = [...monthlyData];
        newData[index] = value === '' ? 0 : parseInt(value);
        setMonthlyData(newData);
    };

    const handleFillAll = (value) => {
        const numValue = value === '' ? 0 : parseInt(value);
        setMonthlyData(Array(12).fill(numValue));
    };

    const handleSeasonalDist = (value) => {
        const base = value === '' ? 0 : parseInt(value);
        if (base === 0) return;
        // Vietnamese seasonal curve (Peak in Summer May-Aug)
        // Normalized so that the base value (Jan) is approximately 0.85 of peak
        const coefficients = [0.85, 0.82, 0.9, 1.05, 1.15, 1.25, 1.3, 1.28, 1.15, 1.05, 0.95, 0.9];
        // Calculate new values relative to the Jan input (first coefficient is 0.85)
        // We want newData[0] to be close to 'base'
        const newData = coefficients.map(c => Math.round((base / 0.85) * c));
        setMonthlyData(newData);
    };

    const handleComplete = () => {
        // Find the full province object to pass along
        const selectedProvObj = PROVINCES.find(p => p.name === province);

        // Prepare options object
        const options = {
            province: province,
            provinceData: selectedProvObj,
            customerGroup,
            voltageLevel,
            profileSector,
            workSchedule: SCHEDULE_MAP[workSchedule] || SCHEDULE_MAP.mon_sat,
            seasonalCooling,
            customPrice: currentPrice,
            priceEscalation,
            evCharging,
            extraLoadType
        };

        // Use the selected sector/profile directly as the profileType key
        // This maps directly to keys in LOAD_PROFILES (e.g., "Kinh doanh - Dinh ban ngay")
        const profileType = profileSector;

        onComplete(monthlyData, profileType, options);
    };

    // Helper for input focus
    const handleFocus = (e) => e.target.select();

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row relative">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-50 p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors text-slate-500"
                >
                    <X size={20} />
                </button>

                {/* LEFT PANEL: CONFIGURATION */}
                <div className="w-full md:w-[280px] bg-slate-50 border-r border-slate-200 flex flex-col h-full overflow-y-auto custom-scrollbar">
                    <div className="p-4 space-y-4">
                        {/* Header */}
                        <div>
                            <div className="flex items-center gap-2 text-blue-600 mb-1">
                                <Zap className="fill-current" size={18} />
                                <span className="font-bold text-[9px] tracking-widest uppercase">{t.config}</span>
                            </div>
                            <h2 className="text-lg font-bold text-slate-800 leading-tight">{t.evn_tariff}</h2>
                            <p className="text-slate-500 text-[10px] mt-0.5">{t.evn_desc}</p>
                        </div>

                        {/* Location Selector (Searchable) */}
                        <div className="space-y-1 relative" ref={dropdownRef}>
                            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{t.location}</label>
                            <div className="relative">
                                <div
                                    onClick={() => setShowProvinceList(!showProvinceList)}
                                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-700 text-xs font-medium cursor-pointer focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm flex items-center justify-between"
                                >
                                    <span className={province ? 'text-slate-800' : 'text-slate-400'}>
                                        {province || "Chọn tỉnh thành..."}
                                    </span>
                                    <MapPin size={16} className="text-slate-400" />
                                </div>

                                {showProvinceList && (
                                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-[70] overflow-hidden flex flex-col max-h-[300px]">
                                        <div className="p-2 border-b bg-slate-50">
                                            <input
                                                type="text"
                                                autoFocus
                                                placeholder="Tìm kiếm tỉnh thành..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="w-full px-3 py-2 text-sm border-0 bg-white rounded-lg focus:ring-1 focus:ring-blue-500 outline-none"
                                            />
                                        </div>
                                        <div className="overflow-y-auto custom-scrollbar flex-1">
                                            {PROVINCES.length > 0 ? PROVINCES.map(p => (
                                                <div
                                                    key={p.id}
                                                    onClick={() => {
                                                        setProvince(p.name);
                                                        setShowProvinceList(false);
                                                        setSearchTerm('');
                                                    }}
                                                    className="px-4 py-2.5 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 cursor-pointer transition-colors border-b border-slate-50 last:border-0"
                                                >
                                                    {p.name}
                                                </div>
                                            )) : (
                                                <div className="px-4 py-4 text-xs text-slate-400 text-center italic">Không tìm thấy tỉnh thành</div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Form Groups */}
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{t.customer_group}</label>
                                <div className="relative">
                                    <select
                                        value={customerGroup}
                                        onChange={(e) => setCustomerGroup(e.target.value)}
                                        className="w-full appearance-none bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-700 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                                    >
                                        <option value="business">{t.business}</option>
                                        <option value="manufacture">{t.manufacture}</option>
                                        <option value="consumer">{t.consumer}</option>
                                    </select>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                        <ArrowBigRight size={16} className="rotate-90" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{t.voltage_level}</label>
                                <div className="relative">
                                    <select
                                        value={voltageLevel}
                                        onChange={(e) => setVoltageLevel(e.target.value)}
                                        className="w-full appearance-none bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-700 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                                    >
                                        <option value="high">{t.high}</option>
                                        <option value="medium">{t.medium}</option>
                                        <option value="low">{t.low}</option>
                                    </select>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                        <ArrowBigRight size={16} className="rotate-90" />
                                    </div>
                                </div>
                            </div>

                            {/* Price Card with Manual Override */}
                            <div className={`border rounded-xl p-2.5 transition-all ${isManualPrice ? 'bg-blue-50 border-blue-200' : 'bg-emerald-50 border-emerald-100'}`}>
                                <div className="flex items-center justify-between mb-1.5">
                                    <div className={`font-medium text-[10px] ${isManualPrice ? 'text-blue-800' : 'text-emerald-800'}`}>{t.est_price}</div>
                                    <button
                                        onClick={() => setIsManualPrice(!isManualPrice)}
                                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full transition-colors ${isManualPrice ? 'bg-blue-600 text-white' : 'bg-emerald-600/10 text-emerald-700 hover:bg-emerald-600/20'}`}
                                    >
                                        {t.custom_price}
                                    </button>
                                </div>
                                {isManualPrice ? (
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={manualPrice}
                                            onChange={(e) => setManualPrice(e.target.value)}
                                            onFocus={handleFocus}
                                            autoFocus
                                            className="w-full bg-white border border-blue-200 rounded-lg pr-12 pl-3 py-1.5 text-blue-700 font-bold text-base focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                            placeholder={autoPrice.toString()}
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-blue-400 font-bold">đ/kWh</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between">
                                        <div className="text-emerald-700 font-bold text-sm">{autoPrice.toLocaleString()} <span className="text-[9px] text-emerald-600/70 font-normal">đ/kWh</span></div>
                                    </div>
                                )}
                            </div>


                            {/* Operation Profile */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-slate-800 font-bold">
                                    <Calendar size={14} className="text-blue-500" />
                                    <h3 className="text-xs">{t.op_profile}</h3>
                                </div>

                                {/* EV Charging Simulation */}
                                <div
                                    onClick={() => setEvCharging(!evCharging)}
                                    className={`cursor-pointer border rounded-xl p-2.5 flex items-start gap-2.5 transition-all ${evCharging ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-500/20' : 'bg-white border-slate-200 hover:border-slate-300'
                                        }`}
                                >
                                    <div className={`mt-0.5 p-1 rounded-full ${evCharging ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                        <Car size={12} />
                                    </div>
                                    <div className="flex-1">
                                        <div className={`text-xs font-bold ${evCharging ? 'text-blue-700' : 'text-slate-700'}`}>{t.ev_charging}</div>
                                        <div className="text-[10px] text-slate-500 leading-tight mt-0.5">{t.ev_desc}</div>
                                    </div>
                                    <div className={`ml-auto w-4 h-4 rounded border flex items-center justify-center transition-colors ${evCharging ? 'bg-blue-500 border-blue-500' : 'bg-white border-slate-300'
                                        }`}>
                                        {evCharging && <X size={10} className="text-white" />}
                                    </div>
                                </div>

                                {/* Seasonal Cooling */}
                                <div
                                    onClick={() => setSeasonalCooling(!seasonalCooling)}
                                    className={`cursor-pointer border rounded-xl p-2.5 flex items-start gap-2.5 transition-all ${seasonalCooling ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-500/20' : 'bg-white border-slate-200 hover:border-slate-300'
                                        }`}
                                >
                                    <div className={`mt-0.5 p-1 rounded-full ${seasonalCooling ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                        <Snowflake size={12} />
                                    </div>
                                    <div className="flex-1">
                                        <div className={`text-xs font-bold ${seasonalCooling ? 'text-blue-700' : 'text-slate-700'}`}>{t.seasonal}</div>
                                        <div className="text-[10px] text-slate-500 leading-tight mt-0.5">{t.seasonal_desc}</div>
                                    </div>
                                    <div className={`ml-auto w-4 h-4 rounded border flex items-center justify-center transition-colors ${seasonalCooling ? 'bg-blue-500 border-blue-500' : 'bg-white border-slate-300'
                                        }`}>
                                        {seasonalCooling && <ArrowBigRight size={10} className="text-white rotate-[-45deg]" />}
                                    </div>
                                </div>

                                {/* Heavy Equipment Profiles */}
                                <div className="space-y-1">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1 text-slate-500 font-semibold uppercase tracking-wider text-[9px]">
                                            <HardHat size={10} />
                                            {t.extra_load}
                                        </div>
                                        <div className="group relative">
                                            <Info size={12} className="text-slate-400 cursor-help" />
                                            <div className="absolute right-0 bottom-full mb-2 w-48 bg-slate-800 text-white text-[10px] p-2 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                                                {t.extra_load_help}
                                            </div>
                                        </div>
                                    </div>
                                    <select
                                        value={extraLoadType}
                                        onChange={(e) => setExtraLoadType(e.target.value)}
                                        className={`w-full appearance-none rounded-xl px-3 py-2 text-[11px] font-medium focus:outline-none transition-all border ${extraLoadType !== 'none'
                                            ? 'bg-blue-50 border-blue-200 text-blue-700'
                                            : 'bg-white border-slate-200 text-slate-600'}`}
                                    >
                                        <option value="none">{t.none}</option>
                                        <option value="heatpump">{t.heatpump}</option>
                                        <option value="machinery">{t.machinery}</option>
                                    </select>
                                </div>

                                <hr className="border-slate-100 !my-1" />

                                <div className="space-y-1">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{t.sector}</label>
                                        <div className="group relative">
                                            <Info size={12} className="text-slate-400 cursor-help" />
                                            <div className="absolute right-0 bottom-full mb-2 w-48 bg-slate-800 text-white text-[10px] p-2 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                                                {t.sector_help}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <select
                                            value={profileSector}
                                            onChange={(e) => setProfileSector(e.target.value)}
                                            className="w-full appearance-none bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm text-[11px]"
                                        >
                                            {Object.keys(LOAD_PROFILES).map((key) => (
                                                <option key={key} value={key}>{key}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{t.schedule}</label>
                                    <div className="grid grid-cols-3 gap-1.5">
                                        {[
                                            { id: 'mon_fri', label: t.mon_fri },
                                            { id: 'mon_sat', label: t.mon_sat },
                                            { id: 'all_days', label: t.all_days },
                                        ].map(opt => (
                                            <button
                                                key={opt.id}
                                                onClick={() => setWorkSchedule(opt.id)}
                                                className={`py-1.5 px-1 rounded-lg text-[10px] font-bold transition-all border ${workSchedule === opt.id
                                                    ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200'
                                                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                                    }`}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>


                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT PANEL: DATA & CHART */}
                <div className="flex-1 flex flex-col h-full overflow-hidden bg-white">
                    {/* Top Section: Chart */}
                    <div className="flex-1 p-6 pb-2 min-h-[350px] flex flex-col">
                        <div className="flex items-center justify-between mb-4 pr-12">
                            <div className="flex bg-slate-100 p-0.5 rounded-lg">
                                <button
                                    onClick={() => setChartTab('year')}
                                    className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${chartTab === 'year' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    {t.view_year}
                                </button>
                                <button
                                    onClick={() => setChartTab('day')}
                                    className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${chartTab === 'day' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    {t.view_day}
                                </button>
                            </div>

                            <div className="flex bg-slate-100 p-0.5 rounded-lg flex text-[10px] font-bold ml-auto">
                                <div className="px-2 py-1 text-slate-400 border-r border-slate-200">
                                    {viewMode === 'kwh' ? t.unit_kwh : t.unit_vnd}
                                </div>
                                <button
                                    onClick={() => setViewMode('kwh')}
                                    className={`px-3 py-1 rounded-md transition-all ${viewMode === 'kwh' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    kWh
                                </button>
                                <button
                                    onClick={() => setViewMode('vnd')}
                                    className={`px-3 py-1 rounded-md transition-all ${viewMode === 'vnd' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    VND
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-xl font-bold text-slate-800 leading-tight">
                                    {chartTab === 'year' ? t.ov_title : t.hourly_weights}
                                </h3>
                                <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                                    <span className={`w-1.5 h-1.5 rounded-full ${chartTab === 'year' ? 'bg-blue-500' : 'bg-amber-500'}`}></span>
                                    <span>{chartTab === 'year' ? t.ov_desc : profileSector}</span>
                                </div>
                            </div>
                        </div>

                        <div className="w-full bg-white rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden h-[300px]">
                            {chartTab === 'year' ? (
                                totalEnergy === 0 ? (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300">
                                        <BarChart3 size={64} strokeWidth={1} />
                                        <div className="mt-4 text-sm font-medium">{t.no_data}</div>
                                    </div>
                                ) : (
                                    <div className="w-full h-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} dy={10} />
                                                <YAxis
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tick={{ fontSize: 10, fill: '#94a3b8' }}
                                                    tickFormatter={(val) => formatCompact(val, viewMode)}
                                                    label={{ value: viewMode === 'kwh' ? 'kWh' : 'VNĐ', angle: -90, position: 'insideLeft', offset: -5, style: { fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' } }}
                                                />
                                                <Tooltip
                                                    cursor={{ fill: '#f8fafc' }}
                                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                                />
                                                <Bar dataKey={viewMode === 'kwh' ? 'value' : 'cost'} radius={[6, 6, 0, 0]} isAnimationActive={false}>
                                                    {chartData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={viewMode === 'kwh' ? '#3b82f6' : '#10b981'} />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                )
                            ) : (
                                <div className="w-full h-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={dailyPreviewData} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                                            <defs>
                                                <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} dy={10} interval={2} />
                                            <YAxis
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fontSize: 10, fill: '#94a3b8' }}
                                                tickFormatter={(val) => `${val}%`}
                                                label={{ value: '%', angle: -90, position: 'insideLeft', offset: 10, style: { fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' } }}
                                            />
                                            <Tooltip
                                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="weight"
                                                stroke="#3b82f6"
                                                strokeWidth={3}
                                                fillOpacity={1}
                                                fill="url(#colorWeight)"
                                                isAnimationActive={false}
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Bottom Section: Inputs & Summary */}
                    <div className="p-3 md:p-6 pt-0 bg-white border-t border-slate-50 flex flex-col">
                        <div className="p-3 md:p-4 bg-slate-50/80 rounded-2xl border border-slate-100 mt-4 md:mt-6">
                            <div className="flex items-center justify-between mb-3 px-1">
                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                    <Table size={14} className="text-blue-500" /> {t.monthly_inputs}
                                </h4>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleFillAll(monthlyData[0])}
                                        className="flex items-center gap-1.5 text-[10px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-full transition-all border border-blue-100"
                                        title="Dùng giá trị tháng 1 cho cả năm"
                                    >
                                        <RefreshCw size={12} />
                                        {t.fill_all}
                                    </button>
                                    <button
                                        onClick={() => handleSeasonalDist(monthlyData[0])}
                                        className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-full transition-all border border-emerald-100"
                                        title="Phân bổ dựa trên biểu đồ mùa Việt Nam (Đỉnh tháng 6-7)"
                                    >
                                        <Activity size={12} />
                                        {t.distribute}
                                    </button>
                                </div>
                            </div>
                            <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-1.5">
                                {monthlyData.map((val, i) => {
                                    const isCoolingMonth = seasonalCooling && (i >= 4 && i <= 6); // May, June, July (0-indexed)
                                    return (
                                        <div key={i} className="space-y-1 relative">
                                            <label className="text-[9px] font-bold text-slate-400 block text-center uppercase flex items-center justify-center gap-0.5">
                                                {t.months[i]}
                                                {isCoolingMonth && <Flame size={8} className="text-orange-500 fill-current" />}
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    value={val || ''}
                                                    onChange={(e) => handleInputChange(i, e.target.value)}
                                                    onFocus={handleFocus}
                                                    className={`w-full border rounded-lg px-1 py-1.5 text-xs font-bold focus:outline-none focus:ring-2 transition-all text-center ${isCoolingMonth
                                                        ? 'bg-orange-50/50 border-orange-200 text-orange-700 focus:ring-orange-500/20 focus:border-orange-500'
                                                        : 'bg-white border-slate-200 text-slate-700 focus:ring-blue-500/20 focus:border-blue-500'}`}
                                                    placeholder="0"
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Redesigned Summary Bar */}
                        <div className="mt-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-10">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-200">
                                        <Zap size={24} className="fill-current" />
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">{t.total_energy}</div>
                                        <div className="text-2xl font-black text-blue-600 leading-none">
                                            {formatCompact(totalEnergy, 'kwh')} <span className="text-xs text-slate-400 font-bold">kWh/năm</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="hidden md:block w-px h-10 bg-slate-100" />
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-100">
                                        <Activity size={24} />
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">{t.monthly_avg}</div>
                                        <div className="text-2xl font-black text-emerald-500 leading-none">
                                            {formatCompact(Math.round(totalEnergy / 12), 'kwh')} <span className="text-xs text-slate-400 font-bold">kWh/tháng</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                <button
                                    onClick={onClose}
                                    className="flex-1 sm:flex-none px-8 py-3 text-sm font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-all rounded-2xl"
                                >
                                    {t.back}
                                </button>
                                <button
                                    onClick={handleComplete}
                                    disabled={totalEnergy === 0}
                                    className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-10 py-3 rounded-2xl text-sm font-bold transition-all shadow-xl ${totalEnergy === 0
                                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                                        : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200 hover:shadow-blue-300 hover:-translate-y-0.5 active:translate-y-0'
                                        }`}
                                >
                                    <Zap size={18} className="fill-current" />
                                    {t.generate}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};
