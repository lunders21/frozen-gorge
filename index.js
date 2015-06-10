var express = require('express');
var app = express();
var pg = require('pg');
var pbkdf2 = require('pbkdf2');

var salt = process.env.SALT;

var conString = process.env.DATABASE_URL;
var client = new pg.Client(conString);
client.connect();

app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));

app.get('/totalt', function(request, response) {
    totalt(request, response);
});

app.get('/hash', function(request, response) {
    var urlquery = require('url').parse(request.url,true).query;
    var user = urlquery.user;
    var pwd = pbkdf2.hashSync(user, salt, 1, 20, 'sha1');

    response.writeHead(200, {'Content-Type': 'text/plain'});
    response.write(pwd);
    response.end();
});

app.post('/', function(request, response) {
    
    var svar = "Ukjent request";
    pg.connect(conString, function(err, client) {
        var urlquery = require('url').parse(request.url,true).query;
        var user = urlquery.user;
        var urlParameterAntall = urlquery.antall;
        var inputHash = urlquery.arg;
        
        var antallQuery = client.query(selectUser(user));
        var hash = pbkdf2.hashSync(user, salt, 1, 20, 'sha1');
        
        if (hash !== inputHash){
            svar = "ukjent hash";
        } else {
        antallQuery.on("row", function (row, result) {
            result.addRow(row);
        });
        antallQuery.on("end", function (result) {
            var antall = getAntall(result);
            if (antall === 0) {
                var insertQuery = client.query(insertNew(user, urlParameterAntall));
                insertQuery.on("row", function (row, result) {
                    result.addRow(row);
                });
                insertQuery.on("end", function () {
                    svar = urlParameterAntall;
                });
            } else {
                var updateQuery = client.query(updateAntall(user, urlParameterAntall));
                updateQuery.on("row", function (row, result) {
                    result.addRow(row);
                });
                updateQuery.on("end", function () {
                    svar = urlParameterAntall;
                });
            }
        });
        }
     //   response.writeHead(200, {'Content-Type': 'text/plain'});
     //   response.write(svar);
     //   response.end();
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

var totalt = function(request, response) {
    var query = client.query(totalClicks());

    query.on("row", function (row, result) {
        result.addRow(row);
    });
    query.on("end", function (result) {
        var dbResult = JSON.stringify(result.rows[0]);
        var json = JSON.parse(dbResult);
        var totalt = json["sum"];

        response.writeHead(200, {'Content-Type': 'text/plain'});
        response.write(totalt);
        response.end();
    });
};

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));

});

function insertNew(user, antall) {
    return "INSERT INTO REQUESTER (ANTALL, BRUKER) VALUES ('"+ antall + "', '" + user + "');";
}

function updateAntall(user, antall) {
    return "UPDATE REQUESTER SET ANTALL = '" + antall + "' WHERE BRUKER = '" + user + "';";
}

function selectUser(user) {
    return "SELECT ANTALL FROM REQUESTER WHERE BRUKER = '" + user + "';";
}

function totalClicks() {
    return "SELECT SUM(ANTALL) FROM REQUESTER;";
}
