"use client";

import { useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

const initialForm = {
  nitrogen: "",
  phosphorus: "",
  potassium: "",
  temperature: "",
  humidity: "",
  ph: "",
  rainfall: "",
  soil_type: "Alluvial",
};

type FormState = typeof initialForm;

type PredictionResponse = {
  recommended_crop: string;
  base_model_confidence: number;
  adjusted_confidence: number;
  ndvi_score?: number | null;
  ndvi_health?: string | null;
  soil_match?: string | null;
  weather_score?: number | null;
  input_parameters: Record<string, string | number>;
  explanation?: string;
};

export default function Home() {
  const [formState, setFormState] = useState<FormState>(initialForm);
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationName, setLocationName] = useState("");
  const [ndvi, setNdvi] = useState<{ ndvi_score: number; health_status: string; source: string; imagery_date?: string } | null>(null);
  const [ndviLoading, setNdviLoading] = useState(false);

  const handleChange = (field: keyof FormState, value: string) => {
    setFormState((current) => ({
      ...current,
      [field]: value,
    }));
  };

  async function getLocationWeather() {
    try {
      if (!navigator.geolocation) {
        alert("Geolocation not supported");
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          // store coords globally for predict payload (minimal change)
          try {
            (window as any)._lastLat = lat;
            (window as any)._lastLon = lon;
          } catch (e) {}
              // store coords in state for later predict payload
              setFormState((prev) => ({ ...prev }));

          // Reverse geocode to get human-readable location
          try {
            const geoResponse = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
            );
            const geoData = await geoResponse.json();
            const addr = geoData?.address || {};
            setLocationName(`${addr.city || addr.town || addr.village || ""}${addr.state ? ", " + addr.state : ""}${addr.country ? ", " + addr.country : ""}`);

            // Auto-detect soil type from state (simple mapping MVP)
            const state = addr.state || "";
            const soilMap: Record<string, string> = {
              'Uttar Pradesh': 'Alluvial',
              'उत्तर प्रदेश': 'Alluvial',
              'Maharashtra': 'Black',
              'Karnataka': 'Red',
              'Punjab': 'Alluvial',
              'Rajasthan': 'Sandy',
              'Kerala': 'Laterite',
            };

            const detectedSoil = soilMap[state] || 'Loamy';
            setFormState((prev) => ({ ...prev, soil_type: detectedSoil }));
          } catch (e) {
            // ignore reverse geocode errors — still proceed to fetch weather
            console.warn("Reverse geocode failed", e);
          }

          const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=temperature_2m,relativehumidity_2m,rain&timezone=auto`
          );

          const weatherData = await response.json();

          const currentWeather = weatherData.current_weather;
          const hourly = weatherData.hourly;
          let temperature = currentWeather?.temperature;
          let humidity = 0;
          let rainfall = 0;

          if (hourly?.time && Array.isArray(hourly.time)) {
            const now = new Date(currentWeather?.time || new Date().toISOString());
            const currentHourKey = now.toISOString().slice(0, 13) + ":00";
            const index = hourly.time.indexOf(currentHourKey);
            if (index !== -1) {
              humidity = hourly.relativehumidity_2m?.[index] ?? 0;
              rainfall = hourly.rain?.[index] ?? 0;
              temperature = temperature ?? hourly.temperature_2m?.[index];
            }
          }

          setFormState((prev) => ({
            ...prev,
            temperature: String(temperature ?? prev.temperature),
            humidity: String(humidity ?? prev.humidity),
            rainfall: String(rainfall ?? prev.rainfall),
          }));
          // fetch NDVI from backend
          try {
            setNdviLoading(true);
            const ndviResp = await fetch(`${API_URL}/ndvi?lat=${lat}&lon=${lon}`);
            if (ndviResp.ok) {
              const ndviJson = await ndviResp.json();
              setNdvi(ndviJson as any);
            } else {
              // attempt to parse error message from backend
              try {
                const err = await ndviResp.json();
                setError(`NDVI unavailable: ${err.detail || JSON.stringify(err)}`);
              } catch (e) {
                setError(`NDVI request failed: ${ndviResp.status}`);
              }
              setNdvi(null);
            }
          } catch (e) {
            console.warn("NDVI fetch failed", e);
            setError("NDVI fetch failed: network or CORS issue");
            setNdvi(null);
          } finally {
            setNdviLoading(false);
          }
        },
        (error) => {
          console.error(error);
          alert("Location permission denied");
        }
      );
    } catch (err) {
      console.error(err);
      alert("Unable to fetch weather from your location.");
    }
  }

  const validateForm = () => {
    const numericKeys = [
      "nitrogen",
      "phosphorus",
      "potassium",
      "temperature",
      "humidity",
      "ph",
      "rainfall",
    ] as const;

    if (!formState.soil_type.trim()) {
      return false;
    }

    return numericKeys.every((key) => {
      const value = formState[key].trim();
      return value.length > 0 && !Number.isNaN(Number(value));
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPrediction(null);
    setError(null);

    if (!validateForm()) {
      setError("Please enter valid numeric values for every field.");
      return;
    }

    const payload = {
      N: Number(formState.nitrogen),
      P: Number(formState.phosphorus),
      K: Number(formState.potassium),
      temperature: Number(formState.temperature),
      humidity: Number(formState.humidity),
      ph: Number(formState.ph),
      rainfall: Number(formState.rainfall),
      soil_type: formState.soil_type,
      // include lat/lon if we fetched location
      lat: (window as any)._lastLat ?? null,
      lon: (window as any)._lastLon ?? null,
    };

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = (await response.json()) as PredictionResponse;
      setPrediction(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? `Prediction failed: ${err.message}`
          : "Prediction failed: unknown error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 text-slate-900">
      <div className="mx-auto flex max-w-4xl flex-col gap-8 rounded-3xl border border-slate-200 bg-white px-6 py-8 shadow-lg sm:px-10">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Crop Recommendation System</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
            Predict the best crop for your farm.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
            Enter your soil and weather values, then click <strong>Predict Crop</strong>.
            The app calls the backend API at <code>http://127.0.0.1:8000/predict</code>.
          </p>
        </div>

        {locationName && (
          <div className="sm:col-span-2">
            <div className="bg-green-100 p-3 rounded mb-4">📍 Location: {locationName}</div>
          </div>
        )}

        <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
          <div className="sm:col-span-2">
            <button
              type="button"
              onClick={getLocationWeather}
              className="bg-blue-600 text-white px-4 py-2 rounded mb-6"
            >
              Use My Location
            </button>
          </div>
          {(
            [
              { label: "Nitrogen", key: "nitrogen" },
              { label: "Phosphorus", key: "phosphorus" },
              { label: "Potassium", key: "potassium" },
              { label: "Temperature", key: "temperature" },
              { label: "Humidity", key: "humidity" },
              { label: "Soil pH", key: "ph" },
              { label: "Rainfall", key: "rainfall" },
            ] as const
          ).map(({ label, key }) => (
            <label key={key} className="space-y-2">
              <span className="text-sm font-medium text-slate-700">{label}</span>
              <input
                type="number"
                step="any"
                value={formState[key]}
                onChange={(event) => handleChange(key, event.target.value)}
                placeholder={`Enter ${label.toLowerCase()}`}
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-700 focus:ring-2 focus:ring-slate-200"
              />
            </label>
          ))}

          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Soil Type</span>
            <select
              value={formState.soil_type}
              onChange={(event) => handleChange("soil_type", event.target.value)}
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-700 focus:ring-2 focus:ring-slate-200"
            >
              {[
                "Alluvial",
                "Black",
                "Red",
                "Laterite",
                "Clay",
                "Sandy",
                "Loamy",
              ].map((soil) => (
                <option key={soil} value={soil}>
                  {soil}
                </option>
              ))}
            </select>
          </label>

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Predicting..." : "Predict Crop"}
            </button>
          </div>
        </form>

        <div className="space-y-4">
          {error ? (
            <div className="rounded-2xl bg-rose-50 p-4 text-rose-700 ring-1 ring-rose-100">
              {error}
            </div>
          ) : null}
          {ndviLoading ? (
            <div className="rounded-2xl bg-yellow-50 p-4">Fetching field health...</div>
          ) : ndvi ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-6">
              <h3 className="text-lg font-semibold text-slate-900">Field Health (NDVI)</h3>
              <p className="mt-2 text-2xl font-bold" style={{ color: ndvi.ndvi_score >= 0.6 ? '#166534' : ndvi.ndvi_score >= 0.4 ? '#a16207' : '#991b1b' }}>
                {ndvi.ndvi_score.toFixed(3)}
              </p>
              <p className="mt-1 text-sm text-slate-600">Status: {ndvi.health_status}</p>
              <p className="mt-1 text-sm text-slate-600">Acquired: {ndvi.imagery_date ?? 'N/A'}</p>
              <p className="mt-2 text-xs text-slate-500">Source: {ndvi.source}</p>
              <div className="mt-3 text-xs text-slate-500">NDVI = (B8 - B4) / (B8 + B4). Values closer to 1 indicate dense, healthy vegetation.</div>
            </div>
          ) : null}

          {prediction ? (
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <h2 className="text-xl font-semibold text-slate-950">Recommended Crop</h2>
              <p className="mt-2 text-3xl font-bold text-slate-900">{prediction.recommended_crop}</p>

              <div className="mt-3">
                <p className="text-sm text-slate-600">Base model: {prediction.base_model_confidence?.toFixed(1)}%</p>
                <p className="text-sm text-slate-600">Adjusted confidence: {prediction.adjusted_confidence?.toFixed(1)}%</p>
                <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: `${prediction.adjusted_confidence}%` }} />
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {Object.entries(prediction.input_parameters).map(([key, value]) => (
                  <div key={key} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
                    <p className="text-sm uppercase tracking-[0.18em] text-slate-500">{key}</p>
                    <p className="mt-2 text-lg font-semibold text-slate-900">{value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 bg-white p-4 rounded-lg ring-1 ring-slate-200">
                <p className="text-sm font-medium">Satellite NDVI:</p>
                <p className="mt-1 text-lg font-semibold">{prediction.ndvi_score ?? 'N/A'} — {prediction.ndvi_health ?? 'N/A'}</p>
                <p className="text-sm text-slate-600 mt-2">Soil match: {prediction.soil_match ?? 'N/A'}</p>
                <p className="text-sm text-slate-600">Weather score: {prediction.weather_score ?? 'N/A'}</p>
                <div className="mt-3 text-sm text-slate-700">Why: {prediction.explanation ?? ''}</div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
