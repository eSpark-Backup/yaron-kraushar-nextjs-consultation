import { NextApiRequest, NextApiResponse } from "next";
import { inspect } from "util";
import OpenAI from "openai";
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import { sessionManager } from "../../../services/sessions/sessions";

declare global {
  var jimple_openai: OpenAI;
}

if (!global.jimple_openai) {
  global.jimple_openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  console.log("Server: OpenAI Whisper API");

  // Grab session data from server global memory and return it using the context req cookie value
  var user = await sessionManager.GetSessionUser({ req, res });

  if (!user) {
    console.log("NOT AUTHORIZED, PLEASE LOG IN");
    res.status(401).json("NOT AUTHORIZED, PLEASE LOG IN");
    return;
  }

  console.log("Getting audio data buffer from client");
  // Get audio Data as binary
  if (req.method === 'POST') {
    console.log("POST request received");
    const chunks: Buffer[] = [];

    await new Promise<void>((resolve, reject) => {
      console.log("Promise Created");
      req.on('data', (chunk: Buffer) => {
        console.log("Binary Data Length Received:" + chunk.length);
        chunks.push(chunk);
      });

      req.on('end', () => {
        console.log("END Binary Data Length Received:" + chunks.length)
        resolve();
      });

      req.on('error', (err) => {
        console.log("ERROR Binary Data Length Received:" + chunks.length)
        reject(err);
      });
    }); // END Promise

    console.log("Promise Resolved Binary Data Length Received:" + chunks.length)
    const binaryData = Buffer.concat(chunks);
    console.log("Binary Data Length Received:" + binaryData.length);

    const wavData = binaryData; // pcmToWav(binaryData, 16000, 1, 16, 'little', 2);  // Custom byte alignment of 2

    const uniqueFileName = uuidv4() + '.wav'; // Generate a unique name for the WAV file
    const filePath = path.join('/tmp', uniqueFileName); // Change '/tmp' to your desired directory

    // Write binary data to file
    fs.writeFileSync(filePath, wavData);
    console.log("Wrote binary data to file: " + filePath);

    var transcript;

    const user = await sessionManager.GetSessionUser({ req, res });

    var userLanguage = 'en';

    if (user?.userLanguageCode !== undefined ) {
      userLanguage = user.userLanguageCode as string;
    }

    var prompt = "Ensure that the transcription is appropriate for children by replacing any cursing or inappropriate words with '-'";

    try {
      transcript = await global.jimple_openai.audio.transcriptions.create({
        file: fs.createReadStream(filePath),
        model: "whisper-1",
        prompt: prompt,
        response_format: 'verbose_json',
        temperature: 0,
      });
    } catch (e) {
      if (e.status === 429) {
        console.log("Error 429: OpenAI Whisper has rate limited this response.");
        res.status(429).json("OpenAI has rate limited this response. Please try again in 1 minute.");
        return;
      } else {
        console.log("Error:", e);
        res.status(500).json("Error: " + e);
        return;
      }
    } finally {
      // Delete the temporary WAV file
      fs.unlinkSync(filePath);
    }
    
    var languageCode = findLanguageCode(transcript.language);
    console.log("detected language:", inspect(transcript.language));
    console.log("detected language code:", inspect(languageCode));
    if (languageCode == null){
      languageCode = userLanguage;
    }

    var text = sanitizeText(transcript.text);
    console.log("Transcript:", inspect(text));

    res.status(200).send({ text: text, languageCode: languageCode, detectedLanguage: transcript.language });
    return;
  } // END POST

  else {
    res.status(405).end(); // Method not allowed
  }
}

// Add this at the bottom of your API file
export const config = {
  api: {
    bodyParser: false,
  },
};

function pcmToWav(pcmData: Buffer, sampleRate: number, numChannels: number, bitsPerSample: number, inputEndian: 'little' | 'big', customByteAlignment?: number): Buffer {
  const headerBuffer = Buffer.alloc(44);

  // Convert big-endian to little-endian if needed
  if (inputEndian === 'big') {
    for (let i = 0; i < pcmData.length; i += 2) {
      const temp = pcmData[i];
      pcmData[i] = pcmData[i + 1];
      pcmData[i + 1] = temp;
    }
  }

  const subChunk1Size = 16;
  const subChunk2Size = pcmData.length;
  const chunkSize = 4 + (8 + subChunk1Size) + (8 + subChunk2Size);
  const byteAlignment = customByteAlignment ?? (numChannels * bitsPerSample / 8);

  headerBuffer.write('RIFF', 0);                           // ChunkID
  headerBuffer.writeUInt32LE(chunkSize, 4);                // ChunkSize
  headerBuffer.write('WAVE', 8);                           // Format
  headerBuffer.write('fmt ', 12);                          // Subchunk1ID
  headerBuffer.writeUInt32LE(subChunk1Size, 16);           // Subchunk1Size
  headerBuffer.writeUInt16LE(1, 20);                       // AudioFormat
  headerBuffer.writeUInt16LE(numChannels, 22);             // NumChannels
  headerBuffer.writeUInt32LE(sampleRate, 24);              // SampleRate
  headerBuffer.writeUInt32LE(sampleRate * byteAlignment, 28); // ByteRate
  headerBuffer.writeUInt16LE(byteAlignment, 32);           // BlockAlign
  headerBuffer.writeUInt16LE(bitsPerSample, 34);           // BitsPerSample
  headerBuffer.write('data', 36);                          // Subchunk2ID
  headerBuffer.writeUInt32LE(subChunk2Size, 40);           // Subchunk2Size

  return Buffer.concat([headerBuffer, pcmData]);
}

function findLanguageCode(detectedLanguage) {
  try {
    const data = fs.readFileSync("data/iso_639_language_codes.json", 'utf8');
    const languageCodes = JSON.parse(data);

    var inputLanguage = detectedLanguage.toLowerCase();
    for (const entry of Object.entries(languageCodes)) {
      const code: string = entry[0] as string;
      const language: string = entry[1] as string;

      if (language.toLowerCase() === inputLanguage) {
        return code.toLowerCase();
      }
    }

    return null; 
  } catch (err) {
    console.error(`Error reading language codes from file: ${err}`);
    return null;
  }
}

function filterBadWords() {
  try {
    const data = fs.readFileSync("data/bad_words.txt", 'utf8');
    return data.split(/\r?\n/).filter(Boolean); 
  } catch (err) {
    console.error(`Error reading bad words from file: ${err}`);
    return [];
  }
}

function sanitizeText(text) {
  let sanitizedText = text;
  var badWords = filterBadWords();
  badWords.forEach(word => {
    const regex = new RegExp(`\\b${word}(?=[.,!?:;]?\\s|\\b)`, 'gi');
    sanitizedText = sanitizedText.replace(regex, '-');
  });
  return sanitizedText;
}

export default handler;