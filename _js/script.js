$(document).ready(function()
{
    //reference: http://hayageek.com/facebook-javascript-sdk/
    window.fbAsyncInit = function() {
      FB.init({
      appId      : 174546802753595, // App ID
      //channelUrl : 'YOUR_WEBSITE_CHANNEL_URL',
      status     : true, // check login status
      cookie     : true, // enable cookies to allow the server to access the session
      xfbml      : true  // parse XFBML
    });
    };

  /*//Setting up Facebook API 
	$.ajaxSetup({ cache: true });
  	$.getScript('//connect.facebook.net/en_US/all.js', function(){
    	FB.init({
      		appId: 174546802753595,
    	});     
    $('#loginbutton,#feedbutton').removeAttr('disabled');
    FB.getLoginStatus(updateStatusCallback);
  	
  	});		

	var fburl = "http://graph.facebook.com/USER/callback=?"

	/*$.ajax({
		url: "fburl",
  		
		})
	.done(function() {
  		console.log("success");
  	})
  	.fail(function() {
  		console.log("fail");
  	});*/

});

function Login()
{

  FB.login(function(response) {
   if (response.authResponse) 
   {
    getUserInfo();
  } else 
  {
   console.log('User cancelled login or did not fully authorize.');
 }
},{scope: 'email,user_photos,user_videos'});

}

function getUserInfo() {
  FB.api('/me', function(response) {

    var str="<b>Name</b> : "+response.name+"<br>";
    str +="<b>Link: </b>"+response.link+"<br>";
    str +="<b>Username:</b> "+response.username+"<br>";
    str +="<b>id: </b>"+response.id+"<br>";
    str +="<b>Email:</b> "+response.email+"<br>";
    str +="<b>Hometown:</b> "+response.hometown.name+"<br>";
    str +="<input type='button' value='Get Photo' onclick='getPhoto();'/>";
    str +="<input type='button' value='Logout' onclick='Logout();'/>";
          //document.getElementById("status").innerHTML=str;
    $("#status").html(str);

  });

  FB.api('/me/friends', function(response) {
    console.log(response.data[0]);
  });
}
function getPhoto()
{
  FB.api('/me/picture?type=normal', function(response) {

    var str="<br/><b>Pic</b> : <img src='"+response.data.url+"'/>";
          //document.getElementById("status").innerHTML+=str;
          $("#status").append(str);

        });

}
function Logout()
{
  FB.logout(function(){document.location.reload();});
}

(function(d){
 var js, id = 'facebook-jssdk', ref = d.getElementsByTagName('script')[0];
 if (d.getElementById(id)) {return;}
 js = d.createElement('script'); js.id = id; js.async = true;
 js.src = "//connect.facebook.net/en_US/all.js";
 ref.parentNode.insertBefore(js, ref);
}(document));