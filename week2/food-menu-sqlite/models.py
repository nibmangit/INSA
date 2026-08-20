"""
SQLAlchemy models for ጣይቱ ምግብ ቤት (Taytu Migib Bet)
======================================================
Replaces the old orders.json file store with a real SQLite database,
accessed through Flask-SQLAlchemy.
"""

import json
from datetime import datetime

from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


class Order(db.Model):
    """A single customer order.

    ``items`` holds the ordered dishes/drinks as a JSON-encoded string
    (a list of ``{"name": ..., "price": ..., "qty": ...}`` objects), so
    an order can contain any number of menu items while still living
    in one row/column pair in SQLite.
    """

    __tablename__ = "orders"

    id = db.Column(db.Integer, primary_key=True)
    customer = db.Column(db.String(120), nullable=False, default="Guest")
    items = db.Column(db.Text, nullable=False)  # JSON-encoded list of items
    quantity = db.Column(db.Integer, nullable=False, default=0)
    total_price = db.Column(db.Float, nullable=False, default=0)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    status = db.Column(db.String(20), nullable=False, default="Pending")
 

    def set_items(self, items_list):
        """Store a Python list of item dicts as JSON text, and keep
        ``quantity`` in sync with the sum of each item's qty."""
        self.items = json.dumps(items_list, ensure_ascii=False)
        self.quantity = sum(int(item.get("qty", 0)) for item in items_list)

    def get_items(self):
        """Return the ordered items back as a Python list of dicts."""
        try:
            return json.loads(self.items)
        except (TypeError, ValueError):
            return []

    def to_dict(self):
        return {
            "id": self.id,
            "customer": self.customer,
            "items": self.get_items(),
            "quantity": self.quantity,
            "total_price": self.total_price,
            "timestamp": self.created_at.isoformat(timespec="seconds"),
            "status": self.status,
        }
