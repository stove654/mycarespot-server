var express = require('express');
var app = express();
var morgan = require('morgan');
var mongoose = require('mongoose');
var config = require('./config/config');
var path = require('path');
var QRCode = require('qrcode')

// set port
var port = process.env.PORT || 8080;

// Connect to database
mongoose.connect(config.database);

var server = require('http').createServer(app);

var socketio = require('socket.io')(server, {
	path: '/socket.io-client'
});

require('./config/socketio')(socketio, app);

// use morgan to log requests to the console
app.use(morgan('dev'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

require('./config/express')(app);
require('./routes')(app);

app.post('/api/webrtc', function (req, res, next) {
    socketio.sockets.emit('webrtc:save', req.body);
    res.json(201, req.body);
    next();
});

app.post('/api/qrcode', function(req, res, next) {
    function makeid() {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for (var i = 0; i < 10; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));

        return text;
    }

    var text = makeid();
    QRCode.toDataURL(text, function (err, url) {
        res.json(201, {
            text: text,
            url: url
        });
        next();
    })
});

app.post('/api/socket', function (req, res, next) {
    var channel = 'socket-' + req.body.id +':save';
    var auth = require('./auth/auth.service');
    var User = require('./api/user/user.model');
    console.log('channel', channel)
    User.findById(req.body.userId, function (err, user) {
        if (err) { return handleError(res, err); }
        if(!user) { return res.send(404); }
        var token = auth.signToken(user._id, user.role);
        var data = {
            token: token,
            user: user
        };
        console.log('data', data)
        socketio.sockets.emit(channel, data);
        res.json(201, data);
        next();
    });
});

app.get('/', function(request, response) {
	response.send('Hello World!');
});




server.listen(port, function () {
	console.log('Stove server listening on port: ', port);
});

