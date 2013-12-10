var questions = [];
var APP_TOKEN = "CAACev9gswDsBAA0xAa2KTcluFFw6wuUSZARKEYJ14CVLiPGULnDi3zNjqZCMJS4ah8JGPjT3mld2m7mHeuaryk5ZATRSOT2icFkPRJS0GWbJyAIRxhTAxuP0goaQElC8wezR5cP3nEdQIuiabLTiewZBkmcOCc8kYLx9rpeBf2qSG2TE38ZCEDQ6K1QfYljvOr8xQZC7tkiAZDZD";
var randomFriendID;
var combo = 0;
var multiplier = 1;

//uid, name, pic_square, work, education are pulled by default
var FIELDS_WHOAMI = ["activities", "birthday","birthday_date","books", "hometown_location", "interests", "languages", "movies", "music", "mutual_friend_count", "political", "relationship_status", "religion", "sports", "tv"];

var targetAnswer;
var playerInfo = [];
var scoring = {};

$(document).ready(function()
{
  // on page load, show the all time individual high score leaderboard
  addLeaderboard('topscores');
  $('#playerTableSection').addClass('hidden');
  $('#targetTableSection').addClass('hidden');

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
      $('#target').html('');
      $('#share').addClass('hidden');
      $('#gameResponse').html("");

      // hide target leaderboard until another game has finished
      $('#targetTableSection').addClass('hidden');

      //disables the 'Go' button until the game is ready to play
      $(this).prop("disabled",true);
      whoAmIGameStart();
    });

    // share to facebook
    $('#share').on('click', function(e) {
      FB.ui({
          method: 'feed',
          link: 'http://people.ischool.berkeley.edu/~jenton/i290P4/',
          caption: 'Play the Facebook Friend Guessing Game!',
          message: "HOOWHA",
          description: "How well do you know your friends? Play our Facebook Friend Guessing game and find out!",
          //picture: "something.jpg"
          }, function(response){});
    });

    $('.friend').on('click', function(e) {
      var friend = $(this).attr('data-name');
      var uidGuess = $(this).attr('data-uid');

      console.log('Your guess is: ' + friend + '.');
      if (uidGuess == targetAnswer[0].uid){
        combo++;

        $("#target").html("<p>You've guessed <a href=\"" + targetAnswer[4].profile_url + '">' + targetAnswer[1].name + "</a> correctly!</p");
        showTarget();

        //Once the correct friend is clicked, a database call is made to record the guesser's ID, the guesser's username, the target ID, the target username, and the score

        // get a score multiplier of +5% every correct answer you score in a row after the first one
        if(combo > 1) {
          multiplier += 0.05;
        }

        if (scoring['trial'] == 0) {
          updateScore(500, scoring['score']);
          scoring['score'] += 500;
        } else if (scoring['trial'] == 1) {
          updateScore(300, scoring['score']);
          scoring['score'] += 300;
        } else if (scoring['trial'] == 2) {
          updateScore(100, scoring['score']);
          scoring['score'] += 100;
        }
        scoring['score'] = Math.round(scoring['score'] * multiplier);

        abortTimer();
        postNewScore(playerInfo[0].uid, playerInfo[0].name, targetAnswer[0].uid, targetAnswer[1].name);
      } 
      else if (!$(this).hasClass('wrong')){
        // when user got wrong, subtract points.
        if (scoring['trial'] == 0) {
          // first try
          scoring['trial'] += 1;

          $("#target").html("<p>You are incorrect. Please keep guessing.</p>");
          $(this).addClass('wrong');
          $('#life' + scoring['trial']).addClass('wrong');

          // append another hint
          whoAmIAddHint();
        } else if (scoring['trial'] == 1) {
          // second try
          scoring['trial'] += 1;

          $("#target").append("<p>You are incorrect. Please keep guessing.</p>");
          $(this).addClass('wrong');
          $('#life' + scoring['trial']).addClass('wrong');
          // append another hint
          whoAmIAddHint();
        } else {
          // game over. YOU LOST!!
          combo = 0;
          var combobreaker = false;
          if(multiplier > 1) {
            combobreaker = true;
          }
          multiplier = 1;

          scoring['trial'] += 1;
          scoring['score'] = 0;
          $('#life' + scoring['trial']).addClass('wrong');

          if(combobreaker) {
            updateScore(0, 0, true);
          } else {
            updateScore(0, 0);
          }
          abortTimer();
          $("#target").html("<p>You failed to find the person!</p><p>Looks like you don't know <a href=\"" + targetAnswer[4].profile_url + '">' + targetAnswer[1].name + '</a> as well as you thought. Maybe you should unfriend them?</p>');
          showTarget();
          postNewScore(playerInfo[0].uid, playerInfo[0].name, targetAnswer[0].uid, targetAnswer[1].name);
        }
      } else {
        // guessing an incorrect guess that they already guessed before
        console.log("double guessed");
      }
      console.log(targetAnswer);
    });

});

