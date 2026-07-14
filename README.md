# Elevator Simulator
#### Video Demo:  https://youtu.be/UGQnB65TX_8
#### Description: A modular web elevator simulator

## Overview

This project simulates elevators in a building with multiple floors.

Features:
* Simulate multiple elevators.
* Handle a variable number of floors.
* Handle multiple simultaneous floor requests.
* Manage floor button requests and in-elevator button requests.
* Sort requests based on elevator proximity and direction.
* Use a two standby queues (one elevator specific and one global) for overflow requests.


## Stack

**Frontend**

* HTML, CSS, and Vanilla JavaScript (ES6 Modules)
* Rendered using `requestAnimationFrame()`
* Event-driven based on button onClick

**Backend**

* **Flask** (Python): Just to display the page and connect to the backend
* **SQLite3**: Stores the number of elevators and floors

## How It Works

1. **Floor Button Request Handling**
    * The algorithm first creates an array of elevators closes to the floor, sorted by closest to furthest.
    * Then each elevator is checked in `add_to_queue()`:
        * Is the elevator going towards where the floor is?
        * Is the elevator's destination direction the same as where the floor wants to go?
    * If yes to both above, the floor is queued.
    * Otherwise the floor is sent to the **global standby** and re-checked for queuing when a lift becomes idle.

2. **In-Elevator Request Handling**
    * The elevator is checked in `add_to_queue()`:
        * Is the elevator going towards the floor that the elevator button wishes to go to?
    * If yes, the floor is queued.
    * Otherwise the floor is sent to elevator's **local standby** and re-checked for queuing when a lift becomes idle.

## Installation

### Dependencies

* Python 3.10+
* Flask
* SQLite3 (comes preinstalled with Python)
* A modern web browser (supports ES6 modules)

### Steps

```bash
# Install dependencies
pip install flask

# Initialize the database
python init_db.py

# Run the Flask server
python app.py
```

Then open your browser and go to:

```
http://127.0.0.1:5000/
```

## To-Do (maybe)

* Add customizable speed setting in the settings.
* Add ability for elevator to move back to floor 1 when idle for more than 1s.
* Add close/open buttons in each elevator panel.

