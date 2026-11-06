import * as React from "react"
import { FileText, Upload, X } from "lucide-react"
import { cn } from "@/shared/lib/utils"
import { formatFileSize, isValidFileType, isValidFileSize } from "@/shared/lib/fileUtils"

export interface FileInputProps {
  id?: string
  value?: File | string | null
  onChange?: (file: File | null) => void
  accept?: string
  placeholder?: string
  disabled?: boolean
  className?: string
  maxSizeBytes?: number
  onError?: (errorMessage: string) => void
}

export function FileInput({
  id,
  value,
  onChange,
  accept = ".pdf,.doc,.docx",
  placeholder = "Choose file (PDF or DOCX)...",
  disabled = false,
  className,
  maxSizeBytes,
  onError,
}: FileInputProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)

  // Resolve display name and file size
  const isFileObject = value instanceof File
  const fileName = isFileObject ? value.name : typeof value === "string" ? value : ""
  const fileSize = isFileObject ? value.size : null

  const handleContainerClick = () => {
    if (disabled) return
    inputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null
    if (!file) return

    // Extension validation
    if (accept && !isValidFileType(file.name, accept)) {
      onError?.(`Invalid file type. Allowed: ${accept}`)
      if (inputRef.current) inputRef.current.value = ""
      return
    }

    // Size validation
    if (maxSizeBytes && !isValidFileSize(file, maxSizeBytes)) {
      onError?.(`File size exceeds ${formatFileSize(maxSizeBytes)}.`)
      if (inputRef.current) inputRef.current.value = ""
      return
    }

    onChange?.(file)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (disabled) return
    if (inputRef.current) inputRef.current.value = ""
    onChange?.(null)
  }

  return (
    <div className="relative w-full">
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={accept}
        disabled={disabled}
        onChange={handleFileChange}
        className="hidden"
        tabIndex={-1}
      />

      <div
        onClick={handleContainerClick}
        role="button"
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            handleContainerClick()
          }
        }}
        className={cn(
          "group h-10 w-full rounded-full border-0 bg-muted px-4 text-sm flex items-center justify-between cursor-pointer transition-all duration-150 outline-none focus-visible:bg-card focus-visible:ring-2 focus-visible:ring-primary select-none",
          disabled && "opacity-50 cursor-not-allowed pointer-events-none",
          className
        )}
      >
        {fileName ? (
          <div className="flex items-center gap-2 min-w-0 pr-2">
            <FileText className="size-4 text-primary shrink-0" aria-hidden />
            <span className="text-sm font-medium text-foreground truncate max-w-56">
              {fileName}
            </span>
            {fileSize !== null && (
              <span className="text-xs text-muted-foreground shrink-0 hidden sm:inline">
                ({formatFileSize(fileSize)})
              </span>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-muted-foreground truncate pr-2">
            <Upload className="size-4 shrink-0" aria-hidden />
            <span className="text-sm truncate">{placeholder}</span>
          </div>
        )}

        {/* Minimalist action badge / clear button */}
        {fileName ? (
          <button
            type="button"
            onClick={handleClear}
            className="size-6 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground transition-colors cursor-pointer shrink-0"
            title="Remove file"
            aria-label="Remove file"
          >
            <X className="size-3.5" aria-hidden />
          </button>
        ) : (
          <span className="text-xs font-medium text-muted-foreground/75 group-hover:text-foreground transition-colors px-1 select-none shrink-0">
            Browse
          </span>
        )}
      </div>
    </div>
  )
}

