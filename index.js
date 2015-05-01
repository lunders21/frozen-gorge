var express = require('express');
var app = express();
var pg = require('pg');


app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));

app.get('/', function(request, response) {
    response.send('GET request!');
});

app.post('/', function(request, response) {
    response.send('POST request!');
    
    
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
    pg.connect("postgres://ebzqldzdjabrhx:7YBhRVZ3KanjSCuPvGtTYAIcBT@ec2-54-163-238-96.compute-1.amazonaws.com:5432/d2u36iutqq574u", function(err, client) {

        var query = client.query('INSERT INTO REQUESTER VALUES(1, TESTBRUKER)');

        query.on('row', function(row) {
            console.log(JSON.stringify(row));
        });
    });
});

