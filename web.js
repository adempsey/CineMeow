var express = require("express");
var app = express();
app.use(express.logger());
app.use(express.bodyParser());
app.set('title', 'CineMeow');
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

var mongo = require('mongodb');
var mongourl = 'mongodb://admin:meowmeow@paulo.mongohq.com:10029/app19434598';
var db = mongo.Db.connect(mongourl, function(error, dbConnection) { db=dbConnection; });

//Test public 
//app.use(express.static(__dirname + '/public'));
app.configure(function(){
	app.use('/assets', express.static(__dirname + '/public/assets'));
	app.use(express.static(__dirname + '/public'));
	app.use(function(request, response, next) {
		response.header("Access-Control-Allow-Origin", "*");
		response.header("Access-Control-Allow-Headers", "X-Requested-With");
		next();
	});
});

app.get('/', function(request, response) {
	response.render('index');
});

/* returns project data for a given project id */
app.get('/project', function(req, res) {
	var ObjectID = mongo.ObjectID;
	var id = new ObjectID(req.query.id);
	db.collection("projects", function(err, collection) {
		collection.findOne({"_id": id}, function(err, results) {
			if (err || !results) {
				console.log(err+" ** "+results);
				res.send(400);
			} else {
				res.send(results);
			}
		});
	});
});

/* generates new project skeleton */
app.post('/newproject', function(req, res) {
	db.collection("projects", function(err, collection) {
		collection.insert( {
			name: req.body["name"],
			created_at: (new Date()).toString(),
			clips: []
		}, function(err, inserted) {
			if (err) {
				console.log(err);
				res.send(400);
			} else {
				res.send(200);
			}
		});
	});
});

app.post('/editproject', function(req, res) {
	var ObjectID = mongo.ObjectID;
	var id = new ObjectID(req.body["id"]);
	var data = JSON.parse(req.body['data']);
	console.log("***RECEIEVED "+data);
	db.collection("projects", function(err, collection) {
		collection.findOne({"_id": id}, function(err, results) {
			if (err || !results) {
				console.log(err);
				res.send(400);
			} else {
				collection.update({"_id": id}, data, function(err) {
					if (err) {
						res.send(400);
					}
				});
				res.send(200);
			}
		});
	});
});

// /* add clip to project's timeline */
// app.post('/newclip', function(req, res) {
// 	var ObjectID = mongo.ObjectID;
// 	var id = new ObjectID(req.body["id"]);
// 	db.collection("projects", function(err, collection) {
// 		collection.findOne({ "_id": id }, function(err, results) {
// 			if (err || !results) {
// 				console.log(err);
// 				res.send(400);
// 			} else {
// 				var clipStats = {
// 					"name": req.body["name"],
// 					"start_time": req.body["start_time"],
// 					"end_time": req.body["end_time"],
// 					"source": req.body["source"]
// 				}
// 				results.clips.push(clipStats);
// 				collection.update({"_id": id}, {$set: {"clips": results.clips}}, function (err) {
// 					if (err) {
// 						res.send(400);
// 					}
// 				});
// 				res.send(200);
// 			}
// 		});
// 	});
// });

// /* edit a clip's start and end points */
// app.post('/editclip', function(req, res) {
// 	var ObjectID = mongo.ObjectID;
// 	var id = new ObjectID(req.body["id"]);
// 	db.collection("projects", function(err, collection) {
// 		collection.findOne({"_id": id }, function(err, results) {
// 			if (err || !results) {
// 				console.log(err);
// 				res.send(400);
// 			} else {
// 				var clip = results.clips.indexOf(req.bo)
// 				for (var i in results.clips) { //this is kinda dumb haha we should fix it later
// 					if (results.clips[i].name == req.body["name"]) {
// 						results.clips[i].start_time = req.body["start_time"];
// 						results.clips[i].end_time = req.body["end_time"];
// 						break;
// 					}
// 				}
// 				collection.update({"_id": id}, {$set: {"clips": results.clips}}, function (err) {
// 					if (err) {
// 						res.send(400);
// 					}
// 				});
// 				res.send(200);
// 			}
// 		});
// 	});
// });

var port = process.env.PORT || 5000;
app.listen(port, function() {
	console.log("Listening on " + port);
});


