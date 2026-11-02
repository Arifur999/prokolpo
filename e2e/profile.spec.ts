import { expect, test, type Page } from "@playwright/test";

const API = process.env.E2E_API_URL ?? "http://localhost:5000/api/v1";

const randomPhone = () => `017${String(Math.floor(Math.random() * 1e8)).padStart(8, "0")}`;

const signUpAndOpenProfile = async (page: Page) => {
  const phone = randomPhone();
  const response = await fetch(`${API}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ firstName: "তানিয়া", lastName: "রহমান", email: "", phone, password: "tania2026", acceptTerms: true }),
  });
  expect(response.status).toBe(201);
  await page.goto("/login");
  await page.locator("#login-id").fill(phone);
  await page.locator("#login-pass").fill("tania2026");
  await page.getByRole("button", { name: "লগইন করুন" }).click();
  await expect(page).toHaveURL(/\/dashboard/);
  await page.goto("/profile");
  await expect(page.getByRole("heading", { name: "প্রোফাইল ও অ্যাকাউন্ট", level: 1 })).toBeVisible();
  return phone;
};

test("the profile saves new details and the header shows them", async ({ page }) => {
  await signUpAndOpenProfile(page);
  await page.locator("#pf-co").fill("রহমান ট্রেডার্স");
  await page.getByRole("button", { name: "তথ্য সেভ করুন" }).click();
  await expect(page.getByText("আপনার তথ্য সেভ হয়েছে")).toBeVisible();
  await expect(page.getByText("সব সেভ করা আছে")).toBeVisible();
  await expect(page.locator("header").getByText("রহমান ট্রেডার্স")).toBeVisible();
});

test("changing the password keeps this device signed in and the new password works", async ({ page }) => {
  const phone = await signUpAndOpenProfile(page);
  await page.locator("#pw-cur").fill("tania2026");
  await page.locator("#pw-new").fill("tania2027");
  await page.locator("#pw-again").fill("tania2027");
  await page.getByRole("button", { name: "পাসওয়ার্ড বদলান" }).last().click();
  await expect(page.getByText("পাসওয়ার্ড বদলেছে — অন্য সব ডিভাইস থেকে লগআউট হয়েছে")).toBeVisible();

  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/dashboard/);

  const login = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier: phone, password: "tania2027", remember: false }),
  });
  expect(login.status).toBe(200);
});
