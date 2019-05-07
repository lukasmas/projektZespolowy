const raspi = require('raspi');
const Serial = require('raspi-serial').Serial;
 
let slowo = ""

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
            process.stdout.write(slowo + " ");
            slowo = "";
            serial.write("OK");
        }
    //   console.log(data);
    });
    serial.write('Hello from raspi-serial');
  });
});
