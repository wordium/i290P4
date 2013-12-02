$(document).ready(function(){
	$.ajax({
		type:"post",
		url:"db.php",
		data: {
			action: 'post',
			id: '12345',
			score: '54321'
		} ,
		success:function(data){
			console.log(data);
			alert('done');
		}
	});
}