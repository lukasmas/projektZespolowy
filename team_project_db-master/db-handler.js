var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database("mainDB.db", err => {
    if (err)
        return console.log(err.message);
    console.log("Connected to DB");
});


function getDevices(fn) {
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



function deleteDevice(json, fn) {
    db.run(
        'DELETE FROM Devices WHERE id_device = ? AND title = ?',
        json["data"]["id_device"], json["data"]["title"], (err) => {
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


function createDevice(json, fn) {
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


function updateDevice(json, fn) {
    db.run(
        `UPDATE Devices SET type = ?, title=?, value=?, port=? 
        where id_device =?`,
        json["data"]["type"], json["data"]["title"],
        json["data"]["value"], json["data"]["port"],
        json["data"]["id_device"],
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
            return fn(json);
        });
}

function close() {
    db.close();
}

// exporting functions 
module.exports = {
    getDevices: getDevices,
    createDevice: createDevice,
    deleteDevice: deleteDevice,
    updateDevice: updateDevice,
    close: close
}

