import db from './db.js';

/**
 * Executes mutation queries (INSERT, UPDATE, DELETE) against active rows.
 */
export function handleMutation(query) {
    return new Promise((resolve) => {
        const upperQuery = query.trim().toUpperCase();
        
        // Centralized Destructive Command Firewall
        if (upperQuery.includes('DROP') || upperQuery.includes('TRUNCATE')) {
            return resolve("Security Violation: Destructive schema modifications (DROP/TRUNCATE) are strictly prohibited.");
        }

        db.run(query, [], function (err) {
            if (err) {
                return resolve(`Database Write Mutation Error: ${err.message}`);
            }
            return resolve(`Success: Transaction completed. Total database rows affected: ${this.changes}`);
        });
    });
}