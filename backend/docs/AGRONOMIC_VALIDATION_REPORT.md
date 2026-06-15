# Agronomic Validation Report — Smart Crop Engine v1.5

**Model:** RandomForest (22 classes)
**Scenarios tested:** 10

## Methodology

Each scenario uses the real trained model + `compute_top_crops()` from `rule_engine.py`
with realistic Indian regional parameters. The pipeline produces top-5 crops ranked by
a weighted composite of model probability (35%), soil compatibility (20%),
temperature (12%), rainfall (10%), humidity (8%), pH (5%), and NPK fitness (10%).

---

## 1. Punjab — Rice Region
**Region:** Punjab  
**Description:** Indo-Gangetic alluvial plains, high-input rice-wheat system  

### Input Parameters

| Parameter | Value |
|-----------|-------|
| N | 90 |
| P | 40 |
| K | 40 |
| temperature | 25 |
| humidity | 75 |
| ph | 7.0 |
| rainfall | 200 |
| soil_type | Alluvial |

### Top-5 Recommendations

| Rank | Crop | Model Prob | Suitability | Uncertainty |
|------|------|------------|-------------|-------------|
| 1 | Jute | 66.0% | 87.14/100 | Low |
| 2 | Rice | 34.0% | 74.56/100 | Low |

### Component Scores (Top-3)

**Jute** (soil=N/A, coffee_penalty=0.0)

| Component | Score |
|-----------|-------|

**Rice** (soil=N/A, coffee_penalty=0.0)

| Component | Score |
|-----------|-------|

### Notes
- No issues flagged — recommendations look plausible

---

## 2. Haryana — Wheat Belt
**Region:** Haryana  
**Description:** Semi-arid loamy plains, staple wheat cultivation  

### Input Parameters

| Parameter | Value |
|-----------|-------|
| N | 60 |
| P | 35 |
| K | 35 |
| temperature | 20 |
| humidity | 55 |
| ph | 7.5 |
| rainfall | 80 |
| soil_type | Loamy |

### Top-5 Recommendations

| Rank | Crop | Model Prob | Suitability | Uncertainty |
|------|------|------------|-------------|-------------|
| 1 | Maize | 35.0% | 72.13/100 | Medium |
| 2 | Mango | 20.0% | 43.38/100 | Medium |
| 3 | Chickpea | 3.0% | 52.91/100 | Medium |
| 4 | Coffee | 25.0% | 24.87/100 | Medium |
| 5 | Mothbeans | 3.0% | 39.13/100 | Medium |

### Component Scores (Top-3)

**Maize** (soil=N/A, coffee_penalty=0.0)

| Component | Score |
|-----------|-------|

**Mango** (soil=N/A, coffee_penalty=0.0)

| Component | Score |
|-----------|-------|

**Chickpea** (soil=N/A, coffee_penalty=0.0)

| Component | Score |
|-----------|-------|

### Flags
- ⚠️ Mango appears in top-5 despite cold temperature
- ℹ️ chickpea has very low model probability (3.0%)
- ℹ️ mothbeans has very low model probability (3.0%)

---

## 3. Uttar Pradesh — Rice/Wheat Belt
**Region:** Uttar Pradesh  
**Description:** Central alluvial plains, diverse cropping  

### Input Parameters

| Parameter | Value |
|-----------|-------|
| N | 80 |
| P | 45 |
| K | 40 |
| temperature | 24 |
| humidity | 65 |
| ph | 7.2 |
| rainfall | 160 |
| soil_type | Alluvial |

### Top-5 Recommendations

| Rank | Crop | Model Prob | Suitability | Uncertainty |
|------|------|------------|-------------|-------------|
| 1 | Jute | 49.0% | 80.4/100 | Low |
| 2 | Coffee | 46.0% | 67.2/100 | Low |
| 3 | Maize | 3.0% | 57.19/100 | Low |
| 4 | Rice | 1.0% | 58.86/100 | Low |
| 5 | Pigeonpeas | 1.0% | 47.57/100 | Low |

### Component Scores (Top-3)

**Jute** (soil=N/A, coffee_penalty=0.0)

| Component | Score |
|-----------|-------|

**Coffee** (soil=N/A, coffee_penalty=0.0)

| Component | Score |
|-----------|-------|

**Maize** (soil=N/A, coffee_penalty=0.0)

| Component | Score |
|-----------|-------|

### Flags
- ℹ️ maize has very low model probability (3.0%)
- ℹ️ rice has very low model probability (1.0%)
- ℹ️ pigeonpeas has very low model probability (1.0%)

---

## 4. Maharashtra — Cotton Region
**Region:** Maharashtra  
**Description:** Deccan plateau black soils, cash crops  

### Input Parameters

| Parameter | Value |
|-----------|-------|
| N | 70 |
| P | 30 |
| K | 30 |
| temperature | 32 |
| humidity | 50 |
| ph | 7.5 |
| rainfall | 90 |
| soil_type | Black |

