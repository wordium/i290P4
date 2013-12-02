var APP_TOKEN = "CAACev9gswDsBAA0xAa2KTcluFFw6wuUSZARKEYJ14CVLiPGULnDi3zNjqZCMJS4ah8JGPjT3mld2m7mHeuaryk5ZATRSOT2icFkPRJS0GWbJyAIRxhTAxuP0goaQElC8wezR5cP3nEdQIuiabLTiewZBkmcOCc8kYLx9rpeBf2qSG2TE38ZCEDQ6K1QfYljvOr8xQZC7tkiAZDZD";
var randomFriendID;

var FIELDS_STALKERBOOK = ["activities", "affiliations","birthday_date","books", "current_location", "friend_count", "hometown_location", "inspirational_people", "interests", "languages", "movies", "music", "mutual_friend_count", "political", "quotes", "relationship_status", "religion", "significant_other_id", "sports", "tv", "website"];

//uid, name, pic_square, work, education are pulled by default
var FIELDS_WHOAMI = ["activities", "birthday","birthday_date","books", "hometown_location", "interests", "languages", "movies", "music", "mutual_friend_count", "political", "relationship_status", "religion", "significant_other_id", "sports", "tv", "website"];

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

    $("#go").on("click", function() {
      Login();
      //getPhotosOfFriend();
      //pullLotsOfFriendData();
      //birthdayQuestion();
      //stalkerGameStart();
      whoAmIGameStart();
    });

    $("#whoAmIGuess").on("submit", function(e) {
      //BUG how to stop page from refreshing after clicking submit?
      e.preventDefault();
      var guess = $("#guess").val();
      console.log("your guess is" + guess);
      
    });

    $('.friend').on('click', function(e) {
      // this will get the name of the friend, which we can stick into data-name
      // if it's useful to have ID numbers, we can put those in, too.
      var friend = $(this).attr('data-name');
      console.log('Your guess is: ' + friend + '.');

    });

});

function Login()
{

  FB.login(function(response) {
   if (response.authResponse) 
   {
    getUserInfo();

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

}

function whoAmIGameStart(){
  
  $("#questions").html("");
  $("#questions").html("<p>Reticulating splines, please wait.</p>");  
  var friendsUidList;

  FB.api('/fql',{q:'SELECT uid2 FROM friend WHERE uid1=me()'}, function(response){
      friendsUidList = response.data;
      //console.log(friendsUidList);
      //generate 5 random fields
      data = whoAmIGenerateRandomFields(FIELDS_WHOAMI, friendsUidList);  
    });
}

function whoAmICreateQuestions(data){
  //console.log(data);
  var questionCounter = 1;
  var questions = [];
  var targetFriendInfo = [];
  //getting mutual friends - apparently you can't get a mutual friends list unless the target friend approved this specific application
  /*var mutualFriendQuery = 'SELECT uid, first_name, last_name, pic_small FROM user WHERE uid IN (SELECT uid2 FROM friend WHERE uid1 = me()) AND uid IN (SELECT uid2 FROM friend WHERE uid1=' + targetFriend.uid + ')';
  FB.api('/fql', {q:mutualFriendQuery}, function(response){
    console.log(response);
  });*/
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
          var questionString = "q" + questionCounter;
          var answerString = "This are the sports I play: " + targetFriend[0][key];
          var questionType = "sports";
          questions.push({ "questionNumber" : questionString, "answer" : answerString, "questionType" : questionType});
          questionCounter += 1;
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
      //questionCounter += 1;
    };
  };

  //If the questions object has less than 4 bits of information, pick another friend
  if (questions.length < 5) {
    whoAmIGameStart();
  } else {      
    return [questions, targetFriendInfo];
    }
  
}

function whoAmIGenerateRandomFields(fields, friendsUidList){
  var nullFilterString;
  var nullFilter = [];
  var friendsGrid;
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
      $("#loadingStatus").html("<p>Still reticulating splines, just sit tight.</p>");
      whoAmIGameStart();
    } else {   
      var gameData = whoAmICreateQuestions(response.data);
      var questions = gameData[0];
      var friendTargetInfo = gameData[1];
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
          var friendIdJquery = 'friend' + id.toString();
          $('#' + friendIdJquery).find("img").attr("src", friendsGrid[i].pic);
          $('#' + friendIdJquery).attr("data-name", friendsGrid[i].name);
          //$('#' + friendIdJquery).append("<p>" + friendsGrid[i].name + "</p>");
        }
        whoAmIPrintToHtml(questions);

      });
      
      }
  });
}


