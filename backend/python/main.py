import time
from datetime import datetime
import serial
import serial.tools.list_ports


def sendData(time):
    return (f"Az ido:;{current_time}\n").encode('utf-8')

ports = serial.tools.list_ports.comports()
serialInst = serial.Serial()

portList = []

for onePort in ports:
    portList.append(str(onePort))
    print(str(onePort))

val = input("select Port: COM")

for x in range(0, len(portList)):
    if portList[x].startswith("COM" + str(val)):
        portVar = "COM" + str(val)
        print(portList[x])

serialInst.baudrate = 9600
serialInst.port = portVar
serialInst.open()

while True:
    
    time.sleep(1)
    now = datetime.now()
    current_time = now.strftime("%H:%M:%S")
    serialInst.write(sendData(current_time))