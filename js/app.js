let game = { // весь игровой код
    // загружаемые картинки
    sprites: {
        background: null,
        gameover_restart: null,
        gameover_quit: null,
        gamewin_restart: null,
        gamewin_quit: null,
        grenade: null,
        platformLeft: null,
        platformRight: null,
        trash: null,
    },
    gameWork: 'run',

    setSettings() {
        this.width = 640; // ширина экрана
        this.height = 360;  // высота экрана

        this.angleGrenade = this.numRandom(-2.5, 2.5); // угол X куда стартанёт граната
        this.speedGrenade = 1;
        this.platformChoiceControl = "platformLeft"; // куда смотрит платформа изначально

        this.blocks = []; // массив под мишени
        this.rows = 3; // количество строк мишеней-мусорок
        this.cols = 9;  // количестов колонок мишеней-мусорок
        this.counterBlocks = this.rows * this.cols;

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
                    active: true, // жив ли объект
                    width: 55,
                    height: 65,
                    x: 65 * col,
                    y: 50 * row
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
            if (block.active === true) {
                this.ctx.drawImage(this.sprites.trash, 30 + block.x, 10 + block.y);
            }
        }
    },


    update() {
        if (this.grenadeStart) {
            this.grenade.move();
            this.collidePlatform();
        }
        this.collideBlocks();
        this.collideWorldBorders();
    },

    collideBlocks() {
        for (let block of this.blocks) {
            if (block.active === true) {
                if (this.grenade.collide(block)) { // проверка столкновения гранаты с мусоркой
                    this.grenade.bumpBlock(block);
                }
            }
        }
    },

    collidePlatform() {
        if (this.grenade.collide(this.platform)) {
            this.grenade.bumpPlatform();
        }
    },

    collideWorldBorders() {
        let x = game.grenade.x;
        let y = game.grenade.y;

        if (x <= 0 ||
            x + game.grenade.width >= this.width) {
            game.angleGrenade *= -1;
        }
        if (y <= 0 ) {
            game.speedGrenade *= -1;
        }
        if (y > this.height) {
            this.gameWork = 'gameover';
        }
        return false;
    },

    // запуск
    run() {
        if ( this.gameWork === 'run' ) {
            window.requestAnimationFrame(() => { // отрисовка после всех инструкций
                this.update();
                this.render();
                this.run();
            });
        }

        if ( this.gameWork === 'gameover') {
            this.gameOver();
        }

        if (this.gameWork === 'gamewin') {
            this.gameWin();
        }

    },
    gameOver() {
        this.ctx.drawImage(this.sprites.gameover_restart, 0, 0);
        let status = 'restart';
        window.addEventListener("keydown", e => {
            if (e.code === "KeyS" || e.code === "ArrowDown") {
                this.ctx.drawImage(this.sprites.gameover_quit, 0, 0);
                status = 'quit';
            } else if (e.code === "KeyW" || e.code === "ArrowUp") {
                this.ctx.drawImage(this.sprites.gameover_restart, 0, 0);
                status = 'restart';
            }

            if (e.code === "Space" && status === 'restart') {
                location.reload();
            } else if (e.code === "Space" && status === 'quit') {
                alert('Выйти');
            }

        });
    },
    gameWin() {
        this.ctx.drawImage(this.sprites.gamewin_restart, 0, 0);
        let status = 'restart';
        window.addEventListener("keydown", e => {
            if (e.code === "KeyS" || e.code === "ArrowDown") {
                this.ctx.drawImage(this.sprites.gamewin_quit, 0, 0);
                status = 'quit';
            } else if (e.code === "KeyW" || e.code === "ArrowUp") {
                this.ctx.drawImage(this.sprites.gamewin_restart, 0, 0);
                status = 'restart';
            }

            if (e.code === "Space" && status === 'restart') {
                location.reload();
            } else if (e.code === "Space" && status === 'quit') {
                alert('Выйти');
            }

        });
    },
    numRandom(min, max) {
        return min + Math.random() * (max - min);
    }
};


game.platform = {
    x: 255,
    y: 300,
    width: 130,
    height: 52,
    moveLeft(grenadeMove) {
        this.x -= 20;
        if (grenadeMove !== false) {
            game.grenade.x -= 15;
        }
    },
    moveRight(grenadeMove) {
        this.x += 20;
        if (grenadeMove !== false) {
            game.grenade.x += 15;
        }
    }
};

game.grenade = {
    x: 300,
    y: 260,
    width: 9,
    height: 40,
    move() {
        this.y -= game.speedGrenade;
        this.x += game.angleGrenade;
    },
    collide(object) {
        if ( this.x + this.width > object.x &&
            this.x < object.x + object.width &&
            this.y + this.height > object.y &&
            this.y < object.y + object.height ) {
                return true;
        }
        return false;
    },
    bumpBlock(block) {
        game.speedGrenade *= -1; // меняет направление в случае удара
        block.active = false;
        game.counterBlocks--; // уменьшает количество блоков
        if (game.counterBlocks === 0) {
            game.gameWork = 'gamewin';
        }
    },
    bumpPlatform() {
        if (game.speedGrenade === 1) {
            return; // прервать, если уже изменено направление
        }
        game.speedGrenade *= -1; // меняет направление в случае удара
        this.calculateAngle();
    },
    calculateAngle() {
        this.touchX = (this.x + this.width / 2) - game.platform.x; // координата касания гранаты с платформой

        let leftPartPlatform = game.platform.width / 2; // 65
        let rightPartPlatform = game.platform.width;    // 130
        if (this.touchX > 0 && this.touchX < leftPartPlatform) {
            game.angleGrenade = -((2.5 / leftPartPlatform) * ( 65 - this.touchX));
        } else if (this.touchX > leftPartPlatform && this.touchX < rightPartPlatform) {
            game.angleGrenade = (2.5 / leftPartPlatform) * (this.touchX - leftPartPlatform);
        }
    }
};

// Запускает игру только после того, как загрузился весь HTML-документ
window.addEventListener("load", () => {
    game.start();
});