### Top-5 Recommendations

| Rank | Crop | Model Prob | Suitability | Uncertainty |
|------|------|------------|-------------|-------------|
| 1 | Mango | 30.0% | 60.98/100 | Medium |
| 2 | Coffee | 43.0% | 38.21/100 | Medium |
| 3 | Blackgram | 9.0% | 47.93/100 | Medium |
| 4 | Maize | 14.0% | 36.35/100 | Medium |
| 5 | Mothbeans | 2.0% | 47.91/100 | Medium |

### Component Scores (Top-3)

**Mango** (soil=N/A, coffee_penalty=0.0)

| Component | Score |
|-----------|-------|

**Coffee** (soil=N/A, coffee_penalty=18.2)

| Component | Score |
|-----------|-------|

**Blackgram** (soil=N/A, coffee_penalty=0.0)

| Component | Score |
|-----------|-------|

### Flags
- ℹ️ mothbeans has very low model probability (2.0%)

---

## 5. Karnataka — Coffee Region
**Region:** Karnataka  
**Description:** Western Ghats slopes, coffee/plantation belt  

### Input Parameters

| Parameter | Value |
|-----------|-------|
| N | 90 |
| P | 30 |
| K | 35 |
| temperature | 24 |
| humidity | 65 |
| ph | 6.5 |
| rainfall | 150 |
| soil_type | Red |

### Top-5 Recommendations

| Rank | Crop | Model Prob | Suitability | Uncertainty |
|------|------|------------|-------------|-------------|
| 1 | Coffee | 99.0% | 88.46/100 | Low |
| 2 | Jute | 1.0% | 45.7/100 | Low |

### Component Scores (Top-3)

**Coffee** (soil=N/A, coffee_penalty=0.0)

| Component | Score |
|-----------|-------|

**Jute** (soil=N/A, coffee_penalty=0.0)

| Component | Score |
|-----------|-------|

### Flags
- ℹ️ jute has very low model probability (1.0%)

---

## 6. Kerala — Plantation Region
**Region:** Kerala  
**Description:** High rainfall laterite, coconut/rubber/spices  

### Input Parameters

| Parameter | Value |
|-----------|-------|
| N | 60 |
| P | 30 |
| K | 40 |
| temperature | 28 |
| humidity | 85 |
| ph | 5.5 |
| rainfall | 300 |
| soil_type | Laterite |

### Top-5 Recommendations

| Rank | Crop | Model Prob | Suitability | Uncertainty |
|------|------|------------|-------------|-------------|
| 1 | Rice | 42.0% | 58.94/100 | Medium |
| 2 | Coconut | 17.0% | 45.35/100 | Medium |
| 3 | Papaya | 6.0% | 46.08/100 | Medium |
| 4 | Banana | 8.0% | 43.66/100 | Medium |
| 5 | Watermelon | 7.0% | 39.81/100 | Medium |

### Component Scores (Top-3)

**Rice** (soil=N/A, coffee_penalty=0.0)

| Component | Score |
|-----------|-------|

**Coconut** (soil=N/A, coffee_penalty=0.0)

| Component | Score |
|-----------|-------|

**Papaya** (soil=N/A, coffee_penalty=0.0)

| Component | Score |
|-----------|-------|

### Notes
- No issues flagged — recommendations look plausible

---

## 7. Rajasthan — Dryland Region
**Region:** Rajasthan  
**Description:** Thar desert fringe, low-input rainfed farming  

### Input Parameters

| Parameter | Value |
|-----------|-------|
| N | 20 |
| P | 15 |
| K | 15 |
| temperature | 38 |
| humidity | 25 |
| ph | 8.0 |
| rainfall | 40 |
| soil_type | Sandy |

### Top-5 Recommendations

| Rank | Crop | Model Prob | Suitability | Uncertainty |
|------|------|------------|-------------|-------------|
| 1 | Mothbeans | 42.0% | 50.59/100 | Medium |
| 2 | Kidneybeans | 29.0% | 44.35/100 | Medium |
| 3 | Mango | 7.0% | 37.47/100 | Medium |
| 4 | Papaya | 1.0% | 38.81/100 | Medium |
| 5 | Blackgram | 4.0% | 33.59/100 | Medium |

### Component Scores (Top-3)

**Mothbeans** (soil=N/A, coffee_penalty=0.0)

| Component | Score |
|-----------|-------|

**Kidneybeans** (soil=N/A, coffee_penalty=0.0)

| Component | Score |
|-----------|-------|

**Mango** (soil=N/A, coffee_penalty=0.0)

| Component | Score |
|-----------|-------|

### Flags
- ℹ️ papaya has very low model probability (1.0%)
- ℹ️ blackgram has very low model probability (4.0%)

---

## 8. Gujarat — Cash Crop Region
**Region:** Gujarat  
**Description:** Saurashtra black soils, cotton/groundnut  

