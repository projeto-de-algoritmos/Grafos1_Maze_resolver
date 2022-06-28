let form = document.querySelector("#settings");
let size = document.querySelector("#size");
let rowsCols = document.querySelector("#number");
let complete = document.querySelector(".complete");
let replay = document.querySelector(".replay");
let close = document.querySelector(".close");

let newMaze;

form.addEventListener("submit", generateMaze);
document.addEventListener("move", move);
replay.addEventListener("click", () => {
	location.reload();
});

close.addEventListener("click", () => {
	complete.style.display = "none";
});

async function generateMaze(e) {
	e.preventDefault();

	if (rowsCols.value == "") {
		return alert("Please enter all fields");
	}

	let number = rowsCols.value;
	if (number > 50) {
		alert("Maze too large!");
		return;
	}

	form.style.display = "none";

	newMaze = new Maze(number, number);
	newMaze.setup();
	newMaze.drawMaze();
	newMaze.bfs();
}

function move(e) {
	if (!generationComplete) return;
	let key = e.detail;
	let row = current_pos.rowNum;
	let col = current_pos.colNum;

	switch (key) {
		case "ArrowUp":
			if (!current_pos.walls.topWall) {
				let next = newMaze.grid[row - 1][col];
				current_pos = next;
				current_pos.highlight(newMaze.columns);
				if (current_pos.goal) complete.style.display = "block";
			}
			break;

		case "ArrowRight":
			if (!current_pos.walls.rightWall) {
				let next = newMaze.grid[row][col + 1];
				current_pos = next;
				current_pos.highlight(newMaze.columns);
				if (current_pos.goal) complete.style.display = "block";
			}
			break;

		case "ArrowDown":
			if (!current_pos.walls.bottomWall) {
				let next = newMaze.grid[row + 1][col];
				current_pos = next;
				current_pos.highlight(newMaze.columns);
				if (current_pos.goal) complete.style.display = "block";
			}
			break;

		case "ArrowLeft":
			if (!current_pos.walls.leftWall) {
				let next = newMaze.grid[row][col - 1];
				current_pos = next;
				current_pos.highlight(newMaze.columns);
				if (current_pos.goal) complete.style.display = "block";
			}
			break;
	}
}
