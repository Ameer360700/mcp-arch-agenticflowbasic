import sqlite3 from 'sqlite3';

// Establish a central, shared SQLite database stream in read-write mode
const db = new sqlite3.Database('./sales.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.error("Database Core Connection failed to bind:", err.message);
    } else {
        console.log("Core Database Connection successfully active [READWRITE].");
    }
});

export default db;