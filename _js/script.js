var APP_TOKEN = "CAACev9gswDsBAA0xAa2KTcluFFw6wuUSZARKEYJ14CVLiPGULnDi3zNjqZCMJS4ah8JGPjT3mld2m7mHeuaryk5ZATRSOT2icFkPRJS0GWbJyAIRxhTAxuP0goaQElC8wezR5cP3nEdQIuiabLTiewZBkmcOCc8kYLx9rpeBf2qSG2TE38ZCEDQ6K1QfYljvOr8xQZC7tkiAZDZD";
var randomFriendID;

var FIELDS = ["activities", "affiliations", "age_range","birthday","birthday_date","books", "current_location", "education", "friend_count", "hometown_location", "inspirational_people", "interests", "languages", "movies", "music", "mutual_friend_count", "political", "quotes", "relationship_status", "religion", "significant_other_id", "sports", "tv", "website", "work"];

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
  var randomFields;
  var data = {};

  //generate 5 random fields
  data = whoAmIGenerateRandomFields(FIELDS_WHOAMI, randomFields);  
  var getAllFriends = data[0];
  var getEligibleFriends = data[1];

  //FQL query
  FB.api('/fql',{q:{'query1':getAllFriends,'query2':getEligibleFriends}}, function(response){
    console.log(response.data[1].fql_result_set.length);
    data = response.data[1];
    $("#questions").html("");
    //if the friends array is empty, get another 5 random fields
    if (response.data[1].fql_result_set.length == 0) {
      $("#loadingStatus").html("<p>Still reticulating splines, just sit tight.</p>");
      whoAmIGameStart();
    } else {
      var gameData = whoAmICreateQuestions(response.data[1]);
      var questions = gameData[0];
      var friendTargetInfo = gameData[1];
      console.log(questions);
      console.log(friendTargetInfo);
      $("#whoAmI").html("<form id='whoAmIGuess'>Who am I? <input id='guess' type='text'><br /><button type='submit'>Guess</form>");
      printToHtml(questions);
    }
  });
}

