const session = location.pathname.substring(6),
      canvas = document.querySelector('#canvas'),
      namesContext = document.querySelector('#namesCanvas').getContext('2d'),
      context = canvas.getContext('2d'),
      api = 'http://localhost:3000',
      socket = io(`/${session}`), 
      borderStyle = '#292929',
      fillStyle = '#7a7a7a';
let   boxSize = 15,
      boxBorder = 1,
      mainGrid = [[]],
      client = null,
      players = {},
      gridUpdate = true,
      playerMoved = false;

const createSquare = (x,y,color = fillStyle) => {
    context.fillStyle = borderStyle;
    context.fillRect(x * boxSize, y * boxSize, boxSize, boxSize);
    context.fillStyle = color;
    context.fillRect(
         (x * boxSize) + .3,
         (y * boxSize) + .3,
         boxSize - .3,  boxSize - .3
    );
    context.shadowColor = "black";
    context.shadowBlur = 6;
}

const resetSquare = (x,y) => {
    return createSquare(x,y);
}

const deleteShape = ({ shape, offset, name }) => {
    shape.forEach((row,y) => {
        row.forEach((col,x) => {
            if(col){
                resetSquare(offset.x+x, offset.y+y);
            }
        });
    });
    clearPlayerName({ shape, offset, name });
}

const rotateShape = (shape) => {
    shape.forEach((row,i) => {
        row.some((col,j) => {
            [
                shape[i][j],
                shape[j][i]
            ]
              =
            [
                shape[j][i],
                shape[i][j]
            ];
            return j === i;
        });
    });

    shape.forEach(row => row.reverse());
    return shape;
}

const checkCollisionForPlayer = ({ offset, name, possibleCollisions }) => {
    const currentPlayer = name;

    const xs = [Math.max(offset.x - 3,0), Math.min(offset.x + 3,mainGrid[0].length)];
    const ys = [Math.max(offset.y - 3,0), Math.min(offset.y + 3,mainGrid.length)];


    return Object.values(players).some(({ offset: { x, y }, shape, name, disconnected }) => {
        if( !disconnected &&
            currentPlayer !== name &&
            x >= xs[0] &&
            x <= xs[1] &&
            y >= ys[0] &&
            y <= ys[1]
        ){
            return shape.some((row,i) => {
                return row.some((col,j) => {
                    if(col){
                        const pos = `${i+y+1}-${j+x+1}`;
                        if(possibleCollisions.has(pos)){
                            return true;
                        } else {
                            possibleCollisions.add(pos);
                            return false;   
                        }
                    }
                });
            });
        }
    });
}

const checkPlayerEnd = ({ offset, shape }) => {
    return shape.some((row,y) => {
        return row.some((col,x) => {
            if(col){
                return !mainGrid[y+offset.y+1] || mainGrid[y+offset.y+1][x+offset.x];
            }
            return false;
        });
    });
}

const notify = (mss) => {
    const notify = document.querySelector('#notify');
    const p = document.createElement('p');
    p.innerText = mss;
    notify.appendChild(p);
}

const collision = (player) => {
    const { offset, id, shape } = player;
    const possibleCollisions = new Set();

    const isInvalidMove = shape.some((row,y) => {
        return row.some((col,x) => {
            if(col){
                const position = mainGrid[y+offset.y] ? mainGrid[y+offset.y][x+offset.x] : true; 
                if(position){ 
                    return true;
                }
                if(isNaN(position)){
                    return true;
                }
                possibleCollisions.add(`${offset.y+y+1}-${offset.x+x+1}`);
            }
            return false;
        });
    });
    
    return isInvalidMove || checkCollisionForPlayer({ ...player, possibleCollisions });
}

const rotatePlayer = (player) => {
    const oldOffset = { x: player.offset.x, y: player.offset.y };
    if(player.offset.x < 0){
        player.offset.x = 0;
    }
    if((player.offset.x + player.shape[0].length) > mainGrid[0].length){
        player.offset.x = player.offset.x - (player.shape[0].length-2);
    }

    const oldShape = player.shape.map(s => s.slice());

    rotateShape(player.shape);

    if(collision(player)){
        player.offset = oldOffset;
        player.shape = oldShape;
    } else {
        socket.emit('player_move',player);
    }

    player.update = true;
}

const movePlayer = (name,direction) => {
    let player = players[name];
    if(!player) return;
    deleteShape(player);

    let { offset: { x, y }, shape } = player;
    switch(direction) {
        case 'DOWN':
            if(checkPlayerEnd(player)){
                return socket.emit('player_end',player);
            }
            player.offset.y = y+1;
            break;
        case 'LEFT':
            player.offset.x = x-1;
            break;
        case 'RIGHT':
            player.offset.x = x+1;
            break;
        case 'ROTATE':
            return rotatePlayer(player);
    }

    if(collision(player)){
        player.offset = { x, y };
    } else {
        socket.emit('player_move',player);
    }
    player.update = true;
}

const renderPlayerName = ({ offset, shape , name, color }) => {
    namesContext.font = `${boxSize * .8}px Mansalva`;
    namesContext.fillStyle = color;
    namesContext.textAlign = "center";
    namesContext.fillText(name,
     ( offset.x+( shape[0].length/2 ) )*boxSize,
     ( offset.y*boxSize ) - boxSize/4);
}

const clearPlayerName = ({ offset, shape , name }) => {
    const boxes = name.length / 4;
    namesContext.clearRect(
        (offset.x+(shape[0].length/2) - boxes) * boxSize,
        ((offset.y-1)*boxSize),
        boxes * 2 * boxSize,
        boxSize
    );
}

