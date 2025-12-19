require('dotenv').config({ path: '.env.local' });
console.log("Hello from test script");
console.log("MONGO_URI starts with:", process.env.MONGO_URI ? process.env.MONGO_URI.substring(0, 5) : "UNDEFINED");
