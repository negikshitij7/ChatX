const islogin=async(req,res,next)=>{
try{
if(req.session.usermodel){

}
else{
    res.redirect('/');
}
next();
}
catch(error){
console.log(error.message)
}
}


const islogout=async(req,res,next)=>{
try{
if(req.session.usermodel){

    res.redirect('/dashboard');
}
next();
}
catch(error){
console.log(error.message)
}
}


module.exports={
    islogin,
    islogout
}
