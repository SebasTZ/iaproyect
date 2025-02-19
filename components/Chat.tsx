'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { createBrowserClient } from '@supabase/ssr'

export const getClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  created_at: string
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  // Cargar historial al montar el componente
  useEffect(() => {
    const loadHistory = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const { data, error } = await supabase
          .from('chats')
          .select('*')
          .order('created_at', { ascending: true })

        if (!error && data) setMessages(data)
      }
    }

    loadHistory()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    setLoading(true)
    const userInput = input
    // Agregar mensaje del usuario de forma optimista
    const newMessage: Message = {
      id: Date.now().toString(),
      content: userInput,
      role: 'user',
      created_at: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, newMessage])
    setInput('')

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userInput }),
      })

      const data = await response.json()
      if (data.error) throw new Error(data.error)

      const assistantMessage: Message = {
        id: Date.now().toString(),
        content: data.content,
        role: 'assistant',
        created_at: new Date().toISOString(),
      }

      // Actualiza la UI con la respuesta del asistente
      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-4 h-screen flex flex-col">
      <div className="flex-1 mb-4 overflow-hidden flex flex-col">
        <div className="border dark:border-gray-700 rounded-lg p-4 h-[500px] overflow-y-auto bg-white dark:bg-gray-900 shadow-lg">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`group flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-xl p-4 transition-all duration-200 ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white ml-4 hover:bg-blue-700 dark:bg-blue-800 dark:hover:bg-blue-900'
                      : 'bg-gray-100 dark:bg-gray-800 mr-4 hover:bg-gray-50 dark:hover:bg-gray-700/80 dark:text-gray-100'
                  }`}
                >
                  <div className="prose dark:prose-invert prose-sm">
                    {message.content.split('\n').map((line, index) => (
                      <p key={index} className="break-words">
                        {line}
                      </p>
                    ))}
                  </div>
                  <div className="mt-1 text-xs opacity-70">
                    {new Date(message.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="sticky bottom-0 bg-white dark:bg-gray-900 pt-4"
      >
        <div className="flex gap-2 relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribe tu mensaje..."
            className="flex-1 p-4 rounded-xl border dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 transition-all pr-14"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading}
            className="absolute right-2 top-2 h-10 w-10 flex items-center justify-center rounded-lg bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M3 13.5h2v-3H3v3zm16 0h2v-3h-2v3zm-8.03-2.809l.474-.423 6.086 6.728-.474.423-6.086-6.728zm-.945-1.035l.85-.523 3.627 5.896-.85.523-3.627-5.896zM12 4.5c-3.26 0-6.327.77-9 2.12v12.74c2.673-1.35 5.74-2.12 9-2.12s6.327.77 9 2.12V6.62c-2.673-1.35-5.74-2.12-9-2.12z" />
              </svg>
            )}
          </button>
        </div>
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
          Puedes pedir ayuda sobre cualquier tema - Presiona Enter para enviar
        </p>
      </form>
    </div>
  )
}