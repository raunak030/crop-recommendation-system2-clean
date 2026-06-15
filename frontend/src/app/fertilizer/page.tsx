"use client";

import { useState, useRef, useEffect } from "react";
import {
  FlaskConical,
  Sprout,
  AlertCircle,
  RefreshCw,
  Leaf,
  Info,
} from "lucide-react";
import { SkeletonCard } from "../../components/Skeleton";
import Input from "../../components/Input";
import Button from "../../components/Button";
import Card from "../../components/Card";
import Badge from "../../components/Badge";
import PageHeader from "../../components/PageHeader";
import ProgressBar from "../../components/ProgressBar";
import EmptyState from "../../components/EmptyState";
import ErrorState from "../../components/ErrorState";
import ResponseTime from "../../components/ResponseTime";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

const crops = [
  "rice",
  "wheat",
  "maize",
  "sugarcane",
  "cotton",
  "barley",
  "chickpea",
  "lentil",
  "pigeonpea",
  "groundnut",
  "soybean",
  "sunflower",
  "sesame",
  "jute",
  "millet",
  "sorghum",
  "tea",
  "coffee",
  "rubber",
  "banana",
];

interface NpkDeficit {
  nutrient: string;
  current: number;
  optimal: number;
  deficit: number;
}

interface FertilizerResponse {
  fertilizer: string;
  reason: string;
  npk_deficit?: NpkDeficit[];
  crop_optimal?: Record<string, number>;
}

const initialForm = {
  crop: "rice",
  N: "80",
  P: "40",
  K: "40",
};

