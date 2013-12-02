<?php
// connects to my ischool mysql database. username: jenton, password: qwerty, database: jenton
//$con = mysqli_connect("localhost", "dantos_ischool", "o2lb_awsIS", "dantos_dantsai");
  $con = mysqli_connect("localhost", "jenton", "qwerty", "jenton");
 
// Failure check
if (mysqli_connect_errno($con))
{
	echo "Failed to connect to MySQL: " . mysqli_connect_error();
}

if($_SERVER['REQUEST_METHOD'] == 'GET') {
	if($_GET['action'] == 'getall') {
		$result = mysqli_query($con,"SELECT * FROM facebook");
		echo "scoreid guesserid guesserusername targetid targetusername score<br>";
		while($row = mysqli_fetch_array($result)) {
			echo $row[0] . ' ' . $row[1] . ' ' . $row[2] . ' ' . $row[3] . ' ' . $row[4] . '<br>';
		}
	}

	if($_GET['action'] == 'topscores') {
		$result = mysqli_query($con,"SELECT * FROM facebook ORDER BY score DESC LIMIT 20");
		$rows = array();
		while($r = mysqli_fetch_assoc($result)) {
			$rows[] = $r;
		}
		echo json_encode($rows);
	}

	if($_GET['action'] == 'myscores') {
		$guesserid = $_GET['guesserid'];
		$result = mysqli_query($con,"SELECT * FROM facebook WHERE guesserid = $guesserid ORDER BY score DESC LIMIT 20");
		$rows = array();
		while($r = mysqli_fetch_assoc($result)) {
			$rows[] = $r;
		}
		echo json_encode($rows);
	}

	if($_GET['action'] == 'targetscores') {
		$targetid = $_GET['targetid'];
		$result = mysqli_query($con,"SELECT * FROM facebook WHERE targetid = $targetid ORDER BY score DESC LIMIT 20");
		$rows = array();
		while($r = mysqli_fetch_assoc($result)) {
			$rows[] = $r;
		}
		echo json_encode($rows);
	}

	if($_GET['action'] == 'toptotals') {
		$result = mysqli_query($con,"SELECT guesserid, SUM(score) as score FROM facebook GROUP BY guesserid order by SUM(score) desc limit 20");
		$rows = array();
		while($r = mysqli_fetch_assoc($result)) {
			$rows[] = $r;
		}
		echo json_encode($rows);
	}
}

if($_POST['action'] == 'newscore') {
	$guesserid = $_POST['guesserid'];
	$guesserusername = $_POST['guesserusername'];
	$targetid = $_POST['targetid'];
	$targetusername = $_POST['targetusername'];
	$score = $_POST['score'];
	$result = mysqli_query($con,"INSERT INTO facebook (guesserid, guesserusername, targetid, targetusername, score) VALUES ($guesserid, $guesserusername, $targetid, $targetusername, $score)");
	echo 'done';
}

?>