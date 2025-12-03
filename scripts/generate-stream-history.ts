/**
 * Generate Historical Stream Data
 * 
 * Creates realistic streaming data for the last 90 days
 * Distributes streams across platforms (Spotify, YouTube, TikTok, etc.)
 * Adds natural variation and growth trends
 */

import { PrismaClient, StreamPlatform } from '@prisma/client';

const prisma = new PrismaClient();

// Platform distribution (percentages)
const PLATFORM_DISTRIBUTION = {
  SPOTIFY: 0.50,      // 50%
  YOUTUBE: 0.25,      // 25%
  TIKTOK: 0.15,       // 15%
  APPLE_MUSIC: 0.06,  // 6%
  DEEZER: 0.03,       // 3%
  SOUNDCLOUD: 0.01,   // 1%
};

// Revenue per stream (in BRL)
const REVENUE_PER_STREAM: Record<StreamPlatform, number> = {
  SPOTIFY: 0.004,
  YOUTUBE: 0.002,
  TIKTOK: 0.003,
  APPLE_MUSIC: 0.007,
  DEEZER: 0.0064,
  SOUNDCLOUD: 0.0025,
  OTHER: 0.003,
};

const DAYS_TO_GENERATE = 90;

/**
 * Generate random variation (-20% to +20%)
 */
function getRandomVariation(): number {
  return 0.8 + Math.random() * 0.4;
}

/**
 * Check if date is weekend
 */
function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

/**
 * Generate daily streams for a track
 */
function generateDailyStreams(
  baseStreams: number,
  daysSinceRelease: number,
  date: Date
): number {
  // Growth factor (newer tracks grow faster)
  const growthFactor = daysSinceRelease < 30 ? 1 + (30 - daysSinceRelease) / 100 : 1;
  
  // Weekend boost (+30%)
  const weekendBoost = isWeekend(date) ? 1.3 : 1;
  
  // Random daily variation
  const variation = getRandomVariation();
  
  // Calculate streams
  const streams = Math.floor(
    baseStreams * growthFactor * weekendBoost * variation
  );
  
  return Math.max(1, streams); // Minimum 1 stream
}

/**
 * Distribute streams across platforms
 */
function distributeStreams(totalStreams: number): Partial<Record<StreamPlatform, number>> {
  const distribution: Partial<Record<StreamPlatform, number>> = {};
  
  for (const [platform, percentage] of Object.entries(PLATFORM_DISTRIBUTION)) {
    const platformStreams = Math.floor(totalStreams * percentage);
    if (platformStreams > 0) {
      distribution[platform as StreamPlatform] = platformStreams;
    }
  }
  
  return distribution;
}

/**
 * Calculate revenue for platform streams
 */
function calculateRevenue(platform: StreamPlatform, streams: number): number {
  const rate = REVENUE_PER_STREAM[platform] || 0.003;
  return streams * rate;
}

/**
 * Main function to generate stream history
 */
async function generateStreamHistory() {
  console.log('🎵 Starting stream history generation...\n');
  
  try {
    // Fetch all LIVE tracks
    const tracks = await prisma.track.findMany({
      where: {
        status: 'LIVE',
      },
      select: {
        id: true,
        title: true,
        totalStreams: true,
        createdAt: true,
      },
    });
    
    if (tracks.length === 0) {
      console.log('❌ No LIVE tracks found. Please seed database first.');
      return;
    }
    
    console.log(`📊 Found ${tracks.length} LIVE tracks\n`);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let totalRecords = 0;
    
    // Process each track
    for (const track of tracks) {
      console.log(`\n🎵 Processing: ${track.title}`);
      
      // Calculate base daily streams (average)
      const baseDailyStreams = Math.floor(track.totalStreams / DAYS_TO_GENERATE);
      
      if (baseDailyStreams === 0) {
        console.log(`  ⚠️ Skipping - no streams to distribute`);
        continue;
      }
      
      // Calculate how many days to generate (from track creation to today, max 90 days)
      const trackAge = Math.ceil(
        (today.getTime() - track.createdAt.getTime()) / (1000 * 60 * 60 * 24)
      ) + 1; // +1 to include today
      const daysToGenerate = Math.min(trackAge, DAYS_TO_GENERATE);
      
      if (daysToGenerate <= 0) {
        console.log(`  ⚠️ Skipping - track too new`);
        continue;
      }
      
      // Generate data for each day
      for (let daysAgo = daysToGenerate; daysAgo > 0; daysAgo--) {
        const date = new Date(today);
        date.setDate(date.getDate() - daysAgo);
        
        // Calculate days since track release
        const daysSinceRelease = Math.floor(
          (date.getTime() - track.createdAt.getTime()) / (1000 * 60 * 60 * 24)
        );
        
        // Generate total daily streams
        const dailyStreams = generateDailyStreams(
          baseDailyStreams,
          daysSinceRelease,
          date
        );
        
        // Distribute across platforms
        const platformStreams = distributeStreams(dailyStreams);
        
        // Create records for each platform
        const platforms = Object.entries(platformStreams);
        
        for (const [platform, streams] of platforms) {
          if (streams && streams > 0) {
            const revenue = calculateRevenue(platform as StreamPlatform, streams);
            
            try {
              await prisma.streamHistory.upsert({
                where: {
                  trackId_date_platform: {
                    trackId: track.id,
                    date,
                    platform: platform as StreamPlatform,
                  },
                },
                create: {
                  trackId: track.id,
                  date,
                  platform: platform as StreamPlatform,
                  streams,
                  revenue,
                },
                update: {
                  streams,
                  revenue,
                },
              });
              
              totalRecords++;
            } catch (error) {
              console.error(`  ❌ Error creating record:`, error);
            }
          }
        }
      }
      
      console.log(`  ✓ Generated ${daysToGenerate} days of data`);
    }
    
    console.log(`\n✅ Stream history generation complete!`);
    console.log(`📊 Total records created: ${totalRecords}`);
    console.log(`📅 Date range: ${DAYS_TO_GENERATE} days`);
    console.log(`🎵 Tracks processed: ${tracks.length}`);
    
  } catch (error) {
    console.error('❌ Error generating stream history:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
generateStreamHistory()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
