$(document).ready(function(){
	/*updateAllScores();

	// insert row to db
	$('#postbutton').click(function() {
		var guesserid = $('#guesserid').val();
		var targetid = $('#targetid').val();
		var score = $('#score').val();

		if(!guesserid || !targetid || !score) {
			alert('no input');
		}

		$.post('db.php', {
				action: 'newscore',
				guesserid: guesserid,
				targetid: targetid,
				score: score
			}, function(data) {
				console.log(data);
				updateAllScores();
				alert('done');
			});
	});*/


	// get top individual scores
	$('#topscores').click(function() {
		$.get('db.php', {action: 'topscores'}, function(data) {
			var values = JSON.parse(data);
			var resultshtml = '';
			for(var i = 0 ; i < values.length ; ++i) {
				var v = values[i];
				resultshtml = resultshtml + v.scoreid + " " + v.guesserid + " " + v.targetid + ' ' + v.score + '<br>';
			}
			$('#results').html(resultshtml);
		});
	});


	// get top scores for guesser
	$('#myscoresbutton').click(function() {
		var guesserid = $('#myscores').val();
		if(!guesserid)
			alert("no guesser");
		$.get('db.php', {action: 'myscores', guesserid: guesserid}, function(data) {
			var values = JSON.parse(data);
			var resultshtml = '';
			for(var i = 0 ; i < values.length ; ++i) {
				var v = values[i];
				resultshtml = resultshtml + v.scoreid + " " + v.guesserid + " " + v.targetid + ' ' + v.score + '<br>';
			}
			$('#results').html(resultshtml);
		});
	});

	// get top scores for target
	$('#targetscoresbutton').click(function() {
		var targetid = $('#targetscores').val();
		if(!targetid)
			alert("no target");
		$.get('db.php', {action: 'targetscores', targetid: targetid}, function(data) {
			var values = JSON.parse(data);
			var resultshtml = '';
			for(var i = 0 ; i < values.length ; ++i) {
				var v = values[i];
				resultshtml = resultshtml + v.scoreid + " " + v.guesserid + " " + v.targetid + ' ' + v.score + '<br>';
			}
			$('#results').html(resultshtml);
		});
	});


	// get top aggregate scores
	$('#toptotals').click(function() {
		$.get('db.php', {action: 'toptotals'}, function(data) {
			var values = JSON.parse(data);
			var resultshtml = '';
			for(var i = 0 ; i < values.length ; ++i) {
				var v = values[i];
				resultshtml = resultshtml + v.guesserid + ' ' + v.score + '<br>';
			}
			$('#results').html(resultshtml);
		});
	});

});

function updateAllScores() {
	$.get('db.php', {action: 'getall'}, function(data) {
		$('#text').html(data);
	});
}