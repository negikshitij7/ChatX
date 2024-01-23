const bodyParser = require('body-parser');
const express=require('express')
const user_routes=express();
const session=require('express-session');
const {SESSION_SECRET}=process.env;

user_routes.use(session({secret:SESSION_SECRET}))

const cookie=require('cookie-parser')

user_routes.use(cookie())

user_routes.use(bodyParser.json());
user_routes.use(bodyParser.urlencoded({extended:true}));

user_routes.set('view engine','ejs')
user_routes.set('views','./views')


user_routes.use(express.static('public'));

const path=require('path')

const multer=require('multer')


const storage=multer.diskStorage({
        destination:function(req,file,cb){
            cb(null,path.join(__dirname,'../public/images'));
        },
        filename:function(req,file,cb){
          const name= Date.now()+'-'+file.originalname;
          cb(null,name)

    }})


const upload= multer({storage:storage});


const usercontroller=require('../controller/userController')
const middleware=require('../middleware/authlogin')

user_routes.get('/register',middleware.islogout,usercontroller.loadregister)
user_routes.post('/register',upload.single('image'),usercontroller.register)

user_routes.get('/',middleware.islogout,usercontroller.loadlogin)
user_routes.post('/',usercontroller.login)

user_routes.get('/logout',middleware.islogin,usercontroller.logout)
user_routes.get('/dashboard',middleware.islogin,usercontroller.loaddashboard)

user_routes.post('/save-message',usercontroller.saveMessage)

user_routes.post('/delete-chat',usercontroller.deletechat)


user_routes.post('/edit-chat',usercontroller.editchat)

user_routes.get('/groups',middleware.islogin,usercontroller.loadgroups) 

user_routes.post('/groups',upload.single('image'),usercontroller.creategroup) 


user_routes.post('/get-members',middleware.islogin,usercontroller.getMembers)
user_routes.post('/add-members',middleware.islogin,usercontroller.addMembers)


user_routes.post('/update-chat-group',middleware.islogin,upload.single('image'),usercontroller.updateChatGroup)
user_routes.post('/delete-chat-group',middleware.islogin,usercontroller.deleteChatGroup)
user_routes.get('/share-group/:id',usercontroller.shareLink)
user_routes.post('/join-group',usercontroller.joinGroup)
user_routes.get('/group-chat',middleware.islogin,usercontroller.groupChat)
user_routes.post('/save-group-chat',middleware.islogin,usercontroller.groupchatSave)
user_routes.post('/load-group-chats',middleware.islogin,usercontroller.loadgroupChats)
user_routes.post('/delete-group-message',middleware.islogin,usercontroller.deletegroupmessage)
user_routes.post('/edit-group-message',middleware.islogin,usercontroller.editgroupmessage)

user_routes.get('*',function(req,res){
  res.redirect('/')
})

module.exports=user_routes;