const drawPlayers = () => {
    Object.values(players).forEach(({ shape, offset, color, update, name, disconnected },i,arr) => {
        if(!disconnected && (gridUpdate || update)) {
            renderPlayerName({ offset, name, shape, color });
            shape.forEach((row,y) => {
                row.forEach((col,x) => {
                    if(col) {
                        createSquare(offset.x + x,offset.y + y,color);
                    }
                });
            });
            arr[i].update = false;
        }
    });
}

const drawMainGrid = (notFirst) => {
    if(gridUpdate){
        mainGrid.forEach((row,y) => {
            row.forEach((col,x) => {
                createSquare(x,y, players[col] ? players[col].color : fillStyle);
            });
        });
    }
}

const mergePlayer = ({ shape, offset, name }) => {
    shape.forEach((row,y) => {
        row.forEach((col,x) => {
            if(col){
                mainGrid[offset.y+y][offset.x+x] = name;
            }
        });
    });
    clearPlayerName({ shape, offset, name });
    gridUpdate = true;
}

const update = (time = 0) => {
    drawMainGrid(time);
    drawPlayers();
    gridUpdate = false;
    requestAnimationFrame(update);
}

const decrementPlayer = () => {
    setInterval(() => {
        if(playerMoved){
            playerMoved = false;
        }else{
            movePlayer(client,'DOWN');
        }
    }, 1000);
}

const start = () => {
    const board = document.querySelector('.main__board');
    const colums = mainGrid[0].length,
          rows = mainGrid.length,
          width = +board.clientWidth,
          height = +board.clientHeight;

    if(boxSize*rows > height || boxSize*colums > width){
        boxSize = Math.min(height / rows,width / colums);
    }

    boxBorder = boxSize / 20;
    const canWidth = mainGrid[0].length * boxSize;
    const canHeight = mainGrid.length * boxSize;

    namesContext.canvas.width = canWidth;
    namesContext.canvas.height = canHeight;
    context.canvas.width = canWidth;
    context.canvas.height = canHeight;

    update();
};

const renderScores = (scores) => {
    const scoreNode = document.querySelector('#scores');
    scoreNode.innerHTML = scores
        .sort((a,b) => b.score - a.score)
        .reduce((acc,{ name, score, color }) => {
            return acc += `
                <div style="color:${color}">${name} ${score}</div>
            `;
        },'<p>Scores</p>');
}

const onKey = ({ keyCode }) => {
    if(client && moves.hasOwnProperty(keyCode)){
        movePlayer(client,moves[keyCode]);
        playerMoved = moves[keyCode] !== 'ROTATE';
    }
};

document.querySelector('#play').addEventListener('click', (e) => {
    e.preventDefault();
    const name = document.querySelector('.form__input-name').value.replace(' ','-');
    if(!name) return;

    socket.emit('new_player', {
        session,
        name,
    },(player,scores) => {
        if(player){
            client = player.name;
            players[client] = player;
            document.addEventListener('keyup', onKey);
            document.querySelector('.modal').style.display = 'none';
            localStorage.setItem(session,socket.id);
            renderScores(scores);
            notify(`${player.name} has connected.`);
        } else {
            document.querySelector('#play').value = 'Name taken.';
        }
    });
});

socket.on('game_over',() => {
    notify(`Game Over.`);
    document.querySelector('.modal--over').style.display = 'block';
    document.querySelector('#restart').addEventListener('click',(e) => {
        e.preventDefault();
        socket.emit('restart');
    });
    document.querySelector('#end').addEventListener('click',(e) => {
        e.preventDefault(); 
        axios.post(`/end/${session}`).then(res => {
            window.location.href = "/";
        });
    });
});

socket.on('game_data',(game) => {
    localStorage.setItem(session,socket.id);
    gridUpdate = true;
    renderScores(game.scores);
    mainGrid = game.grid;
    players = game.players;
    document.querySelector('.modal--over').style.display = 'none';
    decrementPlayer();
    notify(`Game start ${mainGrid.length} X ${mainGrid[0].length}.`)
    start();
});

socket.on('players_scores',(scores) => {
    renderScores(scores);
});

socket.on('player_move', (player) => {
    deleteShape(players[player.name]);

    players[player.name] = {
        ...players[player.name],
        ...player,
    };
});

socket.on('sweep_grid',(positions) => {
    positions.forEach(pos => {
        mainGrid.splice(pos,1);
        mainGrid.unshift(new Array(mainGrid[0].length).fill(0));
    });
    gridUpdate = true;
})

socket.on('get_player', (player) => {
    notify(`${player.name} has connected.`);
    players[player.name] = player;
});

socket.on('player_reset',({ name, player }) => {
    mergePlayer(players[name]);
    players[name] = player;
});

socket.on('player_disconnect',(player) => {
    notify(`${player.name} has disconnected.`);
    deleteShape(player);
    players[player.name].update = false;
    gridUpdate = true;
});


(() => {
    const id = localStorage.getItem(`${session}`);
    if(id){
        document.querySelector('.modal').style.display = 'none';
        socket.emit('reconnect_player',{ id, session },(player) => {
            document.addEventListener('keyup', onKey);
            players[player.name] = player;
            client = player.name;
        });
    }
})();


const moves = {
    37: 'LEFT',
    38: 'ROTATE',
    39: 'RIGHT',
    40: 'DOWN',
};