const API_BASE_URL = '/api';

async function requestJson(path, options = {}) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
        headers: {
            'Content-Type': 'application/json',
            ...(options.headers || {})
        },
        ...options
    });

    const text = await response.text();
    const body = text ? JSON.parse(text) : null;

    if (!response.ok) {
        const message = body?.message || body?.error || `Request failed with HTTP ${response.status}`;
        throw new Error(message);
    }

    return body;
}

export const loanApi = {
    // API integration: creates a loan with POST /api/loans.
    createLoan(payload) {
        return requestJson('/loans', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
    },

    // API integration: loads all loans with GET /api/loans.
    getLoans() {
        return requestJson('/loans');
    },

    // API integration: loads one loan with GET /api/loans/{bankName}/{borrowerName}.
    getLoan(bankName, borrowerName) {
        return requestJson(`/loans/${encodeURIComponent(bankName)}/${encodeURIComponent(borrowerName)}`);
    },

    // API integration: loads payment history with GET /api/loans/{bankName}/{borrowerName}/payments.
    getPayments(bankName, borrowerName) {
        return requestJson(`/loans/${encodeURIComponent(bankName)}/${encodeURIComponent(borrowerName)}/payments`);
    },

    // API integration: records a lump-sum payment with POST /api/payments.
    addPayment(payload) {
        return requestJson('/payments', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
    },

    // API integration: checks balance with GET /api/balance/{bankName}/{borrowerName}?emi={emi}.
    getBalance(bankName, borrowerName, emi) {
        return requestJson(`/balance/${encodeURIComponent(bankName)}/${encodeURIComponent(borrowerName)}?emi=${encodeURIComponent(emi)}`);
    }
};
