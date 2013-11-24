var APP_TOKEN = "CAACev9gswDsBAA0xAa2KTcluFFw6wuUSZARKEYJ14CVLiPGULnDi3zNjqZCMJS4ah8JGPjT3mld2m7mHeuaryk5ZATRSOT2icFkPRJS0GWbJyAIRxhTAxuP0goaQElC8wezR5cP3nEdQIuiabLTiewZBkmcOCc8kYLx9rpeBf2qSG2TE38ZCEDQ6K1QfYljvOr8xQZC7tkiAZDZD";
var randomFriendID;

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

  //getting the access token shouldn't need to run this as I've gotten it. 
  //Also, we should delete this code if we go live because the secret key is in here
/*FB.api('/oauth/access_token?client_id=174546802753595&client_secret=91a7f8987db5ce5a179937047be09533&grant_type=client_credentials',function(response){
  console.log(response);
});*/
  

  //This is where I call the bulk of my FQL functions
  //getPhotosOfFriend();
  //pullLotsOfFriendData();
  birthdayQuestion();

  
}

//this function is a sample of how we could ask a birthday question
//BUG: If the target didn't put the year of their birth down, the logic to generate the wrong answers doesn't account for that.
function birthdayQuestion() {
  var randomNumberFromFriendArray;
  var randomFriend;

  //FQL query to get ids and names of all friends. The 'AND birthday' is to filter out people who didn't provide their birthday information to apps
  var getAllFriends = 'SELECT uid2 FROM friend WHERE uid1=me()';
  var getNamesOfFriends = 'SELECT uid, name, birthday, sex FROM user WHERE uid IN (SELECT uid2 FROM #query1) AND birthday';

  FB.api('/fql',{q:{'query1':getAllFriends,'query2':getNamesOfFriends}}, function(response){
    console.log(response.data[1]);
    //generate a random number from 1 to the number of friends you have
    randomNumberFromFriendArray = getRandomInt(1, response.data[1].fql_result_set.length);
    //randomFriend will be an object uid and name,birthday, and gender in it
    randomFriend = response.data[1].fql_result_set[randomNumberFromFriendArray];
    //REQUEST: Need to figure out how to pick one random friend, and use that for all subsequent functions (like a global variable)
    console.log(randomFriend);

    $("#main").append("<p>Target of the Stalk is: " + randomFriend.name + ".</p>");
    //change the way you refer to the target based on gender. defaults to his
    var gender = "his";
    if (randomFriend.sex == 'female') {
      gender = "her";
    };
    $("#main").append("<p>When is " + gender + " birthday?</p>");
    $("#main").append("<form><input type='radio' name='birthday' value='" + randomFriend.birthday + "'>" + randomFriend.birthday);
    var answer1 = randomBirthday();
    var answer2 = randomBirthday();
    var answer3 = randomBirthday();
    $("#main").append("<form><input type='radio' name='birthday' value='" + answer1 + "'>" + answer1);
    $("#main").append("<form><input type='radio' name='birthday' value='" + answer2 + "'>" + answer2);
    $("#main").append("<form><input type='radio' name='birthday' value='" + answer3 + "'>" + answer3+ "</form>");
  });
}

