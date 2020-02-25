const Game = require("./");
const sessions = {};
let io = null;

const Session = function({ session, playersCount, ...game }) {
  this.sessionSize = playersCount;
  this.game = new Game({ ...game });

  io.of(`/${session}`).on("connection", socket => {
    socket.emit("game_data", this.game.data());

    socket.on("disconnect", () => {
      const player = this.game.disconnect(socket.id);
      this.game.endSession(() => {
        delete sessions[session];
      });

      socket.in(session).emit("player_disconnect", player);
    });

    socket.on("restart", (_, callback) => {
      this.game.resetGame();
      socket.nsp.to(session).emit("game_data", this.game.data());
    });

    socket.on("reconnect_player", ({ id, session }, callback) => {
      const player = this.game.reconnect(id, socket.id);
      socket.join(session);
      socket.nsp.to(session).emit("get_player", player);
      callback(player);
    });

    socket.on("player_move", player => {
      if (this.game.collision(player)) {
        socket.emit("player_move", {
          ...this.game.players[socket.id],
          update: true
        });
      } else {
        this.game.players[socket.id] = player;
        socket.in(session).emit("player_move", { ...player, update: true });
      }
    });

    socket.on("player_end", player => {
      if (this.game.checkPlayerEnd(player)) {
        const playerData = this.game.players[socket.id];
        this.game.respawnPlayer(playerData, socket.id);

        if (this.game.end) {
          socket.nsp.to(session).emit("game_over");
        } else {
          socket.nsp.to(session).emit("player_reset", {
            name: player.name,
            player: {
              ...playerData,
              update: true
            }
          });

          const possitions = this.game.sweepGrid(player);

          if (possitions.length) {
            socket.nsp.to(session).emit("sweep_grid", possitions);
            this.game.resetRows(possitions);
          }
          socket.nsp.to(session).emit("players_scores", this.game.getScores());
        }
      }
    });

    socket.on("new_player", ({ name, session }, callback) => {
      if (
        Object.values(this.game.players).some(player => player.name == name)
      ) {
        callback(false);
      } else {
        const player = this.game.addPlayer({ name, id: socket.id });
        socket.join(session);
        socket.in(session).emit("get_player", player);
        callback(player, this.game.getScores());
      }
    });
  });
};

module.exports = {
  Session,
  setIo: ioInstance => (io = ioInstance),
  sessions
};
