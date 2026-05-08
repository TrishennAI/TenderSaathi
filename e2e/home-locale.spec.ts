import { expect, test, type Page } from "@playwright/test";

async function expectStepHeadingsVisible(page: Page, titles: [string, string, string]) {
  for (const title of titles) {
    const h = page.getByRole("heading", { name: title });
    await h.scrollIntoViewIfNeeded();
    await expect(h).toBeInViewport({ ratio: 0.25 });
    await expect(h).toBeVisible();
    const opacity = await h.evaluate((el) => {
      let n: HTMLElement | null = el;
      while (n) {
        const o = parseFloat(getComputedStyle(n).opacity);
        if (o < 0.99) return o;
        n = n.parentElement;
      }
      return 1;
    });
    expect(opacity).toBeGreaterThanOrEqual(0.99);
  }
}

test.describe("Home landing", () => {
  test("step cards stay in view (not only below the fold) after locale change", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    // Typical phone height — long Hindi hero used to push #steps entirely off first screen
    await page.setViewportSize({ width: 390, height: 844 });

    await page.goto("/");

    await expect(page.getByRole("link", { name: /scroll down|स्क्रॉल/i })).toBeVisible();

    await expect(page.getByRole("heading", { level: 1 })).toContainText(/tender/i);
    await expectStepHeadingsVisible(page, [
      "Sign up in minutes",
      "Agent picks it up",
      "Track every milestone",
    ]);

    await page.getByRole("button", { name: "हिंदी" }).click();
    await expect(page.getByRole("heading", { level: 1 })).toContainText("टेंडर");

    await expectStepHeadingsVisible(page, [
      "मिनटों में साइन अप",
      "एजेंट संभालता है",
      "हर मील का पत्थर देखें",
    ]);

    await expect(page.locator("main .landing-card")).toHaveCount(3);
    const firstCard = page.locator("main .landing-card").first();
    await firstCard.scrollIntoViewIfNeeded();
    await expect(firstCard).toBeInViewport({ ratio: 0.2 });
    await expect
      .poll(async () => parseFloat(await firstCard.evaluate((el) => getComputedStyle(el).opacity)))
      .toBeGreaterThanOrEqual(0.99);

    await page.getByRole("button", { name: "English" }).click();
    await expect(page.getByRole("heading", { level: 1 })).toContainText("tender");
    await expectStepHeadingsVisible(page, [
      "Sign up in minutes",
      "Agent picks it up",
      "Track every milestone",
    ]);
  });
});
