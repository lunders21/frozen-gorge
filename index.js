var express = require('express');
var app = express();

app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));

app.get('/', function(request, response) {
    if (request.method === "GET") {
        response.send('GET request!');
    }
    if (request.method === "POST"){
        response.send('POST request!');
    }
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});



var pg = require('pg');

pg.connect(process.env.DATABASE_URL, function(err, client) {
    var query = client.query('SELECT * FROM your_table');

    query.on('row', function(row) {
        console.log(JSON.stringify(row));
    });
});