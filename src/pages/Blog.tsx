'use client'

import { useState } from 'react'
import { LayoutGrid } from 'lucide-react'
import { DashboardLayout } from '@/components/Layout/dashboard-layout'
import CreateBlog from '@/components/Blog/Create/Create'
import HeaderBlog from '@/components/Blog/Header/Header'

export default function BlogPage() {
  const [view, setView] = useState<'list' | 'create'>('list')

  return (
    <DashboardLayout>
      <div>
        <HeaderBlog setView={setView} view={view} />
        <div>
          {view === 'list' ? (
            <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm min-h-100 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center  mb-4">
                <LayoutGrid size={32} />
              </div>
              <h3 className="font-bold text-gray-900">Belum ada artikel</h3>
              <p className="text-gray-400 text-sm mb-6">
                Mulai buat artikel gaming pertama kamu sekarang.
              </p>
              <button
                onClick={() => setView('create')}
                className=" font-bold text-sm hover:underline cursor-pointer"
              >
                + Buat Artikel Baru
              </button>
            </div>
          ) : (
            <div>
              <CreateBlog setView={setView} />
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
