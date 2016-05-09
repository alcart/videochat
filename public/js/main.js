// JavaScript Document

var $leave = $('.leave');
var $window = $(document);

var $login_page = $('.login_page');
var $room_name = $('#room_name'); //Room Name Input
var $username = $('#username'); //Username Input
var $password = $('#room_password'); //Password Input

var $chatPage = $('.chat_page');
var $messages = $('.messages');
var $connected = $('.connected');
var $inputMessage = $('.inputMessage');
var $videoOffer = $("#video-offer");
var socket = io();

var connected = false;
var inactive = false;

var notificationMp3 = document.createElement("AUDIO");
notificationMp3.setAttribute("src", "mp3/sounds-949-you-wouldnt-believe.mp3");
var videoCallMp3 = document.createElement("AUDIO");
videoCallMp3.setAttribute("src", "mp3/hangout_video_call.mp3");


function askPermission() {
    if (window.Notification && Notification.permission !== "granted"){
        Notification.requestPermission(function (status) {
            if (Notification.permission !== status){
                Notification.permission = status;
            }
        });
    }
}

function showNotification(body, title, tag) {
    var options = {
        body: body,
        icon: "img/ic_message_black_24dp_2x.png",
        tag: tag
    };
    if (window.Notification && Notification.permission === "granted") {
        var n = new Notification(title, options);
        var timer = setTimeout(n.close.bind(n), 5000);
        notificationMp3.play();
    }
}
// Scroll Bar Plugin
(function($){
    $(window).load(function(){
        $(".msg").mCustomScrollbar({
            axis: "y",
            autoExpandScrollbar: true,
            mouseWheel: {enable:true},
            scrollButtons :{enable:false},
            keyboard: {enable:true},
            advanced: {updateOnSelectorChange: true},
            theme: "light-thick",
            callbacks: {
                onSelectorChange: function () {
                    $('.msg').mCustomScrollbar("scrollTo", "last",{
                        scrollInertia:0,
                        timeout:0
                    });
                }
            }
        });
    });
})(jQuery);
// Focus Events
{
    // Room Name
    $room_name.on("focus", function () {
        $room_name.attr("placeholder", "");
    });
    $room_name.on("blur", function () {
        $room_name.attr("placeholder", "Type Room Name")
    });
    // Password
    $password.on("focus", function () {
        $password.attr("placeholder", "");
    });
    $password.on("blur", function () {
        $password.attr("placeholder", "Type Room Password")
    });
    // Username
    $username.on("focus", function () {
        $username.attr("placeholder", "");
    });
    $username.on("blur", function () {
        $username.attr("placeholder", "Type Your Name")
    });
}



