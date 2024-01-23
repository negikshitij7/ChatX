const usermodel=require('../models/userModel')
const chatmodel=require('../models/chatModel')
const bcrypt=require('bcrypt')
const groupModel = require('../models/groupModel')
const membermodel=require('../models/memberModel');
const groupchatmodel=require('../models/groupchatModel')

var mongoose=require('mongoose');
const groupchatModel = require('../models/groupchatModel');


const loadregister=async(req,res)=>{
try{
res.render('register')

}
catch(error)
{
console.log(error.message)
}
}
const register=async(req,res)=>{
try{

    const encryptedpass=await bcrypt.hash(req.body.password,10)

    const newuser=new usermodel({
     
      name:req.body.name,
      email:req.body.email,
      image:'images/'+req.file.filename,
      password:encryptedpass

    })
    console.log('test')
    await newuser.save();

    res.render('register',{message:'The new user got successfully registered'})

}
catch(error)
{
    console.log(error.message)
}
}
const loadlogin=async(req,res)=>{
    try{
    res.render('login')
    }
    catch(error)
    {
     console.log(error.message)
    }
    
    }
const login=async(req,res)=>{
try{
const email=req.body.email;
const password=req.body.password;

const userdata=await usermodel.findOne({email:email})

if(userdata)
{
const pass=await bcrypt.compare(password,userdata.password)
if(pass)
{
   req.session.usermodel=userdata;
   res.cookie(`user`,JSON.stringify(userdata))
   res.redirect('/dashboard');
}
else{
  
res.render('login',{message:'The email and password are not correct'})
}
}
else{
res.render('login',{message:'The email and password are not correct'})
}



}
catch(error)
{
 console.log(error.message)
}

}

const logout=async(req,res)=>{
try{

    res.clearCookie('user')
req.session.destroy();
res.redirect('/');
}
catch(error)
{
 console.log(error.message)
}

}
const loaddashboard=async(req,res)=>{
try{

    var users=await usermodel.find({_id:{$nin:[req.session.usermodel._id]}})
   
res.render('dashboard',{user:req.session.usermodel,users:users})
}
catch(error)
{
 console.log(error.message)
}
}




const saveMessage=async(req,res)=>{
try{

    
    console.log('submittttt')
    var newchat=new chatmodel({
      sender_id:req.body.sender_id,
      reciever_id:req.body.reciever_id,         
      message:req.body.message      
    })

var showchat=await newchat.save()

res.status(200).send({success:true,msg:"chat inserted",data:showchat})

}
catch(error)
{
res.status(400).send({success:false,msg:error.message})

}


}


const deletechat=async(req,res)=>{
try{
    await chatmodel.deleteOne({_id:req.body.id})
     
    
    res.status(200).send({success:true})
}
catch(error)
{
    res.status(400).send({success:false,message:error.message})
}

}

const editchat=async(req,res)=>{
try{
    await chatmodel.findOneAndUpdate({_id:req.body.id},
        
     {
        $set:{
            message:req.body.message
        }
     })
     res.status(200).send({success:true})
}
catch(error)
{
    res.status(400).send({success:false,message:error.message})
}

}


const loadgroups=async(req,res)=>{
try{
const groups=await groupModel.find({creator_id:req.session.usermodel._id})

res.render('group',{groups:groups})
}
catch(error)
{
    console.log(error)
}



}

const creategroup=async(req,res)=>{
try{

  const newgroup=  new groupModel({
   creator_id:req.session.usermodel._id,
   name:req.body.name,
   image:'images/'+req.file.filename,
   limit:req.body.limit

    })
 await newgroup.save()

 const groups=await groupModel.find({creator_id:req.session.usermodel._id})

res.render('group',{message:req.body.name+" group has been created",groups:groups}) 
}
catch(error)
{
console.log(error.message)
}
}


const getMembers=async(req,res)=>{

try{
var userss=await usermodel.aggregate([
   {
     $lookup:{
        from:"members",
        localField:"_id",
        foreignField:"memberId",
        pipeline:[
            {
                $match:{
                    $expr:{
                        $and:[
                            {$eq:["$groupId",new mongoose.Types.ObjectId(req.body.group_id)]}
                        ]
                    }
                }
            }
        ],
        as:"member"
     }
   },
   {
         $match:{
            "_id":{$nin:[new mongoose.Types.ObjectId(req.session.usermodel._id)]}
         }
   }  

])


res.status(200).send({success:true,data:userss})
}
catch(error)
{

 res.status(400).send({success:false,msg:error.message})
}

}




const addMembers=async(req,res)=>{

try{
    console.log("atleast here")
if(!req.body.members){
  
    res.status(200).send({success:false,msg:'No members selected'})
}
else if(req.body.members.length > parseInt(req.body.group_limit)){
        
    res.status(200).send({success:false,msg:'Only '+req.body.group_limit+' members allowed.'})
      }
     else{


        await membermodel.deleteMany({groupId:req.body.group_id});
        
         var data=[];

         const members=req.body.members;

         for(let i=0;i<members.length;i++){
         data.push(
            {
                groupId:req.body.group_id,
                memberId:members[i]
            }
         );

         }
          
      membermodel.insertMany(data);

        res.status(200).send({success:true,msg:'The members have been successfully added'})
     }
    }     
catch(error)
{
console.log('here')
 res.status(400).send({success:false,msg:error.message})
}

}

