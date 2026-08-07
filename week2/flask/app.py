from flask import Flask, render_template, url_for, request, redirect
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

app = Flask(__name__) # Create a Flask app instance

#Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///test.db' # Configure the database URI for SQLAlchemy
db = SQLAlchemy(app) # Create a SQLAlchemy database instance

#models
class Todo(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.String(200), nullable=False)
    date_created = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return '<Task %r>' % self.id
    




@app.route('/', methods=['GET', 'POST']) # Define a route for the root URL
def hello():
    if request.method ==  'POST':
        task_content = request.form["task"]
        new_task = Todo(content=task_content)
        
        try:
            db.session.add(new_task)
            db.session.commit()
            return redirect('/')
        except:
            return "There was an issue adding the task."
    else:
        tasks = Todo.query.order_by(Todo.date_created).all()
        return render_template('index.html', tasks = tasks)  

if __name__ == '__main__': # Check if the script is run directly
    app.run(debug=True) # Run the app in debug mode