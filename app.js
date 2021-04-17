const express = require('express');
const app = new express();

app.get('/', function(req, res){
    res.sendFile(__dirname + '/public/index.html');
});

app.use(express.static(__dirname + '/public'));


var server = app.listen(1111, function () {
    console.log("hello!!!");
    //StartDataProcessing();
});

