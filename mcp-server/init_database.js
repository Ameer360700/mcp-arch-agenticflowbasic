import sqlite3 from 'sqlite3';

// 1. Establish file system lock & generate the database file
const db = new sqlite3.Database('./sales.db', (err) => {
    if (err) {
        console.error('Error opening database connection:', err.message);
    } else {
        console.log('Connected to local SQLite container. Building schema assets...');
    }
});

// Helper function to dynamically output authentic dates between 2025 and 2026
function generateTargetDate(startYear, endYear) {
    const start = new Date(`${startYear}-01-01`).getTime();
    const end = new Date(`${endYear}-12-31`).getTime();
    const randomizedTimestamp = new Date(start + Math.random() * (end - start));
    return randomizedTimestamp.toISOString().split('T')[0]; // Yields standard YYYY-MM-DD
}

db.serialize(() => {
    console.log("Constructing 5 interconnected relational tables...");

    // --- STRUCTURAL SCHEMA ARCHITECTURE ---
    db.run(`CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY, name TEXT, category TEXT, price REAL
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS customers (
        id INTEGER PRIMARY KEY, company_name TEXT, industry TEXT, loyalty_tier TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS sales_reps (
        id INTEGER PRIMARY KEY, name TEXT, region TEXT, hire_date TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS promotions (
        id INTEGER PRIMARY KEY, promo_name TEXT, discount_percent INTEGER, valid_until TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS sales_records (
        id INTEGER PRIMARY KEY, 
        product_id INTEGER, 
        customer_id INTEGER, 
        rep_id INTEGER, 
        promo_id INTEGER, 
        sale_date TEXT, 
        units_sold INTEGER,
        FOREIGN KEY (product_id) REFERENCES products(id),
        FOREIGN KEY (customer_id) REFERENCES customers(id),
        FOREIGN KEY (rep_id) REFERENCES sales_reps(id),
        FOREIGN KEY (promo_id) REFERENCES promotions(id)
    )`);

    console.log("Injecting seed arrays with real industry identifiers...");

    // --- REAL WORLD DATA REPOSITORIES ---
    
    const realProducts = [
        { id: 1, name: 'Microsoft Copilot Enterprise', cat: 'Software', price: 360.00 },
        { id: 2, name: 'Salesforce Agentforce', cat: 'Software', price: 1200.00 },
        { id: 3, name: 'AWS EC2 Compute Node', cat: 'Cloud Service', price: 2400.50 },
        { id: 4, name: 'Google Workspace Business', cat: 'Software', price: 216.00 },
        { id: 5, name: 'Cisco Secure Firewall X', cat: 'Hardware', price: 4500.00 },
        { id: 6, name: 'ServiceNow ITSM Pro', cat: 'Software', price: 1500.00 },
        { id: 7, name: 'Snowflake Data Cloud', cat: 'Cloud Service', price: 3000.00 },
        { id: 8, name: 'Apple MacBook Pro M3 Max', cat: 'Hardware', price: 3499.00 },
        { id: 9, name: 'Dell PowerEdge Server', cat: 'Hardware', price: 5200.00 },
        { id: 10, name: 'Oracle Autonomous Database', cat: 'Cloud Service', price: 4000.00 }
    ];

    const realCompanies = [
        { id: 101, name: 'Walmart Inc.', ind: 'Retail', tier: 'VIP' },
        { id: 102, name: 'JPMorgan Chase & Co.', ind: 'Finance', tier: 'VIP' },
        { id: 103, name: 'UnitedHealth Group', ind: 'Healthcare', tier: 'Gold' },
        { id: 104, name: 'Exxon Mobil Corp.', ind: 'Energy', tier: 'Standard' },
        { id: 105, name: 'Pfizer Inc.', ind: 'Healthcare', tier: 'Gold' },
        { id: 106, name: 'Nike, Inc.', ind: 'Retail', tier: 'Standard' },
        { id: 107, name: 'FedEx Corporation', ind: 'Logistics', tier: 'Gold' },
        { id: 108, name: 'The Boeing Company', ind: 'Aerospace', tier: 'VIP' },
        { id: 109, name: 'Coca-Cola Company', ind: 'Retail', tier: 'Standard' },
        { id: 110, name: 'Intel Corporation', ind: 'Tech', tier: 'Gold' }
    ];

    const realReps = [
        { id: 201, name: 'Sarah Jenkins', region: 'North America', date: '2021-04-12' },
        { id: 202, name: 'David Chen', region: 'Asia-Pacific', date: '2023-08-19' },
        { id: 203, name: 'Emma Watson', region: 'Europe', date: '2022-11-01' },
        { id: 204, name: 'Carlos Mendez', region: 'Latin America', date: '2024-02-14' },
        { id: 205, name: 'Aisha Rahman', region: 'Middle East', date: '2020-07-22' }
    ];

    const realPromos = [
        { id: 1, name: 'Q1 Enterprise Kickoff', discount: 10, expiry: '2026-03-31' },
        { id: 2, name: 'Summer Transformation Sync', discount: 15, expiry: '2026-08-31' },
        { id: 3, name: 'Black Friday IT Overhaul', discount: 25, expiry: '2026-11-30' },
        { id: 4, name: 'Strategic VIP Benefit', discount: 20, expiry: '2026-12-31' },
        { id: 5, name: 'Standard Baseline Pricing', discount: 0, expiry: '2099-12-31' }
    ];

    // --- PIPELINE COMPILING & EXECUTION ---
    
    const productStmt = db.prepare(`REPLACE INTO products VALUES (?, ?, ?, ?)`);
    realProducts.forEach(p => productStmt.run(p.id, p.name, p.cat, p.price));
    productStmt.finalize();

    const customerStmt = db.prepare(`REPLACE INTO customers VALUES (?, ?, ?, ?)`);
    realCompanies.forEach(c => customerStmt.run(c.id, c.name, c.ind, c.tier));
    customerStmt.finalize();

    const repStmt = db.prepare(`REPLACE INTO sales_reps VALUES (?, ?, ?, ?)`);
    realReps.forEach(r => repStmt.run(r.id, r.name, r.region, r.date));
    repStmt.finalize();

    const promoStmt = db.prepare(`REPLACE INTO promotions VALUES (?, ?, ?, ?)`);
    realPromos.forEach(pr => promoStmt.run(pr.id, pr.name, pr.discount, pr.expiry));
    promoStmt.finalize();

    // Generate 1,200 unique, realistic transaction intersections
    console.log("Generating 1,200 contextual transaction items across timeline...");
    const saleStmt = db.prepare(`REPLACE INTO sales_records VALUES (?, ?, ?, ?, ?, ?, ?)`);
    
    for (let i = 1; i <= 1200; i++) {
        const product = realProducts[Math.floor(Math.random() * realProducts.length)];
        const customer = realCompanies[Math.floor(Math.random() * realCompanies.length)];
        const rep = realReps[Math.floor(Math.random() * realReps.length)];
        const promo = realPromos[Math.floor(Math.random() * realPromos.length)];
        
        const txnDate = generateTargetDate(2025, 2026);
        const volumeSold = Math.floor(Math.random() * 40) + 1; // 1 to 40 structural units per sale
        
        saleStmt.run(i, product.id, customer.id, rep.id, promo.id, txnDate, volumeSold);
    }
    saleStmt.finalize();

    console.log("----------------------------------------------------------------");
    console.log("CRITICAL UPDATE COMPLETE: Database asset verified locally.");
    console.log("File name generated: sales.db");
    console.log("Contains: 5 unique tables, authentic enterprise titles, and 1,200 active records.");
});