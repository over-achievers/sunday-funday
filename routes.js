
// var app = require('express')();
// var http = require('http').createServer(app);
// var io = require('socket.io')(http);
// var cors = require('cors')
// var bodyParser = require('body-parser')
// var axios = require('axios')
var path = require('path')

// // parse application/json
// app.use(bodyParser.json())

// app.use(cors({
// 	origin: function(origin, callback){
// 		return callback(null, true);
// 	},
// 	optionsSuccessStatus: 200,
// 	credentials: true
// }));


module.exports = function(io) { // catch here




  var players = {

  }	
  
  io.on('connection', function(socket){
  
    console.log('user joined',socket.handshake.query)
    players[socket.handshake.query.name] = {id: socket.id, score:0}
    io.sockets.emit("user-joined", socket.id, io.engine.clientsCount, Object.keys(io.sockets.clients().sockets), players);
    // io.sockets.emit('prompt-name',()=>{
    // 	console.log('emitted prompt-name')
    // })
  
  
      socket.on('signal', (toId, message) => {
        io.to(toId).emit('signal', socket.id, message);
      });
  
      socket.on("message", function(data){
        io.sockets.emit("broadcast-message", socket.id, data);
      })
  
    socket.on('disconnect', function() {	
      delete players[socket.handshake.query.name]
      io.sockets.emit("user-left", socket.id, players);
    })
  });
  

  var express = require('express');
  var router  = express.Router();

  // router.get('/', function(req, res){
  //   console.log(req.body, req.params, req.query)
  //   console.log("Successfully added as collab")
  //   res.sendFile(__dirname + '/index.html');
  // });
  
  router.post('/:username', function(req, res, next){
    console.log(req.body, req.params, req.query)
    console.log('in here!', req.params)
    players[req.params.username].score += 10;
    io.sockets.emit('updateScore', players)
    // io.sockets.emit('user', req.params.username)
    // io.sockets.emit('user2', {user: req.params.username})
    // io.sockets.emit('user3', socket.id, req.params.username)
    // io.sockets.emit("broadcast-message", socket.id, data);

    res.json({ 
      user: req.params
    })  
  })

  // let client = path.join(__dirname + '../public/index.html')
  // console.log('client',client)

  // router.get('*', (req, res) => {
  //   console.log("doesnt fire")
  //   res.sendFile(path.join(__dirname, '../frontend/build/index.html'))
  // })



  return router;
}
