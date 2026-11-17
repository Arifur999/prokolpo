import { describe, expect, it } from "vitest";
import messages from "../../messages/bn.json";
import { createProjectSchema } from "./project.validation";

const m = messages.NewProject.validation;

const payload = {
  name: "মিরপুর ৬ তলা ভবন",
  kind: "BUILDING",
  ownership: "PARTNERSHIP",
  location: "মিরপুর-১০, ঢাকা",
  description: "",
  farmType: "",
  floors: 6,
  batches: null,
  plots: null,
  landArea: null,
  landUnit: "",
  businessType: "",
  categories: ["রড"],
  phases: ["১ম তলা"],
  manager: { name: "জসিম উদ্দিন", phone: "০১৮১১-২২৩৩৪৪", password: "abc123", canAddStaff: true },
};

describe("createProjectSchema", () => {
  it("sends the manager's number the way the API stores it", () => {
    const parsed = createProjectSchema(m).parse(payload);
    expect(parsed.manager?.phone).toBe("01811223344");
  });

  it("asks for an address and checks every manager field", () => {
    const result = createProjectSchema(m).safeParse({ ...payload, location: " ", manager: { name: "জ", phone: "0181", password: "abc", canAddStaff: false } });
    const messagesByPath = Object.fromEntries((result.error?.issues ?? []).map((issue) => [issue.path.join("."), issue.message]));
    expect(messagesByPath).toEqual({
      location: m.locationMissing,
      "manager.name": m.managerNameShort,
      "manager.phone": m.managerPhone,
      "manager.password": m.managerPassword,
    });
  });

  it("lets the owner run the project alone", () => {
    expect(createProjectSchema(m).safeParse({ ...payload, manager: null }).success).toBe(true);
  });
});