### Input Parameters

| Parameter | Value |
|-----------|-------|
| N | 80 |
| P | 40 |
| K | 30 |
| temperature | 34 |
| humidity | 40 |
| ph | 7.8 |
| rainfall | 100 |
| soil_type | Black |

### Top-5 Recommendations

| Rank | Crop | Model Prob | Suitability | Uncertainty |
|------|------|------------|-------------|-------------|
| 1 | Mango | 21.0% | 54.78/100 | Medium |
| 2 | Coffee | 49.0% | 16.15/100 | Medium |
| 3 | Maize | 16.0% | 35.0/100 | Medium |
| 4 | Mothbeans | 5.0% | 43.86/100 | Medium |
| 5 | Blackgram | 6.0% | 42.84/100 | Medium |

### Component Scores (Top-3)

**Mango** (soil=N/A, coffee_penalty=0.0)

| Component | Score |
|-----------|-------|

**Coffee** (soil=N/A, coffee_penalty=37.1)

| Component | Score |
|-----------|-------|

**Maize** (soil=N/A, coffee_penalty=0.0)

| Component | Score |
|-----------|-------|

### Notes
- No issues flagged — recommendations look plausible

---

## 9. Madhya Pradesh — Mixed Farming
**Region:** Madhya Pradesh  
**Description:** Central highlands, diverse rainfed agriculture  

### Input Parameters

| Parameter | Value |
|-----------|-------|
| N | 50 |
| P | 30 |
| K | 30 |
| temperature | 28 |
| humidity | 55 |
| ph | 7.0 |
| rainfall | 120 |
| soil_type | Loamy |

### Top-5 Recommendations

| Rank | Crop | Model Prob | Suitability | Uncertainty |
|------|------|------------|-------------|-------------|
| 1 | Mango | 58.0% | 69.68/100 | Medium |
| 2 | Coffee | 21.0% | 60.19/100 | Medium |
| 3 | Pigeonpeas | 5.0% | 49.9/100 | Medium |
| 4 | Jute | 1.0% | 52.36/100 | Medium |
| 5 | Blackgram | 3.0% | 45.84/100 | Medium |

### Component Scores (Top-3)

**Mango** (soil=N/A, coffee_penalty=0.0)

| Component | Score |
|-----------|-------|

**Coffee** (soil=N/A, coffee_penalty=0.0)

| Component | Score |
|-----------|-------|

**Pigeonpeas** (soil=N/A, coffee_penalty=0.0)

| Component | Score |
|-----------|-------|

### Flags
- ℹ️ jute has very low model probability (1.0%)
- ℹ️ blackgram has very low model probability (3.0%)

---

## 10. Tamil Nadu — Irrigated Region
**Region:** Tamil Nadu  
**Description:** Cauvery delta, intensive irrigation  

### Input Parameters

| Parameter | Value |
|-----------|-------|
| N | 80 |
| P | 35 |
| K | 40 |
| temperature | 30 |
| humidity | 70 |
| ph | 6.8 |
| rainfall | 180 |
| soil_type | Clay |

### Top-5 Recommendations

| Rank | Crop | Model Prob | Suitability | Uncertainty |
|------|------|------------|-------------|-------------|
| 1 | Coffee | 57.0% | 67.15/100 | Medium |
| 2 | Jute | 26.0% | 49.76/100 | Medium |
| 3 | Rice | 6.0% | 55.88/100 | Medium |
| 4 | Papaya | 2.0% | 46.42/100 | Medium |
| 5 | Pigeonpeas | 1.0% | 47.0/100 | Medium |

### Component Scores (Top-3)

**Coffee** (soil=N/A, coffee_penalty=0.1)

| Component | Score |
|-----------|-------|

**Jute** (soil=N/A, coffee_penalty=0.0)

| Component | Score |
|-----------|-------|

**Rice** (soil=N/A, coffee_penalty=0.0)

| Component | Score |
|-----------|-------|

### Flags
- ℹ️ papaya has very low model probability (2.0%)
- ℹ️ pigeonpeas has very low model probability (1.0%)

---

## Summary of Issues

- (2x) ℹ️ pigeonpeas has very low model probability (1.0%)
- (2x) ℹ️ jute has very low model probability (1.0%)
- (1x) ⚠️ Mango appears in top-5 despite cold temperature
- (1x) ℹ️ chickpea has very low model probability (3.0%)
- (1x) ℹ️ mothbeans has very low model probability (3.0%)
- (1x) ℹ️ maize has very low model probability (3.0%)
- (1x) ℹ️ rice has very low model probability (1.0%)
- (1x) ℹ️ mothbeans has very low model probability (2.0%)
- (1x) ℹ️ papaya has very low model probability (1.0%)
- (1x) ℹ️ blackgram has very low model probability (4.0%)
- (1x) ℹ️ blackgram has very low model probability (3.0%)
- (1x) ℹ️ papaya has very low model probability (2.0%)
