'use client'

import { Input } from "@/components/ui/input"
import { forwardRef } from "react"

interface DateInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
}

// Convert yyyy-mm-dd to dd/mm/yyyy
function formatToDisplay(isoDate: string): string {
  if (!isoDate) return ''
  const [year, month, day] = isoDate.split('-')
  return `${day}/${month}/${year}`
}

// Convert dd/mm/yyyy to yyyy-mm-dd
function formatToISO(displayDate: string): string {
  if (!displayDate) return ''
  const parts = displayDate.split('/')
  if (parts.length !== 3) return ''
  const [day, month, year] = parts
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
}

export const DateInput = forwardRef<HTMLInputElement, DateInputProps>(
  ({ value, onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value
      
      // Auto-format as user types
      let formatted = inputValue.replace(/\D/g, '') // Remove non-digits
      
      if (formatted.length >= 2) {
        formatted = formatted.slice(0, 2) + '/' + formatted.slice(2)
      }
      if (formatted.length >= 5) {
        formatted = formatted.slice(0, 5) + '/' + formatted.slice(5, 9)
      }
      
      e.target.value = formatted
      
      // Convert to ISO format for form submission
      if (formatted.length === 10) {
        const isoDate = formatToISO(formatted)
        if (isoDate) {
          const hiddenInput = document.getElementById(props.id + '-hidden') as HTMLInputElement
          if (hiddenInput) {
            hiddenInput.value = isoDate
          }
        }
      }
      
      onChange?.(e)
    }

    return (
      <>
        <Input
          {...props}
          ref={ref}
          type="text"
          placeholder="dd/mm/yyyy"
          maxLength={10}
          onChange={handleChange}
          defaultValue={value ? formatToDisplay(value) : ''}
        />
        <input
          type="hidden"
          id={props.id + '-hidden'}
          name={props.name}
          defaultValue={value}
        />
      </>
    )
  }
)

DateInput.displayName = 'DateInput'
