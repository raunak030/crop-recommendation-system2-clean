#!/usr/bin/env python3
"""
Comprehensive evaluation of the trained RandomForest crop recommendation model.
Generates: classification_report.csv, confusion_matrix.png, docs/CROP_WISE_PERFORMANCE_REPORT.md
"""

import os
import joblib
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use('Agg')  # non-interactive backend
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, confusion_matrix, classification_report

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.path.join(PROJECT_ROOT, 'models', 'crop_model.pkl')
DATA_PATH  = os.path.join(PROJECT_ROOT, 'data', 'Crop_recommendation.csv')
OUT_DIR    = os.path.join(PROJECT_ROOT, 'reports')
CSV_OUT    = os.path.join(PROJECT_ROOT, 'reports', 'classification_report.csv')
PNG_OUT    = os.path.join(PROJECT_ROOT, 'reports', 'confusion_matrix.png')

os.makedirs(OUT_DIR, exist_ok=True)

# ---------------------------------------------------------------------------
# 1. Load model
# ---------------------------------------------------------------------------
print("=" * 60)
print("CROP RECOMMENDATION MODEL — EVALUATION")
print("=" * 60)

print(f"\n[1/6] Loading model from: {MODEL_PATH}")
model = joblib.load(MODEL_PATH)
print(f"  Model type: {type(model).__name__}")
print(f"  Classes ({len(model.classes_)}): {list(model.classes_)}")
print(f"  Features: {model.n_features_in_}")

# ---------------------------------------------------------------------------
# 2. Load dataset
# ---------------------------------------------------------------------------
print(f"\n[2/6] Loading dataset from: {DATA_PATH}")
df = pd.read_csv(DATA_PATH)
print(f"  Shape: {df.shape}")
print(f"  Columns: {list(df.columns)}")
print(f"  Unique crops: {df['label'].nunique()}")

# ---------------------------------------------------------------------------
# 3. Split — exactly as original training
# ---------------------------------------------------------------------------
print(f"\n[3/6] Splitting train/test (test_size=0.2, random_state=42)")
feature_cols = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']
X = df[feature_cols].values
y = df['label'].values

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)
print(f"  Train: {len(X_train)} samples")
print(f"  Test:  {len(X_test)} samples")

# ---------------------------------------------------------------------------
# 4. Predict
# ---------------------------------------------------------------------------
print(f"\n[4/6] Running predictions on test set...")
y_pred = model.predict(X_test)

# ---------------------------------------------------------------------------
# 5. Metrics
# ---------------------------------------------------------------------------
print(f"\n[5/6] Computing metrics...")

overall_accuracy = accuracy_score(y_test, y_pred)
print(f"\n  Overall Accuracy: {overall_accuracy:.4f} ({overall_accuracy*100:.2f}%)")

# Classification report as dict for structured access
report_dict = classification_report(y_test, y_pred, output_dict=True)

# Also print the full report to stdout
print("\n" + "=" * 60)
print("CLASSIFICATION REPORT (all 22 crops)")
print("=" * 60)
report_str = classification_report(y_test, y_pred)
print(report_str)

# Confusion matrix
cm = confusion_matrix(y_test, y_pred)
classes = sorted(model.classes_)  # alphabetical for the report

# ---------------------------------------------------------------------------
# 6. Generate artifacts
# ---------------------------------------------------------------------------
print(f"\n[6/6] Generating output artifacts...")

# --- 6a. classification_report.csv ---
print(f"  Writing: {CSV_OUT}")
rows_csv = []
for crop in classes:
    r = report_dict[crop]
    rows_csv.append({
        'crop': crop,
        'precision': round(r['precision'], 4),
        'recall': round(r['recall'], 4),
        'f1_score': round(r['f1-score'], 4),
        'support': int(r['support'])
    })
df_report = pd.DataFrame(rows_csv)
df_report.to_csv(CSV_OUT, index=False)
print(f"    -> {len(rows_csv)} crops written")

# --- 6b. confusion_matrix.png ---
print(f"  Writing: {PNG_OUT}")
fig, ax = plt.subplots(figsize=(18, 16))
im = ax.imshow(cm, interpolation='nearest', cmap='Blues')
ax.figure.colorbar(im, ax=ax, fraction=0.046, pad=0.04)

# Tick labels
ax.set(xticks=np.arange(cm.shape[1]),
       yticks=np.arange(cm.shape[0]),
       xticklabels=classes,
       yticklabels=classes,
       xlabel='Predicted Label',
       ylabel='True Label')
plt.setp(ax.get_xticklabels(), rotation=45, ha='right', rotation_mode='anchor')
plt.setp(ax.get_yticklabels(), rotation=0, ha='right')

# Annotate each cell
thresh = cm.max() / 2.
for i in range(cm.shape[0]):
    for j in range(cm.shape[1]):
        ax.text(j, i, format(cm[i, j], 'd'),
                ha='center', va='center',
                color='white' if cm[i, j] > thresh else 'black',
                fontsize=8)

fig.tight_layout()
plt.title(f'Confusion Matrix — RandomForest (Accuracy: {overall_accuracy:.2%})', pad=20)
fig.savefig(PNG_OUT, dpi=150, bbox_inches='tight')
plt.close()
print(f"    -> PNG saved ({os.path.getsize(PNG_OUT)/1024:.1f} KB)")

