import { handleSelect, handleViewSchema } from '../helpers/read.handlers.js';

export default {
    name: "read_database",
    category: "database",
    description: "Queries information from the corporate sales database. For data extraction queries, provide a complete 'SELECT' query. To look up table structures or column configurations, pass the raw table name into the 'view_table_schema' parameter. Target tables available: products, customers, sales_reps, promotions, sales_records.",
    params: { 
        query: "string?", 
        view_table_schema: "string?" 
    },
    
    handler: async ({ query, view_table_schema }) => {
        // Route 1: The model wants to inspect column/table architecture layouts
        if (view_table_schema) {
            return await handleViewSchema(view_table_schema.trim());
        }
        
        // Route 2: The model wants to pull active dataset items
        if (query) {
            const cleanQuery = query.trim();
            const upper = cleanQuery.toUpperCase();
            
            if (!upper.startsWith('SELECT') && !upper.startsWith('PRAGMA')) {
                return "Routing Refusal: This tool is strictly reserved for data extraction (SELECT) requests.";
            }
            return await handleSelect(cleanQuery);
        }
        
        return "Operational Exception: Missing parameters. Provide either a valid 'query' or 'view_table_schema'.";
    }
};