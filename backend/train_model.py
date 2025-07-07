import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.multioutput import MultiOutputClassifier
from sklearn.preprocessing import LabelEncoder
import joblib
import os

DATA_PATH = "learning_logs_sample_500.csv"
MODEL_PATH = "multioutput_rf_model.pkl"
ENCODER_PATH = "label_encoders.pkl"

model = None
encoders = {}

if os.path.exists(MODEL_PATH) and os.path.exists(ENCODER_PATH):
    model = joblib.load(MODEL_PATH)
    encoders = joblib.load(ENCODER_PATH)
    print("✅ Model and encoders loaded.")
else:
    print("⚠️ Model not found. Please train the model separately.")

def train_model():
    df = pd.read_csv('/Users/sudhir/Adaptive-Learning/backend/learning_logs_sample_500.csv')

    feature_cols = ['Subject', 'Topic', 'Level', 'Accuracy', 'Time']
    target_cols = ['New_Subject', 'New_Topic', 'New_Level']

    encoders = {}
    X = df[feature_cols].copy()
    Y = df[target_cols].copy()

    # Encode categorical features
    for col in ['Subject', 'Topic', 'Level']:
        enc = LabelEncoder()
        X[col] = enc.fit_transform(X[col])
        encoders[col] = enc

    # Encode targets
    for col in ['New_Subject', 'New_Topic', 'New_Level']:
        enc = LabelEncoder()
        Y[col] = enc.fit_transform(Y[col])
        encoders[col] = enc

    model = MultiOutputClassifier(RandomForestClassifier(n_estimators=100, random_state=42))
    model.fit(X, Y)

    # Save model and encoders
    joblib.dump(model, MODEL_PATH)
    joblib.dump(encoders, ENCODER_PATH)
    print("✅ Model trained and saved.")
    
def predict():
    if model is None or not encoders:
        return "error: Model not trained yet"

    data = {
        'Subject':'DBMS',
        'Topic':'Indexing',
        'Level':'easy',
        'Accuracy':'95',
        'Time':'150'
    }

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

        return preds

    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == "__main__":
    # train_model()
    print(predict())
