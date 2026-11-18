import Quill from "quill"
import "quill/dist/quill.snow.css"
import { useEffect, useRef } from "react"

interface RichTextEditorProps {
  id: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  labelledBy?: string
}

export function RichTextEditor({
  id,
  value,
  onChange,
  placeholder,
  disabled = false,
  labelledBy,
}: RichTextEditorProps) {
  const mountRef = useRef<HTMLDivElement>(null)
  const editorRef = useRef<Quill | null>(null)
  const onChangeRef = useRef(onChange)
  const lastValueRef = useRef(value)

  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const host = document.createElement("div")
    mount.appendChild(host)
    const editor = new Quill(host, {
      theme: "snow",
      placeholder,
      modules: {
        toolbar: [
          ["bold", "italic", "underline"],
          [{ list: "ordered" }, { list: "bullet" }],
          ["clean"],
        ],
      },
      formats: ["bold", "italic", "underline", "list"],
    })
    editor.root.id = id
    editor.root.setAttribute("role", "textbox")
    editor.root.setAttribute("aria-multiline", "true")
    if (labelledBy) editor.root.setAttribute("aria-labelledby", labelledBy)
    if (lastValueRef.current) {
      editor.clipboard.dangerouslyPasteHTML(lastValueRef.current, "silent")
    }
    mount.querySelectorAll("button").forEach((button) => {
      button.type = "button"
    })
    editorRef.current = editor

    const updateValue = () => {
      const nextValue = editor.getText().trim() ? editor.getSemanticHTML() : ""
      lastValueRef.current = nextValue
      onChangeRef.current(nextValue)
    }
    editor.on("text-change", updateValue)

    return () => {
      editor.off("text-change", updateValue)
      editorRef.current = null
      mount.replaceChildren()
    }
  }, [id, labelledBy, placeholder])

  useEffect(() => {
    const editor = editorRef.current
    if (!editor || value === lastValueRef.current) return
    lastValueRef.current = value
    if (value) editor.clipboard.dangerouslyPasteHTML(value, "silent")
    else editor.setText("", "silent")
  }, [value])

  useEffect(() => {
    editorRef.current?.enable(!disabled)
  }, [disabled])

  return (
    <div
      ref={mountRef}
      className="flex h-96 max-h-[60dvh] max-w-full min-w-0 flex-col overflow-hidden bg-muted text-sm focus-within:bg-white focus-within:ring-2 focus-within:ring-primary [&_.ql-container]:min-h-0 [&_.ql-container]:max-w-full [&_.ql-container]:flex-1 [&_.ql-container]:overflow-hidden [&_.ql-container]:border-0 [&_.ql-editor]:h-full [&_.ql-editor]:overflow-x-hidden [&_.ql-editor]:overflow-y-auto [&_.ql-editor]:px-4 [&_.ql-editor]:py-3 [&_.ql-editor]:wrap-anywhere [&_.ql-toolbar]:flex [&_.ql-toolbar]:max-w-full [&_.ql-toolbar]:flex-wrap [&_.ql-toolbar]:border-0 [&_.ql-toolbar]:border-b [&_.ql-toolbar]:border-border [&_.ql-toolbar]:px-3"
    />
  )
}
