var questions = [];
var APP_TOKEN = "CAACev9gswDsBAA0xAa2KTcluFFw6wuUSZARKEYJ14CVLiPGULnDi3zNjqZCMJS4ah8JGPjT3mld2m7mHeuaryk5ZATRSOT2icFkPRJS0GWbJyAIRxhTAxuP0goaQElC8wezR5cP3nEdQIuiabLTiewZBkmcOCc8kYLx9rpeBf2qSG2TE38ZCEDQ6K1QfYljvOr8xQZC7tkiAZDZD";
var randomFriendID;
var guesses = 0;

var FIELDS_STALKERBOOK = ["activities", "affiliations","birthday_date","books", "current_location", "friend_count", "hometown_location", "inspirational_people", "interests", "languages", "movies", "music", "mutual_friend_count", "political", "quotes", "relationship_status", "religion", "significant_other_id", "sports", "tv"];

//uid, name, pic_square, work, education are pulled by default
var FIELDS_WHOAMI = ["activities", "birthday","birthday_date","books", "hometown_location", "interests", "languages", "movies", "music", "mutual_friend_count", "political", "relationship_status", "religion", "significant_other_id", "sports", "tv", "website"];

var targetAnswer;
var playerInfo = [];
$(document).ready(function()
{

  $("#go").prop("disabled",true);
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

    $("#login").on("click", function() {
      Login();
    });

    $("#go").on("click", function() {
      $('.wrong').removeClass('wrong');  // resetting any greyed out images
      $('#friends').addClass('hidden'); // hiding the friendGrid again.
      $('#lives').addClass('hidden');
      //disables the 'Go' button until the game is ready to play
      $(this).prop("disabled",true);
      whoAmIGameStart();
    });

// ******************************

    $('.friend').on('click', function(e) {
      var friend = $(this).attr('data-name');
      var uidGuess = $(this).attr('data-uid');
      guesses++;
      console.log('Your guess is: ' + friend + '.');
      if (uidGuess == targetAnswer[0].uid){
        alert("You've guessed correctly! You were looking for: " + targetAnswer[1].name);

        //TODO: add feedback that isn't an alert
        //TODO: add/change scoring
        //placeholder score value
        var score = 5;
        //Once the correct friend is clicked, a database call is made to record the guesser's ID, the guesser's username, the target ID, the target username, and the score
        $.post('db.php', {
          action: 'newscore',
          guesserid: playerInfo[0].uid,
          guesserusername: playerInfo[0].name,
          targetid: targetAnswer[0].uid,
          targetusername: targetAnswer[1].name,
          score: score
        }, function(data) {
          console.log(data);
          updateAllScores();
          //alert('done');
        });        
      } 
      else if(guesses >= 3) {
      	// game over
      	alert("Ran out of guesses. Terrorists win.");
      } else {
        alert("You are incorrect. Please keep guessing.");
        $(this).addClass('wrong');

        // append another hint
        whoAmIAddHint();
      }
      console.log(targetAnswer);

    });

});

function Login()
{

  FB.login(function(response) {
   if (response.authResponse) 
   {
    getUserInfo();
    $("#go").prop("disabled",false);
    $("#login").hide();

    //getting the access token (shouldn't need to run this as I've already grabbed it) 
    //Also, we should delete this code if we go live because the secret key is in here
    /*FB.api('/oauth/access_token?client_id=174546802753595&client_secret=91a7f8987db5ce5a179937047be09533&grant_type=client_credentials',function(response){
    console.log(response);
    });*/
  } else 
  {
   console.log('User cancelled login or did not fully authorize.');
 }
},{scope: 'email,user_photos,user_videos,friends_about_me,friends_activities,friends_birthday,friends_checkins,friends_education_history,friends_events,friends_games_activity,friends_groups,friends_hometown,friends_interests,friends_likes,friends_location,friends_notes,friends_online_presence,friends_photo_video_tags,friends_photos,friends_questions,friends_relationship_details,friends_relationships,friends_religion_politics,friends_status,friends_subscriptions,friends_videos,friends_website,friends_work_history, user_work_history'});

}

