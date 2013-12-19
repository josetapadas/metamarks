var express = require('express');
var app = express();
var port = process.env.PORT || 8080; 
app.configure(function () {
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.static(__dirname + '/metamarks-ember'));
});

app.get("/", function(req, res) {
  res.redirect("/index.html");
});

// start server
app.listen(port);
console.log('[!] le server as started.');
