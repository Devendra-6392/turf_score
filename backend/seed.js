const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding turfs...');

  const turfs = [
    {
      name: 'Emerald Arena Complex',
      location: 'Downtown District • 1.2 km away',
      description: 'Premium football and padel arena with pro-turf technology and floodlights.',
      pricePerHour: 1500,
      rating: 4.9,
      imageUrl: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=1000&auto=format&fit=crop',
      amenities: ['Wifi', 'Parking', 'Shower', 'Cafeteria']
    },
    {
      name: 'Skyline Padel Club',
      location: 'Uptown Tech Hub • 3.5 km away',
      description: 'The highest quality panoramic padel courts in the city.',
      pricePerHour: 1200,
      rating: 4.8,
      imageUrl: 'https://images.unsplash.com/photo-1554068865-24cecd4e34f8?q=80&w=1000&auto=format&fit=crop',
      amenities: ['Parking', 'Locker Room', 'Equipment Rental']
    },
    {
      name: 'Neon Turf Center',
      location: 'West End • 5.0 km away',
      description: 'Night specialized 5v5 football turf with neon aesthetics and fast playing surface.',
      pricePerHour: 1000,
      rating: 4.6,
      imageUrl: 'https://images.unsplash.com/photo-1526628628005-04533da3a696?q=80&w=1000&auto=format&fit=crop',
      amenities: ['Floodlights', 'Beverages', 'Parking']
    }
  ];

  for (const turf of turfs) {
    const created = await prisma.turf.create({ data: turf });
    console.log(`Created turf: ${created.name}`);
  }

  console.log('Seeding complete.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
