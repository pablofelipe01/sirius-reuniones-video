#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const OpenAI = require('openai');
const { AssemblyAI } = require('assemblyai');

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

// Test results
const results = {
  passed: 0,
  failed: 0,
  warnings: 0
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(name, passed, details = '') {
  const status = passed ? '✅ PASS' : '❌ FAIL';
  const statusColor = passed ? 'green' : 'red';
  
  if (passed) {
    results.passed++;
  } else {
    results.failed++;
  }
  
  log(`${status} ${name}`, statusColor);
  if (details) {
    log(`    ${details}`, 'cyan');
  }
}

function logWarning(name, details) {
  results.warnings++;
  log(`⚠️  WARN ${name}`, 'yellow');
  if (details) {
    log(`    ${details}`, 'cyan');
  }
}

async function loadEnvVars() {
  try {
    require('dotenv').config({ path: '.env.local' });
    return true;
  } catch (error) {
    try {
      require('dotenv').config();
      return true;
    } catch (error2) {
      return false;
    }
  }
}

async function testEnvironmentVariables() {
  log('\n🔧 Testing Environment Variables...', 'bold');
  
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'LIVEKIT_API_KEY',
    'LIVEKIT_API_SECRET',
    'NEXT_PUBLIC_LIVEKIT_URL',
    'ASSEMBLYAI_API_KEY',
    'OPENAI_API_KEY'
  ];

  let allPresent = true;
  
  for (const varName of requiredVars) {
    const value = process.env[varName];
    if (value) {
      logTest(`${varName}`, true, 'Set');
    } else {
      logTest(`${varName}`, false, 'Missing');
      allPresent = false;
    }
  }

  return allPresent;
}

async function testSupabaseConnection() {
  log('\n🗄️ Testing Supabase Connection...', 'bold');
  
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    // Test basic connection
    const { data, error } = await supabase.from('meetings').select('count').limit(1);
    
    if (error) {
      logTest('Supabase Connection', false, error.message);
      return false;
    }

    logTest('Supabase Connection', true, 'Connected successfully');

    // Test required tables
    const tables = ['meetings', 'meeting_recordings', 'chat_messages', 'whiteboard_snapshots', 'processing_queue'];
    let tablesExist = true;

    for (const table of tables) {
      try {
        const { error: tableError } = await supabase.from(table).select('*').limit(1);
        if (tableError) {
          logTest(`Table: ${table}`, false, tableError.message);
          tablesExist = false;
        } else {
          logTest(`Table: ${table}`, true, 'Accessible');
        }
      } catch (err) {
        logTest(`Table: ${table}`, false, err.message);
        tablesExist = false;
      }
    }

    return tablesExist;

  } catch (error) {
    logTest('Supabase Connection', false, error.message);
    return false;
  }
}

async function testAssemblyAI() {
  log('\n🎙️ Testing AssemblyAI Connection...', 'bold');
  
  try {
    const client = new AssemblyAI({
      apiKey: process.env.ASSEMBLYAI_API_KEY
    });

    // Test API key by getting account info
    const response = await fetch('https://api.assemblyai.com/v2/account', {
      headers: {
        'Authorization': process.env.ASSEMBLYAI_API_KEY
      }
    });

    if (response.ok) {
      const accountInfo = await response.json();
      logTest('AssemblyAI Connection', true, `Account ID: ${accountInfo.id}`);
      return true;
    } else {
      logTest('AssemblyAI Connection', false, `HTTP ${response.status}`);
      return false;
    }

  } catch (error) {
    logTest('AssemblyAI Connection', false, error.message);
    return false;
  }
}

async function testOpenAI() {
  log('\n🤖 Testing OpenAI Connection...', 'bold');
  
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Test with a simple completion
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: "Test connection. Reply with just 'OK'." }],
      max_tokens: 5,
    });

    const response = completion.choices[0]?.message?.content;
    
    if (response) {
      logTest('OpenAI Connection', true, `Response: ${response.trim()}`);
      return true;
    } else {
      logTest('OpenAI Connection', false, 'No response received');
      return false;
    }

  } catch (error) {
    logTest('OpenAI Connection', false, error.message);
    return false;
  }
}

async function testLiveKitToken() {
  log('\n🎥 Testing LiveKit Token Generation...', 'bold');
  
  try {
    const { AccessToken } = require('livekit-server-sdk');
    
    const token = new AccessToken(
      process.env.LIVEKIT_API_KEY,
      process.env.LIVEKIT_API_SECRET,
      {
        identity: 'test-user',
        ttl: '10m',
      }
    );
    
    token.addGrant({
      room: 'test-room',
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
    });

    const jwt = await token.toJwt();
    
    if (jwt && jwt.length > 0) {
      logTest('LiveKit Token Generation', true, 'Token generated successfully');
      return true;
    } else {
      logTest('LiveKit Token Generation', false, 'Empty token generated');
      return false;
    }

  } catch (error) {
    logTest('LiveKit Token Generation', false, error.message);
    return false;
  }
}

