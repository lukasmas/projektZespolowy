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
var db = null;
var arr = [];
var result = [];
var server = http.createServer(app);
app.use(express.static(path.join(__dirname, 'build')));
app.get('/api/getList', function (req, res) {
    var list = ["item1", "item2", "item3"];
    res.json(list);
    console.log('Sent list of items');
});
app.get('*', function (req, res) {
    res.sendFile(path.join(__dirname + 'build/index.html'));
});
openDatabase();
var wss = new WebSocket.Server({ server: server });
wss.on('connection', function (ws) {
    ws.on('message', function (message) {
        try {
            var obj = JSON.parse(message);
            arr.push(obj);
            dosth(arr.pop());
            ws.send(message);
        }
        catch (_a) {
            console.log("Not a JSOS!");
            console.log('received: %s', message);
            ws.send("Hello, you sent -> " + message);
        }
    });
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
    var sql = 'SELECT * from test1';
    db.all(sql, [], function (err, rows) {
        if (err) {
            throw err;
        }
        rows.forEach(function (row) {
            var x = Object.keys(row);
            var device = "\"data\": {\n";
            x.forEach(function (key) {
                // if(key != "value")
                    device += "\"" + key + "\" : \"" + row[key] + "\",\n";
                // else
                //     device += "\"" + key + "\" : \"" + row[key] + "\"\n";
                
            });
            device += "\"title\" : \"test_"+row["id"]+"\"\n";
            device += "}";
            let JData = "{\n" + device + ",\n" + "\"type\": \"CREATE_DEVICE\" \n}"
            // console.log(JData + "\n");
            try {
                obj.send(JData);
                JData = JSON.parse(JData);
                console.log(JData);
                

            }
            catch (_a) {
                obj.send("Err");
                // console.log(_a);
            }
        });
    });
}
function AddToDataBase(obj) {
}
var slowo = "";
var port = '';
var status = '';
raspi.init(function () {
    var serial = new Serial({
        portId: "/dev/ttyS0",
        baudRate: 115200
    });
    serial.open(function () {
        serial.on('data', function (data) {
            if (data != " ") {
                slowo += data;
            }
            else {
                port = slowo[0] + slowo[1];
                status = slowo[2];
                process.stdout.write("port: " + port + ", status: " + status + "\n ");
                slowo = "";
                serial.write("OK");
            }
        });
        serial.write('Hello from raspi-serial');
    });
});
