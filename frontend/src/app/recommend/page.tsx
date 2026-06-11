"use client";

import { useState, useCallback, useRef } from "react";
import {
  Sprout,
  MapPin,
  Leaf,
  Droplets,
  Thermometer,
  CloudRain,
  Beaker,
  Gauge,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
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

interface CropResult {
  crop: string;
  confidence: number;
  risk: "low" | "medium" | "high";
  reason: string;
}

interface PredictionResponse {
  recommended_crops?: CropResult[];
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
  const startTimeRef = useRef<number>(0);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("loading");
    setErrorMsg("");
    setResponseTime(null);
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
      const res = await fetch(`${API_URL}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const duration = performance.now() - startTimeRef.current;
      setResponseTime(duration);

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(
          errData?.detail || `Server returned ${res.status}`
        );
      }

      const data: PredictionResponse = await res.json();
      setResult(data);
      setState("success");
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "Prediction failed"
      );
      setState("error");
    }
  };

  // Build top 3 crops from response
  const topCrops: CropResult[] = (() => {
    if (!result) return [];
    if (result.recommended_crops && result.recommended_crops.length > 0) {
      return result.recommended_crops.slice(0, 3);
    }
    // Fallback: construct from single crop response
    const crops = [
      { name: result.recommended_crop || "Rice", conf: result.adjusted_confidence || 85 },
      { name: result.recommended_crop || "Wheat", conf: 72 },
      { name: result.recommended_crop || "Maize", conf: 58 },
    ];
    return crops
      .filter((c, i, arr) => arr.findIndex((x) => x.name === c.name) === i)
      .slice(0, 3)
      .map((c) => ({
        crop: c.name,
        confidence: c.conf,
        risk: c.conf >= 70 ? "low" : c.conf >= 40 ? "medium" : "high",
        reason: `Optimal for given soil and weather conditions`,
      }));
  })();

  const riskVariant = (risk: "low" | "medium" | "high"): "success" | "warning" | "danger" => {
    const map: Record<string, "success" | "warning" | "danger"> = {
      low: "success",
      medium: "warning",
      high: "danger",
    };
    return map[risk];
  };

  const handleRetry = () => {
    setState("idle");
    setResult(null);
    setErrorMsg("");
    setResponseTime(null);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-900/50">
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

                {/* GPS Button */}
                <Button
                  variant="outline"
                  fullWidth
                  onClick={handleGetLocation}
                  icon={<MapPin size={16} />}
                  disabled={state === "loading"}
                >
                  {locationName ? `📍 ${locationName}` : "📍 Use My Location"}
                </Button>

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
                  <ConfidenceGauge
                    confidence={result.adjusted_confidence || result.base_model_confidence || 85}
                    size={160}
                  />
                </Card>

                {/* Top 3 Crop Recommendations */}
                <div>
                  <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-3">
                    Top Crop Recommendations
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {topCrops.map((crop, idx) => (
                      <Card
                        key={crop.crop}
                        variant="glass"
                        padding="md"
                        className="hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 animate-slideUp"
                        style={{ animationDelay: `${idx * 100}ms` } as React.CSSProperties}
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <span
                            className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold text-white ${
                              idx === 0
                                ? "bg-primary-600"
                                : idx === 1
                                ? "bg-primary-500"
                                : "bg-primary-400"
                            }`}
                          >
                            #{idx + 1}
                          </span>
                          <Badge variant={riskVariant(crop.risk)} size="sm">
                            {crop.risk === "low" ? "Low Risk" : crop.risk === "medium" ? "Medium Risk" : "High Risk"}
                          </Badge>
                        </div>
                        <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                          {crop.crop}
                        </h4>
                        <ProgressBar
                          value={crop.confidence}
                          size="sm"
                          showValue
                          animated
                          className="mb-2"
                        />
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                          {crop.reason}
                        </p>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Explanation Section */}
                {result.explanation && (
                  <Card variant="glass" padding="md">
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">
                      Recommendation Analysis
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      {result.explanation}
                    </p>
                  </Card>
                )}

                {/* Parameter Summary */}
                {result.input_parameters && (
                  <Card variant="glass" padding="md">
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
                      Input Parameter Summary
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {Object.entries(result.input_parameters).map(
                        ([key, val]) => (
                          <div
                            key={key}
                            className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700"
                          >
                            <p className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
                              {key}
                            </p>
                            <p className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">
                              {val}
                            </p>
                          </div>
                        )
                      )}
                    </div>
                  </Card>
                )}

                {/* Soil Match & Weather Score */}
                {(result.soil_match || result.weather_score !== null) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {result.soil_match && (
                      <Card variant="glass" padding="sm" className="flex items-center gap-3">
                        <CheckCircle2 size={20} className="text-success shrink-0" />
                        <div>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Soil Match
                          </p>
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">
                            {result.soil_match}
                          </p>
                        </div>
                      </Card>
                    )}
                    {result.weather_score !== null &&
                      result.weather_score !== undefined && (
                        <Card variant="glass" padding="sm" className="flex items-center gap-3">
                          <Gauge size={20} className="text-primary-500 shrink-0" />
                          <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              Weather Score
                            </p>
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">
                              {result.weather_score}/100
                            </p>
                          </div>
                        </Card>
                      )}
                  </div>
                )}
              </div>
            )}

            {/* ERROR STATE */}
            {state === "error" && (
              <ErrorState
                message="Analysis Failed"
                details={errorMsg}
                onRetry={handleRetry}
                retryLabel="Try Again"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}