var canvas = document.getElementById('canvas');

canvas.width = 500;
canvas.height = 500;
var ctx = canvas.getContext('2d');

var snake_1;

var snake_2;

//one part of snake body
var snakePartSize = 5;

//update every amount of time
var frameRate = 100;
var loopInterval = null;


//scores config
var highestScore = 0;
var score 		 = 0;

//food config
var food = {
	x: 0,
	y: 0,
	special: false,
};

var foodColor = 'green';




//handle input
window.onkeydown = function(e){
	handleSnakeControl(e, snake_1);
	//handleSnakeControl(e, snake_2);
};

function handleSnakeControl(e,snake){
	//check if dir change is allowed
	if(snake.allowDirChange === false){
		return null;
	}
	
	//set prev direction before change
	snake.prevDirection = snake.direction;

	var controls = snake.controls;

	switch(e.code){
		case controls.left: 
			left(snake);
		break;
		case controls.right: 
			right(snake);
		break;
		case controls.up: 
			up(snake);
		break;
		case controls.down: 
			down(snake);
		break;
	};

	//cant change dir until loop start again
	snake.allowDirChange = false;

	//push breakpoint if direction changed
	if(snake.prevDirection != snake.direction){

		snake.breakpoints.push({
			on: 0,
			prevDir: snake.prevDirection,
			newDir: snake.direction,
			x: snake.xPos,
			y: snake.yPos,
		});
	}
}

//event callbacks
function right(snake){
	if(snake.direction !== 'l'){
		snake.direction = 'r';
	}
}

function left(snake){
	if(snake.direction !== 'r'){
		snake.direction = 'l';
	}
}

function up(snake){
	if(snake.direction !== 'd'){
		snake.direction = 'u';
	}
}

function down(snake){
	if(snake.direction !== 'u'){
		snake.direction = 'd';
	}
}

//place where init happens
function initGame(){
	//reset snake
	snake_1 = {
		xPos: 0, //position of first part of snake
		yPos: 0,
		length: 2,
		parts: [],
		breakpoints: [], //points where snake changed direction
		color: 'brown',
		direction: 'r',
		prevDirection: null,
		controls: {		//key codes of onKeyDown event
			left: 'ArrowLeft',
			right: 'ArrowRight',
			up: 'ArrowUp',
			down: 'ArrowDown',
		},
		allowDirChange: true,
	};

	// snake_2 = {
	// 	xPos: 50, //position of first part of snake
	// 	yPos: 50,
	// 	length: 2, 
	// 	parts: [],
	// 	breakpoints: [], //points where snake changed direction
	// 	color: 'black',
	// 	direction: 'r',
	// 	prevDirection: null,
	// 	controls: {		//key codes of onKeyDown event
	// 		left: 'KeyA',
	// 		right: 'KeyD',
	// 		up: 'KeyW',
	// 		down: 'KeyS',
	// 	},
	// 	allowDirChange: true,
	// };

	//speed
	frameRate = 100;
	
	//score
	highestScore = localStorage['highestScore'] ? localStorage['highestScore'] : 0;
	score = snake_1.length - 1;

	//clear canvas
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	//start loop
	resetLoop();

	spawnFood();
	
}

initGame();


//place where updates happens over time
function loop(){
	//allow 1 change of dir per frame
	snake_1.allowDirChange = true;
	//snake_2.allowDirChange = true;
	//clear snake
	removeSnakeParts(snake_1);
	//removeSnakeParts(snake_2);

	//calc position
	calcPos(snake_1);
	//calcPos(snake_2);

	//increment breakpoints point of happen
	moveBreakPoint(snake_1);
	//moveBreakPoint(snake_2);

	//draw snake
	drawSnake(snake_1);
	//drawSnake(snake_2);

	//handle feed of snake
	handleFeed(snake_1);
	//handleFeed(snake_2);

	//check if snake should die
	handleDeath(snake_1);
	//handleDeath(snake_2);

	//set score
	setScore();
}

function drawSnake(snake){
	for(var i = 0; i < snake.length; i++){
		drawRect(i, snake);
	}
}



