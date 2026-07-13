# Ledger Co - Final Project UI Plan

This UI plan is for a simple loan management frontend that works with the existing Spring Boot REST API.

## 1. Dashboard (cards + summary)

### Goals
- Provide an at-a-glance view of system metrics
- Surface key loan portfolio summaries and recent activity

### Sections
- Summary cards for:
  - Total loans
  - Total borrowers
  - Total outstanding balance
  - Total payments received
- Quick actions:
  - Create loan
  - Record payment
  - Search loan
- Recent activity panel:
  - Latest loan creations
  - Latest payment entries
  - Recent balance queries

### Data required
- GET `/api/loans` or a custom summary endpoint
- GET `/api/payments` or recent payment entries
- Aggregated metrics from backend or computed on the frontend

## 2. Create Loan page

### Goals
- Allow users to create a new loan
- Validate inputs before sending to backend

### Form fields
- Bank name
- Borrower name
- Principal amount
- Loan term in years
- Annual interest rate

### Behavior
- Show inline validation errors for required fields
- Submit payload to `POST /api/loans`
- On success, redirect to loan details or loan list
- On failure, show API validation error messages

### UX notes
- Use labels and helper text for EMI calculation inputs
- Provide a summary card showing estimated EMI and total amount payable before submit

## 3. Loan list table

### Goals
- Display all loans in a searchable, sortable table
- Allow quick navigation to loan details

### Columns
- Bank name
- Borrower name
- Principal
- Total amount payable
- EMI count
- Amount paid/pending
- Next action / details link

### Features
- Search by bank or borrower name
- Sort by amount, borrower, or bank
- Pagination for large datasets
- Row action buttons: View details, Add payment

### Data required
- A `GET /api/loans` endpoint that returns loan records
- If the backend lacks a list endpoint, add a minimal `/api/loans` GET implementation

## 4. Loan details page

### Goals
- Show loan-level details for one borrower and bank pair
- Display payment summary, loan terms, and balance progress

### Content
- Loan header: bank + borrower
- Loan terms card:
  - Principal
  - Rate
  - Years
  - Total amount
  - EMI count
- Payment summary card:
  - Amount paid
  - EMIs paid
  - EMIs remaining
  - Outstanding balance
- Action buttons:
  - Add payment
  - View payment history
  - Get balance after EMI

### API usage
- GET `/api/loans/{bankName}/{borrowerName}`
- GET `/api/balance/{bankName}/{borrowerName}?emi=N` for selected EMI progress

## 5. Payment history page

### Goals
- List all lump-sum payments for a loan
- Enable timeline review of payment activity

### Content
- Header with bank and borrower
- Payment table:
  - Payment amount
  - EMI number when payment was made
  - Recorded date/time (if available)
- Summary totals:
  - Total lump sums paid
  - Remaining principal after all payments

### API requirements
- Either a new endpoint such as `GET /api/loans/{bankName}/{borrowerName}/payments`
  or extend existing loan details response with payment history

## Integration notes
- Prefer a single-page app structure using React, Vue, or plain server-side rendered HTML if the project remains backend-focused.
- Reuse the API endpoints already present in the backend wherever possible.
- If the backend lacks list or payment-history endpoints, extend the controller and service layer.
- Keep the UI simple and mobile-friendly with card-based layout and clear data hierarchy.

## Recommended routing structure
- `/` → Dashboard
- `/loans/new` → Create Loan
- `/loans` → Loan list
- `/loans/{bankName}/{borrowerName}` → Loan details
- `/loans/{bankName}/{borrowerName}/payments` → Payment history
