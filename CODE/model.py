import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from xgboost import XGBRegressor
import torch
import torch.nn as nn
from sklearn.metrics import r2_score

class SimpleNN(nn.Module):
    def __init__(self, input_size):
        super(SimpleNN, self).__init__()
        self.fc1 = nn.Linear(input_size, 16)
        self.fc2 = nn.Linear(16, 1)

    def forward(self, x):
        x = torch.relu(self.fc1(x))
        x = self.fc2(x)
        return x

def train_and_evaluate_models(df, predictors, target, model_type, cutoff_thresholds, partial_ratios):
    X = df[predictors].values
    y = df[target].values

    results = []

    for cutoff in cutoff_thresholds:
        for ratio in partial_ratios:
            X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

            if model_type == "random_forest":
                model = RandomForestRegressor(n_jobs=1)
                model.fit(X_train, y_train)
                y_pred = model.predict(X_test)

            elif model_type == "xgboost":
                model = XGBRegressor(n_jobs=1)
                model.fit(X_train, y_train)
                y_pred = model.predict(X_test)

            elif model_type == "neural_network":
                model = SimpleNN(X.shape[1])
                criterion = nn.MSELoss()
                optimizer = torch.optim.Adam(model.parameters(), lr=0.01)
                X_train_tensor = torch.tensor(X_train, dtype=torch.float32)
                y_train_tensor = torch.tensor(y_train, dtype=torch.float32).view(-1, 1)

                for epoch in range(200):
                    model.train()
                    optimizer.zero_grad()
                    outputs = model(X_train_tensor)
                    loss = criterion(outputs, y_train_tensor)
                    loss.backward()
                    optimizer.step()

                model.eval()
                X_test_tensor = torch.tensor(X_test, dtype=torch.float32)
                y_pred = model(X_test_tensor).detach().numpy().flatten()

            else:
                raise ValueError("Invalid model_type")

            score = r2_score(y_test, y_pred)
            results.append({
                "cutoff": cutoff,
                "ratio": ratio,
                "r2_score": round(score, 4)
            })

    return results