export default function FertilizerPage() {
  const [form, setForm] = useState(initialForm);
  const [state, setState] = useState<
    "idle" | "loading" | "result" | "error"
  >("idle");
  const [result, setResult] = useState<FertilizerResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [responseTime, setResponseTime] = useState<number | null>(null);
  const startTime = useRef<number>(0);

  // Loading messages
  const loadingMessages = [
    "Analyzing NPK levels...",
    "Checking crop requirements...",
    "Computing nutrient deficits...",
    "Generating fertilizer recommendation...",
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("loading");
    setErrorMsg("");
    startTime.current = performance.now();

    const payload = {
      crop: form.crop,
      N: Number(form.N),
      P: Number(form.P),
      K: Number(form.K),
    };

    try {
      const res = await fetch(`${API_URL}/api/v1/fertilizer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const elapsed = performance.now() - startTime.current;
      setResponseTime(elapsed);

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(
          errData?.detail || `Server returned ${res.status}`
        );
      }

      const data: FertilizerResponse = await res.json();
      setResult(data);
      setState("result");
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "Failed to get recommendation"
      );
      setState("error");
    }
  };

  const handleReset = () => {
    setState("idle");
    setResult(null);
    setErrorMsg("");
    setResponseTime(null);
  };

  // Compute deficit percentages for display (only from real API data)
  const deficitEntries = result?.npk_deficit && result.npk_deficit.length > 0
    ? result.npk_deficit
    : [];

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-6 md:py-8">
        {/* PageHeader */}
        <PageHeader
          overline="Soil Nutrition"
          title="Fertilizer Advisor"
          subtitle="Get precise fertilizer recommendations based on crop type and soil NPK levels"
        />

        <div className="space-y-5">
          {/* ─── Section 1: Input Panel ─── */}
          <Card variant="glass" padding="lg">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Crop Selector */}
              <Input
                label="Select Crop"
                type="select"
                icon={<Sprout size={16} />}
                value={form.crop}
                onChange={(val) => handleChange("crop", val)}
                disabled={state === "loading"}
                options={crops.map((c) => ({
                  value: c,
                  label: c.charAt(0).toUpperCase() + c.slice(1),
                }))}
              />

              {/* NPK Inputs */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">
                  Current NPK Levels (kg/ha)
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {(["N", "P", "K"] as const).map((nutrient) => (
                    <Input
                      key={nutrient}
                      label={
                        nutrient === "N"
                          ? "Nitrogen"
                          : nutrient === "P"
                          ? "Phosphorus"
                          : "Potassium"
                      }
                      type="number"
                      min="0"
                      max="200"
                      unit="kg/ha"
                      value={form[nutrient]}
                      onChange={(val) => handleChange(nutrient, val)}
                      disabled={state === "loading"}
                    />
                  ))}
                </div>
              </div>

              {/* Soil Testing Guidance */}
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                <p className="text-xs text-amber-800 dark:text-amber-300">
                  <span className="font-semibold">💡 Don&apos;t know your NPK values?</span>{' '}
                  Visit your nearest <strong>Krishi Vigyan Kendra (KVK)</strong> for free soil testing.
                </p>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                fullWidth
                loading={state === "loading"}
                icon={<FlaskConical size={16} />}
              >
                {state === "loading" ? "Analyzing..." : "Get Recommendation"}
              </Button>
            </form>
          </Card>

          {/* ─── Loading State ─── */}
          {state === "loading" && (
            <div className="space-y-4">
              <div className="text-center space-y-1 mb-2">
                <p className="text-sm text-slate-500 dark:text-slate-400 animate-pulse">{loadingMessages[loadingMsgIndex]}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">Computing nutrient analysis</p>
              </div>
              <SkeletonCard />
              <SkeletonCard />
            </div>
          )}

          {/* ─── Result: Only Real API Fields ─── */}
          {state === "result" && result && (
            <div className="space-y-5 animate-fadeIn">
              {/* Fertilizer Name */}
              <Card variant="glass" padding="lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-primary-600 dark:text-primary-400 uppercase tracking-wider">
                    Recommended Fertilizer
                  </span>
                  {responseTime !== null && (
                    <ResponseTime timeMs={responseTime} variant="pill" />
                  )}
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white capitalize">
                  {result.fertilizer}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Recommended for {form.crop}
                </p>
              </Card>

              {/* NPK Deficit Table */}
              {deficitEntries.length > 0 && (
                <Card variant="glass" padding="lg" className="animate-slideUp">
                  <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-4">
                    NPK Deficit Analysis
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-700">
                          <th className="text-left py-2 pr-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            Nutrient
                          </th>
                          <th className="text-right px-2 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            Current (kg/ha)
                          </th>
                          <th className="text-right px-2 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            Optimal (kg/ha)
                          </th>
                          <th className="text-right pl-2 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            Deficit
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {deficitEntries.map((entry) => (
                          <tr
                            key={entry.nutrient}
                            className="border-b border-slate-100 dark:border-slate-800"
                          >
                            <td className="py-3 pr-4 font-medium text-slate-700 dark:text-slate-300">
                              {entry.nutrient}
                            </td>
                            <td className="py-3 px-2 text-right text-slate-600 dark:text-slate-400">
                              {entry.current.toFixed(1)}
                            </td>
                            <td className="py-3 px-2 text-right text-slate-600 dark:text-slate-400">
                              {entry.optimal.toFixed(1)}
                            </td>
                            <td className="py-3 pl-2 text-right">
                              {entry.deficit > 0 ? (
                                <Badge variant="danger" size="sm">
                                  -{entry.deficit.toFixed(1)}
                                </Badge>
                              ) : (
                                <Badge variant="success" size="sm">
                                  Sufficient
                                </Badge>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              )}

              {/* Crop Optimal Comparison */}
              {result.crop_optimal && Object.keys(result.crop_optimal).length > 0 && (
                <Card variant="glass" padding="lg" className="animate-slideUp">
                  <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-3">
                    Crop Optimal Levels
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(result.crop_optimal).map(([nutrient, optimalVal]) => {
                      const currentVal = form[nutrient as keyof typeof form];
                      const current = Number(currentVal);
                      const pct = optimalVal > 0 ? Math.min(100, (current / optimalVal) * 100) : 0;
                      return (
                        <div key={nutrient}>
                          <div className="flex justify-between items-center mb-0.5">
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                              {nutrient === "N" ? "Nitrogen" : nutrient === "P" ? "Phosphorus" : "Potassium"}
                            </span>
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              {current} / {optimalVal} kg/ha
                            </span>
                          </div>
                          <ProgressBar
                            value={pct}
                            size="sm"
                            color={pct >= 80 ? "bg-gradient-to-r from-green-500 to-green-400" : pct >= 50 ? "bg-gradient-to-r from-amber-500 to-amber-400" : "bg-gradient-to-r from-red-500 to-red-400"}
                          />
                        </div>
                      );
                    })}
                  </div>
                </Card>
              )}

              {/* Reason from API */}
              <Card variant="glass" padding="lg" className="animate-slideUp">
                <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-2">
                  Recommendation Basis
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {result.reason}
                </p>
              </Card>

              {/* Disclaimer */}
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                <div className="flex items-start gap-2">
                  <Info size={14} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-amber-800 dark:text-amber-300">
                      Recommendation Disclaimer
                    </p>
                    <p className="text-[10px] text-amber-700 dark:text-amber-400 mt-0.5 leading-relaxed">
                      This is an AI-generated fertilizer recommendation based on soil NPK analysis.
                      Actual fertilizer requirements may vary based on crop variety, soil type, irrigation,
                      and local growing conditions. Always consult with a local agricultural extension officer
                      or agronomist before purchasing or applying fertilizers.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── Error State ─── */}
          {state === "error" && (
            <Card variant="glass" padding="lg">
              {errorMsg.match(/Failed to fetch|NetworkError|ERR_CONNECTION|fetch|network|abort/i) ? (
                <div className="flex flex-col items-center gap-2 text-center py-4">
                  <AlertCircle size={32} className="text-amber-500" />
                  <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">Backend is waking up...</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    The server may take up to 60 seconds to respond on first request.
                  </p>
                  <Button variant="outline" size="sm" className="mt-3" onClick={handleReset}>
                    <RefreshCw size={14} className="mr-1" />
                    Retry Now
                  </Button>
                </div>
              ) : (
                <ErrorState
                  message="Analysis Failed"
                  details={errorMsg}
                  onRetry={handleReset}
                  retryLabel="Try Again"
                />
              )}
            </Card>
          )}

          {/* ─── Idle State ─── */}
          {state === "idle" && (
            <Card variant="glass" padding="lg">
              <EmptyState
                icon={<FlaskConical size={36} />}
                title="Fertilizer Advisor"
                description="Enter your soil NPK levels and select a crop to get a tailored fertilizer recommendation."
              />
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}