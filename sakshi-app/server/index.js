const express = require('express');
const cors = require('cors');
const fs = require('fs');
const util = require('util');
const multer = require('multer');
const { TextToSpeechClient } = require('@google-cloud/text-to-speech');
const { SpeechClient } = require('@google-cloud/speech');

const app = express();
const PORT = 3000;

// Setup
app.use(cors());
app.use(express.json());

// Auth
process.env.GOOGLE_APPLICATION_CREDENTIALS = './server/google-credentials.json';

const ttsClient = new TextToSpeechClient();
const sttClient = new SpeechClient();

const upload = multer({ dest: 'uploads/' });

/** TEXT TO SPEECH **/
app.post('/text-to-speech', async (req, res) => {
  const { text } = req.body;
  console.log(text);

  const request = {
    input: { text },
    voice: { languageCode: 'en-IN',
      name: "en-IN-Chirp3-HD-Leda" },
    audioConfig: { audioEncoding: 'MP3' },
  };

  try {
    const [response] = await ttsClient.synthesizeSpeech(request);
    const path = require('path');
    const outputPath = path.join(__dirname, 'output.mp3');
    console.log(outputPath);
    await util.promisify(fs.writeFile)(outputPath, response.audioContent, 'binary');
    res.sendFile(outputPath, { root: __dirname }, () => {
      fs.unlinkSync(outputPath);
    });
  } catch (error) {
    console.error('TTS Error:', error);
    res.status(500).json({ error: 'Text to Speech failed' });
  }
});

/** SPEECH TO TEXT **/
app.post('/speech-to-text', upload.single('audio'), async (req, res) => {
  try {
    const file = fs.readFileSync(req.file.path);
    const audioBytes = file.toString('base64');

    const audio = { content: audioBytes };
    const config = {
      encoding: 'LINEAR16',
      sampleRateHertz: 16000,
      languageCode: 'en-US',
    };

    const [response] = await sttClient.recognize({ audio, config });
    const transcript = response.results.map(result => result.alternatives[0].transcript).join('\n');

    fs.unlinkSync(req.file.path);
    res.json({ text: transcript });
  } catch (error) {
    console.error('STT Error:', error);
    res.status(500).json({ error: 'Speech to Text failed' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server ready at http://localhost:${PORT}`);
});

