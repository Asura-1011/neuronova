/**
 * NeuroNova ElevenLabs Text-to-Speech Serverless Function (/api/tts)
 * Secure Serverless Route for Vercel / Node.js
 * 
 * SECURITY:
 * Reads ELEVENLABS_API_KEY strictly on the server environment.
 * Never exposes API keys or secrets to the client.
 */

const VOICE_MAP = {
  // English
  'en-US': 'G4Wh6MqJNTzYtuAeMqv5',
  'en-GB': 'G4Wh6MqJNTzYtuAeMqv5',
  'en': 'G4Wh6MqJNTzYtuAeMqv5',

  // Hindi
  'hi-IN': 'iWNf11sz1GrUE4ppxTOL',
  'hi': 'iWNf11sz1GrUE4ppxTOL',

  // Tamil
  'ta-IN': 'gqFUMFHCD2nbbcYVtPGB',
  'ta': 'gqFUMFHCD2nbbcYVtPGB'
};

const DEFAULT_VOICE_ID = 'G4Wh6MqJNTzYtuAeMqv5';

module.exports = async function handler(req, res) {
  // Allow only POST requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
  }

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    console.warn('[Serverless API /api/tts] ELEVENLABS_API_KEY is missing in environment variables.');
    return res.status(500).json({ error: 'ELEVENLABS_API_KEY not configured on server.' });
  }

  try {
    const { text, language } = req.body || {};
    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Text parameter is required.' });
    }

    // Determine target Voice ID based on selected language
    const langCode = (language || 'en-US').trim();
    const voiceId = VOICE_MAP[langCode] || VOICE_MAP[langCode.split('-')[0]] || DEFAULT_VOICE_ID;

    // Call ElevenLabs Text-to-Speech API
    const elevenLabsUrl = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;
    const elevenResponse = await fetch(elevenLabsUrl, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey
      },
      body: JSON.stringify({
        text: text.trim(),
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.0,
          use_speaker_boost: true
        }
      })
    });

    if (!elevenResponse.ok) {
      const errorText = await elevenResponse.text();
      console.error('[Serverless API /api/tts] ElevenLabs API error:', elevenResponse.status, errorText);
      return res.status(elevenResponse.status).json({ error: 'ElevenLabs API error: ' + errorText });
    }

    // Stream binary MP3 audio back to client
    const audioBuffer = await elevenResponse.arrayBuffer();
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return res.status(200).send(Buffer.from(audioBuffer));

  } catch (err) {
    console.error('[Serverless API /api/tts] Server error:', err);
    return res.status(500).json({ error: 'Internal server error: ' + err.message });
  }
};
