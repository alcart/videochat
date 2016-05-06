/**
 * Created by Alain on 20/04/2016.
 */
var express = require('express');
var app = express();
var cors = require('cors');
var securePort = 55555;
var port = process.env.PORT || 3000;
var rooms = [];
//Http
{

    var http = require('http');
    app.get("/:id", function (req, res) {
        res.sendFile(__dirname+"/public/video.html");
        console.log("routing");
    });

    app.use(cors);

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
                    socket.broadcast.to(socket.room_name).emit("joined", username);
                    socket.emit("joined", username);
                    var room = io.sockets.adapter.rooms;
                    console.log(room);
                    console.log("joined");
                }
            }
            else {
                socket.join(room_name);
                rooms[room_name] = password;
                socket.username = username;
                socket.room_name = room_name;
                socket.emit("created", username);
                var room = io.sockets.adapter.rooms;
                console.log(room);
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
            socket.broadcast.to(socket.room_name).emit("left", socket.username);
            socket.to(socket.id).emit("log out");
            socket.disconnect();
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

        socket.on("create or join video", function (username) {
            var numClients = io.of('/').adapter.rooms[socket.room_name].length;
            
            if (numClients == 0) {
                socket.video_room = room;
                socket.join(room);
                socket.emit("created");
            } else if (numClients === 1) {
                socket.broadcast.to(room).emit("join", room);
                socket.video_room = room;
                socket.join(room);
                socket.emit("joined");
            } else {
                socket.emit("full");
            }
        });

        socket.on('message', function (message) {
            console.log("got message", message);
            socket.broadcast.to(socket.video_room).emit('message', message);
        });

    });