const updateChatGroup=async(req,res)=>{
try{
if(parseInt(req.body.limit)<parseInt(req.body.last_limit))
{
  await membermodel.deleteMany({groupId:req.body.id});
}

var obj;

if(req.file!=undefined)
{
    obj={
        name:req.body.name,
        image:"images/"+req.file.filename,
        limit:req.body.limit
    }
}
else{
    obj={
        name:req.body.name,
        limit:req.body.limit
    }
    
}

await groupModel.findByIdAndUpdate({_id:req.body.id},{
    $set:obj
});

res.status(200).send({success:true,message:"the group has been updated successfully"})

}
catch(error)
{


    res.status(400).send({success:false,message:error.message})
}
 

}


const deleteChatGroup=async(req,res)=>{
    try{
 
      await groupModel.deleteOne({_id:new mongoose.Types.ObjectId(req.body.group_id)})
      await membermodel.deleteMany({groupId:req.body.group_id})


     res.status(200).send({success:true})
    }
    catch{

        res.status(400).send({success:false})
    }
}

const shareLink=async(req,res)=>{
try{

    var groupid=req.params.id;

    var isgroup=await groupModel.findOne({_id:new mongoose.Types.ObjectId(req.params.id)});

    if(!isgroup)
    {
        res.render('error.ejs',{message:"This Link is not valid"});
    }
    else if(req.session.usermodel==undefined)
    {
        res.render('error.ejs',{message:"you need to login to share the url"})
    }
    else{       
        var noofmembers=await membermodel.find({groupId:groupid}).count();
        
        var available=isgroup.limit-noofmembers
         
        var iscreator= isgroup.creator_id==req.session.usermodel._id?true:false;
       
        var isjoined=await membermodel.find({groupId:groupid,memberId:req.session.usermodel._id}).count();

        res.render('sharelink',{group:isgroup,noofmembers:noofmembers,available:available,iscreator:iscreator,isjoined:isjoined});
    }
}
catch(error)
{
    res.render(error.message)
}    
}

const joinGroup=async(req,res)=>{
    try{
       
      const join=new membermodel({
      groupId:req.body.groupid,
      memberId:req.session.usermodel._id
      })

      await join.save();

        res.status(200).send({success:true});
    }
    catch(error)
    {
        res.status(400).send({success:false,message:"The group could not be Joined"});
    }
}


const groupChat=async(req,res)=>{
  try{

  const createdgroups=await groupModel.find({creator_id:req.session.usermodel._id});
  const joinedgroups=await membermodel.find({memberId:req.session.usermodel._id}).populate('groupId');

  res.render('chatgroup',{createdgroups:createdgroups,joinedgroups:joinedgroups})

  }
  catch(error)
  {
    console.log(error.message)
  }
 

}


const groupchatSave=async(req,res)=>{
 
try{   
    var chats=new groupchatmodel({
          sender_id:req.body.sender_id,
          group_id:req.body.group_id,
          message:req.body.message
    })
   
   var newchat=await chats.save();
   var send=await groupchatmodel.findOne({_id:newchat._id}).populate('sender_id')
   res.send({success:true,msg:"chat inserted",chat:send})
}
catch(error)
{
  
    res.send({success:false,msg:error.message})
}
}


const loadgroupChats=async(req,res)=>{
try{
   
 var chats=await  groupchatModel.find({group_id:req.body.group_id}).populate('sender_id');  

 res.send({success:true,chats:chats}) 
}
catch(error)
{
    res.send({success:false,message:error.message})
}
}


const deletegroupmessage=async(req,res)=>{
try{

  await  groupchatmodel.deleteOne({
    _id:req.body.id
  })

    res.status(200).send({success:true,id:req.body.id})
}
catch(error)
{
   res.status(400).send({success:false,message:"The message could not be deleted"})
}

}


const editgroupmessage=async(req,res)=>{
try
{
    await groupchatmodel.updateOne({
        _id:req.body.id
    },{
        $set:{
            message:req.body.message
        }
    }
    )
res.send({success:true})

}
catch(error)
{
    res.send({success:false,message:error.message})
}



}



module.exports={
 loadregister,
 register,
 login,
 loadlogin,
 logout,
 loaddashboard,
 saveMessage,
 deletechat,
 editchat,
 loadgroups,
 creategroup,
 getMembers,
 addMembers,
 updateChatGroup,
 deleteChatGroup,
 shareLink,
 joinGroup,
 groupChat,
 groupchatSave,
 loadgroupChats,
 deletegroupmessage,
 editgroupmessage
}