# Build roadmap

Every screen in the Prokolpo design canvas, grouped as the canvas groups them. A group is done when each
board is rebuilt pixel-for-pixel at 1440px (checked against a screenshot of the board), works at 390px, and
has its English copy.

Groups 38–40 (billing and the extended admin panel) were added in Phase 2; their research notes are in
`docs/billing-and-admin.md`.

| #   | Page group                                 | Boards                                                                                                            | Status                                              |
| --- | ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| 1   | ল্যান্ডিং (`landing`)                      | Landing                                                                                                           | done                                                |
| 2   | লগইন (`login`)                             | Login, LoginEn, LoginSuspended                                                                                    | done                                                |
| 3   | পাসওয়ার্ড ভুলে গেছেন (`forgot-password`)  | ForgotPassword, ForgotCode, MembersResetCode, ResetEmail, ResetPassword, ResetPasswordExpired                     | done                                                |
| 4   | সাহায্য ও যোগাযোগ (`support`)              | Support, SupportInApp, SupportSuspended                                                                           | done                                                |
| 5   | মেইনটেন্যান্স (`maintenance`)              | Maintenance                                                                                                       | done                                                |
| 6   | রেজিস্ট্রেশন (`register`)                  | Register, RegisterStates, MobileRegister, RegisterClosed                                                          | done                                                |
| 7   | শর্তাবলী ও গোপনীয়তা (`terms`)             | Terms, TermsPrivacy                                                                                               | done                                                |
| 8   | ড্যাশবোর্ড (`dashboard`)                   | Dashboard, DashboardEmpty, DashboardEn, DashboardBanner, DashboardStaff, DashboardRestore                         | done; banner waits for admin announcements          |
| 9   | নতুন প্রজেক্ট (`new-project`)              | NewProject                                                                                                        | done                                                |
| 10  | প্রজেক্ট ওভারভিউ (`overview`)              | Main, Mobile, MainEn, MainBanner                                                                                  | done; partner figures wait for joint books          |
| 11  | খরচ (`expense`)                            | ExpenseList, ExpenseNew, MobileExpense, ExpenseListEn                                                             | done; phone layout is the responsive form           |
| 12  | খরচ এডিট / মুছা (`expense-edit`)           | ExpenseEdit, ExpenseDelete                                                                                        | done                                                |
| 13  | সাপ্লায়ার (`suppliers`)                   | SupplierList, SupplierAdd, Ledger                                                                                 | done; ledger date range comes with reports          |
| 14  | কন্ট্রাক্টর (`contractors`)                | ContractorList, ContractorAdd, Attendance                                                                         | done                                                |
| 15  | কন্ট্রাক্টরের খাতা (`contractor-ledger`)   | ContractorLedger, ContractorLedgerContract                                                                        | done; floor progress tiles come later               |
| 16  | পেমেন্ট দিন (`payment`)                    | SupplierPay, ContractorPay                                                                                        | done                                                |
| 17  | অ্যাকাউন্ট (`accounts`)                    | Accounts, AccountsTransfer                                                                                        | done                                                |
| 18  | মেম্বার (`members`)                        | Members, MembersInvite                                                                                            | done; support row waits for settings                |
| 19  | অ্যাক্টিভিটি (`activity`)                  | Activity                                                                                                          | done; support view entries wait for settings        |
| 20  | পার্টনার (`partners`)                      | PartnerList, PartnerCapitalCall, PartnerDetail, PartnerNew                                                        | done                                                |
| 21  | ইউনিট (`units`)                            | Units, UnitsStart                                                                                                 | todo                                                |
| 22  | বিক্রি ও কিস্তি (`sales`)                  | SalesList, SaleNew, SaleDetail, SaleCollect                                                                       | todo                                                |
| 23  | রশিদ (`receipts`)                          | Receipt, ReceiptPartner, ReceiptEn                                                                                | partner receipt done; sale receipts come with sales |
| 24  | কাস্টমার (`customers`)                     | CustomerList, CustomerAdd, CustomerProfile                                                                        | todo                                                |
| 25  | উৎপাদন বিক্রি (খামার) (`farm-sales`)       | FarmSales, FarmSaleNew                                                                                            | todo                                                |
| 26  | বিক্রি ও আয় (ব্যবসা) (`biz-sales`)        | BizSales, BizDayNew                                                                                               | todo                                                |
| 27  | রিপোর্ট (`reports`)                        | Reports, ReportCollection, ReportProfit                                                                           | todo                                                |
| 28  | সেটিংস (`settings`)                        | Settings, SettingsPhases, SettingsDelete, SettingsReceipt, SettingsSupportGrant, SettingsSupport                  | todo                                                |
| 29  | প্রোফাইল (`profile`)                       | Profile                                                                                                           | todo                                                |
| 30  | অ্যাডমিন — দুই ধাপের যাচাই (`admin-2fa`)   | AdminTwoFactor, AdminTwoFactorSetup, AdminTwoFactorBackup                                                         | todo                                                |
| 31  | অ্যাডমিন — ড্যাশবোর্ড (`admin-dashboard`)  | AdminDashboard                                                                                                    | todo                                                |
| 32  | অ্যাডমিন — ইউজার (`admin-users`)           | AdminUsers, AdminUserDetail, AdminUserReset, AdminUserSuspended                                                   | todo                                                |
| 33  | অ্যাডমিন — প্রজেক্ট (`admin-projects`)     | AdminProjects, AdminProjectDetail, AdminProjectDeleted, AdminSupportView                                          | todo                                                |
| 34  | অ্যাডমিন — সাপোর্ট (`admin-support`)       | AdminSupport, AdminSupportClose                                                                                   | todo                                                |
| 35  | অ্যাডমিন — ঘোষণা (`admin-announcements`)   | AdminAnnouncements                                                                                                | todo                                                |
| 36  | অ্যাডমিন — অ্যাডমিন লগ (`admin-audit`)     | AdminAudit                                                                                                        | todo                                                |
| 37  | অ্যাডমিন — টিম ও সেটিংস (`admin-settings`) | AdminSettings, AdminSettingsAddStaff, AdminSettingsMaintenance                                                    | todo                                                |
| 38  | প্ল্যান ও বিল (`billing`)                  | Pricing, Billing, BillingUpgrade, BillingSuccess, PlanLimit, BillingPastDue                                       | todo                                                |
| 39  | অ্যাডমিন — বিলিং (`admin-billing`)         | AdminRevenue, AdminSubscriptions, AdminSubscriptionDetail, AdminPayments, AdminPlans, AdminPlanEdit, AdminCoupons | todo                                                |
| 40  | অ্যাডমিন — সিস্টেম (`admin-system`)        | AdminAnalytics, AdminHealth, AdminMessages, AdminSecurity, AdminFlags                                             | todo                                                |
