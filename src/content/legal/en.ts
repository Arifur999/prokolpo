import type { LegalContent } from "./types";

// English of bn.ts. Same draft status: a lawyer reviews both before launch.
export const legalEn: LegalContent = {
  terms: [
    {
      id: "tm-1",
      title: "What Prokolpo is",
      paragraphs: [
        "Prokolpo is an accounts app — it keeps the expenses, dues, partner money and sales of a house build, a farm, a shop or a shared project in one place.",
        "It is not a bank, and it is not legal or accounting advice. Decisions you make from the numbers in the app are your own.",
      ],
      bullets: [],
    },
    {
      id: "tm-2",
      title: "Your account",
      paragraphs: [],
      bullets: [
        "Open the account with your own mobile number — one account per number.",
        "Never share your password. The Prokolpo team never asks for it by phone or email.",
        "You are responsible for what is done from your account — if you log in on someone else's phone or computer, log out when you finish.",
      ],
    },
    {
      id: "tm-3",
      title: "Projects, owners and members",
      paragraphs: [
        "Whoever opens a project is its owner. The owner adds members and sets their roles — managers can write, viewers can only look.",
        "Ownership can be handed to another member once they accept. If the owner can no longer be reached, the Prokolpo team may change ownership after checking documents and speaking with the other partners.",
      ],
      bullets: [],
    },
    {
      id: "tm-4",
      title: "What you write",
      paragraphs: [],
      bullets: [
        "Enter true information — the expenses, payments and receipts that really happened.",
        "Making fake receipts, cheating a partner or buyer, or keeping other people's details without permission is not allowed.",
        "If you keep the names and numbers of customers, suppliers or partners, looking after them is your responsibility too.",
      ],
    },
    {
      id: "tm-5",
      title: "Suspending an account",
      paragraphs: [
        "If fraud or misuse is reported, the Prokolpo team may suspend an account while it looks into it. A suspended account cannot log in, but no records are deleted and the project's other members keep working as before.",
        "If you disagree, write to support — we will talk it through on the phone.",
      ],
      bullets: [],
    },
    {
      id: "tm-6",
      title: "Deleting",
      paragraphs: [],
      bullets: [
        "A deleted project can be restored by its owner from the dashboard for 30 days; after that it is gone for good. You are notified the day before.",
        "You can delete your own account — if you own a project, hand over ownership or delete the project first.",
        "Before deleting, you can download all of a project's records to Excel from its settings.",
      ],
    },
    {
      id: "tm-7",
      title: "Price",
      paragraphs: [
        "There is a free plan for one small project; paid plans add projects, members and features, at the prices on the pricing page. If a price changes, you are told in the app and by email at least 30 days ahead.",
        "If a payment fails, everything keeps working for a while, then new entries pause — but no records are ever deleted, and you can always download them to Excel.",
      ],
      bullets: [],
    },
    {
      id: "tm-8",
      title: "Downtime and mistakes",
      paragraphs: [
        "Now and then the app may be down for a short while for maintenance — we announce it first. We keep regular backups, but we still suggest downloading important records to Excel from time to time.",
      ],
      bullets: [],
    },
    {
      id: "tm-9",
      title: "Changes to these terms",
      paragraphs: [
        "When the terms change, we announce it at the top of the app and record it here with the date. For a major change we will ask for your agreement again.",
      ],
      bullets: [],
    },
  ],
  privacy: [
    {
      id: "pv-1",
      title: "What we keep",
      paragraphs: [],
      bullets: [
        "Account: name, mobile number, email (if given), company name and language.",
        "What you enter in projects: expenses, payments, sales, instalments, the names and numbers of partners, customers and suppliers, and receipts.",
        "For security: which device and browser you log in from, rough location and time — so unfamiliar logins can be spotted.",
      ],
    },
    {
      id: "pv-2",
      title: "Who can see it",
      paragraphs: [
        "A project's records are seen only by that project's members, according to their role. Nobody from another project, and no other user, sees anything.",
      ],
      bullets: [],
    },
    {
      id: "pv-3",
      title: "What the Prokolpo team sees",
      paragraphs: [
        "For support work the team sees only a summary — your name and number, the project's name and type, how many members and entries. It does not see expenses, sales or partner money.",
      ],
      bullets: [
        'If the owner turns on "allow support to view", the team can look — and only look, never change or download — for a set time (24 hours, 3 days or 7 days).',
        "Whenever someone from the team opens your project, it is written in the project's activity.",
        "Every action by the team is kept in a separate log that nobody can change or delete.",
      ],
    },
    {
      id: "pv-4",
      title: "We don't hand it out",
      paragraphs: [
        "Your information is never given or sold to anyone for advertising or marketing. If the law requires it, only what is necessary may be given to the authorities.",
      ],
      bullets: [],
    },
    {
      id: "pv-5",
      title: "Security",
      paragraphs: [],
      bullets: [
        "Passwords are stored so that even we cannot see them.",
        "Password reset codes and links work once, within 30 minutes.",
        "Two-step verification is required for everyone on the Prokolpo team.",
        "Regular backups are kept.",
      ],
    },
    {
      id: "pv-6",
      title: "How long we keep it",
      paragraphs: [
        "For as long as the account exists. Deleted projects are gone for good after 30 days. Security logs are kept for 2 years.",
        'If you delete your account, your name, number and email are removed. Entries you wrote in other people\'s projects stay so those accounts still add up — the author shows as "former member".',
      ],
      bullets: [],
    },
    {
      id: "pv-7",
      title: "Your controls",
      paragraphs: [],
      bullets: [
        "Change your name, email and language in your profile.",
        "Download all of a project's records to Excel (owner).",
        "See which devices are logged in and log them out if needed.",
        "Delete your account.",
      ],
    },
    {
      id: "pv-8",
      title: "Contact",
      paragraphs: ['For any privacy question or complaint, write from the "Help & contact" page, or WhatsApp 01700-000111 (9 am – 9 pm).'],
      bullets: [],
    },
  ],
  privacyPromises: [
    "Only your project's members see your accounts",
    "The Prokolpo team doesn't see money figures — unless you allow it",
    "Your data is never sold, and the app has no ads",
    "Download everything or delete your account at any time",
  ],
};
