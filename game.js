(function() {
    var items = {
        shortSword: {
            name: 'Short Sword',
            damage: 5,
            materials: [
                {'iron': 2},
                {'wood': 1}
            ],
            carryWeight: 3
        },
        basicSword: {
            name: 'Basic Sword',
            damage: 8,
            materials: [
                {'iron': 3},
                {'bronze': 1},
                {'wood': 1}
            ],
            carryWeight: 5
        },
        megaSword: {
            name: 'Mega Sword',
            damage: 12,
            materials: [
                {'iron': 4},
                {'gold': 2},
                {'wood': 1}
            ],
            carryWeight: 9
        },
        basicAxe: {
            name: 'Basic Axe',
            damage: 3,
            materials: [
                {'iron': 2},
                {'wood': 1}
            ]
        },
        solidAxe: {
            name: 'Solid Axe',
            damage: 6,
            materials: [
                {'iron': 3},
                {'bronze': 1},
                {'wood': 1}
            ]
        },
        iron: {
            name: 'Iron Bar',
            carryWeight: 2,
            envType: 'mine'
        },
        bronze: {
            name: 'Bronze Bar',
            carryWeight: 2,
            envType: 'mine'
        },
        gold: {
            name: 'Gold Bar',
            carryWeight: 2,
            envType: 'mine'
        },
        wood: {
            name: 'Wood',
            carryWeight: 1,
            envType: 'forest'
        },
    };
    var inventory = {
        maxCarryWeight: 100,
        currentCarryWeight: 0,
        current: [],

        giveItem: function(giveItem, count = 1) {
            if (this.hasItem(giveItem)) {
                this.current[giveItem].count += count;
            } else {
                this.current[giveItem] = {count: count};
            }
            inventory.currentCarryWeight += (items[giveItem].carryWeight * count);
        },
        removeItem: function(removeItem, count = 1) {
            if (this.hasItem(removeItem)) {
                if (this.current[removeItem].count > count) {
                    this.current[removeItem].count -= count;
                } else {
                    delete this.current[removeItem];
                }
                inventory.currentCarryWeight -= (items[removeItem].carryWeight * count);
            } else {
                return false;
            }
        },
        hasItem: function(item, count = 1) {
            if (this.current[item] === undefined) {
                return false;
            }
            if (this.current[item].count >= count) {
                return true;
            }
            return false;
        }
    };
    var game = {
        paused: false,
        startPosition: {
            x: 0,
            y: 0
        },
        environment: {},
        bear: {
            display: true,
            position: {
                x: 0,
                y: 0
            }
        },
        player: {
            xp: 0,
            level: 1,
            display: true,
            dead: false,
            position: {
                x: 0,
                y: 0
            }
        },
        levelScale: 0.04,
        init: function() {
            game.createTable();
            game.setListeners();
            game.generateEnvironment();
            game.startPosition = game.player.position;
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

            game.displayAt(game.player.position, 'icons/player.png', 10);
            game.displayAt(game.startPosition, 'icons/cabin.png');

            if (game.bear.display) {
                game.displayAt(game.bear.position, 'icons/bear.png', 10);
            }

            for (var env in game.environment) {
                game.displayAt(
                    game.environment[env].position,
                    'icons/' + game.environment[env].envType + '.png',
                    game.environment[env].zIndex
                );
            }

            game.displayArrows();
            game.locationChecks();
        },
        giveXP: function(count) {
            game.player.xp += count;
            game.player.level = Math.ceil(game.levelScale * Math.sqrt(game.player.xp));
            document.querySelector('#btn-xp').innerHTML = 'XP: '+game.player.xp;
            document.querySelector('#btn-level').innerHTML = 'Level: '+game.player.level;
        },
        locationChecks: function() {
            if (game.withinXBlocks(game.bear.position, game.player.position, 2)) {
                document.querySelector('#game-table').setAttribute('class', 'bear-close');
            } else {
                document.querySelector('#game-table').setAttribute('class', '');
            }
        },
        toggleBearVisibility: function() {
            game.bear.display = !game.bear.display;
            game.displayGame();
        },
        togglePlayerVisibility: function() {
            game.player.display = !game.player.display;
            game.displayGame();
        },
        displayArrows: function() {
            var dirs = game.getDirectionCoords(game.player.position);

            for (var dire in dirs) {
                if (game.validPosition(dirs[dire])) {
                    var newBtn = game.displayAt(dirs[dire], 'icons/' + dire + '.png');
                    newBtn.setAttribute('class', 'directionBtn');
                    newBtn.setAttribute('data-pos', JSON.stringify(dirs[dire]));
                    newBtn.addEventListener('click', function(){game.movePlayer(JSON.parse(this.getAttribute('data-pos')));});
                }
            }
        },
        movePlayer: function(pos, moveBear = true) {
            if (!game.validPosition(pos) || game.paused !== false) {
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
        displayAt: function(pos, src, zIndex = 0) {
            if (!pos) {
                return;
            }
            var cell = game.getCell({x:pos.x,y:pos.y});
            if (!cell) {
                return;
            }
            var img  = new Image(45,45);
            img.src  = src;

            if (zIndex > 0) {
                img.style.zIndex = zIndex;
            }

            cell.appendChild(img);
            return img;
        },
        getCell: function(positions) {
            return document.querySelector('tr[data-row=\'' + positions.y + '\'] > .cell[data-col=\'' + positions.x + '\']');
        },
        generateEnvironment: function() {
            game.player.position = game.getRandomLocation();
            game.bear.position = game.getRandomLocation(3);

            for (var i = 0; i < 8; i++) {
                game.addElementRandomLocation('mountain');
                game.addElementRandomLocation('forest');
            }
            for (var j = 0; j < 3; j++) {
                game.addElementRandomLocation('cave');
                game.addElementRandomLocation('mine');
            }
            game.addElementRandomLocation('river');
        },
        addElementRandomLocation: function(envType, zIndex = 0) {
            var ret = game.addEnvironmentElement(envType, game.getRandomLocation(), zIndex);
            if (ret == false) {
                game.addElementRandomLocation(envType, zIndex);
            }
            return;
        },
        addEnvironmentElement: function(envType, position, zIndex = 0) {
            var len = (Object.keys(this.environment).length + 1);

            Object.keys(game.environment).forEach(function(key) {
                if (game.environment[key].position.x == position.x && game.environment[key].position.y == position.y) {
                    return;
                }
            });

            game.environment[len] = {
                envType: envType,
                position: position,
                zIndex: zIndex,
            };
            return true;
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
                if (game.withinXBlocks(pos, game.player.position, playerCheck)) {
                    return game.getRandomLocation(playerCheck);
                }
                return pos;
            }
        },
        withinXBlocks: function(pos1, pos2, count = 3) {
            return Math.abs(pos1.x - pos2.x) <= count && Math.abs(pos1.y - pos2.y) <= count;
        },
        setListeners: function() {
            document.addEventListener('keydown', game.handleKeyboardEvent, false);
        },
        handleEnvInteraction: function() {
            for (var key in game.environment) {
                const envPos = game.environment[key].position;
                if (envPos.x === game.player.position.x && envPos.y === game.player.position.y) {
                    switch(game.environment[key].envType) {
                    case 'mine':
                        game.interactWithMine(key);
                        break;
                    case 'forest':
                        game.interactWithForest(key);
                        break;
                    }
                }
            }
        },
        interactWithMine: function(key) {
            visibleLog('Mining...', 'yellow');
            game.genericEnvInteract(key);
        },
        genericEnvInteract: function(key) {
            var poss = [];

            for (var iKey in items) {
                if (items[iKey].envType === game.environment[key].envType) {
                    poss.push(iKey);
                }
            }
            var pickPoss = game.ranNum(0, (poss.length - 1));
            var giveCount = game.ranNum(1, 2);

            game.paused = true;

            setTimeout(function() {
                game.paused = false;
                inventory.giveItem(poss[pickPoss], giveCount);
                visibleLog('Gained +'+giveCount+' ' + items[poss[pickPoss]]['name'], 'green');
            }, 3000);
        },
        interactWithForest: function(key) {
            visibleLog('Chopping Trees...', 'yellow');
            game.genericEnvInteract(key);
        },
        handleKeyboardEvent: function(e) {
            if (game.player.dead || game.paused) {
                return;
            }
            var dirs = game.getDirectionCoords(game.player.position);

            if (!e) {e = window.event;} // for old IE compatible
            var keycode = e.keyCode || e.which; // also for cross-browser compatible

            switch (keycode) {
            case 13:
                game.handleEnvInteraction();
                break;
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
            };
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


    document.querySelector('#btn-inventory').addEventListener('click', function(){showInventory();});
    document.querySelector('#btn-hints').addEventListener('click', function(){showPopover('hints');});
    document.querySelector('#btn-help').addEventListener('click', function(){showPopover('help');});
    document.querySelector('.popover-hide').addEventListener('click', function(){hidePopovers();});


    function hidePopovers() {
        var pops = document.querySelectorAll('.popover, .popover-hide');
        [].forEach.call(pops, function(pop) {
            pop.classList.add('hidden');
        });
    }

    function showInventory() {
        var invBox = document.querySelector('#inventory .popover-content');
        var prevItems = document.querySelectorAll('#inventory .item');

        [].forEach.call(prevItems, function(prevItem) {
            prevItem.parentNode.removeChild(prevItem);
        });

        for (var key in inventory.current) {
            var entry = document.createElement('div');
            entry.setAttribute('class', 'item');

            var name = document.createElement('div');
            name.innerText = items[key].name;
            name.setAttribute('class', 'item-name');

            var image = document.createElement('img');
            image.src = 'icons/'+key+'.png';
            image.setAttribute('class', 'item-image');

            var count = document.createElement('div');
            count.innerText = inventory.current[key].count;
            count.setAttribute('class', 'item-count');

            entry.appendChild(count);
            entry.appendChild(name);
            entry.appendChild(image);
            invBox.appendChild(entry);
        }
        showPopover('inventory');
    }

    function showPopover(name) {
        hidePopovers();
        document.querySelector('#' + name + '.popover').setAttribute('class', 'popover');
        document.querySelector('.popover-hide').setAttribute('class', 'popover-hide');
    }

    function visibleLog(msg, color = 'white') {
        var log   = document.querySelector('#log');
        var entry = document.createElement('div');
        var text  = document.createTextNode(msg);
        entry.setAttribute('class', 'entry');
        entry.appendChild(text);

        if (color) {
            entry.style.color = color;
        }

        log.appendChild(entry);
        log.scrollTop = log.scrollHeight;
    }

    game.init();

    game.giveXP(1);
})();
