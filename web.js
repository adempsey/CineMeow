var express = require("express");
var app = express();
app.use(express.logger());
app.set('title', 'CineMeow');
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

app.get('/', function(request, response) {
	response.render('index');
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
	console.log("Listening on " + port);
});