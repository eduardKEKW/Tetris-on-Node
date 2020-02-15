const Game = function({ cols, rows, playersCount }){
    this.grid = new Array(+rows).fill(0).map(_ => new Array(+cols).fill(0));
    this.playersCount = playersCount;
    this.players = {};
    this.end = false;
    this.colors = new Set();
    this.rows = +rows;
    this.columns = +cols;
    this.disconnected = {};
    this.maxScore = +cols * +rows;
    this.scores = {};
}

Game.prototype = {
  addPlayer: function({ name, id }) {
    const player = {
      shape: this.getShape(),
      offset: { x: 0, y: 0 },
      name: name,
      update: true,
      color: this.getColor()
    };
    this.scores[id] = this.maxScore;
    this.spawnPlayer(player);
    this.players[id] = player;
    return player;
  },
  resetGame: function() {
    if (this.end) {
      this.grid = new Array(this.rows)
        .fill(0)
        .map(_ => new Array(this.columns).fill(0));
      this.end = false;
      Object.keys(this.scores).forEach(
        key => (this.scores[key] = this.maxScore)
      );
      Object.values(this.players).forEach(player => {
        this.spawnPlayer(player);
      });
    }
  },
  data: function() {
    return {
      grid: this.getGrid(),
      players: Object.values(this.players).reduce((acc, player) => {
        acc[player.name] = player;
        return acc;
      }, {}),
      scores: this.getScores()
    };
  },
  getScores: function() {
    return Object.keys(this.scores).map(key => ({
      name: this.players[key].name,
      score: this.scores[key],
      color: this.players[key].color
    }));
  },
  getShape: function() {
    return this.shapes[
      Object.keys(this.shapes)[
        Math.floor(Math.random() * Object.keys(this.shapes).length)
      ]
    ];
  },
  getColor: function() {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++)
      color += letters[Math.floor(Math.random() * letters.length)];

    return this.colors.has(color)
      ? this.getColor(this.colors)
      : this.colors.add(color) && color;
  },
  mergePlayer: function({ shape, offset, name }, id) {
    shape.forEach((row, y) => {
      row.forEach((col, x) => {
        if (col) {
          this.grid[y + offset.y][x + offset.x] = id;
          if (this.scores[id]) this.scores[id] -= 1;
        }
      });
    });
  },
  checkPlayerEnd: function({ offset, shape }) {
    const playerEnd = shape.some((row, y) => {
      return row.some((col, x) => {
        if (col) {
          return (
            !this.grid[y + offset.y + 1] ||
            this.grid[y + offset.y + 1][x + offset.x]
          );
        }
        return false;
      });
    });
    return playerEnd;
  },
  sweepGrid: function({ shape, offset }) {
    return shape.reduce((acc, row, y) => {
      if (row.some(v => v) && this.grid[offset.y + y].every(v => v)) {
        acc.push(offset.y + y);
      }
      return acc;
    }, []);
  },
  getGrid: function() {
    return this.grid.map(row => {
      return row.map(col => {
        //bug
        return col && this.players[col] ? this.players[col].name : col;
      });
    });
  },
  resetRows: function(positions) {
    positions.forEach(pos => {
      this.grid[pos].forEach(value => {
        this.scores[value] += 1;
      });
      this.grid.splice(pos, 1);
      this.grid.unshift(new Array(this.columns).fill(0));
    });
  },
  disconnect: function(id) {
    if(this.players[id]){
        this.players[id].disconnected = true;
        return this.players[id];
    }
  },
  reconnect: function(id, newId) {
    const player = this.players[id];
    const score = this.scores[id];

    if (!player) {
      return;
    }
    this.grid.forEach((row, y) =>
      row.forEach((col, x) => col === id && (this.grid[y][x] = newId))
    );

    player.disconnected = false;
    player.update = true;
    this.players[newId] = player;
    delete this.players[id];
    delete this.scores[id];

    this.spawnPlayer(player);
    return player;
  },
  spawnPlayer: function(player) {
    const possibleCollisions = new Set();
    player.offset = {
      y: 0,
      x: Math.floor(Math.random() * (this.grid[0].length - 3))
    };

    if (this.isInvalidMove({ ...player, possibleCollisions })) {
      this.end = true;
      return player;
    } else if (
      this.checkCollisionForPlayer({ ...player, possibleCollisions })
    ) {
      this.spawnPlayer(player);
    }

    player.update = true;
    return player;
  },
  checkCollisionForPlayer: function({ offset, name, possibleCollisions }) {
    const currentPlayer = name;

    const xs = [
      Math.max(offset.x - 3, 0),
      Math.min(offset.x + 3, this.columns)
    ];
    const ys = [Math.max(offset.y - 3, 0), Math.min(offset.y + 3, this.rows)];

    return Object.values(this.players).some(
      ({ offset: { x, y }, shape, name, disconnected }) => {
        if (
          !disconnected &&
          currentPlayer !== name &&
          x >= xs[0] &&
          x <= xs[1] &&
          y >= ys[0] &&
          y <= ys[1]
        ) {
          return shape.some((row, i) => {
            return row.some((col, j) => {
              if (col) {
                const pos = `${i + y + 1}-${j + x + 1}`;
                if (possibleCollisions.has(pos)) {
                  return true;
                } else {
                  possibleCollisions.add(pos);
                  return false;
                }
              }
            });
          });
        }
      }
    );
  },
  respawnPlayer: function(player, id) {
    this.mergePlayer(player, id);
    player.shape = this.getShape();
    this.spawnPlayer(player);
    player.update = true;
    return player;
  },
  checkPlayerEnd: function({ offset, shape }) {
    return shape.some((row, y) => {
      return row.some((col, x) => {
        if (col) {
          return (
            !this.grid[y + offset.y + 1] ||
            this.grid[y + offset.y + 1][x + offset.x]
          );
        }
        return false;
      });
    });
  },

  isInvalidMove: function({ offset, possibleCollisions, shape }) {
    return shape.some((row, y) => {
      return row.some((col, x) => {
        if (col) {
          if (offset.y > this.rows) {
            return true;
          }

          const pos = this.grid[y + offset.y][x + offset.x];

          if (pos) {
            return true;
          }
          if (isNaN(pos)) {
            return true;
          }
          possibleCollisions.add(`${offset.y + y + 1}-${offset.x + x + 1}`);
        }
        return false;
      });
    });
  },

  collision: function({ offset, name, shape }) {
    const possibleCollisions = new Set();

    return (
      this.isInvalidMove({ offset, shape, possibleCollisions }) ||
      this.checkCollisionForPlayer({ offset, name, possibleCollisions })
    );
  },

  shapes: {
    O: [
      [1, 1],
      [1, 1]
    ],
    I: [
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0]
    ],
    S: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0]
    ],
    Z: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0]
    ],
    L: [
      [0, 1, 0],
      [0, 1, 0],
      [0, 1, 1]
    ],
    J: [
      [0, 1, 0],
      [0, 1, 0],
      [1, 1, 0]
    ],
    T: [
      [1, 1, 1],
      [0, 1, 0],
      [0, 0, 0]
    ]
  },
  moves: {
    37: "LEFT",
    38: "ROTATE",
    39: "RIGHT",
    40: "DOWN"
  }
};

module.exports = Game;