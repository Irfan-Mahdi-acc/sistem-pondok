"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts"

interface MapelData {
  mapelId: string
  mapelName: string
  rataRata: number
}

interface RaporChartProps {
  data: MapelData[]
}

export function RaporChart({ data }: RaporChartProps) {
  const chartData = data.map(mapel => ({
    name: mapel.mapelName.length > 15 
      ? mapel.mapelName.substring(0, 15) + "..." 
      : mapel.mapelName,
    fullName: mapel.mapelName,
    nilai: parseFloat(mapel.rataRata.toFixed(2))
  }))

  const getBarColor = (nilai: number) => {
    if (nilai >= 90) return "#16a34a" // green-600
    if (nilai >= 75) return "#2563eb" // blue-600
    if (nilai >= 60) return "#ca8a04" // yellow-600
    return "#dc2626" // red-600
  }

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis 
            dataKey="name" 
            angle={-45}
            textAnchor="end"
            height={100}
            className="text-xs"
          />
          <YAxis 
            domain={[0, 100]}
            className="text-xs"
          />
          <Tooltip 
            content={({ active, payload }: { active?: boolean; payload?: readonly any[] }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-background border rounded-lg p-3 shadow-lg">
                    <p className="font-bold">{payload[0].payload.fullName}</p>
                    <p className="text-sm">
                      Nilai: <span className="font-bold">{payload[0].value}</span>
                    </p>
                  </div>
                )
              }
              return null
            }}
          />
          <Bar dataKey="nilai" radius={[8, 8, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry.nilai)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
