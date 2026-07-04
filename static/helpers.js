// Constant variables: the number of floors and elevators to be displayed on the page
export const FLOORS = parseInt(document.getElementById("num_of_floors").innerHTML);
export const ELEVATORS = parseInt(document.getElementById("num_of_elevators").innerHTML);
export const ELEVATOR_HEIGHT = 100;
export const ELEVATOR_WIDTH = 70;

// elevator shaft object
export let shaft = new Object();
shaft.height = FLOORS * ELEVATOR_HEIGHT;
shaft.width = ELEVATOR_WIDTH + 20;

// Floor height here is technically just ELEVATOR_HEIGHT
export const FLOOR_HEIGHT = shaft.height / FLOORS;

// Each floor Y point for the lift to detect it's on x floor
// E.g. LVL 4: 0, LVL 3: 100, LVL 2: 200, LVL 1: 300
export const FLOOR_Y_POS = [];
for (let i = 0; i < FLOORS; i++) {
    FLOOR_Y_POS.push(shaft.height - FLOOR_HEIGHT * (i + 1));
}

// Canvas and context objects for each elevator
export let elevator = []
for (let i = 0; i < ELEVATORS; i++) {
    let temp = new Object();
    temp.canvas = document.getElementById('elevator' + (i + 1).toString());
    temp.ctx = temp.canvas.getContext('2d');

    temp.x = 10; // x position of the elevator
    temp.y = FLOOR_Y_POS[0]; // y position of the elevator, start on 1st floor
    temp.dy = 2; // speed of the elevator and the doors
    temp.floor = 1; // which floor the elevator is on, it starts on the 1st floor
    temp.closed = 100; // how much (in percent) the door is closed
    temp.door_state = "closed";

    // For queues
    temp.q = [];
    temp.standby = [];
    temp.status = "idle";
    temp.dir = ""; // Destination direction
    temp.current_target = null; // Target destination
    elevator.push(temp);
}

// Up/down button object array for each floor
// floor_buttons[0].flr (floor 1)
// floor_buttons[1].flr (floor 2)
// floor_buttons[1].up (gives an array of the up button ids of floor 2)
// floor_buttons[1].up_status (true = up button for floor 2 is active)
export let floor_buttons = [];
for (let i = 0; i < FLOORS; i++) {
    let floor_btns = document.querySelectorAll(".floor" + (i + 1).toString());

    let temp = new Object();
    temp.flr = i + 1;

    // Add up/down button ids to temporary arrays accordingly
    let up_arr = [];
    let down_arr = [];
    for (let j = 0; j < floor_btns.length; j++) {
        let flr = floor_btns[j].id.substring(3, 4); // extract floor number
        // Only add to the arrays if floor matches
        if (flr == temp.flr) {
            let dir = floor_btns[j].id.substring(9, 11); // extract direction
            if (dir == "dn") dir = "down";

            // Push floor_button ID into array according to up/down direction
            ({
                up: up_arr,
                down: down_arr
            } [dir]).push(floor_btns[j].id);
            temp[dir + '_status'] = false; // set status to false
        }
    }
    // Add array to object, only if it has content
    if (up_arr.length) temp.up = up_arr;
    if (down_arr.length) temp.down = down_arr;

    floor_buttons.push(temp);
}


// The elevator buttons for each lift
export let elevator_btns = [];
for (let i = 0; i < ELEVATORS; i++) {
    let temp = [];
    for (let j = 0; j < FLOORS; j++) {
        let btn_obj = new Object();
        btn_obj.id = (document.getElementById("elevator" + (i + 1).toString() + "_btn" + (j + 1).toString())).id;
        btn_obj.status = false;
        temp.push(btn_obj)
    }
    elevator_btns.push(temp);
}

// Helper function for solid rectangular fills
function createRect(e, x, y, width, height, color) {
    e.ctx.strokeRect(x, y, width, height);
    e.ctx.fillStyle = color;
    e.ctx.fillRect(x, y, width, height);
}

