import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

// Función para limpiar la respuesta: elimina bloques <think> y espacios innecesarios
const cleanAssistantResponse = (text: string): string => {
  text = text.replace(/<think>[\s\S]*?<\/think>/g, '');
  return text.trim().replace(/\n\s*\n/g, '\n');
};

// Agentes de IA
const agents = {
  legislacion: "Eres un experto en legislación peruana. Responde con artículos de códigos y normas oficiales.",
  contrato: "Eres un experto en derecho contractual en Perú. Explica conceptos y casos de contratos con precisión.",
  jurisprudencia: "Eres un especialista en jurisprudencia peruana. Responde con fallos de la Corte Suprema y casos relevantes.",
  doctrina: "Eres un experto en doctrina jurídica. Explica principios legales y teorías del derecho con claridad."
};

// Detecta el agente según la pregunta si no se especifica
const detectAgent = (message: string): string => {
  if (/ley|norma|artículo|código/i.test(message)) return "legislacion";
  if (/contrato|obligación|acuerdo/i.test(message)) return "contrato";
  if (/jurisprudencia|fallo|sentencia/i.test(message)) return "jurisprudencia";
  if (/doctrina|principio|teoría/i.test(message)) return "doctrina";
  return "legislacion"; // Default
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

    // Detecta el agente de IA según el contenido del mensaje
    const agentKey = detectAgent(message);
    const agentInstruction = agents[agentKey as keyof typeof agents];

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
          {
            role: 'system',
            content: agentInstruction
          },
          ...(history?.map((msg: { role: string; content: string }) => ({
            role: msg.role,
            content: msg.content
          })) || []),
          { role: 'user', content: message }
        ],
        temperature: 0.5,
        max_tokens: 3000,
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