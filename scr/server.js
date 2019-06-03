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
var dbHandler = require('./db-handler');
var db = null;
var arr = [];
var result = [];
var serial;
const sensor = require('ds18b20-raspi');
var tempC = sensor.readSimpleC(1);

const type = {
    UPDATE_DEVICE: 'UPDATE_DEVICE',
    CREATE_DEVICE: 'CREATE_DEVICE',
    FETCH_DEVICES: 'FETCH_DEVICES',
    DELETE_DEVICE: 'DELETE_DEVICE',
    ERROR: 'ERROR'
};


var server = http.createServer(app);
app.use(express.static(path.join(__dirname, 'build')));
app.get('*', function (req, res) {
    res.sendFile(path.join(__dirname + 'build/index.html'));
});
openDatabase();
var wss = new WebSocket.Server({ server: server });
wss.on('connection', function (ws) {
    ws.on('message', function (message) {
        try {
            console.log(message);
            var obj = JSON.parse(message);
            switch (obj["type"]) {
                case type.UPDATE_DEVICE:
                    dbHandler.updateDevice(db, obj, (json) => {
                        console.log(json.data.value);
                        let temp = "t0" + json.data.port + json.data.value;
                        console.log(temp);
                        serial.write(temp);
                    });
                    break;
                case type.CREATE_DEVICE:
                    dbHandler.createDevice(db, obj, (json) => {
                        console.log(json);
                    });
                    break;
                case type.FETCH_DEVICES:
                    dbHandler.getDevices(db, (json) => {
                        console.log(json);
                    });
                    break;
                case type.DELETE_DEVICE:
                    dbHandler.deleteDevice(db, obj, (json) => {
                        console.log(json);
                    });
                    break;
                case type.ERROR:
                    console.log("ERROR type json");
                    break;
                default:
                    console.log("Incorrect json type");
            }
            ws.send(message);
            
            temp(ws);
        }
        catch (_a) {
            console.log("Not a JSOS!");
            console.log('received: %s', message);
            message = "\"data\" : \"something is not yes\", \"type\":\"ERROR\"";
            ws.send(message);
        }
    });
    DataFromDatabase(ws);
    
});
// start our server
server.listen(process.env.PORT || 8999, function () {
    console.log("Server started on port 8999 :)");
});

function temp(ws){

    var device = "\"data\": {\n";
    device +="\"id\": \"9\", \"type\": \"sensor\", \"title\": \"TEMP\", \"value\": " + tempC + ", \"port\": \"99\"";
    device += "}";
    let JData = "{\n" + device + ",\n" + "\"type\": \"UPDATE_DEVICE\" \n}"
    console.log(`${tempC} degC`);
    try {
        ws.send(JData);
        JData = JSON.parse(JData);
        console.log(JData);

    }
    catch (_a) {
        ws.send("\"data\" : \"something is not yes\", \"type\":\"ERROR\"");
        console.log(JData);
    }
}

function openDatabase() {
    db = new sqlite3.Database('../baza/mainDB.db', function (err) {
        if (err) {
            console.error(err.message);
        }
        console.log('Connected to the chinook database.');
    });
}
function DataFromDatabase(obj) {
    var sql = 'SELECT * from Devices';
    db.all(sql, [], function (err, rows) {
        if (err) {
            throw err;
        }
        rows.forEach(function (row) {
            var x = Object.keys(row);
            var device = "\"data\": {\n";
            let count = x.length;
            let i = 0;
            x.forEach(function (key) {
                
                if( i+1 != count )
                    if( key != "value")
                        device += "\"" + key + "\" : \"" + row[key] + "\",\n";
                    else
                        device += "\"" + key + "\" : " + row[key] + ",\n";
                else
                    device += "\"" + key + "\" : \"" + row[key] + "\"\n";
                i++;
            });
            device += "}";
            let JData = "{\n" + device + ",\n" + "\"type\": \"CREATE_DEVICE\" \n}"
            try {
                obj.send(JData);
                JData = JSON.parse(JData);
                
                console.log(JData);

            }
            catch (_a) {
                obj.send("\"data\" : \"something is not yes\", \"type\":\"ERROR\"");
                console.log(JData);
            }
        });
        temp(obj);
    });
}

raspi.init(function () {
    serial = new Serial({
        portId: "/dev/ttyS0",
        baudRate: 115200
    });
    serial.open(function () {
        serial.on('data', function (data) {
            let obj = data.toString();

            //update funckja update
            // console.log(obj[3]+" "+obj[2]);
            var sql = 'UPDATE Devices SET value = ? WHERE port = ?';
            let dataToUpdate = [obj[3], obj[2]];
            db.run(sql, dataToUpdate, function(err) {
                if (err) {
                  return console.error(err.message);
                }
                console.log(`Row(s) updated: ${this.changes}`);
              });
            
        });
        // serial.write("t041"); // triger, [2] port, value
    });
});