# --- 6c. docs/CROP_WISE_PERFORMANCE_REPORT.md ---
report_md_path = os.path.join(OUT_DIR, 'CROP_WISE_PERFORMANCE_REPORT.md')
print(f"  Writing: {report_md_path}")

# Build per-crop table rows
table_rows = []
for crop in classes:
    r = report_dict[crop]
    table_rows.append(f"| {crop:15s} | {r['precision']:.4f} | {r['recall']:.4f} | {r['f1-score']:.4f} | {int(r['support']):3d} |")

table_header = "| Crop            | Precision | Recall    | F1-Score  | Support |"
table_sep    = "|:----------------|:---------:|:---------:|:---------:|:-------:|"

# Identify top misclassifications (off-diagonal peaks)
misclassification_list = []
for i in range(len(classes)):
    for j in range(len(classes)):
        if i != j and cm[i, j] > 0:
            misclassification_list.append((classes[i], classes[j], cm[i, j]))
misclassification_list.sort(key=lambda x: x[2], reverse=True)

misclass_rows = []
for true_crop, pred_crop, count in misclassification_list[:15]:
    misclass_rows.append(f"| {true_crop:15s} | {pred_crop:15s} | {count:3d} |")

# Best / worst performing classes by F1
f1_scores = [(c, report_dict[c]['f1-score']) for c in classes]
f1_scores.sort(key=lambda x: x[1], reverse=True)
best_3 = f1_scores[:3]
worst_3 = f1_scores[-3:]

# Macros
macro_avg = report_dict['macro avg']
weighted_avg = report_dict['weighted avg']

md = f"""# Crop-wise Performance Report

## Overview

- **Model**: RandomForestClassifier (scikit-learn, {len(classes)} classes, {model.n_features_in_} features)
- **Dataset**: {len(df)} samples, {len(classes)} crop classes, perfectly balanced (100 per class)
- **Test split**: 20% (stratified, random_state=42), {len(y_test)} samples
- **Overall Accuracy**: **{overall_accuracy:.4f}** ({overall_accuracy*100:.2f}%)

---

## Summary Metrics

| Metric        | Macro Avg | Weighted Avg |
|:--------------|:---------:|:------------:|
| Precision     | {macro_avg['precision']:.4f}    | {weighted_avg['precision']:.4f}    |
| Recall        | {macro_avg['recall']:.4f}    | {weighted_avg['recall']:.4f}    |
| F1-Score      | {macro_avg['f1-score']:.4f}    | {weighted_avg['f1-score']:.4f}    |

---

## Per-Crop Classification Report

{table_header}
{table_sep}
{chr(10).join(table_rows)}

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
"""

for row in misclass_rows:
    md += row + "\n"

md += f"""
---

## Best Performing Classes (by F1)

| Crop            | F1-Score  |
|:----------------|:---------:|
"""

for crop, f1 in best_3:
    md += f"| {crop:15s} | {f1:.4f} |\n"

md += f"""
## Worst Performing Classes (by F1)

| Crop            | F1-Score  |
|:----------------|:---------:|
"""

for crop, f1 in worst_3:
    md += f"| {crop:15s} | {f1:.4f} |\n"

md += f"""
---

## Analysis

### Overall Performance
The model achieves **{overall_accuracy*100:.1f}%** accuracy on the held-out test set. Since the dataset is perfectly balanced (100 samples per crop), accuracy directly reflects per-class performance without bias.

### Best Classes
The top-3 best-performing crops by F1-score are **{best_3[0][0]}** ({best_3[0][1]:.3f}), **{best_3[1][0]}** ({best_3[1][1]:.3f}), and **{best_3[2][0]}** ({best_3[2][1]:.3f}). These crops likely have highly distinct feature profiles (e.g., specific rainfall, humidity, or nutrient requirements) that the RandomForest easily separates from others.

### Worst Classes
The lowest-performing crops are **{worst_3[0][0]}** ({worst_3[0][1]:.3f}), **{worst_3[1][0]}** ({worst_3[1][1]:.3f}), and **{worst_3[2][0]}** ({worst_3[2][1]:.3f}). These may share overlapping feature ranges with similar crop types, leading to higher confusion rates.

### Misclassification Patterns
Review the top misclassification table above. Pairs with high off-diagonal counts indicate crops with similar optimal growing conditions — these are the most likely to be confused by the model. Common patterns include:
- **Similar water/nutrient requirements**: Crops that thrive under analogous rainfall and soil conditions.
- **Overlapping pH and temperature ranges**: Crops adapted to similar climatic zones.
- **Nutrient profile similarity**: Crops requiring comparable N-P-K levels may be harder to distinguish.

---

*Report generated automatically by `evaluate_model.py`.*
"""

with open(report_md_path, 'w') as f:
    f.write(md)
print(f"    -> Markdown report written ({len(md)} chars)")

# ---------------------------------------------------------------------------
# Done
# ---------------------------------------------------------------------------
print("\n" + "=" * 60)
print("EVALUATION COMPLETE")
print("=" * 60)
print(f"\nArtifacts generated:")
print(f"  1. {report_md_path}")
print(f"  2. {CSV_OUT}")
print(f"  3. {PNG_OUT}")