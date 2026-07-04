# Elevator Simulator
#### Video Demo:  https://youtu.be/UGQnB65TX_8
#### Description: A modular web elevator simulator

## Overview

This project simulates elevators in a building with multiple floors.

The simulator is able to:
* Simulate multiple elevators.
* Handle a variable number of floors.
* Handle multiple simultaneous floor requests.
* Manage floor button requests and in-elevator button requests.
* Sort requests based on elevator proximity and direction.
* Use a two standby queues (one elevator specific and one global) for overflow requests.


## Stack

**Frontend**

* HTML, CSS, and Vanilla JavaScript (ES6 Modules)
* Interactive rendering using `requestAnimationFrame()`
* Event-driven button logic and movement animation

**Backend**

* **Flask** (Python) – serves pages and APIs
* **SQLite3** – stores the building configuration:

    * Number of elevators
    * Number of floors

## How It Works

1. **Configuration**

    * On startup, Flask reads from `database.db` to determine how many elevators (`ELEVATORS`) and floors (`FLOORS`) to render. This data is passed into the frontend template.
    * When values for floor and elevator are changed and saved in `settings.html`, Flask updates the database accordingly.

2. **Frontend Simulation**

    * The JavaScript logic drives the simulation:

        * Each floor has **Up/Down buttons**.
        * Each elevator has its own **interior buttons**.
        * Button clicks trigger events that queue floor requests.
        * Elevators choose the best candidate for each request using proximity and direction heuristics.
        * When idle, elevators pull from **standby queues** (both local and global).

3. **Elevator Behavior**

    * Arrow indicators on each elevator shows which direction it is moving towards.
    * Floor number indicators on each elevator shows which floor the elevator is at.
    * Door opens and closes upon arrival.
    * Button (both floor and in-elevator) lights toggle when requests are active or fulfilled.
    * The entire simulation is continuously animated using `requestAnimationFrame()`.

4. **Floor Button Request Handling**
    * The algorithm first creates an array of elevators closes to the floor, sorted by closest to furthest.
    * Then each elevator is checked in `add_to_queue()`:
        * Is the elevator going towards the floor is?
        * Is the elevator's destination direction the same as where the floor wants to go?
    * If yes to both above, the floor is queued.
    * Otherwise the floor is sent to the **global standby** and re-checked for queuing when a lift becomes idle.

5. **In-Elevator Request Handling**
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

