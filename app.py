import os
from flask import Flask, render_template, request, jsonify
from inference_sdk import InferenceHTTPClient

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'static/uploads'
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Initialize Roboflow API client
client = InferenceHTTPClient(
    api_url="https://detect.roboflow.com",
    api_key="pfr014WZKVIIZS4tJXDt"
)

@app.route('/')
def index():
    return render_template('index.html')  # Load main page

@app.route('/upload', methods=['POST'])
def upload_image():
    if 'image' not in request.files:
        return jsonify({'error': 'No image file provided'}), 400

    file = request.files['image']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    # Save uploaded file
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
    file.save(filepath)

    try:
        # Send image to Roboflow API
        result = client.run_workflow(
            workspace_name="majorproject-kopqr",
            workflow_id="custom-workflow",
            images={"image": filepath},
            use_cache=True
        )

        # Extract prediction percentages
        predictions = result[0]["predictions"]["predictions"]
        percentages = {key: round(value["confidence"] * 100, 2) for key, value in predictions.items()}

        return jsonify({'image_path': filepath, 'predictions': percentages})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
