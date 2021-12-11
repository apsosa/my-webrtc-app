

let divSelectRoom = document.getElementById('selectRoom')
let divConsultingRoom = document.getElementById('consultingRoom')
let inputRoomNumber = document.getElementById('roomNumber')
let btnGoRoom = document.getElementById('goRoom')
let localVideo = document.getElementById('localVideo')
let remoteVideo = document.getElementById('remoteVideo')


let roomNumber, localStream, remoteStream, rtcPeerConnection, isCaller

const iceServers = {
  'iceServer': [
    { 'urls': 'stun:stun.localhost:3000:5349'},
    { 'urls': 'stun:stun.localhost:3000:5349'}
  ]
}
const streamConstraints = {
  audio: true,
  video: true
}

const socket = io()


btnGoRoom.onclick = () => {
  if (inputRoomNumber.value === '') {
    alert("please type a room name")
  } else {
    roomNumber = inputRoomNumber.value
    socket.emit('create or join', roomNumber)
    divSelectRoom.style = "display: none"
    divConsultingRoom.style = "display:block"
  }
}
socket.on('created',room => {
  console.log('pidiendo datos multimedia')
  navigator.mediaDevices.getUserMedia(streamConstraints)
    .then(stream => {
      localStream = stream
      localVideo.srcObject = stream
      isCaller = true
    })
    .catch(err => {
      console.log('An error has ocurred', err)
    })
})

socket.on('joined', function(room){
  navigator.mediaDevices.getUserMedia(streamConstraints)
    .then(stream => {
      localStream = stream
      localVideo.srcObject = stream
      socket.emit('ready',roomNumber)
    })
    .catch(err => {
      console.log('An error has ocurred', err)
    })
})

socket.on('candidate',function (event){
  const candidate = new RTCIceCandidate({
    sdpMLineIndex: event.label,
    candidate: event.candidate
  })
  console.log('received candidate',candidate)
  rtcPeerConnection.addIceCandidate(candidate)
})

socket.on('ready', function(){
  if(isCaller){
    rtcPeerConnection = new RTCPeerConnection(iceServers)
    rtcPeerConnection.onicecandidate = onIceCandidate
    rtcPeerConnection.ontrack = onAddStream
    rtcPeerConnection.addTrack(localStream.getTracks()[0],localStream)
    rtcPeerConnection.addTrack(localStream.getTracks()[1],localStream)
    rtcPeerConnection.createOffer()
      .then(sessionDescription =>{
        console.log('sending offer',sessionDescription)
        rtcPeerConnection.setLocalDescription(sessionDescription)
        socket.emit('offer',{
          type: 'offer',
          sdp: sessionDescription,
          room: roomNumber
        })
      })
      .catch(err=>{
        console.log(err)
      })
  }
})

socket.on('offer', function(event) {
  if(!isCaller){
    rtcPeerConnection = new RTCPeerConnection(iceServers)
    rtcPeerConnection.onicecandidate = onIceCandidate
    rtcPeerConnection.ontrack = onAddStream
    rtcPeerConnection.addTrack(localStream.getTracks()[0],localStream)
    rtcPeerConnection.addTrack(localStream.getTracks()[1],localStream)
    console.log('received offer',event)
    rtcPeerConnection.setRemoteDescription(new RTCSessionDescription(event))
    rtcPeerConnection.createAnswer()
      .then(sessionDescription =>{
        console.log('sending answer', sessionDescription)
        rtcPeerConnection.setLocalDescription(sessionDescription)
        socket.emit('answer',{
          type: 'answer',
          sdp: sessionDescription,
          room: roomNumber
        })
      })
      .catch(err=>{
        console.log(err)
      })
  }
})

socket.on('answer', (event)=> {
  console.log('received answer',event)
  rtcPeerConnection.setRemoteDescription(new RTCSessionDescription(event))
})



function onAddStream(event){
  remoteVideo.srcObject = event.streams[0]
  remoteStream = event.streams[0]
}

function onIceCandidate(event){
  if (event.candidate) {
    console.log('sending ice candidate', event.candidate)
    socket.emit('candidate',{
      type: 'candidate',
      label: event.candidate.sdpMLineIndex,
      id: event.candidate.sdpMid,
      candidate: event.candidate.candidate,
      room: roomNumber
    })
    
  }
}