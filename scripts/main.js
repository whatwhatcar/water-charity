import { create } from './game.js';
const end_screen = document.getElementById("end-screen");
const restart_button = document.getElementById("restart");
const end_message = document.getElementById("end-message");
const best_val = document.getElementById("best-val");
const time_val = document.getElementById("time-val");
const flag_val = document.getElementById("flag-val");

const best_time = document.getElementById("best-time");
const your_time = document.getElementById("your-time");

best_time.textContent = "best time: -";
your_time.textContent = "your time: -";


let best = null;
best_val.textContent = "-";
let startTime = null;
let timer = null;

function startTimer() {
    startTime = Date.now();
    timer = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        time_val.textContent = elapsed + "s";
    }, 1000);
}

function stopTimer() {
    clearInterval(timer);
    timer = null;
}

const states = {
    init: (mine_count) => {
        flag_val.textContent = mine_count;
    },
    start: () => {
        startTimer();
    },
    win: () => {
        stopTimer();
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        if (best === null || elapsed < best) {
            best = elapsed;
            best_val.textContent = best + "s";
            best_time.textContent = "best time: " + best + "s"; // ← add this
        }
        your_time.textContent = "your time: " + elapsed + "s"; // ← add this
        end_screen.style.display = "flex";
        end_message.textContent = "you win!";
        confetti();
    },
    lose: () => {
        stopTimer();
        const elapsed = Math.floor((Date.now() - startTime) / 1000); // ← add this
        your_time.textContent = "your time: " + elapsed + "s";       // ← add this
        end_screen.style.display = "flex";
        end_message.textContent = "you lose!";
    },
    flag: (mine_count) => { flag_val.textContent = mine_count; }
};

const container = document.getElementById("board-container");
const redo_button = document.getElementById("redo");
const board = document.createElement("div");
container.appendChild(board);
const game = create({
    width: 5,
    height: 5,
    mine_count: 3,
    board_element: board,
    actions: {
        init: states.init,
        start: states.start,
        win: states.win,
        lose: states.lose,
        flag: states.flag
    }
});
redo_button.addEventListener('click', () => {
    stopTimer();
    time_val.textContent = "0s";
    game.reset();
});
restart_button.addEventListener('click', () => {
    stopTimer();
    time_val.textContent = "0s";
    end_screen.style.display = "none";
    game.reset();
});

const sound_button = document.getElementById("sound");
const share_button = document.getElementById("share");

share_button.addEventListener('click', () => {
    if (navigator.share) {
        navigator.share({
            title: 'Check this out!',
            text: 'Here is something interesting',
            url: window.location.href
        });
    } else {
        alert("Sharing not supported on this browser");
    }
});

const sound_image = document.getElementById("sound-image");

let sound_on = true;

sound_button.addEventListener('click', () => {
    sound_on = !sound_on;
    if (sound_on)
        sound_image.src = "../icons/sound.svg";
    else
        sound_image.src = "../icons/mute.svg";
});

const difficulty_dropdown = document.getElementById("difficulty");

difficulty_dropdown.addEventListener('change', (event) => {
    
});