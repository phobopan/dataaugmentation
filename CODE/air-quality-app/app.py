import os
import pandas as pd
import numpy as np
import json
from flask import Flask, request, jsonify, render_template
from werkzeug.utils import secure_filename
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns
from model import train_and_evaluate_models

app = Flask(__name__)

# Configure upload & plot folders
UPLOAD_FOLDER = "uploads"
PLOT_FOLDER = "static/plots"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(PLOT_FOLDER, exist_ok=True)

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

@app.route("/")
def home():
    """Serve the main HTML file"""
    return render_template("index.html")

@app.route("/upload", methods=["POST"])
def upload_file():
    """Handles CSV file upload"""
    if "file" not in request.files:
        return jsonify({"error": "No file part"})

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No selected file"})

    filename = secure_filename(file.filename)
    filepath = os.path.join(app.config["UPLOAD_FOLDER"], filename)
    file.save(filepath)

    df = pd.read_csv(filepath)
    columns = df.columns.tolist()

    return jsonify({"columns": columns, "filename": filename})

@app.route("/plot_distribution", methods=["POST"])
def plot_distribution():
    try:
        data = request.json
        filename = data["filename"]
        predictors = data["predictors"]

        filepath = os.path.join(app.config["UPLOAD_FOLDER"], filename)
        if not os.path.exists(filepath):
            return jsonify({"error": f"File {filename} not found."}), 400

        df = pd.read_csv(filepath)

        plots = {}
        for col in predictors:
            if col not in df.columns:
                continue  # skip bad columns

            # Only plot numeric columns
            if not pd.api.types.is_numeric_dtype(df[col]):
                continue

            plt.figure(figsize=(6, 4))
            sns.histplot(df[col].dropna(), bins=20, kde=True)
            plt.title(f"Distribution of {col}")

            plot_filename = f"{col}.png"
            plot_path = os.path.join("static/plots", plot_filename)
            plt.savefig(plot_path)
            plt.close()

            plots[col] = f"/static/plots/{plot_filename}"

        if not plots:
            return jsonify({"error": "No valid numeric predictors to plot."}), 400

        return jsonify({"plots": plots})

    except Exception as e:
        print(f"[ERROR] /plot_distribution failed: {e}")
        return jsonify({"error": str(e)}), 500
    
@app.route("/get_variable_range", methods=["POST"])
def get_variable_range():
    data = request.get_json()
    filename = data["filename"]
    variable = data["variable"]

    df = pd.read_csv(os.path.join("uploads", filename))
    series = df[variable].dropna()

    return jsonify({
        "min": float(series.min()),
        "max": float(series.max())
    })


@app.route("/train_model", methods=["POST"])
def train_model():
    try:
        data = request.get_json()
        filename = data["filename"]
        predictors = data["predictors"]
        target = data["target"]
        variable = data["augmentationVariable"]
        cutoff = float(data["cutoff_threshold"])
        ratio = float(data["partial_ratio"]) / 100
        model_type = data["model_type"]

        df = pd.read_csv(os.path.join("uploads", filename))

        # Augment data
        high = df[df[variable] >= cutoff]
        low = df[df[variable] < cutoff].sample(frac=ratio, random_state=42)
        df_aug = pd.concat([high, low])

        results = train_and_evaluate_models(
            df=df_aug,
            predictors=predictors,
            target=target,
            model_type=model_type,
            cutoff_thresholds=[cutoff],
            partial_ratios=[ratio]
        )

        return jsonify({ "results": results[0] })

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({ "error": str(e) })

if __name__ == "__main__":
    app.run(debug=True)
