'use client'

import { useState } from 'react'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    // TODO: Supabase Auth
    // const { error } = await supabase.auth.signInWithPassword({ email, password })
    // if (error) setError(error.message)
    // else router.push('/')
    await new Promise((r) => setTimeout(r, 1000))
    setLoading(false)
    setError('Configure suas credenciais Supabase no .env.local')
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0f1117' }}>
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl gradient-bg flex items-center justify-center shadow-2xl shadow-pink-500/30 mb-4">
            <span className="text-white font-bold text-2xl">H</span>
          </div>
          <h1 className="text-2xl font-bold gradient-text">HypeHub</h1>
          <p className="text-slate-500 text-sm mt-1">Marketing AI Platform</p>
        </div>

        {/* Form */}
        <div className="rounded-2xl border border-[#2a2d3e] bg-[#1a1d2e] p-6">
          <h2 className="text-lg font-semibold text-white mb-5">Entrar na plataforma</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                className="w-full px-3 py-2.5 rounded-lg bg-[#0f1117] border border-[#2a2d3e] text-white placeholder-slate-700 text-sm outline-none focus:border-coral/50 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Senha</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-3 py-2.5 pr-10 rounded-lg bg-[#0f1117] border border-[#2a2d3e] text-white placeholder-slate-700 text-sm outline-none focus:border-coral/50 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-400 bg-red-950/50 border border-red-800/50 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg gradient-bg text-white font-semibold text-sm transition-all duration-150 hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-pink-500/20"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-700 mt-4">
          Acesso restrito à equipe HypeHub
        </p>
      </div>
    </div>
  )
}
