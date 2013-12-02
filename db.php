<?php
 // connects to my ischool mysql database. username: jenton, password: qwerty, database: jenton
 $con = mysqli_connect("localhost", "dantos_ischool", "o2lb_awsIS", "dantos_dantsai");
 
 // Failure check
if (mysqli_connect_errno($con))
{
  echo "Failed to connect to MySQL: " . mysqli_connect_error();
}

//grabbing data from the POST
$bizID = $_POST["bizID"];
//store the reviewIDs from the page. Looks like a string "1,2,3,4,5", so need to split it into a PHP array.
$idArray = $_POST["reviewIDs"];
$idArray = explode(",", $idArray);
 
$result = mysqli_query($con,"SELECT * FROM yelp");
while($row = mysqli_fetch_array($result)) {
  echo $row[0] . ' ' . $row[1] . ' ' . $row[2] . ' ' . $row[3] . ' ' . $row[4] . '<br>';
} 

 //this code runs only when action == food from the ajax data call
if ($_POST["action"] == "food") {
   //the "reviewID" comes from data: in the ajax call
   $reviewID = $_POST["reviewID"];
  
  //insert the reviewID and corresponding tag count into the yelp table
   //if the key is a duplicate, then it increments the appropriate reviewID tag by 1
  $query=mysqli_query($con,"INSERT INTO yelp VALUES ('$bizID', '$reviewID', 1, 0, 0, 0) 
    ON DUPLICATE KEY UPDATE food=food + 1");
  //updates the page with the new tag counts
  updateTagCounts($idArray, $con);
}

//this code runs only when the service button is clicked. It increments service by one for the reviewID
if ($_POST["action"] == "service") {
  //the "reviewID" comes from data: in the ajax call
  $reviewID = $_POST["reviewID"];

  //insert the reviewID and corresponding tag count into the yelp table
  //if the key is a duplicate, then it increments the appropriate reviewID tag by 1
  $query=mysqli_query($con,"INSERT INTO yelp VALUES ('$bizID', '$reviewID', 0, 1, 0, 0) 
    ON DUPLICATE KEY UPDATE service=service + 1");
  //updates the page with the new tag counts
  updateTagCounts($idArray, $con);
}

//this code runs only when the atmosphere button is clicked. It increments atmosphere by one for the reviewID
if ($_POST["action"] == "atmosphere") {
  //the "reviewID" comes from data: in the ajax call
  $reviewID = $_POST["reviewID"];

  //insert the reviewID and corresponding tag count into the yelp table
  //if the key is a duplicate, then it increments the appropriate reviewID tag by 1
  $query=mysqli_query($con,"INSERT INTO yelp VALUES ('$bizID', '$reviewID', 0, 0, 1, 0) 
    ON DUPLICATE KEY UPDATE atmosphere=atmosphere + 1");
  //updates the page with the new tag counts
  updateTagCounts($idArray, $con);
}

//this code runs only when the price button is clicked. It increments price by one for the reviewID
if ($_POST["action"] == "price") {
  //the "reviewID" comes from data: in the ajax call
  $reviewID = $_POST["reviewID"];

  //insert the reviewID and corresponding tag count into the yelp table
  //if the key is a duplicate, then it increments the appropriate reviewID tag by 1
  $query=mysqli_query($con,"INSERT INTO yelp VALUES ('$bizID', '$reviewID', 0, 0, 0, 1) 
    ON DUPLICATE KEY UPDATE price=price + 1");
  //updates the page with the new tag counts
  updateTagCounts($idArray, $con);
}

//this runs on page load
if ($_POST["action"] == "pageload") {
  //updates the page with the new food and service counts
  updateTagCounts($idArray, $con);

}

function updateTagCounts($Array, $con){
 //the following code iterates through every row in yelp and traverses through every item in idArray
//if the ids match, then it will output the food and service counts
//this is possibly the most inefficient way to do this...
$result = mysqli_query($con,"SELECT * FROM yelp");
while($row = mysqli_fetch_array($result)) {
  foreach ($Array as $id) {
    if ($id == $row['reviewID']) {
      //this will return data in the script.js that looks like &ID=1&food=12&service=1
      //maybe we can parse that and do something with it?
      echo "ID=" . $id . "&food=" . $row['food'] . "&service=" . $row['service'] . "&atmosphere="
        . $row['atmosphere'] . "&price=" . $row['price'] . ";";
      //echo "reviewID: " . $row['reviewID'] . " food: " . $row['food'] . " service: " . $row['service'];
      //echo "<br>";
      }
    }
  } 
} 
 
?>