function getUserInfo() {
  FB.api('/me', function(response) {
    var str="Facebook login successful!<br> Welcome <b>"+response.name+"</b><br>";
    playerInfo.push({uid: response.id, name: response.name, link: response.link});
    $("#status").html(str);
    FB.api('/me/picture?type=normal', function(response) {
      var picture="<img src='"+response.data.url+"'/>";
      $("#status").append(picture);
      $("#status").append("<br>How well do you know your friends?");
      $("#status").append("<br><input type='button' value='Logout' onclick='Logout();'/>");
    }); 
  });
}

function whoAmIGameStart(){
  var data;
  $("#questions").html("");
  $("#questions").html("<p>Reticulating splines, please wait.</p>");  
  //clearing the fb friends pictures
  for (var i = 1; i <= 20; i++){
    var $friend = $('#friend' + i.toString()); // this is one friend
    $friend.find("img").attr("src", ""); // adding a photo
    $friend.attr("data-name", "") // adding data
           .attr("data-uid", "");
    $friend.find('.name').text(""); // adding name text
  };
  var friendsUidList;

  FB.api('/fql',{q:'SELECT uid2 FROM friend WHERE uid1=me()'}, function(response){
      friendsUidList = response.data;
      //console.log(friendsUidList);
      //generate 5 random fields
      data = whoAmIGenerateRandomFields(FIELDS_WHOAMI, friendsUidList);  
    });
  return data;
}

function whoAmIGenerateRandomFields(fields, friendsUidList){
  var nullFilterString;
  var nullFilter = [];
  var friendsGrid;
  var friendTargetInfo;
  var targetUid = friendsUidList[getRandomInt(0, friendsUidList.length-1)].uid2;


  //how many additional fields to pull from the facebook tables
  var fieldsMax = 10;
  fields.sort( function() {return 0.5 - Math.random() });
  var randomFields = fields.slice(0,fieldsMax).toString().replace(/\,/g, ', ');

  console.log("Pulling the following profile fields: uid, name, pic, work, education, " + randomFields);
  
  //this will try to grab a facebook friend who has shared at least their work, education, AND gender
  var getTargetProfileInfo = 'SELECT uid, name, pic, pic_square, profile_url, work, education, current_location, sex, ' + randomFields + ' FROM user WHERE uid=' + targetUid + ' AND work AND education AND sex';

  FB.api('/fql',{q:getTargetProfileInfo}, function(response){
    //if the returning array is empty, try another user
    if (response.data.length == 0) {
      console.log("Friend did not have enough information shared. Grabbing another random friend.");
      whoAmIGameStart();
    } else {   
      var gameData = whoAmICreateQuestions(response.data);
      questions = gameData[0];
      friendTargetInfo = gameData[1];
      console.log("Game Questions:");
      console.log(questions);
      console.log("Target Friend Info:");
      console.log(friendTargetInfo);

      //this is the query to get 20 random fb profile pictures
      var getFriendsGridQuery = "SELECT uid, name, pic_square, pic, profile_url FROM user WHERE uid IN (SELECT uid2 FROM friend WHERE uid1=me()) ORDER BY rand() limit 20";
      FB.api('/fql',{q:getFriendsGridQuery}, function(response){
        friendsGrid = response.data;
        
        //this checks to make sure the target uid has not been randomly selected
        for (key in friendsGrid){
          if (friendsGrid[key].uid == friendTargetInfo[0].uid) {
            friendsGrid.splice(key, 1);
          }
        }
        //making sure we have 19 friends in the friend grid before we push the target user into it
        if (friendsGrid.length == 20) {
          friendsGrid.pop();
        }
        //adding the target profile picture into the friendsgrid
        friendsGrid.push({"uid" : friendTargetInfo[0].uid, "name" : friendTargetInfo[1].name, "pic" : friendTargetInfo[2].pic, "pic_square" : friendTargetInfo[3].pic_square, "profile_url" : friendTargetInfo[4].profile_url, "answer" : 1});
        console.log("this is the friends grid and the info in contains");
        console.log(friendsGrid);

        //randomize the friends grid
        friendsGrid.sort( function() {return 0.5 - Math.random() });
        //draw the randomized friends grid on the page
        for (var i in friendsGrid){
          var id = parseInt(i)+1;
          var $friend = $('#friend' + id.toString()); // this is one friend

          $friend.find("img").attr("src", friendsGrid[i].pic); // adding a photo
          $friend.attr("data-name", friendsGrid[i].name) // adding data
                 .attr("data-uid", friendsGrid[i].uid);
          $friend.find('.name').text(friendsGrid[i].name); // adding name text
        }
<<<<<<< Updated upstream
        whoAmIPrintToHtml();
=======
        $('#friends').removeClass('hidden');
        $('#lives').removeClass('hidden');
        whoAmIPrintToHtml(questions);
>>>>>>> Stashed changes
        targetAnswer = friendTargetInfo;
        $("#go").prop("disabled", false);

      });
      
      }
  });
return friendTargetInfo;
}

