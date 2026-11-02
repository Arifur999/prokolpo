import { expect, test, type BrowserContext } from "@playwright/test";

const API = process.env.E2E_API_URL ?? "http://localhost:5000/api/v1";

const randomPhone = () => `019${String(Math.floor(Math.random() * 1e8)).padStart(8, "0")}`;

type Json = Record<string, unknown>;

const call = async <T>(method: string, path: string, body?: Json, token?: string): Promise<T> => {
  const response = await fetch(API + path, {
    method,
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = (await response.json()) as { data: T };
  return json.data;
};

// A signed-in owner with one building project.
const setUp = async (context: BrowserContext, baseURL: string) => {
  const session = await call<{ accessToken: string; refreshToken: string }>("POST", "/auth/register", {
    firstName: "আব্দুল",
    lastName: "করিম",
    email: "",
    phone: randomPhone(),
    password: "karim2026",
    acceptTerms: true,
  });
  await context.addCookies([
    { name: "accessToken", value: session.accessToken, url: baseURL },
    { name: "refreshToken", value: session.refreshToken, url: baseURL },
  ]);
  const project = await call<{ id: string }>(
    "POST",
    "/projects",
    {
      name: "মিরপুর ভবন",
      kind: "BUILDING",
      ownership: "PERSONAL",
      location: "",
      description: "",
      startDate: "2026-01-15",
      budget: 1000000,
      farmType: "",
      landUnit: "",
      businessType: "",
      categories: ["রড", "সিমেন্ট"],
      phases: ["ফাউন্ডেশন"],
    },
    session.accessToken,
  );
  return project.id;
};

test("the owner renames the project and hides a head from the expense form", async ({ page, context, baseURL }) => {
  const projectId = await setUp(context, baseURL ?? "http://localhost:3200");

  await page.goto(`/projects/${projectId}/settings`);
  await expect(page.getByRole("heading", { name: "প্রজেক্ট সেটিংস", level: 1 })).toBeVisible();
  await page.locator("#st-name").fill("মিরপুর ৬ তলা ভবন");
  await page.getByRole("button", { name: "বদল সেভ করুন" }).click();
  await expect(page.getByText("প্রজেক্টের তথ্য সেভ হয়েছে")).toBeVisible();

  await page.getByRole("button", { name: /খরচের খাত/ }).click();
  await expect(page).toHaveURL(/tab=categories/);
  await page.getByRole("button", { name: "সিমেন্ট লুকান" }).click();
  await expect(page.getByText("সিমেন্ট লুকানো হলো")).toBeVisible();

  await page.goto(`/projects/${projectId}/expenses/new`);
  await expect(page.getByRole("radiogroup").getByText("রড")).toBeVisible();
  await expect(page.getByRole("radiogroup").getByText("সিমেন্ট")).toHaveCount(0);
});

test("a new receipt prefix shows in the preview and is saved", async ({ page, context, baseURL }) => {
  const projectId = await setUp(context, baseURL ?? "http://localhost:3200");

  await page.goto(`/projects/${projectId}/settings?tab=receipt`);
  await page.locator("#r-px").fill("mrp");
  await expect(page.getByLabel("রশিদের প্রিভিউ")).toContainText("MRP-000001");
  await page.getByRole("radio", { name: "A5 · এক কপি" }).click();
  await page.getByRole("button", { name: "বদল সেভ করুন" }).click();
  await expect(page.getByText("রশিদের সেটিংস সেভ হয়েছে")).toBeVisible();

  await page.reload();
  await expect(page.locator("#r-px")).toHaveValue("MRP");
  await expect(page.getByRole("radio", { name: "A5 · এক কপি" })).toHaveAttribute("aria-checked", "true");
});
