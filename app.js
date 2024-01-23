

require('dotenv').config();

const mongoose=require('mongoose')
const userroute=require('./routes/userRoute')
mongoose.connect('mongodb://127.0.0.1:27017/dynamic-chat-app');
const chatmodel=require('./models/chatModel')

const app=require('express')();

var http=require('http').Server(app);


app.use('/',userroute);


const io=require('socket.io')(http);
const usermodel=require('./models/userModel')


var usp=io.of('/user-namespace');

usp.on('connection',async function(socket){
  console.log("the user is connected")
  var userid=socket.handshake.auth.token




await usermodel.findByIdAndUpdate({_id: userid},
    {
     $set:{
        is_online:'1'
     }   
    })


  socket.broadcast.emit('isonline',{user_id:userid})
  
  
  socket.on('a-message',function(data){
    socket.broadcast.emit('show-message',data)
  })

  socket.on('oldchats',async function(data){

   var chats= await chatmodel.find({ $or:[
         {sender_id:data.sender_id,reciever_id:data.reciever_id},
         {sender_id:data.reciever_id,reciever_id:data.sender_id}  
        ]  

      
    })
    
   socket.emit('loadchats',{chats:chats})

  })
 

socket.on('chatsdeleted',function(id){
   
    socket.broadcast.emit('remove-others',id)

})

socket.on('chatupdated',function(data){
 
  socket.broadcast.emit('updateothers',data)
})

socket.on('groupchatsend',function(data){

  socket.broadcast.emit('groupchatload',data);
})


socket.on('groupchatdeleted',function(id)
{
  socket.broadcast.emit('deleteallgroupchats',id)
})

socket.on('groupchatupdated',function(data){
  socket.broadcast.emit('updateallgroupchat',data)
})

  socket.on('disconnect',async function(){

await usermodel.findByIdAndUpdate({_id: userid},
    {
     $set:{
        is_online:'0'
     }   
    })

    
    socket.broadcast.emit('isoffline',{user_id:userid})
    console.log("the user has been disconnected")
  })

})



http.listen(3000,function(){

    console.log('the server is listening')
})

