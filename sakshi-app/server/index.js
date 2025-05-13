const express = require("express");
const cors = require("cors");
const fs = require("fs");
const util = require("util");
const multer = require("multer");
const { TextToSpeechClient } = require("@google-cloud/text-to-speech");
const { SpeechClient } = require("@google-cloud/speech");

const app = express();
const PORT = 3000;
const path = require("path");

// Setup
app.use(cors());
app.use(express.json());

// Auth
process.env.GOOGLE_APPLICATION_CREDENTIALS = "./server/google-credentials.json";

const ttsClient = new TextToSpeechClient();
const sttClient = new SpeechClient();

// Setup multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || ".webm"; // Use the original extension or fallback to .webm
    const baseName = path.basename(file.originalname, ext); // Get the base name without extension
    const uniqueName = `${Date.now()}-${baseName.replace(/\s+/g, "_")}`;
    cb(null, uniqueName + ext);
  },
});

const upload = multer({ storage });
/** TEXT TO SPEECH **/
app.post("/text-to-speech", async (req, res) => {
  const { text } = req.body;

  if (!text) return res.status(200).json({ msg: "" });

  const request = {
    input: { text },
    voice: { languageCode: "en-IN", name: "en-IN-Chirp3-HD-Leda" },
    audioConfig: { audioEncoding: "MP3" },
  };

  try {
    const [response] = await ttsClient.synthesizeSpeech(request);
    const path = require("path");
    const outputPath = path.join(__dirname, "output.mp3");
    await util.promisify(fs.writeFile)(
      outputPath,
      response.audioContent,
      "binary"
    );
    console.log("Sending file:", outputPath);
    res.sendFile("output.mp3", { root: __dirname }, (err) => {
      if (err) {
        console.error("Error sending file:", err);
      } else {
        console.log("File sent successfully");
      }
    });
  } catch (error) {
    console.error("TTS Error:", error);
    res.status(500).json({ error: "Text to Speech failed" });
  }
});

/** SPEECH TO TEXT **/
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffmpeg = require("fluent-ffmpeg");
ffmpeg.setFfmpegPath(ffmpegPath);

// app.post('/speech-to-text', upload.single('audio'), async (req, res) => {
//   try {
//     const stats = fs.statSync(req.file.path);
//     console.log(`File size: ${stats.size} bytes`);
//     const file = fs.readFileSync(req.file.path);
//     console.log(req.file.path)
//     console.log(req.file.filename)
//     const audioBytes = file.toString('base64');
//
//     // Convert webm to wav (linear16)
//     const outputPath = "./uploads/"+req.file.filename+".wav";
//     ffmpeg(req.file.path)
//       .inputFormat('webm')  // Force FFmpeg to treat it as a WebM file
//       .output(outputPath)
//       .audioCodec('pcm_s16le') // LINEAR16
//       .audioChannels(1) // Mono audio
//       .on('end', async () => {
//         // Now you can send the wav file to Google Cloud Speech-to-Text
//         const audio = { content: fs.readFileSync(outputPath).toString('base64') };
//         const config = {
//           encoding: 'LINEAR16',
//           languageCode: 'en-US',
//         };
//
//         const [response] = await sttClient.recognize({ audio, config });
//         const transcript = response.results.map(result => result.alternatives[0].transcript).join('\n');
//         console.log(transcript);
//         res.json({ text: transcript });
//       })
//       .on('error', (err, stdout, stderr) => {
//         console.error('FFmpeg Error:', err);
//         console.error('FFmpeg Output:', stdout);
//         console.error('FFmpeg Error Output:', stderr);
//       })
//       .run();
//   } catch (error) {
//     console.error('STT Error:', error);
//     res.status(500).json({ error: 'Speech to Text failed' });
//   }
// });

app.post("/speech-to-text", upload.single("audio"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No audio file uploaded" });
  }

  const filePath = path.join(__dirname, "uploads", req.file.filename);
  console.log("Audio received and saved:", req.file.filename);

  const inputPath = filePath;
  inputPath.replace(".webm", "");
  const outputPath = inputPath + "_converted.wav";

  // Add inputFormat explicitly if needed
  ffmpeg(inputPath)
    .inputFormat("webm") // Important if file has no extension
    .toFormat("wav")
    .on("end", () => {
      console.log("Conversion succeeded:", outputPath);
      res.json({ message: "Success", path: outputPath });
    })
    .on("error", (err) => {
      console.error("FFmpeg Error:", err.message);
      res.status(500).json({ error: "Audio conversion failed" });
    })
    .save(outputPath);
});

app.listen(PORT, () => {
  console.log(`🚀 Server ready at http://localhost:${PORT}`);
});