// Shows the target and share button; call when the game has ended.
function showTarget() {
  $("#questions").html("");
  $('#gameplay').addClass('hidden');
  $('#friends').addClass('hidden'); // hiding the friendGrid again.
  $('#target').append('<a target="_blank" href="' + targetAnswer[4].profile_url + '"><img src="' + targetAnswer[2].pic + '" class="photo"></a>');
  $('#share').removeClass('hidden');
}

function postNewScore(guesserid, guesserusername, targetid, targetusername) {
  if (scoring['score'] < 0) {
    scoring['score'] = 0;
  }
  $.post('db.php', {
    action: 'newscore',
    guesserid: guesserid,
    guesserusername: guesserusername,
    targetid: targetid,
    targetusername: targetusername,
    score: scoring['score']
  }, function(data) {
    console.log(data);

    // add target leaderboard
    addLeaderboard('targetscores');

    // reload myscores
    clearLeaderboards('myscores');
    clearLeaderboards('topscores');
    setTimeout("addLeaderboard('myscores')", 200);
    setTimeout("addLeaderboard('topscores')", 200);
  });
}

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
},{scope: 'email,user_photos,friends_about_me,friends_activities,friends_birthday,friends_education_history,friends_groups,friends_hometown,friends_interests,friends_likes,friends_location,friends_photos,friends_relationship_details,friends_relationships,friends_religion_politics,friends_website,friends_work_history,user_work_history'});

//old scope - scope: 'email,user_photos,user_videos,friends_about_me,friends_activities,friends_birthday,friends_checkins,friends_education_history,friends_events,friends_games_activity,friends_groups,friends_hometown,friends_interests,friends_likes,friends_location,friends_notes,friends_online_presence,friends_photo_video_tags,friends_photos,friends_questions,friends_relationship_details,friends_relationships,friends_religion_politics,friends_status,friends_subscriptions,friends_videos,friends_website,friends_work_history, user_work_history'
}

function getUserInfo() {
  FB.api('/me', function(response) {
    // var str="Facebook login successful!<br> Welcome <b>"+response.name+"</b><br>";
    //var str="<p>Welcome "+response.name+"!";
    playerInfo.push({uid: response.id, name: response.name, link: response.link});

    // now that we're logged in, add My High Scores
    addLeaderboard('myscores');

    // $("#status").html(str);
    $('#playerName').text(", " + response.name);
    $('#loginPrompt').addClass('hidden');
    $("#loginBtnDiv").prepend("<input type='button' value='Logout' onclick='Logout();'/>");
    $('#playPrompt').removeClass('hidden');
    $('#goBtnDiv').removeClass('hidden');
    //$("#status").html(str);
    /*
>>>>>>> 5dc2ceeb8cd1c2a73036115bd77cc9eee3c734a3
    FB.api('/me/picture?type=normal', function(response) {
      var picture="<img src='"+response.data.url+"'/>";
      // $("#status").append(picture);
      $("#status").append("How well do you know your friends?</p>");
    }); 
    */
  });
}

/* leaderboards */
// TODO : what if the list of scores is empty?
function addLeaderboard(type) {
  switch(type) {
    case 'topscores':
      $.get('db.php', {action: 'topscores'}, function(data) {
        var values = JSON.parse(data);
        var resultshtml = '';
        var leaderboard = $('#allTimeTable').find('tbody');
        for(var i = 0 ; i < values.length ; ++i) {
          var v = values[i];
          leaderboard.append('<tr class="leaderboardRow"><td>' + (i+1) + '<td class="leaderboardGuesser">' + v.guesserusername + '</td>'
            + '<td class="leaderboardTarget">' + v.targetusername + '</td>'
            + '<td class="leaderboardScore">' + v.score + '</td></tr>');
        }
        if(values.length == 0) {
          leaderboard.append('<tr class="leaderboardRow"><td><td class="leaderboardGuesser">(none)</td><td class="leaderboardTarget"></td><td class="leaderboardScore"></td></tr>');          
        }
        $('#allTimeSection').removeClass('hidden');
      });
      break;

    case 'myscores':
      $.get('db.php', {action: 'myscores', guesserid: playerInfo[0].uid}, function(data) {
        var values = JSON.parse(data);
        var resultshtml = '';
        var leaderboard = $('#playerTable').find('tbody');
        for(var i = 0 ; i < values.length ; ++i) {
          var v = values[i];
          leaderboard.append('<tr class="leaderboardRow"><td>' + (i+1) + '<td class="leaderboardGuesser">' + v.guesserusername + '</td>'
            + '<td class="leaderboardTarget">' + v.targetusername + '</td>'
            + '<td class="leaderboardScore">' + v.score + '</td></tr>');
        }
        if(values.length == 0) {
          leaderboard.append('<tr class="leaderboardRow"><td><td class="leaderboardGuesser">(none)</td><td class="leaderboardTarget"></td><td class="leaderboardScore"></td></tr>');          
        }

        $('#playerTableSection').removeClass('hidden');
      });
      break;

    case 'targetscores':
      $.get('db.php', {action: 'targetscores', targetid: targetAnswer[0].uid}, function(data) {
        var values = JSON.parse(data);
        var resultshtml = '';
        var leaderboard = $('#targetTable').find('tbody');
        leaderboard.find('.leaderboardRow').remove();
        for(var i = 0 ; i < values.length ; ++i) {
          var v = values[i];
          leaderboard.append('<tr class="leaderboardRow"><td>' + (i+1) + '<td class="leaderboardGuesser">' + v.guesserusername + '</td>'
            + '<td class="leaderboardTarget">' + v.targetusername + '</td>'
            + '<td class="leaderboardScore">' + v.score + '</td></tr>');
        }
        if(values.length == 0) {
          leaderboard.append('<tr class="leaderboardRow"><td><td class="leaderboardGuesser">(none)</td><td class="leaderboardTarget"></td><td class="leaderboardScore"></td></tr>');          
        }

        $('#targetTableSection').removeClass('hidden');
      });
      break;
  }
}

