const axios = require('axios');
const io = require('socket.io-client');

describe('Testing socket connections', function (){
    const callbacks = {
      onConn: jasmine.createSpy("onConn")
    };

    it('should create the session', async (done) => {
        const res = await axios.post('http://localhost:3000/game',{ rows: 5, cols: 5 });

        const redirect = res.request.res.responseUrl;
        this.session = redirect.match(/game\/(.+)$/)[1];
        
        this.socket = io(`http://localhost:3000/${this.session}`);

        this.socket.on("connect", function() {
            this.on("game_data", (data) => {
              callbacks.onConn(data);
              done();
            });
            
        });

        expect(this.session).toMatch(/.{8}-.{4}-.{4}-.{4}-.{12}/);
    });

    it("should create a player", (done) => {

        this.socket.emit('new_player',{ session: this.session, name: 'player_one' }, (player) => {
            expect(player).toEqual({
                name: "player_one",
                shape: jasmine.any(Array),
                offset: { x: jasmine.any(Number), y: jasmine.any(Number) },
                update: true,
                color: jasmine.any(String), 
            });

            done();
        });

    });

    it('should receive game data', () => {
        expect(callbacks.onConn).toHaveBeenCalledWith({
            grid: jasmine.any(Array),
            players: jasmine.any(Object),
            scores: jasmine.any(Array),
        });
    });

});