function whoAmICreateQuestions(data){
  //console.log(data);
  var questionCounter = 1;
  questions = [];
  var targetFriendInfo = [];

  var targetFriend = data;
  for (key in targetFriend[0]) {
    //if the field is empty, skip it
    if (!targetFriend[0][key] || targetFriend[0][key].length === 0) {
      console.log("No information, skipping: " + key);
    }
    //otherwise, start populating the questions object.
    else {
      // This switch statement will compare every field in the targetFriend object and create the appropriate questions provided we have the data.
      switch (key) {
        case "activities":            
          var questionString = "q" + questionCounter;
          var answerString = "These are my favorite activities: " + targetFriend[0][key];
          var questionType = "activities";
          questions.push({ "questionNumber" : questionString, "answer" : answerString, "questionType" : questionType});
          questionCounter += 1;
          break;
        case "birthday_date":            
          var questionString = "q" + questionCounter;
          var answerString = "This is my birthday: " + convertBirthdayDateToBirthday(targetFriend[0][key]);
          var questionType = "birthday";
          questions.push({ "questionNumber" : questionString, "answer" : answerString, "questionType" : questionType});
          questionCounter += 1;
          break;
        case "books":            
          var questionString = "q" + questionCounter;
          var answerString = "These are my favorite books: " + targetFriend[0][key];
          var questionType = "books";
          questions.push({ "questionNumber" : questionString, "answer" : answerString, "questionType" : questionType});
          questionCounter += 1;
          break;
        case "current_location":            
          var questionString = "q" + questionCounter;
          var answerString = "This is my current location: " + targetFriend[0][key].name;
          var questionType = "current_location";
          questions.push({ "questionNumber" : questionString, "answer" : answerString, "questionType" : questionType});
          questionCounter += 1;
          break;
        case "hometown_location":            
          var questionString = "q" + questionCounter;
          var answerString = "This is my hometown location: " + targetFriend[0][key].name;
          var questionType = "hometown_location";
          questions.push({ "questionNumber" : questionString, "answer" : answerString, "questionType" : questionType});
          questionCounter += 1;
          break; 
        case "education":      
          var questionString = "q" + questionCounter;
          var questionType = "education";
          var educationArray = targetFriend[0][key];
          for (var i in educationArray) {
            if (educationArray[i].type) {
              var answerString = "I have previously attended (or currently attend): " + educationArray[i].school.name + " " + educationArray[i].type;
              questions.push({ "questionNumber" : questionString, "answer" : answerString, "questionType" : questionType});
              questionCounter += 1;              
            } else {
              var answerString = "I have previously attended (or currently attend): " + educationArray[i].employer.name;
              questions.push({ "questionNumber" : questionString, "answer" : answerString, "questionType" : questionType});
              questionCounter += 1;
              }
          }          
          //this method picks one random work position and adds it to the question
          /*var questionString = "q" + questionCounter;
          var questionType = "education";
          var selectRandomEducation = targetFriend[0][key][getRandomInt(0,targetFriend[0][key].length-1)];
          if (selectRandomEducation.type) {
              var answerString = "I have previously attended (or currently attend): " + selectRandomEducation.school.name + " " + selectRandomEducation.type;
            } else {
              var answerString = "I have previously attended (or currently attend): " + selectRandomEducation.school.name;
              }
          questions.push({ "questionNumber" : questionString, "answer" : answerString, "questionType" : questionType});   
          questionCounter += 1;*/
          break;
        case "interests":            
          var questionString = "q" + questionCounter;
          var answerString = "These are my interests: " + targetFriend[0][key];
          var questionType = "interests";
          questions.push({ "questionNumber" : questionString, "answer" : answerString, "questionType" : questionType});
          questionCounter += 1;
          break;
        case "sex":            
          var questionString = "q" + questionCounter;
          var answerString = "This my identified gender: " + targetFriend[0][key];
          var questionType = "sex";
          questions.push({ "questionNumber" : questionString, "answer" : answerString, "questionType" : questionType});
          questionCounter += 1;
          break;
        case "languages":      
          var languageArray = [];
          for (var i in targetFriend[0][key]) {
            languageArray.push(targetFriend[0][key][i].name);
          }
          var languagesSpokenString = languageArray.toString().replace(/\,/g, ' | ');
          var questionString = "q" + questionCounter;
          var answerString = "These are the languages I speak: " + languagesSpokenString;
          var questionType = "language";
          questions.push({ "questionNumber" : questionString, "answer" : answerString, "questionType" : questionType});
          questionCounter += 1;
          break;
        case "movies":            
          var questionString = "q" + questionCounter;
          var answerString = "These are my favorite movies: " + targetFriend[0][key];
          var questionType = "movies";
          questions.push({ "questionNumber" : questionString, "answer" : answerString, "questionType" : questionType});
          questionCounter += 1;
          break;
        case "music":            
          var questionString = "q" + questionCounter;
          var answerString = "This is my favorite music: " + targetFriend[0][key];
          var questionType = "music";
          questions.push({ "questionNumber" : questionString, "answer" : answerString, "questionType" : questionType});
          questionCounter += 1;
          break;
        case "mutual_friend_count":            
          var questionString = "q" + questionCounter;
          var answerString = "This is how many mutual friends we have: " + targetFriend[0][key];
          var questionType = "mutual_friend_count";
          questions.push({ "questionNumber" : questionString, "answer" : answerString, "questionType" : questionType});
          questionCounter += 1;
          break;
        case "name":            
          var answerString = targetFriend[0][key];
          var questionType = "name";
          targetFriendInfo.push({ "name" : answerString});
          break;
        case "pic":            
          var answerString = targetFriend[0][key];
          var questionType = "pic";
          targetFriendInfo.push({ "pic" : answerString});
          break;
        case "pic_square":            
          var answerString = targetFriend[0][key];
          var questionType = "pic_square";
          targetFriendInfo.push({ "pic_square" : answerString});
          break;
        case "political":            
          var questionString = "q" + questionCounter;
          var answerString = "This is my political affiliation: " + targetFriend[0][key];
          var questionType = "political";
          questions.push({ "questionNumber" : questionString, "answer" : answerString, "questionType" : questionType});
          questionCounter += 1;
          break;
        case "profile_url":            
          var answerString = targetFriend[0][key];
          var questionType = "profile_url";
          targetFriendInfo.push({ "profile_url" : answerString});
          break;        
        case "relationship_status":            
          var questionString = "q" + questionCounter;
          var answerString = "This is my relationship status: " + targetFriend[0][key];
          var questionType = "relationship_status";
          questions.push({ "questionNumber" : questionString, "answer" : answerString, "questionType" : questionType});
          questionCounter += 1;
          break;
        case "religion":            
          var questionString = "q" + questionCounter;
          var answerString = "This is my religion: " + targetFriend[0][key];
          var questionType = "religion";
          questions.push({ "questionNumber" : questionString, "answer" : answerString, "questionType" : questionType});
          questionCounter += 1;
          break;
        case "significant_other_id":            
          var query = 'SELECT name FROM user WHERE uid=' + targetFriend[0][key];
          FB.api('/fql',{q:query}, function(response){
            console.log("sig fig response");
            console.log(response);
            var questionString = "q" + questionCounter;
            var answerString = "This is my significant other: " + response.data[0].name;
            var questionType = "significant_other_id";
            questions.push({ "questionNumber" : questionString, "answer" : answerString, "questionType" : questionType});
          });
          questionCounter += 1;
          break;
        case "sports":            
          console.log(targetFriend[0][key]);
          var questionString = "q" + questionCounter;
          var questionType = "sports";
          var sportsArray = targetFriend[0][key];
          for (var i in sportsArray) {
            var answerString = "This is a sport I play: " + sportsArray[i].name;
            questions.push({ "questionNumber" : questionString, "answer" : answerString, "questionType" : questionType});
              questionCounter += 1;            
          } 
          break;
        case "tv":            
          var questionString = "q" + questionCounter;
          var answerString = "This is my favorite TV shows: " + targetFriend[0][key];
          var questionType = "tv";
          questions.push({ "questionNumber" : questionString, "answer" : answerString, "questionType" : questionType});
          questionCounter += 1;
          break;
        case "uid":            
          var answerString = targetFriend[0][key];
          var questionType = "uid";
          targetFriendInfo.push({ "uid" : answerString});
          break;        
        case "website":            
          var questionString = "q" + questionCounter;
          var answerString = "This is my website(s): " + targetFriend[0][key];
          var questionType = "website";
          questions.push({ "questionNumber" : questionString, "answer" : answerString, "questionType" : questionType});
          questionCounter += 1;
          break;
        case "work":      
          var questionString = "q" + questionCounter;
          var questionType = "work";
          var workArray = targetFriend[0][key];
          for (var i in workArray) {
            if (workArray[i].position) {
              var answerString = "This is a job I once had (or currently have): " + workArray[i].position.name + " at " + workArray[i].employer.name;
              questions.push({ "questionNumber" : questionString, "answer" : answerString, "questionType" : questionType});
              questionCounter += 1;
              
            } else {
              var answerString = "This is a company I once worked at (or am currently at): " + workArray[i].employer.name;
              questions.push({ "questionNumber" : questionString, "answer" : answerString, "questionType" : questionType});
              questionCounter += 1;
              }
          }
          //this method picks one random work position and adds it to the question
          /*var selectRandomWork = targetFriend[0][key][getRandomInt(0,targetFriend[0][key].length-1)];
          if (selectRandomWork.position) {
              var answerString = "This is a job I once had (or currently have): " + selectRandomWork.position.name + " at " + selectRandomWork.employer.name;
            } else {
              var answerString = "This is a company I once worked at am currently at: " + selectRandomWork.employer.name;
              }
          questions.push({ "questionNumber" : questionString, "answer" : answerString, "questionType" : questionType});         */
          break;          
      };
    };
  };

  //If the questions object has less than 10 hints, pick another friend
  if (questions.length < 10) {
    whoAmIGameStart();
  } else {      
    return [questions, targetFriendInfo];
    }
  
}

