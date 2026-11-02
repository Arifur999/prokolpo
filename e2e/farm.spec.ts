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

test("a farm sale on part credit shows on the batch and the buyer pays the rest later", async ({ page, context, baseURL }) => {
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
      name: "সাভার পোল্ট্রি খামার",
      kind: "FARM",
      farmType: "POULTRY",
      ownership: "PERSONAL",
      location: "",
      description: "",
      startDate: "2026-01-15",
      budget: null,
      batches: 1,
      landUnit: "",
      businessType: "",
      categories: ["খাবার (ফিড)"],
      phases: ["শেড তৈরি", "১ম ব্যাচ"],
    },
    session.accessToken,
  );
  await context.addCookies([
    { name: "accessToken", value: session.accessToken, url: baseURL! },
    { name: "refreshToken", value: session.refreshToken, url: baseURL! },
  ]);

  await page.goto(`/projects/${project.id}/farm-sales`);
  await expect(page.getByRole("heading", { name: "উৎপাদন বিক্রি", level: 1 })).toBeVisible();
  await page.getByRole("button", { name: "বিক্রি লিখুন" }).click();
  await page.getByRole("radio", { name: "১ম ব্যাচ" }).click();
  await page.locator("#sq").fill("1050");
  await page.locator("#sr").fill("174");
  await page.locator("#sbuy").fill("মামুন পোল্ট্রি");
  await page.getByText("পুরো টাকা এখনই পেয়েছেন").click();
  await page.locator("#sgot").fill("100000");
  await expect(page.getByText("বাকি থাকবে ৳ 82,700")).toBeVisible();
  await page.getByRole("button", { name: "৳ 1,82,700 বিক্রি সেভ করুন" }).click();

  await expect(page.getByText("বাকি ৳ 82,700").first()).toBeVisible();
  await page.getByRole("button", { name: "মামুন পোল্ট্রি-এর বাকি টাকা জমা নিন" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "৳ 82,700 জমা নিন" }).click();
  await expect(page.getByText("কারো কাছে বাকি নেই").first()).toBeVisible();
});
