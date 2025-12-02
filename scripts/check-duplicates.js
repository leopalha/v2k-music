const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDuplicates() {
  try {
    console.log('Checking for duplicate tracks...\n');

    // Get all tracks
    const allTracks = await prisma.track.findMany({
      select: {
        id: true,
        title: true,
        artistName: true,
        tokenId: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    console.log(`Total tracks in database: ${allTracks.length}\n`);

    // Group by title + artistName
    const trackGroups = {};
    allTracks.forEach(track => {
      const key = `${track.title}|||${track.artistName}`;
      if (!trackGroups[key]) {
        trackGroups[key] = [];
      }
      trackGroups[key].push(track);
    });

    // Find duplicates
    const duplicates = Object.entries(trackGroups).filter(([_, tracks]) => tracks.length > 1);

    if (duplicates.length === 0) {
      console.log('✅ No duplicate tracks found!');
    } else {
      console.log(`❌ Found ${duplicates.length} duplicate track groups:\n`);

      duplicates.forEach(([key, tracks]) => {
        const [title, artistName] = key.split('|||');
        console.log(`"${title}" by ${artistName}:`);
        tracks.forEach(track => {
          console.log(`  - ID: ${track.id}, TokenID: ${track.tokenId || 'null'}`);
        });
        console.log('');
      });

      // Ask if user wants to delete duplicates
      console.log('\nTo delete duplicates, keep the oldest track (first created) and delete the rest.\n');
    }

    // Show track count by status
    const tracksByStatus = await prisma.track.groupBy({
      by: ['status'],
      _count: true,
    });

    console.log('\nTracks by status:');
    tracksByStatus.forEach(({ status, _count }) => {
      console.log(`  ${status}: ${_count}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDuplicates();
