var express = require('express');
var app = express();
var pg = require('pg');

var conString = "postgres://ebzqldzdjabrhx:7YBhRVZ3KanjSCuPvGtTYAIcBT@ec2-54-163-238-96.compute-1.amazonaws.com:5432/d2u36iutqq574u";

var client = new pg.Client(conString);
client.connect();



app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));

app.get('/totalt', function(request, response) {
    get_antall_totalt(request, response);
});

app.get('/', function(request, response) {
    select_antall(request, response);
});

app.post('/', function(request, response) {

    var result = "result";
    pg.connect(conString, function(err, client) {

        var urlquery = require('url').parse(request.url,true).query;
        var user = urlquery.user;
        var antallQuery = client.query(selectUser(user));


        antallQuery.on("row", function (row, result) {
            result.addRow(row);
        });
        antallQuery.on("end", function (result) {
            var antall = getAntall(result);
            
            if (antall === 0) {
                
                var insertQuery = client.query(insertNew(user));
                insertQuery.on("row", function (row, result) {
                    result.addRow(row);
                });
                insertQuery.on("end", function () {
                    response.writeHead(200, {'Content-Type': 'text/plain'});
                    response.write(user + " er opprettet.\n");
                    response.end();
                });

            } else {
                var updateQuery = client.query(updateAntall(user, antall));
                updateQuery.on("row", function (row, result) {
                    result.addRow(row);
                });
                updateQuery.on("end", function () {
                    response.writeHead(200, {'Content-Type': 'text/plain'});
                    response.write(user + " har fått antall justert til " + (++antall) + "\n");
                    response.end();
                });
            }
           
        });
    });
});

function getAntall(result) {
    try {
        var dbResult = JSON.stringify(result.rows[0]);
        var json = JSON.parse(dbResult);
        return json["antall"];
    } catch (error) {
        return 0;
    }
    
}

function getAntallTotalt() {
    var totaltQuery = client.query(totalClicks());

    totaltQuery.on("row", function (row, result) {
        result.addRow(row);
    });
    totaltQuery.on("end", function (result) {
        var dbResult = JSON.stringify(result.rows[0]);
        var json = JSON.parse(dbResult);
        return json["sum"];
    });
    return totaltQuery;
}

var select_antall = function(request, response) {

    var urlquery = require('url').parse(request.url,true).query;
    var user = urlquery.user;
    var query = client.query(selectUser(user));


    query.on("row", function (row, result) {
        result.addRow(row);
    });
    query.on("end", function (result) {
        var antall = getAntall(result);
        var totalt = getAntallTotalt();

        response.writeHead(200, {'Content-Type': 'text/plain'});
        response.write(user + " er registrert med antall: " + antall + "\n");
        response.write("Totalt er det registrert: " + totalt + "\n");
        response.end();
    });

};



app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));

});

function insertNew(user) {
    return "INSERT INTO REQUESTER (ANTALL, BRUKER) VALUES ('1', '" + user + "');";
}

function updateAntall(user, antall) {
    return "UPDATE REQUESTER SET ANTALL = '" + (++antall) + "' WHERE BRUKER = '" + user + "';";
}

function selectUser(user) {
    return "SELECT ANTALL FROM REQUESTER WHERE BRUKER = '" + user + "';";
}

function totalClicks() {
    return "SELECT SUM(ANTALL) FROM REQUESTER;";
}
