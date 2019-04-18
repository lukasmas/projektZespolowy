"use strict";
exports.__esModule = true;
var express = require("express");
var http = require("http");
var WebSocket = require("ws");
var sqlite3 = require("sqlite3");
var raspi = require('raspi');
var Serial = require('raspi-serial').Serial;
var path = require('path');
var app = express();
//initialize a simple http server
//const server = http.createServer(app);
var db = null;
var arr = [];
var result = [];
var server = http.createServer(app); //{
// Serve the static files from the React app
app.use(express.static(path.join(__dirname, 'build')));
// An api endpoint that returns a short list of items
app.get('/api/getList', function (req, res) {
    var list = ["item1", "item2", "item3"];
    res.json(list);
    console.log('Sent list of items');
});
// Handles any requests that don't match the ones above
app.get('*', function (req, res) {
    res.sendFile(path.join(__dirname + 'build/index.html'));
});
// const port = process.env.PORT || 5000;
// app.listen(port);
// console.log('App is listening on port ' + port);
openDatabase();
//initialize the WebSocket server instance
var wss = new WebSocket.Server({ server: server });
wss.on('connection', function (ws) {
    //connection is up, let's add a simple simple event
    ws.on('message', function (message) {
        //log the received message and send it back to the client
        try {
            var obj = JSON.parse(message);
            arr.push(obj);
            dosth(arr.pop());
            ws.send("OK!");
        }
        catch (_a) {
            console.log("Not a JSOS!");
            console.log('received: %s', message);
            ws.send("Hello, you sent -> " + message);
        }
    });
    //send immediatly a feedback to the incoming connection
    var x = DataFromDatabase(ws);
});
// start our server
server.listen(process.env.PORT || 8999, function () {
    console.log("Server started on port 8999 :)");
});
function dosth(obj) {
    console.log(obj);
}
function openDatabase() {
    db = new sqlite3.Database('../baza/test.db', function (err) {
        if (err) {
            console.error(err.message);
        }
        console.log('Connected to the chinook database.');
    });
}
function DataFromDatabase(obj) {
    //var result = [];
    // Select * from tablica
    var sql = 'SELECT * from test1';
    //result = "{ \"id\" : 0, \"type\" : \"button\", \"value\" : 1}";
    db.all(sql, [], function (err, rows) {
        if (err) {
            throw err;
        }
        rows.forEach(function (row) {
            //result += row.name + " ";
            //console.log(row);
            var x = Object.keys(row);
            var temp = "{\n";
            x.forEach(function (key) {
                temp += "\"" + key + "\" : " + row[key] + ",\n";
            });
            temp += "}";
            console.log(temp);
            result.push(temp);
            try {
                temp = JSON.parse(temp);
                //console.log("OK!");
                result.push(temp);
            }
            catch (_a) {
                obj.send("Err");
            }
        });
        obj.send(result);
        obj.send("Witam!");
    });
}
function AddToDataBase(obj) {
}
var slowo = "";
raspi.init(function () {
    var serial = new Serial({
        portId: "/dev/ttyS0",
        baudRate: 115200
    });
    serial.open(function () {
        serial.on('data', function (data) {
            //   process.stdout.write(data);
            if (data != " ") {
                slowo += data;
            }
            else {
                process.stdout.write(slowo + " ");
                slowo = "";
                serial.write("OK");
            }
            //   console.log(data);
        });
        serial.write('Hello from raspi-serial');
    });
});
