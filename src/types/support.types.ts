export const SUPPORT_TOPICS = ["login", "project", "members", "other"] as const;
export type SupportTopic = (typeof SUPPORT_TOPICS)[number];

// Which screen sent the person here; it picks the note, the defaults and the "back" link.
export type SupportSource = "public" | "forgot" | "suspended" | "app";

export interface ISupportRequestPayload {
  name: string;
  phone: string;
  email: string;
  topic: SupportTopic;
  source: SupportSource;
  message: string;
}

export interface ISupportReceipt {
  reference: string;
  phone: string;
}
