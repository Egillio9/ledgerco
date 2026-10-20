# Ledger Co – Loan Management REST API

A Spring Boot REST API where banks create loans, record lump-sum payments, and check a borrower's amount paid and EMIs remaining after any EMI number. A React dashboard sits on top of the API.

**Live demo:** https://ledgerco-beta.vercel.app (API: https://ledgerco-api.onrender.com, free tier, so the first load can take ~50s to wake up)

## Tech Stack

**Backend:** Java 17 · Spring Boot 3 · Spring Data JPA · Bean Validation · H2 · Lombok · JUnit 5 / Mockito / MockMvc · Docker
**Frontend:** React 19 · Vite · React Router · Axios

## How the numbers work

For a loan of principal `P`, `N` years and rate `R`%:

```
Interest  I   = P × N × R / 100
Total     A   = P + I
EMI           = ceil(A / (N × 12))
```

The balance after EMI `n` is `n × EMI` plus every lump sum paid at or before EMI `n`, capped at `A`. The EMIs left are `ceil((A − paid) / EMI)`.

## Run locally

**Backend** (http://localhost:8080):

```bash
mvn spring-boot:run
```

A plain HTML UI is served by the backend at http://localhost:8080. The H2 console is at `/h2-console` (JDBC URL `jdbc:h2:mem:ledgerdb`, user `sa`, empty password).

**React frontend** (http://localhost:5173). The Vite dev server proxies `/api` to port 8080:

```bash
cd ledger-frontend
npm install
npm run dev
```

## Deploy

- **Backend:** `docker build -t ledgerco . && docker run -p 8080:8080 ledgerco` works on Render and similar hosts. It honours `PORT`. Set `CORS_ORIGINS` to the frontend origin(s), comma-separated.
- **Frontend:** build with `VITE_API_URL` set to the backend origin, e.g. `VITE_API_URL=https://your-backend.onrender.com npm run build`. On Vercel, add `VITE_API_URL` under Project → Settings → Environment Variables.

## Endpoints

| Method | URL | Description |
| --- | --- | --- |
| POST | `/api/loans` | Create a loan |
| GET | `/api/loans` | List all loans |
| GET | `/api/loans/{bankName}/{borrowerName}` | Get loan details |
| GET | `/api/loans/{bankName}/{borrowerName}/payments` | List lump-sum payments for a loan |
| POST | `/api/payments` | Record a lump-sum payment |
| GET | `/api/balance/{bankName}/{borrowerName}?emi=N` | Amount paid and EMIs left after EMI `N` |

Errors come back as JSON (`status`, `error`, `message`, `timestamp`): 400 for validation, malformed input or a duplicate loan, and 404 for an unknown loan.

### Example

```http
POST /api/loans
{ "bankName": "IDIDI", "borrowerName": "Dale", "principal": 10000, "years": 5, "rate": 4 }

POST /api/payments
{ "bankName": "IDIDI", "borrowerName": "Dale", "amount": 5000, "afterEmi": 3 }

GET /api/balance/IDIDI/Dale?emi=5
→ { "bankName": "IDIDI", "borrowerName": "Dale", "amountPaid": 6000, "emisLeft": 30 }
```

## Tests

```bash
mvn test
```

There are 12 tests: unit tests for the EMI/balance logic, plus MockMvc tests for the full create → pay → balance flow, duplicate loans, bad input, 404s and CORS.

## Project Structure

```text
src/main/java/com/ledgerco/
|-- LedgerCoApplication.java
|-- config/        CORS configuration
|-- controller/    REST endpoints
|-- service/       loan, payment and balance logic
|-- db/entity/     JPA entities (LoanEntity, PaymentEntity)
|-- db/repository/ Spring Data repositories
|-- dto/           request/response objects
`-- exception/     custom exceptions + global handler
ledger-frontend/   React (Vite) dashboard
```
