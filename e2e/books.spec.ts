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

// A signed-in owner with one building project and a supplier.
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
  await call("POST", `/projects/${project.id}/suppliers`, { name: "করিম রড স্টোর", supplies: ["রড"] }, session.accessToken);
  return { projectId: project.id, token: session.accessToken };
};

test("a bill on credit raises the supplier's due and a payment settles it", async ({ page, context, baseURL }) => {
  const { projectId } = await setUp(context, baseURL!);

  await page.goto(`/projects/${projectId}/expenses/new`);
  await page.locator("#ex-qty").fill("5");
  await page.locator("#ex-rate").fill("95000");
  await expect(page.getByText(/অটো হিসাব হয়েছে/)).toBeVisible();
  await expect(page.locator("#ex-amount")).toHaveValue("4,75,000");
  await page.getByRole("button", { name: "খরচ সেভ করুন" }).click();
  await expect(page).toHaveURL(new RegExp(`/projects/${projectId}/expenses$`));
  await expect(page.getByText("খরচ যোগ হয়েছে — ৳ 4,75,000")).toBeVisible();

  await page.goto(`/projects/${projectId}/suppliers`);
  await expect(page.getByText("4,75,000").first()).toBeVisible();
  await page.getByRole("button", { name: "করিম রড স্টোর-কে পেমেন্ট দিন" }).click();
  await page.getByRole("button", { name: /পুরো বাকি/ }).click();
  await expect(page.getByText("পুরো বাকি শোধ হয়ে যাবে")).toBeVisible();
  await page.getByRole("button", { name: "৳ 4,75,000 পেমেন্ট দিন" }).click();
  await expect(page.getByText("করিম রড স্টোর-কে ৳ 4,75,000 পেমেন্ট দেওয়া হয়েছে")).toBeVisible();
  await expect(page.getByText("শোধ").first()).toBeVisible();
});

test("deleting a bill can be undone from the toast", async ({ page, context, baseURL }) => {
  const { projectId } = await setUp(context, baseURL!);
  await page.goto(`/projects/${projectId}/expenses/new`);
  await page.getByRole("button", { name: "কেউ না" }).click();
  await page.locator("#ex-amount").fill("12000");
  await page.locator("#ex-note").fill("মিক্সার মেশিন ভাড়া");
  await page.getByRole("button", { name: "খরচ সেভ করুন" }).click();
  await expect(page).toHaveURL(/\/expenses$/);

  await page.getByRole("button", { name: /মিক্সার মেশিন ভাড়া .* মুছুন/ }).click();
  await page.getByRole("alertdialog").getByRole("button", { name: "খরচ মুছুন" }).click();
  await expect(page.getByText("এখনো কোনো খরচ লেখা হয়নি")).toBeVisible();
  await page.getByRole("button", { name: "ফিরিয়ে আনুন" }).click();
  await expect(page.getByText("মিক্সার মেশিন ভাড়া")).toBeVisible();
});

test("a daily team's attendance turns into wages owed", async ({ page, context, baseURL }) => {
  const { projectId, token } = await setUp(context, baseURL!);
  await call(
    "POST",
    `/projects/${projectId}/contractors`,
    { name: "জামাল মিস্ত্রির দল", work: "রাজমিস্ত্রি", payType: "DAILY", dailyWage: 1200, teamSize: 6 },
    token,
  );

  await page.goto(`/projects/${projectId}/contractors/attendance`);
  const today = page.getByRole("textbox", { name: /জামাল মিস্ত্রির দল, .* কয়জন কাজ করেছে/ });
  await today.first().fill("6");
  await expect(page.getByText("1টা ঘর বদলেছে — এখনো সেভ হয়নি")).toBeVisible();
  await page.getByRole("button", { name: "হাজিরা সেভ করুন" }).click();
  await expect(page.getByText("সব সেভ করা আছে")).toBeVisible();

  await page.goto(`/projects/${projectId}/contractors`);
  await expect(page.getByText("7,200").first()).toBeVisible();
});

test("moving money between accounts keeps the total on hand", async ({ page, context, baseURL }) => {
  const { projectId, token } = await setUp(context, baseURL!);
  await call("POST", `/projects/${projectId}/accounts`, { name: "ডাচ্-বাংলা ব্যাংক", kind: "BANK", number: "", opening: 500000 }, token);

  await page.goto(`/projects/${projectId}/accounts`);
  await expect(page.getByText("৳ 5,00,000").first()).toBeVisible();
  await page.getByRole("button", { name: "টাকা সরান" }).click();
  await page.locator("#tr-amount").fill("50000");
  await expect(page.getByText("হাতে মোট টাকা বদলাবে না: ৳ 5,00,000")).toBeVisible();
  await page.getByRole("dialog").getByRole("button", { name: "টাকা সরান" }).click();
  await expect(page.getByText(/৳ 50,000 সরানো হয়েছে/)).toBeVisible();
  await expect(page.getByText("৳ 4,50,000").first()).toBeVisible();
});
