const mongoose=require('mongoose')


const memberSchema=new mongoose.Schema({
groupId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'Group'
},
memberId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'User'
}
},{timestampes:true});

module.exports=mongoose.model('Member',memberSchema)