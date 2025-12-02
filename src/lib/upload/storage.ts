/**
 * Storage utilities for file uploads
 * Using Cloudinary for audio and image storage
 */

const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || '';
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || '';
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || '';
const CLOUDINARY_UPLOAD_PRESET = process.env.CLOUDINARY_UPLOAD_PRESET || 'v2k-music';

// Allowed file types
const ALLOWED_AUDIO_TYPES = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/flac'];
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

// File size limits (in bytes)
const MAX_AUDIO_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

export interface UploadResult {
  url: string;
  publicId: string;
  format: string;
  size: number;
  duration?: number; // For audio files
}

/**
 * Validate audio file
 */
export function validateAudioFile(file: File): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: 'Nenhum arquivo fornecido' };
  }

  if (!ALLOWED_AUDIO_TYPES.includes(file.type)) {
    return { valid: false, error: 'Formato de áudio inválido. Use MP3, WAV ou FLAC' };
  }

  if (file.size > MAX_AUDIO_SIZE) {
    return { valid: false, error: 'Arquivo de áudio muito grande. Máximo: 50MB' };
  }

  return { valid: true };
}

/**
 * Validate image file
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: 'Nenhuma imagem fornecida' };
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { valid: false, error: 'Formato de imagem inválido. Use JPG ou PNG' };
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return { valid: false, error: 'Imagem muito grande. Máximo: 5MB' };
  }

  return { valid: true };
}

/**
 * Upload audio file to Cloudinary
 */
export async function uploadAudio(file: File, trackId: string): Promise<UploadResult> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', `v2k-music/tracks/${trackId}`);
    formData.append('resource_type', 'video'); // Cloudinary treats audio as video

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/video/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const data = await response.json();

    return {
      url: data.secure_url,
      publicId: data.public_id,
      format: data.format,
      size: data.bytes,
      duration: data.duration,
    };
  } catch (error) {
    console.error('[UPLOAD_AUDIO_ERROR]', error);
    throw new Error('Falha ao fazer upload do áudio');
  }
}

/**
 * Upload image file to Cloudinary
 */
export async function uploadImage(file: File, trackId: string): Promise<UploadResult> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', `v2k-music/covers/${trackId}`);
    formData.append('transformation', 'w_1000,h_1000,c_fill,q_auto:good');

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const data = await response.json();

    return {
      url: data.secure_url,
      publicId: data.public_id,
      format: data.format,
      size: data.bytes,
    };
  } catch (error) {
    console.error('[UPLOAD_IMAGE_ERROR]', error);
    throw new Error('Falha ao fazer upload da imagem');
  }
}

/**
 * Delete file from Cloudinary
 */
export async function deleteFile(publicId: string, resourceType: 'image' | 'video' = 'image'): Promise<void> {
  try {
    // This would typically use Cloudinary's admin API
    // For now, we'll just log it
    console.log('[DELETE_FILE]', publicId, resourceType);
    
    // TODO: Implement actual deletion with Cloudinary admin API
    // Requires server-side signature
  } catch (error) {
    console.error('[DELETE_FILE_ERROR]', error);
  }
}

/**
 * Generate a preview URL for audio (first 30 seconds)
 */
export function generateAudioPreview(audioUrl: string): string {
  // Cloudinary can generate audio previews by adding transformation params
  // For now, return the same URL (implement this based on Cloudinary docs)
  return audioUrl;
}

/**
 * Check if Cloudinary is configured
 */
export function isCloudinaryConfigured(): boolean {
  return !!(CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET);
}
