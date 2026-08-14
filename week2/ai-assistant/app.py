from flask import Flask, render_template, request, jsonify
from google import genai

with open(".env", "r") as file:
    line = file.readline()
key, value = line.strip().split("=", 1)

client = genai.Client(api_key = value)

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/api/chat', methods=["POST"])
def chat():
    data = request.get_json()
    message = data.get("message")
    if not message:
        return jsonify({"error":"Message is required"}), 400
    
    try:
        response = client.models.generate_content(
            model="models/gemini-3.6-flash",
            contents=message
        ) 
        
        return jsonify({"response": response.text})
    except Exception as e:
        return jsonify({"error":"Faild to get Gemini response."}), 500
if __name__ == "__main__":
    app.run(debug=True)