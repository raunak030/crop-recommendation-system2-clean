"use client";

import { useState, useRef } from "react";
import {
  Satellite,
  MapPin,
  Search,
  Calendar,
  Globe,
  Activity,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import NdviGauge from "../../components/NdviGauge";
import { SkeletonGauge, SkeletonCard } from "../../components/Skeleton";
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

interface NdviResponse {
  ndvi_score: number;
  health_status: string;
  imagery_date?: string;
  source?: string;
}

const mockTrendData = [
  { month: "Oct", value: 0.35 },
  { month: "Nov", value: 0.42 },
  { month: "Dec", value: 0.58 },
  { month: "Jan", value: 0.63 },
  { month: "Feb", value: 0.71 },
  { month: "Mar", value: 0.66 },
  { month: "Apr", value: 0.52 },
];

function getHealthColor(status: string): string {
  switch (status?.toLowerCase()) {
    case "healthy":
    case "excellent":
      return "bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300";
    case "moderate":
    case "good":
      return "bg-yellow-100 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-300";
    case "poor":
      return "bg-orange-100 dark:bg-orange-900/30 border-orange-200 dark:border-orange-800 text-orange-800 dark:text-orange-300";
    case "very poor":
      return "bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300";
    default:
      return "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400";
  }
}

function getHealthEmoji(status: string): string {
  switch (status?.toLowerCase()) {
    case "healthy":
    case "excellent":
      return "🟢";
    case "moderate":
    case "good":
      return "🟡";
    case "poor":
      return "🟠";
    case "very poor":
      return "🔴";
    default:
      return "⚪";
  }
}

function getHealthBadgeVariant(status: string): "success" | "warning" | "danger" | "info" {
  switch (status?.toLowerCase()) {
    case "healthy":
    case "excellent":
      return "success";
    case "moderate":
    case "good":
      return "warning";
    case "poor":
      return "danger";
    case "very poor":
      return "danger";
    default:
      return "info";
  }
}

export default function NdviPage() {
  const [lat, setLat] = useState("28.6139");
  const [lon, setLon] = useState("77.2090");
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const [data, setData] = useState<NdviResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [responseTime, setResponseTime] = useState<number | null>(null);
  const startTimeRef = useRef<number>(0);

  const handleAnalyze = async () => {
    if (!lat.trim() || !lon.trim()) {
      setErrorMsg("Please enter both latitude and longitude");
      setState("error");
      return;
    }
    setState("loading");
    setErrorMsg("");
    setResponseTime(null);
    startTimeRef.current = performance.now();

    try {
      const res = await fetch(
        `${API_URL}/ndvi?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}`
      );

      const duration = performance.now() - startTimeRef.current;
      setResponseTime(duration);

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(
          errData?.detail || `Server returned ${res.status}`
        );
      }
      const json: NdviResponse = await res.json();
      setData(json);
      setState("success");
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "NDVI analysis failed"
      );
      setState("error");
    }
  };

  const handleRetry = () => {
    setLat("28.6139");
    setLon("77.2090");
    setState("idle");
    setData(null);
    setErrorMsg("");
    setResponseTime(null);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-900/50">
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        <PageHeader
          overline="Satellite Intelligence"
          title="NDVI Analysis"
          subtitle="Normalized Difference Vegetation Index — assess crop health from satellite imagery"
        />

        <div className="flex flex-col lg:flex-row gap-6">
          {/* ─── LEFT PANEL — Controls + Results ─── */}
          <div className="w-full lg:w-[420px] shrink-0 space-y-4">
            {/* Input Section */}
            <Card variant="glass" padding="md">
              <div className="space-y-4">
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Field Coordinates
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Latitude"
                    type="number"
                    step="any"
                    value={lat}
                    onChange={(v) => setLat(v)}
                    disabled={state === "loading"}
                    placeholder="e.g. 28.6139"
                  />
                  <Input
                    label="Longitude"
                    type="number"
                    step="any"
                    value={lon}
                    onChange={(v) => setLon(v)}
                    disabled={state === "loading"}
                    placeholder="e.g. 77.2090"
                  />
                </div>
                <Button
                  onClick={handleAnalyze}
                  fullWidth
                  loading={state === "loading"}
                  icon={state === "loading" ? undefined : <Search size={14} />}
                  disabled={state === "loading"}
                >
                  {state === "loading" ? "Analyzing..." : "Analyze Field"}
                </Button>
              </div>
            </Card>

            {/* NDVI Gauge + Response Time */}
            {(state === "success" && data) || state === "loading" ? (
              <Card variant="glass" padding="md" className="flex flex-col items-center relative">
                {responseTime !== null && (
                  <div className="absolute top-3 right-3">
                    <ResponseTime timeMs={responseTime} variant="pill" />
                  </div>
                )}
                {state === "loading" ? (
                  <SkeletonGauge />
                ) : (
                  <NdviGauge value={data!.ndvi_score} size={180} />
                )}
              </Card>
            ) : null}

            {/* Health Status */}
            {state === "success" && data && (
              <Card
                variant="glass"
                padding="md"
                className={`border-l-4 ${
                  data.health_status?.toLowerCase() === "healthy" ||
                  data.health_status?.toLowerCase() === "excellent"
                    ? "border-l-green-500"
                    : data.health_status?.toLowerCase() === "moderate" ||
                      data.health_status?.toLowerCase() === "good"
                    ? "border-l-yellow-500"
                    : data.health_status?.toLowerCase() === "poor"
                    ? "border-l-orange-500"
                    : "border-l-red-500"
                } animate-fadeIn`}
              >
                <div className="flex items-center gap-3">
                  <Activity size={20} className="text-primary-500" />
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Vegetation Health
                    </p>
                    <Badge
                      variant={getHealthBadgeVariant(data.health_status)}
                      size="sm"
                      className="mt-0.5"
                    >
                      {getHealthEmoji(data.health_status)} {data.health_status}
                    </Badge>
                  </div>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 ml-9">
                  {data.health_status?.toLowerCase() === "healthy" ||
                  data.health_status?.toLowerCase() === "excellent"
                    ? "Your field shows dense, healthy vegetation."
                    : data.health_status?.toLowerCase() === "moderate" ||
                      data.health_status?.toLowerCase() === "good"
                    ? "Your field shows moderate vegetation cover."
                    : data.health_status?.toLowerCase() === "poor"
                    ? "Your field shows sparse or stressed vegetation."
                    : "Your field shows very poor vegetation health."}
                </p>
              </Card>
            )}

            {/* Metadata */}
            {state === "success" && data && (
              <Card variant="glass" padding="md" className="animate-slideUp">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
                  Imagery Metadata
                </h3>
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2.5 text-sm">
                    <Calendar size={14} className="text-slate-400 shrink-0" />
                    <span className="text-slate-500 dark:text-slate-400">
                      Date:
                    </span>
                    <span className="text-slate-900 dark:text-white font-medium">
                      {data.imagery_date || "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5 text-sm">
                    <Globe size={14} className="text-slate-400 shrink-0" />
                    <span className="text-slate-500 dark:text-slate-400">
                      Source:
                    </span>
                    <span className="text-slate-900 dark:text-white font-medium">
                      {data.source || "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5 text-sm">
                    <MapPin size={14} className="text-slate-400 shrink-0" />
                    <span className="text-slate-500 dark:text-slate-400">
                      Coordinates:
                    </span>
                    <span className="text-slate-900 dark:text-white font-medium">
                      {lat}, {lon}
                    </span>
                  </div>
                </div>
              </Card>
            )}

            {/* Historical Trend (mock CSS bars) */}
            {state === "success" && (
              <Card variant="glass" padding="md" className="animate-slideUp">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
                  Historical Trend
                </h3>
                <div className="flex items-end justify-between gap-2 h-32">
                  {mockTrendData.map((item) => {
                    const heightPercent = item.value * 100;
                    return (
                      <div
                        key={item.month}
                        className="flex-1 flex flex-col items-center gap-1"
                      >
                        <ProgressBar
                          value={item.value * 100}
                          max={100}
                          size="lg"
                          animated
                          className="w-full max-w-[32px]"
                        />
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-1">
                          {item.month}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}

            {/* Error State */}
            {state === "error" && (
              <ErrorState
                message={errorMsg}
                onRetry={handleAnalyze}
                retryLabel="Retry"
              />
            )}

            {/* Idle State */}
            {state === "idle" && (
              <EmptyState
                icon={<Satellite size={24} />}
                title="Enter Coordinates"
                description='Enter field coordinates above and click "Analyze Field" to get started.'
              />
            )}
          </div>

          {/* ─── RIGHT PANEL — Map Placeholder ─── */}
          <div className="flex-1">
            <div className="relative w-full h-[300px] md:h-[600px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-green-800/20 via-amber-800/10 to-green-900/30 dark:from-green-900/40 dark:via-amber-900/20 dark:to-green-950/50">
              {/* Grid overlay */}
              <div
                className="absolute inset-0 opacity-20 dark:opacity-30"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)",
                  backgroundSize: "60px 60px",
                }}
              />

              {/* Center pin */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-primary-600/20 animate-pulse absolute -top-5 -left-5" />
                  <MapPin
                    size={32}
                    className="text-primary-600 dark:text-primary-400 drop-shadow-lg relative z-10"
                    strokeWidth={2.5}
                  />
                </div>
              </div>

              {/* Crosshair lines */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-full h-px bg-slate-400/30 dark:bg-slate-500/30" />
                <div className="absolute w-px h-full bg-slate-400/30 dark:bg-slate-500/30" />
              </div>

              {/* Info label */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                <div className="glass px-4 py-2 rounded-xl text-xs text-slate-600 dark:text-slate-300 font-medium whitespace-nowrap">
                  🛰️ Interactive Satellite Map
                  {state === "success" && data && (
                    <span className="ml-2 text-primary-600 dark:text-primary-400">
                      • {lat}, {lon}
                    </span>
                  )}
                </div>
              </div>

              {/* Top-left info */}
              <div className="absolute top-4 left-4 glass px-3 py-1.5 rounded-lg text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                {state === "idle"
                  ? "Enter coordinates and click Analyze"
                  : state === "loading"
                  ? "Fetching satellite data..."
                  : state === "success" && data
                  ? `NDVI: ${data.ndvi_score.toFixed(3)}`
                  : "No data"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}