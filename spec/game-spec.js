const Game = require(".././game/index");

describe("Making the game", function() {
  beforeEach(() => {
    const cols = 10,
          rows = 10,
          playersCount = 5;
          
    this.game = new Game({ cols, rows, playersCount });
  });

  it("should create the game", () => {
    expect(this.game.grid).toBeInstanceOf(Array);
    expect(this.game.grid.length).toBe(10);
    expect(this.game.grid[0].length).toBe(10);
    expect(this.game.playersCount).toBe(5);
    expect(this.game.maxScore).toBe(100);
  });

  it("should create a player", () => {
    const id = 1,
      name = "player_one";

    const player = this.game.addPlayer({ name, id });

    expect(player).toEqual({
      shape: jasmine.any(Array),
      offset: { x: jasmine.any(Number), y: jasmine.any(Number) },
      name: name,
      update: true,
      color: jasmine.any(String)
    });

    expect(this.game.scores[id]).toEqual(100);
    expect(this.game.players[id]).toEqual(player);
  });

  it("should reset the rows", () => {
    this.game.grid[9] = new Array(10).map(_ => 1);
    this.game.grid[10] = new Array(10).map(_ => 1);

    const rows = this.game.sweepGrid({
      offset: { x: 1, y: 8 },
      shape: this.game.shapes["L"]
    });

    expect(rows).toEqual([9, 10]);

    this.game.resetRows(rows);

    const count = this.game.grid[9].reduce((acc, curr) => (acc + curr, 0));

    expect(count).toEqual(0);
  });

  it("should merge player", () => {
    this.game.mergePlayer(
      {
        shape: this.game.shapes["L"],
        offset: { x: 1, y: 1 },
        name: "player_one"
      },
      1
    );

    const updated = this.game.shapes["L"].every((row, y) => {
      return row.every((col, x) => {
        if (col) {
          return this.game.grid[y + 1][x + 1] === 1;
        }
        return true;
      });
    });

    expect(updated).toEqual(true);
  });

  it("should reset the game", () => {
    this.game.end = true;
    this.game.resetGame();

    const gridSweep = this.game.grid.reduce(
      (acc, row) => acc + row.reduce((accCol, col) => col + accCol, 0),
      0
    );

    const scoreSweep = Object.keys(this.game.scores).every(
      key => this.game.scores[key] === this.game.maxScore
    );

    const playersSweep = Object.values(this.game.players).every(player => {
      return player.offset.y === 0;
    });

    expect(gridSweep).toBe(0);

    expect(scoreSweep).toBe(true);

    expect(playersSweep).toBe(true);
  });
});

describe("Player collision", function() {
  beforeEach(() => {
    const cols = 10,
      rows = 10,
      playersCount = 5;

    this.game = new Game({ cols, rows, playersCount });

    const playerOne = this.game.addPlayer({ id: 1, name: "player_one" });
    const playerTwo = this.game.addPlayer({ id: 2, name: "player_two" });

    this.game.players[1] = { ...playerOne, offset: { x: 5, y: 5 } };
    this.game.players[2] = { ...playerTwo, offset: { x: 1, y: 1 } };
  });

  it("should collide with player", () => {
    const newMove = { ...this.game.players[2], offset: { x: 5, y: 5 } };

    const collision = this.game.collision(newMove);

    expect(collision).toBe(true);
  });

  it("should collide", () => {
    const player = this.game.players[1];

    player.offset = { x: 0, y: 11 };

    let collision = this.game.collision(player);

    expect(collision).toBe(true);

    player.offset = { x: 11, y: 1 };

    collision = this.game.collision(player);

    expect(collision).toBe(true);
  });

  it("should reset player", () => {
    const player = this.game.players[1];

    player.offset = { x: 2, y: 10 };

    const end = this.game.checkPlayerEnd(player);

    expect(end).toBe(true);
  });
});
