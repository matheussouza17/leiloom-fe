import React from 'react'

interface PageHeaderProps {
  title: string
  buttonText: string
  onButtonClick: () => void
  isLoading?: boolean
}

export function PageHeader({ title, buttonText, onButtonClick, isLoading = false }: PageHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-8">
      <h1 className="text-2xl font-bold text-gray-500">{title}</h1>
      <button
        onClick={onButtonClick}
        className="bg-yellow-400 text-black font-medium px-5 py-2 rounded-md hover:bg-yellow-500 transition-colors disabled:opacity-50 flex items-center gap-2"
        disabled={isLoading}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <path d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2Z"/>
        </svg>
        {buttonText}
      </button>
    </div>
  )
}