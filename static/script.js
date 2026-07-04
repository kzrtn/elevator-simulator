// Helper module
import {
    FLOORS,
    ELEVATORS,
    ELEVATOR_HEIGHT,
    FLOOR_Y_POS,
    elevator,
    floor_buttons,
    elevator_btns,
    render_objects
} from './helpers.js';

// Global Standby Queue
let global_standby = [];

// Listen for click on each floor's button
for (let i = 0; i < FLOORS; i++) {
    // Go through up/down floor button arrays per floor
    ["up", "down"].forEach(dir => {
        const arr = floor_buttons[i][dir];
        if (!arr) return;

        // Listen to click on the buttons
        arr.forEach(id => {
            document.getElementById(id).addEventListener("click", () => {
                const statusKey = dir + "_status";
                // Ensures that floors are only queued ONCE
                // Stops idiots from spamming floor buttons
                if (!floor_buttons[i][statusKey]) {
                    floor_buttons[i][statusKey] = true;
                    set_floor_buttons(dir, floor_buttons[i].flr, true); // Turns on button
                    flr_add_q(dir, floor_buttons[i].flr); // Adds to elevator queue
                }
            });
        });
    });
}

// Change floor button color and status
function set_floor_buttons(dir, floor, status) {
    // Set the direction for the first or top floor to their only button
    if (floor == FLOORS) dir = "down";
    if (floor == 1) dir = "up";

    let arr = floor_buttons[floor - 1][dir]; // get floor's up/down button array
    floor_buttons[floor - 1][dir + "_status"] = status; // sets button status

    // Change colour of buttons based on whether button status is true or false
    for (let i = 0; i < arr.length; i++) {
        let color = status ? '#ff4d4d' : '';
        document.getElementById(arr[i]).style.background = color;
    }
}

// Change elevator button color
function turn_off_el_buttons(n){
    for (let i = 0; i < elevator_btns[n].length; i++) {
        let btn_no = "btn" + elevator[n].floor.toString();
        if ((elevator_btns[n][i].id).includes(btn_no)) {
            document.getElementById(elevator_btns[n][i].id).style.background = '';
            elevator_btns[n][i].status = false;
        }
    }
}


// Listen for elevator button clicks
for (let i = 0; i < ELEVATORS; i++) {
    elevator_btns[i].forEach(btn => {
        document.getElementById(btn.id).addEventListener("click", () => {
            // Stops people from spamming the buttons
            if (btn.status) return;

            let flr = parseInt(btn.id.substring(13, 14)); // extract floor
            let el = parseInt(btn.id.substring(8, 9)) - 1; // extract elevator number
            document.getElementById(btn.id).style.background = '#ff4d4d'; // turn button on
            btn.status = true; // set btn status to active
            let dir = check_elevator_move_direction(elevator[el].y, flr); // Check if lift will go up or down

            // Send to queue
            if (!add_to_queue(elevator[el], dir, flr)) {
                console.log("Put to elevator button request on standby.");
                (elevator[el].standby).push({flr, dir});
                log_q_s(elevator[el]);
            }
        });
    });
}

function check_elevator_which_floor(y_pos) {
    for (let i = 0; i < FLOORS; i++) {
        let range = y_pos - FLOOR_Y_POS[i]; // get the y difference between floor and elevator
        if (range >= 0 && range < ELEVATOR_HEIGHT / 2) return i + 1;
    }
}

function check_elevator_move_direction(y_pos, flr) {
    return check_elevator_which_floor(y_pos) < flr ? "up" : "down";
}

// For logging queue and standby
function log_q_s(e) {
    console.log("elevator ID: " + e.id);
    console.log("e.dir: " + e.dir);
    console.log("e.status: " + e.status);
    console.log("Current Queue: ");
    console.log(e.q);
    console.log("Current standby: ");
    console.log(e.standby);
    console.log("Global standby: ");
    console.log(global_standby);
}

// Add a floor to an elevator's queue
function add_to_queue(e, dir, flr) {
    // Set the elevator direction to the request's direction
    if (e.dir == "") { e.dir = dir };

    // Case 1: Lift is idle
    if (e.status == "idle") {
        // Set elevator status to up or down
        e.status = check_elevator_move_direction(e.y, flr);
        (e.q).push({flr, dir});
        console.log("Hit case 1, current queue:");
        console.log((e.q));
        console.log("e.dir: " + dir);
        console.log("e.status: " + e.status);
        return true;
    }
    // Case 2: Lift is going up, request is from a floor above the lift, desired direction is also up
    else if (e.status == "up" && dir == e.status && e.y > FLOOR_Y_POS[flr - 1]) {
        (e.q).push({flr, dir});
        (e.q).sort((a, b) => a.flr - b.flr);
        console.log("Hit Case 2, lift going up, request is from above lift, desired direction is also up");
        log_q_s(e);
        return true;
    }
    // Case 3: Lift is going down, request is below the lift, desired direction is below
    else if (e.status == "down" && dir == e.status && e.y < FLOOR_Y_POS[flr - 1]) {
        (e.q).push({flr, dir});
        (e.q).sort((a, b) => b.flr - a.flr);
        console.log("Hit Case 3, lift going down, request is from below, desired direction is below. Added to queue");
        log_q_s(e);
        return true;
    }
    // Case 4: No good matches, request should be put to standby
    else {
        return false;
    }
}

