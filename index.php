<?php?>
<html>
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="description" content="description">
  <meta name="keywords" content="keywords">
  <link rel="stylesheet" type="text/css" href="http://yui.yahooapis.com/3.13.0/build/cssreset/cssreset-min.css">
  <link rel="stylesheet" type="text/css" href="_css/style.css" />
  <script type="text/javascript" src="_js/jquery-1.10.2.min.js"></script>
  <title></title>
</head>

<body>
  <div id="header"></div>

  <div id="main">
    <?php if (!loggedIn) {
      ?>
    <div id="notLoggedIn">
      <p>Login with your Facebook account.</p>
      <p>Be a professional stalker like Jenton.</p>
      <div id="facebookbutton">
      </div>
    </div>
    <?
    } else {
     ?>
    <div id="loggedIn">
      <p>Ready to stalk?</p>
      <input type="submit" value="Go">
      <div id="leaderBoard">
        <div class="leaderboardItem">
          your score on friends
          scores on your profile
          friends score A -> B
          all time score
        </div>
        ?>
      </div>
    </div>
    <?php 
      }
    ?>
  </div>

  <div id="footer"></div>
</body>

</html>