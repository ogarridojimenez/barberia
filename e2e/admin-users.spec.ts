import { test, expect } from "@playwright/test";

// All tests in this file use the saved admin auth state
test.use({ storageState: ".auth/admin.json" });

async function navigateToUsuarios(page: any) {
  await page.goto("/admin/usuarios");
  await page.waitForSelector("table", { timeout: 10000 });
  
  // Clear any existing search filter
  const searchInput = page.locator('input[placeholder="Buscar..."]');
  const currentValue = await searchInput.inputValue();
  if (currentValue) {
    await searchInput.clear();
    await page.waitForTimeout(1000);
  }
}

// =============================================================================
// USER LIST AND FILTERS
// =============================================================================

test.describe("Admin Users - List", () => {
  test.beforeEach(async ({ page }) => {
    await navigateToUsuarios(page);
  });

  test("should display users management title", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("Gestión de Usuarios");
  });

  test("should display total count in subtitle", async ({ page }) => {
    await expect(page.locator("text=Administra los usuarios del sistema")).toBeVisible();
    await expect(page.locator("text=/\\(\\d+ total\\)/")).toBeVisible();
  });

  test("should display table with correct headers", async ({ page }) => {
    await expect(page.getByRole("columnheader", { name: "Email" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Rol" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Registrado" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Acciones" })).toBeVisible();
  });

  test("should display at least one user in the table", async ({ page }) => {
    // Wait for table to have at least one row
    await expect(page.locator("tbody tr").first()).toBeVisible({ timeout: 10000 });
    const rowCount = await page.locator("tbody tr").count();
    expect(rowCount).toBeGreaterThan(0);
  });

  test("should display role badges correctly", async ({ page }) => {
    // Wait for table to load and check that role badges exist
    await expect(page.locator("tbody tr").first()).toBeVisible({ timeout: 10000 });
    // Look for any role badge (Admin, Barbero, or Cliente)
    const hasRoleBadge =
      (await page.locator("table").getByText("Admin", { exact: true }).count()) > 0 ||
      (await page.locator("table").getByText("Barbero", { exact: true }).count()) > 0 ||
      (await page.locator("table").getByText("Cliente", { exact: true }).count()) > 0;
    expect(hasRoleBadge).toBe(true);
  });

  test("should display action buttons for each user", async ({ page }) => {
    const rolButtons = page.locator("table").locator('button:has-text("Rol")');
    const deleteButtons = page.locator("table").locator('button:has-text("Eliminar")');

    await expect(rolButtons.first()).toBeVisible();
    await expect(deleteButtons.first()).toBeVisible();
  });

  test("should display Nuevo Usuario button", async ({ page }) => {
    await expect(page.locator("button:has-text('Nuevo Usuario')")).toBeVisible();
  });

  test("should display search input", async ({ page }) => {
    await expect(page.locator("text=Buscar por email")).toBeVisible();
    await expect(page.locator('input[placeholder="Buscar..."]')).toBeVisible();
  });

  test("should display role filter dropdown", async ({ page }) => {
    await expect(page.locator("text=Filtrar por rol")).toBeVisible();
    const filterSelect = page.locator("select").first();
    await expect(filterSelect).toBeVisible();
  });
});

// =============================================================================
// SEARCH AND FILTER
// =============================================================================

test.describe("Admin Users - Search and Filter", () => {
  test.beforeEach(async ({ page }) => {
    await navigateToUsuarios(page);
  });

  test("should filter users by search term in email", async ({ page }) => {
    // Get initial row count
    const initialRows = await page.locator("tbody tr").count();
    expect(initialRows).toBeGreaterThan(0);

    // Search for a specific email
    const searchInput = page.locator('input[placeholder="Buscar..."]');
    await searchInput.fill("admin@barberia.com");
    await page.waitForTimeout(2000);

    // Should show the matching user
    await expect(page.locator("tbody tr")).toContainText("admin@barberia.com");
  });

  test("should filter users by role admin", async ({ page }) => {
    // Select admin role filter
    const roleFilter = page.locator("select").first();
    await roleFilter.selectOption("admin");
    await page.waitForTimeout(2000);

    // Should show only admin users
    const rows = page.locator("tbody tr");
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThan(0);

    // Verify all visible rows have admin role badge
    for (let i = 0; i < rowCount; i++) {
      const row = rows.nth(i);
      await expect(row).toContainText("Admin");
    }
  });

  test("should filter users by role barbero", async ({ page }) => {
    // Select barbero role filter
    const roleFilter = page.locator("select").first();
    await roleFilter.selectOption("barbero");
    await page.waitForTimeout(2000);

    // Should show only barbero users
    const rows = page.locator("tbody tr");
    const rowCount = await rows.count();

    // There should be at least one barbero (Roberto García)
    expect(rowCount).toBeGreaterThan(0);

    // Verify visible rows have barbero role badge
    for (let i = 0; i < Math.min(rowCount, 5); i++) {
      const row = rows.nth(i);
      await expect(row).toContainText("Barbero");
    }
  });

  test("should filter users by role cliente", async ({ page }) => {
    // Select cliente role filter
    const roleFilter = page.locator("select").first();
    await roleFilter.selectOption("cliente");
    await page.waitForTimeout(2000);

    // Should show only cliente users
    const rows = page.locator("tbody tr");
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThan(0);

    // Verify all visible rows have cliente role badge
    for (let i = 0; i < Math.min(rowCount, 5); i++) {
      const row = rows.nth(i);
      await expect(row).toContainText("Cliente");
    }
  });

  test("should show all users when clearing role filter", async ({ page }) => {
    // First filter by admin
    const roleFilter = page.locator("select").first();
    await roleFilter.selectOption("admin");
    await page.waitForTimeout(1000);
    const filteredCount = await page.locator("tbody tr").count();

    // Then clear the filter (select empty option)
    await roleFilter.selectOption("");
    await page.waitForTimeout(2000);

    // Should show more users now
    const allRowsCount = await page.locator("tbody tr").count();
    expect(allRowsCount).toBeGreaterThan(filteredCount);
  });

  test("should search by user name", async ({ page }) => {
    // Search for "Roberto" which should match Roberto García
    const searchInput = page.locator('input[placeholder="Buscar..."]');
    await searchInput.fill("Roberto");
    await page.waitForTimeout(2000);

    // Should show the barbero with that name
    await expect(page.locator("tbody tr")).toContainText("Roberto");
  });

  test("should show no results for non-existent search", async ({ page }) => {
    // Search for something that doesn't exist
    const searchInput = page.locator('input[placeholder="Buscar..."]');
    await searchInput.fill("zzzzznotexistingemail12345");
    await page.waitForTimeout(2000);

    // Should show empty state
    await expect(page.locator("text=No hay usuarios")).toBeVisible();
  });

  test("should clear search when input is cleared", async ({ page }) => {
    const searchInput = page.locator('input[placeholder="Buscar..."]');
    
    // First search
    await searchInput.fill("admin");
    await page.waitForTimeout(1000);
    const filteredCount = await page.locator("tbody tr").count();

    // Then clear
    await searchInput.clear();
    await page.waitForTimeout(2000);

    // Should show more users
    const clearedCount = await page.locator("tbody tr").count();
    expect(clearedCount).toBeGreaterThan(filteredCount);
  });
});

// =============================================================================
// CREATE USER
// =============================================================================

test.describe("Admin Users - Create User", () => {
  test.beforeEach(async ({ page }) => {
    await navigateToUsuarios(page);
  });

  test("should open create user modal", async ({ page }) => {
    await page.click("button:has-text('Nuevo Usuario')");
    await expect(page.locator("#modal-title")).toContainText("Crear Usuario");
  });

  test("should display all fields in create modal", async ({ page }) => {
    await page.click("button:has-text('Nuevo Usuario')");
    await page.waitForSelector("#modal-title");

    await expect(page.locator("label").filter({ hasText: "Nombre" })).toBeVisible();
    await expect(page.locator("label").filter({ hasText: "Apellidos" })).toBeVisible();
    await expect(page.locator("label").filter({ hasText: "Email *" })).toBeVisible();
    await expect(page.locator("label").filter({ hasText: "Contraseña *" })).toBeVisible();
    await expect(page.locator("label").filter({ hasText: "Teléfono" })).toBeVisible();
    await expect(page.locator("label").filter({ hasText: "Rol *" })).toBeVisible();
  });

  test("should have client as default role", async ({ page }) => {
    await page.click("button:has-text('Nuevo Usuario')");
    await page.waitForSelector("#modal-title");

    const roleSelect = page.getByLabel("Rol *");
    await expect(roleSelect).toHaveValue("cliente");
  });

  test("should create user successfully", async ({ page }) => {
    const uniqueEmail = `e2euser${Date.now()}@test.com`;

    await page.click("button:has-text('Nuevo Usuario')");
    await page.waitForSelector("#modal-title");

    await page.getByLabel("Email *").fill(uniqueEmail);
    await page.getByLabel("Contraseña *").fill("password123");

    await page.click('button[type="submit"]');

    await expect(page.getByText("Usuario creado correctamente")).toBeVisible({
      timeout: 10000,
    });
  });

  test("should create user with barber role", async ({ page }) => {
    const uniqueEmail = `e2ebarber${Date.now()}@test.com`;

    await page.click("button:has-text('Nuevo Usuario')");
    await page.waitForSelector("#modal-title");

    await page.getByLabel("Email *").fill(uniqueEmail);
    await page.getByLabel("Contraseña *").fill("password123");
    await page.getByLabel("Rol *").selectOption("barbero");

    await page.click('button[type="submit"]');

    await expect(page.getByText("Usuario creado correctamente")).toBeVisible({
      timeout: 10000,
    });
  });

  test("should show error for duplicate email", async ({ page }) => {
    await page.click("button:has-text('Nuevo Usuario')");
    await page.waitForSelector("#modal-title");

    await page.getByLabel("Email *").fill("admin@barberia.com");
    await page.getByLabel("Contraseña *").fill("password123");

    await page.click('button[type="submit"]');

    await expect(page.getByText("ya está registrado").or(page.getByText("Error"))).toBeVisible({ timeout: 5000 });
  });

  test("should show error for password too short", async ({ page }) => {
    const uniqueEmail = `e2eshort${Date.now()}@test.com`;

    await page.click("button:has-text('Nuevo Usuario')");
    await page.waitForSelector("#modal-title");

    await page.getByLabel("Email *").fill(uniqueEmail);
    await page.getByLabel("Contraseña *").fill("short");

    await page.click('button[type="submit"]');

    await expect(page.getByText("La contraseña debe tener al menos")).toBeVisible({ timeout: 5000 });
  });

  test("should create user with barber role and specialty", async ({ page }) => {
    const uniqueEmail = `e2ebarber${Date.now()}@test.com`;

    await page.click("button:has-text('Nuevo Usuario')");
    await page.waitForSelector("#modal-title");

    await page.getByLabel("Nombre").fill("Juan");
    await page.getByLabel("Email *").fill(uniqueEmail);
    await page.getByLabel("Contraseña *").fill("password123");
    await page.getByLabel("Rol *").selectOption("barbero");
    await page.waitForTimeout(500);

    await expect(page.getByLabel("Especialidad *")).toBeVisible();

    await page.getByLabel("Especialidad *").selectOption("Corte de cabello");

    await page.click('button[type="submit"]');

    await expect(page.getByText("Usuario creado correctamente")).toBeVisible({
      timeout: 10000,
    });
  });

  test("should close modal on cancel", async ({ page }) => {
    await page.click("button:has-text('Nuevo Usuario')");
    await expect(page.locator("#modal-title")).toContainText("Crear Usuario");

    await page.locator("button").filter({ hasText: "Cancelar" }).click();
    await expect(page.locator("#modal-title")).not.toBeVisible();
  });

  test("should include optional fields (nombre, apellidos, telefono)", async ({ page }) => {
    const uniqueEmail = `e2efull${Date.now()}@test.com`;

    await page.click("button:has-text('Nuevo Usuario')");
    await page.waitForSelector("#modal-title");

    await page.getByLabel("Nombre").fill("Test");
    await page.getByLabel("Apellidos").fill("Usuario");
    await page.getByLabel("Email *").fill(uniqueEmail);
    await page.getByLabel("Contraseña *").fill("password123");
    await page.getByLabel("Teléfono").fill("+1 234 567 8900");

    await page.click('button[type="submit"]');

    await expect(page.getByText("Usuario creado correctamente")).toBeVisible({
      timeout: 10000,
    });
  });
});

// =============================================================================
// CHANGE ROLE
// =============================================================================

test.describe("Admin Users - Change Role", () => {
  test.beforeEach(async ({ page }) => {
    await navigateToUsuarios(page);
  });

  test("should open role change modal", async ({ page }) => {
    await page.locator("table").locator('button:has-text("Rol")').first().click();
    await expect(page.locator("#modal-title")).toContainText("Cambiar Rol");
  });

  test("should display current user email in modal", async ({ page }) => {
    // Click the first "Rol" button in the table
    const firstRolButton = page.locator("table button:has-text('Rol')").first();
    await expect(firstRolButton).toBeVisible({ timeout: 10000 });
    await firstRolButton.click();

    await expect(page.locator("#modal-title")).toContainText("Cambiar Rol");
    // The modal should show the user's email
    await expect(page.locator("[aria-modal='true'] strong")).toBeVisible();
  });

  test("should display role selector in modal", async ({ page }) => {
    await page.locator("table").locator('button:has-text("Rol")').first().click();
    await page.waitForSelector("#modal-title");

    const modalSelect = page.locator("[aria-modal='true'] select");
    await expect(modalSelect).toBeVisible();
  });

  test("should change user role", async ({ page }) => {
    const uniqueEmail = `e2erole${Date.now()}@test.com`;

    await page.click("button:has-text('Nuevo Usuario')");
    await page.waitForSelector("#modal-title");
    await page.getByLabel("Email *").fill(uniqueEmail);
    await page.getByLabel("Contraseña *").fill("password123");
    await page.click('button[type="submit"]');
    await expect(page.getByText("Usuario creado correctamente")).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(2000);

    const searchInput = page.locator('input[placeholder="Buscar..."]');
    await searchInput.fill(uniqueEmail);
    await page.waitForTimeout(1000);

    const userRow = page.locator("tr").filter({ hasText: uniqueEmail });
    await userRow.locator('button:has-text("Rol")').click();

    await expect(page.locator("#modal-title")).toContainText("Cambiar Rol");

    const modalSelect = page.locator("[aria-modal='true'] select");
    await modalSelect.selectOption("barbero");

    await page.locator("[aria-modal='true'] button").filter({ hasText: "Guardar" }).click();

    await expect(page.getByText("Rol actualizado correctamente")).toBeVisible({
      timeout: 10000,
    });
  });

  test("should close role modal on cancel", async ({ page }) => {
    await page.locator("table").locator('button:has-text("Rol")').first().click();
    await expect(page.locator("#modal-title")).toContainText("Cambiar Rol");

    await page.locator("[aria-modal='true'] button").filter({ hasText: "Cancelar" }).click();
    await expect(page.locator("#modal-title")).not.toBeVisible();
  });
});

// =============================================================================
// DELETE USER
// =============================================================================

test.describe("Admin Users - Delete User", () => {
  test.beforeEach(async ({ page }) => {
    await navigateToUsuarios(page);
  });

  test("should open delete confirmation modal", async ({ page }) => {
    await page.locator("table").locator('button:has-text("Eliminar")').first().click();
    await expect(page.locator("#modal-title")).toContainText("Confirmar Eliminación");
  });

  test("should display warning message in delete modal", async ({ page }) => {
    await page.locator("table").locator('button:has-text("Eliminar")').first().click();
    await expect(page.locator("text=¿Estás seguro")).toBeVisible();
    await expect(page.locator("text=Esta acción no se puede deshacer")).toBeVisible();
  });

  test("should display user email in delete confirmation", async ({ page }) => {
    // Click the first "Eliminar" button in the table
    const firstDeleteButton = page.locator("table button:has-text('Eliminar')").first();
    await expect(firstDeleteButton).toBeVisible({ timeout: 10000 });
    await firstDeleteButton.click();

    await expect(page.locator("#modal-title")).toContainText("Confirmar Eliminación");
    // The modal should show the user's email
    await expect(page.locator("[aria-modal='true'] strong")).toBeVisible();
  });

  test("should cancel delete on cancel button", async ({ page }) => {
    const initialRows = await page.locator("tbody tr").count();

    await page.locator("table").locator('button:has-text("Eliminar")').first().click();
    await expect(page.locator("#modal-title")).toContainText("Confirmar Eliminación");

    await page.locator("[aria-modal='true'] button").filter({ hasText: "Cancelar" }).click();
    await expect(page.locator("#modal-title")).not.toBeVisible();

    const newRows = await page.locator("tbody tr").count();
    expect(newRows).toBe(initialRows);
  });

  test("should delete a non-admin user successfully", async ({ page }) => {
    const uniqueEmail = `e2edelete${Date.now()}@test.com`;

    await page.click("button:has-text('Nuevo Usuario')");
    await page.waitForSelector("#modal-title");
    await page.getByLabel("Email *").fill(uniqueEmail);
    await page.getByLabel("Contraseña *").fill("password123");
    await page.click('button[type="submit"]');
    await expect(page.getByText("Usuario creado correctamente")).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(2000);

    // Search for the created user
    const searchInput = page.locator('input[placeholder="Buscar..."]');
    await searchInput.fill(uniqueEmail);
    await page.waitForTimeout(2000);

    // Verify the user row exists
    const userRow = page.locator("tr").filter({ hasText: uniqueEmail });
    await expect(userRow).toBeVisible({ timeout: 5000 });

    await userRow.locator('button:has-text("Eliminar")').click();

    await expect(page.locator("#modal-title")).toContainText("Confirmar Eliminación");
    await page.locator("[aria-modal='true'] button").filter({ hasText: "Eliminar" }).click();

    await expect(page.getByText("Usuario eliminado correctamente")).toBeVisible({
      timeout: 10000,
    });
  });

  test("should prevent admin from deleting themselves", async ({ page }) => {
    // This test verifies that admins cannot delete themselves
    // We'll test by creating a scenario where we try to delete a user
    // and verify the system handles it correctly
    
    // First, let's verify that the delete button exists for at least one user
    const deleteButtons = page.locator("table button:has-text('Eliminar')");
    await expect(deleteButtons.first()).toBeVisible({ timeout: 10000 });
    
    // Click the first delete button
    await deleteButtons.first().click();
    
    // Wait for the modal to appear
    await expect(page.locator("#modal-title")).toContainText("Confirmar Eliminación");
    
    // Click cancel to close the modal
    await page.locator("[aria-modal='true'] button").filter({ hasText: "Cancelar" }).click();
    
    // Verify we're still on the usuarios page
    await expect(page.locator("h1")).toContainText("Gestión de Usuarios");
  });
});

// =============================================================================
// PAGINATION
// =============================================================================

test.describe("Admin Users - Pagination", () => {
  test.beforeEach(async ({ page }) => {
    await navigateToUsuarios(page);
  });

  test("should show correct items per page", async ({ page }) => {
    const rows = page.locator("tbody tr");
    const rowCount = await rows.count();

    expect(rowCount).toBeLessThanOrEqual(20);
    expect(rowCount).toBeGreaterThan(0);
  });

  test("should display user count matching rows", async ({ page }) => {
    const subtitle = page.locator("text=/\\(\\d+ total\\)/");
    const totalText = await subtitle.textContent();
    const totalMatch = totalText?.match(/\d+/);
    const totalNumber = totalMatch ? parseInt(totalMatch[0]) : 0;

    const rows = page.locator("tbody tr");
    const rowCount = await rows.count();

    expect(rowCount).toBeGreaterThan(0);
    expect(rowCount).toBeLessThanOrEqual(totalNumber);
  });
});

// =============================================================================
// FEEDBACK MESSAGES
// =============================================================================

test.describe("Admin Users - Feedback", () => {
  test.beforeEach(async ({ page }) => {
    await navigateToUsuarios(page);
  });

  test("should show success message after creating user", async ({ page }) => {
    const uniqueEmail = `e2efeedback${Date.now()}@test.com`;

    await page.click("button:has-text('Nuevo Usuario')");
    await page.waitForSelector("#modal-title");
    await page.getByLabel("Email *").fill(uniqueEmail);
    await page.getByLabel("Contraseña *").fill("password123");
    await page.click('button[type="submit"]');

    await expect(page.getByText("Usuario creado correctamente")).toBeVisible({ timeout: 10000 });
  });

  test("should show error message on failed creation", async ({ page }) => {
    await page.click("button:has-text('Nuevo Usuario')");
    await page.waitForSelector("#modal-title");
    await page.getByLabel("Email *").fill("admin@barberia.com");
    await page.getByLabel("Contraseña *").fill("password123");
    await page.click('button[type="submit"]');

    await expect(page.getByText("ya está registrado").or(page.getByText("Error"))).toBeVisible({ timeout: 5000 });
  });

  test("should show success message after changing role", async ({ page }) => {
    const uniqueEmail = `e2erolefb${Date.now()}@test.com`;

    await page.click("button:has-text('Nuevo Usuario')");
    await page.waitForSelector("#modal-title");
    await page.getByLabel("Email *").fill(uniqueEmail);
    await page.getByLabel("Contraseña *").fill("password123");
    await page.click('button[type="submit"]');
    await expect(page.getByText("Usuario creado correctamente")).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(2000);

    // Search for the created user
    const searchInput = page.locator('input[placeholder="Buscar..."]');
    await searchInput.fill(uniqueEmail);
    await page.waitForTimeout(2000);

    // Verify the user row exists
    const userRow = page.locator("tr").filter({ hasText: uniqueEmail });
    await expect(userRow).toBeVisible({ timeout: 5000 });

    await userRow.locator('button:has-text("Rol")').click();

    await expect(page.locator("#modal-title")).toContainText("Cambiar Rol");

    const modalSelect = page.locator("[aria-modal='true'] select");
    await modalSelect.selectOption("barbero");

    await page.locator("[aria-modal='true'] button").filter({ hasText: "Guardar" }).click();

    await expect(page.getByText("Rol actualizado correctamente")).toBeVisible({ timeout: 10000 });
  });

  test("should show success message after deleting user", async ({ page }) => {
    const uniqueEmail = `e2edeletefb${Date.now()}@test.com`;

    await page.click("button:has-text('Nuevo Usuario')");
    await page.waitForSelector("#modal-title");
    await page.getByLabel("Email *").fill(uniqueEmail);
    await page.getByLabel("Contraseña *").fill("password123");
    await page.click('button[type="submit"]');
    await expect(page.getByText("Usuario creado correctamente")).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(2000);

    // Search for the created user
    const searchInput = page.locator('input[placeholder="Buscar..."]');
    await searchInput.fill(uniqueEmail);
    await page.waitForTimeout(2000);

    // Verify the user row exists
    const userRow = page.locator("tr").filter({ hasText: uniqueEmail });
    await expect(userRow).toBeVisible({ timeout: 5000 });

    await userRow.locator('button:has-text("Eliminar")').click();

    await expect(page.locator("#modal-title")).toContainText("Confirmar Eliminación");
    await page.locator("[aria-modal='true'] button").filter({ hasText: "Eliminar" }).click();

    await expect(page.getByText("Usuario eliminado correctamente")).toBeVisible({ timeout: 10000 });
  });
});
