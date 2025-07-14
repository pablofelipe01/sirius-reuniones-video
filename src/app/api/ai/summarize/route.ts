import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// POST /api/ai/summarize - Generate AI summary and analysis
export async function POST(request: NextRequest) {
  console.log('🤖 Starting AI analysis...');
  
  try {
    const { recording_id, meeting_id } = await request.json();

    if (!recording_id && !meeting_id) {
      return NextResponse.json({ 
        error: 'Recording ID or Meeting ID is required' 
      }, { status: 400 });
    }

    console.log('🤖 Processing recording:', recording_id);

    // Get recording with transcription
    const { data: recording, error: recordingError } = await supabase
      .from('meeting_recordings')
      .select('*')
      .eq(recording_id ? 'id' : 'meeting_id', recording_id || meeting_id)
      .single();

    if (recordingError || !recording) {
      console.error('❌ Recording not found:', recordingError);
      return NextResponse.json({ error: 'Recording not found' }, { status: 404 });
    }

    if (!recording.transcription) {
      console.error('❌ No transcription available for analysis');
      return NextResponse.json({ 
        error: 'No transcription available for analysis' 
      }, { status: 400 });
    }

    // Get meeting details for context
    const { data: meeting, error: meetingError } = await supabase
      .from('meetings')
      .select('title, description')
      .eq('id', recording.meeting_id)
      .single();

    if (meetingError) {
      console.error('❌ Meeting not found:', meetingError);
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }

    console.log('🤖 Generating AI summary for meeting:', meeting.title);

    // Create AI prompt for analysis
    const prompt = `
Analiza la siguiente transcripción de reunión y genera un resumen ejecutivo estructurado en español:

**Título de la reunión:** ${meeting.title}
**Descripción:** ${meeting.description || 'Sin descripción'}

**Transcripción:**
${recording.transcription}

Por favor, proporciona un análisis completo en formato JSON con la siguiente estructura:
{
  "resumen_ejecutivo": "Resumen general de la reunión en 2-3 párrafos",
  "puntos_clave": ["Lista de los puntos más importantes discutidos"],
  "decisiones_tomadas": ["Decisiones específicas que se tomaron"],
  "acciones_requeridas": [
    {
      "tarea": "Descripción de la tarea",
      "responsable": "Persona responsable (si se menciona)",
      "fecha_limite": "Fecha límite (si se menciona)",
      "prioridad": "alta|media|baja"
    }
  ],
  "proximos_pasos": ["Lista de próximos pasos mencionados"],
  "temas_pendientes": ["Temas que quedaron sin resolver"],
  "sentimiento_general": "positivo|neutral|negativo",
  "participacion": {
    "total_speakers": "número de participantes que hablaron",
    "speaker_mas_activo": "quién habló más (si se puede identificar)"
  }
}

Asegúrate de que la respuesta sea únicamente JSON válido, sin texto adicional.
`;

    // Call OpenAI GPT-4
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Eres un asistente experto en análisis de reuniones empresariales. Genera resúmenes ejecutivos precisos y estructurados en español."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 2000,
    });

    const aiResponse = completion.choices[0]?.message?.content;

    if (!aiResponse) {
      console.error('❌ No response from OpenAI');
      return NextResponse.json({ 
        error: 'No response from AI analysis' 
      }, { status: 500 });
    }

    console.log('✅ AI analysis completed');

    // Parse AI response
    let analysisData;
    try {
      analysisData = JSON.parse(aiResponse);
    } catch (parseError) {
      console.error('❌ Error parsing AI response:', parseError);
      // Fallback: save raw response
      analysisData = {
        resumen_ejecutivo: aiResponse,
        puntos_clave: [],
        decisiones_tomadas: [],
        acciones_requeridas: [],
        proximos_pasos: [],
        temas_pendientes: [],
        sentimiento_general: "neutral",
        participacion: {}
      };
    }

    // Generate embedding for the summary
    let embedding = null;
    try {
      const embeddingResponse = await openai.embeddings.create({
        model: "text-embedding-ada-002",
        input: analysisData.resumen_ejecutivo,
      });
      embedding = embeddingResponse.data[0]?.embedding;
      console.log('✅ Embedding generated');
    } catch (embeddingError) {
      console.error('❌ Error generating embedding:', embeddingError);
    }

    // Update recording with AI analysis
    const updateData = {
      summary: analysisData.resumen_ejecutivo,
      key_points: analysisData.puntos_clave,
      action_items: analysisData.acciones_requeridas,
      embedding: embedding,
      processed_at: new Date().toISOString()
    };

    const { error: updateError } = await supabase
      .from('meeting_recordings')
      .update(updateData)
      .eq('id', recording.id);

    if (updateError) {
      console.error('❌ Error saving AI analysis:', updateError);
      return NextResponse.json({ 
        error: 'Failed to save AI analysis' 
      }, { status: 500 });
    }

    console.log('✅ AI analysis saved successfully');

    // Update processing queue
    await supabase
      .from('processing_queue')
      .update({ status: 'completed' })
      .eq('meeting_id', recording.meeting_id)
      .eq('job_type', 'summary');

    return NextResponse.json({
      success: true,
      analysis: analysisData,
      message: 'AI analysis completed successfully'
    });

  } catch (error) {
    console.error('❌ AI analysis error:', error);
    
    return NextResponse.json({ 
      error: 'AI analysis failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 