function whoAmIPrintToHtml(questions){
  //NOTE: significant other information doesn't populate until after the rest of the whoAmIGameStart() function has run because of the FB asynchronous calls. If we print all the questions to html right away, sig other won't show up. If call each key from the questions object one at a time, it will give the significant other information enough time to show up at the end of the questions object.

  //randomize the questions array
  questions.sort( function() {return 0.5 - Math.random() });
  //printing out the information in the Questions Object
  for (object in questions) {
    var questionId = parseInt(object) + 1;
    $("#questions").append("<div id='q" + questionId + "'><p>" + questions[object].answer + "</p>"); 
    object++; 
  }
}

function selectRandomFriend(data) {
  //generate a random number from 1 to the length of the friends array you pulled back
  var randomNumberFromFriendArray = getRandomInt(0, data.fql_result_set.length-1);
  //randomFriend will be an object with all the called for fields in it
  var randomFriend = data.fql_result_set[randomNumberFromFriendArray];
  return randomFriend;

}

//this function randomly sorts the FIELDS array and it selects the first 8 elements to act as the 5 questions for the game
function stalkerBookGenerateRandomFields(fields, randomFields){
  var nullFilterString;
  var nullFilter = [];
  //how many additional fields to pull from the facebook tables
  var fieldsMax = 4;
  fields.sort( function() {return 0.5 - Math.random() });
  randomFields = fields.slice(0,fieldsMax).toString().replace(/\,/g, ', ');

  console.log("These are the randomly selected fields that we'll be requesting from the user table data. uid, name, pic_square, work, and education are all pulled by default.")
  console.log(randomFields);
  nullFilter = randomFields.toString().replace(/\,/g, ' OR');
  
  //FQL query string to get ids and names of all friends with the data we need. The 'AND birthday' is to filter out people who didn't provide their birthday information to apps
  var getAllFriends = 'SELECT uid2 FROM friend WHERE uid1=me()';
  //this FQL query string will give you an object of friends who have valid information in the 5 random fields
  //var getEligibleFriends = 'SELECT uid, name, pic_big, education, work, ' + randomFields + ' FROM user WHERE uid IN (SELECT uid2 FROM #query1) AND (education AND work) AND (' + nullFilter + ')';
  //var getEligibleFriends = 'SELECT uid, name, pic_big, education, work FROM user WHERE uid IN (SELECT uid2 FROM #query1)';
  
  console.log(getAllFriends);
  console.log(getEligibleFriends);
  return [getAllFriends, getEligibleFriends];
}

/* SPECS for Friend Stalker Quiz Game
//generate 5 random questions about a friend
make an array of fields, select a random 5, add that to the FQL query along with 'uid, name, pic_square'. 
// add the strings from the array, 
// only pick friends who have answers for those 5 questions. if none, then choose another random 5 fields.

PROBLEM - generating dummy answers for all the possible fields that could be pulled is going to be difficult. I think the Who Am I game would be easier to create
*/
function stalkerGameStart(){
  $("#loadingStatus").html("<p>Reticulating splines, please wait.</p>");
  var randomFields;
  var data = {};

  //generate 5 random fields
  data = stalkerBookGenerateRandomFields(FIELDS_STALKERBOOK, randomFields);  
  var getAllFriends = data[0];
  var getEligibleFriends = data[1];

  //FQL query
  FB.api('/fql',{q:{'query1':getAllFriends,'query2':getEligibleFriends}}, function(response){
    console.log(response.data[1].fql_result_set.length);
    data = response.data[1];
    //if the friends array is empty, get another 5 random fields
    if (response.data[1].fql_result_set.length == 0) {
      $("#loadingStatus").html("<p>Still reticulating splines, please sit tight.</p>");
      stalkerGameStart();
    } else {
      stalkerBookCreateQuestions(response.data[1]);
    }
  });
}

