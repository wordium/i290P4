<?php
 // connects to my ischool mysql database. username: jenton, password: qwerty, database: jenton
  $con = mysqli_connect("localhost", "jenton", "qwerty", "jenton");
 
 // Failure check
if (mysqli_connect_errno($con))
  {
  echo "Failed to connect to MySQL: " . mysqli_connect_error();
  }

//grabbing data from the POST
$targetFriend = $_POST["targetFriend"];
//$tempData = str_replace("\\", "",$targetFriend);
//$cleanData = json_decode($tempData, true);

//store the reviewIDs from the page. Looks like a string "1,2,3,4,5", so need to split it into a PHP array.
//$idArray = $_POST["reviewIDs"];
//$idArray = explode(",", $idArray);
 
 
 //this code runs only when action == food from the ajax data call
if ($_POST["action"] == "post") {
  var_dump($targetFriend);
  //echo $cleanData["name"];
  //insert the reviewID and corresponding tag count into the yelp table
   //if the key is a duplicate, then it increments the appropriate reviewID tag by 1
  //$query=mysqli_query($con,"INSERT INTO yelp VALUES ('$bizID', '$reviewID', 1, 0, 0, 0) 
  //  ON DUPLICATE KEY UPDATE food=food + 1");
  //updates the page with the new tag counts
  //updateTagCounts($idArray, $con);
}



?>