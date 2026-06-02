import { handleMutation } from '../helpers/write.handlers.js';

export default {
    name: "write_database",
    category: "database",
    description: "Modifies database entries. Use this tool only when executing transaction operations such as creating new rows (INSERT), updating existing properties (UPDATE), or removing entries (DELETE).",
    params: { 
        query: "string" 
    },
    
    handler: async ({ query }) => {
        const cleanQuery = query.trim();
        
        if (cleanQuery.toUpperCase().startsWith('SELECT')) {
            return "Routing Refusal: Data viewing requests belong exclusively to the 'read_database' tool interface.";
        }
        
        return await handleMutation(cleanQuery);
    }
};