# Backend Ledger & Financial Transaction System

A robust, production-grade financial ledger and double-entry transaction processing backend built with **Node.js**, **Express.js**, and **MongoDB (Mongoose)**. This system ensures secure fund transfers, complete audit trails, and data integrity using ACID transactions and idempotency controls.

---

## 🚀 Key Features

* **Double-Entry Bookkeeping:** Every financial movement is immutably recorded using paired Debit and Credit ledger entries to maintain absolute accounting balance.
* **Idempotency Key Protection:** Prevents accidental duplicate charges or double-spending during network retries or client-side errors.
* **ACID Transactions & Sessions:** Utilizes MongoDB multi-document sessions to ensure atomicity—either all steps succeed, or everything rolls back safely.
* **Dynamic Balance Derivation:** Account balances are dynamically calculated from immutable ledger entries rather than relying on mutable state variables.
* **Secure Authentication & Token Blacklisting:** JWT-based authentication with a secure token blacklisting mechanism for safe user logouts.
* **Automated Email Notifications:** Integrated email service to notify users upon successful transaction completion.

---

## 🔄 The 10-Step Transfer Flow

The core transfer mechanism follows a strict, secure sequential workflow:
1. **Validate Request:** Checks for missing parameters (`fromAccount`, `toAccount`, `amount`, `idempotencyKey`).
2. **Validate Idempotency Key:** Verifies if the transaction was already processed, is pending, or failed previously.
3. **Check Account Status:** Ensures both sender and recipient accounts are active.
4. **Derive Sender Balance:** Computes real-time balance from the ledger to prevent overdrafts.
5. **Create Transaction (PENDING):** Initializes a transaction record with a `Pending` status inside a MongoDB session.
6. **Create DEBIT Entry:** Records a debit entry for the sender's account.
7. **Create CREDIT Entry:** Records a credit entry for the recipient's account.
8. **Mark Transaction COMPLETED:** Updates the transaction status to `Completed`.
9. **Commit MongoDB Session:** Persists all changes atomically to the database.
10. **Send Email Notification:** Triggers a confirmation email to the user.

---

## 🛠️ Tech Stack

* **Runtime:** Node.js
* **Framework:** Express.js
* **Database:** MongoDB & Mongoose (with Sessions & Transactions)
* **Authentication:** JSON Web Tokens (JWT) & bcrypt
* **Utilities:** Nodemon, Dotenv, Mongoose Schema Indexing

---

## 📂 Project Structure

```text
Backend-Ledger/
│
├── src/
│   ├── controllers/      # Business logic (Auth, Transactions, Accounts)
│   ├── models/           # Mongoose schemas (User, Account, Transaction, Ledger, BlackList)
│   ├── routes/           # Express API route definitions
│   ├── services/         # External services (Email notifications, etc.)
│   └── app.js            # Express application setup
│
├── server.js             # Application entry point
├── .env                  # Environment variables
└── package.json          # Project dependencies & scripts"# Backend_Ledger-Banking-Transaction-Flow-" 