function stalkerBookCreateQuestions(data){
  console.log(data);
  var targetFriend = selectRandomFriend(data);
  var questionCounter = 0;
  var questions = [];
  var targetFriendInfo = [];
  console.log(targetFriend);

  //add targetFriend object to database via AJAX call
/*  $.ajax({
    type:"post",
    url:"phpDatabaseScript.php",
    data:"action=post"+"&targetFriend="+JSON.stringify(targetFriend),
    success:function(data){
      console.log("Success");
      console.log(data);
    }
  });*/
  for (key in targetFriend) {
    //console.log(key);
    //console.log(targetFriend[key]);
    
    //if the field is empty, skip it
    if (!targetFriend[key] || targetFriend[key].length === 0) {
      console.log("No information, skipping: " + key);
    }
    //otherwise, start populating the questions object.
    else {
      // This switch statement will compare every field in the targetFriend object and create the appropriate questions provided we have the data.
      switch (key) {
        case "activities":            
          var questionNumber = "q" + questionCounter;
          var questionString = "What are my favorite activities? ";
          var correctAnswer = targetFriend[key];
          var questionType = "activities";
          questions.push({ "questionNumber" : questionNumber, "questionString" : questionString, "answer" : correctAnswer, "questionType" : questionType});
          break;
        case "birthday_date":            
          var questionNumber = "q" + questionCounter;
          var questionString = "When is my birthday? ";
          var correctAnswer = convertBirthdayDateToBirthday(targetFriend[key]);
          var questionType = "birthday";
          questions.push({ "questionNumber" : questionNumber, "questionString" : questionString, "answer" : correctAnswer, "questionType" : questionType});
          break;
        case "books":            
          var questionNumber = "q" + questionCounter;
          var questionString = "What are my favorite books? ";
          var correctAnswer = targetFriend[key];
          var questionType = "books";
          questions.push({ "questionNumber" : questionNumber, "questionString" : questionString, "answer" : correctAnswer, "questionType" : questionType});
          break;
        case "current_location":            
          var questionNumber = "q" + questionCounter;
          var questionString = "What is my current location? " 
          var correctAnswer = targetFriend[key].name;
          var questionType = "current_location";
          questions.push({ "questionNumber" : questionNumber, "questionString" : questionString, "answer" : correctAnswer, "questionType" : questionType});
          break;
        case "hometown_location":            
          var questionNumber = "q" + questionCounter;
          var questionString = "What is my hometown location? "
          var correctAnswer = targetFriend[key].name;
          var questionType = "hometown_location";
          questions.push({ "questionNumber" : questionNumber, "questionString" : questionString, "answer" : correctAnswer, "questionType" : questionType});
          break; 
        case "education":      
          console.log(getRandomInt(0,targetFriend[key].length-1));
          var selectRandomEducation = targetFriend[key][getRandomInt(0,targetFriend[key].length-1)];
          console.log(selectRandomEducation);
          if (selectRandomEducation.type) {
              var questionString = "Which " + selectRandomEducation.type + " did I go to?";
            } else {
              var questionString = "Which school did I go to?";              
              } 
          var questionNumber = "q" + questionCounter;
          var questionType = "education";
          var correctAnswer = selectRandomEducation.school.name;          
          questions.push({ "questionNumber" : questionNumber, "questionString" : questionString, "answer" : correctAnswer, "questionType" : questionType});
          break;
        case "friend_count":            
          var questionNumber = "q" + questionCounter;
          var questionString = "How many facebook friends do I have? ";
          var correctAnswer = targetFriend[key];
          var questionType = "friend_count";
          questions.push({ "questionNumber" : questionNumber, "questionString" : questionString, "answer" : correctAnswer, "questionType" : questionType});
          break;        
        case "interests":            
          var questionNumber = "q" + questionCounter;
          var questionString = "What are my interests? ";
          var correctAnswer = targetFriend[key];
          var questionType = "interests";
          questions.push({ "questionNumber" : questionNumber, "questionString" : questionString, "answer" : correctAnswer, "questionType" : questionType});
          break;
        case "inspirational_people":            
          var questionNumber = "q" + questionCounter;
          var questionString = "Which people do I find inspirational? ";
          var correctAnswer = targetFriend[key];
          var questionType = "inspirational_people";
          questions.push({ "questionNumber" : questionNumber, "questionString" : questionString, "answer" : correctAnswer, "questionType" : questionType});
          break;        
        case "languages":      
          var languageArray = [];
          for (var i in targetFriend[key]) {
            languageArray.push(targetFriend[key][i].name);
          }
          var languagesSpokenString = languageArray.toString().replace(/\,/g, ' | ');
          var questionNumber = "q" + questionCounter;
          var questionString = "What languages do I speak? "
          var correctAnswer = languagesSpokenString;
          var questionType = "language";
          questions.push({ "questionNumber" : questionNumber, "questionString" : questionString, "answer" : correctAnswer, "questionType" : questionType});
          break;
       case "movies":            
          var questionNumber = "q" + questionCounter;
          var questionString = "What are my favorite movies? ";
          var correctAnswer = targetFriend[key];
          var questionType = "movies";
          questions.push({ "questionNumber" : questionNumber, "questionString" : questionString, "answer" : correctAnswer, "questionType" : questionType});
          break;
        case "music":            
          var questionNumber = "q" + questionCounter;
          var questionString = "What is my favorite music? ";
          var correctAnswer = targetFriend[key];
          var questionType = "music";
          questions.push({ "questionNumber" : questionNumber, "questionString" : questionString, "answer" : correctAnswer, "questionType" : questionType});
          break;
        case "mutual_friend_count":            
          var questionNumber = "q" + questionCounter;
          var questionString = "How many mutual friends do we have? ";
          var correctAnswer = targetFriend[key];
          var questionType = "mutual_friend_count";
          questions.push({ "questionNumber" : questionNumber, "questionString" : questionString, "answer" : correctAnswer, "questionType" : questionType});
          break;
        case "name":            
          var answerString = targetFriend[key];
          var questionType = "name";
          targetFriendInfo.push({ "answer" : answerString, "questionType" : questionType});
          break;
        case "pic":            
          var answerString = targetFriend[key];
          var questionType = "pic";
          targetFriendInfo.push({ "answer" : answerString, "questionType" : questionType});
          break;
        case "political":            
          var questionNumber = "q" + questionCounter;
          var questionString = "What is my political affiliation? ";
          var correctAnswer = targetFriend[key];
          var questionType = "political";
          questions.push({ "questionNumber" : questionNumber, "questionString" : questionString, "answer" : correctAnswer, "questionType" : questionType});
          break;
        case "profile_url":            
          var answerString = targetFriend[key];
          var questionType = "profile_url";
          targetFriendInfo.push({ "answer" : answerString, "questionType" : questionType});
          break;   
        case "quotes":            
          var questionNumber = "q" + questionCounter;
          var questionString = "Which are my favorite quotes? ";
          var correctAnswer = targetFriend[key];
          var questionType = "quotes";
          questions.push({ "questionNumber" : questionNumber, "questionString" : questionString, "answer" : correctAnswer, "questionType" : questionType});
          break;             
        case "relationship_status":            
          var questionNumber = "q" + questionCounter;
          var questionString = "What is my relationship status? ";
          var correctAnswer = targetFriend[key];
          var questionType = "relationship_status";
          questions.push({ "questionNumber" : questionNumber, "questionString" : questionString, "answer" : correctAnswer, "questionType" : questionType});
          break;
        case "religion":            
          var questionNumber = "q" + questionCounter;
          var questionString = "What is my religious affiliation? ";
          var correctAnswer = targetFriend[key];
          var questionType = "religion";
          questions.push({ "questionNumber" : questionNumber, "questionString" : questionString, "answer" : correctAnswer, "questionType" : questionType});
          break;
        case "significant_other_id":            
          var query = 'SELECT name FROM user WHERE uid=' + targetFriend[key];
          FB.api('/fql',{q:query}, function(response){
            console.log("sig fig response");
            console.log(response);
            var questionNumber = "q" + questionCounter;
            var questionString = "Who is my significant other? ";
            var correctAnswer = response.data[0].name;
            var questionType = "significant_other_id";
            questions.push({ "questionNumber" : questionNumber, "questionString" : questionString, "answer" : correctAnswer, "questionType" : questionType});
          });
          break;
        case "sports":            
          var questionNumber = "q" + questionCounter;
          var questionString = "What sports do I like? ";
          var correctAnswer = targetFriend[key];
          var questionType = "sports";
          questions.push({ "questionNumber" : questionNumber, "questionString" : questionString, "answer" : correctAnswer, "questionType" : questionType});
          break;
        case "tv":            
          var questionNumber = "q" + questionCounter;
          var questionString = "What are my favorite TV shows? ";
          var correctAnswer = targetFriend[key];
          var questionType = "tv";
          questions.push({ "questionNumber" : questionNumber, "questionString" : questionString, "answer" : correctAnswer, "questionType" : questionType});
          break;
        case "website":            
          var questionNumber = "q" + questionCounter;
          var questionString = "What is my website? ";
          var correctAnswer = targetFriend[key];
          var questionType = "website";
          questions.push({ "questionNumber" : questionNumber, "questionString" : questionString, "answer" : correctAnswer, "questionType" : questionType});
          break;
        case "work":      
          console.log(getRandomInt(0,targetFriend[key].length-1));
          var selectRandomWork = targetFriend[key][getRandomInt(0,targetFriend[key].length-1)];
          console.log(selectRandomWork);
          if (selectRandomWork.position) {
              var questionString = "Which job is associated with me? "
              var correctAnswer = selectRandomWork.position.name + " at " + selectRandomWork.employer.name;
            } else {
              var questionString = "Which employer is in my work history? "
              var correctAnswer = selectRandomWork.employer.name;
              } 
          var questionNumber = "q" + questionCounter;
          var questionType = "work";          
          questions.push({ "questionNumber" : questionNumber, "questionString" : questionString, "answer" : correctAnswer, "questionType" : questionType});
          break;
      };
      questionCounter += 1;
    };
  };
  console.log(questions);
  //If the questions object has less than 3 bits of information, pick another friend
  if (questions.length < 1) {
    $("#stalkerBook").html("<p>Selected User: " + targetFriend['name'] + " isn't sharing enough information. Selecting another user. Please wait</p>");
    stalkerGameStart();
  } else {      
    $("#stalkerBook").html("<p>How well do you know: " + targetFriend.name + "?</p><img src='" + targetFriend.pic_big + "'>");
    return [questions, targetFriendInfo];
    }
  
}




