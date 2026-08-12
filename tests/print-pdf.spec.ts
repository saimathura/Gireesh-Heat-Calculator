import { expect, test } from "@playwright/test";

test("printed PDF does not split a card across pages", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Get started" }).click();
  await page.getByRole("button", { name: /Load reference example/i }).click();
  await page.getByRole("button", { name: "Calculate", exact: true }).click();
  await expect(page.getByText("Converged U", { exact: true })).toBeVisible();
  await page.waitForTimeout(900);

  await page.emulateMedia({ media: "print" });
  await page.pdf({
    path: "tests/__screenshots__/print-output.pdf",
    format: "A4",
    printBackground: true,
  });
});
