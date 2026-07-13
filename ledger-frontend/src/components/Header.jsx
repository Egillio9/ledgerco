import { NavLink } from 'react-router-dom'

const navLinkClass = ({ isActive }) => (isActive ? 'active' : undefined)

export default function Header() {
  return (
    <header className="app-header">
      <div className="container header-inner">
        <h1>Ledger Co</h1>
        <nav>
          <NavLink to="/" end className={navLinkClass}>
            Dashboard
          </NavLink>
          <NavLink to="/loans" className={navLinkClass}>
            Loans
          </NavLink>
          <NavLink to="/loans/new" className={navLinkClass}>
            Create Loan
          </NavLink>
        </nav>
      </div>
    </header>
  )
}
