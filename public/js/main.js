

//  const { json } = require("body-parser");

(function ($) {

	"use strict";

	var fullHeight = function () {

		$('.js-fullheight').css('height', $(window).height());
		$(window).resize(function () {
			$('.js-fullheight').css('height', $(window).height());
		});

	};
	fullHeight();

	$('#sidebarCollapse').on('click', function () {
		$('#sidebar').toggleClass('active');
	});

})(jQuery);


// Dynamic chat app script



function get_cookie(cookie_name) {
    let c_name = cookie_name + "=";
    let cookie_decoded = decodeURIComponent(document.cookie);
    let cookie_parts = cookie_decoded.split(';');
    
    for(let i = 0; i <cookie_parts.length; i++) {
        let c = cookie_parts[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(c_name) == 0) {
            return c.substring(c_name.length, c.length);
        }
    }
    return "";
}

console.log(get_cookie("user"))
var userdata=JSON.parse(get_cookie('user'));


var sender_id = userdata._id
var reciever_id;
var global_groupId;

var socket = io('/user-namespace',
	{
		auth: {
			token: userdata._id
		}
	});






$(document).ready(function () {

	$('.user-list').click(function () {
        console.log($(this).attr('data-name'))
		var userid = $(this).attr('data-id')
		reciever_id = userid
		$('.start-head').text($(this).attr('data-name'));
		$('.chat-section').show();

		socket.emit('oldchats', { sender_id: sender_id, reciever_id: reciever_id })


	})

	$('#chat-form').submit(function (event) {
		event.preventDefault();
		var message = $('#message').val();

		$.ajax({
			url: '/save-message',
			type: 'POST',
			data: { sender_id: sender_id, reciever_id: reciever_id, message: message },
			success: function (response) {

				if (response.success) {
					console.log(typeof response)
					$('#message').val('');
					let chat = response.data.message;
					let html = ` 

<div class="current-user-chat" id='`+ response.data._id + `'>
 <h5> <span>`+ chat + `</span>
  
  <i class="fa fa-trash" aria-hidden="true" data-id="`+ response.data._id + `" data-toggle="modal" data-target="#deletechatmodal"></i> 
  <i class="fa fa-edit" aria-hidden="true" data-id="`+ response.data._id + `" data-msg='` + chat + `' data-toggle="modal" data-target="#editchatmodal"></i>
  </h5>
  </div>
`
					$('#chat-container').append(html)

					socket.emit('a-message', response.data)

					scrollchat();
				}
				else {
					alert(response.msg)
				}
			}

		});

	});


});

socket.on('isonline', function (data) {
	$('#' + data.user_id + '-status').text('Online')
	$('#' + data.user_id + '-status').removeClass('offline-status')
	$('#' + data.user_id + '-status').addClass('online-status')
})

socket.on('isoffline', function (data) {
	$('#' + data.user_id + '-status').text('Offline')
	$('#' + data.user_id + '-status').removeClass('online-status')
	$('#' + data.user_id + '-status').addClass('offline-status')
})

socket.on('show-message', function (data) {

	if (sender_id == data.reciever_id && reciever_id == data.sender_id) {
		var html = `
 <div class="distance-user-chat" id="`+data._id+`">
 <h5> <span>`+ data.message +`</span> </h5>
  </div>
 `
		$('#chat-container').append(html)

		scrollchat();
	}
})

socket.on('loadchats', function (data) {
	$('#chat-container').html('')
	var chats = data.chats;

	var html = ''
	for (var i = 0; i < chats.length; i++) {
		var whichclass = '';

		if (chats[i]['sender_id'] == sender_id) {
			whichclass = 'current-user-chat'
		}
		else {
			whichclass = 'distance-user-chat'
		}

		html += `
   <div class='`+ whichclass + `' id='` + chats[i]['_id'] + `'>
 <h5> <span> `+ chats[i]['message'] + `</span>`;

		if (whichclass == 'current-user-chat') {
			html += `<i class="fa fa-trash" aria-hidden="true" data-id="` + chats[i]['_id'] + `" data-toggle="modal" data-target="#deletechatmodal"></i>`
			html += `<i class="fa fa-edit" aria-hidden="true" data-id="` + chats[i]['_id'] + `" data-msg='` + chats[i]['message'] + `' data-toggle="modal" data-target="#editchatmodal"></i>`
		}
		html += `
  
  </h5>
  </div>
   `

	}
	$('#chat-container').append(html);

	scrollchat();

})




