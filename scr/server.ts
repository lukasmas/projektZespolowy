import * as express from 'express';
import * as http from 'http';
import * as WebSocket from 'ws';
import * as sqlite3 from 'sqlite3';
import * as fs from 'fs';
import * as url from 'url';

const app = express();

//initialize a simple http server
//const server = http.createServer(app);
var db = null;
var arr = [];
var result = [];

const server = http.createServer(function (req, res) {
        
    var queryData = url.parse(req.url, true).query;
    if(queryData.id){
        try{
            res.writeHead(200, {'Content-Type': 'text/plain'});
            console.log(parseInt(queryData.id.toString()));
            res.write(JSON.stringify(result[parseInt(queryData.id.toString())]));
            res.end();
        }
        catch{
            res.writeHead(200, {'Content-Type': 'text/plain'});
            res.write("SOMETHING GONE WRONG!");
            res.end();
        }
    }
    else {
        try{
            fs.readFile('stronaHome/index.html', function(err, data) {
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.write(data);
            res.end();
            });
        }
        catch{
            console.log("ERR");
        }
    }
  });


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
            
            // console.log(obj);
            // console.log("type = %s",obj.type);
            // console.log("value = %s",obj.value);
            // obj.value = 4;
            // ws.send(JSON.stringify(obj));
        }
        catch{
            console.log("Not a JSOS!");
            console.log('received: %s', message);
            ws.send(`Hello, you sent -> ${message}`);
        }
        
    });

    //send immediatly a feedback to the incoming connection
    var x = DataFromDatabase(ws);
    //console.log(x);
    //ws.send(x);    
    //ws.send('Hi there, I am a WebSocket server');
});

//start our server
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
            // var temp = `{`;
            // temp += `"id" : ${row.id},\n`;
            // temp += `"type" : "${row.type}",\n`;
            // temp += `"value" : ${row.value}\n`;
            // temp += `}`;
            
            //console.log(result);
            //return result;
            try{
                temp = JSON.parse(temp);
                //console.log("OK!");
                result.push(temp);
                // return result;
                // obj.send(JSON.stringify(temp));
                // console.log("OK!");
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