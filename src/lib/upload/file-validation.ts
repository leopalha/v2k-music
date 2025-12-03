/**
 * File Validation with Magic Bytes
 * Validates files beyond just extension/MIME type by checking file signatures
 */

// Magic bytes signatures for common file types
const MAGIC_BYTES = {
  // Audio formats
  MP3: [
    [0xFF, 0xFB],      // MPEG Audio Layer 3
    [0xFF, 0xF3],      // MPEG Audio Layer 3
    [0xFF, 0xF2],      // MPEG Audio Layer 3
    [0x49, 0x44, 0x33], // ID3v2 (MP3 with metadata)
  ],
  WAV: [[0x52, 0x49, 0x46, 0x46]], // "RIFF" + WAVE format
  FLAC: [[0x66, 0x4C, 0x61, 0x43]], // "fLaC"
  
  // Image formats
  JPEG: [
    [0xFF, 0xD8, 0xFF, 0xE0], // JPEG/JFIF
    [0xFF, 0xD8, 0xFF, 0xE1], // JPEG/EXIF
    [0xFF, 0xD8, 0xFF, 0xE2], // JPEG
  ],
  PNG: [[0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]], // PNG signature
  WEBP: [[0x52, 0x49, 0x46, 0x46]], // "RIFF" + WEBP
};

/**
 * Read first N bytes from file
 */
async function readFileHeader(file: File, length: number = 12): Promise<number[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      if (!e.target?.result) {
        reject(new Error('Failed to read file'));
        return;
      }
      
      const buffer = new Uint8Array(e.target.result as ArrayBuffer);
      resolve(Array.from(buffer.slice(0, length)));
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file.slice(0, length));
  });
}

/**
 * Check if bytes match signature
 */
function matchesSignature(bytes: number[], signature: number[]): boolean {
  if (bytes.length < signature.length) return false;
  
  for (let i = 0; i < signature.length; i++) {
    if (bytes[i] !== signature[i]) return false;
  }
  
  return true;
}

/**
 * Validate audio file with magic bytes
 */
export async function validateAudioMagicBytes(file: File): Promise<{
  valid: boolean;
  format?: string;
  error?: string;
}> {
  try {
    const bytes = await readFileHeader(file, 12);
    
    // Check MP3
    for (const signature of MAGIC_BYTES.MP3) {
      if (matchesSignature(bytes, signature)) {
        return { valid: true, format: 'MP3' };
      }
    }
    
    // Check WAV
    for (const signature of MAGIC_BYTES.WAV) {
      if (matchesSignature(bytes, signature)) {
        // WAV files have "WAVE" at bytes 8-11
        const waveBytes = bytes.slice(8, 12);
        const waveSignature = [0x57, 0x41, 0x56, 0x45]; // "WAVE"
        if (matchesSignature(waveBytes, waveSignature)) {
          return { valid: true, format: 'WAV' };
        }
      }
    }
    
    // Check FLAC
    for (const signature of MAGIC_BYTES.FLAC) {
      if (matchesSignature(bytes, signature)) {
        return { valid: true, format: 'FLAC' };
      }
    }
    
    return {
      valid: false,
      error: 'Arquivo de áudio inválido. Apenas MP3, WAV e FLAC são permitidos.',
    };
  } catch (error) {
    console.error('[MAGIC_BYTES_ERROR]', error);
    return {
      valid: false,
      error: 'Erro ao validar arquivo',
    };
  }
}

/**
 * Validate image file with magic bytes
 */
export async function validateImageMagicBytes(file: File): Promise<{
  valid: boolean;
  format?: string;
  error?: string;
}> {
  try {
    const bytes = await readFileHeader(file, 12);
    
    // Check JPEG
    for (const signature of MAGIC_BYTES.JPEG) {
      if (matchesSignature(bytes, signature)) {
        return { valid: true, format: 'JPEG' };
      }
    }
    
    // Check PNG
    for (const signature of MAGIC_BYTES.PNG) {
      if (matchesSignature(bytes, signature)) {
        return { valid: true, format: 'PNG' };
      }
    }
    
    // Check WEBP
    for (const signature of MAGIC_BYTES.WEBP) {
      if (matchesSignature(bytes, signature)) {
        // WEBP files have "WEBP" at bytes 8-11
        const webpBytes = bytes.slice(8, 12);
        const webpSignature = [0x57, 0x45, 0x42, 0x50]; // "WEBP"
        if (matchesSignature(webpBytes, webpSignature)) {
          return { valid: true, format: 'WEBP' };
        }
      }
    }
    
    return {
      valid: false,
      error: 'Arquivo de imagem inválido. Apenas JPG, PNG e WEBP são permitidos.',
    };
  } catch (error) {
    console.error('[MAGIC_BYTES_ERROR]', error);
    return {
      valid: false,
      error: 'Erro ao validar imagem',
    };
  }
}

/**
 * Complete validation: MIME type + size + magic bytes
 */
export async function validateUploadFile(
  file: File,
  type: 'audio' | 'image'
): Promise<{ valid: boolean; error?: string }> {
  // Basic checks first
  if (!file) {
    return { valid: false, error: 'Nenhum arquivo fornecido' };
  }
  
  // Size checks
  const maxSize = type === 'audio' ? 50 * 1024 * 1024 : 5 * 1024 * 1024;
  if (file.size > maxSize) {
    const maxMB = type === 'audio' ? '50MB' : '5MB';
    return { valid: false, error: `Arquivo muito grande. Máximo: ${maxMB}` };
  }
  
  // MIME type check
  const allowedMimes = type === 'audio' 
    ? ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/flac']
    : ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    
  if (!allowedMimes.includes(file.type)) {
    const formats = type === 'audio' ? 'MP3, WAV ou FLAC' : 'JPG, PNG ou WEBP';
    return { valid: false, error: `Formato inválido. Use ${formats}` };
  }
  
  // Magic bytes validation (deep check)
  const magicBytesResult = type === 'audio'
    ? await validateAudioMagicBytes(file)
    : await validateImageMagicBytes(file);
    
  return magicBytesResult;
}
