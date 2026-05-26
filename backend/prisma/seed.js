const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Seeding data with new expert schema...');

  // 1. Clear existing data in correct order to respect foreign keys
  await prisma.systemAuditLog.deleteMany({});
  await prisma.supportTicket.deleteMany({});
  await prisma.banner.deleteMany({});
  await prisma.bookingAddOn.deleteMany({});
  await prisma.addOnProduct.deleteMany({});
  await prisma.coupon.deleteMany({});
  await prisma.transaction.deleteMany({});
  await prisma.wallet.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.paymentDetail.deleteMany({});
  await prisma.groupMember.deleteMany({});
  await prisma.groupBooking.deleteMany({});
  await prisma.cancellationRequest.deleteMany({});
  await prisma.booking.deleteMany({});
  await prisma.turfSlot.deleteMany({});
  await prisma.turfPricing.deleteMany({});
  await prisma.turfAvailabilityOverride.deleteMany({});
  await prisma.cancellationPolicy.deleteMany({});
  await prisma.favorite.deleteMany({});
  await prisma.searchHistory.deleteMany({});
  await prisma.turf.deleteMany({});
  await prisma.user.deleteMany({});

  // 2. Create User
  const user = await prisma.user.create({
    data: {
      id: 'test-user-id',
      email: 'test@turf.com',
      name: 'Test Player',
      password: 'password123',
      phone: '9876543210',
      gender: 'MALE',
      dob: new Date('1998-05-15'),
      isActive: true,
      isVerified: true,
      preferredSport: 'FOOTBALL',
      bio: 'Avid football player looking for weekend 5v5 matches.',
      totalSpend: 5000.0,
      wallet: {
        create: {
          balance: 1500.0,
          currency: 'INR',
          isActive: true
        }
      }
    }
  });
  console.log('✅ Created User and Wallet');

  // Create transactions for User Wallet
  const userWallet = await prisma.wallet.findUnique({ where: { userId: user.id } });
  if (userWallet) {
    await prisma.transaction.createMany({
      data: [
        {
          walletId: userWallet.id,
          amount: 2000.0,
          type: 'CREDIT',
          description: 'Initial wallet deposit via Razorpay',
          status: 'COMPLETED',
          previousBalance: 0.0,
          newBalance: 2000.0
        },
        {
          walletId: userWallet.id,
          amount: 500.0,
          type: 'DEBIT',
          description: 'Booking payment for Skyline Terrace Pitch',
          status: 'COMPLETED',
          previousBalance: 2000.0,
          newBalance: 1500.0
        }
      ]
    });
    console.log('✅ Created Wallet Transactions');
  }

  // 3. Create Coupons
  await prisma.coupon.createMany({
    data: [
      {
        code: 'WELCOME10',
        discountType: 'PERCENTAGE',
        value: 10.0,
        minBookingAmt: 500.0,
        maxDiscountAmt: 200.0,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 86400000), // 30 days
        usageLimit: 500,
        isActive: true
      },
      {
        code: 'TURF500',
        discountType: 'FLAT',
        value: 500.0,
        minBookingAmt: 2000.0,
        maxDiscountAmt: 500.0,
        startDate: new Date(),
        endDate: new Date(Date.now() + 15 * 86400000),
        usageLimit: 100,
        isActive: true
      }
    ]
  });
  console.log('✅ Created Promotional Coupons');

  // 4. Create AddOnProducts
  await prisma.addOnProduct.createMany({
    data: [
      {
        name: 'Premium Leather Ball',
        description: 'Professional grade cricket leather ball for purchase.',
        price: 350.0,
        isRentable: false,
        stockCount: 50,
        isActive: true
      },
      {
        name: 'Training Bibs (Set of 10)',
        description: 'Fluorescent mesh bibs for teams (Red vs Blue).',
        price: 150.0,
        isRentable: true,
        stockCount: 15,
        isActive: true
      },
      {
        name: 'Premium Padel Racket',
        description: 'Elite carbon-fiber padel racket rental.',
        price: 250.0,
        isRentable: true,
        stockCount: 10,
        isActive: true
      },
      {
        name: 'Gatorade energy drink',
        description: 'Electrolyte replenishment drink (500ml).',
        price: 80.0,
        isRentable: false,
        stockCount: 100,
        isActive: true
      }
    ]
  });
  console.log('✅ Created Add-On Products & Rentals');

  // 5. Create Banners
  await prisma.banner.createMany({
    data: [
      {
        title: 'Monsoon Football Tournament 2026',
        imageUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&q=80',
        linkUrl: 'https://turfscore.com/tournament/monsoon-2026',
        isActive: true,
        sortOrder: 1
      },
      {
        title: 'Flat 15% Off on Morning Slots',
        imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&q=80',
        linkUrl: 'welcome10',
        isActive: true,
        sortOrder: 2
      }
    ]
  });
  console.log('✅ Created Mobile App Banner Sliders');

  // 6. Create Support Tickets
  await prisma.supportTicket.create({
    data: {
      userId: user.id,
      subject: 'Refund not credited for Booking #BK-9801',
      description: 'I cancelled my slot 12 hours before the start time, but the refund is still showing as pending in my wallet. Please resolve.',
      priority: 'HIGH',
      status: 'OPEN',
      category: 'PAYMENT'
    }
  });
  console.log('✅ Created Support Tickets');

  // 7. Create Turfs and Slots
  const turfsData = [
    {
      name: 'Emerald Arena',
      location: 'Downtown District',
      city: 'Mumbai',
      state: 'Maharashtra',
      description: 'FIFA-pro synthetic grass with advanced LED lighting and premium amenities.',
      category: 'Football',
      sportTypes: ['FOOTBALL', 'CRICKET'],
      amenities: ['Wifi', 'Parking', 'Shower', 'Cafeteria'],
      rating: 4.8,
      images: ['https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&q=80', 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80'],
      contactPhone: '9988776655',
      contactEmail: 'emerald@turfs.com',
      openingTime: '06:00',
      closingTime: '23:00',
      isFeatured: true,
      rulesOfVenue: ['No metal studs allowed.', 'Please arrive 10 minutes early.', 'Non-marking shoes only on indoor court.']
    },
    {
      name: 'Skyline Terrace Pitch',
      location: 'Andheri West',
      city: 'Mumbai',
      state: 'Maharashtra',
      description: 'Elite rooftop pitch with panoramic city views and professional drainage system.',
      category: 'Football',
      sportTypes: ['FOOTBALL'],
      amenities: ['Locker Room', 'Parking', 'Beverages'],
      rating: 4.5,
      images: ['https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&q=80'],
      contactPhone: '8877665544',
      contactEmail: 'skyline@turfs.com',
      openingTime: '07:00',
      closingTime: '22:00',
      isFeatured: false,
      rulesOfVenue: ['Proper sports attire is mandatory.', 'Cancellations require 6 hours notice.']
    },
    {
      name: 'Victory Valley',
      location: 'Bandra Reclamation',
      city: 'Mumbai',
      state: 'Maharashtra',
      description: 'The preferred choice for weekend tournaments and company matches.',
      category: 'Cricket',
      sportTypes: ['CRICKET'],
      amenities: ['Wifi', 'Shower', 'Cafeteria'],
      rating: 4.2,
      images: ['https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&q=80'],
      contactPhone: '7766554433',
      contactEmail: 'victory@turfs.com',
      openingTime: '06:00',
      closingTime: '23:00',
      isFeatured: true,
      rulesOfVenue: ['Cricket gear available on rent.', 'No outside food allowed.']
    }
  ];

  for (const t of turfsData) {
    const turf = await prisma.turf.create({
      data: {
        ...t,
        cancellationPolicy: {
          create: {
            freeCancellationHours: 6,
            partialRefundPercent: 50
          }
        }
      }
    });

    // Create some slots for each turf for today and tomorrow
    const d1 = new Date(); d1.setHours(0,0,0,0);
    const d2 = new Date(Date.now() + 86400000); d2.setHours(0,0,0,0);
    const dates = [d1, d2];
    const times = ['06:00 PM', '07:00 PM', '08:00 PM', '09:00 PM'];

    for (const date of dates) {
      for (const time of times) {
        await prisma.turfSlot.create({
          data: {
            turfId: turf.id,
            date: date,
            startTime: time,
            endTime: time === '09:00 PM' ? '10:00 PM' : time.replace(':00', ':59'), // Clean representation
            status: 'AVAILABLE',
            price: 2500 + Math.floor(Math.random() * 1000),
            sportType: t.category.toUpperCase() === 'CRICKET' ? 'CRICKET' : 'FOOTBALL',
            discount: 10.0,
            isPeakHour: time.includes('08:00') || time.includes('09:00'),
            maxPlayers: 12
          }
        });
      }
    }
  }

  // 8. SystemAuditLog
  await prisma.systemAuditLog.create({
    data: {
      action: 'SYSTEM_SEED',
      details: 'Populated all database tables with expert-level enterprise mock data successfully.'
    }
  });

  console.log('✅ Seeding complete! Database is fully optimized and populated like an expert.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
