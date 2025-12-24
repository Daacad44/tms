import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seed...');

    // Create admin user
    const adminPassword = await bcrypt.hash('Admin@123', 10);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@tms.com' },
        update: {},
        create: {
            email: 'admin@tms.com',
            name: 'System Admin',
            phone: '+252612345678',
            passwordHash: adminPassword,
            role: 'SUPER_ADMIN',
            status: 'ACTIVE',
        },
    });
    console.log('✅ Admin user created:', admin.email);

    // Create agent user
    const agentPassword = await bcrypt.hash('Agent@123', 10);
    const agent = await prisma.user.upsert({
        where: { email: 'agent@tms.com' },
        update: {},
        create: {
            email: 'agent@tms.com',
            name: 'Travel Agent',
            phone: '+252612345679',
            passwordHash: agentPassword,
            role: 'AGENT',
            status: 'ACTIVE',
        },
    });
    console.log('✅ Agent user created:', agent.email);

    // Create sample customer
    const customerPassword = await bcrypt.hash('Customer@123', 10);
    const customer = await prisma.user.upsert({
        where: { email: 'customer@example.com' },
        update: {},
        create: {
            email: 'customer@example.com',
            name: 'Mohamed Ahmed',
            phone: '+252612345680',
            passwordHash: customerPassword,
            role: 'CUSTOMER',
            status: 'ACTIVE',
            nationality: 'Somali',
        },
    });
    console.log('✅ Customer user created:', customer.email);

    // Create destinations
    const destinations = [
        {
            name: 'Makkah',
            country: 'Saudi Arabia',
            city: 'Makkah',
            description: 'The holiest city in Islam, home to the Grand Mosque and the Kaaba',
            imageUrl: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=800',
        },
        {
            name: 'Istanbul',
            country: 'Turkey',
            city: 'Istanbul',
            description: 'Historic city bridging Europe and Asia with stunning Ottoman architecture',
            imageUrl: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800',
        },
        {
            name: 'Dubai',
            country: 'UAE',
            city: 'Dubai',
            description: 'Modern metropolis with iconic skyscrapers and luxury shopping',
            imageUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800',
        },
        {
            name: 'Mogadishu',
            country: 'Somalia',
            city: 'Mogadishu',
            description: 'The vibrant capital city with beautiful beaches and rich history',
            imageUrl: 'https://images.unsplash.com/photo-1578070181910-f1e514afdd08?w=800',
        },
    ];

    const createdDestinations = [];
    for (const dest of destinations) {
        // Check if destination exists
        let destination = await prisma.destination.findFirst({
            where: { name: dest.name },
        });

        // Create if not exists
        if (!destination) {
            destination = await prisma.destination.create({
                data: dest,
            });
        }

        createdDestinations.push(destination);
    }
    console.log(`✅ Created ${createdDestinations.length} destinations`);

    // Create trips
    const trips = [
        {
            title: 'Umrah Package - Premium',
            slug: 'umrah-package-premium',
            destinationId: createdDestinations[0].id, // Makkah
            description: 'Premium Umrah package with 5-star hotels and VIP services',
            durationDays: 14,
            category: 'UMRAH',
            status: 'PUBLISHED',
            inclusions: '- 5-star hotel accommodation\n- Airport transfers\n- Ziyarah tours\n- Visa assistance\n- Meals (breakfast)',
            exclusions: '- International flights\n- Travel insurance\n- Personal expenses',
            highlights: '- Stay near Haram\n- Professional guide\n- Group Umrah\n- VIP services',
        },
        {
            title: 'Istanbul City Tour - 7 Days',
            slug: 'istanbul-city-tour-7-days',
            destinationId: createdDestinations[1].id, // Istanbul
            description: 'Explore the magical city of Istanbul with guided tours',
            durationDays: 7,
            category: 'CITY_TOUR',
            status: 'PUBLISHED',
            inclusions: '- 4-star hotel\n- Daily breakfast\n- Airport transfers\n- City tours\n- Museum tickets',
            exclusions: '- Flights\n- Lunch and dinner\n- Shopping expenses',
            highlights: '- Blue Mosque\n- Hagia Sophia\n- Grand Bazaar\n- Bosphorus Cruise',
        },
        {
            title: 'Dubai Experience - Luxury',
            slug: 'dubai-experience-luxury',
            destinationId: createdDestinations[2].id, // Dubai
            description: 'Luxurious Dubai experience with world-class attractions',
            durationDays: 5,
            category: 'LUXURY',
            status: 'PUBLISHED',
            inclusions: '- 5-star hotel with sea view\n- Desert safari\n- Burj Khalifa tickets\n- Dubai Mall tour\n- Airport transfers',
            exclusions: '- International flights\n- Meals\n- Additional activities',
            highlights: '- Burj Khalifa at the Top\n- Desert Safari\n- Dubai Marina\n- Mall of Emirates',
        },
    ];

    const createdTrips = [];
    for (const trip of trips) {
        const createdTrip = await prisma.trip.upsert({
            where: { slug: trip.slug },
            update: {},
            create: trip,
        });
        createdTrips.push(createdTrip);

        // Add sample images
        await prisma.tripImage.create({
            data: {
                tripId: createdTrip.id,
                url: trip.slug.includes('umrah')
                    ? 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=800'
                    : trip.slug.includes('istanbul')
                        ? 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800'
                        : 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800',
                sortOrder: 0,
            },
        });

        // Add itinerary
        if (trip.slug.includes('umrah')) {
            await prisma.itinerary.createMany({
                data: [
                    { tripId: createdTrip.id, dayNo: 1, title: 'Arrival in Makkah', details: 'Airport pickup and hotel check-in' },
                    { tripId: createdTrip.id, dayNo: 2, title: 'Umrah Performance', details: 'Perform Umrah with group guidance' },
                    { tripId: createdTrip.id, dayNo: 7, title: 'Travel to Madinah', details: 'Transfer to Madinah for Ziyarah' },
                    { tripId: createdTrip.id, dayNo: 14, title: 'Departure', details: 'Check-out and airport transfer' },
                ],
            });
        }

        // Add addons
        await prisma.addon.createMany({
            data: [
                {
                    tripId: createdTrip.id,
                    name: 'Travel Insurance',
                    description: 'Comprehensive travel insurance coverage',
                    price: 50,
                    type: 'INSURANCE',
                },
                {
                    tripId: createdTrip.id,
                    name: 'Extra Baggage (20kg)',
                    description: 'Additional baggage allowance',
                    price: 100,
                    type: 'EXTRA_BAGGAGE',
                },
            ],
        });
    }
    console.log(`✅ Created ${createdTrips.length} trips`);

    // Create departures
    const now = new Date();
    for (const trip of createdTrips) {
        // Create 3 upcoming departures for each trip
        for (let i = 1; i <= 3; i++) {
            const startDate = new Date(now);
            startDate.setDate(startDate.getDate() + (30 * i));

            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + trip.durationDays);

            const basePrice = trip.slug.includes('luxury') ? 2500 :
                trip.slug.includes('umrah') ? 1800 : 1200;

            await prisma.tripDeparture.create({
                data: {
                    tripId: trip.id,
                    startDate,
                    endDate,
                    capacity: 40,
                    seatsReserved: 0,
                    basePrice,
                    childPrice: basePrice * 0.7,
                    currency: 'USD',
                    status: 'AVAILABLE',
                },
            });
        }
    }
    console.log('✅ Created trip departures');

    // Create system settings
    await prisma.setting.upsert({
        where: { key: 'company_info' },
        update: {},
        create: {
            key: 'company_info',
            value: {
                name: 'TMS Travel Agency',
                email: 'info@tms-agency.com',
                phone: '+252612345678',
                address: 'Mogadishu, Somalia',
                website: 'https://tms-agency.com',
            },
        },
    });

    await prisma.setting.upsert({
        where: { key: 'payment_methods' },
        update: {},
        create: {
            key: 'payment_methods',
            value: {
                enabled: ['CASH', 'EVC', 'ZAAD', 'CARD'],
            },
        },
    });

    console.log('✅ Created system settings');

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📝 Test Credentials:');
    console.log('Admin: admin@tms.com / Admin@123');
    console.log('Agent: agent@tms.com / Agent@123');
    console.log('Customer: customer@example.com / Customer@123');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
