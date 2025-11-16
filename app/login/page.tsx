'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Login failed')
        return
      }

      router.push('/dashboard')
      router.refresh()
    } catch (err) {
      setError('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#050409] flex items-center justify-center">
      <div className="w-full max-w-md p-8 bg-[#111827] rounded-lg">
        <h1 className="text-3xl font-serif text-[#f5e0c3] mb-6 text-center">
          ESAMIND
        </h1>
        <h2 className="text-xl text-[#f9fafb] mb-6 text-center">
          Creator Login
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[#f9fafb] mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 bg-[#050409] border border-[#374151] rounded-lg text-[#f9fafb] focus:outline-none focus:border-[#f59e0b]"
            />
          </div>
          <div>
            <label className="block text-[#f9fafb] mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 bg-[#050409] border border-[#374151] rounded-lg text-[#f9fafb] focus:outline-none focus:border-[#f59e0b]"
            />
          </div>
          {error && (
            <div className="text-red-400 text-sm">{error}</div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 bg-[#f59e0b] text-[#050409] rounded-lg hover:bg-[#fbbf24] transition-colors font-medium disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  )
}

