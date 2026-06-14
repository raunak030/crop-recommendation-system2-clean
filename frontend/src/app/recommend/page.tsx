"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  Sprout,
  MapPin,
  Leaf,
  Droplets,
  Thermometer,
  CloudRain,
  Beaker,
  AlertCircle,
  RefreshCw,
  Info,
  ChevronDown,
  ChevronUp,
  Award,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Grid3X3,
} from "lucide-react";
import ConfidenceGauge from "../../components/ConfidenceGauge";
import { SkeletonCard, SkeletonGauge } from "../../components/Skeleton";
import Button from "../../components/Button";
import Card from "../../components/Card";
import Input from "../../components/Input";
import Badge from "../../components/Badge";
import PageHeader from "../../components/PageHeader";
import ProgressBar from "../../components/ProgressBar";
import EmptyState from "../../components/EmptyState";
import ErrorState from "../../components/ErrorState";
import ResponseTime from "../../components/ResponseTime";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

const soilTypes = [
  "Alluvial",
  "Black",
  "Red",
  "Laterite",
  "Clay",
  "Sandy",
  "Loamy",
];

// v2 response shape
interface V2CropResult {
  crop_name: string;
  model_probability: number;
  suitability_score: number;
  suitability_components?: Record<string, number>;
  coffee_penalty_applied?: number;
  uncertainty_score: {
    label: string;
    raw: number;
    normalized: number;
  };
  explanation: {
    why_recommended: string;
    strengths: string[];
    risks: string[];
    soil_match: string;
  };
}

interface V2PredictionResponse {
  model?: string;
  top_crops: V2CropResult[];
  input_parameters?: Record<string, string | number>;
}

// v1 fallback shape
interface V1PredictionResponse {
  recommended_crop?: string;
  base_model_confidence?: number;
  adjusted_confidence?: number;
  ndvi_score?: number | null;
  ndvi_health?: string | null;
  soil_match?: string | null;
  weather_score?: number | null;
  input_parameters?: Record<string, string | number>;
  explanation?: string;
}

// Union type for either response
type PredictionResponse = V2PredictionResponse | V1PredictionResponse;

const ALL_CROPS = [
  "Apple", "Banana", "Blackgram", "Chickpea", "Coconut", "Coffee",
  "Cotton", "Grapes", "Jute", "Kidneybeans", "Lentil", "Maize",
  "Mango", "Mothbeans", "Mungbean", "Muskmelon", "Orange", "Papaya",
  "Pigeonpeas", "Pomegranate", "Rice", "Watermelon",
];

const initialForm = {
  N: "90",
  P: "42",
  K: "43",
  temperature: "25.0",
  humidity: "65",
  ph: "6.5",
  rainfall: "150",
  soil_type: "Loamy",
};

