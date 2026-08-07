from flask import Flask, render_template, url_for

app = Flask(__name__) # Create a Flask app instance

@app.route('/') # Define a route for the root URL
def hello():
    return render_template('index.html') # Render the 'index.html' template when the root URL is accessed
    # return 'Hello, World!' # Return a simple response

if __name__ == '__main__': # Check if the script is run directly
    app.run(debug=True) # Run the app in debug mode