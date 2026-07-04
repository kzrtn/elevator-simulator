import os

import sqlite3
from flask import Flask, flash, redirect, render_template, request, session

# Configure application
app = Flask(__name__)

# Ensure templates are auto-reloaded
app.config["TEMPLATES_AUTO_RELOAD"] = True

@app.after_request
def after_request(response):
    """Ensure responses aren't cached"""
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Expires"] = 0
    response.headers["Pragma"] = "no-cache"
    return response

@app.route("/", methods=["GET", "POST"])
def index():
    conn = sqlite3.connect("elevators.db")
    db = conn.cursor()
    db_data = db.execute("SELECT * FROM elevators;")
    settings = {}
    for data in db_data:
        settings['id'] = data[0]
        settings['elevator'] = int(data[1])
        settings['floors'] = int(data[2])

    conn.close()
    return render_template("index.html", settings=settings)


@app.route("/settings", methods=["GET", "POST"])
def settings():
    if request.method == "POST":
        # Ensure fields are not blank
        if not request.form.get("elevators"):
            error_message = "Elevator quantity cannot be empty."
            return render_template("error.html", error_message = error_message)
        if not request.form.get("floors"):
            error_message = "Floors quantity cannot be empty."
            return render_template("error.html", error_message = error_message)

        # Ensure they are numbers
        try:
            elevator_qty = int(request.form.get("elevators"))
            floors_qty = int(request.form.get("floors"))
        except:
            error_message = "Elevator and floor quantity must be a whole number"
            return render_template("error.html", error_message = error_message)

        # Ensure they're reasonable values
        if not (5 > elevator_qty > 0):
            error_message = "Elevator count cannot be more than 4 or less than 0"
            return render_template("error.html", error_message = error_message)
        if not (10 > floors_qty > 2):
            error_message = "Floor count cannot be more than 10 or less than 2"
            return render_template("error.html", error_message = error_message)

        conn = sqlite3.connect("elevators.db")
        db = conn.cursor()
        db.execute("UPDATE elevators SET count = ?;", (elevator_qty,))
        db.execute("UPDATE elevators SET floors = ?;", (floors_qty,))
        conn.commit()
        conn.close()
        return redirect("/")

    return render_template("settings.html")

@app.route("/error", methods=["GET"])
def error():
    render_template("error.html")
