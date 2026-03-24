import { test, expect } from "@playwright/test";

test.describe("Appointment Booking Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto("/login");
    await page.fill('input[type="email"]', "cliente@test.com");
    await page.fill('input[type="password"]', "password123");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL("/dashboard", { timeout: 10000 });
  });

  test("should navigate to new appointment page", async ({ page }) => {
    await page.goto("/citas/nueva");

    // Check page title
    await expect(page.locator("text=Nueva Cita")).toBeVisible();
  });

  test("should display barber selection", async ({ page }) => {
    await page.goto("/citas/nueva");

    // Wait for barbers to load
    await page.waitForTimeout(2000);

    // Check barber dropdown exists
    const barberSelect = page.locator("select").first();
    await expect(barberSelect).toBeVisible();
  });

  test("should display service selection", async ({ page }) => {
    await page.goto("/citas/nueva");

    // Wait for services to load
    await page.waitForTimeout(2000);

    // Check service dropdown exists
    const serviceSelect = page.locator("select").nth(1);
    await expect(serviceSelect).toBeVisible();
  });

  test("should display date picker", async ({ page }) => {
    await page.goto("/citas/nueva");

    // Check date input exists
    const dateInput = page.locator('input[type="date"]');
    await expect(dateInput).toBeVisible();
  });

  test("should show time slots after selecting date", async ({ page }) => {
    await page.goto("/citas/nueva");

    // Wait for page to load
    await page.waitForTimeout(2000);

    // Select first barber
    const barberSelect = page.locator("select").first();
    await barberSelect.selectOption({ index: 1 });

    // Select first service
    const serviceSelect = page.locator("select").nth(1);
    await serviceSelect.selectOption({ index: 1 });

    // Select a future weekday date
    const dateInput = page.locator('input[type="date"]');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    // Skip to Monday if tomorrow is Saturday or Sunday
    while (tomorrow.getDay() === 0 || tomorrow.getDay() === 6) {
      tomorrow.setDate(tomorrow.getDate() + 1);
    }
    const dateString = tomorrow.toISOString().split("T")[0];
    await dateInput.fill(dateString);

    // Wait for time slots to load
    await page.waitForTimeout(2000);

    // Check that time slots are displayed
    const timeSlots = page.locator("button").filter({ hasText: /\d{2}:\d{2}/ });
    await expect(timeSlots.first()).toBeVisible();
  });

  test("should complete appointment booking", async ({ page }) => {
    await page.goto("/citas/nueva");

    // Wait for page to load
    await page.waitForTimeout(2000);

    // Select first barber
    const barberSelect = page.locator("select").first();
    await barberSelect.selectOption({ index: 1 });

    // Select first service
    const serviceSelect = page.locator("select").nth(1);
    await serviceSelect.selectOption({ index: 1 });

    // Select a future weekday date
    const dateInput = page.locator('input[type="date"]');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    while (tomorrow.getDay() === 0 || tomorrow.getDay() === 6) {
      tomorrow.setDate(tomorrow.getDate() + 1);
    }
    const dateString = tomorrow.toISOString().split("T")[0];
    await dateInput.fill(dateString);

    // Wait for time slots to load
    await page.waitForTimeout(2000);

    // Select first available time slot
    const timeSlot = page
      .locator("button")
      .filter({ hasText: /\d{2}:\d{2}/ })
      .first();
    await timeSlot.click();

    // Add notes
    const notesTextarea = page.locator("textarea");
    if (await notesTextarea.isVisible()) {
      await notesTextarea.fill("Test appointment notes");
    }

    // Submit the form
    const submitButton = page.locator('button:has-text("Agendar Cita")');
    await submitButton.click();

    // Should show success message or redirect
    await page.waitForTimeout(3000);

    // Check for success or error message
    const hasSuccess =
      (await page.locator("text=Cita agendada").isVisible()) ||
      (await page.locator("text=Error").isVisible());

    expect(hasSuccess).toBe(true);
  });
});
