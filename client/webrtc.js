var localVideo;
var firstPerson = false;
var socketCount = 0;
var socketId;
var localStream;
var connections = [];
var allClients = []

var peerConnectionConfig = {
    'iceServers': [
        {'urls': 'stun:stun.services.mozilla.com'},
        {'urls': 'stun:stun.l.google.com:19302'},
    ]
};
var name; 
function pageReady() {  
    name = prompt('name?')    
    //name = 'niko'

    localVideo = document.getElementById('localVideo');
    remoteVideo = document.getElementById('remoteVideo');

    var constraints = {
        video: true,
        audio: false,
    };

    if(navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia(constraints)
            .then(getUserMediaSuccess)
            .then(function(){

                socket = io.connect(config.host, {secure: true, query: `name=${name}` });
                socket.on('signal', gotMessageFromServer);  

                socket.on('connect', function(){

                    socketId = socket.id;

                    // socket.on('user', function(data){
                    //     console.log(data)
                        
                    // })
                    // socket.on('user2', function(data){
                    //     console.log(data)
                        
                    // })
                    // socket.on('user3', function(data){
                    //     console.log(data)
                    // })
                    socket.on('updateScore', function(players){
                        console.log(players);
                        showPlayers(players)
                    })
                                                            
                    socket.on('user-left', function(id, players){
                        console.log(players)
                        showPlayers(players)

                        var video = document.querySelector('[data-socket="'+ id +'"]');
                        console.log(video)
                        if(video){
                            var parentDiv = video.parentElement;
                            video.parentElement.parentElement.removeChild(parentDiv);
                        }
                    });


                    socket.on('user-joined', function(id, count, clients, players){
                        console.log(id, count, clients, players)
                        showPlayers(players)
                        allClients = clients
                        clients.forEach(function(socketListId) {
                            if(!connections[socketListId]){
                                connections[socketListId] = new RTCPeerConnection(peerConnectionConfig);
                                //Wait for their ice candidate       
                                connections[socketListId].onicecandidate = function(){
                                    if(event.candidate != null) {
                                        //console.log('SENDING ICE');
                                        socket.emit('signal', socketListId, JSON.stringify({'ice': event.candidate, 'name':name }));
                                    }
                                }

                                //Wait for their video stream
                                connections[socketListId].onaddstream = function(){
                                    //console.log('emit',socketListId, name)
                                    gotRemoteStream(event, socketListId)
                                }    

                                //Add the local video stream
                                connections[socketListId].addStream(localStream);                                                                
                            }
                        });

                        //Create an offer to connect with your local description
                        
                        //if(count >= 2){
                            console.log('in this', id)   
                            connections[id].createOffer().then(function(description){
                                connections[id].setLocalDescription(description).then(function() {
                                    // console.log(connections);
                                    socket.emit('signal', id, JSON.stringify({'sdp': connections[id].localDescription}));
                                }).catch(e => console.log(e));        
                            });
                        //}



                                // myPeerConnection.createOffer().then(function(offer) {
                                //     return myPeerConnection.setLocalDescription(new RTCSessionDescription(offer));
                                //   });

                                //myPeerConnection.createOffer().then(myPeerConnection.setLocalDescription);
                    });                    
                })       
        
            }); 
    } else {
        alert('Your browser does not support getUserMedia API');
    } 
}

function getUserMediaSuccess(stream) {
    console.log(localVideo, stream)
    localStream = stream;
    //localVideo.src = window.URL.createObjectURL(stream);
    localVideo.srcObject=stream;

}



// video.src=vendorUrl.createObjectURL(stream);
// video.play();
// video.srcObject=stream;
// video.play();

function gotRemoteStream(event, id) {
    console.log(event, id)
    var videos = document.querySelectorAll('video'),
        video  = document.createElement('video'),
        div    = document.createElement('div'),
        nameDiv = document.createElement('div');

        console.log(videos, video, '[][][][]')

        div.setAttribute('id', 'hi')


    
    video.setAttribute('data-socket', id);
    video.setAttribute('username', 'name');
    //video.src         = window.URL.createObjectURL(event.stream);
    console.log(window.URL, event.stream)
    video.srcObject=event.stream
      //  localStream = stream;
    //localVideo.src = window.URL.createObjectURL(stream);
    //localVideo.srcObject=stream;
    video.autoplay    = true; 
    video.muted       = true;
    video.playsinline = true;
    
    div.appendChild(video);  
    div.appendChild(nameDiv);    
    document.querySelector('.videos').appendChild(div);      
}

let i = 0; 
let newClients = [] 
function gotMessageFromServer(fromId, message) {

    //Parse the incoming signal
    var signal = JSON.parse(message)

    //Make sure it's not coming from yourself
    if(fromId != socketId) {
        i++; 



        if(signal.sdp){            
            connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(function() {                
                if(signal.sdp.type == 'offer') {
                    connections[fromId].createAnswer().then(function(description){
                        connections[fromId].setLocalDescription(description).then(function() {
                            socket.emit('signal', fromId, JSON.stringify({'sdp': connections[fromId].localDescription}));
                        }).catch(e => console.log(e));        
                    }).catch(e => console.log(e));
                }
            }).catch(e => console.log(e));
        }
    
        if(signal.ice) {
            connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch(e => console.log(e));
        }                
    }
}

function showPlayers(players){

    let scoreboard = document.querySelector('#scoreboard');
    scoreboard.innerHTML = ''

    for(let p in players){
        scoreboard.innerHTML += `<li>${p} score is: ${players[p].score}</li>`
    }

}
