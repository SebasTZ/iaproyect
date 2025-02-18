// components/Chat.tsx
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
    const newMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: 'user',
      created_at: new Date().toISOString()
    }

    // Actualizar UI optimista
    setMessages(prev => [...prev, newMessage])
    setInput('')

    try {
      // Llamar a la API de Next.js
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input })
      })

      if (!response.ok) throw new Error('Error en la respuesta')

      const { content } = await response.json()
      
      const assistantMessage: Message = {
        id: Date.now().toString(),
        content,
        role: 'assistant',
        created_at: new Date().toISOString()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error:', error)
      // Manejar error
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="border rounded-lg p-4 mb-4 h-96 overflow-y-auto">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`mb-4 p-2 rounded-lg ${
              message.role === 'user'
                ? 'bg-blue-100 ml-auto max-w-[80%]'
                : 'bg-gray-100 mr-auto max-w-[80%]'
            }`}
          >
            <p>{message.content}</p>
          </div>
        ))}
      </div>
      
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 p-2 border rounded"
          disabled={loading}
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Enviando...' : 'Enviar'}
        </button>
      </form>
    </div>
  )
}