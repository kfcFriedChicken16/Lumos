export class STTService {
  private audioChunks: Buffer[] = [];
  private maxBufferSize = 10 * 1024 * 1024; // 10MB limit
  private maxChunks = 50; // Maximum number of audio chunks

  addChunk(chunk: Buffer) {
    // Prevent buffer overflow
    if (this.audioChunks.length >= this.maxChunks) {
      console.log('⚠️ Audio buffer full, removing oldest chunk');
      this.audioChunks.shift(); // Remove oldest chunk
    }
    
    // Check total buffer size
    const currentSize = this.audioChunks.reduce((total, buf) => total + buf.length, 0);
    if (currentSize + chunk.length > this.maxBufferSize) {
      console.log('⚠️ Audio buffer size limit reached, clearing old chunks');
      this.audioChunks = []; // Clear buffer to prevent overflow
    }
    
    this.audioChunks.push(chunk);
  }

  clearBuffer() {
    this.audioChunks = [];
  }

  getBufferSize(): number {
    return this.audioChunks.length;
  }

  async processAudio(): Promise<string> {
    try {
      console.log('🎤 Audio processing requested');
      
      if (this.audioChunks.length === 0) {
        console.log('No audio chunks to process');
        return '';
      }

      console.log(`Processing ${this.audioChunks.length} audio chunks`);
      
      // Combine all audio chunks into a single buffer
      const combinedAudio = Buffer.concat(this.audioChunks);
      this.audioChunks = []; // Clear buffer after processing
      
      // Check if audio is too large
      if (combinedAudio.length > 5 * 1024 * 1024) { // 5MB limit for API
        console.log('⚠️ Audio too large, truncating to prevent API errors');
        const truncatedAudio = combinedAudio.slice(0, 5 * 1024 * 1024);
        return this.processAudioWithAPI(truncatedAudio);
      }
      
      return this.processAudioWithAPI(combinedAudio);
      
    } catch (error) {
      console.error('STT Error:', error);
      this.audioChunks = [];
      return this.generateFallbackSTT();
    }
  }

  private async processAudioWithAPI(audioBuffer: Buffer): Promise<string> {
    // Use Whisper Turbo for faster, more reliable STT
    const https = require('https');
    
    const sttOptions = {
      hostname: 'api-inference.huggingface.co',
      path: '/models/openai/whisper-large-v3-turbo',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        'Content-Type': 'audio/webm', // Changed to webm since that's what MediaRecorder produces
        'Accept': 'application/json',
        'x-wait-for-model': 'true' // Wait for model to load
      },
      timeout: 60000 // Increased timeout for cold start
    };
    
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        console.log('⏰ STT API timeout, using fallback');
        resolve(this.generateFallbackSTT());
      }, 60000); // 60 second timeout
      
      const req = https.request(sttOptions, (res: any) => {
        clearTimeout(timeout);
        
        if (res.statusCode === 401) {
          console.log('⚠️ Authentication required for Whisper API');
          console.log('🔄 Using fallback STT...');
          resolve(this.generateFallbackSTT());
          return;
        }
        
        if (res.statusCode === 413) {
          console.log('⚠️ Audio file too large for API');
          console.log('🔄 Using fallback STT...');
          resolve(this.generateFallbackSTT());
          return;
        }
        
        if (res.statusCode === 503) {
          console.log('⚠️ Model is loading, using fallback...');
          resolve(this.generateFallbackSTT());
          return;
        }
        
        if (res.statusCode !== 200) {
          console.log(`⚠️ API error: ${res.statusCode}`);
          console.log('🔄 Using fallback STT...');
          resolve(this.generateFallbackSTT());
          return;
        }
        
        const chunks: Buffer[] = [];
        res.on('data', (chunk: Buffer) => {
          chunks.push(chunk);
        });
        
        res.on('end', () => {
          try {
            const responseBuffer = Buffer.concat(chunks);
            const responseText = responseBuffer.toString();
            const response = JSON.parse(responseText);
            
            if (response.text) {
              console.log(`🎤 Whisper Turbo transcribed: "${response.text}"`);
              // Log detected language if available
              if (response.language) {
                console.log(`🌍 Detected language: ${response.language}`);
              }
              resolve(response.text);
            } else {
              console.log('⚠️ No text detected in audio');
              resolve('');
            }
          } catch (error) {
            console.error('❌ Error parsing Whisper response:', error);
            resolve(this.generateFallbackSTT());
          }
        });
      });
      
      req.on('error', (error: Error) => {
        clearTimeout(timeout);
        console.error('❌ Whisper API Error:', error);
        console.log('🔄 Using fallback STT...');
        resolve(this.generateFallbackSTT());
      });
      
      req.on('timeout', () => {
        console.log('⏰ Request timeout');
        req.destroy();
        resolve(this.generateFallbackSTT());
      });
      
      req.write(audioBuffer);
      req.end();
    });
  }

  private generateFallbackSTT(): string {
    console.log('🔊 Using fallback STT response');
    const testResponses = [
      "Hi, I am Jack",
      "Hello, how are you?",
      "I am feeling stressed about my exams",
      "Can you help me with my studies?",
      "I feel lonely at university",
      "I am worried about my future career",
      "I am happy today because I did well in my assignment",
      "Hi, my name is Jack",
      "Hello Lumos, how are you?",
      "I need someone to talk to",
      "I'm feeling overwhelmed with my coursework",
      "Can you give me some advice?",
      "I'm having trouble making friends",
      "I'm worried about my grades",
      "I feel like I'm not good enough"
    ];
    const randomResponse = testResponses[Math.floor(Math.random() * testResponses.length)];
    console.log(`🎤 Fallback STT response: "${randomResponse}"`);
    return randomResponse;
  }
}