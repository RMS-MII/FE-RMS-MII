export function PortalBrand({ href }: { href: string }) {
  return (
    <a className="brand" href={href}>
      <svg viewBox="0 0 28 28" className="portal-brand-mark" aria-hidden="true">
        <path
          d="M3 23V5h4.2L14 14.2 20.8 5H25v18h-4.4V12.4L14 21.2l-6.6-8.8V23z"
          fill="var(--primary)"
        />
      </svg>
      <span>Metrodata</span>
    </a>
  )
}
