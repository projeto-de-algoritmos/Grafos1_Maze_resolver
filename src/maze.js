let maze = document.querySelector(".maze");
let context = maze.getContext("2d");
let generationComplete = false;

let current_pos;

class Maze {
	constructor(rows, columns) {
		this.size = 500;
		this.columns = columns;
		this.rows = rows;
		this.grid = [];
		this.stack = [];
	}

	setup() {
		for (let r = 0; r < this.rows; r++) {
			let row = [];
			for (let c = 0; c < this.columns; c++) {
				let cell = new Cell(r, c, this.grid, this.size);
				row.push(cell);
			}
			this.grid.push(row);
		}
		current_pos = this.grid[0][0];
		this.grid[this.rows - 1][this.columns - 1].goal = true;
	}

	drawMaze() {
		maze.width = this.size;
		maze.height = this.size;
		maze.style.background = "black";

		current_pos.visited = true;

		for (let r = 0; r < this.rows; r++) {
			for (let c = 0; c < this.columns; c++) {
				let grid = this.grid;
				grid[r][c].show(this.size, this.rows, this.columns);
			}
		}

		let next = current_pos.mazeGenNeighbours(this.grid);

		if (next) {
			next.visited = true;
			this.stack.push(current_pos);
			current_pos.highlight(this.columns);
			current_pos.removeWalls(current_pos, next);
			current_pos = next;
		} else if (this.stack.length > 0) {
			let cell = this.stack.pop();
			current_pos = cell;
			current_pos.highlight(this.columns);
		}

		if (this.stack.length === 0) {
			generationComplete = true;
			return;
		}

		window.requestAnimationFrame(() => {
			this.drawMaze();
		});
	}

	async bfs() {
		while (current_pos !== this.grid[0][0]) {
			await new Promise((r) => setTimeout(r, 1000));
		}

		let start = this.grid[0][0];
		let frontier = [start];

		let cameFrom = {};
		cameFrom[start] = undefined;

		let all = [];
		let pos = undefined;
		let neighbours = undefined;

		while (frontier.length > 0) {
			pos = frontier.shift();
			pos.visited = !pos.visited;
			if (pos.goal) {
				break;
			}

			neighbours = pos.checkNeighbours(this.grid);

			neighbours.forEach((c) => {
				if (cameFrom[c.rowNum + " " + c.colNum] === undefined) {
					all.push(c);
					frontier.push(c);
					cameFrom[c.rowNum + " " + c.colNum] = pos;
				}
			});
		}
		this.paint(all);
		this.generatePath(cameFrom);
	}

	paint(nodes) {
		let a = nodes.shift();
		if (a) {
			a.visitedColor(newMaze.columns);
		}

		window.requestAnimationFrame(() => {
			this.paint(nodes);
		});
	}

	generatePath(cameFrom) {
		let path = [];
		let end = this.grid[this.rows - 1][this.columns - 1];

		let pos = end;
		let next = cameFrom[end.rowNum + " " + end.colNum];

		while (pos !== this.grid[0][0]) {
			if (pos.colNum > next.colNum) {
				path.push("ArrowRight");
			} else if (pos.colNum < next.colNum) {
				path.push("ArrowLeft");
			} else if (pos.rowNum < next.rowNum) {
				path.push("ArrowUp");
			} else if (pos.rowNum > next.rowNum) {
				path.push("ArrowDown");
			}
			pos = next;
			next = cameFrom[next.rowNum + " " + next.colNum];
		}
		path = path.reverse();

		this.walk(path);
	}

	async walk(path) {
		await new Promise((r) => setTimeout(r, 50));
		let togo = path.shift();

		var evt = new CustomEvent("move", { detail: togo });
		document.dispatchEvent(evt);

		window.requestAnimationFrame(() => {
			this.walk(path);
		});

		return;
	}
}

class Cell {
	constructor(rowNum, colNum, parentGrid, parentSize) {
		this.rowNum = rowNum;
		this.colNum = colNum;
		this.visited = false;
		this.walls = {
			topWall: true,
			rightWall: true,
			bottomWall: true,
			leftWall: true,
		};
		this.goal = false;
		this.parentSize = parentSize;
	}

