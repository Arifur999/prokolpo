import { expect, test } from "@playwright/test";

const API = process.env.E2E_API_URL ?? "http://localhost:5000/api/v1";

const randomPhone = () => `015${String(Math.floor(Math.random() * 1e8)).padStart(8, "0")}`;

const call = async <T>(path: string, body?: Record<string, unknown>, token?: string): Promise<T> => {
  const response = await fetch(API + path, {
    method: body ? "POST" : "GET",
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  return ((await response.json()) as { data: T }).data;
};

test("the spending report groups a bill by head and by month", async ({ page, context, baseURL }) => {
  test.setTimeout(60_000);
  const session = await call<{ accessToken: string; refreshToken: string }>("/auth/register", {
    firstName: "আব্দুল",
    lastName: "করিম",
    email: "",
    phone: randomPhone(),
    password: "karim2026",
    acceptTerms: true,
  });
  const token = session.accessToken;
  const project = await call<{ id: string }>(
    "/projects",
    {
      name: "গ্রামের বাড়ি",
      kind: "BUILDING",
      ownership: "PERSONAL",
      location: "",
      description: "",
      startDate: "2026-01-15",
      budget: 4_500_000,
      farmType: "",
      landUnit: "",
      businessType: "",
      categories: ["রড", "সিমেন্ট"],
      phases: [],
    },
    token,
  );
  const [rod] = await call<{ id: string; name: string }[]>(`/projects/${project.id}/categories`, undefined, token);
  const [cash] = await call<{ id: string }[]>(`/projects/${project.id}/accounts`, undefined, token);
  await call(
    `/projects/${project.id}/expenses`,
    {
      categoryId: rod!.id,
      phaseId: "",
      partyKind: "",
      partyId: "",
      date: "2026-03-10",
      quantity: "",
      unit: "",
      rate: null,
      amount: 475_000,
      description: "",
      paidNow: true,
      accountId: cash!.id,
    },
    token,
  );
  await context.addCookies([
    { name: "accessToken", value: session.accessToken, url: baseURL! },
    { name: "refreshToken", value: session.refreshToken, url: baseURL! },
  ]);

  await page.goto(`/projects/${project.id}/reports`);
  await expect(page.getByRole("heading", { name: "খাত অনুযায়ী খরচ" })).toBeVisible();
  await expect(page.getByText("৳ 4,75,000").first()).toBeVisible();
  await page.getByRole("button", { name: "মাস অনুযায়ী" }).click();
  await expect(page).toHaveURL(/g=MONTH/);
  await expect(page.getByRole("heading", { name: "মাস অনুযায়ী খরচ" })).toBeVisible();
  await page.getByRole("link", { name: /পাওনা ও দেনা/ }).click();
  await expect(page.getByText("আমরা দেব")).toBeVisible();
});
