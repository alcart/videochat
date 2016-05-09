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
    app.get("/:id", function (req, res) {
        res.sendFile(__dirname+"/public/video.html");
        console.log("routing");
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
                message: msg,
                id: socket.id
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

        socket.on("video call request", function (id){
            console.log(id);
            socket.to(id).emit("video call", {
                username: socket.username,
                id: socket.id
            });
            console.log("Sending video call request");
        });

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
                socket.emit("created");
            } else if (numClients === 1) {
                socket.broadcast.to(video_room).emit("join", video_room);
                socket.video_room = video_room;
                socket.join(video_room);
                socket.emit("joined");
            } else {
                socket.emit("full");
            }
        });

        socket.on('message', function (message) {
            socket.broadcast.to(socket.video_room).emit('message', message);
        });

    });

function randomToken() {
    return Math.floor((1 + Math.random()) * 1e16).toString(16).substring(1);
}







