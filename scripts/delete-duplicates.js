const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function deleteDuplicates() {
  try {
    console.log('Finding and deleting duplicate tracks...\n');

    // Get all tracks ordered by creation date
    const allTracks = await prisma.track.findMany({
      select: {
        id: true,
        title: true,
        artistName: true,
        tokenId: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    console.log(`Total tracks: ${allTracks.length}\n`);

    // Group by title + artistName
    const trackGroups = {};
    allTracks.forEach(track => {
      const key = `${track.title}|||${track.artistName}`;
      if (!trackGroups[key]) {
        trackGroups[key] = [];
      }
      trackGroups[key].push(track);
    });

    // Find duplicates and delete newer ones
    const duplicates = Object.entries(trackGroups).filter(([_, tracks]) => tracks.length > 1);

    if (duplicates.length === 0) {
      console.log('✅ No duplicates found!');
      return;
    }

    console.log(`Found ${duplicates.length} duplicate groups. Deleting newer duplicates...\n`);

    let totalDeleted = 0;

    for (const [key, tracks] of duplicates) {
      const [title, artistName] = key.split('|||');

      // Keep the first (oldest), delete the rest
      const toKeep = tracks[0];
      const toDelete = tracks.slice(1);

      console.log(`"${title}" by ${artistName}:`);
      console.log(`  ✅ KEEPING: ID ${toKeep.id} (created ${toKeep.createdAt})`);

      for (const track of toDelete) {
        console.log(`  ❌ DELETING: ID ${track.id} (created ${track.createdAt})`);

        // Delete related records first
        // Delete portfolio entries
        await prisma.portfolio.deleteMany({
          where: { trackId: track.id },
        });

        // Delete transactions
        await prisma.transaction.deleteMany({
          where: { trackId: track.id },
        });

        // Delete favorites
        await prisma.favorite.deleteMany({
          where: { trackId: track.id },
        });

        // Delete comments
        await prisma.comment.deleteMany({
          where: { trackId: track.id },
        });

        // Delete price alerts
        await prisma.priceAlert.deleteMany({
          where: { trackId: track.id },
        });

        // Delete limit orders
        await prisma.limitOrder.deleteMany({
          where: { trackId: track.id },
        });

        // Delete price history
        await prisma.priceHistory.deleteMany({
          where: { trackId: track.id },
        });

        // Finally, delete the track
        await prisma.track.delete({
          where: { id: track.id },
        });

        totalDeleted++;
      }
      console.log('');
    }

    console.log(`✅ Successfully deleted ${totalDeleted} duplicate tracks!\n`);

    // Show final count
    const finalCount = await prisma.track.count();
    console.log(`Final track count: ${finalCount}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteDuplicates();
