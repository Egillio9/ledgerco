import { loanApi } from './api.js';

const app = document.getElementById('app');

function escapeHtml(value) {
    return String(value ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function money(value) {
    return `$${Number(value || 0).toFixed(2)}`;
}

function showMessage(text, type = 'info') {
    const className = type === 'error' ? 'message error' : 'message';
    return `<div class="${className}">${escapeHtml(text)}</div>`;
}

function renderLoading(title = 'Loading') {
    app.innerHTML = `
        <div class="container">
            <div class="status-bar"><h2>${escapeHtml(title)}</h2><p>Loading...</p></div>
        </div>
    `;
}

function updateNav(title) {
    document.title = `Ledger Co - ${title}`;
    const currentHash = location.hash || '#/';
    document.querySelectorAll('nav a').forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === currentHash);
    });
}

function currentPath() {
    return location.hash.slice(2).split('/').filter(Boolean).map(decodeURIComponent);
}

function formValue(form, name) {
    return form.elements[name].value.trim();
}

function positiveNumber(value, label) {
    const number = Number(value);
    if (!Number.isFinite(number) || number <= 0) {
        throw new Error(`${label} must be greater than zero.`);
    }
    return number;
}

function nonNegativeInteger(value, label) {
    const number = Number(value);
    if (!Number.isInteger(number) || number < 0) {
        throw new Error(`${label} must be zero or a positive whole number.`);
    }
    return number;
}

function positiveInteger(value, label) {
    const number = Number(value);
    if (!Number.isInteger(number) || number <= 0) {
        throw new Error(`${label} must be a positive whole number.`);
    }
    return number;
}

function requireText(value, label) {
    if (!value) {
        throw new Error(`${label} is required.`);
    }
    return value;
}

function setButtonLoading(button, isLoading, label) {
    button.disabled = isLoading;
    button.textContent = isLoading ? 'Loading...' : label;
}

async function renderDashboard() {
    updateNav('Dashboard');
    renderLoading('Dashboard');

    try {
        const loans = await loanApi.getLoans();
        const totalLoans = loans.length;
        const totalAmount = loans.reduce((sum, loan) => sum + Number(loan.totalAmount || 0), 0);
        const totalBorrowers = new Set(loans.map(loan => loan.borrowerName)).size;

        app.innerHTML = `
            <div class="container">
                <div class="status-bar">
                    <h2>Dashboard</h2>
                    <p>Use the navigation to create loans, view the loan ledger, and review payment history.</p>
                </div>
                <div class="card-grid">
                    <div class="card"><h3>Total loans</h3><p>${totalLoans}</p></div>
                    <div class="card"><h3>Total borrowers</h3><p>${totalBorrowers}</p></div>
                    <div class="card"><h3>Total amount payable</h3><p>${money(totalAmount)}</p></div>
                </div>
                <div class="card action-card">
                    <h3>Quick actions</h3>
                    <p><a class="button" href="#/loans/new">Create loan</a></p>
                    <p><a class="button" href="#/loans">View loans</a></p>
                </div>
            </div>
        `;
    } catch (error) {
        app.innerHTML = `<div class="container">${showMessage(error.message, 'error')}</div>`;
    }
}

async function renderCreateLoan() {
    updateNav('Create Loan');
    app.innerHTML = `
        <div class="container">
            <div class="status-bar"><h2>Create Loan</h2></div>
            <form id="loan-form" class="card">
                <div class="field"><label for="bankName">Bank name</label><input id="bankName" name="bankName" required /></div>
                <div class="field"><label for="borrowerName">Borrower name</label><input id="borrowerName" name="borrowerName" required /></div>
                <div class="field"><label for="principal">Principal</label><input id="principal" name="principal" type="number" min="1" required /></div>
                <div class="field"><label for="years">Loan term (years)</label><input id="years" name="years" type="number" min="1" required /></div>
                <div class="field"><label for="rate">Rate (%)</label><input id="rate" name="rate" type="number" min="0.01" step="0.01" required /></div>
                <button class="button" type="submit">Create loan</button>
                <div id="form-result"></div>
            </form>
        </div>
    `;

    document.getElementById('loan-form').addEventListener('submit', async event => {
        event.preventDefault();
        const form = event.currentTarget;
        const result = document.getElementById('form-result');
        const button = form.querySelector('button[type="submit"]');

        try {
            const payload = {
                bankName: requireText(formValue(form, 'bankName'), 'Bank name'),
                borrowerName: requireText(formValue(form, 'borrowerName'), 'Borrower name'),
                principal: positiveInteger(formValue(form, 'principal'), 'Principal'),
                years: positiveInteger(formValue(form, 'years'), 'Loan term'),
                rate: positiveNumber(formValue(form, 'rate'), 'Rate')
            };

            setButtonLoading(button, true, 'Create loan');
            result.innerHTML = showMessage('Creating loan...');
            const loan = await loanApi.createLoan(payload);
            result.innerHTML = showMessage('Loan created successfully. Redirecting...');
            setTimeout(() => {
                location.hash = `#/loans/${encodeURIComponent(loan.bankName)}/${encodeURIComponent(loan.borrowerName)}`;
            }, 700);
        } catch (error) {
            result.innerHTML = showMessage(error.message, 'error');
        } finally {
            setButtonLoading(button, false, 'Create loan');
        }
    });
}

