const express = require('express');
const router = express.Router();
const uuidv1 = require('uuid/v1');
const { Session, sessions } = require('./../game/sockets.js');

router.get('/', function(req, res, next) {
  res.render('index', {});
});

router.post('/game', function(req, res, next){
  const { rows, cols, playersCount } = req.body;
  const session = uuidv1();

  sessions[session] = new Session({ ...req.body, session });

  res.redirect(`/game/${session}`);
});

router.get('/game/:session', function(req, res, next){
  const session = req.params.session;

  if(sessions.hasOwnProperty(session)){
    res.render('game',{ session });
  } else {
    res.redirect('/');
  }
});

router.post('/end/:session', (req, res, next) => {
  delete sessions[req.params.session];
  
  res.json(true,202);
});

module.exports = router;
