const fs = require('fs');
require('dotenv').config();
fs.writeFileSync('temp_url.txt', process.env.DATABASE_URL);
