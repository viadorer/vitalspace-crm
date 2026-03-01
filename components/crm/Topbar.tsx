'use client'

import { ChevronRight } from 'lucide-react'

interface TopbarProps {
  title: string
  breadcrumbs?: { label: string; href?: string }[]
  actions?: React.ReactNode
}

export function Topbar({ title, breadcrumbs, actions }: TopbarProps) {
  return (
    <div className="bg-white border-b border-border px-8 py-4">
      <div className="flex items-center justify-between">
        <div>
          {breadcrumbs && breadcrumbs.length > 0 && (
            <div className="flex items-center space-x-2 text-sm text-gray-500 mb-1">
              {breadcrumbs.map((crumb, index) => (
                <span key={index} className="flex items-center">
                  {index > 0 && <ChevronRight className="mx-2 w-4 h-4 text-gray-400" />}
                  {crumb.href ? (
                    <a href={crumb.href} className="text-gray-600 hover:text-gray-900">
                      {crumb.label}
                    </a>
                  ) : (
                    <span className="text-gray-900">{crumb.label}</span>
                  )}
                </span>
              ))}
            </div>
          )}
          <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
        </div>
        {actions && <div className="flex items-center space-x-3">{actions}</div>}
      </div>
    </div>
  )
}
