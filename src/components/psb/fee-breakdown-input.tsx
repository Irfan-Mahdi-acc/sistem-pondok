'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2 } from "lucide-react"

interface FeeItem {
  name: string
  amount: number
}

interface FeeBreakdownInputProps {
  title: string
  description?: string
  value: Record<string, number>
  onChange: (value: Record<string, number>) => void
}

export function FeeBreakdownInput({ title, description, value, onChange }: FeeBreakdownInputProps) {
  const [items, setItems] = useState<FeeItem[]>(() => {
    return Object.entries(value || {}).map(([name, amount]) => ({ name, amount }))
  })

  const addItem = () => {
    const newItems = [...items, { name: "", amount: 0 }]
    setItems(newItems)
  }

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index)
    setItems(newItems)
    updateValue(newItems)
  }

  const updateItem = (index: number, field: 'name' | 'amount', val: string | number) => {
    const newItems = [...items]
    if (field === 'name') {
      newItems[index].name = val as string
    } else {
      newItems[index].amount = typeof val === 'string' ? parseFloat(val) || 0 : val
    }
    setItems(newItems)
    updateValue(newItems)
  }

  const updateValue = (newItems: FeeItem[]) => {
    const newValue: Record<string, number> = {}
    newItems.forEach(item => {
      if (item.name.trim()) {
        newValue[item.name] = item.amount
      }
    })
    onChange(newValue)
  }

  const total = items.reduce((sum, item) => sum + (item.amount || 0), 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item, index) => (
          <div key={index} className="flex gap-2 items-end">
            <div className="flex-1">
              <Label htmlFor={`item-name-${index}`}>Nama Item</Label>
              <Input
                id={`item-name-${index}`}
                placeholder="Contoh: Formulir"
                value={item.name}
                onChange={(e) => updateItem(index, 'name', e.target.value)}
              />
            </div>
            <div className="flex-1">
              <Label htmlFor={`item-amount-${index}`}>Jumlah (Rp)</Label>
              <Input
                id={`item-amount-${index}`}
                type="number"
                placeholder="0"
                value={item.amount || ''}
                onChange={(e) => updateItem(index, 'amount', e.target.value)}
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeItem(index)}
              className="text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addItem}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Tambah Item
        </Button>

        <div className="pt-4 border-t">
          <div className="flex justify-between items-center text-lg font-semibold">
            <span>Total:</span>
            <span>Rp {total.toLocaleString('id-ID')}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
