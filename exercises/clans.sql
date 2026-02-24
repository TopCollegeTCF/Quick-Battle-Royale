CREATE TABLE Clans (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     name TEXT NOT NULL,
     trophies INTEGER DEFAULT 0,
     max_members INTEGER DEFAULT 50
 );

INSERT INTO Clans (name, trophies) VALUES 
     ('Русские Викинги', 15000),
     ('Красные Драконы', 12000);
