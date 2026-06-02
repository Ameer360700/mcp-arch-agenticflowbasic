import db from './db.js';

/**
 * Handles standard data extraction operations via SELECT.
 */
export function handleSelect(query) {
    return new Promise((resolve) => {
        db.all(query, [], (err, rows) => {
            if (err) {
                return resolve(`Database Engine Syntax Error: ${err.message}`);
            }
            if (rows.length === 0) {
                return resolve("Query executed successfully, but returned zero matches.");
            }
            return resolve(JSON.stringify(rows));
        });
    });
}

/**
 * Directly views the structural SQL statement used to build a specific table.
 */
export function handleViewSchema(tableName) {
    return new Promise((resolve) => {
        const query = `SELECT sql FROM sqlite_master WHERE type='table' AND name = ?`;
        
        db.get(query, [tableName], (err, row) => {
            if (err) {
                return resolve(`Schema Discovery Error: ${err.message}`);
            }
            if (!row) {
                return resolve(`Target mapping failure: Table '${tableName}' does not exist.`);
            }
            return resolve(`Master Schema for Table [${tableName}]:\n${row.sql}`);
        });
    });
}