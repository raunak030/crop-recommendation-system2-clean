"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Card from "../../components/Card";

interface FAQItem {
  question: string;
  answer: string;
}

const faqItems: FAQItem[] = [
  {
    question: "How does crop prediction work?",
    answer:
      "Our crop prediction model uses a trained machine learning algorithm (Scikit-Learn Random Forest) that analyzes key soil and environmental parameters: Nitrogen (N), Phosphorus (P), Potassium (K), temperature, humidity, pH level, and rainfall. The model is trained on agricultural datasets and provides confidence-weighted recommendations. When location coordinates are provided, the prediction is further enhanced by fusing satellite-derived NDVI data, soil compatibility scoring, and weather heuristics into a single adjusted confidence score.",
  },
  {
    question: "What is NDVI and how is it measured?",
    answer:
      "NDVI (Normalized Difference Vegetation Index) is a remote sensing metric that measures vegetation health using satellite imagery. It calculates the difference between near-infrared (strongly reflected by healthy vegetation) and red light (absorbed by chlorophyll). The formula is: NDVI = (NIR — Red) / (NIR + Red). Values range from -1 to 1, where higher positive values indicate denser, healthier vegetation. Smart Crop Engine retrieves NDVI data from Sentinel-2 satellite imagery via Google Earth Engine.",
  },
  {
    question: "How accurate are your recommendations?",
    answer:
      "The base ML model produces a probability-based confidence score derived from the Random Forest classifier. This is combined with NDVI data (20% weight), soil compatibility (10%), and weather conditions (5%) to produce an adjusted composite score. We always display both the base model confidence and the adjusted score so you can assess recommendation quality. Typical base confidence ranges from 30-50%, with the adjusted score reaching 40-55% depending on data quality.",
  },
  {
    question: "Do I need an account to use the platform?",
    answer:
      "No account or sign-up is required. Smart Crop Engine is a fully open platform — you can access all features including crop prediction, NDVI analysis, and fertilizer recommendations without any registration. This is by design: we believe agricultural intelligence should be freely accessible to everyone.",
  },
  {
    question: "Can I use this for any location?",
    answer:
      "Yes, the platform works globally. For crop prediction, you can either manually enter your soil parameters or use the GPS location feature to auto-detect your coordinates, which then fetches real-time weather data from Open-Meteo. For NDVI analysis, simply enter latitude and longitude coordinates. The satellite data coverage from Sentinel-2 is worldwide, though imagery availability may vary in frequently cloudy regions.",
  },
  {
    question: "How is fertilizer advice calculated?",
    answer:
      "The fertilizer advisor compares your soil NPK (Nitrogen, Phosphorus, Potassium) levels against optimal ranges for your selected crop. Based on detected deficits, it recommends a specific fertilizer type and explains why that fertilizer addresses the shortfall. The recommendation includes the fertilizer name, NPK deficit analysis, crop optimal levels comparison, and a plain-language reason for the suggestion.",
  },
  {
    question: "Is my data stored?",
    answer:
      "No personal or agricultural data is permanently stored by the platform. The data you enter (soil parameters, coordinates) is sent to the backend API for processing and returned as a recommendation, but is not saved to any database. We do not track, store, or sell your data in any form. This is a stateless application — once you close or refresh the page, your session data is cleared.",
  },
  {
    question: "What technologies power this platform?",
    answer:
      "The platform is built on a modern full-stack architecture: the backend uses FastAPI (Python) with Scikit-Learn for machine learning, Google Earth Engine for satellite data, and is deployed on Render. The frontend is built with Next.js (React), styled with Tailwind CSS, and deployed on Vercel. Satellite imagery is sourced from ESA's Sentinel-2 mission.",
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-3xl mx-auto px-4 py-6 md:py-8 space-y-6">
        {/* Header */}
        <PageHeader
          title="Frequently Asked Questions"
          subtitle="Everything you need to know about Smart Crop Engine and how it works."
        />

        {/* FAQ Items */}
        <div className="space-y-2">
          {faqItems.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <Card key={index} variant="bordered" padding="none">
                <div>
                  {/* Clickable Question Row */}
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl"
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${index}`}
                  >
                    <span className="text-sm font-medium text-slate-800 dark:text-slate-200 pr-2">
                      {item.question}
                    </span>
                    <ChevronDown
                      size={16}
                      className={`shrink-0 text-slate-400 transition-transform duration-300 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Answer (Sliding container) */}
                  <div
                    id={`faq-answer-${index}`}
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="px-5 pb-4 pt-0">
                      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                        {item.answer}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}