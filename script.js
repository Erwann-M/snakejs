// Au chargement de la fenêtre, execute la fonction
window.onload = function() {

    var selectElement;

    var canvas;
    var canvasWidth = 1050; // 900
    var canvasHeight = 750; // 600
    var blockSize = 30;
    var context;
    var delay = 100;
    var snakee;
    var applee;
    var widthInBlocks = canvasWidth / blockSize;
    var heightInBlocks = canvasHeight / blockSize;
    var score;
    var timeOut;

    var scoreColor = "gray";
    var canvasBackgroundColor = "#e9c46a";
    var canvasBorderColor = "#264653";
    var snakeColor = "#2a9d8f";
    var appleColor = "#bc4749";

    init();

    // Pour initialiser les paramètres
    function init() {
        var bodyHtml = document.body;
        var options = [[100, "normal"], [200, "rapide"], [300, "God mode"]];
        selectElement = document.createElement("select");
        selectElement.id = "level";
        for(var i = 0; i < options.length; i++) {
            var option = document.createElement("option");
            option.value = options[i][0];
            option.text = options[i][1];
            selectElement.appendChild(option);
        };

        canvas = document.createElement('canvas');
        
        bodyHtml.appendChild(canvas);
        bodyHtml.appendChild(selectElement);
        // Définition de sa hauteur/largeur
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

        // Style de bordure
        canvas.style.border = "20px solid " + canvasBorderColor;
        canvas.style.borderRadius = "20px";
        canvas.style.margin = "10px auto";
        canvas.style.display = "block";
        canvas.style.backgroundColor = canvasBackgroundColor;
        canvas.style.boxShadow = "inset 0px 0px 15px 1px black, 0px 0px 15px 1px black";

        // ballancé le canva danss le html
        context = canvas.getContext('2d');
        snakee = new Snake([[6, 4], [5, 4], [4, 4]], "right");
        applee = new Apple([10, 10]);
        applee.setNewPosition();
        score = 0;
        refreshCanvas();
    };
    
    // Pour raffraichir le canvas
    function refreshCanvas() {
        snakee.advance();

        if(snakee.checkCollision()) {
            gameOver();
        }
        else {
            if(snakee.isEatingApple(applee)) {
                score++;
                snakee.ateApple = true;
                do {
                    applee.setNewPosition();
                }
                while(applee.isOnSnake(snakee));
            };
            // on clear tout le canvas
            context.clearRect(0, 0, canvasWidth, canvasHeight);

            // On dessine le serpent et la pomme
            drawScore();
            snakee.draw();
            applee.draw();
            timeOut = setTimeout(refreshCanvas, delay);
        };
        
    };

    function gameOver() {
        context.save();
        context.fillStyle = canvasBorderColor;
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.strokeStyle = "#faedcd";
        context.lineWidth = 5;
        var centreX = canvasWidth / 2;
        var centreY = canvasHeight / 2;

        context.font = "bold 80px sans-serif";
        context.strokeText("Game Over", centreX, centreY - 100);
        context.fillText("Game Over", centreX, centreY - 100);

        context.font = "bold 30px sans-serif";
        context.strokeText("Appuyez sur la touche ESPACE pour rejouer.", centreX, centreY);
        context.fillText("Appuyez sur la touche ESPACE pour rejouer.", centreX, centreY);

        context.font = "bold 70px sans-serif";
        context.strokeText("Votre Score: " + score.toString(), centreX, centreY + 100);
        context.fillText("Votre Score: " + score.toString(), centreX, centreY + 100);

        
        context.restore();
    };

    function restart() {
        snakee = new Snake([[6, 4], [5, 4], [4, 4]], "right");
        applee = new Apple([10, 10]);
        applee.setNewPosition(); 
        score = 0;
        clearTimeout(timeOut);
        refreshCanvas();
    };

    function drawScore() {
        context.save();
        context.font = "bold 50px sans-serif";
        context.fillStyle = scoreColor;
        context.fillText(score.toString(), 15, canvasHeight - 15);

        context.restore();
    }

    function drawBlock(context, position) {
        var x = position[0] * blockSize;
        var y = position[1] * blockSize;
        context.fillRect(x, y, blockSize, blockSize);
    };

    function Snake(body, direction){
        this.body = body;
        this.direction = direction;
        this.ateApple = false;
        this.draw = function(){
            // sauvegarde le contenu
            context.save();
            context.fillStyle = snakeColor;
            for(var i = 0; i < this.body.length; i++){
                drawBlock(context, this.body[i]);
            };
            context.restore();
        };
        this.advance = function() {
            // on copie la tête
            var nextPosition = this.body[0].slice();
            // et on la décale de 1 dans la direction voulu
            switch(this.direction) {
                case "left":
                    nextPosition[0] -= 1;
                    break;
                case "right":
                    nextPosition[0] += 1;
                    break;
                case "down":
                    nextPosition[1] += 1;
                    break;
                case "up":
                    nextPosition[1] -= 1;
                    break;
                default:
                    throw("Invalid Direction");
            };
            this.body.unshift(nextPosition);
            if(!this.ateApple) {
                // on supprime la dernière position
                this.body.pop();
            }
            else {
                this.ateApple = false;
            };
        };
        this.setDirection = function(newDirection){
            var allowedDirections;
            switch(this.direction) {
                case "left":
                case "right":
                    allowedDirections = ["up", "down"];
                    break;
                case "down":
                case "up":
                    allowedDirections = ["right", "left"];
                    break;
                default:
                    throw("Invalid Direction");
            };
            // si la direction est permise, elle renvera l'index de la direction défini dans le switch au dessus.
            if(allowedDirections.indexOf(newDirection) > -1) {
                this.direction = newDirection;
            };
        };

        this.checkCollision = function() {
            var wallCollision = false;
            var snakeCollision = false;
            var head = this.body[0];
            var rest = this.body.slice(1);

            var snakeX = head[0];
            var snakeY = head[1];

            var minX = 0;
            var minY = 0;
            var maxX = widthInBlocks - 1;
            var maxY = heightInBlocks - 1;

            var isNotBetweenHorizontalWalls = snakeX < minX || snakeX > maxX;
            var isNotBetweenVerticalWalls = snakeY < minY || snakeY > maxY;

            if(isNotBetweenHorizontalWalls || isNotBetweenVerticalWalls) {
                wallCollision = true;
            };

            for(var i = 0; i < rest.length; i++) {
                if(snakeX === rest[i][0] && snakeY === rest[i][1]) {
                    snakeCollision = true;
                };
            };

            return wallCollision || snakeCollision;

        };
        this.isEatingApple = function(appleToEat) {
            var head = this.body[0];
            if(head[0] === appleToEat.position[0] && head[1] === appleToEat.position[1]) 
                return true;
            else
                return false;
        };
    };

    function Apple(position) {
        this.position = position;
        this.draw = function() {
            context.save();
            context.fillStyle = appleColor;
            context.beginPath();
            var radius = blockSize / 2;
            var x = this.position[0] * blockSize + radius;
            var y = this.position[1] * blockSize + radius;
            context.arc(x, y, radius, 0, Math.PI*2, true);
            context.fill();
            context.restore();
        };
        this.setNewPosition = function() {
            var newX = Math.round(Math.random() * (widthInBlocks - 1));
            var newY = Math.round(Math.random() * (heightInBlocks - 1));
            this.position = [newX, newY];
        };
        this.isOnSnake = function(snakeToCheck) {
            var isOnSnake = false;

            for(var i = 0; i < snakeToCheck.body.length; i++) {
                if(this.position[0] === snakeToCheck.body[i][0] && this.position[1] === snakeToCheck.body[i][1]) {
                    isOnSnake = true;
                };
            };
            return isOnSnake;
        };
    };

    document.onkeydown = function handleKeyDown(e) {
        var newDirection;
        switch(e.key){
            case "ArrowLeft":
                newDirection = "left";
                break;
            case "ArrowRight":
                newDirection = "right";
                break;
            case "ArrowDown":
                newDirection = "down";
                break;
            case "ArrowUp":
                newDirection = "up";
                break;
            case " ":
                restart();
                return;
            default:
                return;
        };
        snakee.setDirection(newDirection);

    };
}