import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { prisma } from '@/lib/db/prisma';
import { uploadAudio, uploadImage, validateAudioFile, validateImageFile } from '@/lib/upload/storage';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting (prevent upload spam)
    const rateLimitCheck = await checkRateLimit(request, RATE_LIMITS.UPLOAD);
    if (!rateLimitCheck.allowed) {
      return rateLimitCheck.response;
    }

    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Parse form data
    const formData = await request.formData();
    
    const title = formData.get('title') as string;
    const artistName = formData.get('artistName') as string || session.user.name || 'Unknown';
    const genre = formData.get('genre') as string;
    const currentPrice = parseFloat(formData.get('pricePerToken') as string);
    const totalSupply = parseInt(formData.get('totalSupply') as string);
    const audioFile = formData.get('audio') as File;
    const coverFile = formData.get('cover') as File;

    // Validate required fields
    if (!title || !genre || !audioFile || !coverFile) {
      return NextResponse.json(
        { error: 'Campos obrigatórios faltando' },
        { status: 400 }
      );
    }

    // Validate title
    if (title.length < 3 || title.length > 100) {
      return NextResponse.json(
        { error: 'Título deve ter entre 3 e 100 caracteres' },
        { status: 400 }
      );
    }

    // Validate price
    if (isNaN(currentPrice) || currentPrice < 0.01 || currentPrice > 100) {
      return NextResponse.json(
        { error: 'Preço inválido (mín: R$ 0.01, máx: R$ 100)' },
        { status: 400 }
      );
    }

    // Validate total supply
    if (isNaN(totalSupply) || totalSupply < 1000 || totalSupply > 100000) {
      return NextResponse.json(
        { error: 'Total de tokens inválido (mín: 1000, máx: 100000)' },
        { status: 400 }
      );
    }

    // Validate audio file
    const audioValidation = validateAudioFile(audioFile);
    if (!audioValidation.valid) {
      return NextResponse.json(
        { error: audioValidation.error },
        { status: 400 }
      );
    }

    // Validate image file
    const imageValidation = validateImageFile(coverFile);
    if (!imageValidation.valid) {
      return NextResponse.json(
        { error: imageValidation.error },
        { status: 400 }
      );
    }

    // Generate track ID first
    const trackId = `track_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Upload files to Cloudinary
    let audioUrl: string;
    let coverUrl: string;
    let duration: number | undefined;

    try {
      // Upload audio
      const audioResult = await uploadAudio(audioFile, trackId);
      audioUrl = audioResult.url;
      duration = audioResult.duration;

      // Upload cover image
      const coverResult = await uploadImage(coverFile, trackId);
      coverUrl = coverResult.url;
    } catch (uploadError) {
      console.error('[UPLOAD_FILES_ERROR]', uploadError);
      return NextResponse.json(
        { error: 'Falha ao fazer upload dos arquivos' },
        { status: 500 }
      );
    }

    // Validate genre against enum
    const validGenres = ['TRAP', 'FUNK', 'RAP', 'RNB', 'REGGAETON', 'POP', 'ELECTRONIC', 'ROCK', 'OTHER'];
    const genreUpper = genre.toUpperCase();
    if (!validGenres.includes(genreUpper)) {
      return NextResponse.json(
        { error: `Gênero inválido. Opções: ${validGenres.join(', ')}` },
        { status: 400 }
      );
    }

    // Check if artist should be auto-approved
    // Auto-approve artists with verified KYC and 5+ published tracks
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: {
            tracks: {
              where: { status: 'LIVE' }
            }
          }
        }
      }
    });

    const isVerifiedArtist = user?.kycStatus === 'VERIFIED';
    const publishedTracksCount = user?._count?.tracks || 0;
    const shouldAutoApprove = isVerifiedArtist && publishedTracksCount >= 5;

    // Create track in database with auto-approve for trusted artists
    const track = await prisma.track.create({
      data: {
        title,
        artistName,
        artistId: userId,
        genre: genreUpper as any,
        coverUrl,
        audioUrl,
        duration: duration || 0,
        currentPrice,
        initialPrice: currentPrice,
        totalSupply,
        availableSupply: totalSupply,
        marketCap: currentPrice * totalSupply,
        status: shouldAutoApprove ? 'LIVE' : 'PENDING',
        aiScore: 50, // Default score
        predictedROI: 0.05, // 5% default
        viralProbability: 0.5, // 50% default
      },
    });

    // Notification based on auto-approve
    if (shouldAutoApprove) {
      // Notify artist that track is live immediately
      await prisma.notification.create({
        data: {
          userId,
          type: 'TRACK_APPROVED',
          title: 'Música Publicada! 🎵',
          message: `Sua música "${title}" foi publicada automaticamente no marketplace!`,
          trackId: track.id,
          read: false,
        },
      });
    } else {
      // Notify artist that track is pending review
      await prisma.notification.create({
        data: {
          userId,
          type: 'TRACK_UPLOADED',
          title: 'Música Enviada',
          message: `Sua música "${title}" está em revisão. Você será notificado quando for aprovada.`,
          trackId: track.id,
          read: false,
        },
      });

      // Notify all admins about new track pending review
      const admins = await prisma.user.findMany({ 
        where: { 
          role: { 
            in: ['ADMIN', 'SUPER_ADMIN'] 
          } 
        },
        select: { id: true }
      });
      
      // Create notifications for all admins
      await prisma.notification.createMany({
        data: admins.map(admin => ({
          userId: admin.id,
          type: 'TRACK_UPLOADED',
          title: 'Nova Música Para Revisar',
          message: `Nova música "${title}" enviada por ${artistName} precisa de aprovação`,
          trackId: track.id,
          read: false,
        }))
      });
    }

    return NextResponse.json({
      success: true,
      track: {
        id: track.id,
        title: track.title,
        status: track.status,
        coverUrl: track.coverUrl,
      },
      autoApproved: shouldAutoApprove,
      message: shouldAutoApprove 
        ? 'Música publicada automaticamente no marketplace!' 
        : 'Música enviada com sucesso! Aguarde a aprovação do admin.',
    });
  } catch (error) {
    console.error('[TRACK_UPLOAD_ERROR]', error);
    return NextResponse.json(
      { error: 'Erro ao processar upload' },
      { status: 500 }
    );
  }
}
