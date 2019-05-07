import * as express from 'express';
import * as http from 'http';
import * as WebSocket from 'ws';
import * as sqlite3 from 'sqlite3';
import * as fs from 'fs';
import * as url from 'url';
const raspi = require('raspi');
const Serial = require('raspi-serial').Serial;

const path = require('path');

const app = express();

//initialize a simple http server
//const server = http.createServer(app);
var db = null;
var arr = [];
var result = [];

const server = http.createServer(app); //{

// Serve the static files from the React app
app.use(express.static(path.join(__dirname, 'build')));

// An api endpoint that returns a short list of items
app.get('/api/getList', (req,res) => {
    var list = ["item1", "item2", "item3"];
    res.json(list);
    console.log('Sent list of items');
});

// Handles any requests that don't match the ones above
app.get('*', (req,res) =>{
    res.sendFile(path.join(__dirname+'build/index.html'));
});

// const port = process.env.PORT || 5000;
// app.listen(port);

// console.log('App is listening on port ' + port);


openDatabase();

//initialize the WebSocket server instance
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws: WebSocket) => {

    //connection is up, let's add a simple simple event
    ws.on('message', (message: string) => {
        
        //log the received message and send it back to the client
        try{
            var obj = JSON.parse(message);
            arr.push(obj);
            dosth(arr.pop());
            ws.send("OK!");
        }
        catch{
            console.log("Not a JSOS!");
            console.log('received: %s', message);
            ws.send(`Hello, you sent -> ${message}`);
        }
        
    });

    //send immediatly a feedback to the incoming connection
    var x = DataFromDatabase(ws);

});

// start our server
server.listen(process.env.PORT || 8999, () => {
    console.log(`Server started on port 8999 :)`);
});


function dosth(obj){

    console.log(obj);
    
}


function openDatabase(){
    db = new sqlite3.Database('../baza/test.db', (err) => {
        if (err) {
          console.error(err.message);
        }
        console.log('Connected to the chinook database.');
      });
}

function DataFromDatabase(obj){
    
    //var result = [];

    // Select * from tablica

    var sql = 'SELECT * from test1';
    
    //result = "{ \"id\" : 0, \"type\" : \"button\", \"value\" : 1}";

    db.all(sql, [], (err, rows) => {
        if(err){
            throw err;
        }
        rows.forEach(row => {
            //result += row.name + " ";
            //console.log(row);
            const x = Object.keys(row);
            let temp = `{\n`;
            x.forEach (key => {
                temp += `"${key}" : ${row[key]},\n`;

            });
            temp += `}`;
            console.log(temp);
            result.push(temp);

            try{
                temp = JSON.parse(temp);
                //console.log("OK!");
                result.push(temp);
            }
            catch{
                obj.send("Err");
            }
            
        });

        obj.send(result);
        obj.send("Witam!")
    
    });
    
}

function AddToDataBase(obj){
    
}

let slowo = [];
let port = '';
let status = ''

raspi.init(() => {
  var serial = new Serial({
        portId  : `/dev/ttyS0`,
        baudRate : 115200
    });
  serial.open(() => {
    serial.on('data', (data) => {
    //   process.stdout.write(data);
      if(data != " "){
        slowo += data
        }
        else{
            port = slowo.shift()+slowo.shift();
            status = slowo.toString();
            

            process.stdout.write("port: " + port + ", status: "+ status + "\n");

            //slowo = [];
            serial.write("OK");
        }
    //   console.log(data);
    });
    serial.write('Hello from raspi-serial');
  });
});
