// Google Cloud Function to proxy OpenAI API requests (Whisper + GPT)
const fetch = require('node-fetch');
const formidable = require('formidable-serverless');

exports.openaiProxy = async (req, res) => {
  // Enable CORS
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  try {
    const contentType = req.headers['content-type'] || '';
    
    // Handle JSON requests (GPT-4 chat completions)
    if (contentType.includes('application/json')) {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify(req.body)
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error('OpenAI Chat API error:', data);
        res.status(response.status).json(data);
        return;
      }

      res.status(200).json(data);
      return;
    }
    
    // Handle multipart form data (Whisper audio transcription)
    if (contentType.includes('multipart/form-data')) {
      const form = new formidable.IncomingForm();
      
      form.parse(req, async (err, fields, files) => {
        if (err) {
          console.error('Form parse error:', err);
          res.status(400).json({ error: 'Failed to parse form data' });
          return;
        }

        const audioFile = files.file;
        const model = fields.model || 'whisper-1';
        const language = fields.language;
        const prompt = fields.prompt;

        if (!audioFile) {
          res.status(400).json({ error: 'No audio file provided' });
          return;
        }

        // Forward to OpenAI
        const FormData = require('form-data');
        const fs = require('fs');
        
        const formData = new FormData();
        formData.append('file', fs.createReadStream(audioFile.path), {
          filename: audioFile.name,
          contentType: audioFile.type
        });
        formData.append('model', model);
        if (language) formData.append('language', language);
        if (prompt) formData.append('prompt', prompt);

        const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            ...formData.getHeaders()
          },
          body: formData
        });

        const data = await response.json();
        
        if (!response.ok) {
          console.error('OpenAI Whisper API error:', data);
          res.status(response.status).json(data);
          return;
        }

        res.status(200).json(data);
      });
      return;
    }
    
    res.status(400).json({ error: 'Unsupported content type' });
    
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: error.message });
  }
};
