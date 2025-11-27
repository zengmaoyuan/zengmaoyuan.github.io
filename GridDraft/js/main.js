const canvas = document.getElementById("main");
const ctx = canvas.getContext("2d");
const gridSize = 50;
const zoomAdd = document.querySelector(".zoom-button#add");
const zoomDel = document.querySelector(".zoom-button#del");
const zoomShow = document.querySelector(".zoom-show");
let center =
{
	x: 0,
	y: 0
};
let position =
{
	x: 0, y: 0
};
console.log(zoomAdd, zoomDel, zoomShow);
let isMouseDown = 0;
let statement = {
	x: 0,
	y: 0,
	scale: 1.0
};
let mouse = {
	x: 0,
	y: 0
};
// Draw the grid
function DrawvVertical(ctx, i) {
	ctx.beginPath();
	ctx.moveTo(i, 0);
	ctx.lineTo(i, canvas.height);
	ctx.closePath();
	ctx.stroke();
}
function DrawHorizontal(ctx, i) {
	ctx.beginPath();
	ctx.moveTo(0, i);
	ctx.lineTo(canvas.width, i);
	ctx.closePath();
	ctx.stroke();
}
function Draw(dX = 0, dY = 0) {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.strokeStyle = "#666";
	ctx.fillStyle = "#999";
	ctx.font = "20px Courier New";
	let curGridSize = gridSize * statement.scale;
	statement.scale = Math.min(10, Math.max(0.1, statement.scale));
	statement.x = ((statement.x % curGridSize) + curGridSize) % curGridSize;
	statement.y = ((statement.y % curGridSize) + curGridSize) % curGridSize;
	for (let i = statement.x + dX; i <= canvas.width; i += curGridSize)
		DrawvVertical(ctx, i);
	for (let i = statement.x + dX; i >= 0; i -= curGridSize)
		DrawvVertical(ctx, i);
	for (let i = statement.y + dY; i <= canvas.height; i += curGridSize)
		DrawHorizontal(ctx, i);
	for (let i = statement.y + dY; i >= 0; i -= curGridSize)
		DrawHorizontal(ctx, i);
	ctx.fillText("V0.01", canvas.width - 100, 50);
	ctx.fillText(`(${position.x}, ${position.y})`, statement.x, statement.y + 20);
}
// Adjust the canvas size
function AdjustWindowSize() {
	canvas.height = window.innerHeight;
	canvas.width = window.innerWidth;
	center.x = canvas.width / 2;
	center.y = canvas.height / 2;
	Draw();
	console.log(canvas.width, canvas.height, center);
}

canvas.addEventListener("mousedown", function (e) {
	if (e.button == 1) {
		isMouseDown = true;
		mouse.x = e.clientX;
		mouse.y = e.clientY;
		canvas.style.cursor = "grabbing";
	}
});
canvas.addEventListener("mouseup", function (e) {
	if (e.button == 1) {
		isMouseDown = false;
		canvas.style.cursor = "pointer";
	}
});
canvas.addEventListener("mousemove", function (e) {
	if (isMouseDown) {
		let deltaX = e.clientX - mouse.x;
		let deltaY = e.clientY - mouse.y;
		mouse.x = e.clientX;
		mouse.y = e.clientY;
		statement.x += deltaX;
		statement.y += deltaY;
		console.log(statement);
		if (statement.x >= gridSize * statement.scale) position.x -= Math.floor(statement.x / (gridSize * statement.scale));
		if (statement.y >= gridSize * statement.scale) position.y += Math.floor(statement.y / (gridSize * statement.scale));
		if (statement.x < 0) position.x++;
		if (statement.y < 0) position.y--;
		Draw();
	}
});
// Zoom Grid
function Zoom(zoomFactor, centerX, centerY) {
	statement.scale = Math.min(10, Math.max(0.1, statement.scale));
	const newGridSize = (statement.scale *= zoomFactor) * gridSize;
	console.log(newGridSize);
	statement.x = ((centerX - statement.x) * zoomFactor) - centerX;
	statement.y = ((centerY - statement.y) * zoomFactor) - centerY;
	statement.x = - statement.x;
	statement.y = - statement.y;
	zoomShow.value = `${Math.round(statement.scale * 100)}%`;
	Draw();
}
canvas.addEventListener("wheel", function (e) {
	e.preventDefault();
	const rect = canvas.getBoundingClientRect();
	const mouseX = e.clientX - rect.x;
	const mouseY = e.clientY - rect.y;
	const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
	statement.scale = Math.min(10, Math.max(0.1, statement.scale));
	if (statement.scale * zoomFactor >= 0.1 && statement.scale * zoomFactor <= 10)
		Zoom(zoomFactor, mouseX, mouseY);
});
// Zoom button event
zoomAdd.addEventListener("click", function (e) {
	statement.scale = Math.min(10, Math.max(0.1, statement.scale));
	if (statement.scale * 1.1 <= 10)
		Zoom(1.1, center.x, center.y);
});
zoomDel.addEventListener("click", function (e) {
	statement.scale = Math.min(10, Math.max(0.1, statement.scale));
	if (statement.scale * 0.9 >= 0.1)
		Zoom(0.9, center.x, center.y);
});
AdjustWindowSize();
window.addEventListener("resize", AdjustWindowSize);
Zoom(1.0, center.x, center.y);