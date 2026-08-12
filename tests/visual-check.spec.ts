import { expect, test } from "@playwright/test";

test("dark mode and print view render cleanly", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/");
  await page.getByRole("button", { name: /Load reference example/i }).click();
  await page.getByRole("button", { name: "Calculate", exact: true }).click();
  await expect(page.getByText("Converged U", { exact: true })).toBeVisible();
  await page.screenshot({ path: "tests/__screenshots__/dark-mode.png", fullPage: true });

  // Print should force the light palette even while OS dark mode is on.
  await page.emulateMedia({ colorScheme: "dark", media: "print" });
  await page.screenshot({ path: "tests/__screenshots__/print-view.png", fullPage: true });
});