// delete the chats


$(document).on('click', '.fa-trash', function () {

	var msg = $(this).parent().text()
	$('#deletemessage').text(msg)
	$('#delete-message-id').val($(this).attr("data-id"))


})


$('#deletechatform').submit(function (event) {

	event.preventDefault();
	var id = $('#delete-message-id').val()
	$.ajax({
		url: "delete-chat",
		type: "post",
		data: { id: id },

		success: function (response) {

			if (response.success) {
				$('#' + id).remove()
				$('#deletechatmodal').modal('hide');

				socket.emit('chatsdeleted', id)

			}
			else {
				alert(response.message)

			}

		}


	})

})

socket.on('remove-others', function (id) {

	$('#' + id).remove()

})


//edit the chats
$(document).on('click', '.fa-edit', function () {

	$('#edit-message-id').val($(this).attr('data-id'))
	$('#update-message').val($(this).attr('data-msg'))


})

$('#editchatform').submit(function (event) {

	event.preventDefault();

	var id = $('#edit-message-id').val()
	var msg = $('#update-message').val()



	$.ajax({

		url: 'edit-chat',
		type: 'POST',
		data: { id: id, message: msg },
		success: function (response) {
			if (response.success) {
				$('#editchatmodal').modal('hide');
				$('#' + id).find('span').text(msg);
				$('#' + id).find('.fa-edit').attr('data-msg', msg);

				socket.emit('chatupdated', { id: id, message: msg })

			}
			else {
				alert(response.message)
			}
		}
	})

})

socket.on('updateothers', function (data) {

	$('#' + data.id).find('span').text(data.message);
	// $('#' + data.id).find('.fa-edit').attr('data-msg', data.message);

})

// adding the different members to a group


$('.addMember').click(function(){

 var id= $(this).attr('data-id')
 var limit= $(this).attr('data-limit')

 $('#group_id').val(id)
 $('#group_limit').val(limit)


 $.ajax({
  url:'/get-members',
  type:'POST',
  data:{group_id:id},
  success:function(response){
  console.log(response)
	if(response.success)
	{
    var members=response.data;

    var html=''

	

	for(let i=0;i<members.length;i++)
	{  
		var ismemberofgroup=members[i]['member'].length>0?true:false;
           console.log(ismemberofgroup)
          html+=`
		 <tr>		  
		   <td><input type="checkbox" `+(ismemberofgroup?"checked":"")+` name="members[]" value="`+members[i]['_id'] +`"/> </td>
		   <td> `+members[i]['name']+` </td>
		 </tr> 

		 `;  
	}
   $('.addMemberInTable').html(html) 	
  }
  else{
	alert(response.message)
  }
}  

 })


})


$('#add-member-form').submit(function(event){
 
   event.preventDefault();

   var formdata=$(this).serialize();

   $.ajax({
    url:'/add-members',
    type:'POST',
	data:formdata,
	success:function(response){
         console.log(response)
		if(response.success==true)
		{ 
		 $("#add-member-form")[0].reset(); 
		 $('#memberModal').modal('hide');
           alert(response.msg);
		
		} 
        else{
			$('#add-member-error').text(response.msg);

			setTimeout(()=>{
                  $('#add-member-error').text('');
			},3000);

			
		}

	}
 

   })


});


$('.updateGroup').click(function(){

var obj=JSON.parse($(this).attr('data-obj'));

$("#groupid").val(obj._id)
$("#last_limit").val(obj.limit)
$("#group_name").val(obj.name)
console.log(obj.limit)
$("#group_limut").val(obj.limit)

})