async function renderLoanList() {
    updateNav('Loan List');
    renderLoading('Loan List');

    try {
        const loans = await loanApi.getLoans();
        app.innerHTML = `
            <div class="container">
                <div class="status-bar"><h2>Loan List</h2></div>
                <div class="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Bank</th>
                                <th>Borrower</th>
                                <th>Principal</th>
                                <th>Total payable</th>
                                <th>EMIs</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${loans.length === 0 ? '<tr><td colspan="6">No loans found.</td></tr>' : loans.map(loan => `
                                <tr>
                                    <td>${escapeHtml(loan.bankName)}</td>
                                    <td>${escapeHtml(loan.borrowerName)}</td>
                                    <td>${money(loan.principal)}</td>
                                    <td>${money(loan.totalAmount)}</td>
                                    <td>${escapeHtml(loan.totalMonths)}</td>
                                    <td>
                                        <a class="button" href="#/loans/${encodeURIComponent(loan.bankName)}/${encodeURIComponent(loan.borrowerName)}">Details</a>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    } catch (error) {
        app.innerHTML = `<div class="container">${showMessage(error.message, 'error')}</div>`;
    }
}

async function renderLoanDetails(bankName, borrowerName) {
    updateNav('Loan Details');
    renderLoading('Loan Details');

    try {
        const loan = await loanApi.getLoan(bankName, borrowerName);
        app.innerHTML = `
            <div class="container">
                <div class="status-bar">
                    <h2>${escapeHtml(loan.bankName)} / ${escapeHtml(loan.borrowerName)}</h2>
                </div>
                <div class="card-grid">
                    <div class="card"><h3>Principal</h3><p>${money(loan.principal)}</p></div>
                    <div class="card"><h3>Rate</h3><p>${escapeHtml(loan.rate)}%</p></div>
                    <div class="card"><h3>Total interest</h3><p>${money(loan.totalInterest)}</p></div>
                    <div class="card"><h3>Monthly EMI</h3><p>${money(loan.emi)}</p></div>
                    <div class="card"><h3>Total amount</h3><p>${money(loan.totalAmount)}</p></div>
                    <div class="card"><h3>EMIs</h3><p>${escapeHtml(loan.totalMonths)}</p></div>
                </div>
                <div class="card action-card">
                    <h3>Balance check</h3>
                    <form id="balance-form">
                        <div class="field"><label for="emi">Check after EMI number</label><input id="emi" name="emi" type="number" min="0" max="${escapeHtml(loan.totalMonths)}" value="0" required /></div>
                        <button class="button" type="submit">Check balance</button>
                    </form>
                    <div id="balance-result"></div>
                </div>
                <div class="card action-card">
                    <h3>Add payment</h3>
                    <form id="payment-form">
                        <div class="field"><label for="amount">Amount</label><input id="amount" name="amount" type="number" min="1" required /></div>
                        <div class="field"><label for="afterEmi">After EMI</label><input id="afterEmi" name="afterEmi" type="number" min="1" max="${escapeHtml(loan.totalMonths)}" required /></div>
                        <button class="button" type="submit">Add payment</button>
                    </form>
                    <div id="payment-result"></div>
                </div>
                <div class="actions">
                    <a class="button" href="#/loans/${encodeURIComponent(loan.bankName)}/${encodeURIComponent(loan.borrowerName)}/payments">View payment history</a>
                    <a class="button" href="#/loans">Back to list</a>
                </div>
            </div>
        `;

        bindBalanceForm(loan);
        bindPaymentForm(loan);
    } catch (error) {
        app.innerHTML = `<div class="container">${showMessage(error.message, 'error')}</div>`;
    }
}

