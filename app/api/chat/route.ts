import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

// Función para limpiar la respuesta: elimina bloques <think> y espacios innecesarios
const cleanAssistantResponse = (text: string): string => {
  text = text.replace(/<think>[\s\S]*?<\/think>/g, '');
  return text.trim().replace(/\n\s*\n/g, '\n');
};

export async function POST(request: Request) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  const { message } = await request.json();

  try {
    // Guardar mensaje del usuario
    const { error: userMessageError } = await supabase
      .from('chats')
      .insert([{
        user_id: user.id,
        content: message,
        role: 'user'
      }]);
    if (userMessageError) throw userMessageError;

    // Obtener historial de chat
    const { data: history } = await supabase
      .from('chats')
      .select('content, role')
      .order('created_at', { ascending: true })
      .limit(10);

    // Llamar a LM Studio con instrucciones adicionales
    const lmResponse = await fetch('http://192.168.0.13:1234/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: `Eres un asistente muy competente. Razonas internamente, pero solo muestra el comentario final (no incluyas tu proceso mental). Además, responde en el idioma de la pregunta o interacción.`
          },
          ...(history?.map((msg: { role: string; content: string }) => ({
            role: msg.role,
            content: msg.content
          })) || []),
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 2000,
        stream: false
      })
    });

    const responseData = await lmResponse.json();
    let assistantContent = responseData.choices[0].message.content;
    assistantContent = cleanAssistantResponse(assistantContent);

    // Guardar respuesta del asistente
    const { error: assistantMessageError } = await supabase
      .from('chats')
      .insert([{
        user_id: user.id,
        content: assistantContent,
        role: 'assistant'
      }]);
    if (assistantMessageError) throw assistantMessageError;

    return NextResponse.json({ content: assistantContent });
    
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Error procesando el mensaje' },
      { status: 500 }
    );
  }
}