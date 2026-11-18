import { Brand } from "@workspace/ui/components/brand"

export function PortalBrand({ href }: { href: string }) {
  return (
    <a className="brand" href={href}>
      <Brand />
    </a>
  )
}
