import DOMPurify from "dompurify"
import { cn } from "cn"

const RICH_TEXT_TAGS = ["p", "br", "strong", "b", "em", "i", "u", "ol", "ul", "li"]
const HAS_RICH_TEXT = /<\/?(?:p|br|strong|b|em|i|u|ol|ul|li)\b/i

export function plainTextFromRichText(value: string): string {
  if (!HAS_RICH_TEXT.test(value)) return value
  const element = document.createElement("div")
  element.innerHTML = DOMPurify.sanitize(value, {
    ALLOWED_TAGS: RICH_TEXT_TAGS,
    ALLOWED_ATTR: [],
  })
  return element.textContent ?? ""
}

export function RichText({
  value,
  className,
}: {
  value: string
  className?: string
}) {
  if (!HAS_RICH_TEXT.test(value)) {
    return <div className={cn("whitespace-pre-wrap wrap-break-word", className)}>{value}</div>
  }

  return (
    <div
      className={cn(
        "min-w-0 max-w-full wrap-break-word [&_p:not(:last-child)]:mb-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5",
        className
      )}
      dangerouslySetInnerHTML={{
        __html: DOMPurify.sanitize(value, {
          ALLOWED_TAGS: RICH_TEXT_TAGS,
          ALLOWED_ATTR: [],
        }),
      }}
    />
  )
}
