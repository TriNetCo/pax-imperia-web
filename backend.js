var express = require('express');
var app = express();
var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://mongoadmin:secret@localhost/';

let databaseName = "myDatabase";
let collectionName = "records";


///////////////////
// Configuration //
///////////////////
//

// https://stackoverflow.com/questions/24330014/bodyparser-is-deprecated-express-4/24330353#24330353
app.use(express.json());
// app.use(express.urlencoded());


// serve static html assets in the public/ folder
app.use('/public', express.static('public'));

app.get('/', function(req, res){
    res.redirect('/public/index.html');
});

var server = app.listen(3000, function() {
    console.log("Listening on port 3000");
});