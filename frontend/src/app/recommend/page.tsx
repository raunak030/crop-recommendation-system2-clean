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

interface PredictionResponse {
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

  // Loading messages
  const loadingMessages = [
    "Analyzing soil chemistry...",
    "Running crop suitability model...",
    "Checking weather compatibility...",
    "Evaluating nutrient balance...",
    "Generating recommendation...",
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

  const getConfidenceLabel = (value: number): { label: string; color: string } => {
    if (value >= 70) return { label: "High Confidence", color: "text-green-600 dark:text-green-400" };
    if (value >= 40) return { label: "Moderate Confidence", color: "text-amber-600 dark:text-amber-400" };
    return { label: "Low Confidence", color: "text-red-600 dark:text-red-400" };
  };

  const handleRetry = () => {
    setState("idle");
    setResult(null);
    setErrorMsg("");
    setResponseTime(null);
  };

  // Use the lower of the two confidences for the overall label
  const overallConfidence = (() => {
    const base = result?.base_model_confidence ?? 0;
    const adj = result?.adjusted_confidence ?? 0;
    return Math.min(base, adj) > 0 ? Math.min(base, adj) : (base || adj);
  })();

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
                  <ConfidenceGauge
                    confidence={overallConfidence}
                    size={160}
                  />
                  <p className={`text-sm font-semibold mt-2 ${getConfidenceLabel(overallConfidence).color}`}>
                    {getConfidenceLabel(overallConfidence).label}
                  </p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 text-center max-w-xs">
                    Overall confidence based on the lower of model confidence and adjusted score.
                  </p>
                </Card>

                {/* Single Crop Recommendation */}
                {result.recommended_crop && (
                  <Card variant="glass" padding="lg" className="animate-slideUp">
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

                    {/* Why This Crop / Explanation */}
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

                    {/* Disclaimer */}
                    <div className="mt-5 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
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
                    </div>
                  </Card>
                )}
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