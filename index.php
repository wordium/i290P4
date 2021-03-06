<?php?>
<html>
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="description" content="description">
  <meta name="keywords" content="keywords">
  <link rel="stylesheet" type="text/css" href="http://yui.yahooapis.com/3.13.0/build/cssreset/cssreset-min.css">
  <link rel="stylesheet" type="text/css" href="_css/style.css" />
  <script type="text/javascript" src="_js/jquery-1.10.2.min.js"></script>
  <script type="text/javascript" src="_js/script.js"></script>
  <title>Stalkerbook: A Facebook Quiz Game</title>
</head>

<body>
  <div id="header">
    <!--h1>Stalkerbook</h1-->
    <img src="_img/stalkerbook.png" alt="STALKERBOOK">
  </div>

  <div id="main" class="content">
    <!-- added these two divs in as per a demo I read: http://hayageek.com/facebook-javascript-sdk/ -->
    <div id="fb-root"></div>
    <div id="status">
      <p>Welcome<span id="playerName"></span>!</p>
      <div id="loginPrompt">
        <p>Log in with Facebook to play!</p>
        <p>Stalkerbook grabs your contacts and shows you three clues about them.</p>
        <p>Can you guess who the person is within three tries?</p>
      </div>
      <div id="playPrompt" class="hidden">
        <p>How well do you know your friends?</p>
        <p>Can you guess who the person is within three tries?</p>
      </div>
    </div>
    <div id="loginBtnDiv">
      <input id="login" type="button" value="Login to Facebook">
      <div id="goBtnDiv" class="hidden">
	    <input id="go" type="button" value="Play">
	    <img src="_img/loader.gif" id="loader" class="hidden">
      </div>
    </div>
    <div id="loadingStatus"></div>
    <?php if (!loggedIn) {
      ?>
      <div id="notLoggedIn">
        <p>Login with your Facebook account.</p>
        <p>Be a professional stalker like Jentard.</p>
        <div id="facebookbutton"></div>
      </div>
    <?
    } else {
     ?>
      <div id="loggedIn">
        <div id="score_board" class="clearfix"></div>

        <div id="gameplay" class="hidden">
          <div id="score"></div>
          <div id="timeBonus"></div>
          <div id="lives">
            <p>Number of guesses left:</p>
            <img src="_img/heart.png" id="life3" class="life">
            <img src="_img/heart.png" id="life2" class="life">
            <img src="_img/heart.png" id="life1" class="life">
          </div>
          <!--div id="guessNotification">
            <h3>GUESS AGAIN!</h3>
          </div-->
          <div id="gameResponse"></div>
        </div>

        <div id="overlay" class="hidden"></div>
        <div id="progressbar"></div>
        <div id="questions"></div>

        <div id="error"><p>You are incorrect. Please keep guessing.</p></div>

      </div>

      <div id="friends" class="hidden">
        <div id="friend1" data-name="" class="friend"><div class="photo"><div class="photooverlay"><img src="" alt=""><span></span></div></div><div class="name"></div></div>
        <div id="friend2" data-name="" class="friend"><div class="photo"><div class="photooverlay"><img src="" alt=""><span></span></div></div><div class="name"></div></div>
        <div id="friend3" data-name="" class="friend"><div class="photo"><div class="photooverlay"><img src="" alt=""><span></span></div></div><div class="name"></div></div>
        <div id="friend4" data-name="" class="friend"><div class="photo"><div class="photooverlay"><img src="" alt=""><span></span></div></div><div class="name"></div></div>
        <div id="friend5" data-name="" class="friend"><div class="photo"><div class="photooverlay"><img src="" alt=""><span></span></div></div><div class="name"></div></div>
        <div id="friend6" data-name="" class="friend"><div class="photo"><div class="photooverlay"><img src="" alt=""><span></span></div></div><div class="name"></div></div>
        <div id="friend7" data-name="" class="friend"><div class="photo"><div class="photooverlay"><img src="" alt=""><span></span></div></div><div class="name"></div></div>
        <div id="friend8" data-name="" class="friend"><div class="photo"><div class="photooverlay"><img src="" alt=""><span></span></div></div><div class="name"></div></div>
        <div id="friend9" data-name="" class="friend"><div class="photo"><div class="photooverlay"><img src="" alt=""><span></span></div></div><div class="name"></div></div>
        <div id="friend10" data-name="" class="friend"><div class="photo"><div class="photooverlay"><img src="" alt=""><span></span></div></div><div class="name"></div></div>
        <div id="friend11" data-name="" class="friend"><div class="photo"><div class="photooverlay"><img src="" alt=""><span></span></div></div><div class="name"></div></div>
        <div id="friend12" data-name="" class="friend"><div class="photo"><div class="photooverlay"><img src="" alt=""><span></span></div></div><div class="name"></div></div>
        <div id="friend13" data-name="" class="friend"><div class="photo"><div class="photooverlay"><img src="" alt=""><span></span></div></div><div class="name"></div></div>
        <div id="friend14" data-name="" class="friend"><div class="photo"><div class="photooverlay"><img src="" alt=""><span></span></div></div><div class="name"></div></div>
        <div id="friend15" data-name="" class="friend"><div class="photo"><div class="photooverlay"><img src="" alt=""><span></span></div></div><div class="name"></div></div>
        <div id="friend16" data-name="" class="friend"><div class="photo"><div class="photooverlay"><img src="" alt=""><span></span></div></div><div class="name"></div></div>
        <div id="friend17" data-name="" class="friend"><div class="photo"><div class="photooverlay"><img src="" alt=""><span></span></div></div><div class="name"></div></div>
        <div id="friend18" data-name="" class="friend"><div class="photo"><div class="photooverlay"><img src="" alt=""><span></span></div></div><div class="name"></div></div>
        <div id="friend19" data-name="" class="friend"><div class="photo"><div class="photooverlay"><img src="" alt=""><span></span></div></div><div class="name"></div></div>
        <div id="friend20" data-name="" class="friend"><div class="photo"><div class="photooverlay"><img src="" alt=""><span></span></div></div><div class="name"></div></div>
        <div id="friend21" data-name="" class="friend"><div class="photo"><div class="photooverlay"><img src="" alt=""><span></span></div></div><div class="name"></div></div>
      </div>

      <?php 
        }
      ?>    

      <!-- user profile link goes here -->
      <div id="target"></div>
      <div id="share" class="hidden"><input type='button' value='Share on Facebook'></div>
    </div>

    <!-- leaderboards go here. both pre and post game ones? -->

    <div id="targetTableSection" class="content">
      <h3 class="leaderboardTitle">High Scores</h3>
      <table class="leaderboardTable" id="targetTable">
        <tr class="leaderboardHeader"><th></th><th>Guesser</th><th>Target</th><th>Score</th></tr>
      </table>
    </div>

    <div id="leaderboards" class="clearfix content">

      <div id="allTimeSection">
        <h3 class="leaderboardTitle">All Time High Scores</h3>
        <table class="leaderboardTable" id="allTimeTable">
          <tr class="leaderboardHeader"><th></th><th>Stalker</th><th>Target</th><th>Score</th></tr>
        </table>
      </div>

      <div id="playerTableSection">
        <h3 class="leaderboardTitle">Your High Scores</h3>
        <table class="leaderboardTable" id="playerTable">
          <tr class="leaderboardHeader"><th></th><th>Guesser</th><th>Target</th><th>Score</th></tr>
        </table>
      </div>

    </div>

  </div>

  <div id="footer">
    <p>
      THIS WAS MADE BY US. WE DID THIS. 
    </p>
    <p>
      <a href="http://www.dantsai.com/">DANTOS</a>, 
      <a href="http://www.jooddang.com/">FUNKWANG</a>, 
      <a href="http://www.jentonlee.com">JENTRON</a>, 
      <a href="http://www.wordium.com">SANDRAWR</a>
    </p>
  </div>
</body>

</html>