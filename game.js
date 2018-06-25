(function() {
    var game = {
        bear: {
            display: true,
            position: {
                x: 0,
                y: 0
            }
        },
        player: {
            dead: false,
            position: {
                x: 0,
                y: 0
            }
        },
        init: function() {
            game.createTable();
            game.setListeners();
            game.generateEnvironment();
            game.displayGame();
        },
        deleteGameImages: function() {
            var cells = document.querySelectorAll('#game-table td > img');
            [].forEach.call(cells, function(cell) {
                cell.parentNode.removeChild(cell);
            });
        },
        displayGame: function() {
            game.deleteGameImages();
            game.displayAt(
                {
                    x: game.player.position.x,
                    y: game.player.position.y
                },
                'icons/hiker.png'
            );
            game.displayAt(
                {
                    x: game.bear.position.x,
                    y: game.bear.position.y
                },
                'icons/bear.png'
            );
            game.displayArrows();
        },
        displayArrows: function() {
            var dirs = game.getDirectionCoords(game.player.position);

            for (var dire in dirs) {
                if (game.validPosition(dirs[dire])) {
                    var newBtn = game.displayAt(dirs[dire], 'icons/' + dire + '.png');
                    newBtn.setAttribute('class', 'directionBtn');
                    newBtn.setAttribute('data-pos', JSON.stringify(dirs[dire]));
                    newBtn.addEventListener('click', function(){game.movePlayer(JSON.parse(this.getAttribute('data-pos')))});
                }
            }
        },
        movePlayer: function(pos, moveBear = true) {
            if (!game.validPosition(pos)) {
                return false;
            }
            game.player.position = pos;
            if (game.checkCollision()) {
                alert('You have died.');
                game.exit();
                return false;
            }
            if (moveBear) {
                game.moveBear();
            }
            if (game.checkCollision()) {
                alert('You have died.');
                game.exit();
                return false;
            }
        },
        checkCollision: function(pos1 = false, pos2 = false) {
            if (!pos1 || !pos2) {
                pos1 = game.player.position;
                pos2 = game.bear.position;
            }
            if (pos1.x == pos2.x && pos1.y == pos2.y) {
                return true;
            }
            return false;
        },
        moveBear: function(pos = false) {
            if (!pos) {
                var randPos = game.moveRandDirection(game.bear.position);
                if (game.validPosition(randPos)) {
                    if (game.checkCollision(randPos, game.player.position) && game.ranNum(0, 100) > 50) {
                        game.moveBear();
                    } else {
                        game.bear.position = randPos;
                    }
                } else {
                    game.moveBear();
                }
            } else {
                game.bear.position = pos;
            }
            game.displayGame();
        },
        validPosition: function(pos = false) {
            if (pos == undefined || pos == false) {
                return false;
            }
            if (pos.x >= 0 && pos.x <= 9 && pos.y >= 0 && pos.y <= 9) {
                return true;
            }
            return false;
        },
        moveRandDirection: function(pos) {
            var newPos = Object.assign({}, pos);
            var dirMap = { 1:'north', 2:'east', 3:'south', 4:'west'};
            var dirs   = game.getDirectionCoords(newPos);
            var self   = game;

            for (var dire in dirs) {
                if (!self.validPosition(dirs[dire])) {
                    delete dirs[dire];
                }
            }

            if (dirs.length < 1) {
                game.exit();
                return false;
            }

            var rand = game.ranNum(1, 4);

            return dirs[dirMap[rand]];
        },
        displayAt: function(pos, src) {
            if (!pos) {
                return;
            }
            var cell = game.getCell({x:pos.x,y:pos.y});
            if (!cell) {
                return;
            }
            var img  = new Image(45,45);
            img.src  = src;
            cell.appendChild(img);
            return img;
        },
        getCell: function(positions) {
            return document.querySelector("tr[data-row='" + positions.y + "'] > .cell[data-col='" + positions.x + "']");
        },
        generateEnvironment: function() {
            game.player.position = game.getRandomLocation();
            game.bear.position = game.getRandomLocation(3);
        },
        getRandomLocation: function(playerCheck = false) {
            var pos = {
                x: game.ranNum(0, 9),
                y: game.ranNum(0, 9)
            };
            if (playerCheck === false) {
                return pos;
            } else {
                // If one position is too close to the player, move it
                if (Math.abs(pos.x - game.player.position.x) <= playerCheck && Math.abs(pos.y - game.player.position.y) <= playerCheck) {
                    return game.getRandomLocation(playerCheck);
                }
                return pos;
            }
        },
        setListeners: function() {
            document.querySelector('#btn-inventory').addEventListener('click', function(){game.showInventory()});
            document.querySelector('#btn-hints').addEventListener('click', function(){game.showHints()});
            document.querySelector('#btn-help').addEventListener('click', function(){game.showHelp()});
            document.addEventListener('keydown', game.handleKeyboardEvent, false);
        },
        handleKeyboardEvent: function(e) {
            if (game.player.dead) {
                return;
            }
            var dirs = game.getDirectionCoords(game.player.position);

            if (!e) {e = window.event;} // for old IE compatible
            var keycode = e.keyCode || e.which; // also for cross-browser compatible

            var info = document.getElementById("info");
            switch (keycode) {
                case 37:
                    game.movePlayer(dirs.west);
                    break;
                case 38:
                    game.movePlayer(dirs.north);
                    break;
                case 39:
                    game.movePlayer(dirs.east);
                    break;
                case 40:
                    game.movePlayer(dirs.south);
                    break;
            }
        },
        getDirectionCoords: function(pos) {
            var posCopy = Object.assign({}, pos);
            var west    = {x: posCopy.x - 1, y: posCopy.y};
            var east    = {x: posCopy.x + 1, y: posCopy.y};
            var north   = {x: posCopy.x, y: posCopy.y - 1};
            var south   = {x: posCopy.x, y: posCopy.y + 1};
            return {
                west: west,
                east: east,
                north: north,
                south: south
            }
        },
        showInventory: function() {
            if (game.player.dead) {
                return;
            }
        },
        showHints: function() {
            game.generateEnvironment();
            game.displayGame();
        },
        showHelp: function() {
        },
        createTable: function() {
            var cont = document.querySelector('#game-container');
            var table = cont.appendChild(document.createElement('table'));
            table.id='game-table';
            table.setAttribute('cellpadding', '0');
            table.setAttribute('cellspacing', '0');
            var total = 0;

            for (var i = 0; i < 10; i++) {
                var row = table.appendChild(document.createElement('tr'));
                row.setAttribute('data-row', i);

                for (var j = 0; j < 10; j++) {
                    total++;
                    var cell = row.appendChild(document.createElement('td'));
                    cell.setAttribute('data-cell', total);
                    cell.setAttribute('data-col', j);
                    cell.setAttribute('class', 'cell');
                    cell.id = 'cell-'+ total;
                }
            }
        },
        ranNum: function(min = 0, max = 100) {
            return Math.floor(Math.random()*(max-min+1)+min);
        },
        exit: function() {
            game.player.dead = true;
            game.deleteGameImages();
        }
    };

try {
    game.init();
} catch(e) {
    // statements
}

})();