"""
ጣይቱ ምግብ ቤት (Taytu Migib Bet) — Flask backend
==============================================
Serves the existing Interactive Food Menu front end and exposes a
small JSON API so the page's JavaScript can talk to a real backend.

Endpoints
---------
GET  /                -> renders templates/index.html
GET  /api/menu         -> the full menu as JSON
POST /api/orders       -> submit a new order (saved to SQLite)
GET  /api/orders       -> read back every saved order

Admin
-----
GET/POST /admin/orders -> view every order, cancel it, or delete it
GET/POST /admin/add    -> manually add a new order

Orders are persisted to a SQLite database (orders.db) through
Flask-SQLAlchemy — orders.json is no longer used.
"""

import json
import os

from flask import Flask, jsonify, redirect, render_template, request, url_for

from menu_data import MENU
from models import Order, db

app = Flask(__name__)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///" + os.path.join(BASE_DIR, "orders.db")
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db.init_app(app)

with app.app_context():
    db.create_all()


def calculate_total(items):
    """Sum price * qty across every item in an order."""
    return sum(item["price"] * item["qty"] for item in items)


# ---------------------------------------------------------------
# Front end
# ---------------------------------------------------------------

@app.route("/")
def index():
    """Serve the existing menu page from templates/index.html."""
    return render_template("index.html")


# ---------------------------------------------------------------
# API: menu
# ---------------------------------------------------------------

@app.route("/api/menu", methods=["GET"])
def get_menu():
    """Return the full food + drinks menu as JSON."""
    return jsonify(MENU), 200


# ---------------------------------------------------------------
# API: orders (used by the customer-facing page)
# ---------------------------------------------------------------

@app.route("/api/orders", methods=["POST"])
def create_order():
    """Receive a customer order and save it to SQLite.

    Expected JSON body:
        {
          "customer": "Abebe",
          "items": [ { "name": "...", "price": 3, "qty": 2 }, ... ]
        }

    Rejects the order (400) if it has no items, so an empty order
    can never be saved even if the front-end check is bypassed.
    """
    data = request.get_json(silent=True)

    if not data or not isinstance(data.get("items"), list) or len(data["items"]) == 0:
        return jsonify({"error": "An order must contain at least one item."}), 400

    items = data["items"]
    for item in items:
        if not all(key in item for key in ("name", "price", "qty")):
            return jsonify({"error": "Each item needs a name, price, and qty."}), 400
        if item["qty"] < 1:
            return jsonify({"error": "Item quantity must be at least 1."}), 400

    order = Order(customer=(data.get("customer") or "Guest").strip() or "Guest")
    order.set_items(items)
    order.total_price = data.get("total") or calculate_total(items)

    db.session.add(order)
    db.session.commit()

    return jsonify(order.to_dict()), 201


@app.route("/api/orders", methods=["GET"])
def get_orders():
    """Return every order saved so far, most recent first."""
    orders = Order.query.order_by(Order.created_at.desc()).all()
    return jsonify([o.to_dict() for o in orders]), 200


# ---------------------------------------------------------------
# Admin: /admin/orders
# ---------------------------------------------------------------

@app.route("/admin/orders", methods=["GET", "POST"])
def admin_orders():
    """Display every order, and handle cancel/delete actions.

    A single route handles both viewing the order list and acting on
    it (cancel or delete), since only /admin/orders and /admin/add
    are allowed as admin routes. The action is picked with a hidden
    "action" field in each order's form.
    """
    if request.method == "POST":
        order_id = request.form.get("order_id", type=int)
        action = request.form.get("action")
        order = db.session.get(Order, order_id) if order_id else None

        if order:
            if action == "cancel":
                order.status = "Cancelled"
                db.session.commit()
            elif action == "delete":
                db.session.delete(order)
                db.session.commit()
            elif action == "complete":
                order.status = "Completed"
                db.session.commit()

        return redirect(url_for("admin_orders"))

    orders = Order.query.order_by(Order.created_at.desc()).all()
    return render_template("admin/orders.html", orders=orders)


# ---------------------------------------------------------------
# Admin: /admin/add
# ---------------------------------------------------------------

@app.route("/admin/add", methods=["GET", "POST"])
def admin_add():
    """Let the admin manually add a new order."""
    error = None

    if request.method == "POST":
        customer = (request.form.get("customer") or "").strip()
        food_items = (request.form.get("items") or "").strip()
        quantity = request.form.get("quantity", type=int)
        total_price = request.form.get("total_price", type=float)

        if (
            not customer
            or not food_items
            or not quantity
            or quantity < 1
            or total_price is None
            or total_price < 0
        ):
            error = (
                "Please fill in customer, items, a quantity of at least 1, "
                "and a valid total price."
            )
        else:
            order = Order(customer=customer, quantity=quantity, total_price=total_price)
            # Manually-added orders are entered as one free-text item
            # line (name = whatever the admin typed) rather than
            # picked from the menu.
            order.items = json.dumps(
                [{"name": food_items, "price": total_price, "qty": quantity}],
                ensure_ascii=False,
            )
            db.session.add(order)
            db.session.commit()
            return redirect(url_for("admin_orders"))

    return render_template("admin/add.html", error=error)


if __name__ == "__main__":
    app.run(debug=True)