$("#updateChatGroupForm").submit(function(event){

event.preventDefault();

$.ajax({
   url:"/update-chat-group",
   type:"POST",
   data:new FormData(this),
   contentType:false,
   cache:false,
   processData:false,

   success:function(res){

	alert(res.message)
    if(res.success)
    {
     location.reload();

	}
   }
})
})


$(".deleteGroup").click(function(){
 
	var grpid=$(this).attr('data-id');
	$("#grp_id").val(grpid);
	console.log($("#grp_id").val())

})



$("#deleteGroupForm").submit(function(event){

event.preventDefault();

var formdata=$(this).serialize();

$.ajax({

	url:"/delete-chat-group",
	type:'POST',
	data:formdata,
    success:function(req){
       if(req.success){
		console.log('success')
		$("#deleteGroupModal").modal('hide');
       alert("The Group was deleted")
	   location.reload();
	}
	   else{
         console.log('else')

		var html=`<p style="color: red">This Group could not be deleted</p>`
		$(".modal-body").append(html)

	   }

	}

})


})


$(".copyGroupLink").click(function(){

 $(this).prepend('<span class="addedtext" style="color:green;">Link Copied</span>')  

var groupid=$(this).attr('data-id');

var url=window.location.host+'/share-group/'+groupid;

var temp=$('<input>');

$('body').append(temp);

temp.val(url).select();

document.execCommand('copy');

temp.remove();

setTimeout(()=>{
$('.addedtext').remove();
},1500)


})

$(".joinGroup").click(function(){

var groupid=$(this).attr('data-id');

$(this).text("wait...")
$(this).attr('disabled','disabled')


$.ajax({

	url:"/join-group",
	type:"POST",
	data:{groupid:groupid},
	success:function(response){
        if(response.success)
		{
			console.log("here?")
			location.reload()
		    alert("Joined the Group")
		}
        else{
			alert(response.message)
			$(this).text("Join Group");
			$(this).removeAttr('disabled')
		}

	} 


})


})


$('.group-list').click(function(){
 
	if(global_groupId!=$(this).attr('data-id'))
	{
	  $("#group-chat-container").html('');	
	$(".group-start-head").text($(this).attr('data-name'));
	$(".group-chat-section").show();

	global_groupId=$(this).attr('data-id')

     loadGroupChats();
	}
})


$('#group-chat-form').submit(function(event){

event.preventDefault();

var message=$("#group-message").val();
console.log(message);
$.ajax({
  	url:"/save-group-chat",
    type:"POST",
	data:{sender_id:sender_id,group_id:global_groupId,message:message},
	success:function(response){
       if(response.success)
	   {
		console.log(response.chat)
		$("#group-message").val('');
        var chat=response.chat;
        
        var html=`
		 
		<div class='current-user-chat' id='`+chat._id+`' >
		     
	        <div class="name-shower mt-2">
				<img class="image-shower" src="`+chat.sender_id.image+`" alt="">
			  <b>You</b>
				 </div>
		    <h5>
			<span>`+chat.message+`</span>
			<i class="fa fa-trash grouptrash" aria-hidden="true" data-id="` + chat._id + `" data-toggle="modal" data-target="#deletegroupchatmodal"></i>
			<i class="fa fa-edit groupedit" aria-hidden="true" data-id="` + chat._id + `" data-msg='` + chat.message + `' data-toggle="modal" data-target="#editgroupchatmodal"></i>
			</h5>
		
		</div>`       
      
		$("#group-chat-container").append(html);
        
        socket.emit('groupchatsend',response.chat);

		scrollgroupchat()
	   }
	   else{
		console.log("errorrr")

		 alert(response.msg)
	   }

	}

})
})




function scrollchat() {
	$('#chat-container').animate({
		scrollTop: $('#chat-container').offset().top + $('#chat-container')[0].scrollHeight

	}, 200)
}
function scrollgroupchat() {
	$('#group-chat-container').animate({
		scrollTop: $('#group-chat-container').offset().top + $('#group-chat-container')[0].scrollHeight

	}, 200)
}


