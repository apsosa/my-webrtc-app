let divSelectRoom = document.getElementById('selectRoom')
let divConsultingRoom = document.getElementById('consultingRoom')
let inputRoomNumber = document.getElementById('roomNumber')
let btnGoRoom = document.getElementById('goRoom')
let localVideo = document.getElementById('localVideo')
let remoteVideo = document.getElementById('remoteVideo')


let roomNumber,localSteam,remoteStream,rtcPeerConnection,isCaller

const iceServers = {
  'iceServer': [
    {'urls':'stun:stun.services.mozilla.com'},
    {'urls':'stun:stun.l.google.com:19302'}
  ]
}
const streamConstrainst = {
  audio: true,
  video: true
}
btnGoRoom.onclick = ()=>{
  if(inputRoomNumber.value == ''){
    alert("please type a room name")
  }else{
    navigator.mediaDevices.getUserMedia(streamConstrainst)
      .then(stream =>{
        localSteam = stream
        localVideo.srcObject = stream
      })
      .catch(err=>{
        console.log('An error has ocurred',err)
      })
    divSelectRoom.style = "display: none"
    divConsultingRoom.style = "display:block"
  }
}
