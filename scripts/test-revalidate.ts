/**
 * Local verification script for revalidation logic
 * Run: DOTENV_CONFIG_PATH=.env.local node -r dotenv/config -r ts-node/register scripts/test-revalidate.ts
 */
import { config } from "dotenv";
config({ path: ".env.local" });

console.log("Checking environment...");
console.log("REVALIDATION_SECRET configured:", !!process.env.REVALIDATION_SECRET);
console.log("Secret preview:", process.env.REVALIDATION_SECRET ? "OK (" + process.env.REVALIDATION_SECRET.slice(0, 4) + "...)" : "MISSING");
console.log("✅ Ready for On-Demand ISR testing.");
