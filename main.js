const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

class Balloon {
    constructor() {
        this.x = canvas.width - 213; 
        this.y = canvas.height - 150; 
        this.size = 30;
        this.balloonImages = [
            'assets/10025.png', 'assets/10026.png', 'assets/100001.png',
            'assets/100002.png', 'assets/100003.png', 'assets/100004.png',
            'assets/100005.png', 'assets/100006.png', 'assets/100007.png',
            'assets/100008.png', 'assets/100009.png', 'assets/100010.png',
            'assets/100011.png'
        ];
        this.image = new Image();
        this.image.src = this.balloonImages[Math.floor(Math.random() * this.balloonImages.length)];
        this.isInflating = false;
        this.isFlying = false;
        this.isBurst = false;
        this.dx = 0;
        this.dy = 0;
    }

    inflate() {
        if (this.isInflating && !this.isFlying && this.size < 80) {
            this.size += 0.5;
            this.y -= 0.5; 
            if (this.size >= 80) {
                this.startFlying();
            }
        }
    }

    startFlying() {
        this.isFlying = true;
        this.dx = (Math.random() - 0.5) * 4;
        this.dy = -Math.random() * 4 - 3; // Stronger upward force
    }

    update() {
        if (this.isFlying && !this.isBurst) {
            this.x += this.dx;
            this.y += this.dy;
            if (this.x < this.size || this.x > canvas.width - this.size) {
                this.dx *= -1;
            }
            if (this.y < this.size || this.y > canvas.height - this.size) {
                this.dy *= -0.8;
                this.y = Math.max(this.size, Math.min(this.y, canvas.height - this.size));
            }
            
            this.dy += 0.05;
        }
    }

    draw() {
        if (!this.isBurst && this.image.complete) {
            ctx.drawImage(this.image, this.x - this.size, this.y - this.size, 
                         this.size * 2, this.size * 2);
        }
    }

    checkTap(mouseX, mouseY) {
        if (this.isFlying && !this.isBurst) {
            const distance = Math.sqrt(
                Math.pow(mouseX - this.x, 2) + Math.pow(mouseY - this.y, 2)
            );
            if (distance < this.size) {
                this.burst();
            }
        }
    }

    burst() {
        this.isBurst = true;
        setTimeout(() => {
            game.createNewBalloon();
        }, 1000);
    }
}

class AirPump {
    constructor() {
        this.x = canvas.width - 150; 
        this.y = canvas.height - 120;
        this.width = 140;
        this.height = 140; 
        this.leverHeight = 80; 
        this.isPressed = false;
        
        this.baseImage = new Image();
        this.baseImage.src = 'assets/320003.png';
        this.leverImage = new Image();
        this.leverImage.src = 'assets/320001.png';
        this.tipImage = new Image();
        this.tipImage.src = 'assets/320002.png';
        
        this.leverY = this.y - 40;
        this.maxLeverMove = 35; 
    }

    draw() {

        if (this.tipImage.complete) {
            ctx.drawImage(this.tipImage, this.x - 110, this.y - 30, 180, 120);
        }
        if (this.leverImage.complete) {
            ctx.drawImage(this.leverImage, this.x + 20, this.leverY, 
                         this.width - 40, this.leverHeight);
        }
    
        if (this.baseImage.complete) {
            ctx.drawImage(this.baseImage, this.x, this.y, this.width, this.height);
        }
    }

    update() {
        const targetY = this.isPressed ? this.y + this.maxLeverMove : this.y - 40;
        this.leverY += (targetY - this.leverY) * 0.2;
    }

    checkClick(mouseX, mouseY) {
        return (
            mouseX > this.x &&
            mouseX < this.x + this.width &&
            mouseY > this.y - 40 &&
            mouseY < this.y + this.height
        );
    }
}

class Game {
    constructor() {
        this.balloon = new Balloon();
        this.pump = new AirPump();
        this.init();
    }

    init() {
        canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        canvas.addEventListener('mouseup', () => this.handleMouseUp());
        this.gameLoop();
    }

    handleMouseDown(e) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        if (this.pump.checkClick(mouseX, mouseY)) {
            this.pump.isPressed = true;
            this.balloon.isInflating = true;
        } else {
            this.balloon.checkTap(mouseX, mouseY);
        }
    }

    handleMouseUp() {
        this.pump.isPressed = false;
        this.balloon.isInflating = false;
    }

    createNewBalloon() {
        this.balloon = new Balloon();
    }

    update() {
        this.balloon.inflate();
        this.balloon.update();
        this.pump.update();
    }

    draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        this.pump.draw();
        this.balloon.draw();
    }

    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
}
const game = new Game();