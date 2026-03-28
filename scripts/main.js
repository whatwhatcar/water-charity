import { create } from './game.js';
const end_screen = document.getElementById("end-screen");
const restart_button = document.getElementById("restart");
const end_message = document.getElementById("end-message");
const best_val = document.getElementById("best-val");
const time_val = document.getElementById("time-val");
const flag_val = document.getElementById("flag-val");

const best_time = document.getElementById("best-time");
const your_time = document.getElementById("your-time");

const milestone_message = document.getElementById("milestone-message");

const yippee = document.getElementById("yippee");
const faaah = document.getElementById("faaah");
const click_sound = document.getElementById("click-sound");

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
        milestone_message.textContent = "click board to start";
        flag_val.textContent = mine_count;
    },
    start: () => {
        startTimer();
    },
    click: () => {
        if (sound_on) {  click_sound.play(); }
    },
    score: (reveal_count, total_cells) => {
        const ratio = reveal_count / total_cells;
        if (ratio < 0.2) { milestone_message.textContent = "believe in yourself!"; return; }
        if (ratio > 0.7) { milestone_message.textContent = "you're almost there!"; return; }
        milestone_message.textContent = "woah, we're half way there!";
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

        if (sound_on) {  yippee.play(); }
    },
    lose: () => {
        stopTimer();
        const elapsed = Math.floor((Date.now() - startTime) / 1000); // ← add this
        your_time.textContent = "your time: " + elapsed + "s";       // ← add this
        end_screen.style.display = "flex";
        end_message.textContent = "you lose!";
        if (sound_on) {  faaah.play(); }

    },
    flag: (mine_count) => { flag_val.textContent = mine_count; }
};

const container = document.getElementById("board-container");
const redo_button = document.getElementById("redo");
const board = document.createElement("div");
container.appendChild(board);

let game;

const diff = {
    easy: { width: 5, height: 5, mine_count: 3 },
    medium: { width: 7, height: 7, mine_count: 7 },
    hard: { width: 10, height: 10, mine_count: 20 }
}

function start_game(mode) {
    stopTimer();
    if (game)
        game.destroy();

    let settings;
    settings = diff[mode];

    game = create({
        ...settings,
        board_element: board,
        actions: {
            init: states.init,
            start: states.start,
            score: states.score,
            click: states.click,
            win: states.win,
            lose: states.lose,
            flag: states.flag
        }
    });
}

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

const sound_button = document.getElementById("sound-button");
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

const sound = document.getElementById("sound");
const mute = document.getElementById("mute");


let sound_on = true;

sound_button.addEventListener('click', () => {
    sound_on = !sound_on;
    if (sound_on) {
        sound.style.visibility = "visible";
        mute.style.visibility = "hidden";
    }
    else {
        sound.style.visibility = "hidden";
        mute.style.visibility = "visible";
    }
});

const difficulty_dropdown = document.getElementById("difficulty");

difficulty_dropdown.addEventListener('change', (event) => {
    const mode = event.target.value;
    start_game(mode);
});

start_game("easy");