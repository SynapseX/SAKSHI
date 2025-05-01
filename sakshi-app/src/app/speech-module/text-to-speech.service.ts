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
  constructor(private http: HttpClient, private cfgSrc: ConfigService) {
    // Ensure the API key is set in the environment configuration
    // console.log("Google API Key:", this.cfgSrc.get('GOOGLE_API_KEY'));
    // if (!this.cfgSrc.get('GOOGLE_API_KEY')) {
    //   throw new Error('Google API key is not set in the environment configuration.');
    // }
    const therapistText = `
    I'm really glad you came in today. It takes courage to open up,
    and I want you to know that this is a safe space where you can share whatever is on your mind.
    It's completely okay to feel overwhelmed or uncertain—those feelings are valid.
    Together, we'll explore what's been troubling you and work towards understanding and healing.
    Remember, you're not alone in this journey, and I'm here to support you every step of the way.
    `;

    // this.synthesizeSpeech(therapistText).subscribe(
    //   (response) => {
    //     console.log('Audio response:', response);
    //   },
    //   (error) => {
    //     console.error('Error synthesizing speech:', error);
    //   }
    // );
  }

  synthesizeSpeech(text: string): Observable<any> {
      return this.http.post('http://localhost:3000/text-to-speech', { text }, { responseType: 'blob' });
  }
}
