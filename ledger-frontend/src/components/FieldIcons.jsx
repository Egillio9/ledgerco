const common = {
  width: 16,
  height: 16,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

export function BankIcon(props) {
  return (
    <svg {...common} {...props}>
      <path d="M3 10l9-6 9 6" />
      <path d="M4 10h16v9H4z" />
      <path d="M9 14v3M12 14v3M15 14v3" />
    </svg>
  )
}

export function UserIcon(props) {
  return (
    <svg {...common} {...props}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M4.5 19.5c1.6-3.4 4.4-5 7.5-5s5.9 1.6 7.5 5" />
    </svg>
  )
}

export function CurrencyIcon(props) {
  return (
    <svg {...common} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9 8h4a2 2 0 010 4H9m0 0h5m-5 0v4m0-4V8m0 8h4a2 2 0 000-4" />
    </svg>
  )
}

export function CalendarIcon(props) {
  return (
    <svg {...common} {...props}>
      <rect x="3.5" y="5" width="17" height="16" rx="2" />
      <path d="M8 3v4M16 3v4M3.5 10h17" />
    </svg>
  )
}

export function PercentIcon(props) {
  return (
    <svg {...common} {...props}>
      <path d="M5 19L19 5" />
      <circle cx="7.5" cy="7.5" r="2.2" />
      <circle cx="16.5" cy="16.5" r="2.2" />
    </svg>
  )
}
