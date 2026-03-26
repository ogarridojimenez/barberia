import { chromium, FullConfig } from "@playwright/test";
import path from "path";
import fs from "fs";

const AUTH_DIR = path.join(__dirname, "../.auth");
const AUTH_FILE = path.join(AUTH_DIR, "admin.json");

async function globalSetup(config: FullConfig) {
  // Create auth directory if it doesn't exist
  if (!fs.existsSync(AUTH_DIR)) {
    fs.mkdirSync(AUTH_DIR, { recursive: true });
  }

  // Skip if we already have a valid auth file
  if (fs.existsSync(AUTH_FILE)) {
    console.log("Using existing auth state");
    return;
  }

  const { baseURL } = config.projects[0].use;
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log("Logging in as admin...");

  // Navigate to login page
  await page.goto(`${baseURL}/login`);

  // Fill login form
  await page.fill('input[type="email"]', "admin@barberia.com");
  await page.fill('input[type="password"]', "admin123");

  // Submit form
  await page.click('button[type="submit"]');

  // Wait for redirect to admin
  await page.waitForURL("**/admin", { timeout: 15000 });

  console.log("Login successful, saving auth state...");

  // Save the authentication state
  await context.storageState({ path: AUTH_FILE });

  await browser.close();

  console.log("Global setup complete");
}

export default globalSetup;
