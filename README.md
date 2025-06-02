# data augmentation techniques for improved pm2.5 forecasting using transformer architectures

Exposure to fine particulate matter with diameter less than 2.5 µm (PM2.5) significantly increases an individual’s risk of cardiovascular and respiratory disease. As climate change progresses, extreme events, including wildfires, are projected to increase, exacerbating air pollution. However, models often struggle to capture extreme pollution events since high PM2.5 is rare in training data. To this end, we employed cluster-based undersampling and trained Transformer models for improving extreme event prediction with various cutoff thresholds (12.1 µg/m3 and 35.5 µg/m3) and partial sampling ratios (10/90, 20/80, 30/70, 40/60, 50/50). Our results show that the 35.5 µg/m3 threshold in conjunction with the 20/80 partial sampling ratio yielded the most optimal performance, with an RMSE of 2.128, MAE of 1.418, and R2 of 0.935, and that it performed well for the prediction of high PM2.5 events. Models trained on resampled data generally performed better than models trained on original data which shows the importance of resampling strategies for increasing the accuracy of air quality prediction for high-pollution levels. These findings provide crucial input to the optimization of air quality forecast models for better prediction of extreme pollution events. Through the enhancement of the ability to predict high concentrations of PM2.5, this study is assisting in the development of more effective public health and environmental policy to mitigate the impacts of air pollution and the mounting dangers of climate change-driven wildfires.

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

GPU needed: 2 Nvidia RTX A6000

CITY_DATA: preprocesses data from satelites and formats it for model training
TRANSFORMER: includes all functions for transformer model and model training
RESULTS: plots results for easier audience viewing and comprehension

air-quality-app: run run_pipeline.sh file to download all dependies and launch local website for easy data augmentation and simple model training functions

# limitations

Currently limited to NYC, Philadelphia, and Washington D.C.

Model performance may degrade when applied to unseen regions without retraining

Bias may be introduced from sampling techniques or incomplete satellite data

