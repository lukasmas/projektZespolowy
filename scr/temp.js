const sensor = require('ds18b20-raspi');

const tempC = sensor.readSimpleC(1);
console.log(`${tempC} degC`);