# dataaugmentation

This project explores the use of transformer-based architectures for forecasting PM2.5 concentrations in major urban areas. It aims to improve air quality prediction by applying data augmentation techniques and evaluating their effect on high-value pollution events. The work builds on satellite and meteorological data and incorporates machine learning to provide more accurate and actionable forecasts.

# features

Multistep prediction of PM2.5 concentrations across 3 major U.S. cities

Transformer architecture tailored for spatiotemporal data

Data augmentation techniques (e.g., random undersampling, cluster-based sampling)

Evaluation across RMSE, MAE, and R² for full and high-value samples

Cross-validation and bias analysis

Visualization of predicted vs. actual PM2.5 levels

# dependencies

Python 3.8+

PyTorch

scikit-learn

pandas

numpy

matplotlib

seaborn

# how to run

GPU: 2 Nvidia RTX A6000

# limitations

Currently limited to NYC, Philadelphia, and Washington D.C.

Model performance may degrade when applied to unseen regions without retraining

Bias may be introduced from sampling techniques or incomplete satellite data

