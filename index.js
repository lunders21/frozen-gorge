var express = require('express');
var app = express();
var pg = require('pg');

var conString = "postgres://ebzqldzdjabrhx:7YBhRVZ3KanjSCuPvGtTYAIcBT@ec2-54-163-238-96.compute-1.amazonaws.com:5432/d2u36iutqq574u";
var client = new pg.Client(conString);

app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));

app.get('/', function(request, response) {

    var query = require('url').parse(request.url,true).query;
    var user = query.user;

    client.connect(function(err) {
        if(err) {
            response.send('could not connect to postgres', err);
        }
        client.query("SELECT ANTALL FROM REQUESTER WHERE BRUKER = '" + user + "'", function(err, result) {
            if(err) {
                response.send('error running query', err);
            }
            console.log(result.rows[0]);
            //output: Tue Jan 15 2013 19:12:47 GMT-600 (CST)
            client.end();
            response.send(result.rows[0].theTime);
        });
    });
    

    response.send(result);
});

app.post('/', function(request, response) {

    var result = "result";
    pg.connect(conString, function(err, client) {

        var query = client.query("INSERT INTO REQUESTER (ANTALL, BRUKER) VALUES ('2', 'testerbruker');");

        query.on('row', function(row) {
            result = JSON.stringify(row);
        });
    });
    response.send(result);
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));

});

