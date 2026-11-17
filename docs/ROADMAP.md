# Build roadmap

Every screen in the Prokolpo design canvas, grouped as the canvas groups them. A group is done when each
board is rebuilt pixel-for-pixel at 1440px (checked against a screenshot of the board), works at 390px, and
has its English copy.

Groups 38–40 (billing and the extended admin panel) were added in Phase 2; their research notes are in
`docs/billing-and-admin.md`.

| #   | Page group                                 | Boards                                                                                                            | Status                                                             |
| --- | ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| 1   | ল্যান্ডিং (`landing`)                      | Landing                                                                                                           | done                                                               |
| 2   | লগইন (`login`)                             | Login, LoginEn, LoginSuspended                                                                                    | done                                                               |
| 3   | পাসওয়ার্ড ভুলে গেছেন (`forgot-password`)  | ForgotPassword, ForgotCode, MembersResetCode, ResetEmail, ResetPassword, ResetPasswordExpired                     | done                                                               |
| 4   | সাহায্য ও যোগাযোগ (`support`)              | Support, SupportInApp, SupportSuspended                                                                           | done                                                               |
| 5   | মেইনটেন্যান্স (`maintenance`)              | Maintenance                                                                                                       | done                                                               |
| 6   | রেজিস্ট্রেশন (`register`)                  | Register, RegisterStates, MobileRegister, RegisterClosed                                                          | done                                                               |
| 7   | শর্তাবলী ও গোপনীয়তা (`terms`)             | Terms, TermsPrivacy                                                                                               | done                                                               |
| 8   | ড্যাশবোর্ড (`dashboard`)                   | Dashboard, DashboardEmpty, DashboardEn, DashboardBanner, DashboardStaff, DashboardRestore                         | done; banner waits for admin announcements                         |
| 9   | নতুন প্রজেক্ট (`new-project`)              | NewProject                                                                                                        | done                                                               |
| 10  | প্রজেক্ট ওভারভিউ (`overview`)              | Main, Mobile, MainEn, MainBanner                                                                                  | done; partner figures wait for joint books                         |
| 11  | খরচ (`expense`)                            | ExpenseList, ExpenseNew, MobileExpense, ExpenseListEn                                                             | done; phone layout is the responsive form                          |
| 12  | খরচ এডিট / মুছা (`expense-edit`)           | ExpenseEdit, ExpenseDelete                                                                                        | done                                                               |
| 13  | সাপ্লায়ার (`suppliers`)                   | SupplierList, SupplierAdd, Ledger                                                                                 | done; ledger date range comes with reports                         |
| 14  | কন্ট্রাক্টর (`contractors`)                | ContractorList, ContractorAdd, Attendance                                                                         | done                                                               |
| 15  | কন্ট্রাক্টরের খাতা (`contractor-ledger`)   | ContractorLedger, ContractorLedgerContract                                                                        | done; floor progress tiles come later                              |
| 16  | পেমেন্ট দিন (`payment`)                    | SupplierPay, ContractorPay                                                                                        | done                                                               |
| 17  | অ্যাকাউন্ট (`accounts`)                    | Accounts, AccountsTransfer                                                                                        | done                                                               |
| 18  | মেম্বার (`members`)                        | Members, MembersInvite                                                                                            | done; support row shows once admins can open a project             |
| 19  | অ্যাক্টিভিটি (`activity`)                  | Activity                                                                                                          | done; support view entries wait for settings                       |
| 20  | পার্টনার (`partners`)                      | PartnerList, PartnerCapitalCall, PartnerDetail, PartnerNew                                                        | done                                                               |
| 21  | ইউনিট (`units`)                            | Units, UnitsStart                                                                                                 | done                                                               |
| 22  | বিক্রি ও কিস্তি (`sales`)                  | SalesList, SaleNew, SaleDetail, SaleCollect                                                                       | done; editing a sale comes later                                   |
| 23  | রশিদ (`receipts`)                          | Receipt, ReceiptPartner, ReceiptEn                                                                                | done                                                               |
| 24  | কাস্টমার (`customers`)                     | CustomerList, CustomerAdd, CustomerProfile                                                                        | done; profile edit and note thread come later                      |
| 25  | উৎপাদন বিক্রি (খামার) (`farm-sales`)       | FarmSales, FarmSaleNew                                                                                            | done; batch details open from the batch name                       |
| 26  | বিক্রি ও আয় (ব্যবসা) (`biz-sales`)        | BizSales, BizDayNew                                                                                               | done; credit book is separate from the customer list               |
| 27  | রিপোর্ট (`reports`)                        | Reports, ReportCollection, ReportProfit                                                                           | done; Excel and A4 print for every report                          |
| 28  | সেটিংস (`settings`)                        | Settings, SettingsPhases, SettingsDelete, SettingsReceipt, SettingsSupportGrant, SettingsSupport                  | done; support sees the project once the admin projects pages exist |
| 29  | প্রোফাইল (`profile`)                       | Profile                                                                                                           | done; account delete only for accounts that own no project         |
| 30  | অ্যাডমিন — দুই ধাপের যাচাই (`admin-2fa`)   | AdminTwoFactor, AdminTwoFactorSetup, AdminTwoFactorBackup                                                         | done; codes also guard number changes and suspensions              |
| 31  | অ্যাডমিন — ড্যাশবোর্ড (`admin-dashboard`)  | AdminDashboard                                                                                                    | done; announcements line waits for announcements                   |
| 32  | অ্যাডমিন — ইউজার (`admin-users`)           | AdminUsers, AdminUserDetail, AdminUserReset, AdminUserSuspended                                                   | in progress; list done, account page next                          |
| 33  | অ্যাডমিন — প্রজেক্ট (`admin-projects`)     | AdminProjects, AdminProjectDetail, AdminProjectDeleted, AdminSupportView                                          | todo                                                               |
| 34  | অ্যাডমিন — সাপোর্ট (`admin-support`)       | AdminSupport, AdminSupportClose                                                                                   | todo                                                               |
| 35  | অ্যাডমিন — ঘোষণা (`admin-announcements`)   | AdminAnnouncements                                                                                                | todo                                                               |
| 36  | অ্যাডমিন — অ্যাডমিন লগ (`admin-audit`)     | AdminAudit                                                                                                        | todo                                                               |
| 37  | অ্যাডমিন — টিম ও সেটিংস (`admin-settings`) | AdminSettings, AdminSettingsAddStaff, AdminSettingsMaintenance                                                    | todo                                                               |
| 38  | প্ল্যান ও বিল (`billing`)                  | Pricing, Billing, BillingUpgrade, BillingSuccess, PlanLimit, BillingPastDue                                       | todo                                                               |
| 39  | অ্যাডমিন — বিলিং (`admin-billing`)         | AdminRevenue, AdminSubscriptions, AdminSubscriptionDetail, AdminPayments, AdminPlans, AdminPlanEdit, AdminCoupons | todo                                                               |
| 40  | অ্যাডমিন — সিস্টেম (`admin-system`)        | AdminAnalytics, AdminHealth, AdminMessages, AdminSecurity, AdminFlags                                             | todo                                                               |