function printToHtml(questions){
  //NOTE: significant other information doesn't populate until after the rest of the whoAmIGameStart() function has run because of the FB asynchronous calls. If we print all the questions to html right away, sig other won't show up. If call each key from the questions object one at a time, it will give the significant other information enough time to show up at the end of the questions object.

  //printing out the information in the Questions Object
  for (object in questions) {
  //since work history is in an object, we need logic to print the contents
  if (questions[object].questionType == "work") {
    $("#questions").append("<div id='" + questions[object].questionNumber + "'><p>This is my work history: <br />");
    for (item in questions[object].answer) {
      $("#questions").append("Employer: " + questions[object].answer[item].employer + "<br />");      
      $("#questions").append("Position: " + questions[object].answer[item].position + "<br />");      
    }
  } else if (questions[object].questionType == "education") {
    $("#questions").append("<div id='" + questions[object].questionNumber + "'><p>This is my education history: <br />");
    for (item in questions[object].answer) {
      $("#questions").append("School Name: " + questions[object].answer[item].name + "<br />");      
      $("#questions").append("Type of School: " + questions[object].answer[item].type + "<br />");      
    }      
  } else {
    $("#questions").append("<div id='" + questions[object].questionNumber + "'><p>" + questions[object].answer + "</p>");  
  }
  }
}
function whoAmICreateQuestions(data){
  console.log(data);
  var targetFriend = selectRandomFriend(data);
  var questionCounter = 0;
  var questions = [];
  var targetFriendInfo = [];
  //getting mutual friends - apparently you can't get a mutual friends list unless the target friend approved this specific application
  /*var mutualFriendQuery = 'SELECT uid, first_name, last_name, pic_small FROM user WHERE uid IN (SELECT uid2 FROM friend WHERE uid1 = me()) AND uid IN (SELECT uid2 FROM friend WHERE uid1=' + targetFriend.uid + ')';
  FB.api('/fql', {q:mutualFriendQuery}, function(response){
    console.log(response);
  });*/
  console.log(targetFriend);
  for (key in targetFriend) {
    console.log(key);
    console.log(targetFriend[key]);
    
    //if the field is empty, skip it
    if (!targetFriend[key] || targetFriend[key].length === 0) {
      console.log("No information, skipping: " + key);
    }
    //otherwise, start populating the questions object.
    else {
      // This switch statement will compare every field in the targetFriend object and create the appropriate questions provided we have the data.
      switch (key) {
        case "activities":            
          var questionString = "q" + questionCounter;
          var answerString = "These are my favorite activities: " + targetFriend[key];
          var questionType = "activities";
          questions.push({ "questionNumber" : questionString, "answer" : answerString, "questionType" : questionType});
          break;
        case "birthday_date":            
          var questionString = "q" + questionCounter;
          var answerString = "This is my birthday: " + convertBirthdayDateToBirthday(targetFriend[key]);
          var questionType = "birthday";
          questions.push({ "questionNumber" : questionString, "answer" : answerString, "questionType" : questionType});
          break;
        case "books":            
          var questionString = "q" + questionCounter;
          var answerString = "These are my favorite books: " + targetFriend[key];
          var questionType = "books";
          questions.push({ "questionNumber" : questionString, "answer" : answerString, "questionType" : questionType});
          break;
        case "current_location":            
          var questionString = "q" + questionCounter;
          var answerString = "This is my current location: " + targetFriend[key].name;
          var questionType = "current_location";
          questions.push({ "questionNumber" : questionString, "answer" : answerString, "questionType" : questionType});
          break;
        case "hometown_location":            
          var questionString = "q" + questionCounter;
          var answerString = "This is my hometown location: " + targetFriend[key].name;
          var questionType = "hometown_location";
          questions.push({ "questionNumber" : questionString, "answer" : answerString, "questionType" : questionType});
          break; 
        case "education":      
          var educationArray = [];
          for (var i in targetFriend[key]) {
            if (targetFriend[key][i].type) {
              educationArray.push({ "name" : targetFriend[key][i].school.name , "type" : targetFriend[key][i].type});
            } else {
              educationArray.push({ "name" : targetFriend[key][i].school.name});
              } 
          }
          var questionString = "q" + questionCounter;
          var questionType = "education";
          questions.push({ "questionNumber" : questionString, "answer" : educationArray, "questionType" : questionType});
          break;
        case "interests":            
          var questionString = "q" + questionCounter;
          var answerString = "These are my interests: " + targetFriend[key];
          var questionType = "interests";
          questions.push({ "questionNumber" : questionString, "answer" : answerString, "questionType" : questionType});
          break;
        case "sex":            
          var questionString = "q" + questionCounter;
          var answerString = "This my identified gender: " + targetFriend[key];
          var questionType = "sex";
          questions.push({ "questionNumber" : questionString, "answer" : answerString, "questionType" : questionType});
          break;
        case "languages":      
          var languageArray = [];
          for (var i in targetFriend[key]) {
            languageArray.push(targetFriend[key][i].name);
          }
          var languagesSpokenString = languageArray.toString().replace(/\,/g, ' | ');
          var questionString = "q" + questionCounter;
          var answerString = "These are the languages I speak: " + languagesSpokenString;
          var questionType = "language";
          questions.push({ "questionNumber" : questionString, "answer" : answerString, "questionType" : questionType});
          break;
        case "movies":            
          var questionString = "q" + questionCounter;
          var answerString = "These are my favorite movies: " + targetFriend[key];
          var questionType = "movies";
          questions.push({ "questionNumber" : questionString, "answer" : answerString, "questionType" : questionType});
          break;
        case "music":            
          var questionString = "q" + questionCounter;
          var answerString = "This is my favorite music: " + targetFriend[key];
          var questionType = "music";
          questions.push({ "questionNumber" : questionString, "answer" : answerString, "questionType" : questionType});
          break;
        case "mutual_friend_count":            
          var questionString = "q" + questionCounter;
          var answerString = "This is how many mutual friends we have: " + targetFriend[key];
          var questionType = "mutual_friend_count";
          questions.push({ "questionNumber" : questionString, "answer" : answerString, "questionType" : questionType});
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
          var questionString = "q" + questionCounter;
          var answerString = "This is my political affiliation: " + targetFriend[key];
          var questionType = "political";
          questions.push({ "questionNumber" : questionString, "answer" : answerString, "questionType" : questionType});
          break;
        case "profile_url":            
          var answerString = targetFriend[key];
          var questionType = "profile_url";
          targetFriendInfo.push({ "answer" : answerString, "questionType" : questionType});
          break;        
        case "relationship_status":            
          var questionString = "q" + questionCounter;
          var answerString = "This is my relationship status: " + targetFriend[key];
          var questionType = "relationship_status";
          questions.push({ "questionNumber" : questionString, "answer" : answerString, "questionType" : questionType});
          break;
        case "religion":            
          var questionString = "q" + questionCounter;
          var answerString = "This is my religion: " + targetFriend[key];
          var questionType = "religion";
          questions.push({ "questionNumber" : questionString, "answer" : answerString, "questionType" : questionType});
          break;
        case "significant_other_id":            
          var query = 'SELECT name FROM user WHERE uid=' + targetFriend[key];
          FB.api('/fql',{q:query}, function(response){
            console.log("sig fig response");
            console.log(response);
            var questionString = "q" + questionCounter;
            var answerString = "This is my significant other: " + response.data[0].name;
            var questionType = "significant_other_id";
            questions.push({ "questionNumber" : questionString, "answer" : answerString, "questionType" : questionType});
          });
          break;
        case "sports":            
          var questionString = "q" + questionCounter;
          var answerString = "This are the sports I play: " + targetFriend[key];
          var questionType = "sports";
          questions.push({ "questionNumber" : questionString, "answer" : answerString, "questionType" : questionType});
          break;
        case "tv":            
          var questionString = "q" + questionCounter;
          var answerString = "This is my favorite TV shows: " + targetFriend[key];
          var questionType = "tv";
          questions.push({ "questionNumber" : questionString, "answer" : answerString, "questionType" : questionType});
          break;
        case "website":            
          var questionString = "q" + questionCounter;
          var answerString = "This is my website(s): " + targetFriend[key];
          var questionType = "website";
          questions.push({ "questionNumber" : questionString, "answer" : answerString, "questionType" : questionType});
          break;
        case "work":      
          var workArray = [];
          for (var i in targetFriend[key]) {
            if (targetFriend[key][i].position) {
            workArray.push({ "employer" : targetFriend[key][i].employer.name , "position" : targetFriend[key][i].position.name});
            } else {
              workArray.push({ "employer" : targetFriend[key][i].employer.name});
            };
          };
          var questionString = "q" + questionCounter;
          var questionType = "work";
          questions.push({ "questionNumber" : questionString, "answer" : workArray, "questionType" : questionType});
          break;
      };
      questionCounter += 1;
    };
  };

  //If the questions object has less than 4 bits of information, pick another friend
  if (questions.length < 5) {
    whoAmIGameStart();
  } else {      
    return [questions, targetFriendInfo];
    }
  
}

