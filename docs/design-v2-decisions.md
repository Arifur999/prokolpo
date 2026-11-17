# Design v2 decisions

Business rules the v2 boards leave open, decided by the product owner on 17/11/2026. Specs for each area are in
`design/specs/` (workspace); where a spec lists an open question these answers settle, they win.

| Topic                  | Decision                                                                                                                                                                                                                                                             |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Partner vs shareholder | The Shareholder model replaces Partner: numbered shares (S-01…), project capital split equally by share count, invest / withdraw / profit-withdraw. Existing partner data is migrated into shareholders and the old Partner pages are retired.                       |
| Payments for plans     | First version has no gateway: the owner pays by bKash, Nagad or bank transfer with a reference code and submits the TrxID; billing or super-admin staff confirm it in the admin payments queue. Plans, limits, invoices and coupons all work. A gateway comes later. |
| SMS                    | Templates, queue, history and send screens are built in full; sending stays switched off until a provider's key is configured. Screens say clearly when SMS is not connected.                                                                                        |
| Expense approval       | An expense entered by a manager is pending and counts nowhere (totals, balances, reports) until the owner approves it. The owner's own entries are approved on entry. A rejected expense never counts.                                                               |
