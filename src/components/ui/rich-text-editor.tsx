'use client'

import { useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { 
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, 
  Undo, Redo 
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  
  // Sync value to innerHTML, but only if different to avoid cursor jumps
  useEffect(() => {
    if (contentRef.current && value !== contentRef.current.innerHTML) {
      contentRef.current.innerHTML = value
    }
  }, [value]) 

  const handleInput = () => {
    if (contentRef.current) {
      onChange(contentRef.current.innerHTML)
    }
  }

  const execCommand = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value)
    if (contentRef.current) {
      contentRef.current.focus()
    }
  }

  return (
    <div className="border rounded-md overflow-hidden bg-white">
      <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-muted/50">
        <Button variant="ghost" size="sm" onClick={() => execCommand('bold')} type="button" title="Bold">
          <Bold className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => execCommand('italic')} type="button" title="Italic">
          <Italic className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => execCommand('underline')} type="button" title="Underline">
          <Underline className="h-4 w-4" />
        </Button>
        
        <div className="w-px h-6 bg-gray-300 mx-1" />
        
        <Button variant="ghost" size="sm" onClick={() => execCommand('justifyLeft')} type="button" title="Align Left">
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => execCommand('justifyCenter')} type="button" title="Align Center">
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => execCommand('justifyRight')} type="button" title="Align Right">
          <AlignRight className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        <Select onValueChange={(val) => execCommand('fontName', val)}>
          <SelectTrigger className="w-[130px] h-8">
            <SelectValue placeholder="Font" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Arial">Arial</SelectItem>
            <SelectItem value="Times New Roman">Times New Roman</SelectItem>
            <SelectItem value="Courier New">Courier New</SelectItem>
            <SelectItem value="Traditional Arabic">Arabic (Traditional)</SelectItem>
            <SelectItem value="Amiri">Amiri (Arabic)</SelectItem>
            <SelectItem value="Aref Ruqaa">Aref Ruqaa (Riq'ah)</SelectItem>
            <SelectItem value="Arslan Wessam A">Arslan Wessam A (Local)</SelectItem>
            <SelectItem value="Cormorant Infant">Cormorant Infant</SelectItem>
            <SelectItem value="Bitter">Bitter</SelectItem>
          </SelectContent>
        </Select>

        <Select onValueChange={(val) => {
          // Special handling for font size to support PT values
          // We use a marker strategy: apply a specific font size (7) then replace it with a span
          document.execCommand('fontSize', false, '7')
          const fontElements = contentRef.current?.querySelectorAll('font[size="7"]')
          fontElements?.forEach(el => {
            const span = document.createElement('span')
            span.style.fontSize = val
            span.innerHTML = el.innerHTML
            el.parentNode?.replaceChild(span, el)
          })
          if (contentRef.current) {
            contentRef.current.focus()
            handleInput()
          }
        }}>
          <SelectTrigger className="w-[80px] h-8">
            <SelectValue placeholder="Size" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="8pt">8pt</SelectItem>
            <SelectItem value="9pt">9pt</SelectItem>
            <SelectItem value="10pt">10pt</SelectItem>
            <SelectItem value="11pt">11pt</SelectItem>
            <SelectItem value="12pt">12pt</SelectItem>
            <SelectItem value="14pt">14pt</SelectItem>
            <SelectItem value="16pt">16pt</SelectItem>
            <SelectItem value="18pt">18pt</SelectItem>
            <SelectItem value="24pt">24pt</SelectItem>
            <SelectItem value="30pt">30pt</SelectItem>
            <SelectItem value="36pt">36pt</SelectItem>
            <SelectItem value="48pt">48pt</SelectItem>
            <SelectItem value="60pt">60pt</SelectItem>
            <SelectItem value="72pt">72pt</SelectItem>
          </SelectContent>
        </Select>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        <Select onValueChange={(val) => {
          // Apply line height to the current block
          const selection = window.getSelection()
          if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0)
            let container = range.commonAncestorContainer as HTMLElement
            
            // Find the nearest block element
            if (container.nodeType === 3) { // Text node
              container = container.parentElement as HTMLElement
            }
            
            // Traverse up to find a block element (div, p, etc) inside the editor
            while (container && container !== contentRef.current && 
                   !['DIV', 'P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'LI'].includes(container.tagName)) {
              container = container.parentElement as HTMLElement
            }

            if (container && container !== contentRef.current) {
              container.style.lineHeight = val
            } else {
              // If we are at the root or can't find a block, wrap the selection or apply to a new div
              document.execCommand('formatBlock', false, 'div')
              // Re-acquire selection/container after formatBlock
              const newSelection = window.getSelection()
              if (newSelection && newSelection.rangeCount > 0) {
                 let newContainer = newSelection.getRangeAt(0).commonAncestorContainer as HTMLElement
                 if (newContainer.nodeType === 3) newContainer = newContainer.parentElement as HTMLElement
                 // Traverse up again
                 while (newContainer && newContainer !== contentRef.current && 
                   !['DIV', 'P'].includes(newContainer.tagName)) {
                    newContainer = newContainer.parentElement as HTMLElement
                 }
                 if (newContainer && newContainer !== contentRef.current) {
                   newContainer.style.lineHeight = val
                 }
              }
            }
            
            if (contentRef.current) {
              contentRef.current.focus()
              handleInput()
            }
          }
        }}>
          <SelectTrigger className="w-[80px] h-8">
            <SelectValue placeholder="Spacing" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1.0">1.0</SelectItem>
            <SelectItem value="1.15">1.15</SelectItem>
            <SelectItem value="1.5">1.5</SelectItem>
            <SelectItem value="2.0">2.0</SelectItem>
            <SelectItem value="2.5">2.5</SelectItem>
            <SelectItem value="3.0">3.0</SelectItem>
          </SelectContent>
        </Select>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        <Button variant="ghost" size="sm" onClick={() => execCommand('undo')} type="button" title="Undo">
          <Undo className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => execCommand('redo')} type="button" title="Redo">
          <Redo className="h-4 w-4" />
        </Button>
      </div>
      
      <div
        ref={contentRef}
        className="p-4 min-h-[150px] outline-none prose max-w-none"
        contentEditable
        onInput={handleInput}
        style={{ direction: 'ltr' }} 
      />
    </div>
  )
}
