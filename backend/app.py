# app.py (Optimized Python Flask backend)
from flask import Flask, request, jsonify
import dspy
import requests
import re
import base64
from flask_cors import CORS
from dotenv import load_dotenv
import os
import json

load_dotenv()

GROQ_API_KEY = os.getenv('GROQ_API_KEY')
# import os
# from dotenv import load_dotenv

# load_dotenv()
# GROQ_API_KEY = os.getenv("GROQ_API_KEY")

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
# cd print(s)

app = Flask(__name__)
CORS(app, resources={r"/generate": {"origins": "http://localhost:3000"}})


class MCQQuestionGenerator(dspy.Signature):
    """
    You are a helpful teacher. Based on the input (grade, topic, difficulty, and number of questions), 
    generate that many MCQs with 4 options (A, B, C, D), answers as '1A', '2B', etc., and include explanation.
    Use keys like question1, option1A, option1B, ..., answer1, description1 and so on.
    """

    code = dspy.InputField(desc="Grade, Topic, and Difficulty")
    output = dspy.OutputField(
        desc=s,
        prefix="Questions"
    )


# DSPy setup with correct model configuration
# lm = dspy.GROQ(model=GROQ_MODEL, api_key=GROQ_API_KEY,max_tokens=MAX_TOKEN)
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



# Route to analyze code for vulnerabilities
@app.route('/generate', methods=['POST'])
def analyze_code():
    try:
        data = request.get_json()
        grade = data.get('grade')
        topic = data.get('topic')
        difficulty = data.get('difficulty')
        no_of_questions = int(data.get('noOfQue', 5))


        prompt = f'Grade: {grade} Topic: {topic} Difficulty: {difficulty} Generate {no_of_questions} questions'

        # DSPy prediction for code analysis
        formatted_output = (get_suggestions(prompt))

        # print(type(formatted_output))
        # print(formatted_output)
        formatted_output.update({'status': 'success'})

        return jsonify(formatted_output), 200


    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"message": "Internal server error", "status": "error"}), 500
# Basic route to check server status
@app.route('/')
def home():
    return jsonify({"message": "Backend is running!", "status": "success"})

# Start the Flask server
if __name__ == '__main__':
    app.run(port=PORT)