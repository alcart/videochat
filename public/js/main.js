// JavaScript Document
'use strict'
var $button = $('#but');
var $window = $(document);

var $login_page = $('.login_page');
var $room_name = $('#room_name'); //Room Name Input
var $username = $('#username'); //Username Input
var $password = $('#room_password'); //Password Input

var $chatPage = $('.chat_page');
var $chat_body = $('.chat-body');
var $chat_users = $('.chat-users');
var $inputMessage = $('.input-message');
var $videoOffer = $("#video-offer");
var socket = io();

var Username;
var connected = false;
var inactive = false;
var mp3_1 = document.createElement("AUDIO");
var mp3_2 = document.createElement("AUDIO");
var room;


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
        mp3_1.play();
    }
}
// Scroll Bar Plugin
(function($){
    $(window).load(function(){
        $('.messages').mCustomScrollbar({
            axis: "y",
            autoExpandScrollbar: true,
            mouseWheel: {enable:true},
            scrollButtons :{enable:false},
            keyboard: {enable:true},
            advanced: {updateOnSelectorChange: true},
            theme: "minimal-black",
            callbacks: {
                onSelectorChange: function () {
                    $('.messages').mCustomScrollbar("scrollTo", "last",{
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

//Main

// Functions
function log(message) {
    var $el = $('<li class="answer">').text(message);
    addMessageElement($el);
}

function addUsername(main_data){
    var icon, username, usernameDiv;
    if (main_data[0]) {
        for (var i in main_data) {
            if (main_data[i].username != Username) {
                icon = $("<i class='glyphicon glyphicon-facetime-video'>");
                username = $("<p class='name'>").text(main_data[i].username).attr("id", main_data[i].id);
                username.append(icon);
                usernameDiv = $("<div class='user'>").append(username);
                icon.hide();
                usernameDiv.mouseenter(function () {
                    icon.show();
                });
                usernameDiv.mouseleave(function () {
                    icon.hide();
                });
                usernameDiv.click(function () {
                    socket.emit("video call request", main_data[i].id);
                    console.log("Hello");
                });
                $chat_users.append(usernameDiv);
            }
        }
    }
    else {
        icon = $("<i class='glyphicon glyphicon-facetime-video'>");
        username = $("<p class='name'>").text(main_data.username).attr("id", main_data.id);
        username.append(icon);
        usernameDiv = $("<div class='user'>").append(username);
        icon.hide();
        usernameDiv.mouseenter(function () {
            icon.show();
        });
        usernameDiv.mouseleave(function () {
            icon.hide();
        });
        usernameDiv.click(function () {
            socket.emit("video call request", main_data.id);
        });
        $chat_users.append(usernameDiv);
    }
}

function sendMessage() {
    var message = $inputMessage.val();
    if (message && connected) {
        socket.emit("new message", message);
        $inputMessage.val("");
        addOutgoingMessage(message);
    }
    console.log("HELLO");
}

function addIncomeMessage(data) {
    var $usernameDiv = $("<div class='name' id='chat_user'/>")
        .text(data.username);
    var $messageBody = $('<div class="text">')
        .text(data.message);
    var $messageDiv = $('<div class="answer left"/>')
        .append($messageBody, $usernameDiv);
    addMessageElement($messageDiv);
}

function addMessageElement(el) {
    var $el = $(el);
    $chat_body.append($el);
}

function addOutgoingMessage(message) {
    var $messageBody = $('<div class="text">')
        .text(message);
    var $messageDiv = $('<div class="answer right"/>')
        .append($messageBody);
    addMessageElement($messageDiv);
}

function connectRoom(username, password, room_name) {
    socket.emit("create or join", username, password, room_name);
}

function disconnectRoom() {
    window.location.reload();
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
            else if (username && password && room_name) {
                connectRoom(username, password, room_name);
            }
            else if (!username || !password || !room_name){
                $(".error").text("Missing: Username, Room Name or Password").show();
            }
            $password.val("");
            $room_name.val("");
            $username.val("");
        }
    });
}

socket.on("created", function (username) {
    connected = true;
    Username = username;
    $login_page.fadeOut();
    $login_page.off('click');
    $chatPage.show();
    $('body').css({
        "background": "url(../img/gray.jpg) no-repeat center center fixed",
        "-webkit-background-size": "cover",
        "-moz-background-size": "cover",
        "-o-background-size": "cover",
        "background-size": "cover"
    });
    $inputMessage.focus();
    $button.click(function () {
        disconnectRoom();
    });
    $(".answer-btn-2").click(function () {
        sendMessage();
    });
    log("Welcome To CS50 Chat");
});

socket.on("joined", function (data) {
    if (!connected){
        Username = data.username;
        $login_page.fadeOut();
        $login_page.off('click');
        $chatPage.show();
        $('body').css({
            "background": "url(../img/gray.jpg) no-repeat center center fixed",
            "-webkit-background-size": "cover",
            "-moz-background-size": "cover",
            "-o-background-size": "cover",
            "background-size": "cover"
        });
        $inputMessage.focus();
        $button.click(function () {
            disconnectRoom();
        });
        $(".answer-btn-2").click(function () {
            sendMessage();
        })
    }
    connected = true;
    console.log(data);
    log("User: " + data.username + " has joined the room");
    if (data.data) {
        console.log("hello");
        debugger;
        addUsername(data.data);
    }
    else{
        console.log("helllo2");
        addUsername(data);
    }
});

socket.on("wrong password", function () {
    $(".error").text("Wrong Password").show();
});

socket.on("new message", function (data) {
    if (inactive) {
        var body = data.username + ": " + data.message;
        showNotification(body, "New Message", "message");
    }

    addIncomeMessage(data);
});

socket.on("left", function (data) {
    log(data.username + " Has Left Chat");
    var element = document.getElementById(data.id);
    element.parentNode.removeChild(element);
});

socket.on("log out", function () {
    disconnectRoom();
    console.log("Hello");
});

socket.on("video call approved", function (room_id) {
    console.log("approved");
    console.log(room_id);
    var currentUrl = window.location.href;
    $chatPage.hide();
    $('.video-container').show(500, 'swing', VideoCall(room_id));
});

socket.on("video call denied", function (username) {
    $("#whois").text("Ignored");
    $("#mdl-body").text(username + " didn't answer");
    $videoOffer.modal();
});

socket.on("video call", function (data) {
    $("#whois").text(data.username + " Is Calling You");
    $videoOffer.modal({backdrop: "static"});
    mp3_2.loop = true;
    mp3_2.play();

    $("#answer-button").click(function () {
        socket.emit("approved video", data.id);
        $videoOffer.modal("hide");
        mp3_2.pause();
        mp3_2.loop = false;
        clearTimeout(vtime);
    });
    $("#ignore-button").click(function () {
        socket.emit("denied video", data.id);
        $videoOffer.modal("hide");
        mp3_2.pause();
        mp3_2.loop = false;
        clearTimeout(vtime);
    });
    var vtime = setTimeout(function () {
        socket.emit("denied video", data.id);
        $videoOffer.modal("hide");
        mp3.loop = false;
        mp3.pause();
    }, 30000);
});

$window.ready(function () {
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
    mp3_1.setAttribute("src", "mp3/sounds-949-you-wouldnt-believe.mp3");
    mp3_2.setAttribute("src", "mp3/hangout_video_call.mp3");
});


var isChannelReady;
var isInitiator = false;
var isStarted = false;
var localStream;
var pc;
var remoteStream;

//Video
function VideoCall(room) {

    var pc_config = {'iceServers': [{'url': 'stun:stun.l.google.com:19302'},]};

    var pc_constraints = {'optional': [{'DtlsSrtpKeyAgreement': true}]};

// Set up audio and video regardless of what devices are present.
    var sdpConstraints = {
        'mandatory': {
            'OfferToReceiveAudio': true,
            'OfferToReceiveVideo': true
        }
    };

    var username = window.parent.usernameJson;

    if (room) {
        console.log("Creating or joining room");
        socket.emit("create or join video", username, room);
    }

// Socket events

    socket.on("created video room", function (room) {
        console.log("Created room ", room);
        isInitiator = true;
    });

    socket.on("full", function (room) {
        console.log("room " + room + " is full");
    });

    socket.on("join video room", function (room) {
        console.log("Another peer made request to join room: " + room);
        console.log("This peer is initiator");e
        isChannelReady = true;
    });

    socket.on("joined video room", function (room) {
        console.log("This peer has joined room" + room);
        isChannelReady = true;
    });


///////////////////////////////////////////////

    function sendMessage(message) {
        console.log('Client sending message: ', message);
        // if (typeof message === 'object') {
        //   message = JSON.stringify(message);
        // }
        socket.emit('message', message);
    }

    socket.on('message', function (message) {
        console.log('Client received message:', message);
        if (message === 'got user media') {
            maybeStart();
        } else if (message.type === 'offer') {
            if (!isInitiator && !isStarted) {
                maybeStart();
            }
            pc.setRemoteDescription(new RTCSessionDescription(message));
            doAnswer();
        } else if (message.type === 'answer' && isStarted) {
            pc.setRemoteDescription(new RTCSessionDescription(message));
        } else if (message.type === 'candidate' && isStarted) {
            var candidate = new RTCIceCandidate({
                sdpMLineIndex: message.label,
                candidate: message.candidate
            });
            pc.addIceCandidate(candidate);
        } else if (message === 'bye' && isStarted) {
            handleRemoteHangup();
        }
    });

//////////////////////////////////////////////////////

    var localvideo = $(".local");
    var remotevideo = $(".remote");

    function handleUserMedia(stream) {
        console.log('Adding local stream.');
        localvideo.attr("src", window.URL.createObjectURL(stream));
        localStream = stream;
        sendMessage('got user media');
        if (isInitiator) {
            maybeStart();
        }
    }

    function handleUserMediaError(error) {
        console.log('getUserMedia error: ', error);
    }

    var constraints = {video: true, audio: true};
    getUserMedia(constraints, handleUserMedia, handleUserMediaError);

    console.log('Getting user media with constraints', constraints);

    function maybeStart() {
        if (!isStarted && typeof localStream != 'undefined' && isChannelReady) {
            createPeerConnection();
            pc.addStream(localStream);
            isStarted = true;
            console.log('isInitiator', isInitiator);
            if (isInitiator) {
                doCall();
            }
        }
    }

    window.onbeforeunload = function (e) {
        sendMessage('bye');
    };


/////////////////////////////////////////////////

    function createPeerConnection() {
        try {
            pc = new RTCPeerConnection(null);
            pc.onicecandidate = handleIceCandidate;
            pc.onaddstream = handleRemoteStreamAdded;
            pc.onremovestream = handleRemoteStreamRemoved;
            console.log('Created RTCPeerConnnection');
        } catch (e) {
            console.log('Failed to create PeerConnection, exception: ' + e.message);
            alert('Cannot create RTCPeerConnection object.');
        }
    }

    function handleIceCandidate(event) {
        console.log('handleIceCandidate event: ', event);
        if (event.candidate) {
            sendMessage({
                type: 'candidate',
                label: event.candidate.sdpMLineIndex,
                id: event.candidate.sdpMid,
                candidate: event.candidate.candidate
            });
        } else {
            console.log('End of candidates.');
        }
    }

    function handleRemoteStreamAdded(event) {
        console.log('Remote stream added.');
        remotevideo.attr("src", window.URL.createObjectURL(stream));
        remoteStream = event.stream;
    }

    function handleCreateOfferError(event) {
        console.log('createOffer() error: ', e);
    }

    function handleCreateAnswerError(event) {
        console.log('createAnswer () error: ', e);
    }

    function doCall() {
        console.log('Sending offer to peer');
        pc.createOffer(setLocalAndSendMessage, handleCreateOfferError);
    }

    function doAnswer() {
        console.log('Sending answer to peer.');
        pc.createAnswer(setLocalAndSendMessage, handleCreateAnswerError, sdpConstraints);
    }

    function setLocalAndSendMessage(sessionDescription) {
        // Set Opus as the preferred codec in SDP if Opus is present.
        sessionDescription.sdp = preferOpus(sessionDescription.sdp);
        pc.setLocalDescription(sessionDescription);
        console.log('setLocalAndSendMessage sending message', sessionDescription);
        sendMessage(sessionDescription);
    }

    function handleRemoteStreamRemoved(event) {
        console.log('Remote stream removed. Event: ', event);
    }

    function hangup() {
        console.log('Hanging up.');
        stop();
        sendMessage('bye');
    }

    function handleRemoteHangup() {
        console.log('Session terminated.');
        stop();
        isInitiator = false;
    }

    function stop() {
        isStarted = false;
        // isAudioMuted = false;
        // isVideoMuted = false;
        pc.close();
        pc = null;
    }

//////////////////////////////////////////////////////


    function preferOpus(sdp) {
        var sdpLines = sdp.split('\r\n');
        var mLineIndex;
        // Search for m line.
        for (var i = 0; i < sdpLines.length; i++) {
            if (sdpLines[i].search('m=audio') !== -1) {
                mLineIndex = i;
                break;
            }
        }
        if (mLineIndex === null) {
            return sdp;
        }

        // If Opus is available, set it as the default in m line.
        for (i = 0; i < sdpLines.length; i++) {
            if (sdpLines[i].search('opus/48000') !== -1) {
                var opusPayload = extractSdp(sdpLines[i], /:(\d+) opus\/48000/i);
                if (opusPayload) {
                    sdpLines[mLineIndex] = setDefaultCodec(sdpLines[mLineIndex], opusPayload);
                }
                break;
            }
        }

        // Remove CN in m line and sdp.
        sdpLines = removeCN(sdpLines, mLineIndex);

        sdp = sdpLines.join('\r\n');
        return sdp;
    }

    function extractSdp(sdpLine, pattern) {
        var result = sdpLine.match(pattern);
        return result && result.length === 2 ? result[1] : null;
    }

// Set the selected codec to the first in m line.
    function setDefaultCodec(mLine, payload) {
        var elements = mLine.split(' ');
        var newLine = [];
        var index = 0;
        for (var i = 0; i < elements.length; i++) {
            if (index === 3) { // Format of media starts from the fourth.
                newLine[index++] = payload; // Put target payload to the first.
            }
            if (elements[i] !== payload) {
                newLine[index++] = elements[i];
            }
        }
        return newLine.join(' ');
    }

// Strip CN from sdp before CN constraints is ready.
    function removeCN(sdpLines, mLineIndex) {
        var mLineElements = sdpLines[mLineIndex].split(' ');
        // Scan from end for the convenience of removing an item.
        for (var i = sdpLines.length - 1; i >= 0; i--) {
            var payload = extractSdp(sdpLines[i], /a=rtpmap:(\d+) CN\/\d+/i);
            if (payload) {
                var cnPos = mLineElements.indexOf(payload);
                if (cnPos !== -1) {
                    // Remove CN payload from m line.
                    mLineElements.splice(cnPos, 1);
                }
                // Remove CN line in sdp
                sdpLines.splice(i, 1);
            }
        }

        sdpLines[mLineIndex] = mLineElements.join(' ');
        return sdpLines;
    }
}