socket.on('groupchatload',function(data){
     if(global_groupId==data.group_id)
	 {
		var html=`
		<div class='distance-user-chat' id='`+data._id+`' >
		<div class="name-shower mt-2">
				<img class="image-shower" src="`+data.sender_id.image+`" alt="">
			  <b>`+data.sender_id.name+`</b>
		</div>
		<h5>
		<span>`+data.message+`</span>
		</h5>
	
	</div>`       
  
	$("#group-chat-container").append(html);
	scrollgroupchat()

	 }      
})


function loadGroupChats(){
  
  $.ajax({
	url:"/load-group-chats",
    type:"POST",
	data:{group_id:global_groupId},
	success:function(response){
	   if(response.success){

		console.log(response.chats)
        var chats=response.chats;       
   
		var use='';
        
		var html='';
		for(let i=0;i<chats.length;i++)
		{
			use='distance-user-chat';
			if(chats[i]['sender_id']._id==sender_id)
			{
				use='current-user-chat';
			}
			html+=`<div class=`+use+` id='`+chats[i]['_id']+`' >`
			if(chats[i]['sender_id']._id==sender_id)
			{
				html+=`<div class="name-shower mt-2">
				<img class="image-shower" src="`+chats[i]['sender_id'].image+`" alt="">
			  <b>You</b>
				 </div>
				`  
			}
			else{
               
              html+=`<div class="name-shower mt-2">
			  <img class="image-shower" src="`+chats[i]['sender_id'].image+`" alt="">
			<b>`+chats[i]['sender_id'].name+`</b>
			   </div>
			  `    
			}
			html+=`<h5>
			<span>`+chats[i].message+`</span>`
            if(chats[i]['sender_id']._id==sender_id)
			{
				html+=`<i class="fa fa-trash grouptrash" aria-hidden="true" data-id="` + chats[i]['_id'] + `" data-toggle="modal" data-target="#deletegroupchatmodal"></i>`
				html+=`<i class="fa fa-edit groupedit" aria-hidden="true" data-id="` + chats[i]['_id'] + `" data-msg='` + chats[i]['message'] + `' data-toggle="modal" data-target="#editgroupchatmodal"></i>`
			}
			html+=`</h5>
		
		</div>` 
		}

		$("#group-chat-container").append(html);
		scrollgroupchat()
       
	   }
	   else{
		alert(response.message);
	   }

	}
}) 
}

$(document).on('click','.grouptrash',function(){

    var msgid=$(this).attr('data-id');
	var msg=$(this).parent().find('span').text();
     console.log(msgid)
     console.log(msg)

	$("#delete-group-message-id").val(msgid);
	$("#deletegroupmessage").text(msg);
                         
})


$("#deletegroupchatform").submit(function(e){
	e.preventDefault();

  var msgid=$('#delete-group-message-id').val();
   
  $.ajax({
	url:'/delete-group-message',
	type:'POST',
	data:{id:msgid},
	success:function(res){
     if(res.success){
		$('#'+res.id).remove();
		$('#deletegroupchatmodal').modal('hide');	  
		
		socket.emit('groupchatdeleted',res.id);
	 }
	 else{
		alert(res.message)
	 }
	}
  })

})

socket.on('deleteallgroupchats',function(id){
	console.log("hitt")
	$("#" + id).remove();
})

$(document).on('click','.groupedit',function(){

 $('#edit-group-message-id').val($(this).attr('data-id'))
 $('#editgroupmessage').text($(this).attr('data-msg'))

})


$('#editgroupchatform').submit(function(e){
	e.preventDefault();
    var msgid=$('#edit-group-message-id').val();
    var msg=$('#update-group-message').val();

    $.ajax({
		url:"/edit-group-message",
		type:"POST",
		data:{id:msgid,message:msg},
		success:function(res){
			if(res.success){
               $('#editgroupchatmodal').modal('hide');
			   $('#'+msgid).find('span').text(msg);

			   socket.emit('groupchatupdated',{id:msgid,msg:msg})
			}
			else{
				alert(res.message)
			}
		}
	})


})

socket.on('updateallgroupchat',function(data){
	$('#'+data.id).find('span').text(data.msg)
})

