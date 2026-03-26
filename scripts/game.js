export function create({ width, height, mine_count, board_element, actions }) {
    const rows = height + 2;
    const cols = width + 2;

    const total_cells = width * height;
    const safe_cells = total_cells - mine_count;

    const board = new Int8Array(rows * cols); // -1 mines, 0 empty, 1-8 squares
    const visit = new Uint8Array(rows * cols); // 0 unvisted, 1 visited, 2 flagged

    // a total of (width * height)
    const cell_indexes = []; //all cells in an array (inner -> outer) to get the border cells
    const cell_elements = []; // actual object elements indexed by inner

    let pool = []; //a list of all cells (index: inner, value: outer) to pick from to be mines
    let dirty = []; //visited cell elements, does not matter for indexes as all is cleaned up on reset

    let mines_left;
    let reveal_count;
    let board_ready;
    let game_over;

    const directions = [
        -cols - 1, -cols, -cols + 1,
        -1, 1,
        +cols - 1, +cols, +cols + 1
    ];

    const get_inner = outer => ((outer / cols) | 0) * (cols - 2) + (outer % cols) - cols + 1;

    function setup() {
        for (let r = 1; r <= height; r++) {
            for (let c = 1; c <= width; c++) {
                cell_indexes.push(r * cols + c);
            }
        }
    }

    function draw_board() {
        board_element.id = "board";
        board_element.style.setProperty('--grid-cols', width);
        board_element.style.setProperty('--grid-rows', height);

        const frag = document.createDocumentFragment();
        for (const outer of cell_indexes) {
            const cell = document.createElement("div");
            cell.classList.add("cell");
            cell.classList.add("hidden");
            cell.dataset.outer = outer;
            cell_elements.push(cell);
            frag.appendChild(cell);
        }
        board_element.replaceChildren(frag);
    }

    function create_board(first) {
        //game start
        actions.start();

        let available = pool.length;

        //removes the first click from the pool
        pool[first] = pool[--available];
        pool.pop();

        //picks random cells to be mines
        for (let placed = 0; placed < mine_count; placed++) {
            const random = (Math.random() * available) | 0;
            const outer = pool[random];

            pool[random] = pool[--available];
            pool[available] = outer;

            board[outer] = -1;

            //increment cell mine neighbors
            for (let offset of directions) {
                const neighbor = (outer + offset);
                if (visit[neighbor]) continue; //filter out visited and flagged cells
                if (board[neighbor] === -1) continue; //not a mine
                board[neighbor]++;
            }
        }
        //amount of mine neighbors a cell has
        for (const cell of cell_elements) cell.setAttribute("data-n", board[cell.dataset.outer]);
        board_ready = true;
    }

    function reset_cells() {
        for (const inner of dirty) {
            const cell = cell_elements[inner];
            delete cell.dataset.n;
            cell.classList.replace("revealed", "hidden");
            cell.classList.replace("flagged", "hidden");
            cell.textContent = "";
        }
        dirty = [];
    }

    //flood fill
    function reveal_cells(start) {
        const queue = [start];
        let head = 0;

        while (head < queue.length) {
            const top = queue[head++];

            for (const offset of directions) {
                const neighbor = top + offset;
                if (visit[neighbor]) continue; //already visited or flagged
                if (board[neighbor] === -1) continue; //mine

                const inner = get_inner(neighbor)
                const cell = cell_elements[inner];
                visit[neighbor] = 1;
                dirty.push(inner);
                reveal_count++;

                cell.classList.replace("hidden", "revealed");

                if (!board[neighbor]) queue.push(neighbor);  //if cell is empty 0, then expand
            }
        }
    }

    //reveals a single cell from click, if cell has 0 neighbors then flood fill
    function reveal(inner, outer) {
        if (!board_ready) create_board(inner);
        visit[outer] = 1;
        dirty.push(inner);
        reveal_count++;
        cell_elements[inner].classList.replace("hidden", "revealed");
        if (!board[outer]) reveal_cells(outer); //if empty 0, then flood fill
        check_win();
    }

    function check_win() {
        if (reveal_count === safe_cells) {
            game_over = true;
            actions.win();
            return;
        }
    }

    function check_lose(outer) {
        if (board[outer] === -1) {
            game_over = true;
            actions.lose();
            return true;
        }
        return false;
    }

    function flag(inner, outer) {
        const cell = cell_elements[inner];
        if (visit[outer] === 2) {
            visit[outer] = 0;
            actions.flag(++mines_left);
            cell.classList.replace("flagged", "hidden");
            return;
        }
        if (visit[outer] === 0) {
            visit[outer] = 2;
            actions.flag(--mines_left);
            dirty.push(inner);

            cell.classList.replace("hidden", "flagged");
            return;
        }
    }

    function left_click(event) {
        actions.click();
        if (game_over) return;
        const cell = event.target;
        if (!cell.dataset.outer) return;
        const outer = Number(cell.dataset.outer);
        if (visit[outer]) return; //if visited if flagged
        if (check_lose(outer)) return;
        reveal(get_inner(outer), outer);
    }

    function right_click(event) {
        if (game_over) return;
        const cell = event.target;
        if (!cell.dataset.outer) return;
        const outer = Number(cell.dataset.outer);
        if (visit[outer] === 1) return; //if visited
        flag(get_inner(outer), outer);
    }

    //first time
    setup();
    draw_board();

    function init() {
        reset_cells();

        pool = cell_indexes.slice();

        board.fill(0);
        visit.fill(0);

        // top and bottom rows
        visit.fill(1, 0, cols);
        visit.fill(1, (rows - 1) * cols, rows * cols);

        // left right cols
        for (let r = 0; r < rows; r++) {
            visit[r * cols + 0] = 1;
            visit[r * cols + (cols - 1)] = 1;
        }

        mines_left = mine_count;
        reveal_count = 0;
        board_ready = false;
        game_over = false;

        actions.init(mines_left);
    }

    const on_contextmenu = event => { event.preventDefault(); right_click(event); };

    init();
    board_element.addEventListener("click", left_click);
    board_element.addEventListener("contextmenu", on_contextmenu);

    return {
        reset: init,

        destroy() {
            board_element.removeEventListener("click", left_click);
            board_element.removeEventListener("contextmenu", on_contextmenu);
            board_element.replaceChildren();
        }
    };
}