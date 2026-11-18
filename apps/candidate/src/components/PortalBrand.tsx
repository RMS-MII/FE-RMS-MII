import { Brand } from "@workspace/ui/components/brand"

export function PortalBrand({ href, compact }: { href: string; compact?: boolean }) {
  return (
    <a className="brand" href={href}>
      <Brand compact={compact} />
    </a>
  )
}
