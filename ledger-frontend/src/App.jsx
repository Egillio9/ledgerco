import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Dashboard from './pages/Dashboard'
import CreateLoan from './pages/CreateLoan'
import LoanList from './pages/LoanList'
import LoanDetails from './pages/LoanDetails'
import PaymentHistory from './pages/PaymentHistory'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-backdrop" aria-hidden="true" />
      <Header />
      <main className="container">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/loans/new" element={<CreateLoan />} />
          <Route path="/loans" element={<LoanList />} />
          <Route path="/loans/:bankName/:borrowerName" element={<LoanDetails />} />
          <Route path="/loans/:bankName/:borrowerName/payments" element={<PaymentHistory />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}
