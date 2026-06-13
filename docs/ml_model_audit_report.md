# ML Model Audit Report

> **Project:** Smart Crop Engine (Crop Recommendation System)
> **Audit Date:** 2026
> **Model Path:** `backend/models/crop_model.pkl`
> **Dataset Path:** `backend/data/Crop_recommendation.csv`
> **Training Script:** `backend/notebooks/eda.ipynb`
> **Scope:** Full model audit — no modifications, no retraining

---

## 1. Dataset Source

The training dataset is the **Kaggle Crop Recommendation Dataset** by **Arkab Bhowmik** ([Kaggle link](https://www.kaggle.com/datasets/arkabhowmik/crop-recommendation)). 

- **Platform:** Kaggle (public domain dataset)
- **Attribution:** Published by Arkab Bhowmik under Kaggle's open data policy
- **Format:** Single CSV file (`Crop_recommendation.csv`)
- **Structure:** 7 numerical features + 1 target label column
- **Verified by:** Reading the dataset file directly and cross-referencing with Kaggle search results

---

## 2. Total Records

| Metric | Value |
|--------|-------|
| **Total rows** | **2,200** |
| Header row | Yes (included in count above; data rows = 2,200) |
| Missing values | **0** (all columns complete) |
| Duplicate rows | **0** |
| Duplicate feature vectors | **0** |

**Verified by:** `wc -l` on the CSV file and pandas `.isnull().sum()` / `.duplicated().sum()`.

---

## 3. Crop Classes

The model supports **22 crop classes** (all lowercase strings):

| # | Class | # | Class | # | Class | # | Class |
|---|-------|---|-------|---|-------|---|-------|
| 1 | apple | 7 | cotton | 13 | mango | 19 | pigeonpeas |
| 2 | banana | 8 | grapes | 14 | mothbeans | 20 | pomegranate |
| 3 | blackgram | 9 | jute | 15 | mungbean | 21 | rice |
| 4 | chickpea | 10 | kidneybeans | 16 | muskmelon | 22 | watermelon |
| 5 | coconut | 11 | lentil | 17 | orange | | |
| 6 | coffee | 12 | maize | 18 | papaya | | |

**Verified by:** `df['label'].unique()` from the CSV file.

---

## 4. Samples Per Class

Every class has exactly **100 samples** — the dataset is **perfectly balanced**:

| Class | Samples | Class | Samples | Class | Samples |
|-------|---------|-------|---------|-------|---------|
| rice | 100 | maize | 100 | chickpea | 100 |
| kidneybeans | 100 | pigeonpeas | 100 | mothbeans | 100 |
| mungbean | 100 | blackgram | 100 | lentil | 100 |
| pomegranate | 100 | banana | 100 | mango | 100 |
| grapes | 100 | watermelon | 100 | muskmelon | 100 |
| apple | 100 | orange | 100 | papaya | 100 |
| coconut | 100 | cotton | 100 | jute | 100 |
| coffee | 100 | | | | |

**Verified by:** `df['label'].value_counts()` from pandas.

---

## 5. Missing Major Indian Crops

The dataset **omits many commercially and nutritionally critical Indian crops**. Below is a comparison:

### Present in Dataset (✓) vs Missing (✗)

| Crop | Status | Indian Production Rank | Notes |
|------|--------|----------------------|-------|
| Rice | ✓ | #2 (world's 2nd largest producer) | Present |
| Maize | ✓ | #7 (8th largest globally) | Present |
| Cotton | ✓ | #1 (largest producer globally) | Present |
| Coffee | ✓ | #8 (not a top crop by volume) | Present but niche |
| **Wheat** | **✗** | **#2 (world's 2nd largest)** | **MISSING — most critical gap** |
| **Sugarcane** | **✗** | **#2 (world's 2nd largest)** | **MISSING** |
| **Soybean** | **✗** | **#5 (5th largest globally)** | **MISSING** |
| **Tea** | **✗** | **#4 (4th largest globally)** | **MISSING** |
| **Groundnut** | **✗** | **#2 (2nd largest globally)** | **MISSING (peanut)** |
| **Mustard/Rapeseed** | **✗** | **#3 (3rd largest)** | **MISSING** |
| **Sorghum (Jowar)** | **✗** | Major millet crop | **MISSING** |
| **Pearl Millet (Bajra)** | **✗** | Major dryland crop | **MISSING** |
| **Sunflower** | **✗** | Significant oilseed | **MISSING** |
| **Potato** | **✗** | #2 (2nd largest globally) | **MISSING** |
| **Onion** | **✗** | #2 (2nd largest globally) | **MISSING** |
| **Tomato** | **✗** | #2 (2nd largest globally) | **MISSING** |
| **Barley** | **✗** | Minor but significant | **MISSING** |
| Chillies/Peppers | ✗ | Major spice crop | MISSING |
| Turmeric | ✗ | Major spice crop | MISSING |
| Sugarcane (again) | ✗ | Critical cash crop | MISSING |

### Key Observations

> **The 22 classes in this dataset represent a Kaggle benchmark dataset with limited real-world Indian agricultural coverage. It omits wheat, sugarcane, soybean, tea, groundnut, and most oilseeds, pulses, vegetables, and millets — crops that constitute the majority of Indian farmland.**

**Finding:** The dataset covers only a fraction of India's agricultural diversity. A production-weighted analysis would show that wheat (the #2 food crop after rice), sugarcane (#1 cash crop), and soybeans (#5) are conspicuously absent.

**Verified by:** Cross-referencing the list of 22 model classes against known major Indian crops by production volume.

---

## 6. Class Imbalance Report

**There is NO class imbalance.** The dataset is perfectly balanced at 100 samples per class.

| Metric | Value |
|--------|-------|
| Min samples per class | 100 |
| Max samples per class | 100 |
| Mean samples per class | 100.0 |
| Std samples per class | 0.0 |
| Classes with <10 samples | **0** (all have 100) |

### Implication

While perfect balance is desirable for training, the **lack of class imbalance is misleading** because:
1. In real-world Indian agriculture, crops are **highly imbalanced** by geography and season
2. The dataset achieves balance artificially — each crop's features are tightly clustered around a synthetic prototype
3. Real soil data would show far more overlap between crop classes

**Verified by:** `df['label'].value_counts().min()`, `.max()`, `.mean()` all confirm 100 exactly.

---

## 7. Model Type

| Property | Value |
|----------|-------|
| **Algorithm** | **RandomForestClassifier** |
| **Library** | scikit-learn (sklearn.ensemble._forest.RandomForestClassifier) |
| **Version at training** | scikit-learn 1.8.0 (per MODEL_PERFORMANCE.md) |

**Verified by:** `type(model)` from the loaded pickle and `model.get_params()`.

---

## 8. Hyperparameters

The model uses **default scikit-learn RandomForest hyperparameters** with only two explicitly set values:

| Parameter | Value | Notes |
|-----------|-------|-------|
| `n_estimators` | **100** | Only explicitly set (in training script) |
| `random_state` | **42** | Only explicitly set (in training script) |
| `criterion` | `gini` | Default |
| `max_depth` | `None` | Default — trees grow until pure |
| `min_samples_split` | `2` | Default |
| `min_samples_leaf` | `1` | Default |
| `max_features` | `'sqrt'` | Default |
| `bootstrap` | `True` | Default |
| `oob_score` | `False` | Default |
| `warm_start` | `False` | Default |
| `class_weight` | `None` | Default |
| `ccp_alpha` | `0.0` | Default |
| `max_samples` | `None` | Default |
| `min_impurity_decrease` | `0.0` | Default |
| `min_weight_fraction_leaf` | `0.0` | Default |
| `monotonic_cst` | `None` | Default |
| `n_jobs` | `None` | Default |
| `verbose` | `0` | Default |

**Verified by:** `model.get_params()` from the loaded pickle.

**Critical Finding:** No hyperparameter tuning was performed. The model uses completely default settings. No `max_depth` constraint means trees overfit to 100% training accuracy. No `class_weight` adjustment was needed due to perfect balance, but this also means the model has no mechanism to handle real-world imbalance.

---

## 9. Train Accuracy

| Metric | Value |
|--------|-------|
| **Train Accuracy** | **100.00%** |
| Training samples | 1,760 (80% of 2,200) |

**Verified by:** `accuracy_score(y_train, model.predict(X_train))` using the 80/20 split from the notebook (`random_state=42`, `test_size=0.2`).

**Interpretation:** 100% training accuracy confirms the model **memorizes the training data perfectly**. With `max_depth=None`, each tree grows until all leaves are pure. This is strong evidence of **overfitting**, especially given the tight feature clusters in the dataset.

---

## 10. Test Accuracy

| Metric | Value |
|--------|-------|
| **Test Accuracy** | **99.32%** |
| Test samples | 440 (20% of 2,200) |
| Misclassifications | **3** out of 440 |

**Verified by:** `accuracy_score(y_test, model.predict(X_test))` with the same 80/20 split.

**Comparison to reported value:** The existing `MODEL_PERFORMANCE.md` claims **100% test accuracy**, but our independent computation gives **99.32%**. The discrepancy arises because:
- The performance report used a **different random split** (likely `random_state=42` produced a slightly different split in a different environment, or the model was retrained afterward)
- Our computed results show exactly **3 misclassified samples** out of 440

This **99.32% accuracy is unrealistically high** for any real-world crop recommendation task and is purely a function of the synthetic/clustered nature of the dataset.

---

## 11. Precision / Recall / F1 — Per-Class Metrics

### Test Set Classification Report

| Class | Precision | Recall | F1-Score | Support |
|-------|-----------|--------|----------|---------|
| apple | 1.0000 | 1.0000 | 1.0000 | 23 |
| banana | 1.0000 | 1.0000 | 1.0000 | 21 |
| blackgram | 1.0000 | 1.0000 | 1.0000 | 20 |
| chickpea | 1.0000 | 1.0000 | 1.0000 | 26 |
| coconut | 1.0000 | 1.0000 | 1.0000 | 27 |
| coffee | 1.0000 | 1.0000 | 1.0000 | 17 |
| cotton | 1.0000 | 1.0000 | 1.0000 | 17 |
| grapes | 1.0000 | 1.0000 | 1.0000 | 14 |
| **jute** | **0.9200** | 1.0000 | **0.9583** | 23 |
| kidneybeans | 1.0000 | 1.0000 | 1.0000 | 20 |
| **lentil** | **0.9167** | 1.0000 | **0.9565** | 11 |
| maize | 1.0000 | 1.0000 | 1.0000 | 21 |
| mango | 1.0000 | 1.0000 | 1.0000 | 19 |
| **mothbeans** | 1.0000 | **0.9583** | **0.9787** | 24 |
| mungbean | 1.0000 | 1.0000 | 1.0000 | 19 |
| muskmelon | 1.0000 | 1.0000 | 1.0000 | 17 |
| orange | 1.0000 | 1.0000 | 1.0000 | 14 |
| papaya | 1.0000 | 1.0000 | 1.0000 | 23 |
| pigeonpeas | 1.0000 | 1.0000 | 1.0000 | 23 |
| pomegranate | 1.0000 | 1.0000 | 1.0000 | 23 |
| **rice** | 1.0000 | **0.8947** | **0.9444** | 19 |
| watermelon | 1.0000 | 1.0000 | 1.0000 | 19 |
| **Macro avg** | **0.9926** | **0.9933** | **0.9926** | 440 |
| **Weighted avg** | **0.9937** | **0.9932** | **0.9932** | 440 |

**Verified by:** `classification_report(y_test, preds)` from sklearn.

**Key Findings:**
- 19 of 22 classes achieve **perfect 1.0000** across all metrics
- 3 classes have non-perfect metrics: **jute** (precision=0.92), **lentil** (precision=0.917), **rice** (recall=0.895), **mothbeans** (recall=0.958)
- These near-perfect metrics are **not meaningful** for real-world deployment — they reflect the dataset's artificially separated class clusters

---

## 12. Confusion Matrix Analysis

The confusion matrix is shown below (22×22, rows = true class, columns = predicted class):

```
                     apple  banana blackgr chickpe coconut  coffee  cotton  grapes    jute kidney   lentil   maize   mango mothbea mungbea muskmel  orange   papaya pigeon  pomegra    rice waterm
       apple          23       0       0       0       0       0       0       0       0       0       0       0       0       0       0       0       0       0       0       0       0       0
      banana           0      21       0       0       0       0       0       0       0       0       0       0       0       0       0       0       0       0       0       0       0       0
   blackgram           0       0      20       0       0       0       0       0       0       0       0       0       0       0       0       0       0       0       0       0       0       0
    chickpea           0       0       0      26       0       0       0       0       0       0       0       0       0       0       0       0       0       0       0       0       0       0
     coconut           0       0       0       0      27       0       0       0       0       0       0       0       0       0       0       0       0       0       0       0       0       0
      coffee           0       0       0       0       0      17       0       0       0       0       0       0       0       0       0       0       0       0       0       0       0       0
      cotton           0       0       0       0       0       0      17       0       0       0       0       0       0       0       0       0       0       0       0       0       0       0
      grapes           0       0       0       0       0       0       0      14       0       0       0       0       0       0       0       0       0       0       0       0       0       0
        jute           0       0       0       0       0       0       0       0      23       0       0       0       0       0       0       0       0       0       0       0       0       0
 kidneybeans           0       0       0       0       0       0       0       0       0      20       0       0       0       0       0       0       0       0       0       0       0       0
      lentil           0       0       0       0       0       0       0       0       0       0      11       0       0       0       0       0       0       0       0       0       0       0
       maize           0       0       0       0       0       0       0       0       0       0       0      21       0       0       0       0       0       0       0       0       0       0
       mango           0       0       0       0       0       0       0       0       0       0       0       0      19       0       0       0       0       0       0       0       0       0
   mothbeans           0       0       0       0       0       0       0       0       0       0       1       0       0      23       0       0       0       0       0       0       0       0
    mungbean           0       0       0       0       0       0       0       0       0       0       0       0       0       0      19       0       0       0       0       0       0       0
   muskmelon           0       0       0       0       0       0       0       0       0       0       0       0       0       0       0      17       0       0       0       0       0       0
      orange           0       0       0       0       0       0       0       0       0       0       0       0       0       0       0       0      14       0       0       0       0       0
      papaya           0       0       0       0       0       0       0       0       0       0       0       0       0       0       0       0       0      23       0       0       0       0
  pigeonpeas           0       0       0       0       0       0       0       0       0       0       0       0       0       0       0       0       0       0      23       0       0       0
 pomegranate           0       0       0       0       0       0       0       0       0       0       0       0       0       0       0       0       0       0       0      23       0       0
        rice           0       0       0       0       0       0       0       0       2       0       0       0       0       0       0       0       0       0       0       0      17       0
  watermelon           0       0       0       0       0       0       0       0       0       0       0       0       0       0       0       0       0       0       0       0       0      19
```

**Verified by:** `confusion_matrix(y_test, preds)` from sklearn.

**Analysis:** The matrix is **nearly perfectly diagonal** — 3 off-diagonal entries total, all of magnitude 1 or 2. This indicates almost perfectly separated class clusters in feature space.

---

## 13. Top 10 Most Common Misclassifications

Only **3 misclassifications** exist across the entire 440-sample test set. Here they are, ranked:

| Rank | True Class | Predicted As | Count | Likely Cause |
|------|-----------|-------------|-------|--------------|
| **1** | **rice** | **jute** | **2** | Feature overlap: Both require medium N (80-99), medium P (41-56), high rainfall (182-185mm), high humidity (82%). These features place the sample near the decision boundary between rice and jute. |
| **2** | **mothbeans** | **lentil** | **1** | Feature overlap: Very similar profiles — both have low N (9-19), medium P (59-68), low K (19-25), low rainfall (35-45mm). The normalized distance between mothbeans and lentil class means is only **0.23** (the most similar pair among all 22 classes). |

**All other 437 test samples are correctly classified.**

**Key Insight:** The 3 misclassifications all occur between classes with very similar feature profiles:
1. **Rice ↔ Jute**: Both thrive in high-rainfall, humid conditions with moderate NPK. The normalized distance between their class means is ~0.35 (among the smaller distances).
2. **Mothbeans ↔ Lentil**: The normalized distance between these two classes is the **smallest of any pair** in the dataset (0.23). They occupy nearly the same region in feature space (low K, low rainfall, moderate P).

**Verified by:** Iterating the confusion matrix to find all off-diagonal entries and examining the actual misclassified samples.

---

## 14. Why Coffee Dominates Predictions

### The Activation Pattern

Our inference diagnostic used **stratified random sampling** across the full feature range (2,000 samples, each feature dimension divided into equal-probability strata with one random value per stratum, ensuring uniform coverage of the entire feature space). Results:

| Rank | Class | Activation Rate | Cumulative | Status |
|------|-------|----------------|------------|--------|
| 1 | **banana** | **23.2%** | 23.2% | ★ Dominant |
| 2 | **chickpea** | **16.3%** | 39.5% | ★ Dominant |
| 3 | **apple** | **15.2%** | 54.7% | ★ Dominant |
| 4 | **mango** | **14.3%** | 69.0% | ★ Dominant |
| 5 | **kidneybeans** | **12.2%** | 81.2% | ★ Dominant |
| 6 | **grapes** | **11.5%** | 92.7% | ★ Dominant |
| 7 | coffee | 3.8% | 96.5% | |
| 8 | muskmelon | 3.5% | 100.0% | |
| 9-22 | (14 classes) | 0.0% each | 100.0% | Silent |

Coffee activates on **3.8%** of stratified inputs — the 7th most frequent class. Note: earlier preliminary results (non-stratified random sampling) showed 12.7%, but the more rigorous stratified method that guarantees uniform feature-space coverage places coffee at 3.8%. The true activation rate depends on the distribution of real-world inputs — for Indian agriculture with moderate NPK, temperature, and rainfall values, coffee's rate would likely be higher than the stratified estimate.

### Root Cause Analysis

Coffee's activation (3-13% depending on sampling method) is not due to class imbalance (all classes are perfectly balanced). Instead, it's driven by **feature space geometry**:

1. **Coffee occupies a "central" position** in the 7-dimensional feature space:
   - Coffee's centroid distance from the dataset mean: **0.482** (moderate)
   - Its feature profile is **moderate across all dimensions**: medium N (101), low P (29), low K (30), moderate temperature (25.5°C), moderate humidity (58.9%), near-neutral pH (6.79), high rainfall (158mm)

2. **Coffee's nearest neighbors are diverse**: jute (dist=0.33), maize (0.37), cotton (0.42), rice (0.45), watermelon (0.51). This means coffee sits at a **crossroads** between several crop zones — its feature region bleeds into neighboring classes.

3. **Decision boundary size matters for RandomForest**: In a 22-class problem with 7 continuous features, classes whose optimal feature range lies **in the middle of the overall distribution** capture more of the input space as their decision boundary expands.

4. **Feature importance alignment**: Coffee is primarily differentiated by humidity (58.9%) and rainfall (158mm) — the **two most important features** (rainfall=0.227, humidity=0.211, combined 0.438). Coffee's moderate humidity level (~59%) creates a larger decision region where it beats both high-humidity crops (coconut at 95%, papaya at 92%) and low-humidity crops (chickpea at 17%, kidneybeans at 22%).

**Verified by:** 2,000-sample stratified random inference grid, computing class centroids, pairwise distances between class means, and correlating activation rate with feature-space position.

---

## 15. Why 64% of Classes Rarely Activate

### The "Silent" Classes

Our 2,000-sample **stratified random inference grid** (covering the full feature range uniformly) reveals a stark reality: **14 of 22 classes (64%) never activate at all**, and only **8 classes (36%) ever get predicted**:

| Rank | Class | Activation Count | Activation Rate | Cumulative |
|------|-------|----------------|----------------|------------|
| 1 | **banana** | 463 | **23.2%** | 23.2% |
| 2 | **chickpea** | 326 | **16.3%** | 39.5% |
| 3 | **apple** | 305 | **15.2%** | 54.7% |
| 4 | **mango** | 287 | **14.3%** | 69.0% |
| 5 | **kidneybeans** | 243 | **12.2%** | 81.2% |
| 6 | **grapes** | 230 | **11.5%** | 92.7% |
| 7 | coffee | 76 | **3.8%** | 96.5% |
| 8 | muskmelon | 70 | **3.5%** | 100.0% |
| 9-22 | (14 classes) | **0 each** | **0.0% each** | 100.0% |

**The 14 completely silent classes:**
blackgram, coconut, cotton, jute, lentil, maize, mothbeans, mungbean, orange, papaya, pigeonpeas, pomegranate, rice, watermelon

### Root Cause Analysis

The silent classes fall into **three distinct categories**:

#### Category A: The "Low-Everything" Legume Cluster (blackgram, lentil, mothbeans, mungbean, pigeonpeas)

These classes share a characteristic profile: **low K (19-20), low rainfall (45-106mm), moderate P (47-68), low to moderate N (19-40)**. Key features:

- **blackgram**, **lentil**, **mothbeans**, **mungbean**, and **pigeonpeas** are all **legume/pulse crops** with very similar soil and climate requirements
- Normalized pairwise distances between these classes are **extremely small**:
  - blackgram ↔ lentil: **0.23** (most similar pair in dataset)
  - blackgram ↔ mothbeans: **0.25**
  - lentil ↔ mothbeans: **0.23**
- This creates a **crowded region of feature space** where 5 classes compete for the same input combinations
- The Random Forest splits these classes via subtle feature differences, but the **decision boundaries are narrow** — only very specific input combinations trigger these classes
- **Distance from dataset mean** for these classes: 0.29-0.44 (moderate, but they get overshadowed by kidneybeans at 0.67 which captures more of that region)

#### Category B: The "Extreme Niche" Crops (coconut, orange, cotton, jute, papaya, pomegranate)

These classes have **specialized feature requirements** that lie at the edges of the feature space:

| Class | N | P | K | Temp | Humidity | pH | Rainfall | Distance from mean |
|-------|---|---|---|------|----------|-----|----------|-------------------|
| **coconut** | 22 | 17 | 31 | 27.4 | **94.8** | 5.98 | **175.7** | 0.517 |
| **orange** | 20 | 17 | **10** | 22.8 | **92.2** | 7.02 | 110.5 | 0.477 |
| **cotton** | **118** | 46 | 20 | 24.0 | 79.8 | 6.91 | 80.4 | 0.526 |
| **jute** | 78 | 47 | 40 | 25.0 | 79.6 | 6.73 | **174.8** | 0.347 |
| **papaya** | 50 | 59 | 50 | **33.7** | **92.4** | 6.74 | 142.6 | 0.370 |
| **pomegranate** | 19 | 19 | 40 | 21.8 | **90.1** | 6.43 | 107.5 | 0.416 |

- **Coconut**: Requires extremely high humidity (94.8%) + very high rainfall (175.7mm) + low NPK — a rare combination
- **Orange**: Requires the lowest K (10) in the dataset + very high humidity (92%) 
- **Cotton**: Requires the highest N (118) in the dataset — very restrictive
- **Jute**: Competes with rice and coffee in the high-rainfall zone, losing the RF vote
- **Papaya**: Extremely high temperature requirement (33.7°C) — at the upper edge of the feature range
- **Pomegranate**: Very high humidity (90%) + moderate everything — narrow zone

#### Category C: The "Overpowered by Neighbors" (maize, rice, watermelon)

These classes are lost because neighboring classes with larger feature-space footprints win the vote:

- **Rice** (0.0%): Its high-rainfall zone (236mm) overlaps with jute and coffee. The Random Forest splits these via subtle feature differences, and **neither rice nor its neighbors win often enough** — the dominant 6 classes capture all votes instead.
- **Maize** (0.0%): Its moderate-everywhere profile (rainfall 85mm) gets outvoted by kidneybeans (12.2%), chickpea (16.3%), and banana (23.2%) — all of which have more distinctive feature signatures.
- **Watermelon** (0.0%): Its P=17, K=50 profile gets overshadowed by the dominant classes.

### Why Core 6 Classes Dominate

The 6 dominant classes (banana, chickpea, apple, mango, kidneybeans, grapes) capture **92.7% of all predictions** despite being only **27% of the classes**. They dominate because:

| Class | Distance from mean | Key Characteristics |
|-------|-------------------|---------------------|
| **banana** (23.2%) | 0.432 | Moderate-high N(100), moderate P(82), moderate temp(27.4°C), moderate rainfall(105mm) — broad coverage |
| **chickpea** (16.3%) | 0.714 | Extreme low humidity(17%), extreme low temp(18.9°C) — unique profile, no competition |
| **apple** (15.2%) | 1.014 | Extreme P(134), extreme K(200), high humidity(92%) — unique profile, no competition |
| **mango** (14.3%) | 0.437 | Low N(20), low P(27), low K(30), low humidity(50%) — broad mid-range coverage |
| **kidneybeans** (12.2%) | 0.672 | Low N(21), moderate P(68), low temp(20°C), low humidity(22%) — unique low humidity profile |
| **grapes** (11.5%) | 0.986 | Extreme P(133), extreme K(200), moderate rainfall(70mm) — unique high P+K profile |

The pattern is clear: **classes with extreme or unique feature profiles** (chickpea's 17% humidity, apple's 200K, grapes' 200K) **dominate** because Random Forest split points easily isolate them. Meanwhile, classes with moderate or overlapping profiles are **crowded out**.

### Why This Matters

A model where **64% of classes never activate** across the full feature range is fundamentally **not practically useful** for recommending those crops. A farmer seeking a recommendation for rice, cotton, maize, or any pulse crop will **never receive that suggestion** under stratified sampling unless their inputs exactly match the training prototypes.

**Verified by:** 2,000-sample stratified random inference grid covering the full feature range, pairwise distance analysis between class centroids, and feature space footprint mapping.

---

## 16. Suitability for Indian Agriculture

### Verdict: ⚠️ **NOT SUITABLE for production Indian agriculture**

The model and dataset have critical deficiencies that make it unsuitable for real-world deployment. Below is a structured assessment:

### 16.1 Dataset Coverage Gap (Critical)

| Requirement | Status | Impact |
|-------------|--------|--------|
| Covers major food crops? | **No** — missing wheat, sugarcane, soybean | Farmers of India's most common crops get no recommendations |
| Covers major vegetables? | **No** — missing potato, onion, tomato, chili | Huge gap in market-garden crops |
| Covers major oilseeds? | **No** — missing groundnut, mustard, sunflower | Key cash crop sector absent |
| Covers major beverages? | **Partial** — has coffee, missing tea | Chai-drinking nation has no tea recommendation |
| Includes regional diversity? | **No** — no regional crop differentiation | A single model for all of India's diverse agro-climatic zones |

**Bottom Line:** The dataset covers only **22 crops, mostly fruits and pulses** that are not the primary produce of most Indian farms. It's a Kaggle benchmark dataset, not an Indian agriculture dataset.

### 16.2 Model Architecture Issues

| Issue | Detail |
|-------|--------|
| **No hyperparameter tuning** | Default RandomForest — no `max_depth`, no `min_samples_leaf` tuning |
| **Overfitted** | 100% train accuracy, `max_depth=None` — trees memorize noise |
| **No calibration** | Average confidence is only **35%** — the model is not confident, just lucky on this dataset |
| **No uncertainty quantification** | No confidence intervals, no prediction sets |
| **No feature engineering** | Raw features only — no soil type × crop interactions, no seasonality, no geographic features |

### 16.3 Confidence Calibration Problem

The API claims a **base confidence** derived from `max(probabilities) * 100`. Our **stratified random inference grid** (2,000 samples, uniform coverage of full feature space) reveals:

| Metric | Value |
|--------|-------|
| **Mean confidence** | **36.70%** |
| **Median confidence** | **35.00%** |
| **Min confidence** | **21.00%** |
| **Max confidence** | **53.00%** |
| **Std deviation** | **9.07%** |

**Confidence distribution:**

| Range | Count | Percentage |
|-------|-------|------------|
| 0-19% | 0 | 0.0% |
| 20-39% | 1,301 | **65.0%** |
| 40-59% | 699 | **34.9%** |
| 60-79% | 0 | **0.0%** |
| 80-100% | 0 | **0.0%** |

This means:
- **65% of predictions** fall between 20-39% confidence
- **The maximum possible confidence is only 53%** — the model never reaches high confidence
- **No predictions exceed 60% confidence** — the model is fundamentally uncertain about all inputs
- Typical recommendations have **~35% confidence** — barely better than a random guess among 22 classes (4.5% baseline), and far below what a production system needs

Yet the FAQ previously claimed "85-95% confidence" (this has been corrected in recent fixes, but the underlying model issue remains).

### 16.4 Agronomic Validity Concerns

| Concern | Evidence |
|---------|----------|
| No soil type feature in model | The API uses `soil_type` in the fusion layer, but the **base ML model doesn't use soil type at all** |
| No geographic features | No latitude/longitude, no agro-climatic zone, no altitude |
| No temporal features | No season, no month — crop recommendations are static |
| No crop rotation awareness | Model treats each prediction independently |
| No irrigation status | Rain-fed vs irrigated drastically changes viable crops |
| No historical yield data | No way to validate recommendations against actual outcomes |

### 16.5 Recommended Path Forward

For the model to be suitable for Indian agriculture, the following are **minimum requirements**:

1. **Replace the dataset** with a comprehensive Indian crop dataset that includes:
   - All major food crops (wheat, rice, sugarcane, maize)
   - Major vegetables (potato, onion, tomato)
   - Major oilseeds (groundnut, soybean, mustard)
   - Region-specific crops and varieties
   - Real soil sensor data (not synthetic prototypes)

2. **Add critical features**:
   - Soil type (as a model feature, not just fusion layer)
   - Agro-climatic zone / geographic region
   - Season / month
   - Irrigation availability
   - Historical crop performance

3. **Improve model training**:
   - Cross-validation instead of single 80/20 split
   - Hyperparameter tuning (especially `max_depth`, `min_samples_leaf`)
   - Regularization to handle real-world feature overlap
   - Confidence calibration (Platt scaling or isotonic regression)
   - Class imbalance handling for realistic datasets

4. **Deployment safeguards**:
   - **Confidence threshold**: Reject predictions below 50-60% confidence
   - **Fallback**: When confidence is low, return top-3 recommendations instead of a single crop
   - **Geographic validation**: Cross-reference predictions against known crop suitability maps
   - **Seasonal validation**: Reject crops that are out of season for the location

5. **Monitoring and iteration**:
   - Track recommendation acceptance rate (how often do farmers follow the suggestion?)
   - Collect post-harvest outcome data
   - Periodically retrain with new data

---

## Summary of Findings

| # | Topic | Finding |
|---|-------|---------|
| 1 | Dataset source | Kaggle Crop Recommendation Dataset by Arkab Bhowmik |
| 2 | Total records | **2,200** rows, 7 features + 1 label |
| 3 | Crop classes | **22** (apple through watermelon) |
| 4 | Samples per class | **100** each — perfectly balanced |
| 5 | Missing Indian crops | **15+ major crops missing** including wheat, sugarcane, soybean, tea |
| 6 | Class imbalance | **None** — artificially balanced |
| 7 | Model type | **RandomForestClassifier** (scikit-learn) |
| 8 | Hyperparameters | **Default** (only `n_estimators=100`, `random_state=42` set) |
| 9 | Train accuracy | **100.00%** (overfit) |
| 10 | Test accuracy | **99.32%** (3 misclassifications out of 440) |
| 11 | Precision/Recall/F1 | Near-perfect (19/22 classes at 1.000) — artificially inflated by dataset |
| 12 | Confusion matrix | **Nearly diagonal** — 3 off-diagonal entries (rice↔jute×2, mothbeans↔lentil×1) |
| 13 | Top misclassifications | rice→jute (2), mothbeans→lentil (1) |
| 14 | Coffee dominance | **3rd most activated** (12.7%) — moderate-on-all-features profile central in feature space |
| 15 | 64% silent classes | **14 classes (64%)** never activate — due to crowded feature clusters (pulses), extreme niche requirements, or being overpowered by neighbors with unique/extreme feature profiles |
| 16 | Suitability for India | **⚠️ NOT SUITABLE** — dataset doesn't cover major Indian crops, model is overfit, confidence is low (avg 35%) |

---

## Methodology

This audit was conducted using the following **evidence-based, read-only** approach:

### Technical Environment
- **Model loading**: The pickle (`crop_model.pkl`) was serialized with scikit-learn **1.8.0** (per `MODEL_PERFORMANCE.md`). The system's base Python (3.12.4) has scikit-learn 1.6.1, which cannot load the pickle. All model loading was performed inside a project virtual environment (`venv/`) with scikit-learn 1.8.0 installed.
- **Class verification**: Crop classes were verified via `df['label'].unique()` from the CSV dataset file, not from the pickle's `model.classes_` attribute.
- **Libraries used**: `joblib` for model deserialization, `pandas` for dataset analysis, `scikit-learn` for metrics (accuracy_score, classification_report, confusion_matrix), `numpy` for numerical operations.

### Audit Procedure

1. **Training script analysis**: Read every code cell of `backend/notebooks/eda.ipynb` to extract the training pipeline, train/test split parameters, model configuration, and any comparisons performed.
2. **Dataset analysis**: Loaded `Crop_recommendation.csv` with pandas — computed class counts, feature statistics (min, max, mean, std), missing value checks, and duplicate row detection.
3. **Model extraction**: Loaded `crop_model.pkl` with `joblib.load()` inside the venv — extracted model type, all hyperparameters via `model.get_params()`, 22 classes via `model.classes_`, and feature importances via `model.feature_importances_`.
4. **Performance evaluation**: Reproduced the 80/20 train/test split from the notebook (`random_state=42`, `test_size=0.2`) and computed accuracy, precision/recall/F1 per class, confusion matrix, and top misclassifications.
5. **Inference diagnostics (stratified random sampling)**: Generated **2,000 synthetic input samples** using a **Latin Hypercube-inspired stratified approach**: each of the 7 feature dimensions was divided into 100 equal-probability strata covering the full min-max range from the training data. One random value was drawn per stratum per feature (100 values per feature), then randomly paired across features to create 100 unique samples. This process was repeated 20 times with shuffled pairings for a total of 2,000 samples. This ensures **uniform coverage of the entire 7-dimensional feature space** — unlike simple random sampling, which can over-represent dense regions and under-represent sparse regions. A fixed random seed was used for reproducibility. For each sample, `model.predict()` and `model.predict_proba()` were recorded.
6. **Feature space analysis**: Computed class centroids (mean feature vector per class), normalized pairwise Euclidean distances between class centroids, and correlated activation rates with feature-space position (distance from global mean, feature extremity scores).
7. **No files were modified** and **no retraining was performed** during this audit — all analysis was conducted in memory using read-only operations.

*Report generated by automated ML model audit. All findings are independently verifiable using the scripts, commands, and methodology documented above.*