// Render the elevator shaft
function render_shaft(e) {
    for (let j = 0; j < FLOORS; j++) {
        // Alternating bands of colour per floor
        e.ctx.fillStyle = (j % 2 == 0) ? "#323233" : "#414142";

        // Fill the colour
        e.ctx.fillRect(0, (FLOOR_HEIGHT * j) + 0, shaft.width, FLOOR_HEIGHT);
    }
}

// Render the elevators themselves
function render_elevator(e) {
    // Elevator outline
    e.ctx.strokeRect(e.x, e.y, ELEVATOR_WIDTH, ELEVATOR_HEIGHT);

    // Gradient background fill for the elevator
    const grad = e.ctx.createLinearGradient(0, 0, ELEVATOR_WIDTH, 0);
    grad.addColorStop(0, "#9b9d9e");
    grad.addColorStop(0.5, "#ebeced");
    grad.addColorStop(1, "#9b9d9e");
    e.ctx.fillStyle = grad;
    e.ctx.fillRect(e.x, e.y, ELEVATOR_WIDTH, ELEVATOR_HEIGHT);

    // Render the number panel background
    let display_bg = new Object();
    display_bg.width = 42;
    display_bg.height = 15;
    display_bg.x = e.x + (ELEVATOR_WIDTH / 2) - (display_bg.width / 2);
    display_bg.y = e.y + 5;
    createRect(e, display_bg.x, display_bg.y, display_bg.width, display_bg.height, "black");

    // Render the floor on panel
    e.ctx.font = "bold 13px Arial";
    e.ctx.fillStyle = "white"
    e.ctx.fillText(e.floor, display_bg.x + (display_bg.width / 3) + 3, display_bg.y + (display_bg.height / 2) + 5);

    if (e.status === "up") render_up_arrow(e, display_bg);
    if (e.status === "down") render_down_arrow(e, display_bg);
};

// Up arrow on display (for when elevator goes up)
function render_up_arrow(e, display_bg) {
    let arrow_x = display_bg.x + (display_bg.x / 2) + 17;
    let arrow_y = display_bg.y + 3;
    e.ctx.beginPath();
    e.ctx.moveTo(arrow_x + 5, arrow_y);
    e.ctx.lineTo(arrow_x + 10, arrow_y + 9);
    e.ctx.lineTo(arrow_x + 0, arrow_y + 9);
    e.ctx.lineTo(arrow_x + 5, arrow_y);
    e.ctx.fillStyle = "#ff8629";
    e.ctx.fill();
}

// Down arrow on display (for when elevator goes down)
function render_down_arrow(e, display_bg) {
    let arrow_x = display_bg.x + 3;
    let arrow_y = display_bg.y + 3;
    e.ctx.beginPath();
    e.ctx.moveTo(arrow_x + 0, arrow_y + 0);
    e.ctx.lineTo(arrow_x + 10, arrow_y + 0);
    e.ctx.lineTo(arrow_x + 5, arrow_y + 9);
    e.ctx.lineTo(arrow_x + 5, arrow_y + 9);
    e.ctx.fillStyle = "#ff8629";
    e.ctx.fill();
}

// Render the elevator doors
function render_doors(e) {
    let closed_percent = e.closed / 100;
    // The underlayer beneath the elevator doors
    let cabin = new Object();
    cabin.x = e.x + 7;
    cabin.y = e.y + 25;
    cabin.width = ELEVATOR_WIDTH - 14;
    cabin.height = ELEVATOR_HEIGHT - 30;

    // Elevator door (left)
    let door_left = new Object();
    door_left.x = cabin.x;
    door_left.width = cabin.width * closed_percent / 2;

    // Elevator door (right)
    let door_right = new Object();
    door_right.x = cabin.x + cabin.width - cabin.width * closed_percent / 2;
    door_right.width = cabin.width * closed_percent / 2;

    // Draw on the canvas
    createRect(e, cabin.x, cabin.y, cabin.width, cabin.height, "#dbfffe");
    createRect(e, door_left.x, cabin.y, door_left.width, cabin.height, "#d3d4d5");
    createRect(e, door_right.x, cabin.y, door_right.width, cabin.height, "#d3d4d5");
}

// Renders all the objects
export function render_objects(e) {
    render_shaft(e);
    render_elevator(e);
    render_doors(e);
}