// Check for the closest lift to the floor button pressed
function closest_lifts(flr) {
    let dest_position = FLOOR_Y_POS[flr - 1];
    let closest = []; // List of elevators sorted by proximity

    for (let i = 0; i < ELEVATORS; i++) {
        let diff = Math.abs(dest_position - elevator[i].y);
        closest.push({ "closeness": diff, "e": i });
    }
    closest.sort((a, b) => a.closeness - b.closeness); // sort closest lift to furthest
    return closest;
}

// Add a floor to an elevator's queue (from floor button event)
function flr_add_q(dir, flr) {
    //closest_lift(dir, flr);
    console.log("Direction: " + dir);
    console.log("Desired floor: " + flr);

    // Get an array of dicts of the closest lifts (sorted closest to furthest)
    let nearby = closest_lifts(flr);
    for (let i = 0; i < nearby.length; i++) {
        let el = nearby[i].e; // get lift number from array
        if (add_to_queue(elevator[el], dir, flr)) return;
    }

    global_standby.push({flr, dir});
    console.log("Went through all elevators, no good candidate, floor to be put on global standby");
}

// Extract a floor from global standby and send it to flr_add_q for requeuing
function queue_global_standby() {
    let standby = global_standby.shift();
    flr_add_q(standby.dir, standby.flr);
}

// Extract a floor from elevator's standby and add to queue
function queue_elevator_standby(e) {
    let standby = (e.standby).shift();
    add_to_queue(e, standby.dir, standby.flr);
}

// Moves elevator to desired floor
function move_to_floor(n) {
    let e = elevator[n];
    let dest = FLOOR_Y_POS[(e.q[0]).flr - 1];
    let dir = (e.q[0]).dir;

    // elevator is lower than destination
    if (e.y > dest) {
        e.y -= e.dy;
        // elevator is above destination
    } else if (e.y < dest) {
        e.y += e.dy;
    } else {
        // Elevator is at destination
        // Update elevator floor variable and reset floor and elevator buttons
        e.floor = check_elevator_which_floor(e.y);
        set_floor_buttons(dir, e.floor, false);
        turn_off_el_buttons(n);

        // Stop any elevator movement for now
        e.status = "idle";

        // Start door cycle only if the door is closed
        if (e.door_state === "closed") {
            setTimeout(() => open_doors(e), 300);
        }
    }
}

function open_doors(e) {
    if (e.closed > 0) {
        e.closed -= e.dy;
        requestAnimationFrame(() => open_doors(e));
    } else {
        e.door_state = "open";
        // Wait 1s before closing the doors
        setTimeout(() => close_doors(e), 1000);
    }
}

function close_doors(e) {
    if (e.closed < 100) {
        e.closed += e.dy;
        requestAnimationFrame(() => close_doors(e));
    } else {
        e.door_state = "closed";
        // Remove current floor as we have reached
        // its destination
        (e.q).shift();
        e.current_target = null;
    }
}

// Animate the entire scene
function animate() {
    requestAnimationFrame(animate);

    for (let i = 0; i < ELEVATORS; i++) {
        let e = elevator[i];

        // Update lift floor based on position
        let flr = check_elevator_which_floor(e.y);
        if (flr != undefined) e.floor = flr;
        render_objects(e);

        // If doors are open in any way, skip everything else
        if (e.closed < 100) continue;

        // Set target and status for elevator to move
        if (e.current_target == null && (e.q).length > 0) {
            e.status = check_elevator_move_direction(e.y, (e.q[0]).flr);
            e.current_target = e.q[0];
        }
        // Target set, move to target floor
        if (e.current_target != null && e.status != "idle") {
            move_to_floor(i);
            // Nothing queued, finshed queue, set to idle
        } else if (e.q.length === 0) {
            // else set elevator status to idle
            e.status = "idle";
            e.dir = "";
            // check for any standby floor commands
            if ((e.standby).length > 0) {
                console.log("e.standby is bigger than zero, there are floors in queue standby");
                queue_elevator_standby(e);
            }
            // No individual elevator standby, try queuing a global one
            if (global_standby.length > 0) {
                console.log("Attempting to queue floors in global_standby");
                queue_global_standby();
            }
        }
    }
}


// Render everything
for (let i = 0; i < ELEVATORS; i++) {
    let e = elevator[i];
    render_objects(e);
}

// Begin animation
animate();