//this function will select a random friend from your friends list, an display 10 photos from that user
function getPhotosOfFriend() {
  var randomNumberFromFriendArray;
  var randomFriend;

  //FQL query to get ids and names of all friends
  var getAllFriends = 'SELECT uid2 FROM friend WHERE uid1=me()';
  var getNamesOfFriends = 'SELECT uid, name FROM user WHERE uid IN (SELECT uid2 FROM #query1)';

  FB.api('/fql',{q:{'query1':getAllFriends,'query2':getNamesOfFriends}}, function(response){
    console.log(response.data[1]);
    //generate a random number from 1 to the number of friends you have
    randomNumberFromFriendArray = getRandomInt(1, response.data[1].fql_result_set.length);
    //randomFriend will be an object uid and name in it
    randomFriend = response.data[1].fql_result_set[randomNumberFromFriendArray];
    //REQUEST: Need to figure out how to pick one random friend, and use that for all subsequent functions (like a global variable)
    console.log(randomFriend);

    //Query 1 gets 10 photos from a random friend, created after the specified date in 'created > strtotime...'
    //REQUEST: I'd like to be able to select 10 random photos though...
    //NOTE: showing pictures seems like it only makes sense if we're doing the reverse 20 questions game. Kind of like a 'guess who this person is based on their pictures'
    var getNameofRandomFriend = 'SELECT uid, name FROM user WHERE uid=' + randomFriend.uid2;
    var photosOfOneUser = 'SELECT pid, link, owner, src_big, created, place_id, caption, caption_tags, album_object_id FROM photo WHERE owner IN (SELECT uid FROM #query1) AND created > strtotime("10 February 2010") ORDER BY created DESC LIMIT 10 OFFSET 0';
    FB.api('/fql',{q:{"query1":getNameofRandomFriend,"query2":photosOfOneUser}}, function(response){
      console.log(response.data);
      for (var src in response.data[1].fql_result_set) {
        link = response.data[1].fql_result_set[src].src_big;
        $("#header").append("<img src='" + link + "'><br />");
      }

  });
});
}

function pullLotsOfFriendData() {
  var randomNumberFromFriendArray;
  var randomFriend;

//reference doc for columns in 'user' table: https://developers.facebook.com/docs/reference/fql/user
  
// how to do multiple queries json: http://stackoverflow.com/questions/7814486/new-fql-multiquery-in-graph-api-javascript-example

//FQL query to get lots of information from the logged in user's list of friends
//This query should work and not timeout
var query = 'SELECT about_me, activities,affiliations, birthday, books, current_address, current_location, devices, education, email, hometown_location, inspirational_people, interests, meeting_for, meeting_sex, name, movies, music, mutual_friend_count, pic_big, political, profile_url, quotes, relationship_status, religion, significant_other_id, sports, status, uid, username FROM user WHERE uid IN (SELECT uid2 FROM friend WHERE uid1=me())';

//Adding the work field to 'query' results in a timeout. So we'd have to call it in a separate query
var query2 = 'SELECT work FROM user WHERE uid IN (SELECT uid2 FROM friend WHERE uid1=me())';

//all fields that seemed useful (will timeout if you run this because FQL can only return 5000 results)
//var query = 'SELECT about_me, activities, affiliations, age_range, birthday, books, current_address, current_location, devices, education, email, hometown_location, inspirational_people, interests, languages, meeting_for, meeting_sex, mutual_friend_count, name, movies, music, pic_big, pic_cover, political, profile_blurb, profile_url, quotes, relationship_status, religion, significant_other_id, sports, status, tv, uid, username, website, work FROM user WHERE uid IN (SELECT uid2 FROM friend WHERE uid1=me())';

FB.api('/fql',{q:query}, function(response){
  console.log(response.data);
});

}  

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

//generates a random birthday
//code courtesy of http://codereview.stackexchange.com/questions/15022/random-month-day-with-js-jquery
function randomBirthday() {
  var days_array = [31,29,31,30,31,30,31,31,30,31,30,31];
  var month_array = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var m = randNum(12);
  var monthName = month_array[m-1];
  var m_limit = days_array[m-1];
  var d = randNum(m_limit);
  var birthdate = monthName + " " + d + ", " + getRandomInt(1970,1995);
  return birthdate;
  function randNum(limit){return Math.floor(Math.random()*limit)+1;}
}


// Load the SDK asynchronously
(function(d){
 var js, id = 'facebook-jssdk', ref = d.getElementsByTagName('script')[0];
 if (d.getElementById(id)) {return;}
 js = d.createElement('script'); js.id = id; js.async = true;
 js.src = "//connect.facebook.net/en_US/all.js";
 ref.parentNode.insertBefore(js, ref);
}(document));