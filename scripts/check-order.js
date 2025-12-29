const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

async function main() {
  try {
    console.log("Starting script...");
    console.log("__dirname:", __dirname);

    // Manual env parsing
    let uri = process.env.MONGO_URI;
    if (!uri) {
      try {
        const envPath = path.resolve(__dirname, "../.env.local");
        console.log("Checking path:", envPath);

        if (fs.existsSync(envPath)) {
          console.log("File exists.");
          const content = fs.readFileSync(envPath, "utf8");
          // Simple parse
          const lines = content.split("\n");
          for (const line of lines) {
            if (line.trim().startsWith("MONGO_URI=")) {
              const parts = line.split("=");
              parts.shift(); // remove key
              // Rejoin the rest in case URI has =
              let val = parts.join("=").trim();
              // Remove quotes
              if (
                (val.startsWith('"') && val.endsWith('"')) ||
                (val.startsWith("'") && val.endsWith("'"))
              ) {
                val = val.slice(1, -1);
              }
              uri = val;
              console.log("Found URI (length):", uri.length);
              break;
            }
          }
        } else {
          console.log("File DOES NOT exist.");
        }
      } catch (e) {
        console.log("Could not read .env.local", e);
      }
    }

    if (!uri) {
      console.error("No MONGO_URI found.");
      return;
    }

    await mongoose.connect(uri);
    console.log("Connected to MongoDB.");

    // Access collection directly to bypass Schema checks
    const collection = mongoose.connection.collection("orders");
    const latestOrder = await collection.findOne(
      {},
      { sort: { createdAt: -1 } }
    );

    if (latestOrder) {
      console.log("--------------------------------");
      console.log("LATEST ORDER ID:", latestOrder._id);
      console.log("CreatedAt:", latestOrder.createdAt);
      console.log("User Name: '" + (latestOrder.userName || "MISSING") + "'");
      console.log("Address: '" + (latestOrder.address || "MISSING") + "'");
      console.log("Room: '" + (latestOrder.roomNumber || "MISSING") + "'");
      console.log("Phone: '" + (latestOrder.userPhone || "MISSING") + "'");
    } else {
      console.log("No orders found in 'orders' collection.");
    }
  } catch (error) {
    console.error("Script Error:", error);
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    console.log("Done.");
  }
}

main();
