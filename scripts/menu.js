const menu_container = document.getElementById("menu-container");
const dot_container = document.querySelector('.dots');

const start_button = document.getElementById("start");
const close_button = document.getElementById("close");
const back_button = document.getElementById("back");
const next_button = document.getElementById("next");
const info_button = document.getElementById("info");
const help_button = document.getElementById("help");
const menu_button = document.getElementById("menu");

const info_pages = document.querySelectorAll('.info-pages .page');
const help_pages = document.querySelectorAll('.help-pages .page');

let mode = 'help';
let current_index = 0;

start_button.addEventListener('click', () => {
    menu_container.style.display = "none";
});

info_button.addEventListener('click', () => {
    mode = 'info';
    current_index = 0;
    rebuild_dots(info_pages.length);
    update();
});

help_button.addEventListener('click', () => {
    mode = 'help';
    current_index = 0;
    rebuild_dots(help_pages.length);
    update();
});

function get_current_pages() {
    return mode === 'info' ? info_pages : help_pages;
}

function rebuild_dots(count) {
    dot_container.innerHTML = '';
    for (let i = 0; i < count; i++) {
        const dot = document.createElement('div');
        dot.classList.add('dot');
        dot.addEventListener('click', () => {
            current_index = i;
            update();
        });
        dot_container.appendChild(dot);
    }
}

function update() {
    if (!mode) return;

    const pages = get_current_pages();
    const dots = dot_container.querySelectorAll('.dot');

    // Show correct page set
    document.querySelector('.info-pages').style.display = mode === 'info' ? 'block' : 'none';
    document.querySelector('.help-pages').style.display = mode === 'help' ? 'block' : 'none';

    // Buttons
    back_button.disabled = current_index === 0;
    back_button.style.opacity = current_index === 0 ? "0.3" : "1";
    next_button.disabled = current_index === pages.length - 1;
    next_button.style.opacity = current_index === pages.length - 1 ? "0.3" : "1";

    // Pages
    pages.forEach((page, i) => {
        page.classList.toggle('active', i === current_index);
    });

    // Dots
    dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === current_index);
    });
}

back_button.addEventListener('click', () => {
    current_index--;
    update();
});

next_button.addEventListener('click', () => {
    current_index++;
    update();
});

rebuild_dots(help_pages.length);
update();

close_button.addEventListener('click', () => {
    menu_container.style.display = 'none';
});

menu_button.addEventListener('click', () => {
    menu_container.style.display = 'flex';
});