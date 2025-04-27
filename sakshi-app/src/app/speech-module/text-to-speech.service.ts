import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import {ConfigService} from "@/_services/config.service";
import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import * as path from "node:path";
import * as fs from "node:fs";
import {google} from "@google-cloud/text-to-speech/build/protos/protos";
import AudioEncoding = google.cloud.texttospeech.v1.AudioEncoding;

@Injectable({
  providedIn: 'root'
})
export class TextToSpeechService {

  private readonly API_URL = 'https://texttospeech.googleapis.com/v1/text:synthesize';

  constructor(private http: HttpClient, private cfgSrc: ConfigService) {
    // Ensure the API key is set in the environment configuration
    console.log("Google API Key:", this.cfgSrc.get('GOOGLE_API_KEY'));
    if (!this.cfgSrc.get('GOOGLE_API_KEY')) {
      throw new Error('Google API key is not set in the environment configuration.');
    }
    this.synthesizeSpeech("Hello World").subscribe(
      (response) => {
        console.log('Audio response:', response);
      },
      (error) => {
        console.error('Error synthesizing speech:', error);
      }
    );
  }

  synthesizeSpeech(text: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.cfgSrc.get('GOOGLE_API_KEY')}`,
      'X-Goog-User-Project': this.cfgSrc.get('PROJECT_ID')
    });

    const requestBody = {
      input: {
        markup: text
      },
      voice: {
        languageCode: 'en-IN',
        name: 'en-IN-Chirp3-HD-Leda'
      },
      audioConfig: {
        audioEncoding: 'MP3'
      }
    };

    const resp = this.http.post(this.API_URL, requestBody, { headers });
    resp.subscribe((response) => {
      return response;
    //   const audioContent = response.audioContent;
    //   if (audioContent) {
    //     const outputPath = path.join(__dirname, 'output.mp3');
    //     fs.writeFileSync(outputPath, audioContent, 'base64');
    //     console.log('Audio content written to file "output.mp3"');
    //   } else {
    //     console.error('No audio content received in the response.');
    //   }
    // }, (error) => {
    //   console.error('Error synthesizing speech:', error);
    });
    return resp;
  }


}

// export class TextToSpeechService {
//   private client: TextToSpeechClient;
//
//   constructor() {
//     // Initialize the Google Cloud Text-to-Speech client
//     this.client = new TextToSpeechClient();
//     this.synthesizeSpeech("Hello World").then(() => {
//       console.log('Speech synthesis completed.');
//     }).catch((error) => {
//       console.error('Error during speech synthesis:', error);
//     }
//     );
//   }
//
//   // Method to synthesize speech from a given text
//   public async synthesizeSpeech(text: string): Promise<void> {
//     // Set the text input to be synthesized
//     const synthesisInput = {
//       text: text,
//     };
//
//     // Set the voice parameters
//     const voice = {
//       languageCode: 'en-IN',
//       name: 'en-IN-Chirp3-HD-Leda',
//     };
//
//     // Set the audio configuration
//     const audioConfig = {
//       audioEncoding: AudioEncoding.MP3,
//     };
//
//     try {
//       // Perform the text-to-speech request with the selected voice parameters and audio file type
//       // @ts-ignore
//       const [response] = this.client.synthesizeSpeech({
//         input: synthesisInput,
//         voice: voice,
//         audioConfig: audioConfig,
//       });
//
//       // Define the output path
//       const outputPath = path.join(__dirname, 'output.mp3');
//
//       // Write the audio content to an output file
//       fs.writeFileSync(outputPath, response.audioContent);
//       console.log('Audio content written to file "output.mp3"');
//     } catch (error) {
//       console.error('Error synthesizing speech:', error);
//     }
//   }
// }