function drawRect(i, snake){
	var rectX = snake.xPos;
	var rectY = snake.yPos;
	var rectDir = snake.direction;
	var breakPoint = null;

	for(var item of snake.breakpoints){
		if(item.on <= i && item.on > 0){
			breakPoint = item;
			break;
		}
	}
	
	if(breakPoint){
		rectX = breakPoint.x;
		rectY = breakPoint.y;
		rectDir = breakPoint.prevDir;
		i = i - breakPoint.on;
	}

	switch(rectDir){
		case 'r': 
			rectX -= snakePartSize * i;
		break;

		case 'l': 
			rectX += snakePartSize * i; 
		break;
			
		case 'u': 
			rectY += snakePartSize * i;
		break;

		case 'd': 
			rectY -= snakePartSize * i;
		break;
	}

	snake.parts.push({
		x: rectX,
		y: rectY,
	});
	ctx.fillStyle = snake.color;
	ctx.fillRect(rectX,rectY,snakePartSize,snakePartSize);
}

function removeSnakeParts(snake){
	for(part of snake.parts){
		ctx.clearRect(part.x, part.y, snakePartSize, snakePartSize);
	}

	snake.parts = [];
}

function calcPos(snake){
	switch(snake.direction){
		case 'r': 
			snake.xPos += snakePartSize;
		break;

		case 'l': 
			snake.xPos -= snakePartSize;
		break;
			
		case 'u': 
			snake.yPos -= snakePartSize;
		break;

		case 'd': 
			snake.yPos += snakePartSize;
		break;
	}
}

function spawnFood(){
	food.x = Math.round(Math.random() * 100) * 5;
	food.y = Math.round(Math.random() * 100) * 5;

	//handle larger generations 
	food.x = food.x > canvas.width ? (canvas.width - snakePartSize) : food.x;
	food.y = food.y > canvas.height ? (canvas.height - snakePartSize) : food.y;
	
	if(Math.random() * 100 > frameRate){
		ctx.fillStyle = 'blue';
		food.special = true;
	} else {
		ctx.fillStyle = 'green';
		food.special = false;
	}

	
	ctx.fillRect(food.x,food.y,snakePartSize,snakePartSize);
}

function handleFeed(snake){

	if(snake.xPos === food.x && snake.yPos === food.y){
		//increment score with snakeLength
		snake.length++;
		score++;

		//decrement frameRate for harder gameplay
		//30 is hardest frameRate
		if(frameRate > 30){
			frameRate -= 5;
			if(food.special){
				specialSlow();
			}else {
				//reload loop with new framerate
				resetLoop();
			}
		}

		ctx.clearRect(part.x, part.y, snakePartSize, snakePartSize);
		spawnFood();
	}
}

function handleDeath(snake){

	if(snake.xPos >= canvas.width || snake.xPos < 0){
		initGame();
	}

	if(snake.yPos >= canvas.height || snake.yPos < 0){
		initGame();
	}

	for(var part of snake.parts){
		if(snake.xPos === part.x && snake.yPos === part.y && snake.parts.indexOf(part) !== 0){
			initGame();
		}
	}
}

function setScore(){
	document.getElementById('score').innerHTML = 'Score : ' + score;
	document.getElementById('highestScore').innerHTML = 'Highest : ' + highestScore;

	if(highestScore < score){
		localStorage['highestScore'] = score;
	}
}

function resetLoop(customFrameRate){
	var newRate = customFrameRate ? customFrameRate : frameRate;

	if(loopInterval){
		window.clearInterval(loopInterval);
	}

	loopInterval = window.setInterval(loop, newRate);
}

function specialSlow(miliseconds){
	var delay = miliseconds ? miliseconds : 4000;
	snake_1.color = 'blue';
	resetLoop(500);
	window.setTimeout(function (){
		snake_1.color = 'brown';
		resetLoop();
	}, delay);
}

function moveBreakPoint(snake){
	for(var breakpoint of snake.breakpoints){
		breakpoint.on++;
	}
}