	mazeGenNeighbours(grid) {
		let row = this.rowNum;
		let col = this.colNum;
		let neighbours = [];

		let top = row !== 0 ? grid[row - 1][col] : undefined;
		let right = col !== grid.length - 1 ? grid[row][col + 1] : undefined;
		let bottom = row !== grid.length - 1 ? grid[row + 1][col] : undefined;
		let left = col !== 0 ? grid[row][col - 1] : undefined;

		if (top && !top.visited) neighbours.push(top);
		if (right && !right.visited) neighbours.push(right);
		if (bottom && !bottom.visited) neighbours.push(bottom);
		if (left && !left.visited) neighbours.push(left);

		if (neighbours.length !== 0) {
			let random = Math.floor(Math.random() * neighbours.length);
			return neighbours[random];
		} else {
			return undefined;
		}
	}

	checkNeighbours(grid) {
		let row = this.rowNum;
		let col = this.colNum;
		let neighbours = [];

		if (!this.walls.topWall && grid[row - 1][col].visited)
			neighbours.push(grid[row - 1][col]);
		if (!this.walls.rightWall && grid[row][col + 1].visited)
			neighbours.push(grid[row][col + 1]);
		if (!this.walls.bottomWall && grid[row + 1][col].visited)
			neighbours.push(grid[row + 1][col]);
		if (!this.walls.leftWall && grid[row][col - 1].visited)
			neighbours.push(grid[row][col - 1]);

		return neighbours;
	}

	drawTopWall(x, y, size, columns, rows) {
		context.beginPath();
		context.moveTo(x, y);
		context.lineTo(x + size / columns, y);
		context.stroke();
	}

	drawRightWall(x, y, size, columns, rows) {
		context.beginPath();
		context.moveTo(x + size / columns, y);
		context.lineTo(x + size / columns, y + size / rows);
		context.stroke();
	}

	drawBottomWall(x, y, size, columns, rows) {
		context.beginPath();
		context.moveTo(x, y + size / rows);
		context.lineTo(x + size / columns, y + size / rows);
		context.stroke();
	}

	drawLeftWall(x, y, size, columns, rows) {
		context.beginPath();
		context.moveTo(x, y);
		context.lineTo(x, y + size / rows);
		context.stroke();
	}

	highlight(columns) {
		let x = (this.colNum * this.parentSize) / columns + 1;
		let y = (this.rowNum * this.parentSize) / columns + 1;
		context.fillStyle = "purple";
		context.fillRect(
			x,
			y,
			this.parentSize / columns - 3,
			this.parentSize / columns - 3,
		);
	}

	visitedColor(columns) {
		let x = (this.colNum * this.parentSize) / columns + 1;
		let y = (this.rowNum * this.parentSize) / columns + 1;

		context.fillStyle = "rgba(128,0,128,0.4)";
		context.fillRect(
			x,
			y,
			this.parentSize / columns - 3,
			this.parentSize / columns - 3,
		);
	}

	removeWalls(cell1, cell2) {
		let x = cell1.colNum - cell2.colNum;

		if (x === 1) {
			cell1.walls.leftWall = false;
			cell2.walls.rightWall = false;
		} else if (x === -1) {
			cell1.walls.rightWall = false;
			cell2.walls.leftWall = false;
		}

		let y = cell1.rowNum - cell2.rowNum;

		if (y === 1) {
			cell1.walls.topWall = false;
			cell2.walls.bottomWall = false;
		} else if (y === -1) {
			cell1.walls.bottomWall = false;
			cell2.walls.topWall = false;
		}
	}

	show(size, rows, columns) {
		let x = (this.colNum * size) / columns;
		let y = (this.rowNum * size) / rows;

		context.strokeStyle = "#ffffff";
		context.fillStyle = "black";
		context.lineWidth = 2;

		if (this.walls.topWall) this.drawTopWall(x, y, size, columns, rows);
		if (this.walls.rightWall) this.drawRightWall(x, y, size, columns, rows);
		if (this.walls.bottomWall)
			this.drawBottomWall(x, y, size, columns, rows);
		if (this.walls.leftWall) this.drawLeftWall(x, y, size, columns, rows);
		if (this.visited) {
			context.fillRect(x + 1, y + 1, size / columns - 2, size / rows - 2);
		}
		if (this.goal) {
			context.fillStyle = "rgb(83, 247, 43)";
			context.fillRect(x + 1, y + 1, size / columns - 2, size / rows - 2);
		}
	}
}
