var APP_TOKEN = "CAACev9gswDsBAA0xAa2KTcluFFw6wuUSZARKEYJ14CVLiPGULnDi3zNjqZCMJS4ah8JGPjT3mld2m7mHeuaryk5ZATRSOT2icFkPRJS0GWbJyAIRxhTAxuP0goaQElC8wezR5cP3nEdQIuiabLTiewZBkmcOCc8kYLx9rpeBf2qSG2TE38ZCEDQ6K1QfYljvOr8xQZC7tkiAZDZD";

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
},{scope: 'email,user_photos,user_videos,friends_about_me,friends_activities,friends_birthday,friends_checkins,friends_education_history,friends_events,friends_games_activity,friends_groups,friends_hometown,friends_interests,friends_likes,friends_location,friends_notes,friends_online_presence,friends_photo_video_tags,friends_photos,friends_questions,friends_relationship_details,friends_relationships,friends_religion_politics,friends_status,friends_subscriptions,friends_videos,friends_website,friends_work_history, user_work_history'});

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

  //getRandomFriend();
  //fqlQueryTest();
  getPhotosOfFriend();
}

function getPhotosOfFriend() {
  var randomNumberFromFriendArray;
  var randomFriend;

  //FQL query to get ids of all friends
  var getAllFriends = 'SELECT uid2 FROM friend WHERE uid1=me()';
  FB.api('/fql',{q:getAllFriends}, function(response){
    console.log(response.data);
    randomNumberFromFriendArray = getRandomInt(1, response.data.length);
    randomFriend = response.data[randomNumberFromFriendArray];
    console.log(randomFriend);

    //Query 1 gets 10 photos from a random friend, created after the specified date in 'created > strtotime...'
    //REQUEST: I'd like to be able to select 10 random photos though...
    var joinToGetName = 'SELECT uid, name FROM user WHERE uid=' + randomFriend.uid2;
    var photosOfOneUser = 'SELECT pid, link, owner, src_big, created, place_id, caption, album_object_id FROM photo WHERE owner IN (SELECT uid FROM #query1) AND created > strtotime("10 February 2010") ORDER BY created DESC LIMIT 10 OFFSET 0';
    FB.api('/fql',{q:{"query1":joinToGetName,"query2":photosOfOneUser}}, function(response){
      console.log(response.data);
  });
});
}
function fqlQueryTest() {
  var randomNumberFromFriendArray;
  var randomFriend;

//reference doc for columns in 'user' table: https://developers.facebook.com/docs/reference/fql/user
  
// how to do multiple queries json: http://stackoverflow.com/questions/7814486/new-fql-multiquery-in-graph-api-javascript-example

/*getting the access token
FB.api('/oauth/access_token?client_id=174546802753595&client_secret=91a7f8987db5ce5a179937047be09533&grant_type=client_credentials',function(response){
  console.log(response);
});*/

//FQL query to get ids of all friends
var getAllFriends = 'SELECT uid2 FROM friend WHERE uid1=me()';
FB.api('/fql',{q:getAllFriends}, function(response){
  console.log(response.data);
  randomNumberFromFriendArray = getRandomInt(1, response.data.length);
  randomFriend = response.data[randomNumberFromFriendArray];
  console.log(randomFriend);

  //FQL query to get 10 photos from a random friend, created after the specified date in 'created > strtotime...'
  var photosOfOneUser = 'SELECT pid, link, owner, src_big, created, place_id, caption, album_object_id FROM photo WHERE owner=' + randomFriend.uid2 + ' AND created > strtotime("10 February 2010") ORDER BY created DESC LIMIT 10 OFFSET 0';
  var joinToGetName = 'SELECT uid, name FROM user WHERE uid IN (SELECT owner FROM #query1)';
  FB.api('/fql',{q:{"query1":photosOfOneUser,"query2":joinToGetName}}, function(response){
    console.log(response.data);
  });
});
//FQL query to get id, first name and last name from the logged in user's list of friends
//var query = 'SELECT about_me, pic_big FROM user WHERE uid IN (SELECT uid2 FROM friend WHERE uid1=me())';

//This query should work...
var query = 'SELECT about_me, activities,affiliations, birthday, books, current_address, current_location, devices, education, email, hometown_location, inspirational_people, interests, meeting_for, meeting_sex, name, movies, music, mutual_friend_count, pic_big, political, profile_url, quotes, relationship_status, religion, significant_other_id, sports, status, uid, username FROM user WHERE uid IN (SELECT uid2 FROM friend WHERE uid1=me())';

var query2 = 'SELECT work FROM user WHERE uid IN (SELECT uid2 FROM friend WHERE uid1=me())';



//all fields that seemed useful (will timeout if you run this because FQL can only return 5000 results)
//var query = 'SELECT about_me, activities, affiliations, age_range, birthday, books, current_address, current_location, devices, education, email, hometown_location, inspirational_people, interests, languages, meeting_for, meeting_sex, mutual_friend_count, name, movies, music, pic_big, pic_cover, political, profile_blurb, profile_url, quotes, relationship_status, religion, significant_other_id, sports, status, tv, uid, username, website, work FROM user WHERE uid IN (SELECT uid2 FROM friend WHERE uid1=me())';

/*FB.api('/fql',{q:query}, function(response){
  console.log(response.data);
});*/

}

//this function will use the FB.api to pull your list of friends. Then it will
//randomly select one user from your friends list
function getRandomFriend() {
  
  //should be able to use this: https://developers.facebook.com/docs/graph-api/reference/user/
    
    //all possible fields
    //var fields = "name,birthday,hometown,about,address,age_range,bio,cover,currency,devices,education,favorite_athletes,email,favorite_teams,gender,id,inspirational_people,languages,link,location,political,quotes,relationship_status,religion,significant_other,sports,timezone,username,website,work,accounts,activities,albums,books,checkins,family,events,feed,groups,interests,likes.fields(name),links,locations,movies,music,mutualfriends,picture,posts,statuses,subscribedto,television,updates";

    //fields that don't work: interested_in,accounts,albums,feed

    //not useful fields: events
    
    //groups,interests,likes.fields(name),links,locations,movies,music,mutualfriends,picture,posts,statuses,subscribedto,television,updates

    //fields that work
    //var fields = "name,birthday,hometown,about,address,age_range,bio,cover,currency,devices,education,favorite_athletes,email,favorite_teams,gender,id,inspirational_people,languages,link,location,political,quotes,relationship_status,religion,significant_other,sports,timezone,username,website,work,activities,books,family,";

  var fields="name,groups";
  FB.api('/me/friends?fields=' + fields, function(response) {
    var randomNumberFromFriendArray = getRandomInt(1, response.data.length);
    var randomFriend = response.data[randomNumberFromFriendArray];

    for (var item in response.data){
        console.log(item.length);
        //console.log(response.data[item].name);
        console.log(response.data[item]);
        //if (item.length ==)
        //console.log(response);
      }
    //console.log(randomFriend);
    //randomFriend is an object with the fields inside it
    //return randomFriend;
    });
}
    
    
    //console.log(randomFriend);

    

function getPhoto() {
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

// Returns a random integer between min and max
// Using Math.round() will give you a non-uniform distribution!
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

// Load the SDK asynchronously
(function(d){
 var js, id = 'facebook-jssdk', ref = d.getElementsByTagName('script')[0];
 if (d.getElementById(id)) {return;}
 js = d.createElement('script'); js.id = id; js.async = true;
 js.src = "//connect.facebook.net/en_US/all.js";
 ref.parentNode.insertBefore(js, ref);
}(document));