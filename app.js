// http://localhost:8080/convert?source=http://i.imgur.com/2dD6DL5.jpg&size=350x350
// or
// http://localhost:8080/convert/300x300/aHR0cDovL2kuaW1ndXIuY29tLzJkRDZETDUuanBn.jpg
// http://localhost:8080/convert/300x300/aHR0cDovL2kuaW1ndXIuY29tLzJkRDZETDUuanBn.jpg

var express = require('express');
var _ = require("underscore");
var easyImage = require("easyimage"),
	fs = require("fs"),
	io = require("./modules/io");
var resize = require("./modules/resizer");

//Create express app
var app = express();

app.set('title',"NodeSizer");

app.get('/', function(req, res){
  res.send('<p>hakeru!!!p>');
});

//Converter
app.get('/convert*', function(req, res){
	// Using static methods:
	var start = Date.now();

  opts = req.path.split('/')
  console.log(opts);
  if (opts[3]) {
		req.query.size = opts[2] 
  	req.query.source = new Buffer(opts[3].split('.')[0], encoding='Base64').toString('ascii')
  }

	var validRequest = resize.queryHasValidParams(req.query);

	if(!validRequest){
		// Invalid request
		res.send(400,"<h3>Invalid Request</h3><p>You require, 'source' and 'size' GET queries minimum</p><p>If you are check your parameters. 'size' must be greater than 0!");
		return;
	}

	// Go get the image
	resize.getOrginalImage(req.query, function(sucess){
		if(!sucess){
			res.send(404, "<h3>File not found - "+req.query.source+"</h3>");
			return;
		}else{
			//res.setEncoding('binary');
			res.set('Content-Type', 'image/jpeg');
			resize.changeImage(req.query, function(err, path){
				if(err){

				}else{
					var end = Date.now();
					var elapsed = end - start; // time in milliseconds
					console.log("Convert - elapsed time: " + elapsed + "ms");
					res.set({
					  'Content-Type' : 'image/'+ resize.getImageExt(path),
					  'Content-Creation-Time' : elapsed

					});
					fs.createReadStream(path).pipe(res);
				}
				//res.send(orginalImage);

			});
			//res.end(new Buffer(orginalImage), 'binary');
		}
	});

});


//Clean the Image cache
io.removeImagesPath();


//Set up which port to listen too
var port = 8080;
if(process.env.NODE_PROD == "true"){
	port = 80;
}
app.listen(port);
console.log("NodeSizer started on port " + port);
