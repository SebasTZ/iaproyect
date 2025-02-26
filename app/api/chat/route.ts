import OpenAI from "openai";
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

// Función para limpiar la respuesta eliminando bloques <think>
const cleanAssistantResponse = (text: string): string =>
  text.replace(/<think>[\s\S]*?<\/think>/g, "").trim();

// Agentes de IA
const agents = {
  legislacion:
    "Eres un experto en legislación peruana. Responde con artículos de códigos y normas oficiales.",
  contrato:
    "Eres un experto en derecho contractual en Perú. Explica conceptos y casos de contratos con precisión.",
  jurisprudencia:
    "Eres un especialista en jurisprudencia peruana. Responde con fallos de la Corte Suprema y casos relevantes.",
  doctrina:
    "Eres un experto en doctrina jurídica. Explica principios legales y teorías del derecho con claridad.",
};

// Detecta el agente según la pregunta
const detectAgent = (message: string): string => {
  if (/ley|norma|artículo|código/i.test(message)) return "legislacion";
  if (/contrato|obligación|acuerdo/i.test(message)) return "contrato";
  if (/jurisprudencia|fallo|sentencia/i.test(message)) return "jurisprudencia";
  if (/doctrina|principio|teoría/i.test(message)) return "doctrina";
  return "legislacion";
};

export async function POST(request: Request) {
  const supabase = await createClient();

  // Verificar autenticación del usuario
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { message } = await request.json();

  try {
    // Guardar mensaje del usuario en Supabase
    const { error: userMessageError } = await supabase
      .from("chats")
      .insert([{ user_id: user.id, content: message, role: "user" }]);
    if (userMessageError) throw userMessageError;

    // Detectar el agente y su instrucción
    const agentKey = detectAgent(message);
    const agentInstruction = agents[agentKey as keyof typeof agents];

    // Obtener historial del chat y fusionar mensajes consecutivos del mismo rol
    const { data: history } = await supabase
      .from("chats")
      .select("content, role")
      .order("created_at", { ascending: true })
      .limit(10);

    const interleavedHistory: {
      role: "user" | "system" | "assistant";
      content: string;
    }[] = [];

    if (history) {
      for (const msg of history as { role: string; content: string }[]) {
        const role = msg.role as "user" | "system" | "assistant";
        if (
          interleavedHistory.length > 0 &&
          interleavedHistory[interleavedHistory.length - 1].role === role
        ) {
          interleavedHistory[interleavedHistory.length - 1].content +=
            "\n" + msg.content;
        } else {
          interleavedHistory.push({ role, content: msg.content });
        }
      }
    }

    // Agregar el nuevo mensaje solo si el último no es de rol 'user'; de lo contrario, fusionarlo
    if (
      interleavedHistory.length > 0 &&
      interleavedHistory[interleavedHistory.length - 1].role === "user"
    ) {
      interleavedHistory[interleavedHistory.length - 1].content +=
        "\n" + message;
    } else {
      interleavedHistory.push({ role: "user", content: message });
    }

    // Construir el arreglo de mensajes para DeepSeek
    const messagesArray: {
      role: "system" | "user" | "assistant";
      content: string;
    }[] = [
      {
        role: "system",
        content:
          "Eres un asistente muy competente que razona internamente pero solo muestra el comentario final. Además, responde en el idioma de la pregunta o interacción.",
      },
      { role: "system", content: agentInstruction },
      ...interleavedHistory,
    ];

    // Inicializar cliente OpenAI con configuración DeepSeek
    const openai = new OpenAI({
      baseURL: process.env.Base_url, // ejemplo: "https://api.deepseek.com/v1"
      apiKey: process.env.API_KEY, // clave para DeepSeek
    });

    // Seleccionar el modelo DeepSeek (en este caso deepseek-reasoner)
    const chosenModel = "deepseek-reasoner";

    // Crear la conversación con parámetros mejorados
    const completion = await openai.chat.completions.create({
      messages: messagesArray,
      model: chosenModel,
      temperature: 0.5,
      max_tokens: 3000,
      presence_penalty: 0.6,
      frequency_penalty: 0.6,
    });

    let assistantContent =
      completion.choices?.[0]?.message?.content ||
      "Error en la respuesta de IA.";
    assistantContent = cleanAssistantResponse(assistantContent);

    // Guardar la respuesta del asistente en Supabase
    const { error: assistantMessageError } = await supabase
      .from("chats")
      .insert([
        { user_id: user.id, content: assistantContent, role: "assistant" },
      ]);
    if (assistantMessageError) throw assistantMessageError;

    return NextResponse.json({ content: assistantContent });
  } catch (error: any) {
    console.error("DeepSeek API error:", error.message || error);
    return NextResponse.json(
      { error: error.message || "Error procesando el mensaje" },
      { status: 500 }
    );
  }
}
