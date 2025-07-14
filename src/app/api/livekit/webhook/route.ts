/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { WebhookReceiver } from 'livekit-server-sdk';
import { createClient } from '@supabase/supabase-js';

const webhookReceiver = new WebhookReceiver(
  process.env.LIVEKIT_API_KEY!,
  process.env.LIVEKIT_API_SECRET!
);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  console.log('🎣 LiveKit webhook received');
  
  try {
    const body = await request.text();
    const signature = request.headers.get('livekit-signature');
    
    if (!signature) {
      console.error('❌ Missing LiveKit signature');
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    // Verify webhook signature and parse event
    const event = await webhookReceiver.receive(body, signature);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const eventData = event as any;
    console.log('📡 Event type:', eventData.event, 'Room:', eventData.room?.name);

    // Handle different event types
    switch (eventData.event) {
      case 'recording_finished':
        await handleRecordingFinished(eventData);
        break;
      case 'recording_failed':
        await handleRecordingFailed(eventData);
        break;
      case 'room_started':
        await handleRoomStarted(eventData);
        break;
      case 'room_finished':
        await handleRoomFinished(eventData);
        break;
      default:
        console.log('ℹ️ Unhandled event type:', eventData.event);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

async function handleRecordingFinished(event: any) {
  console.log('🎬 Recording finished for room:', event.room?.name);
  
  if (!event.egressInfo?.fileResults) {
    console.error('❌ No file results in recording event');
    return;
  }

  try {
    // Find meeting by room name
    const { data: meeting, error: meetingError } = await supabase
      .from('meetings')
      .select('id, title')
      .eq('room_name', event.room.name)
      .single();

    if (meetingError || !meeting) {
      console.error('❌ Meeting not found for room:', event.room.name, meetingError);
      return;
    }

    // Extract recording URLs
    const fileResults = event.egressInfo.fileResults;
    const videoResult = fileResults.find((file: any) => file.filename.endsWith('.mp4'));
    const audioResult = fileResults.find((file: any) => file.filename.endsWith('.mp3') || file.filename.endsWith('.wav'));

    if (!videoResult) {
      console.error('❌ No video file found in recording results');
      return;
    }

    // Save recording to database
    const { data: recording, error: saveError } = await supabase
      .from('meeting_recordings')
      .insert({
        meeting_id: meeting.id,
        recording_url: videoResult.downloadUrl || videoResult.location,
        audio_url: audioResult?.downloadUrl || audioResult?.location,
        duration_seconds: Math.round(videoResult.duration || 0),
        file_size_mb: Math.round((videoResult.size || 0) / (1024 * 1024) * 100) / 100,
        transcription_status: 'pending'
      })
      .select()
      .single();

    if (saveError) {
      console.error('❌ Error saving recording:', saveError);
      return;
    }

    console.log('✅ Recording saved:', recording.id, 'for meeting:', meeting.title);

    // Add to processing queue for transcription
    await supabase
      .from('processing_queue')
      .insert({
        meeting_id: meeting.id,
        job_type: 'transcription',
        status: 'pending'
      });

    console.log('✅ Added to transcription queue');

    // Start transcription automatically
    try {
      const transcriptionResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/transcription/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recording_id: recording.id,
          recording_url: videoResult.downloadUrl || videoResult.location
        })
      });

      if (transcriptionResponse.ok) {
        console.log('✅ Transcription started automatically');
      } else {
        console.error('❌ Failed to start automatic transcription');
      }
    } catch (transcriptionError) {
      console.error('❌ Error starting automatic transcription:', transcriptionError);
    }

  } catch (error) {
    console.error('❌ Error handling recording finished:', error);
  }
}

async function handleRecordingFailed(event: any) {
  console.error('❌ Recording failed for room:', event.room?.name, 'Error:', event.egressInfo?.error);
  
  // TODO: Log to database and notify admins
}

async function handleRoomStarted(event: any) {
  console.log('🚀 Room started:', event.room?.name);
  
  try {
    // Update meeting started_at timestamp
    const { error: updateError } = await supabase
      .from('meetings')
      .update({ 
        started_at: new Date().toISOString(),
        livekit_room_sid: event.room.sid 
      })
      .eq('room_name', event.room.name);

    if (updateError) {
      console.error('❌ Error updating meeting start time:', updateError);
    } else {
      console.log('✅ Meeting start time updated for room:', event.room.name);
    }

  } catch (error) {
    console.error('❌ Error handling room started:', error);
  }
}

async function handleRoomFinished(event: any) {
  console.log('🏁 Room finished:', event.room?.name);
  
  try {
    // Update meeting ended_at timestamp
    const { error: updateError } = await supabase
      .from('meetings')
      .update({ ended_at: new Date().toISOString() })
      .eq('room_name', event.room.name);

    if (updateError) {
      console.error('❌ Error updating meeting end time:', updateError);
    } else {
      console.log('✅ Meeting end time updated for room:', event.room.name);
    }

  } catch (error) {
    console.error('❌ Error handling room finished:', error);
  }
} 