DROP TABLE Logs;
DROP TABLE Devices;

-- Insertion examples

INSERT INTO Devices (type, title, value, port)
VALUES ('out','diode_1', "0", "5");

INSERT INTO Logs(time, value, id_device)
VALUES(datetime('now', '+2 hours'),'201: Working fine, no worries', 3);


---------------------------------------------------

CREATE TABLE "Devices" (
	"id_device"	INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
	"type"	TEXT NOT NULL,
	"title"	TEXT NOT NULL UNIQUE,
	"value"	REAL,
	"port"	INTEGER
);

CREATE TABLE "Logs" (
	"id_log"	INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
	"time"	TEXT,
	"value"	BLOB,
	"id_device"	INTEGER,
    CONSTRAINT Logs_Devices FOREIGN KEY (id_device)
	REFERENCES Devices(id_device)
);

SELECT * from Devices inner join Logs;