//this function is a sample of how we could ask a birthday question
//BUG: If the target didn't put the year of their birth down, the logic to generate the wrong answers doesn't account for that.
function birthdayQuestion() {
  var randomNumberFromFriendArray;
  var randomFriend;

  //FQL query to get ids and names of all friends. The 'AND birthday' is to filter out people who didn't provide their birthday information to apps
  var getAllFriends = 'SELECT uid2 FROM friend WHERE uid1=me()';
  var getNamesOfFriends = 'SELECT uid, name, birthday, sex, pic_square FROM user WHERE uid IN (SELECT uid2 FROM #query1) AND birthday_date';

  FB.api('/fql',{q:{'query1':getAllFriends,'query2':getNamesOfFriends}}, function(response){
    console.log(response.data[1]);
    //generate a random number from 1 to the number of friends you have
    randomNumberFromFriendArray = getRandomInt(1, response.data[1].fql_result_set.length);
    //randomFriend will be an object uid and name,birthday, and gender in it
    randomFriend = response.data[1].fql_result_set[randomNumberFromFriendArray];
    //REQUEST: Need to figure out how to pick one random friend, and use that for all subsequent functions (like a global variable)
    console.log(randomFriend);

    $("#main").append("<p>Target of the Stalk is: " + randomFriend.name + ".");
    $("#main").append("<img src='" + randomFriend.pic_square + "'></p>");
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
    $("#main").append("<input type='radio' name='birthday' value='" + answer1 + "'>" + answer1);
    $("#main").append("<input type='radio' name='birthday' value='" + answer2 + "'>" + answer2);
    $("#main").append("<input type='radio' name='birthday' value='" + answer3 + "'>" + answer3+ "</form>");
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
    var getNameOfRandomFriend = 'SELECT uid, name FROM user WHERE uid=' + randomFriend.uid;
    var photosOfOneUser = 'SELECT pid, link, owner, src_big, created, place_id, caption, caption_tags, album_object_id FROM photo WHERE owner IN (SELECT uid FROM #query1) AND created > strtotime("10 February 2010") ORDER BY created DESC LIMIT 10 OFFSET 0';
    FB.api('/fql',{q:{"query1":getNameOfRandomFriend,"query2":photosOfOneUser}}, function(response){
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