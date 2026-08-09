import json
from flask import Flask, render_template, jsonify, request

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


@app.route('/api/orders', methods=["POST"])
def create_order():
    order = request.get_json()
    
    if not order or not order.get("items"):
        return jsonify({"error": "Orders must contain at least one item"})
    
    with open("orders.json", "r", encoding="utf-8") as file:
        orders = json.load(file)
        
    orders.append(order)
    
    with open("orders.json", "w", encoding="utf-8") as file:
        json.dump(orders, file, ensure_ascii=False, indent=4)
        
    return jsonify(order), 201


if __name__ == "__main__":
    app.run(debug=True)