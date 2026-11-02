import { expect, test } from "@playwright/test";

const API = process.env.E2E_API_URL ?? "http://localhost:5000/api/v1";

const randomPhone = () => `015${String(Math.floor(Math.random() * 1e8)).padStart(8, "0")}`;

const post = async <T>(path: string, body: Record<string, unknown>, token?: string): Promise<T> => {
  const response = await fetch(API + path, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(body),
  });
  return ((await response.json()) as { data: T }).data;
};

test("a shop writes up the day with a credit sale, and the credit book picks it up", async ({ page, context, baseURL }) => {
  test.setTimeout(60_000);
  const session = await post<{ accessToken: string; refreshToken: string }>("/auth/register", {
    firstName: "আব্দুল",
    lastName: "করিম",
    email: "",
    phone: randomPhone(),
    password: "karim2026",
    acceptTerms: true,
  });
  const project = await post<{ id: string }>(
    "/projects",
    {
      name: "করিম হার্ডওয়্যার",
      kind: "BUSINESS",
      businessType: "হার্ডওয়্যার দোকান",
      ownership: "PERSONAL",
      location: "",
      description: "",
      startDate: "2026-01-15",
      budget: null,
      farmType: "",
      landUnit: "",
      categories: ["মাল কেনা"],
      phases: [],
    },
    session.accessToken,
  );
  await context.addCookies([
    { name: "accessToken", value: session.accessToken, url: baseURL! },
    { name: "refreshToken", value: session.refreshToken, url: baseURL! },
  ]);

  await page.goto(`/projects/${project.id}/biz-sales`);
  await expect(page.getByRole("heading", { name: "বিক্রি ও আয়", level: 1 })).toBeVisible();
  await page.getByRole("button", { name: "এখন লিখুন" }).click();
  await page.locator("#mf-cash").fill("14250");
  await page.locator("#mf-mobile").fill("2600");
  await page.getByRole("button", { name: "+ আরেকজন" }).first().click();
  await page.getByLabel("বাকিতে নিলেন — নাম 1").fill("রহিম কনস্ট্রাকশন");
  await page.getByLabel("টাকা 1").fill("1400");
  await expect(page.getByText("৳ 18,250").first()).toBeVisible();
  await page.getByRole("button", { name: "দিনের হিসাব সেভ করুন" }).click();

  await expect(page.getByRole("button", { name: "আজকের হিসাব এডিট করুন" })).toBeVisible();
  await expect(page.getByRole("region", { name: "বাকির খাতা" }).getByText("রহিম কনস্ট্রাকশন")).toBeVisible();
});
