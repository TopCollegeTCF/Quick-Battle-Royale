CREATE TABLE chests (
 id INteger PRIMARY KEY AUTOINCREMENT,
 name text, 
 items integer,
 rare integer DEFAULT 1,
 default_item text,
 id_image integer
 
);
