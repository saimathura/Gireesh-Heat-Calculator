import { expect, test } from "@playwright/test";

test("loads reference example, calculates, toggles hi method, and prints without console errors", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  page.on("pageerror", (err) => errors.push(err.message));

  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /Shell & Tube Heat Exchanger Calculator/i }),
  ).toBeVisible();

  await page
    .getByRole("button", { name: /Load reference example/i })
    .click();

  await page.getByRole("button", { name: "Calculate", exact: true }).click();

  await expect(page.getByText("Converged U", { exact: true })).toBeVisible();
  await expect(page.getByText(/Design OK|Review required/)).toBeVisible();

  const initialU = await page
    .getByText("Converged U", { exact: true })
    .locator("..")
    .locator("span.tabular-nums")
    .first()
    .textContent();

  // Toggle hi selection mode and confirm the result panel updates.
  await page.getByText("Method A", { exact: true }).click();
  await expect(page.getByText("selected — pinned")).toBeVisible();

  await page.getByText("Method B", { exact: true }).click();
  await expect(page.getByText("selected — pinned")).toBeVisible();

  await page.getByText("Conservative (auto)", { exact: true }).click();

  await page.screenshot({ path: "tests/__screenshots__/results.png", fullPage: true });

  expect(initialU).toBeTruthy();

  const criticalErrors = errors.filter(
    (e) => !e.includes("Download the React DevTools"),
  );
  expect(criticalErrors).toEqual([]);
});
