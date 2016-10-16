/**
 * Created by Alain on 20/04/2016.
 */
var express = require('express');
var app = express();
var port = process.env.PORT || 3000;
var rooms = [];
//Http
{

    var http = require('http');

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


var io = require("socket.io")(server);

// Socket Events
io.on("connection", function (socket) {
    socket.on("create or join", function (username, password, room_name){
        if (rooms[room_name]) {
            if (rooms[room_name] === password) {
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
            console.log("created chat room");
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

    socket.on("video call request", function (id){
        socket.to(id).emit("video call", {
            username: socket.username,
            id: socket.id
        });
        console.log("Sending video call request");
    });

    socket.on("approved video", function (id) {
        console.log("approved");
        var room = randomToken();
        socket.to(id).emit("video call approved", room);
        socket.emit("video call approved", room);
    });
    socket.on("denied video", function (id) {
        console.log("denied");
        socket.to(id).emit("video call denied", socket.username);
    });

    socket.on("create or join video", function (username, video_room) {
        var exist = false;
        if (io.of('/').adapter.rooms[video_room] != null) {
            var numClients = io.of('/').adapter.rooms[video_room].length;
            exist = true
        }

        if (exist === false) {
            socket.video_room = video_room;
            socket.join(video_room);
            socket.emit("created video room", video_room);
        } else if (numClients === 1) {
            socket.broadcast.to(video_room).emit("join video room", video_room);
            socket.video_room = video_room;
            socket.join(video_room);
            socket.emit("joined video room", video_room);
        } else {
            socket.emit("full");
        }
    });

    socket.on('message', function (message) {
        socket.broadcast.to(socket.video_room).emit('message', message);
        if (message === "bye"){
            socket.leave(socket.video_room);
            socket.video_room = '';
            console.log(io.of('/').adapter.rooms);
        }
    });

});

function randomToken() {
    return Math.floor((1 + Math.random()) * 1e16).toString(16).substring(1);
}




