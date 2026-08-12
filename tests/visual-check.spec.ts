import { expect, test } from "@playwright/test";

test("intro hero renders", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("button", { name: "Get started" })).toBeVisible();
  await page.waitForTimeout(900);
  await page.screenshot({ path: "tests/__screenshots__/intro-hero.png", fullPage: true });
});

test("manual theme toggle overrides OS preference, and print stays light regardless", async ({
  page,
}) => {
  // OS says light, but we'll manually select Dark via the new toggle button
  // to prove the override actually works, not just OS-driven prefers-color-scheme.
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/");
  await page.getByRole("button", { name: "Get started" }).click();

  await page.getByRole("button", { name: "Dark" }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);

  await page.getByRole("button", { name: /Load reference example/i }).click();
  await page.getByRole("button", { name: "Calculate", exact: true }).click();
  await expect(page.getByText("Converged U", { exact: true })).toBeVisible();
  await page.waitForTimeout(900);
  await page.screenshot({ path: "tests/__screenshots__/dark-mode.png", fullPage: true });

  // Switching back to Light should remove the override.
  await page.getByRole("button", { name: "Light" }).click();
  await expect(page.locator("html")).not.toHaveClass(/dark/);

  // Print should force the light palette even while manually on Dark.
  await page.getByRole("button", { name: "Dark" }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await page.emulateMedia({ media: "print" });
  await page.screenshot({ path: "tests/__screenshots__/print-view.png", fullPage: true });
});
