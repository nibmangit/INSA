# ጣይቱ ምግብ ቤት (Taytu Migib Bet) — Flask + SQLite edition

Your existing Interactive Food Menu, now backed by a real **SQLite**
database through **Flask-SQLAlchemy** instead of `orders.json`. Same
header, same 9 food items + 4 drinks, same cart/quantity/remove/
discount behavior in `script.js` — customer checkout and the new
admin dashboard now read and write a proper `Order` table.

## Project structure

```
food-menu/
├── app.py               # Flask app: routes, API endpoints, admin routes
├── models.py             # Flask-SQLAlchemy Order model
├── menu_data.py            # Menu as Python data (matches index.html exactly)
├── orders.db                 # SQLite database file (created automatically)
├── requirements.txt
├── templates/
│   ├── index.html            # Customer-facing menu page
│   └── admin/
│       ├── orders.html          # /admin/orders — view, cancel, delete
│       └── add.html             # /admin/add — manually add an order
└── static/
    ├── style.css             # Unchanged
    ├── script.js              # Same cart logic; checkout now sends customer name too
    └── images/                  # All 13 photos
```

## Setup

```bash
pip install -r requirements.txt
python app.py
```

Then open **http://127.0.0.1:5000/** in your browser. `orders.db` is
created automatically the first time the app runs — no manual setup
needed.

## What changed, and why

- **Database**: `orders.json` is gone. `models.py` defines an `Order`
  SQLAlchemy model (table `orders`) with columns for id, customer,
  items (JSON-encoded text), quantity, total price, created_at
  (date/time), and status (`Pending` / `Completed` / `Cancelled`).
  `app.py` configures `SQLALCHEMY_DATABASE_URI` to point at a local
  `orders.db` SQLite file and calls `db.create_all()` on startup.
- **`index.html`**: added a "Your name" field above the order summary
  so a customer order can be attributed to someone.
- **`script.js`**: `check_out_pressed()` now also sends the customer
  name in the `POST /api/orders` body (defaults to `"Guest"` if left
  blank). Everything else — add to cart, +/-, remove, discount tiers,
  notifications — is untouched.
- **Admin dashboard** (new): two routes only, as required.
  - `GET /admin/orders` — table of every order with customer, items,
    quantity, total, date/time, and status. Pending orders get
    **Complete** and **Cancel** buttons; every order gets a **Delete**
    button. All three actions post back to `/admin/orders` itself
    (with a hidden `action` field), so no extra routes are needed.
  - `GET /admin/add` — a form for the admin to manually key in a
    customer, food items, quantity, and total price, saved straight
    to SQLite. `POST /admin/add` handles the submission and validates
    the input before saving.

## API endpoints

| Method | Route          | Description                                          |
|--------|----------------|-------------------------------------------------------|
| GET    | `/`            | Serves the menu page (`templates/index.html`)         |
| GET    | `/api/menu`    | Returns the full menu (food + drinks) as JSON          |
| POST   | `/api/orders`  | Submits a new order, saved into SQLite (`orders` table) |
| GET    | `/api/orders`  | Returns every order saved so far, most recent first     |

### POST `/api/orders` — request body

```json
{
  "customer": "Abebe",
  "items": [
    { "name": "ፍርፍር", "price": 2, "qty": 3 },
    { "name": "ቡና", "price": 3, "qty": 1 }
  ]
}
```

An order with an empty (or missing) `items` array is rejected with a
`400`. `customer` is optional and defaults to `"Guest"`.

### Response (`201 Created`)

```json
{
  "id": 1,
  "customer": "Abebe",
  "items": [
    { "name": "ፍርፍር", "price": 2, "qty": 3 },
    { "name": "ቡና", "price": 3, "qty": 1 }
  ],
  "quantity": 4,
  "total_price": 9,
  "timestamp": "2026-08-18T10:51:00",
  "status": "Pending"
}
```

## Admin routes

| Method   | Route            | Description                                                        |
|----------|------------------|----------------------------------------------------------------------|
| GET      | `/admin/orders`  | View every order in the database                                     |
| POST     | `/admin/orders`  | Cancel, complete, or delete an order (`order_id` + `action` in body) |
| GET      | `/admin/add`     | Show the form to add a new order                                     |
| POST     | `/admin/add`     | Save a new manually-entered order to SQLite                          |

## Notes

- No files are used for storage anymore — `orders.db` (SQLite) is the
  only store, accessed exclusively through Flask-SQLAlchemy.
- Deleting `orders.db` and restarting the app gives you a fresh,
  empty database (SQLAlchemy recreates the schema automatically).

## Pushing to GitHub

```bash
git init
git add .
git commit -m "Replace orders.json with SQLite via Flask-SQLAlchemy"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```
