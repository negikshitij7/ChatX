const mongoose=require('mongoose')

const chatmodel=new mongoose.Schema({

sender_id:{
type:mongoose.Schema.Types.ObjectId,
ref:'User'
},
reciever_id:{
  type:mongoose.Schema.Types.ObjectId,
  ref:'User'
},

message:{
type:String,
required:true
}
},
{timestamps:true});

module.exports=mongoose.model('chat',chatmodel)