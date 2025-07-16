from flask import Flask, request, jsonify
import dspy
import re
from flask_cors import CORS
from dotenv import load_dotenv
import os
import json
import pandas as pd
import csv
import joblib
from datetime import datetime

load_dotenv()

GROQ_API_KEY = os.getenv('GROQ_API_KEY')
GROQ_MODEL = os.getenv('GROQ_MODEL')
MAX_TOKEN = int(os.getenv('MAX_TOKEN',8192))
PORT = int(os.getenv('PORT',5001))

NO_OF_QUE = 5

s = 'For example i am giving:{'
for i in range(0,NO_OF_QUE):
    s = s+f'"question{i+1}" : "What is the capital of India?","option{i+1}A": "Delhi","option{i+1}B": "Mumbai","option{i+1}C": "Goa","option{i+1}D": "Chennai","answer{i+1}" : "{i+1}A","description{i+1}" : "The capital of India is Delhi"'
    if(i!=NO_OF_QUE-1):
        s += ',\n'
s += '}'

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000"])

# === DSPy MCQ Generator ===
class MCQQuestionGenerator(dspy.Signature):
    """
    You are a helpful teacher. Based on the input (Subject, topic, difficulty, and number of questions), 
    generate that many MCQs with 4 options (A, B, C, D), answers as '1A', '2B', etc., and include explanation.
    Use keys like question1, option1A, option1B, ..., answer1, description1 and so on.
    Make sure you give new questions everytime according to given time and date provided in the description of the question.
    """

    code = dspy.InputField(desc="Subject, Topic, and Difficulty")
    output = dspy.OutputField(
        desc=s,
        prefix="Questions"
    )

# DSPy setup
lm = dspy.LM('groq/llama3-8b-8192', api_key=GROQ_API_KEY)
dspy.configure(lm=lm)

def get_suggestions(prompt):
    predict = dspy.Predict(MCQQuestionGenerator)
    prediction = predict(code=prompt)
    # Extract only the JSON part
    match = re.search(r'\{.*\}', prediction.output, re.DOTALL)
    if match:
        try:
            return json.loads(match.group())
        except json.JSONDecodeError as e:
            print("JSON decode error:", e)
    return {}

@app.route('/generate', methods=['POST'])
def analyze_code():
    try:
        data = request.get_json()
        subject = data.get('subject')
        topic = data.get('topic')
        difficulty = data.get('difficulty')
        no_of_questions = int(data.get('noOfQue', 5))
        
        prompt = f'Subject: {subject} Topic: {topic} Difficulty: {difficulty} Generate {no_of_questions} questions on time: {datetime.now()}'

        formatted_output = get_suggestions(prompt)
        formatted_output.update({'status': 'success'})

        return jsonify(formatted_output), 200

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"message": "Internal server error", "status": "error"}), 500

@app.route('/')
def home():
    return jsonify({"message": "Backend is running!", "status": "success"})

# === ML MODEL SETUP ===

DATA_PATH = "learning_logs_sample_500.csv"
MODEL_PATH = "multioutput_rf_model.pkl"
ENCODER_PATH = "label_encoders.pkl"

model = None
encoders = {}

if os.path.exists(MODEL_PATH) and os.path.exists(ENCODER_PATH):
    model = joblib.load(MODEL_PATH)
    encoders = joblib.load(ENCODER_PATH)
    print(" Model and encoders loaded.")
else:
    print(" Model not found. Please train the model separately.")

@app.route("/predict", methods=["POST"])
def predict():
    if model is None or not encoders:
        return jsonify({"error": "Model not trained yet"}), 400

    data = request.get_json()

    try:
        X_input = pd.DataFrame([{
            'Subject': data['Subject'],
            'Topic': data['Topic'],
            'Level': data['Level'],
            'Accuracy': float(data['Accuracy']),
            'Time': int(data['Time'])
        }])

        for col in ['Subject', 'Topic', 'Level']:
            X_input[col] = encoders[col].transform(X_input[col])

        preds_encoded = model.predict(X_input)[0]

        preds = {
            'New_Subject': encoders['New_Subject'].inverse_transform([preds_encoded[0]])[0],
            'New_Topic': encoders['New_Topic'].inverse_transform([preds_encoded[1]])[0],
            'New_Level': encoders['New_Level'].inverse_transform([preds_encoded[2]])[0],
        }

        return jsonify(preds)

    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route("/feedback", methods=["POST"])
def feedback():
    data = request.get_json()

    try:
        row = [
            data['Subject'],
            data['Topic'],
            data['Level'],
            float(data['Accuracy']),
            int(data['Time']),
            data['New_Subject'],
            data['New_Topic'],
            data['New_Level']
        ]

        file_exists = os.path.isfile(DATA_PATH)
        with open(DATA_PATH, "a", newline="") as f:
            writer = csv.writer(f)
            if not file_exists:
                writer.writerow(["Subject", "Topic", "Level", "Accuracy", "Time", "New_Subject", "New_Topic", "New_Level"])
            writer.writerow(row)

        return jsonify({"message": "Feedback recorded successfully."})

    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == "__main__":
    app.run(debug=True, port=PORT)