async function testAPIEndpoints() {
  log('\n🌐 Testing API Endpoints...', 'bold');
  
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const endpoints = [
    '/api/test-db',
    '/api/test-auth',
    '/api/meetings',
    '/api/livekit/token'
  ];

  let allWorking = true;

  // Note: This would require the server to be running
  logWarning('API Endpoint Tests', 'Requires development server to be running. Skipping for now.');
  
  return true; // Skip for now since server might not be running
}

async function testDatabaseSchema() {
  log('\n📋 Testing Database Schema...', 'bold');
  
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Test meetings table structure
    const { data: meetings, error: meetingsError } = await supabase
      .from('meetings')
      .select('id, title, room_name, created_at')
      .limit(1);

    if (meetingsError) {
      logTest('Meetings Table Schema', false, meetingsError.message);
    } else {
      logTest('Meetings Table Schema', true, 'Required columns present');
    }

    // Test meeting_recordings table structure
    const { data: recordings, error: recordingsError } = await supabase
      .from('meeting_recordings')
      .select('id, meeting_id, recording_url, transcription, summary, speakers, chapters')
      .limit(1);

    if (recordingsError) {
      logTest('Recordings Table Schema', false, recordingsError.message);
    } else {
      logTest('Recordings Table Schema', true, 'AI columns present');
    }

    // Test chat_messages table structure
    const { data: messages, error: messagesError } = await supabase
      .from('chat_messages')
      .select('id, meeting_id, user_id, message, created_at')
      .limit(1);

    if (messagesError) {
      logTest('Chat Messages Table Schema', false, messagesError.message);
    } else {
      logTest('Chat Messages Table Schema', true, 'Required columns present');
    }

    return !meetingsError && !recordingsError && !messagesError;

  } catch (error) {
    logTest('Database Schema', false, error.message);
    return false;
  }
}

async function runAllTests() {
  log('🚀 Starting Sirius Platform System Tests...', 'bold');
  log('=' * 50, 'cyan');

  // Load environment variables
  const envLoaded = await loadEnvVars();
  if (!envLoaded) {
    log('❌ Could not load environment variables. Make sure .env.local exists.', 'red');
    return;
  }

  // Run all tests
  const envVarsOk = await testEnvironmentVariables();
  const supabaseOk = await testSupabaseConnection();
  const assemblyaiOk = await testAssemblyAI();
  const openaiOk = await testOpenAI();
  const livekitOk = await testLiveKitToken();
  const schemaOk = await testDatabaseSchema();
  const apisOk = await testAPIEndpoints();

  // Summary
  log('\n📊 Test Results Summary', 'bold');
  log('=' * 30, 'cyan');
  log(`✅ Passed: ${results.passed}`, 'green');
  log(`❌ Failed: ${results.failed}`, 'red');
  log(`⚠️  Warnings: ${results.warnings}`, 'yellow');

  const overallSuccess = results.failed === 0;
  
  if (overallSuccess) {
    log('\n🎉 ALL SYSTEMS OPERATIONAL!', 'green');
    log('The Sirius Platform is ready for production use.', 'green');
  } else {
    log('\n⚠️  SOME ISSUES DETECTED', 'yellow');
    log('Please fix the failed tests before deploying.', 'yellow');
  }

  log('\n🔧 System Status:', 'bold');
  log(`• Environment Variables: ${envVarsOk ? '✅' : '❌'}`, envVarsOk ? 'green' : 'red');
  log(`• Supabase Database: ${supabaseOk ? '✅' : '❌'}`, supabaseOk ? 'green' : 'red');
  log(`• AssemblyAI (Transcription): ${assemblyaiOk ? '✅' : '❌'}`, assemblyaiOk ? 'green' : 'red');
  log(`• OpenAI (Analysis): ${openaiOk ? '✅' : '❌'}`, openaiOk ? 'green' : 'red');
  log(`• LiveKit (Video): ${livekitOk ? '✅' : '❌'}`, livekitOk ? 'green' : 'red');
  log(`• Database Schema: ${schemaOk ? '✅' : '❌'}`, schemaOk ? 'green' : 'red');

  return overallSuccess;
}

// Run tests if called directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = { runAllTests }; 