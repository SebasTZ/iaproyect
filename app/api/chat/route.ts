import { createClient } from '@/utils/supabase/server' 
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient(); // ✅ Use await here

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  const { message } = await request.json();

  try {
    // 1. Guardar mensaje del usuario
    const { error: userMessageError } = await supabase
      .from('chats')
      .insert([{
        user_id: user.id,
        content: message,
        role: 'user'
      }]);

    if (userMessageError) throw userMessageError;

    // 2. Obtener historial de chat
    const { data: history } = await supabase
      .from('chats')
      .select('content, role')
      .order('created_at', { ascending: true })
      .limit(10);

    // 3. Llamar a LM Studio
    const lmResponse = await fetch('http://192.168.0.13:1234/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          ...(history?.map((msg: { role: string; content: string }) => ({
            role: msg.role,
            content: msg.content
          })) || []),
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: -1,
        stream: false
      })
    });

    const responseData = await lmResponse.json();
    const assistantContent = responseData.choices[0].message.content;

    // 4. Guardar respuesta del asistente
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
