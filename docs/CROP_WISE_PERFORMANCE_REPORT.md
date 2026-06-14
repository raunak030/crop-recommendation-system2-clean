# Crop-wise Performance Report

## Overview

- **Model**: RandomForestClassifier (scikit-learn, 22 classes, 7 features)
- **Dataset**: 2200 samples, 22 crop classes, perfectly balanced (100 per class)
- **Test split**: 20% (stratified, random_state=42), 440 samples
- **Overall Accuracy**: **1.0000** (100.00%)

---

## Summary Metrics

| Metric        | Macro Avg | Weighted Avg |
|:--------------|:---------:|:------------:|
| Precision     | 1.0000    | 1.0000    |
| Recall        | 1.0000    | 1.0000    |
| F1-Score      | 1.0000    | 1.0000    |

---

## Per-Crop Classification Report

| Crop            | Precision | Recall    | F1-Score  | Support |
|:----------------|:---------:|:---------:|:---------:|:-------:|
| apple           | 1.0000 | 1.0000 | 1.0000 |  20 |
| banana          | 1.0000 | 1.0000 | 1.0000 |  20 |
| blackgram       | 1.0000 | 1.0000 | 1.0000 |  20 |
| chickpea        | 1.0000 | 1.0000 | 1.0000 |  20 |
| coconut         | 1.0000 | 1.0000 | 1.0000 |  20 |
| coffee          | 1.0000 | 1.0000 | 1.0000 |  20 |
| cotton          | 1.0000 | 1.0000 | 1.0000 |  20 |
| grapes          | 1.0000 | 1.0000 | 1.0000 |  20 |
| jute            | 1.0000 | 1.0000 | 1.0000 |  20 |
| kidneybeans     | 1.0000 | 1.0000 | 1.0000 |  20 |
| lentil          | 1.0000 | 1.0000 | 1.0000 |  20 |
| maize           | 1.0000 | 1.0000 | 1.0000 |  20 |
| mango           | 1.0000 | 1.0000 | 1.0000 |  20 |
| mothbeans       | 1.0000 | 1.0000 | 1.0000 |  20 |
| mungbean        | 1.0000 | 1.0000 | 1.0000 |  20 |
| muskmelon       | 1.0000 | 1.0000 | 1.0000 |  20 |
| orange          | 1.0000 | 1.0000 | 1.0000 |  20 |
| papaya          | 1.0000 | 1.0000 | 1.0000 |  20 |
| pigeonpeas      | 1.0000 | 1.0000 | 1.0000 |  20 |
| pomegranate     | 1.0000 | 1.0000 | 1.0000 |  20 |
| rice            | 1.0000 | 1.0000 | 1.0000 |  20 |
| watermelon      | 1.0000 | 1.0000 | 1.0000 |  20 |

---

## Confusion Matrix Observations

The confusion matrix heatmap is saved as `confusion_matrix.png` (22 × 22 grid, annotated values).

- **Diagonal dominance**: Most predictions fall on the diagonal, indicating strong class separation.
- **Off-diagonal peaks**: The most frequent misclassifications are listed in the next section.
- **Matrix sparsity**: Several class pairs have zero confusion, suggesting highly distinct feature profiles.

---

## Top Misclassifications

The following are the most frequent off-diagonal confusions (True → Predicted):

| True Label      | Predicted Label  | Count |
|:----------------|:-----------------|:-----:|

---

## Best Performing Classes (by F1)

| Crop            | F1-Score  |
|:----------------|:---------:|
| apple           | 1.0000 |
| banana          | 1.0000 |
| blackgram       | 1.0000 |

## Worst Performing Classes (by F1)

| Crop            | F1-Score  |
|:----------------|:---------:|
| pomegranate     | 1.0000 |
| rice            | 1.0000 |
| watermelon      | 1.0000 |

---

## Analysis

### Overall Performance
The model achieves **100.0%** accuracy on the held-out test set. Since the dataset is perfectly balanced (100 samples per crop), accuracy directly reflects per-class performance without bias.

### Best Classes
The top-3 best-performing crops by F1-score are **apple** (1.000), **banana** (1.000), and **blackgram** (1.000). These crops likely have highly distinct feature profiles (e.g., specific rainfall, humidity, or nutrient requirements) that the RandomForest easily separates from others.

### Worst Classes
The lowest-performing crops are **pomegranate** (1.000), **rice** (1.000), and **watermelon** (1.000). These may share overlapping feature ranges with similar crop types, leading to higher confusion rates.

### Misclassification Patterns
Review the top misclassification table above. Pairs with high off-diagonal counts indicate crops with similar optimal growing conditions — these are the most likely to be confused by the model. Common patterns include:
- **Similar water/nutrient requirements**: Crops that thrive under analogous rainfall and soil conditions.
- **Overlapping pH and temperature ranges**: Crops adapted to similar climatic zones.
- **Nutrient profile similarity**: Crops requiring comparable N-P-K levels may be harder to distinguish.

---

*Report generated automatically by `evaluate_model.py`.*
