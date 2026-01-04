import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, "./.env");

if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
  console.log("✅ Environment variables loaded from:", envPath);
} else {
  console.error("❌ Environment file NOT found at:", envPath);
}
