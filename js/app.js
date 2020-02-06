let game = { // весь игровой код
    ctx: null,
    grenade: null,

    platformLeft: null,
    platformRight: null,
    platformChoiceControl: "platformLeft",

    trash: null,

    blocks: [],
    rows: 3,
    cols: 9,

    grenadeStart: false,
    grenadeMoveInPlatform: true,

    sprites: {
        background: null,
        grenade: null,
        platformLeft: null,
        platformRight: null,
        trash: null,
    },

    start() { // запускает игру
        this.init();
        this.preload(() => {
            this.create();
            this.run();
        });
    },

    // инициализация
    init() {
        this.ctx = document.getElementById('myGame').getContext("2d"); // доступ к апи
        this.setEvents();
    },

    setEvents() {
        window.addEventListener("keydown", e => {
            if (e.code === "Space") {
                this.grenadeStart = true;
                this.grenadeMoveInPlatform = false;
            }
            if (e.code === "KeyA" || e.code === "ArrowLeft") {
                if (this.platform.x > 5) {
                    this.platform.moveLeft(this.grenadeMoveInPlatform);
                    this.platformChoiceControl = "platformLeft";
                }
            }
            if (e.code === "KeyD" || e.code === "ArrowRight") {
                if (this.platform.x < 500) {
                    this.platform.moveRight(this.grenadeMoveInPlatform);
                    this.platformChoiceControl = "platformRight";
                }
            }
        });
    },

    // предзагрузка всякого
    preload(callback) {
        let loaded = 0;
        let required = Object.keys(this.sprites).length;

        let onImageLoad = () => {
            loaded++;
            if (loaded >= required) {
                callback(); // запуск, если все картинки загружены
            }
        };

        for (let key in this.sprites) {
            this.sprites[key] = new Image();
            this.sprites[key].src = `img/${key}.png`;
            this.sprites[key].addEventListener("load", onImageLoad);
        }
    },

    // генерация мусорок-объектов
    create() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                this.blocks.push({
                    x: 60 * col,
                    y: 60 * row
                });
            }
        }
    },

    // рендер
    render() {
        this.ctx.drawImage(this.sprites.background, 0, 0);
        this.ctx.drawImage(this.sprites.grenade, 0, 0,
            this.grenade.width, this.grenade.height,
            this.grenade.x, this.grenade.y,
            this.grenade.width, this.grenade.height);
        if (this.platformChoiceControl === "platformLeft") {
            this.ctx.drawImage(this.sprites.platformLeft, this.platform.x, this.platform.y);
        } else if (this.platformChoiceControl === "platformRight") {
            this.ctx.drawImage(this.sprites.platformRight, this.platform.x, this.platform.y);
        }

        for (let block of this.blocks) {
            this.ctx.drawImage(this.sprites.trash, 50 + block.x, 10 + block.y);
        }
    },

    
    update() {
        if (this.grenadeStart) {
            this.grenade.move();
        }
    },

    // запуск
    run() {
        window.requestAnimationFrame(() => { // отрисовка после всех инструкций
            this.update();
            this.render();
            this.run();
        });
    },
};


game.platform = {
    x: 255,
    y: 300,
    moveLeft(grenadeMove) {
        this.x -= 15;
        if (grenadeMove !== false) {
            game.grenade.x -= 15;
        }
    },
    moveRight(grenadeMove) {
        this.x += 15;
        if (grenadeMove !== false) {
            game.grenade.x += 15;
        }
    }
};

game.grenade = {
    x: 300,
    y: 270,
    width: 40,
    height: 40,
    move() {
        this.y -= 0.5;
    }
};

// Запускает игру только после того, как загрузился весь HTML-документ
window.addEventListener("load", () => {
    game.start();
});