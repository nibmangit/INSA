import json
from flask import Flask, render_template, jsonify

app = Flask(__name__)

def load_menu():
    with open("menu.json", "r", encoding="utf-8") as file:
        return json.load(file);

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/api/menu', methods=["GET"])
def get_menu():
    menu = load_menu()
    return jsonify(menu)


if __name__ == "__main__":
    app.run(debug=True)