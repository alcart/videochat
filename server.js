/**
 * Created by Alain on 20/04/2016.
 */

// Create main variables for the functioning of the server 
var express = require('express');
var app = express();
var port = process.env.PORT || 3000;
var rooms = [];

// Create HTTP server
//Http
{

    var http = require('http');

    app.get("/test", function (req, res) {
        res.sendFile(__dirname+"/public/test.html");
        console.log();
    });
    app.use(function (req,res,next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "X-Requested-With");
        next();
    });
    app.use(express.static(__dirname + '/public'));

    var server = http.createServer(app);

    server.listen(port, function () {
        console.log("Http server running at port: "+ port);
    });}

<<<<<<< HEAD

var io = require("socket.io")(server);

// Socket Events
io.on("connection", function (socket) {
    socket.on("create or join", function (username, password, room_name){
        if (rooms[room_name]) {
            if (rooms[room_name] === password) {
=======
// Initialize io variable 
var io = require("socket.io")(server);

//Socket Events
    io.on("connection", function (socket) {

        //All Chat Events
        socket.on("create or join", function (username, password, room_name){
            if (rooms[room_name]) {
                if (rooms[room_name] === password) {
                    socket.join(room_name);
                    socket.username = username;
                    socket.room_name = room_name;
                    socket.broadcast.to(socket.room_name).emit("joined", username);
                    socket.emit("joined", username);
                    console.log("joined");
                }
                else{
                    socket.emit("wrong password");
                }
            }
            else {
>>>>>>> 65d2b118e767996ee35f1e81535fabb2d4e81a15
                socket.join(room_name);
                socket.username = username;
                socket.room_name = room_name;
                var clients_in_the_room = io.sockets.adapter.rooms[room_name].sockets;
                var clients = [];
                for (var clientId in clients_in_the_room ) {
                    clients.push({username: io.sockets.connected[clientId].username, id: io.sockets.connected[clientId].id});
                }
                socket.broadcast.to(socket.room_name).emit("joined", {username: username, id: socket.id});
                socket.emit("joined", {username: username, data: clients});
            }
            else {
                socket.emit("wrong password");
            }
        }
        else {
            socket.join(room_name);
            rooms[room_name] = password;
            socket.username = username;
            socket.room_name = room_name;
            socket.emit("created", username);
            console.log("created");
        }
    });
    socket.on("new message", function (msg) {
        socket.broadcast.to(socket.room_name).emit("new message", {
            username: socket.username,
            message: msg
        });
    });
    socket.on("disconnect", function () {
        socket.broadcast.to(socket.room_name).emit("left", {username: socket.username, id: socket.id});
        var room = io.sockets.adapter.rooms[socket.room_name];
        if (!room){
            if (rooms[socket.room_name]) {
                delete rooms[socket.room_name];
            }
        }
        console.log("disconnect");
        console.log(rooms);
    });

    // Video Room Events

<<<<<<< HEAD
    socket.on("video call request", function (id){
        console.log(id);
        socket.to(id).emit("video call", {
            username: socket.username,
            id: socket.id
=======
        socket.on("approved video", function (id) {
            console.log("approved");
            var url = randomToken();
            socket.to(id).emit("video call approved", url);
            socket.emit("video call approved", url);
            console.log(url);
        });
        socket.on("denied video", function (id) {
            console.log("denied");
            socket.to(id).emit("video call denied", socket.username);
>>>>>>> 65d2b118e767996ee35f1e81535fabb2d4e81a15
        });
        console.log("Sending video call request");
    });

    socket.on("approved video", function (id) {
        console.log("approved");
        var url = randomToken();
        socket.to(id).emit("video call approved", url);
        socket.emit("video call approved", url);
    });
    socket.on("denied video", function (id) {
        console.log("denied");
        socket.to(id).emit("video call denied", socket.username);
    });

<<<<<<< HEAD
    socket.on("create or join video", function (username, video_room) {
        var exist = false;
        if (io.of('/').adapter.rooms[video_room] != null) {
            var numClients = io.of('/').adapter.rooms[video_room].length;
            exist = true
        }

        if (exist === false) {
            socket.video_room = video_room;
            socket.join(video_room);
            socket.emit("created video room");
        } else if (numClients === 1) {
            socket.broadcast.to(video_room).emit("join video room", video_room);
            socket.video_room = video_room;
            socket.join(video_room);
            socket.emit("joined video room");
        } else {
            socket.emit("full");
        }
    });
=======
        socket.on('message', function (message) {
            socket.broadcast.to(socket.video_room).emit('message', message);
        });
>>>>>>> 65d2b118e767996ee35f1e81535fabb2d4e81a15

    socket.on('message', function (message) {
        console.log("got message", message);
        socket.broadcast.to(socket.video_room).emit('message', message);
    });

});

function randomToken() {
    return Math.floor((1 + Math.random()) * 1e16).toString(16).substring(1);
}