// Functions
{
    function log (message) {
        var $el = $('<li class="log">').text(message);
        addMessageElement($el);
    }
    function addUsername(username) {
        var $iconDiv = $('<li class="username"><span>'+username+'<i class="fa fa-video-camera" id="video"></i></li>');
        $connected.append($iconDiv);
    }
    function sendMessage() {
        var message = $inputMessage.val();
        if (message && connected){
            socket.emit("new message", message);
            $inputMessage.val("");
            addOutgoingMessage(message);
        }
    }
    function addIncomeMessage(data) {
        var icon = $("<i class='fa fa-video-camera' aria-hidden='true'></i>")
            .data({username: data.username});
        var $usernameDiv = $("<span class='username'/>")
            .text(data.username+": ");
        var $messageBody = $('<span class="messageBody"/>')
            .text(data.message);
        var $messageDiv = $('<li class="message"/>')
            .append(icon, $usernameDiv, $messageBody);
        icon.hide();
        $usernameDiv.mouseenter(function () {
            icon.show();
        });
        $usernameDiv.mouseleave(function () {
            icon.hide();
        });
        $usernameDiv.click(function () {
            socket.emit("video call request", data.id);
            console.log(data.id);
        });
        addMessageElement($messageDiv);
    }
    function addMessageElement (el) {
        var $el = $(el);
        $messages.append($el);
    }

    function addOutgoingMessage(message) {
        var $usernameDiv = $('<span class="my_username"/>')
            .text(": Me");
        var $messageBody = $('<span class="messageBody"/>')
            .text(message);
        var $messageDiv = $('<li class="my_message"/>')
            .append($usernameDiv, $messageBody);
        addMessageElement($messageDiv);
    }
    function connectRoom(username, password, room_name) {
        socket.emit("create or join", username, password, room_name);
        $login_page.fadeOut();
        $login_page.off('click');
        $chatPage.show();
        $inputMessage.focus();
        $leave.click(function (){
            disconnectRoom();
        });
    }
    function disconnectRoom() {
        window.location.reload();
    }
}
// Keyboard Events
{
    $window.keydown(function (event) {
        if (!(event.ctrlKey || event.metaKey || event.altKey) && $chatPage.is(":visible")) {
            $inputMessage.focus();
        }
        if (event.which === 13) {
            var password = $password.val();
            var room_name = $room_name.val();
            var username = $username.val();

            if ($chatPage.is(":visible")) {
                sendMessage();
            }
            else if (username && password && room_name){
                    connectRoom(username, password, room_name);
                }
            $password.val("");
            $room_name.val("");
            $username.val("");
        }
    });
}

socket.on("created", function(username){
    connected = true;
    log("Welcome To CS50 Chat");
    addUsername(username);
});

socket.on("joined", function(username){
    log("User: "+username+" has joined the room");
    connected = true;

});

socket.on("new message", function(data){
    if (inactive){
        var body = data.username+": "+data.message;
        showNotification(body, "New Message", "message");
    }

    addIncomeMessage(data);
});

socket.on("left", function (username) {
   log(username+" Has Left Chat");
});

socket.on("log out", function () {
    disconnectRoom();
    console.log("Hello");
});

socket.on("video call approved", function (room_id) {
    console.log("approved");
    var currentUrl = window.location.href;
    var newUrl = currentUrl+room_id;
    var win = window.open(newUrl, "_blank");
    if (win){
        win.focus();
    }
    else{
        alert("Deactivate Pop-up Blocker");
    }
});

socket.on("video call denied", function (username){
    $("#whois").text("Ignored");
    $("#mdl-body").text(username+" didn't answer");
    $videoOffer.modal();
});

socket.on("video call", function (data){
    console.log(data);
    $("#whois").text(data.username+" Is Calling You");
    $videoOffer.modal({backdrop: "static"});
    videoCallMp3.loop = true;
    videoCallMp3.play();

    $("#answer-button").click(function () {
        socket.emit("approved video", data.id);
        $videoOffer.modal("hide");
        videoCallMp3.pause();
        videoCallMp3.loop = false;
        clearTimeout(vtime);
    });
    $("#ignore-button").click(function () {
        socket.emit("denied video", data.id);
        $videoOffer.modal("hide");
        videoCallMp3.pause();
        videoCallMp3.loop = false;
        clearTimeout(vtime);
    });
    var vtime = setTimeout(function () {
        socket.emit("denied video", data.id);
        $videoOffer.modal("hide");
        videoCallMp3.loop = false;
        videoCallMp3.pause();
    }, 30000);

    console.log("Receiving video call request");
});
$window.ready(function(){
    askPermission();
    var logTime;
    var idle;
    $username.focus();
    $window.mousemove(function () {
        inactive = false;
        clearTimeout(logTime);
        clearTimeout(idle);
        if (connected) {
            idle = setTimeout(function () {
                inactive = true;
            }, 15000);
        }
    });
    $window.keydown(function () {
        inactive = false;
        clearTimeout(logTime);
        clearTimeout(idle);
        if (connected) {
            idle = setTimeout(function () {
                inactive = true;
            }, 15000);
        }
    });

});