## Design v2 (canvas updated, re-synced 17/11/2026)

The canvas grew from 119 to 313 boards. The previous copy is kept in `design/project-2026-11-02/`; `design/project/`
is the current one. Specs written from the new boards are in `design/specs/`. Screenshot tools are in
`design/tools/` (`boardshot.js` renders a board, `appshot.js` the app, `sidebyside.py` compares them).

What changed for the groups above:

- Every project page: a new accordion sidebar with sub-menus, and a fluid page width (min 1280px).
- Dashboard, DashboardBanner, NewProject (project manager section) and the 13 auth pages (new brand panel).
- An English board (`*En`) now exists for every screen; English copy is checked against it.

Group 52 so far: the dashboard card (number, company, manager or super owner, deposits), New Project (manager
login, required address; the owner sets a managed login's password, `PASSWORD_MANAGED` elsewhere), Login and
Register. Left: DashboardBanner (waits on admin announcements) and the other auth boards' copy.

New groups and boards:

| #   | Page group                             | Boards                                                                   | Status |
| --- | -------------------------------------- | ------------------------------------------------------------------------ | ------ |
| 41  | প্রজেক্ট সাইডবার (navigation)          | sidebar of every project board                                           | done   |
| 42  | খরচ — সাব-মেনু                         | ExpDash, ExpBudget, ExpPetty, ExpApprove                                 | todo   |
| 43  | সাপ্লায়ার — সাব-মেনু                  | SupDash, SupPurchase, SupPayments, SupLedger, SupMaterials               | todo   |
| 44  | কন্ট্রাক্টর — সাব-মেনু                 | CtrDash, CtrWork, CtrBills                                               | todo   |
| 45  | শেয়ারহোল্ডার                          | ShareholderList, ShareholderTxn, ShareholderDash                         | todo   |
| 46  | লোন ম্যানেজমেন্ট (`loans`)             | LoanDash, LoanTxn, LoanLedger, LoanContacts                              | todo   |
| 47  | ইউনিট — সাব-মেনু                       | UnitDash, UnitList, UnitPrice, UnitLandowner                             | todo   |
| 48  | সেলস — সাব-মেনু                        | SalesDash, SaleInstall, SaleCollections, SaleBookings, SaleHandover      | todo   |
| 49  | কাস্টমার — সাব-মেনু                    | CustLeads, CustFollow, CustDocs, CustSms                                 | todo   |
| 50  | চুক্তিপত্র (`agreements`)              | SaleDeeds, SaleDeedNew, SaleDeedPrint, AgrFormat                         | todo   |
| 51  | রিপোর্ট, অ্যাক্টিভিটি, মেম্বার, সেটিংস | RepCash, RepDues, ActAlerts, ActTrash, MemRoles, SetLists, SetBackup     | todo   |
| 52  | বদলে যাওয়া পেজ                        | Dashboard, DashboardBanner, NewProject, Login…Support (auth brand panel) | doing  |