function bindBalanceForm(loan) {
    document.getElementById('balance-form').addEventListener('submit', async event => {
        event.preventDefault();
        const form = event.currentTarget;
        const result = document.getElementById('balance-result');
        const button = form.querySelector('button[type="submit"]');

        try {
            const emi = nonNegativeInteger(formValue(form, 'emi'), 'EMI');
            if (emi > loan.totalMonths) {
                throw new Error(`EMI cannot be greater than ${loan.totalMonths}.`);
            }

            setButtonLoading(button, true, 'Check balance');
            result.innerHTML = showMessage('Checking balance...');
            const balance = await loanApi.getBalance(loan.bankName, loan.borrowerName, emi);
            result.innerHTML = `
                <div class="message">
                    Amount paid: ${money(balance.amountPaid)}<br>
                    EMIs left: ${escapeHtml(balance.emisLeft)}
                </div>
            `;
        } catch (error) {
            result.innerHTML = showMessage(error.message, 'error');
        } finally {
            setButtonLoading(button, false, 'Check balance');
        }
    });
}

function bindPaymentForm(loan) {
    document.getElementById('payment-form').addEventListener('submit', async event => {
        event.preventDefault();
        const form = event.currentTarget;
        const result = document.getElementById('payment-result');
        const button = form.querySelector('button[type="submit"]');

        try {
            const payload = {
                bankName: loan.bankName,
                borrowerName: loan.borrowerName,
                amount: positiveInteger(formValue(form, 'amount'), 'Amount'),
                afterEmi: positiveInteger(formValue(form, 'afterEmi'), 'After EMI')
            };

            if (payload.afterEmi > loan.totalMonths) {
                throw new Error(`After EMI cannot be greater than ${loan.totalMonths}.`);
            }

            setButtonLoading(button, true, 'Add payment');
            result.innerHTML = showMessage('Adding payment...');
            const payment = await loanApi.addPayment(payload);
            result.innerHTML = showMessage(payment.message || 'Payment added successfully.');
            form.reset();
        } catch (error) {
            result.innerHTML = showMessage(error.message, 'error');
        } finally {
            setButtonLoading(button, false, 'Add payment');
        }
    });
}

async function renderPaymentHistory(bankName, borrowerName) {
    updateNav('Payment History');
    renderLoading('Payment History');

    try {
        const payments = await loanApi.getPayments(bankName, borrowerName);
        app.innerHTML = `
            <div class="container">
                <div class="status-bar"><h2>Payment History</h2><p>${escapeHtml(bankName)} / ${escapeHtml(borrowerName)}</p></div>
                <div class="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Amount</th>
                                <th>After EMI</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${payments.length === 0 ? '<tr><td colspan="2">No payments recorded.</td></tr>' : payments.map(payment => `
                                <tr>
                                    <td>${money(payment.amount)}</td>
                                    <td>${escapeHtml(payment.afterEmi)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                <div class="actions">
                    <a class="button" href="#/loans/${encodeURIComponent(bankName)}/${encodeURIComponent(borrowerName)}">Back to loan details</a>
                    <a class="button" href="#/loans">Back to list</a>
                </div>
            </div>
        `;
    } catch (error) {
        app.innerHTML = `<div class="container">${showMessage(error.message, 'error')}</div>`;
    }
}

async function navigate() {
    const path = currentPath();

    if (path.length === 0) {
        await renderDashboard();
    } else if (path[0] === 'loans' && path[1] === 'new') {
        await renderCreateLoan();
    } else if (path[0] === 'loans' && path.length === 1) {
        await renderLoanList();
    } else if (path[0] === 'loans' && path.length === 4 && path[3] === 'payments') {
        await renderPaymentHistory(path[1], path[2]);
    } else if (path[0] === 'loans' && path.length === 3) {
        await renderLoanDetails(path[1], path[2]);
    } else {
        location.hash = '#/';
    }
}

window.addEventListener('hashchange', navigate);
window.addEventListener('DOMContentLoaded', navigate);
