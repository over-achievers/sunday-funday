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


app.use(express.static(__dirname + '/client'))
// Uncomment this line for production
// let client = path.join(__dirname + '../public/index.html')
// console.log('client',client)

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, './client/index.html'))
})



// app.get('*', (req, res) => {
//    res.sendFile(__dirname + '/client/index.html');
// })


http.listen(process.env.PORT || 3000, function(){
  console.log('listening on *:3000!!!');
});

