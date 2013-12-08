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
  <script type="text/javascript" src="_js/dbtest.js"></script>

  <title></title>
</head>

<body>
  <div id="header">
    <h1>Who Am I?</h1>
  </div>

  <div id="main">
    <!-- added these two divs in as per a demo I read: http://hayageek.com/facebook-javascript-sdk/ -->
    <div id="fb-root"></div>
    <div id="status"></div>
    <div id="loginBtnDiv"><input id="login" type="button" value="Login to Facebook"></div>
    <div id="loadingStatus"></div>
    <?php if (!loggedIn) {
      ?>
      <div id="notLoggedIn">
        <p>Login with your Facebook account.</p>
        <p>Be a professional stalker like Jenton.</p>
        <div id="facebookbutton"></div>
      </div>
    <?
    } else {
     ?>
    <div id="loggedIn">
      <div id="goBtnDiv">
        <input id="go" type="button" value="Play">
      </div>
      <div id="score_board" class="clearfix"></div>
      <div id="leaderBoard">
        <div class="leaderboardItem">
        </div>
      </div>

      <div id="gameplay" class="hidden">
        <div id="score"></div>
        <div id="timeBonus"></div>
        <div id="lives">
          <img src="_img/heart.png" id="life1">
          <img src="_img/heart.png" id="life2">
          <img src="_img/heart.png" id="life3">
        </div>
        <div id="gameResponse"></div>
        <div id="share" class="hidden"><input type='button' value='Share to Facebook'></div>
      </div>

      <div id="questions"></div>
      </div>

      <div id="friends" class="hidden">
        <!-- example 
          <div id="friend1" data-name="Jenton Lee"><img src="" class="photo" alt=""></div>

        -->
        <div id="friend1" data-name="" class="friend"><img src="" class="photo" alt=""><div class="name"></div></div>
        <div id="friend2" data-name="" class="friend"><img src="" class="photo" alt=""><div class="name"></div></div>
        <div id="friend3" data-name="" class="friend"><img src="" class="photo" alt=""><div class="name"></div></div>
        <div id="friend4" data-name="" class="friend"><img src="" class="photo" alt=""><div class="name"></div></div>
        <div id="friend5" data-name="" class="friend"><img src="" class="photo" alt=""><div class="name"></div></div>
        <div id="friend6" data-name="" class="friend"><img src="" class="photo" alt=""><div class="name"></div></div>
        <div id="friend7" data-name="" class="friend">
          <img src="" class="photo" alt="">
          <div class="name"></div></div>
        <div id="friend8" data-name="" class="friend">
          <img src="" class="photo" alt="">
          <div class="name"></div></div>
        <div id="friend9" data-name="" class="friend">
          <img src="" class="photo" alt="">
          <div class="name"></div></div>
        <div id="friend10" data-name="" class="friend">
          <img src="" class="photo" alt="">
          <div class="name"></div></div>
        <div id="friend11" data-name="" class="friend">
          <img src="" class="photo" alt="">
          <div class="name"></div></div>
        <div id="friend12" data-name="" class="friend">
          <img src="" class="photo" alt="">
          <div class="name"></div></div>
        <div id="friend13" data-name="" class="friend">
          <img src="" class="photo" alt="">
          <div class="name"></div></div>
        <div id="friend14" data-name="" class="friend">
          <img src="" class="photo" alt="">
          <div class="name"></div></div>
        <div id="friend15" data-name="" class="friend">
          <img src="" class="photo" alt="">
          <div class="name"></div></div>
        <div id="friend16" data-name="" class="friend">
          <img src="" class="photo" alt="">
          <div class="name"></div></div>
        <div id="friend17" data-name="" class="friend">
          <img src="" class="photo" alt="">
          <div class="name"></div></div>
        <div id="friend18" data-name="" class="friend">
          <img src="" class="photo" alt="">
          <div class="name"></div></div>
        <div id="friend19" data-name="" class="friend">
          <img src="" class="photo" alt="">
          <div class="name"></div></div>
        <div id="friend20" data-name="" class="friend">
          <img src="" class="photo" alt="">
          <div class="name"></div></div>
        <div id="friend21" data-name="" class="friend">
          <img src="" class="photo" alt="">
          <div class="name"></div></div>          
      </div>

    </div>
    <?php 
      }
    ?>

    <!-- user profile link goes here -->
    <div id="target">
    </div>

    <!-- leaderboards go here. both pre and post game ones? -->
    <div id="leaderboards">
    </div>

  </div>

  <div id="footer"></div>
</body>

</html>