//this function prints the hints to the HTML
function whoAmIPrintToHtml(){
  $("#questions").html("");
  //randomize the questions array
  questions.sort( function() {return 0.5 - Math.random() });


  // print out first three questions, then remove them from the array.
  for(var i = 0 ; i < 3 ; ++i) {
	  var currentQuestion = questions.pop();
      $("#questions").append("<div id='" + currentQuestion.questionNumber + "'><p>" + currentQuestion.answer + "</p>");
  }

  // //printing out the information in the Questions Object
  // for (object in questions) {
  //   var questionId = parseInt(object) + 1;
  //   $("#questions").append("<div id='q" + questionId + "'><p>" + questions[object].answer + "</p>"); 
  //   object++; 
  // }
}

// adds another hint
function whoAmIAddHint(){
  var currentQuestion = questions.pop();
  $("#questions").append("<div id='" + currentQuestion.questionNumber + "'><p>" + currentQuestion.answer + "</p>");
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

//courtesy of http://stackoverflow.com/questions/8533357/convert-string-as-mm-dd-yyyy-to-day-of-week-month-name-year-in-javascript
function convertBirthdayDateToBirthday(birthdate) {
  var MONTHS = ["January","Februry","March","April","May","June","July","August","September","October","November","December"];
  var myDate;
  var myFormatDate;
  var t = birthdate.split("/");
  //console.log(t);
  if(t[2]) {
    myDate = new Date(t[2], t[0] - 1, t[1]);
    myFormatDate = MONTHS[myDate.getMonth()] + ", " + myDate.getDate() + ", " + myDate.getFullYear();
  } else {
    myDate = new Date(new Date().getFullYear(), t[0] - 1, t[1]);
    myFormatDate = MONTHS[myDate.getMonth()] + ", " + myDate.getDate();
    }
  return myFormatDate;
}

// Load the SDK asynchronously
(function(d){
 var js, id = 'facebook-jssdk', ref = d.getElementsByTagName('script')[0];
 if (d.getElementById(id)) {return;}
 js = d.createElement('script'); js.id = id; js.async = true;
 js.src = "//connect.facebook.net/en_US/all.js";
 ref.parentNode.insertBefore(js, ref);
}(document));