function clearLeaderboards(type) {
  switch(type) {
    case 'topscores':
      $('#allTimeSection .leaderboardRow').fadeOut(200, function() {
        $(this).remove();
      });
      break;

    case 'myscores':
      $('#playerTableSection .leaderboardRow').fadeOut(200, function() {
        $(this).remove();
      });
      break;

    case 'targetscores':
      $('#targetTableSection .leaderboardRow').fadeOut(200, function() {
        $(this).remove();
      });
      break;
  }
}

function nameToInitials(name) {
  return name.replace(/[^A-Z]/g, '');
}


function timerCode() {
  if (scoring['score'] > 0) {
    scoring['score'] -= 5;
  } else {
    scoring['score'] = 0;
  }
  updateScore();
}

function updateScore(guess_score, bonus_score, combobreaker) {
  $('#score_board').empty();
  if (guess_score !== undefined) {
    if (guess_score !== 0) {
      $('#score_board').append('<p>Score: ' + guess_score + '. Time Bonus: ' + bonus_score + '. Combo Multiplier: ' + multiplier.toFixed(2) + 'x</p>');
    }
    if(combobreaker) {
      $('#score_board').append('<p>C-C-C-COMBO BREAKER! Multiplier reset to 1x!</p>');
    }
    $('#score_board').append('<p>Your total score is ' + Math.round((guess_score + bonus_score)*multiplier) + '</p>');
  } else {
    $('#score_board').append('<p>Your current time bonus is ' + scoring['score'] + '</p>');
  }
}

function abortTimer() {
  clearInterval(scoring['timer']);
}

function whoAmIGameStart(){
  var data;
  $("#loader").removeClass("hidden");

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

      //this is the query to get 21 random fb profile pictures
      var getFriendsGridQuery = "SELECT uid, name, pic_square, pic, profile_url FROM user WHERE uid IN (SELECT uid2 FROM friend WHERE uid1=me()) ORDER BY rand() limit 21";
      FB.api('/fql',{q:getFriendsGridQuery}, function(response){
        friendsGrid = response.data;
        
        //this checks to make sure the target uid has not been randomly selected
        for (key in friendsGrid){
          if (friendsGrid[key].uid == friendTargetInfo[0].uid) {
            friendsGrid.splice(key, 1);
          }
        }
        //making sure we have 20 friends in the friend grid before we push the target user into it
        if (friendsGrid.length == 21) {
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


        $('#friends').removeClass('hidden');
        $('#gameplay').removeClass('hidden');
        whoAmIPrintToHtml();

        targetAnswer = friendTargetInfo;
        $("#go").prop("disabled", false);
        $("#go").prop('value', 'Try Again!');
        $("#loader").addClass("hidden");

        // when game starts, timer for scoring starts as well.
        abortTimer();
        scoring['score'] = 500;
        scoring['trial'] = 0;
        scoring['timer'] = setInterval(timerCode, 500);

        // reset the height  
        var ulHeight = $('#questions ul').height();
        $('#questions').height(ulHeight);

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
              var answerString = "I have previously attended (or currently attend): " + educationArray[i].school.name;
              // answerString +=  " " + educationArray[i].type;
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
  if (questions.length < 5) {
    whoAmIGameStart();
  } else {      
    return [questions, targetFriendInfo];
    }
  
}

//this function prints the hints to the HTML
function whoAmIPrintToHtml(){
  $("#questions").html("<ul></ul>");
  //randomize the questions array
  questions.sort( function() {return 0.5 - Math.random() });


  // print out first three questions, then remove them from the array.
  for(var i = 0 ; i < 3 ; ++i) {
	  var currentQuestion = questions.pop();
      $("#questions ul").append("<li id='" + currentQuestion.questionNumber + "'>" + currentQuestion.answer + "</li>");
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
  // $("#questions ul").append("<li id='" + currentQuestion.questionNumber + "'>" + currentQuestion.answer + "</li>");


  var event_height = $('#questions').height() + $('#questions ul li').height();
  $('#questions').animate({
          left: '+=50'
          ,height: event_height
        }
        , 250
        , function() {
          $("#questions ul").append("<li id='" + currentQuestion.questionNumber + "'>" + currentQuestion.answer + "</li>");
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