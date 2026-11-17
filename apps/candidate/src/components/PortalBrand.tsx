export function PortalBrand({ href }: { href: string }) {
  return (
    <a className="brand" href={href}>
      <img src="/assets/mii.png" alt="" className="portal-brand-mark" />
      <span>Rekrutin</span>
    </a>
  )
}
