var sqlite3 = require('sqlite3').verbose();
// var db = new sqlite3.Database("mainDB.db", err => {
//     if (err)
//         return console.log(err.message);
//     console.log("Connected to DB");
// });


function getDevices(db, fn) {
    db.each("SELECT * FROM Devices", (err, row) => {
        // if SQL gives error json is modified
        if (err) {
            var errorJson =
            {
                data: err.message,
                type: "ERROR"
            };
            return fn(errorJson);
        }
        return fn(row);
    });
};



function deleteDevice(db, json, fn) {
    db.run(
        'DELETE FROM Devices WHERE id = ? AND title = ?',
        json["data"]["id"], json["data"]["title"], (err) => {
            if (err) {
                var errorJson =
                {
                    data: err.message,
                    type: "ERROR"
                };
                return fn(errorJson);
            }
            console.log('Device deleted.');
            return fn(json);
        });
};


function createDevice(db, json, fn) {
    db.run(
        `INSERT INTO Devices (type, title, value, port)
        VALUES (?,?, ?, ?)`,
        json["data"]["type"], json["data"]["title"],
        json["data"]["value"], json["data"]["port"],
        (err) => {
            if (err) {
                var errorJson =
                {
                    data: err.message,
                    type: "ERROR"
                };
                return fn(errorJson);
            }
            console.log('Device added.');
            return fn(json);
        });
}


function updateDevice(db, json, fn) {
    db.run(
        `UPDATE Devices SET type = ?, title=?, value=?, port=? 
        where id =?`,
        json["data"]["type"], json["data"]["title"],
        json["data"]["value"], json["data"]["port"],
        json["data"]["id"],
        (err) => {
            if (err) {
                var errorJson =
                {
                    data: err.message,
                    type: "ERROR"
                };
                return fn(errorJson);
            }
            console.log('Device updated.');
            addLog(db, json["data"]["id_device"], `Device updated: new value: ` + json["data"]["value"]);
            return fn(json);
        });
}

function close(db) {
    db.close();
}
function addLog(db, id_device, value){
    db.run(
        `INSERT INTO Logs (time, value, id_device)
        VALUES ( datetime('now', '+2 hours'), ? , ?)`,
        value, id_device,
        (err) => {
            if (err) {
                console.log('Log DB error: ' + err);
                return;
            }
            console.log('Log added.');
        });
}



function getDeviceLogs(db, id_device, fn){
    db.each("SELECT * FROM Logs Where id_device = ?",id_device, (err, row) => {
        if(err){
            console.log("Log db error:"+ err);
            return
        }
        return fn(row);
    });
};

function getAllLogs(db, fn){
    db.each("SELECT * FROM Logs", (err, row) => {
        if(err){
            console.log("Log db error:"+ err);
            return;
        }
        return fn(row);
    });
};

// exporting functions 
module.exports = {
    getDevices: getDevices,
    createDevice: createDevice,
    deleteDevice: deleteDevice,
    updateDevice: updateDevice,
    addLog:addLog,
    getDeviceLogs:getDeviceLogs,
    getAllLogs:getAllLogs,
    close: close
}

