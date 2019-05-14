// module for using DB functions
var dbHandler = require('./db-handler');

// types enum
const type = {
    UPDATE_DEVICE: 'UPDATE_DEVICE',
    CREATE_DEVICE: 'CREATE_DEVICE',
    FETCH_DEVICES: 'FETCH_DEVICES',
    DELETE_DEVICE: 'DELETE_DEVICE',
    ERROR: 'ERROR'
};

// Example data
var exRequestData =
{
    data:
    {
        id_device: 2,
        type: 'in',
        title: 'diode_2',
        value: 0.001,
        port: 69
    },
    type: type.UPDATE_DEVICE
};

// switch for handling all types
switch (exRequestData["type"]) {
    case type.UPDATE_DEVICE:
        // function takes json with data.
        // returning it in callback when there's no error
        dbHandler.updateDevice(exRequestData, (json) => {
            console.log(json);
        });
        break;
    case type.CREATE_DEVICE:
        dbHandler.createDevice(exRequestData, (json) => {
            console.log(json);
        });
        break;
    case type.FETCH_DEVICES:
        dbHandler.getDevices((json) => {
            console.log(json);
        });
        break;
    case type.DELETE_DEVICE:
        dbHandler.deleteDevice(exRequestData, (json) => {
            console.log(json);
        });
        break;
    case type.ERROR:
        console.log("ERROR type json");
        break;
    default:
        console.log("Incorrect json type");
}


dbHandler.close();
