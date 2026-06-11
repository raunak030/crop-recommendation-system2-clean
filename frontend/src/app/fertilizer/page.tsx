"use client";

import { useState, useRef } from "react";
import {
  FlaskConical,
  Sprout,
  Bookmark,
  CheckCircle2,
  Beaker,
} from "lucide-react";
import { useToast } from "../../components/Toast";
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

interface FertilizerResponse {
  recommended_fertilizer: string;
  reason: string;
  deficits?: Record<string, { current: number; optimal: number }>;
  composition?: Record<string, number>;
  amount_kg_per_ha?: number;
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
  const { toast } = useToast();
  const [saved, setSaved] = useState(false);
  const startTime = useRef<number>(0);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("loading");
    setErrorMsg("");
    setSaved(false);
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

  const handleSave = () => {
    setSaved(true);
    toast("Recommendation saved!", "success");
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    setState("idle");
    setResult(null);
    setErrorMsg("");
    setResponseTime(null);
  };

  // Default deficits if API doesn't return them
  const deficits = result?.deficits || {
    Nitrogen: {
      current: Number(form.N),
      optimal: Number(form.N) >= 100 ? Number(form.N) : 100,
    },
    Phosphorus: {
      current: Number(form.P),
      optimal: Number(form.P) >= 60 ? Number(form.P) : 60,
    },
    Potassium: {
      current: Number(form.K),
      optimal: Number(form.K) >= 60 ? Number(form.K) : 60,
    },
  };

  const deficitEntries = Object.entries(deficits);

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-900/50">
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
                  Current NPK Levels (ppm)
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
                      unit="ppm"
                      value={form[nutrient]}
                      onChange={(val) => handleChange(nutrient, val)}
                      disabled={state === "loading"}
                    />
                  ))}
                </div>
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

          {/* ─── Section 2: Deficiency Visualization ─── */}
          {state === "result" && result && (
            <Card variant="glass" padding="lg" className="animate-slideUp">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                  NPK Deficiency Analysis
                </h2>
                {responseTime !== null && (
                  <ResponseTime timeMs={responseTime} variant="pill" />
                )}
              </div>
              <div className="space-y-4">
                {deficitEntries.map(([name, vals]) => {
                  const isDeficient = vals.current < vals.optimal;
                  const pct = Math.min(
                    100,
                    (vals.current / vals.optimal) * 100
                  );
                  const deficitAmt = Math.round(vals.optimal - vals.current);
                  return (
                    <div key={name}>
                      <ProgressBar
                        value={pct}
                        max={100}
                        animated
                        showValue
                        label={`${name} — ${vals.current}/${vals.optimal} ppm`}
                        color={
                          isDeficient
                            ? "bg-gradient-to-r from-red-500 to-red-400"
                            : "bg-gradient-to-r from-green-500 to-green-400"
                        }
                      />
                      {isDeficient && (
                        <p className="text-[10px] text-danger mt-0.5">
                          Deficient — {deficitAmt} ppm below optimal
                        </p>
                      )}
                    </div>
                  );
                })}
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                  {deficitEntries.filter(
                    ([, v]) => v.current < v.optimal
                  ).length > 0
                    ? `${deficitEntries.filter(
                        ([, v]) => v.current < v.optimal
                      ).length} of 3 nutrients are below optimal levels`
                    : "All nutrients are at optimal levels"}
                </p>
              </div>
            </Card>
          )}

          {/* ─── Section 3: Recommendation ─── */}
          {state === "result" && result && (
            <Card
              variant="glass"
              padding="lg"
              className="animate-slideUp"
              style={{ animationDelay: "150ms" }}
            >
              <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-4">
                Recommended Fertilizer
              </h2>

              <div className="space-y-4">
                {/* Fertilizer Name */}
                <h3 className="text-2xl font-bold text-primary-700 dark:text-primary-400">
                  {result.recommended_fertilizer}
                </h3>

                {/* Composition Badges */}
                {result.composition && (
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(result.composition).map(
                      ([elem, pct]) => (
                        <Badge key={elem} variant="primary">
                          {elem}: {pct}%
                        </Badge>
                      )
                    )}
                  </div>
                )}

                {/* Display composition from reason if no composition data */}
                {!result.composition && (
                  <div className="flex flex-wrap gap-2">
                    {["N", "P", "K"].map((elem) => {
                      const val =
                        result.reason
                          ?.toLowerCase()
                          .includes(elem.toLowerCase())
                          ? 10
                          : 0;
                      return (
                        <Badge key={elem} variant="primary">
                          {elem}: {val}%
                        </Badge>
                      );
                    })}
                  </div>
                )}

                {/* Amount */}
                {result.amount_kg_per_ha && (
                  <div className="p-4 rounded-xl bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Recommended Application
                    </p>
                    <p className="text-lg font-bold text-primary-700 dark:text-primary-400 mt-0.5">
                      Apply {result.amount_kg_per_ha} kg/ha
                    </p>
                  </div>
                )}

                {/* Reason */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {result.reason}
                  </p>
                </div>

                {/* Save Button */}
                <Button
                  fullWidth
                  variant="outline"
                  onClick={handleSave}
                  disabled={saved}
                  icon={saved ? <CheckCircle2 size={16} /> : <Bookmark size={16} />}
                >
                  {saved ? "Saved!" : "Save Recommendation"}
                </Button>
              </div>
            </Card>
          )}

          {/* ─── Loading State ─── */}
          {state === "loading" && (
            <div className="space-y-4">
              <SkeletonCard />
              <SkeletonCard />
            </div>
          )}

          {/* ─── Error State ─── */}
          {state === "error" && (
            <Card variant="glass" padding="lg">
              <ErrorState
                message="Analysis Failed"
                details={errorMsg}
                onRetry={handleReset}
                retryLabel="Try Again"
              />
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