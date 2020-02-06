let game = { // весь игровой код

    // загружаемые картинки
    sprites: {
        background: null,
        grenade: null,
        platformLeft: null,
        platformRight: null,
        trash: null,
    },

    setSettings() {
        this.width = 640; // ширина экрана
        this.height = 360;  // высота экрана

        this.angleGrenade = this.numRandom(-2, 2); // угол куда стартанёт граната
        this.platformChoiceControl = "platformLeft"; // куда смотрит платформа изначально

        this.blocks = []; // массив под мишени
        this.rows = 3; // количество строк мишеней-мусорок
        this.cols = 9;  // количестов колонок мишеней-мусорок

        this.grenadeStart = false; // false - стартует после нажатия пробела
        this.grenadeMoveInPlatform = true; // - граната вначале движется с платформой
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
        this.setSettings();
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
        this.ctx.clearRect(0, 0, this.width, this.height); // очистка экрана

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

    numRandom(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min)
    }
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
        this.y -= 1;
        this.x += game.angleGrenade;
    },
};

// Запускает игру только после того, как загрузился весь HTML-документ
window.addEventListener("load", () => {
    game.start();
});