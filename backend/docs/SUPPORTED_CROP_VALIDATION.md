# Supported Crop Validation — Smart Crop Engine v1.5

## Summary

**Model:** RandomForest (22 classes)
**Total crops:** 22
**Found in top-5:** 22/22
**Silent (not found):** 0

### Search Method

For each crop, start at its training data mean and systematically vary:
- All 7 soil types
- NPK values ±20% (5 levels each)
- Temperature and humidity ±15%
- pH ±15% and rainfall ±20%

At each variation, get real model probabilities and call `compute_top_crops()`
to find if the target crop appears in the top-5.

---

## Per-Crop Results

| Crop | Best Rank | Suitability Score | Conditions |
|------|-----------|------------------|------------|
| Apple | #1 | 90.0/100 | N=20.0 P=132.5 K=200.0 T=22.5°C H=92.5% pH=6.0 R=112.5mm S=Alluvial |
| Banana | #1 | 90.0/100 | N=100.0 P=82.5 K=50.0 T=27.5°C H=80.0% pH=6.0 R=105.0mm S=Alluvial |
| Blackgram | #1 | 89.65/100 | N=40.0 P=67.5 K=20.0 T=30.0°C H=65.0% pH=7.1 R=67.7mm S=Alluvial |
| Chickpea | #1 | 84.0/100 | N=40.0 P=67.5 K=80.0 T=19.0°C H=17.1% pH=7.4 R=79.9mm S=Alluvial |
| Coconut | #1 | 90.0/100 | N=20.0 P=17.5 K=30.0 T=27.4°C H=95.0% pH=6.0 R=178.4mm S=Alluvial |
| Coffee | #1 | 90.0/100 | N=100.0 P=27.5 K=30.0 T=25.5°C H=60.0% pH=6.8 R=157.3mm S=Alluvial |
| Cotton | #1 | 84.0/100 | N=120.0 P=47.5 K=20.0 T=24.0°C H=79.9% pH=6.9 R=80.3mm S=Alluvial |
| Grapes | #1 | 90.0/100 | N=20.0 P=132.5 K=200.0 T=25.4°C H=82.0% pH=6.0 R=70.0mm S=Alluvial |
| Jute | #1 | 97.55/100 | N=80.0 P=47.5 K=40.0 T=25.0°C H=80.4% pH=6.7 R=175.0mm S=Alluvial |
| Kidneybeans | #1 | 90.0/100 | N=20.0 P=67.5 K=20.0 T=20.1°C H=21.5% pH=5.8 R=105.0mm S=Alluvial |
| Lentil | #1 | 90.0/100 | N=20.0 P=67.5 K=20.0 T=24.0°C H=65.0% pH=6.9 R=45.0mm S=Alluvial |
| Maize | #1 | 99.65/100 | N=80.0 P=47.5 K=20.0 T=22.3°C H=65.1% pH=6.3 R=85.2mm S=Alluvial |
| Mango | #1 | 90.0/100 | N=20.0 P=27.5 K=30.0 T=31.5°C H=50.0% pH=5.7 R=95.0mm S=Alluvial |
| Mothbeans | #1 | 87.2/100 | N=20.0 P=47.5 K=20.0 T=28.0°C H=52.5% pH=6.7 R=52.7mm S=Alluvial |
| Mungbean | #1 | 90.0/100 | N=20.0 P=47.5 K=20.0 T=28.5°C H=85.0% pH=6.7 R=48.0mm S=Alluvial |
| Muskmelon | #1 | 90.0/100 | N=100.0 P=17.5 K=50.0 T=28.5°C H=92.5% pH=6.4 R=25.0mm S=Alluvial |
| Orange | #1 | 88.6/100 | N=20.0 P=17.5 K=10.0 T=22.5°C H=92.5% pH=7.0 R=109.9mm S=Alluvial |
| Papaya | #1 | 90.0/100 | N=50.5 P=58.0 K=50.0 T=33.3°C H=92.5% pH=6.7 R=144.6mm S=Alluvial |
| Pigeonpeas | #1 | 90.0/100 | N=20.0 P=67.5 K=20.0 T=27.6°C H=50.0% pH=6.0 R=144.4mm S=Alluvial |
| Pomegranate | #1 | 90.0/100 | N=20.0 P=17.5 K=40.0 T=21.5°C H=90.1% pH=6.4 R=107.5mm S=Alluvial |
| Rice | #1 | 100.0/100 | N=79.5 P=47.5 K=40.0 T=23.5°C H=82.5% pH=6.4 R=240.6mm S=Alluvial |
| Watermelon | #1 | 90.0/100 | N=100.0 P=17.5 K=50.0 T=25.5°C H=85.0% pH=6.5 R=49.9mm S=Alluvial |

## Silent Crops Deep Dive

The following 5 crops were flagged in prior stress tests as never #1:

### Blackgram — Found at rank #1

- **Suitability:** 89.65/100
- **Best known conditions:** N=40.0 P=67.5 K=20.0, T=30.0°C, H=65.0%, pH=7.1, R=67.7mm, soil=Alluvial

### Cotton — Found at rank #1

- **Suitability:** 84.0/100
- **Best known conditions:** N=120.0 P=47.5 K=20.0, T=24.0°C, H=79.9%, pH=6.9, R=80.3mm, soil=Alluvial

### Lentil — Found at rank #1

- **Suitability:** 90.0/100
- **Best known conditions:** N=20.0 P=67.5 K=20.0, T=24.0°C, H=65.0%, pH=6.9, R=45.0mm, soil=Alluvial

### Mungbean — Found at rank #1

- **Suitability:** 90.0/100
- **Best known conditions:** N=20.0 P=47.5 K=20.0, T=28.5°C, H=85.0%, pH=6.7, R=48.0mm, soil=Alluvial

### Pomegranate — Found at rank #1

- **Suitability:** 90.0/100
- **Best known conditions:** N=20.0 P=17.5 K=40.0, T=21.5°C, H=90.1%, pH=6.4, R=107.5mm, soil=Alluvial

---

## Interpretation

All 22 crops are reachable in the top-5 under suitable conditions.
