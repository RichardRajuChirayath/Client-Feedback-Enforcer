const fs = require('fs');
require('dotenv').config();

const apiKey = process.env.BREVO_API_KEY;
if (!apiKey) {
    console.error("❌ No API Key found");
    process.exit(1);
}

console.log(`Checking API Key: ${apiKey.substring(0, 10)}... (Length: ${apiKey.length})`);

async function testKey() {
    try {
        const response = await fetch("https://api.brevo.com/v3/account", {
            method: "GET",
            headers: {
                "accept": "application/json",
                "api-key": apiKey
            }
        });

        const data = await response.json();

        if (response.ok) {
            console.log("✅ API Key is Valid!");
            console.log("Account Email:", data.email);
            console.log("Plan:", data.plan[0].type);
        } else {
            console.error("❌ API Key is Invalid");
            console.error("Status:", response.status);
            console.error("Error:", JSON.stringify(data, null, 2));
        }
    } catch (e) {
        console.error("❌ Network Error:", e.message);
    }
}

testKey();