function whoAmIGenerateRandomFields(fields, randomFields){
  var nullFilterString;
  var nullFilter = [];
  //how many additional fields to pull from the facebook tables
  var fieldsMax = 8;
  fields.sort( function() {return 0.5 - Math.random() });
  randomFields = fields.slice(0,fieldsMax).toString().replace(/\,/g, ', ');

  console.log("These are the randomly selected fields that we'll be requesting from the user table data. uid, name, pic_square, work, and education are all pulled by default.")
  console.log(randomFields);
  
/*  
//the nullFilterString builds a string of fields to that filters out friends that have NULL in the specified fields. (probably don't need it cause we can just default to filtering out Education and Work empty field. There's a better chance that friends who share their work and education information will have other fields filled out too. This way we can grab a random friend from a larger pool too)
//some fields like 'significant_other_id' don't neccesarily have to have information filled in it. If the user doesn't have a sig other, that could be useful info too. 
  //These switches will remove the pertinent fields from the notNullFilter string so a user could still be selected, even though he doesn't have a sigO listed.
  for (var j=0; j<fieldsMax; j++) {
    if (j == fieldsMax-1) {
      switch (fields[j]) {
        case "significant_other_id":          
          break;
        case "activities":
          break;
        case "interests":
          break;
        case "languages":
          break;
        case "website":
          break;
        case "sports":
          break;
        default:
          nullFilter.push(fields[j]);
      };  
    } else {
        switch (fields[j]) {
          case "significant_other_id":            
            break;
          case "activities":            
            break;
          case "interests":
            break;
          case "languages":
            break;
          case "website":
            break;
          case "sports":
            break;          
          default:
            nullFilter.push(fields[j]);
        };  
      }
  };
  
  console.log("The following fields MUST have information listed or the friend will not be pulled back.");
  console.log(nullFilter);
  
  //turning nullFilter array into a FQL query compatible string
  nullFilterString = nullFilter.toString().replace(/\,/g, ' AND ');
  console.log(nullFilterString);  
  */

  //FQL query string to get ids and names of all friends with the data we need. The 'AND birthday' is to filter out people who didn't provide their birthday information to apps
  var getAllFriends = 'SELECT uid2 FROM friend WHERE uid1=me()';
  //this FQL query string will give you an object of your friends with the fields specified in the SELECT area. The AND modifier makes the query only pull back results that have information listed in the specified fields.
  var getEligibleFriends = 'SELECT uid, name, pic, profile_url, work, education, current_location, sex, ' + randomFields + ' FROM user WHERE uid IN (SELECT uid2 FROM #query1) AND work AND education AND significant_other_id';
  
  // var getEligibleFriends = 'SELECT uid, name, pic_square, ' + randomFields + ' FROM user WHERE uid IN (SELECT uid2 FROM #query1) AND ' + nullFilterString;
  
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
  data = generateRandomFields(FIELDS, randomFields);  
  var getAllFriends = data[0];
  var getEligibleFriends = data[1];

  //FQL query
  FB.api('/fql',{q:{'query1':getAllFriends,'query2':getEligibleFriends}}, function(response){
    console.log(response.data[1].fql_result_set.length);
    data = response.data[1];
    //if the friends array is empty, get another 5 random fields
    if (response.data[1].fql_result_set.length == 0) {
      $("#loadingStatus").html("<p>Still reticulating splines, just sit tight.</p>");
      stalkerGameStart();
    } else {
      createQuestions(response.data[1]);
    }
  });
}

