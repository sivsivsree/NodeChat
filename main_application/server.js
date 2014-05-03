//Variables
var mongo  = require('mongodb').MongoClient;
var client = require('socket.io').listen(8080).sockets;

//connecting to mongoDB
console.log("connecting to mongo..");
mongo.connect("mongodb://127.0.0.1/messages", function(err, db){
	console.log("connected to mongo!");
	//handling err
	if(err) throw err;

	var col = db.collection("messages");


	//choosing our collection

	//connecting to conncection after connecting to DB
	console.log("Waiting for connections...");

	client.on('connection', function(socket){
		console.log("Connection Accepted!");

		var sendStatus = function (s){
	    	socket.emit("status", s);
	  	};

	  	//emit all the messges

	  	col.find().limit(100).sort({_id:1}).toArray(function(err, res){
	  		if(err) throw err;

	  		socket.emit('output', res);
	  	});

		//testing Input
		socket.on("input", function(data){

			var name    = data.name;
			var message = data.message;
			var whitespace  = /^\s*$/

			if(whitespace.test(name) || whitespace.test(message)){
				sendStatus({
					message :"Name and Message is required!",
					clear   : false
				});
			}else{


				col.insert({name:name, message:message}, function(){

					//emit latest msg to all clients
					client.emit('output', [data]);

					sendStatus({
						message :"Sent",
						clear   : true
					});
				});
			}


		});
	});	

});