export default function RecommendPage() {
  const [form, setForm] = useState(initialForm);
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [locationName, setLocationName] = useState("");
  const [responseTime, setResponseTime] = useState<number | null>(null);
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());
  const [showSupported, setShowSupported] = useState(false);
  const [usingLegacy, setUsingLegacy] = useState(false);
  const startTimeRef = useRef<number>(0);

  // Detect if the response is v2 format
  const isV2Result = (r: PredictionResponse | null): r is V2PredictionResponse =>
    r !== null && "top_crops" in r && Array.isArray((r as V2PredictionResponse).top_crops);

  // Detect if the response is v1 format
  const isV1Result = (r: PredictionResponse | null): r is V1PredictionResponse =>
    r !== null && "recommended_crop" in r;

  // Loading messages
  const loadingMessages = [
    "Analyzing soil chemistry...",
    "Running crop suitability model...",
    "Checking weather compatibility...",
    "Evaluating nutrient balance...",
    "Ranking top crop recommendations...",
  ];
  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);

  useEffect(() => {
    if (state !== "loading") {
      setLoadingMsgIndex(0);
      return;
    }
    const interval = setInterval(() => {
      setLoadingMsgIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [state, loadingMessages.length]);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleGetLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setErrorMsg("Geolocation not supported in this browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude: lat, longitude: lon } = position.coords;

        // Reverse geocode
        try {
          const geoRes = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
          );
          const geoData = await geoRes.json();
          const addr = geoData?.address || {};
          setLocationName(
            `${
              addr.city || addr.town || addr.village || ""
            }${addr.state ? ", " + addr.state : ""}`
          );

          const stateName = addr.state || "";
          const soilMap: Record<string, string> = {
            "Uttar Pradesh": "Alluvial",
            Maharashtra: "Black",
            Karnataka: "Red",
            Punjab: "Alluvial",
            Rajasthan: "Sandy",
            Kerala: "Laterite",
          };
          if (soilMap[stateName]) {
            setForm((prev) => ({ ...prev, soil_type: soilMap[stateName] }));
          }
        } catch {
          // ignore geocode errors
        }

        // Fetch weather from Open-Meteo
        try {
          const weatherRes = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=temperature_2m,relativehumidity_2m,rain&timezone=auto`
          );
          const weatherData = await weatherRes.json();
          const current = weatherData.current_weather;
          const hourly = weatherData.hourly;
          let temp = current?.temperature;
          let humidity = 0;
          let rainfall = 0;

          if (hourly?.time && Array.isArray(hourly.time)) {
            const now = new Date(
              current?.time || new Date().toISOString()
            );
            const currentHourKey = now.toISOString().slice(0, 13) + ":00";
            const idx = hourly.time.indexOf(currentHourKey);
            if (idx !== -1) {
              humidity = hourly.relativehumidity_2m?.[idx] ?? 0;
              rainfall = hourly.rain?.[idx] ?? 0;
              temp = temp ?? hourly.temperature_2m?.[idx];
            }
          }

          setForm((prev) => ({
            ...prev,
            temperature: String(temp ?? prev.temperature),
            humidity: String(humidity ?? prev.humidity),
            rainfall: String(rainfall ?? prev.rainfall),
          }));
        } catch {
          setErrorMsg("Could not fetch weather data for your location");
        }
      },
      () => {
        setErrorMsg("Location permission denied. Please enter manually.");
      }
    );
  }, []);

  const toggleCard = (index: number) => {
    setExpandedCards((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("loading");
    setErrorMsg("");
    setResponseTime(null);
    setExpandedCards(new Set());
    setUsingLegacy(false);
    startTimeRef.current = performance.now();

    const payload = {
      N: Number(form.N),
      P: Number(form.P),
      K: Number(form.K),
      temperature: Number(form.temperature),
      humidity: Number(form.humidity),
      ph: Number(form.ph),
      rainfall: Number(form.rainfall),
      soil_type: form.soil_type,
    };

    try {
      // Try /api/v2/predict first, fall back to /predict on 404
      let res = await fetch(`${API_URL}/api/v2/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      let duration = performance.now() - startTimeRef.current;
      let data: PredictionResponse;

      if (res.status === 404) {
        // Fall back to v1 /predict
        setUsingLegacy(true);
        res = await fetch(`${API_URL}/predict`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        duration = performance.now() - startTimeRef.current;
        setResponseTime(duration);

        if (!res.ok) {
          const errData = await res.json().catch(() => null);
          throw new Error(
            errData?.detail || `Server returned ${res.status}`
          );
        }

        const v1Data: V1PredictionResponse = await res.json();
        data = v1Data;
      } else {
        setResponseTime(duration);

        if (!res.ok) {
          const errData = await res.json().catch(() => null);
          throw new Error(
            errData?.detail || `Server returned ${res.status}`
          );
        }

        const v2Data: V2PredictionResponse = await res.json();
        data = v2Data;
      }

      setResult(data);
      setState("success");
    } catch (err) {
      const duration = performance.now() - startTimeRef.current;
      setResponseTime(duration);
      setErrorMsg(
        err instanceof Error ? err.message : "Prediction failed"
      );
      setState("error");
    }
  };

  const getConfidenceLabel = (value: number): { label: string; color: string } => {
    if (value >= 70) return { label: "High Confidence", color: "text-green-600 dark:text-green-400" };
    if (value >= 40) return { label: "Moderate Confidence", color: "text-amber-600 dark:text-amber-400" };
    return { label: "Low Confidence", color: "text-red-600 dark:text-red-400" };
  };

  const getUncertaintyBadge = (label: string) => {
    switch (label) {
      case "Low":
        return { variant: "success" as const, label: "Low Uncertainty" };
      case "Medium":
        return { variant: "warning" as const, label: "Medium Uncertainty" };
      case "High":
        return { variant: "danger" as const, label: "High Uncertainty" };
      default:
        return { variant: "info" as const, label: label };
    }
  };

  const handleRetry = () => {
    setState("idle");
    setResult(null);
    setErrorMsg("");
    setResponseTime(null);
    setExpandedCards(new Set());
    setUsingLegacy(false);
  };

  // Compute overall confidence for v2 (highest ML probability among top 5)
  const v2HighestConfidence = isV2Result(result) && result.top_crops.length > 0
    ? result.top_crops[0].model_probability * 100
    : 0;

  // For v1 fallback, use lower of base/adjusted
  const v1OverallConfidence = isV1Result(result) ? (() => {
    const base = result.base_model_confidence ?? 0;
    const adj = result.adjusted_confidence ?? 0;
    return Math.min(base, adj) > 0 ? Math.min(base, adj) : (base || adj);
  })() : 0;

  const overallConfidence = isV2Result(result) ? v2HighestConfidence : v1OverallConfidence;

  // Safely get display name from a crop object
  const getCropName = (item: V2CropResult) => item.crop_name;

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        <PageHeader
          overline="Smart Agriculture"
          title="Crop Recommendation"
          subtitle="AI-powered crop prediction based on soil and weather parameters"
        />

        <div className="flex flex-col lg:flex-row gap-6">
          {/* ─── LEFT PANEL — Input Form ─── */}
          <div className="w-full lg:w-[440px] shrink-0">
            <Card variant="glass" padding="lg">
              <div className="space-y-5">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Soil &amp; Weather Parameters
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Enter values or use your location
                  </p>
                </div>

                {/* Soil Testing Guidance */}
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                  <p className="text-xs text-amber-800 dark:text-amber-300">
                    <span className="font-semibold">💡 Don&apos;t know your NPK values?</span>{' '}
                    Visit your nearest <strong>Krishi Vigyan Kendra (KVK)</strong> for free soil testing.
                  </p>
                </div>

                {/* GPS Button */}
                <div>
                  <Button
                    variant="outline"
                    fullWidth
                    onClick={handleGetLocation}
                    icon={<MapPin size={16} />}
                    disabled={state === "loading"}
                  >
                    {locationName ? `📍 ${locationName}` : "📍 Use My Location"}
                  </Button>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 text-center">
                    GPS auto-fills weather data and suggests soil type based on your region.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* NPK Range Sliders */}
                  <div className="space-y-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      NPK Values
                    </p>
                    {(["N", "P", "K"] as const).map((nutrient) => (
                      <div key={nutrient}>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            {nutrient === "N"
                              ? "Nitrogen (N)"
                              : nutrient === "P"
                              ? "Phosphorus (P)"
                              : "Potassium (K)"}
                          </label>
                          <span className="text-sm font-semibold text-primary-600 dark:text-primary-400 tabular-nums">
                            {form[nutrient]}
                          </span>
                        </div>
                        <Input
                          type="range"
                          min={0}
                          max={200}
                          value={form[nutrient]}
                          onChange={(v) => handleChange(nutrient, v)}
                          disabled={state === "loading"}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Weather Inputs */}
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                      Weather &amp; Soil
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        icon={<Thermometer size={14} />}
                        label="Temperature"
                        unit="°C"
                        type="number"
                        value={form.temperature}
                        onChange={(v) => handleChange("temperature", v)}
                        disabled={state === "loading"}
                      />
                      <Input
                        icon={<Droplets size={14} />}
                        label="Humidity"
                        unit="%"
                        type="number"
                        value={form.humidity}
                        onChange={(v) => handleChange("humidity", v)}
                        disabled={state === "loading"}
                      />
                      <Input
                        icon={<Beaker size={14} />}
                        label="pH"
                        type="number"
                        step="0.1"
                        value={form.ph}
                        onChange={(v) => handleChange("ph", v)}
                        disabled={state === "loading"}
                      />
                      <Input
                        icon={<CloudRain size={14} />}
                        label="Rainfall"
                        unit="mm"
                        type="number"
                        value={form.rainfall}
                        onChange={(v) => handleChange("rainfall", v)}
                        disabled={state === "loading"}
                      />
                    </div>
                  </div>

                  {/* Soil Type */}
                  <Input
                    label="Soil Type"
                    type="select"
                    value={form.soil_type}
                    onChange={(v) => handleChange("soil_type", v)}
                    disabled={state === "loading"}
                    options={soilTypes.map((s) => ({ value: s, label: s }))}
                  />

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    fullWidth
                    size="lg"
                    loading={state === "loading"}
                    icon={state === "loading" ? undefined : <Leaf size={16} />}
                    disabled={state === "loading"}
                  >
                    {state === "loading" ? "Analyzing..." : "Analyze Crop"}
                  </Button>
                </form>
              </div>
            </Card>
          </div>

          {/* ─── RIGHT PANEL — Results Area ─── */}
          <div className="flex-1 min-h-[400px]">
            {/* IDLE STATE */}
            {state === "idle" && (
              <EmptyState
                icon={<Sprout size={40} />}
                title="Ready to Analyze"
                description='Fill in your soil parameters and click "Analyze Crop" to get AI-powered recommendations tailored to your farm.'
              />
            )}

            {/* LOADING STATE */}
            {state === "loading" && (
              <div className="space-y-4 animate-fadeIn">
                <div className="text-center space-y-1 mb-2">
                  <p className="text-sm text-slate-500 dark:text-slate-400 animate-pulse">{loadingMessages[loadingMsgIndex]}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">Running crop suitability model</p>
                </div>
                <div className="flex justify-center">
                  <SkeletonGauge />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                </div>
              </div>
            )}

            {/* SUCCESS STATE */}
            {state === "success" && result && (
              <div className="space-y-5 animate-fadeIn">
                {/* Confidence Gauge + Response Time */}
                <Card variant="glass" padding="lg" className="flex flex-col items-center relative">
                  {responseTime !== null && (
                    <div className="absolute top-3 right-3">
                      <ResponseTime timeMs={responseTime} variant="pill" />
                    </div>
                  )}
                  {usingLegacy && (
                    <div className="absolute top-3 left-3">
                      <Badge variant="warning" size="sm">Legacy Mode</Badge>
                    </div>
                  )}
                  <ConfidenceGauge
                    confidence={overallConfidence}
                    size={160}
                  />
                  <p className={`text-sm font-semibold mt-2 ${getConfidenceLabel(overallConfidence).color}`}>
                    {isV2Result(result) ? "Top Prediction Confidence" : getConfidenceLabel(overallConfidence).label}
                  </p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 text-center max-w-xs">
                    {isV2Result(result)
                      ? `Highest confidence among ${result.top_crops.length} crop recommendations.`
                      : "Overall confidence based on the lower of model confidence and adjusted score."}
                  </p>
                </Card>

                {/* ─── V2 — Top 5 Crop Cards ─── */}
                {isV2Result(result) && result.top_crops.map((cropItem, idx) => {
                  const rank = idx + 1;
                  const isExpanded = expandedCards.has(idx);
                  const uncert = getUncertaintyBadge(cropItem.uncertainty_score.label);
                  const suitColor = cropItem.suitability_score >= 70
                    ? "text-green-600 dark:text-green-400"
                    : cropItem.suitability_score >= 40
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-red-600 dark:text-red-400";
                  const probPct = (cropItem.model_probability * 100).toFixed(1);

                  return (
                    <Card
                      key={cropItem.crop_name}
                      variant="glass"
                      padding="lg"
                      className={`animate-slideUp ${rank === 1 ? "ring-2 ring-primary-400/40 dark:ring-primary-500/30" : ""}`}
                    >
                      {/* Header row: rank + crop name + suit score */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Rank badge */}
                          <div className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${
                            rank === 1
                              ? "bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300"
                              : rank === 2
                              ? "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                              : rank === 3
                              ? "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400"
                              : "bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400"
                          }`}>
                            #{rank}
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white capitalize truncate">
                              {getCropName(cropItem)}
                            </h3>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                              <Badge variant={uncert.variant} size="sm">{uncert.label}</Badge>
                              {rank === 1 && (
                                <Badge variant="primary" size="sm">
                                  <Award size={10} className="mr-0.5 inline" /> Best Match
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Suitability Score */}
                        <div className="shrink-0 text-right">
                          <p className={`text-2xl md:text-3xl font-bold tabular-nums ${suitColor}`}>
                            {cropItem.suitability_score.toFixed(0)}
                          </p>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 -mt-0.5">
                            Suitability
                          </p>
                        </div>
                      </div>

                      {/* Stats row: ML prob + uncertainty raw */}
                      <div className="grid grid-cols-2 gap-3 mt-4">
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                          <p className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                            Model Confidence
                          </p>
                          <p className="text-lg font-bold text-slate-900 dark:text-white tabular-nums">
                            {probPct}%
                          </p>
                          <ProgressBar
                            value={cropItem.model_probability * 100}
                            max={100}
                            showValue={false}
                            className="mt-1.5"
                          />
                        </div>
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                          <p className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                            Suitability Breakdown
                          </p>
                          <div className="space-y-1">
                            {cropItem.suitability_components && (
                              <>
                                <div className="flex justify-between text-[11px]">
                                  <span className="text-slate-500 dark:text-slate-400">ML</span>
                                  <span className="font-medium text-slate-700 dark:text-slate-300 tabular-nums">{cropItem.suitability_components.ml_probability?.toFixed(0) ?? "?"}%</span>
                                </div>
                                <div className="flex justify-between text-[11px]">
                                  <span className="text-slate-500 dark:text-slate-400">Temp</span>
                                  <span className="font-medium text-slate-700 dark:text-slate-300 tabular-nums">{cropItem.suitability_components.temperature?.toFixed(0) ?? "?"}%</span>
                                </div>
                                <div className="flex justify-between text-[11px]">
                                  <span className="text-slate-500 dark:text-slate-400">Rain</span>
                                  <span className="font-medium text-slate-700 dark:text-slate-300 tabular-nums">{cropItem.suitability_components.rainfall?.toFixed(0) ?? "?"}%</span>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Coffee penalty indicator */}
                      {cropItem.coffee_penalty_applied !== undefined && cropItem.coffee_penalty_applied > 0 && (
                        <div className="mt-3 p-2 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30">
                          <p className="text-[11px] text-red-600 dark:text-red-400 flex items-center gap-1">
                            <AlertTriangle size={12} />
                            Coffee penalty: −{cropItem.coffee_penalty_applied.toFixed(1)} points
                          </p>
                        </div>
                      )}

                      {/* Expand/Collapse Toggle */}
                      <button
                        onClick={() => toggleCard(idx)}
                        className="mt-4 w-full flex items-center justify-center gap-1 py-2 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/30"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp size={14} /> Hide Explanation
                          </>
                        ) : (
                          <>
                            <ChevronDown size={14} /> Show Explanation
                          </>
                        )}
                      </button>

                      {/* Expanded Explanation */}
                      {isExpanded && (
                        <div className="mt-3 space-y-3 pt-3 border-t border-slate-200 dark:border-slate-700 animate-fadeIn">
                          {/* Why Recommended */}
                          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                            <h4 className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                              <TrendingUp size={12} /> Why Recommended
                            </h4>
                            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                              {cropItem.explanation.why_recommended}
                            </p>
                          </div>

                          {/* Strengths */}
                          {cropItem.explanation.strengths.length > 0 && (
                            <div className="p-3 rounded-xl bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800/30">
                              <h4 className="text-[11px] font-semibold text-green-700 dark:text-green-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                                <CheckCircle size={12} /> Strengths
                              </h4>
                              <ul className="space-y-1">
                                {cropItem.explanation.strengths.map((s, si) => (
                                  <li key={si} className="text-sm text-green-800 dark:text-green-300 flex items-start gap-1.5">
                                    <span className="text-green-500 mt-0.5 shrink-0">•</span>
                                    <span>{s}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Risks */}
                          {cropItem.explanation.risks.length > 0 && (
                            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30">
                              <h4 className="text-[11px] font-semibold text-red-700 dark:text-red-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                                <AlertTriangle size={12} /> Risks / Considerations
                              </h4>
                              <ul className="space-y-1">
                                {cropItem.explanation.risks.map((r, ri) => (
                                  <li key={ri} className="text-sm text-red-800 dark:text-red-300 flex items-start gap-1.5">
                                    <span className="text-red-500 mt-0.5 shrink-0">•</span>
                                    <span>{r}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Soil Match */}
                          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/30">
                            <h4 className="text-[11px] font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                              <MapPin size={12} /> Soil Match
                            </h4>
                            <p className="text-sm text-blue-800 dark:text-blue-300">
                              {cropItem.explanation.soil_match}
                            </p>
                          </div>
                        </div>
                      )}
                    </Card>
                  );
                })}

                {/* ─── V1 Fallback — Single Crop Display ─── */}
                {isV1Result(result) && result.recommended_crop && (
                  <Card variant="glass" padding="lg" className="animate-slideUp">
                    <Badge variant="warning" size="sm" className="mb-2 inline-block">Legacy Mode</Badge>
                    <div className="flex items-center gap-2 mb-1">
                      <Leaf size={18} className="text-primary-500" />
                      <span className="text-xs font-medium text-primary-600 dark:text-primary-400 uppercase tracking-wider">
                        Recommended Crop
                      </span>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white capitalize">
                      {result.recommended_crop}
                    </h2>

                    {/* Confidence Breakdown */}
                    <div className="grid grid-cols-2 gap-3 mt-4">
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                        <p className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                          Model Confidence
                        </p>
                        <p className="text-xl font-bold text-slate-900 dark:text-white">
                          {result.base_model_confidence?.toFixed(1) ?? "N/A"}%
                        </p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                          Raw ML model output score
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                        <p className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                          Adjusted Confidence
                        </p>
                        <p className="text-xl font-bold text-slate-900 dark:text-white">
                          {result.adjusted_confidence?.toFixed(1) ?? "N/A"}%
                        </p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                          Composite score (model + weather + soil)
                        </p>
                      </div>
                    </div>

                    {/* NDVI Context */}
                    {result.ndvi_score !== null && result.ndvi_score !== undefined && (
                      <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-2">
                          <Info size={14} className="text-slate-400" />
                          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                            NDVI Score: {result.ndvi_score.toFixed(3)} — {result.ndvi_health ?? "Unknown"}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 leading-relaxed">
                          NDVI (Normalized Difference Vegetation Index) is derived from satellite imagery.
                          Scores range from -1 to 1; higher values indicate healthier vegetation.
                          This data may have a latency of several days depending on satellite overpass schedules.
                        </p>
                      </div>
                    )}

                    {/* Soil Match Info */}
                    {result.soil_match && (
                      <div className="mt-3 flex items-center gap-2">
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          Soil compatibility: <strong className="text-slate-700 dark:text-slate-300">{result.soil_match}</strong>
                        </span>
                      </div>
                    )}

                    {/* Explanation */}
                    {result.explanation && (
                      <div className="mt-5 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                        <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                          Why This Crop
                        </h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                          {result.explanation}
                        </p>
                      </div>
                    )}
                  </Card>
                )}

                {/* ─── Supported Crops Section ─── */}
                <Card variant="bordered" padding="md">
                  <button
                    onClick={() => setShowSupported(!showSupported)}
                    className="w-full flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Grid3X3 size={16} className="text-slate-500 dark:text-slate-400" />
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Supported Crops ({ALL_CROPS.length})
                      </span>
                    </div>
                    {showSupported ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                  </button>
                  {showSupported && (
                    <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700 animate-fadeIn">
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">
                        These are the {ALL_CROPS.length} crops the model can predict. Results are ranked by a composite suitability score combining ML probability, soil compatibility, and environmental factors.
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                        {ALL_CROPS.map((crop) => (
                          <div
                            key={crop}
                            className="px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 capitalize"
                          >
                            <Leaf size={12} className="inline mr-1 text-primary-400" />
                            {crop}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>

                {/* Disclaimer */}
                <Card variant="bordered" padding="md">
                  <div className="flex items-start gap-2">
                    <Info size={14} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-amber-800 dark:text-amber-300">
                        Recommendation Disclaimer
                      </p>
                      <p className="text-[10px] text-amber-700 dark:text-amber-400 mt-0.5 leading-relaxed">
                        This is a ML-based advisory tool and should not replace professional agricultural judgment.
                        Always consult with local agricultural experts, extension officers, or agronomists before
                        making farming decisions. Actual crop performance depends on many factors beyond the
                        parameters analyzed here, including pest pressure, irrigation practices, seed variety,
                        and local microclimate conditions.
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* ERROR STATE */}
            {state === "error" && (
              <Card variant="glass" padding="lg">
                {errorMsg.match(/Failed to fetch|NetworkError|ERR_CONNECTION|fetch|network|abort/i) ? (
                  <div className="flex flex-col items-center gap-2 text-center py-4">
                    <AlertCircle size={32} className="text-amber-500" />
                    <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">Backend is waking up...</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      The server may take up to 60 seconds to respond on first request (free-tier hosting).
                    </p>
                    <Button variant="outline" size="sm" className="mt-3" onClick={handleRetry}>
                      <RefreshCw size={14} className="mr-1" />
                      Retry Now
                    </Button>
                  </div>
                ) : (
                  <ErrorState
                    message="Prediction Failed"
                    details={errorMsg}
                    onRetry={handleRetry}
                    retryLabel="Try Again"
                  />
                )}
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}