# import serial

# port = serial.Serial("/dev/ttyS0", baudrate=115200, timeout=3.0)

# while True:
#     port.write("\r\nSay something:")
#     rcv = port.read(10)
#     port.write("\r\nYou sent:" + repr(rcv))
#     print(rcv)

import serial
from time import sleep

ser = serial.Serial ("/dev/ttyS0", 115200)    #Open port with baud rate
while True:
    received_data = ser.read()              #read serial port
    sleep(0.03)
    data_left = ser.inWaiting()             #check for remaining byte
    received_data += ser.read(data_left)
    print (received_data)                   #print received data
    ser.write(received_data) 