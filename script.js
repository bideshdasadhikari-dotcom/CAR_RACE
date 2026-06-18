const scoreDisplay = document.querySelector('.score');
const startScreen = document.querySelector('.start-screen');
const gameArea = document.querySelector('.game-area');
const countdownScreen = document.querySelector('.countdown'); // Target countdown div

let player = { speed:6, score:0, isActive:false };
let isCountingDown = false; // Prevents spamming Enter/Clicks during countdown

let keys = {
ArrowUp:false,
ArrowDown:false,
ArrowLeft:false,
ArrowRight:false
};

document.addEventListener('keydown',keyDown);
document.addEventListener('keyup',keyUp);

// Start on click
startScreen.addEventListener('click', () => {
    if (!player.isActive && !isCountingDown) {
        prepareGame();
    }
});

function keyDown(e){
// Start on Enter key
if(e.key === "Enter" && !player.isActive && !isCountingDown) {
    prepareGame();
}

if(keys.hasOwnProperty(e.key)){
    e.preventDefault();
    keys[e.key]=true;
}
}

function keyUp(e){
if(keys.hasOwnProperty(e.key)){
    e.preventDefault();
    keys[e.key]=false;
}
}

function isCollide(a,b){
let aRect=a.getBoundingClientRect();
let bRect=b.getBoundingClientRect();

return !(
    (aRect.bottom < bRect.top) ||
    (aRect.top > bRect.bottom) ||
    (aRect.right < bRect.left) ||
    (aRect.left > bRect.right)
);
}

function moveLines(){
let lines=document.querySelectorAll('.line');

lines.forEach(function(item){
    if(item.y >= 900){
        item.y -= 900; 
    }
    item.y += player.speed;
    item.style.top=item.y+"px";
});
}

function moveEnemies(car){
let enemies=document.querySelectorAll('.enemy');

enemies.forEach(function(item){
    if(isCollide(car,item)){
        endGame();
    }

    if(item.y >= 750){
        item.y = -300;
        let lanes = [25, 125, 225, 325];
        item.style.left = lanes[Math.floor(Math.random() * 4)] + "px";
    }

    item.y += player.speed;
    item.style.top=item.y+"px";
});
}

function endGame(){
player.isActive=false;
startScreen.classList.remove('hide');
startScreen.innerHTML=`
    <p>Game Over</p>
    <p>Your Score: ${player.score}</p>
    <p>Press Enter or Click To Restart</p>
`;
}

function gameLoop(){
if(player.isActive){
    let car=document.querySelector('.car');
    let road=gameArea.getBoundingClientRect();

    moveLines();
    moveEnemies(car);

    if(keys.ArrowUp && player.y > (road.top + 70)){
        player.y -= player.speed;
    }
    if(keys.ArrowDown && player.y < (road.bottom - 100)){
        player.y += player.speed;
    }

    if(keys.ArrowLeft && player.x > 10){
        player.x -= player.speed;
    }
    if(keys.ArrowRight && player.x < 330){
        player.x += player.speed;
    }

    car.style.top=player.y+"px";
    car.style.left=player.x+"px";

    player.score++;
    scoreDisplay.innerText="Score: "+player.score;

    window.requestAnimationFrame(gameLoop);
}
}

// Prepare Game sets up the board, but waits to start the loop
function prepareGame() {
    isCountingDown = true;
    startScreen.classList.add('hide');
    countdownScreen.classList.remove('hide');
    gameArea.innerHTML="";

    player.score=0;
    scoreDisplay.innerText="Score: 0";

    // Draw lines
    for(let lane = 1; lane <= 3; lane++){
        for(let x=0; x<6; x++){
            let roadLine=document.createElement('div');
            roadLine.setAttribute('class','line');
            roadLine.y = x*150;
            roadLine.style.top=roadLine.y+"px";
            roadLine.style.left = (lane * 100 - 5) + "px"; 
            gameArea.appendChild(roadLine);
        }
    }

    // Draw Player
    let car=document.createElement('div');
    car.setAttribute('class','car');
    gameArea.appendChild(car);

    player.x = 170; 
    player.y = car.offsetTop;
    // Set initial position immediately so player is visible during countdown
    car.style.left = player.x + "px";
    car.style.top = player.y + "px";

    // Draw Enemies
    for(let x=0;x<4;x++){
        let enemy=document.createElement('div');
        enemy.setAttribute('class','enemy');
        enemy.y = ((x+1)*350)*-1;
        enemy.style.top=enemy.y+"px";
        
        let lanes = [25, 125, 225, 325];
        enemy.style.left = lanes[Math.floor(Math.random() * 4)] + "px";
        gameArea.appendChild(enemy);
    }

    // ----------------------------------------
    // THE COUNTDOWN LOGIC
    // ----------------------------------------
    let count = 3;
    countdownScreen.innerText = count;

    let countdownInterval = setInterval(() => {
        count--;
        
        if (count > 0) {
            countdownScreen.innerText = count;
        } else if (count === 0) {
            countdownScreen.innerText = "GO!";
        } else {
            // Once it drops past 0, clear interval, hide text, start game!
            clearInterval(countdownInterval);
            countdownScreen.classList.add('hide');
            isCountingDown = false;
            player.isActive = true; 
            window.requestAnimationFrame(gameLoop);
        }
    }, 1000); // 1000ms = 1 second
}