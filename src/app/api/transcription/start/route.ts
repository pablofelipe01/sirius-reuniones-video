import { NextRequest, NextResponse } from 'next/server';
import { AssemblyAI } from 'assemblyai';
import { createClient } from '@supabase/supabase-js';

const client = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY!
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// POST /api/transcription/start - Start transcription for a recording
export async function POST(request: NextRequest) {
  console.log('🎙️ Starting transcription...');
  
  try {
    const { recording_id, recording_url } = await request.json();

    if (!recording_id || !recording_url) {
      return NextResponse.json({ 
        error: 'Recording ID and URL are required' 
      }, { status: 400 });
    }

    console.log('🎙️ Processing recording:', recording_id);

    // Get recording details
    const { data: recording, error: recordingError } = await supabase
      .from('meeting_recordings')
      .select('id, meeting_id, transcription_status')
      .eq('id', recording_id)
      .single();

    if (recordingError || !recording) {
      console.error('❌ Recording not found:', recordingError);
      return NextResponse.json({ error: 'Recording not found' }, { status: 404 });
    }

    if (recording.transcription_status !== 'pending') {
      console.log('ℹ️ Transcription already processed or in progress');
      return NextResponse.json({ 
        message: 'Transcription already processed',
        status: recording.transcription_status 
      });
    }

    // Update status to processing
    await supabase
      .from('meeting_recordings')
      .update({ transcription_status: 'processing' })
      .eq('id', recording_id);

    console.log('🎙️ Sending to AssemblyAI:', recording_url);

    // Configure transcription options
    const transcriptConfig = {
      audio_url: recording_url,
      speaker_labels: true,
      auto_chapters: true,
      auto_highlights: true,
      sentiment_analysis: true,
      entity_detection: true,
    };

    // Start transcription
    const transcript = await client.transcripts.transcribe(transcriptConfig);

    if (transcript.status === 'error') {
      console.error('❌ AssemblyAI transcription failed:', transcript.error);
      
      // Update status to failed
      await supabase
        .from('meeting_recordings')
        .update({ 
          transcription_status: 'failed',
          processed_at: new Date().toISOString()
        })
        .eq('id', recording_id);

      return NextResponse.json({ 
        error: 'Transcription failed',
        details: transcript.error 
      }, { status: 500 });
    }

    console.log('✅ Transcription completed:', transcript.id);

    // Save transcription results
    const updateData = {
      assemblyai_transcript_id: transcript.id,
      transcription: transcript.text,
      speakers: transcript.utterances || [],
      chapters: transcript.chapters || [],
      highlights: transcript.auto_highlights_result?.results || [],
      sentiment_analysis: transcript.sentiment_analysis_results || [],
      summary: transcript.summary,
      transcription_status: 'completed',
      processed_at: new Date().toISOString()
    };

    const { error: updateError } = await supabase
      .from('meeting_recordings')
      .update(updateData)
      .eq('id', recording_id);

    if (updateError) {
      console.error('❌ Error saving transcription:', updateError);
      return NextResponse.json({ 
        error: 'Failed to save transcription' 
      }, { status: 500 });
    }

    console.log('✅ Transcription saved successfully');

    // Add to queue for OpenAI analysis
    await supabase
      .from('processing_queue')
      .insert({
        meeting_id: recording.meeting_id,
        job_type: 'summary',
        status: 'pending'
      });

    console.log('✅ Added to OpenAI processing queue');

    // Start AI analysis automatically
    try {
      const aiResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/ai/summarize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recording_id: recording_id,
          meeting_id: recording.meeting_id
        })
      });

      if (aiResponse.ok) {
        console.log('✅ AI analysis started automatically');
      } else {
        console.error('❌ Failed to start automatic AI analysis');
      }
    } catch (aiError) {
      console.error('❌ Error starting automatic AI analysis:', aiError);
    }

    return NextResponse.json({
      success: true,
      transcript_id: transcript.id,
      message: 'Transcription completed successfully'
    });

  } catch (error) {
    console.error('❌ Transcription error:', error);
    
    // Update status to failed if we have recording_id
    const body = await request.json().catch(() => ({}));
    if (body.recording_id) {
      await supabase
        .from('meeting_recordings')
        .update({ 
          transcription_status: 'failed',
          processed_at: new Date().toISOString()
        })
        .eq('id', body.recording_id);
    }

    return NextResponse.json({ 
      error: 'Transcription processing failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 