function createQuestions(data){
  console.log(data);
  var targetFriend = selectRandomFriend(data);
  console.log(targetFriend);
}

function selectRandomFriend(data) {
  //generate a random number from 1 to the length of the friends array you pulled back
  var randomNumberFromFriendArray = getRandomInt(0, data.fql_result_set.length);
  //randomFriend will be an object with all the called for fields in it
  var randomFriend = data.fql_result_set[randomNumberFromFriendArray];
  return randomFriend;


}
//this function randomly sorts the FIELDS array and it selects the first 5 elements to act as the 5 questions for the game
function generateRandomFields(fields, randomFields){
  var nullFilterString;
  var nullFilter = [];
  fields.sort( function() {return 0.5 - Math.random() });
  randomFields = fields[0] + ", " + fields[1] + ", " + fields[2] + ", " + fields[3] + ", " + fields[4];
  console.log(randomFields);
  
  //some fields like 'significant_other_id' don't neccesarily have to have information filled in it. If the user doesn't have a sig other, that could be useful info too. 
  //These switches will remove the pertinent fields from the notNullFilter string so a user could still be selected, even though he doesn't have a sigO listed.
  switch (fields[0]) {
    case "significant_other_id":
      nullFilter[0] = "";
      break;
    default:
      nullFilter[0] = fields[0] + " AND ";
  };

  switch (fields[1]) {
    case "significant_other_id":
      nullFilter[1] = "";
      break;
    default:
      nullFilter[1] = fields[1] + " AND ";
  };
  
  switch (fields[2]) {
    case "significant_other_id":
      nullFilter[2] = "";
      break;
    default:
      nullFilter[2] = fields[2] + " AND ";
  };
  
  switch (fields[3]) {
    case "significant_other_id":
      nullFilter[3] = "";
      break;
    default:
      nullFilter[3] = fields[3] + " AND ";
  };
  
  switch (fields[4]) {
    case "significant_other_id":
      nullFilter[4] = "";
      break;
    default:
      nullFilter[4] = fields[4];
  };
  
  nullFilterString = nullFilter[0] + nullFilter[1] + nullFilter[2] + nullFilter[3] + nullFilter[4];

  //FQL query string to get ids and names of all friends with the data we need. The 'AND birthday' is to filter out people who didn't provide their birthday information to apps
  var getAllFriends = 'SELECT uid2 FROM friend WHERE uid1=me()';
  //this FQL query string will give you an object of friends who have valid information in the 5 random fields
  var getEligibleFriends = 'SELECT uid, name, pic_square, ' + randomFields + ' FROM user WHERE uid IN (SELECT uid2 FROM #query1) AND ' + nullFilterString;
  
  console.log(getAllFriends);
  console.log(getEligibleFriends);
  return [getAllFriends, getEligibleFriends];
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
  console.log(t);
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