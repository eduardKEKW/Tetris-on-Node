const Game = require('./');
let io = undefined;

const Session = function ({ session, playersCount, ...gameData }){
    this.sessionSize = playersCount;
    this.session = session;
    this.game = new Game({ ...gameData });

    io.of(`/${session}`).on('connection',(socket) => {
        this.socket = socket;
        socket.emit('game_data', this.game.data());

        socket.on('disconnect',onDisconnect.bind(this));
        socket.on('restart',onRestart.bind(this));
        socket.on('reconnect_player',onPlayerReconnect.bind(this));
        socket.on('player_move',onPlayerMove.bind(this));
        socket.on('player_end',onPlayerEnd.bind(this));
        socket.on('new_player',onNewPlayer.bind(this));
    });
};

const onDisconnect = function() {
  const player = this.game.disconnect(this.socket.id);
  this.socket.in(this.session).emit("player_disconnect", player);
};

const onRestart = (_, callback) => {
  this.game.resetGame();
  this.socket.nsp.to(this.session).emit("game_data", this.game.data());
};

const onPlayerMove = function(player) {
  if (this.game.collision(player)) {
    this.socket.emit("player_move", {
      ...this.game.players[this.socket.id],
      update: true
    });
  } else {
    this.game.players[this.socket.id] = player;
    this.socket.in(this.session).emit("player_move", { ...player, update: true });
  }
};

onPlayerReconnect =  function({ id, session }, callback) {
  const player = this.game.reconnect(id, this.socket.id);
  this.socket.join(session);
  this.socket.nsp.to(session).emit("get_player", player);
  callback(player);
};

const onPlayerEnd = function(player) {
  if (this.game.checkPlayerEnd(player)) {
    const playerData = this.game.players[this.socket.id];
    this.game.respawnPlayer(playerData, this.socket.id);

    if (this.game.end) {
      this.socket.nsp.to(this.session).emit("game_over");
    } else {
      this.socket.nsp.to(this.session).emit("player_reset", {
        name: player.name,
        player: {
          ...playerData,
          update: true
        }
      });

      const possitions = this.game.sweepGrid(player);

      if (possitions.length) {
        this.socket.nsp.to(this.session).emit("sweep_grid", possitions);
        this.game.resetRows(possitions);
      }
      this.socket.nsp.to(this.session).emit("players_scores", this.game.getScores());
    }
  }
};

const onNewPlayer = function({ name, session }, callback) {
  if (Object.values(this.game.players).some(player => player.name == name)) {
    callback(false);
  } else {
    const player = this.game.addPlayer({ name, id: this.socket.id });
    this.socket.join(session);
    this.socket.in(session).emit("get_player", player);
    callback(player, this.game.getScores());
  }
};

module.exports = {
    Session,
    setIo: (ioInstance) => io = ioInstance,
    sessions: {},
}