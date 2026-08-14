from flask import Flask, render_template, request, jsonify

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
    
    print("User Message: ", message)
    
    return jsonify({"response":"The message is recived seccessfully."})

if __name__ == "__main__":
    app.run(debug=True)