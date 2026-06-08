# Model Performance Report

## Overview

| Attribute | Detail |
|-----------|--------|
| **Model** | RandomForestClassifier (scikit-learn 1.8.0) |
| **Dataset** | `Crop_recommendation.csv` — 2,200 samples |
| **Crops** | 22 crop classes (100 samples each) |
| **Features** | 7 soil/weather parameters |
| **Samples per crop** | 100 (balanced) |
| **Train/Test Split** | 80/20 stratified |
| **Test Accuracy** | 100% |

## Features

| # | Feature | Description |
|---|---------|-------------|
| 1 | N | Nitrogen content (kg/ha) |
| 2 | P | Phosphorus content (kg/ha) |
| 3 | K | Potassium content (kg/ha) |
| 4 | temperature | Temperature (°C) |
| 5 | humidity | Relative humidity (%) |
| 6 | ph | Soil pH |
| 7 | rainfall | Rainfall (mm) |

## Classification Report

All 22 crops achieve **precision = 1.00, recall = 1.00, f1-score = 1.00** on the test set.

| Crop | Precision | Recall | F1-Score | Support |
|------|-----------|--------|----------|---------|
| Apple | 1.00 | 1.00 | 1.00 | 20 |
| Banana | 1.00 | 1.00 | 1.00 | 20 |
| Blackgram | 1.00 | 1.00 | 1.00 | 20 |
| Chickpea | 1.00 | 1.00 | 1.00 | 20 |
| Coconut | 1.00 | 1.00 | 1.00 | 20 |
| Coffee | 1.00 | 1.00 | 1.00 | 20 |
| Cotton | 1.00 | 1.00 | 1.00 | 20 |
| Grapes | 1.00 | 1.00 | 1.00 | 20 |
| Jute | 1.00 | 1.00 | 1.00 | 20 |
| Kidneybeans | 1.00 | 1.00 | 1.00 | 20 |
| Lentil | 1.00 | 1.00 | 1.00 | 20 |
| Maize | 1.00 | 1.00 | 1.00 | 20 |
| Mango | 1.00 | 1.00 | 1.00 | 20 |
| Mothbeans | 1.00 | 1.00 | 1.00 | 20 |
| Mungbean | 1.00 | 1.00 | 1.00 | 20 |
| Muskmelon | 1.00 | 1.00 | 1.00 | 20 |
| Orange | 1.00 | 1.00 | 1.00 | 20 |
| Papaya | 1.00 | 1.00 | 1.00 | 20 |
| Pigeonpeas | 1.00 | 1.00 | 1.00 | 20 |
| Pomegranate | 1.00 | 1.00 | 1.00 | 20 |
| Rice | 1.00 | 1.00 | 1.00 | 20 |
| Watermelon | 1.00 | 1.00 | 1.00 | 20 |
| **Macro avg** | **1.00** | **1.00** | **1.00** | **440** |
| **Weighted avg** | **1.00** | **1.00** | **1.00** | **440** |

## Confusion Matrix

The confusion matrix is a perfect **22×22 diagonal**, indicating zero misclassifications across all classes.

## Feature Importance

Feature importance (Gini importance from Random Forest):

| Rank | Feature | Importance |
|------|---------|-----------|
| 1 | rainfall | 0.2270 |
| 2 | humidity | 0.2113 |
| 3 | K | 0.1812 |
| 4 | P | 0.1436 |
| 5 | N | 0.1089 |
| 6 | temperature | 0.0757 |
| 7 | ph | 0.0523 |

Rainfall and humidity are the most influential features, together accounting for ~44% of the model's decisions.

## Important Caveat: 100% Accuracy

The **100% test accuracy** is a reflection of the dataset's structure rather than the model's generalisation ability in real-world conditions. Observations:

1. **Synthetic / clean dataset**: The feature values for each crop cluster tightly with negligible overlap between classes, making the classification problem artificially easy for a Random Forest.

2. **22 distinct patterns**: Each crop has a distinct signature in the 7-dimensional feature space. In real agricultural data, NPK values vary widely based on soil type, fertilisation history, crop rotation, and local conditions — creating overlap between crop classes.

3. **No measurement noise**: Real soil sensors and weather stations introduce variance that blurs class boundaries.

4. **Small balanced samples**: 100 identical-pattern samples per crop provide insufficient challenge (each pattern is essentially the same with minor Gaussian noise).

## Recommendation

For a more informative evaluation:

1. **Cross-validation**: Use stratified k-fold (k=5 or 10) to obtain confidence intervals on accuracy rather than a single train/test split.

2. **Noise injection**: Add realistic sensor noise (±5–10%) to features to simulate real-world measurement variance.

3. **External validation**: Test on independent field-measured soil data from diverse geographic regions.

4. **Calibration analysis**: For the confidence scores used in the weighted fusion pipeline, evaluate probability calibration (Brier score, reliability diagrams) rather than just accuracy.

5. **Real-world pilot**: Deploy the recommendation system in a small region with ground-truth crop maps to measure actual recommendation accuracy.

## Running the Evaluation

To reproduce this report:

```bash
cd backend
python3 -c "
import pandas as pd, joblib
from sklearn.metrics import classification_report, accuracy_score
from sklearn.model_selection import train_test_split

df = pd.read_csv('data/Crop_recommendation.csv')
X, y = df.drop('label', axis=1), df['label']
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

model = joblib.load('models/crop_model.pkl')
preds = model.predict(X_test)
print('Accuracy:', accuracy_score(y_test, preds))
print(classification_report(y_test, preds))
"
```