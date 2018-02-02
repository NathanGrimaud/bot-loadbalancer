const io = require('socket.io-client')
const socket = io.connect('http://localhost:3001?id=1234')
console.log("will connect")
socket.on('connect', ()=>{
    console.log("connected")
})