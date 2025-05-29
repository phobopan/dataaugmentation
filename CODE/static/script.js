let filename = "";
let predictors = [];
let target = "";
let augmentationVariable = "";
let cutoffThreshold = 50;
let partialRatio = 50;
let modelType = "random_forest";
let columns = []; // Store column names globally

// Function to move between steps
function showStep(stepNumber) {
    document.querySelectorAll(".step").forEach(step => {
        step.style.display = "none";
    });
    document.getElementById(`step-${stepNumber}`).style.display = "block";
}

// Step 1: Upload File
async function uploadFile() {
    const fileInput = document.getElementById("csvFile").files[0];
    if (!fileInput) {
        alert("Please upload a CSV file.");
        return;
    }

    const formData = new FormData();
    formData.append("file", fileInput);

    const response = await fetch("/upload", {
        method: "POST",
        body: formData
    });

    const data = await response.json();
    if (data.error) {
        alert("Error uploading file.");
        return;
    }

    filename = data.filename;
    columns = data.columns;
    displayTargetSelection();
}

// Step 2: Select Target Variable
function displayTargetSelection() {
    let html = `<h2>Select Target Variable</h2>`;
    html += `<select id="target">${columns.map(col => `<option>${col}</option>`).join("")}</select><br><br>`;
    html += `<button onclick="showStep(0)">Back</button>`;
    html += `<button onclick="saveTargetSelection()">Next</button>`;

    document.getElementById("step-1").innerHTML = html;
    showStep(1);
}

function saveTargetSelection() {
    target = document.getElementById("target").value;
    if (!target) {
        alert("Please select a target variable.");
        return;
    }
    displayVariableSelection();
}

// Step 3: Choose Predictor Variables (Exclude Target Variable)
function displayVariableSelection() {
    let filteredColumns = columns.filter(col => col !== target);
    let html = `<h2>Select Predictors</h2>`;

    filteredColumns.forEach(col => {
        html += `<input type="checkbox" value="${col}" class="predictor"> ${col}<br>`;
    });

    html += `<button onclick="showStep(1)">Back</button>`;
    html += `<button onclick="savePredictorSelection()">Next</button>`;

    document.getElementById("step-2").innerHTML = html;
    showStep(2);
}

function savePredictorSelection() {
    predictors = Array.from(document.querySelectorAll(".predictor:checked")).map(el => el.value);
    if (predictors.length === 0) {
        alert("Please select at least one predictor variable.");
        return;
    }
    showAugmentationStep();
}

// Step 4: Choose Augmentation Variable
async function showAugmentationStep() {
    try {
        const response = await fetch("/plot_distribution", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ filename, predictors })
        });

        const data = await response.json();

        if (data.error) {
            alert("Error generating plots: " + data.error);
            return;
        }

        let html = `<h2>Select Variable for Data Augmentation</h2>`;
        html += `<p>Select a predictor variable based on the distribution below.</p>`;

        for (let col in data.plots) {
            html += `
                <h3>${col}</h3>
                <img src="${data.plots[col]}" width="400"><br>
                <button onclick="selectAugmentationVariable('${col}')">${col}</button><br><br>
            `;
        }

        html += `<button onclick="showStep(2)">Back</button>`;

        document.getElementById("step-3").innerHTML = html;
        showStep(3);
    } catch (error) {
        alert("Error fetching distribution plots.");
    }
}


function selectAugmentationVariable(variable) {
    augmentationVariable = variable;
    showThresholdStep();  // move directly to next step
}



// Step 5: Select Cutoff Threshold & Partial Ratio
async function showThresholdStep() {
    try {
        // First, get plot
        const plotResponse = await fetch("/plot_distribution", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ filename, predictors })
        });
        const plotData = await plotResponse.json();
        const plotUrl = plotData.plots[augmentationVariable];

        // Then, get min/max range
        const rangeResponse = await fetch("/get_variable_range", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ filename, variable: augmentationVariable })
        });
        const rangeData = await rangeResponse.json();
        const min = rangeData.min;
        const max = rangeData.max;

        // Clamp cutoffThreshold
        if (cutoffThreshold < min) cutoffThreshold = min;
        if (cutoffThreshold > max) cutoffThreshold = max;

        let html = `
            <h2>Choose Cutoff Threshold & Partial Sampling Ratio</h2>

            <label>Cutoff Threshold (${min}–${max}): 
                <input type="range" id="cutoff" min="${min}" max="${max}" step="0.1" value="${cutoffThreshold}" oninput="updateCutoff(${min}, ${max})">
            </label>
            <span id="cutoffValue">${cutoffThreshold}</span><br><br>

            <label>Partial Sampling Ratio (0–100%): 
                <input type="range" id="partial" min="0" max="100" value="${partialRatio}" oninput="updatePartial()">
            </label>
            <span id="partialValue">${partialRatio}</span><br><br>

            <h3>Distribution of ${augmentationVariable}</h3>
            <img src="${plotUrl}" width="400"><br><br>

            <button onclick="showStep(3)">Back</button>
            <button onclick="showModelSelection()">Next</button>
        `;

        document.getElementById("step-5").innerHTML = html;
        showStep(5);
    } catch (error) {
        alert("Failed to load plot or range data.");
    }
}


function updateCutoff() {
    cutoffThreshold = document.getElementById("cutoff").value;
    document.getElementById("cutoffValue").innerText = cutoffThreshold;
}

function updatePartial() {
    partialRatio = document.getElementById("partial").value;
    document.getElementById("partialValue").innerText = partialRatio;
}

// Step 6: Select Model Type
function showModelSelection() {
    let html = `
        <h2>Select Machine Learning Model</h2>
        <select id="model">
            <option value="random_forest">Random Forest</option>
            <option value="xgboost">XGBoost</option>
            <option value="neural_network">Neural Network</option>
        </select><br><br>

        <button onclick="showStep(5)">Back</button>
        <button onclick="trainModel()">Train Model</button>
    `;

    document.getElementById("step-6").innerHTML = html;
    showStep(6);
}

async function trainModel() {
    modelType = document.getElementById("model").value;

    let html = `<h2>Training Model...</h2><p>Please wait while the model is being trained.</p>`;
    html += `<div class="spinner"></div>`;
    document.getElementById("step-7").innerHTML = html;
    showStep(7);

    try {
        const response = await fetch("/train_model", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                filename,
                predictors,
                target,
                augmentationVariable,
                cutoff_threshold: cutoffThreshold,
                partial_ratio: partialRatio,
                model_type: modelType
            })
        });

        const data = await response.json();
        console.log("Model training response:", data);  // ✅ Add this line

        if (data.error) {
            alert("Training failed: " + data.error);
            return;
        }

        showResults(data.results);
    } catch (error) {
        console.error("Caught error:", error);
        alert("Error during model training.");
    }
}


function showResults(results) {
    let html = `<h2>Model Training Results</h2>`;
    html += `<p><strong>R² Score:</strong> ${results.r2_score}</p>`;
    html += `<button onclick="showStep(6)">Back</button>`;
    
    document.getElementById("step-7").innerHTML = html;
    showStep(7);
}

