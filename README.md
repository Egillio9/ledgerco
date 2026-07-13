# The Ledger Co - Spring Boot REST API

A loan management REST API where banks create loans, record lump-sum payments,
and check borrower balances after a given EMI number.

## Run

From this folder:

```bash
mvn spring-boot:run
```

The server starts at `http://localhost:8080`.

The frontend UI is served from `src/main/resources/static/index.html`. Open `http://localhost:8080/` after starting the application.

## Endpoints

| Method | URL | Description |
| --- | --- | --- |
| POST | `/api/loans` | Create a loan |
| GET | `/api/loans/{bankName}/{borrowerName}` | Get loan details |
| POST | `/api/payments` | Record a lump-sum payment |
| GET | `/api/balance/{bankName}/{borrowerName}?emi=N` | Get balance after EMI `N` |

## Example Flow

Create a loan:

```http
POST /api/loans
Content-Type: application/json

{
  "bankName": "IDIDI",
  "borrowerName": "Dale",
  "principal": 10000,
  "years": 5,
  "rate": 4
}
```

Record a lump-sum payment:

```http
POST /api/payments
Content-Type: application/json

{
  "bankName": "IDIDI",
  "borrowerName": "Dale",
  "amount": 5000,
  "afterEmi": 3
}
```

Check balance:

```http
GET /api/balance/IDIDI/Dale?emi=5
```

Example response:

```json
{
  "bankName": "IDIDI",
  "borrowerName": "Dale",
  "amountPaid": 6000,
  "emisLeft": 30
}
```

## H2 Console

The H2 console is available at `http://localhost:8080/h2-console`.

Use:

```text
JDBC URL: jdbc:h2:mem:ledgerdb
User: sa
Password:
```

## Project Structure

```text
src/main/java/com/ledgerco/
|-- LedgerCoApplication.java
|-- controller/
|-- dto/
|-- exception/
|-- model/
|-- repository/
`-- service/
```
