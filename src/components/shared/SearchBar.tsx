import React from 'react'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function SearchBar({ value, onChange, placeholder = "Pesquisar..." }: SearchBarProps) {
  return (
    <div className="w-full p-4">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border text-gray-700 border-gray-300 rounded-md p-2 shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
      />
    </div>
  )
}
