//var app = require('express')();
var express = require('express');
var app = express();


var http = require('http').createServer(app);
var io = require('socket.io')(http);
var cors = require('cors')
var bodyParser = require('body-parser')
var axios = require('axios')
var path = require('path')

// parse application/json
app.use(bodyParser.json())

app.use(cors({
	origin: function(origin, callback){
		return callback(null, true);
	},
	optionsSuccessStatus: 200,
	credentials: true
}));


var secretRouter = require('./routes.js')(io); // pass here
app.use('/', secretRouter)

let client = path.join(__dirname, 'client/index.html')
console.log(client, '0-0-0-0-???')
//app.use(express.static(client))


// let client = path.join(__dirname + '../public/index.html')
//app.get('*', (req, res) => res.sendFile(client));
// For any other routes, redirect to the index.html file of React
app.get('*', (req, res) => {
  res.sendFile(client)
})
// app.get('/', function(req, res){
// 	console.log(req.body, req.params, req.query)
// 	console.log("Successfully added as collab")
//   res.sendFile(__dirname + '/index.html');
// });

// app.post('/:username', function(req, res, next){
// 	console.log(req.body, req.params, req.query)
// 	console.log('in here!', req.params)
// 	res.json({ 
// 		user: req.params
// 	})
// })



http.listen(process.env.PORT || 3000, function(){
  console.log('listening on *:3am in the right file000')//, process.env);
});

// var express = require('express')
// var cors = require('cors')
//   //, routes = require('./routes');
// var app = require('express')(3000);

// 	// app.use(cors())

	
// 	var server = require('http').Server(app);
// 	var io = require('socket.io')(server);
// //var app = module.exports = express();

// //var io = require('socket.io')(app);



// app.listen(3000, function(){
// 	console.log("Express server listening on port %d in %s mode", process.env);
// });