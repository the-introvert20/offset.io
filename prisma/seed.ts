import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clean existing tables
  await prisma.insight.deleteMany();
  await prisma.diaryEntry.deleteMany();
  await prisma.carbonGoal.deleteMany();
  await prisma.recommendation.deleteMany();
  await prisma.scenarioActivity.deleteMany();
  await prisma.scenario.deleteMany();
  await prisma.calculation.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.emissionFactor.deleteMany();

  // 1. Seed Emission Factors
  const emissionFactorsData = [
    // Transportation
    {
      category: 'TRANSPORTATION',
      activity: 'car',
      subtype: 'petrol',
      region: 'GLOBAL',
      unit: 'km',
      factor: 0.192,
      source: 'DEFRA 2023 / EPA 2024 GHG Emission Factors',
      sourceUrl: 'https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2023',
      methodologyNote: 'Calculated using average passenger car petrol fuel efficiency (13.5 km/L) and fuel carbon content.',
      confidenceLevel: 'HIGH',
    },
    {
      category: 'TRANSPORTATION',
      activity: 'car',
      subtype: 'diesel',
      region: 'GLOBAL',
      unit: 'km',
      factor: 0.171,
      source: 'DEFRA 2023',
      sourceUrl: 'https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2023',
      methodologyNote: 'Average diesel passenger vehicle emissions per km.',
      confidenceLevel: 'HIGH',
    },
    {
      category: 'TRANSPORTATION',
      activity: 'car',
      subtype: 'hybrid',
      region: 'GLOBAL',
      unit: 'km',
      factor: 0.109,
      source: 'EPA 2024 Vehicle Emission Guide',
      sourceUrl: 'https://www.epa.gov/greenvehicles',
      methodologyNote: 'Combined electric/gasoline drive cycle weighted average.',
      confidenceLevel: 'HIGH',
    },
    {
      category: 'TRANSPORTATION',
      activity: 'car',
      subtype: 'ev',
      region: 'GLOBAL',
      unit: 'km',
      factor: 0.053,
      source: 'IEA Electric Vehicle Emissions & Grid Mix Report 2023',
      sourceUrl: 'https://www.iea.org/reports/global-ev-outlook-2023',
      methodologyNote: 'Lifecycle electricity emissions assuming standard grid mix efficiency.',
      confidenceLevel: 'MEDIUM',
    },
    {
      category: 'TRANSPORTATION',
      activity: 'bus',
      subtype: 'standard',
      region: 'GLOBAL',
      unit: 'km',
      factor: 0.089,
      source: 'DEFRA 2023 Public Transport Report',
      sourceUrl: 'https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2023',
      methodologyNote: 'Average passenger bus occupancy weighted emissions.',
      confidenceLevel: 'HIGH',
    },
    {
      category: 'TRANSPORTATION',
      activity: 'train',
      subtype: 'metro',
      region: 'GLOBAL',
      unit: 'km',
      factor: 0.035,
      source: 'IEA Rail Transport Report',
      sourceUrl: 'https://www.iea.org/reports/the-future-of-rail',
      methodologyNote: 'Electric rail transit per passenger km.',
      confidenceLevel: 'HIGH',
    },
    {
      category: 'TRANSPORTATION',
      activity: 'flight',
      subtype: 'short_haul',
      region: 'GLOBAL',
      unit: 'km',
      factor: 0.255,
      source: 'ICAO Carbon Emissions Calculator Methodology',
      sourceUrl: 'https://www.icao.int/environmental-protection/CarbonOffset/',
      methodologyNote: 'Includes radiative forcing multiplier (1.9x) for high-altitude non-CO2 effects.',
      confidenceLevel: 'HIGH',
    },
    {
      category: 'TRANSPORTATION',
      activity: 'flight',
      subtype: 'long_haul',
      region: 'GLOBAL',
      unit: 'km',
      factor: 0.195,
      source: 'ICAO Carbon Emissions Calculator Methodology',
      sourceUrl: 'https://www.icao.int/environmental-protection/CarbonOffset/',
      methodologyNote: 'Cruising efficiency per passenger km on long-distance routes.',
      confidenceLevel: 'HIGH',
    },

    // Energy
    {
      category: 'ENERGY',
      activity: 'electricity',
      subtype: 'grid_us',
      region: 'US',
      unit: 'kWh',
      factor: 0.385,
      source: 'EPA eGRID 2023 Data',
      sourceUrl: 'https://www.epa.gov/egrid',
      methodologyNote: 'US national average electricity generation emission factor.',
      confidenceLevel: 'HIGH',
    },
    {
      category: 'ENERGY',
      activity: 'electricity',
      subtype: 'grid_eu',
      region: 'EU',
      unit: 'kWh',
      factor: 0.230,
      source: 'European Environment Agency (EEA) 2023',
      sourceUrl: 'https://www.eea.europa.eu/',
      methodologyNote: 'EU-27 average grid emissions intensity per kWh.',
      confidenceLevel: 'HIGH',
    },
    {
      category: 'ENERGY',
      activity: 'electricity',
      subtype: 'grid_uk',
      region: 'UK',
      unit: 'kWh',
      factor: 0.207,
      source: 'DEFRA 2023 UK Grid Factor',
      sourceUrl: 'https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2023',
      methodologyNote: 'UK National Grid generation intensity.',
      confidenceLevel: 'HIGH',
    },
    {
      category: 'ENERGY',
      activity: 'electricity',
      subtype: 'grid_in',
      region: 'IN',
      unit: 'kWh',
      factor: 0.710,
      source: 'CEA CO2 Baseline Database for Indian Power Sector 2023',
      sourceUrl: 'https://cea.nic.in/',
      methodologyNote: 'Weighted average grid carbon intensity in India.',
      confidenceLevel: 'HIGH',
    },
    {
      category: 'ENERGY',
      activity: 'electricity',
      subtype: 'grid_global',
      region: 'GLOBAL',
      unit: 'kWh',
      factor: 0.450,
      source: 'IEA Global Electricity Review 2023',
      sourceUrl: 'https://www.iea.org/',
      methodologyNote: 'World average grid carbon intensity.',
      confidenceLevel: 'MEDIUM',
    },
    {
      category: 'ENERGY',
      activity: 'natural_gas',
      subtype: 'standard',
      region: 'GLOBAL',
      unit: 'kWh',
      factor: 0.183,
      source: 'IPCC Guidelines for National Greenhouse Gas Inventories',
      sourceUrl: 'https://www.ipcc-nggip.iges.or.jp/',
      methodologyNote: 'Combustion emission factor for natural gas per kWh thermal.',
      confidenceLevel: 'HIGH',
    },
    {
      category: 'ENERGY',
      activity: 'solar',
      subtype: 'renewable',
      region: 'GLOBAL',
      unit: 'kWh',
      factor: 0.020,
      source: 'NREL Solar Lifecycle Assessment Report',
      sourceUrl: 'https://www.nrel.gov/',
      methodologyNote: 'Manufacturing and installation lifecycle emissions for solar PV.',
      confidenceLevel: 'HIGH',
    },

    // Food
    {
      category: 'FOOD',
      activity: 'diet',
      subtype: 'high_meat',
      region: 'GLOBAL',
      unit: 'day',
      factor: 7.20,
      source: 'Poore & Nemecek (2018) / Science Journal',
      sourceUrl: 'https://www.science.org/doi/10.1126/science.aaq0216',
      methodologyNote: 'High meat intake (>100g/day) including beef, lamb, pork, and dairy emissions.',
      confidenceLevel: 'MEDIUM',
    },
    {
      category: 'FOOD',
      activity: 'diet',
      subtype: 'mixed',
      region: 'GLOBAL',
      unit: 'day',
      factor: 5.60,
      source: 'Poore & Nemecek (2018)',
      sourceUrl: 'https://www.science.org/doi/10.1126/science.aaq0216',
      methodologyNote: 'Average Western omnivorous diet with moderate meat and dairy.',
      confidenceLevel: 'MEDIUM',
    },
    {
      category: 'FOOD',
      activity: 'diet',
      subtype: 'vegetarian',
      region: 'GLOBAL',
      unit: 'day',
      factor: 3.80,
      source: 'Our World in Data Food Emissions Report 2023',
      sourceUrl: 'https://ourworldindata.org/environmental-impacts-of-food',
      methodologyNote: 'No meat, includes eggs and dairy products.',
      confidenceLevel: 'MEDIUM',
    },
    {
      category: 'FOOD',
      activity: 'diet',
      subtype: 'plant_based',
      region: 'GLOBAL',
      unit: 'day',
      factor: 2.50,
      source: 'Poore & Nemecek (2018)',
      sourceUrl: 'https://www.science.org/doi/10.1126/science.aaq0216',
      methodologyNote: 'Strict plant-based vegan diet with zero animal product footprints.',
      confidenceLevel: 'HIGH',
    },

    // Consumption
    {
      category: 'CONSUMPTION',
      activity: 'clothing',
      subtype: 'general',
      region: 'GLOBAL',
      unit: 'item',
      factor: 14.0,
      source: 'UN Environment Programme Apparel Report 2023',
      sourceUrl: 'https://www.unep.org/',
      methodologyNote: 'Average garment manufacturing and supply chain impact.',
      confidenceLevel: 'LOW',
    },
    {
      category: 'CONSUMPTION',
      activity: 'electronics',
      subtype: 'general',
      region: 'GLOBAL',
      unit: 'item',
      factor: 120.0,
      source: 'Apple / Dell Product Environmental Reports',
      sourceUrl: 'https://www.apple.com/environment/',
      methodologyNote: 'Manufacturing and embedded semiconductor carbon intensity for consumer devices.',
      confidenceLevel: 'MEDIUM',
    },

    // Waste
    {
      category: 'WASTE',
      activity: 'waste',
      subtype: 'landfill',
      region: 'GLOBAL',
      unit: 'kg',
      factor: 0.52,
      source: 'EPA WARM Model 2023',
      sourceUrl: 'https://www.epa.gov/warm',
      methodologyNote: 'Methane and CO2 emissions from organic and inorganic landfill waste.',
      confidenceLevel: 'HIGH',
    },
    {
      category: 'WASTE',
      activity: 'waste',
      subtype: 'recycled',
      region: 'GLOBAL',
      unit: 'kg',
      factor: 0.08,
      source: 'EPA WARM Model 2023',
      sourceUrl: 'https://www.epa.gov/warm',
      methodologyNote: 'Net emissions after offset savings from material recycling.',
      confidenceLevel: 'HIGH',
    },
  ];

  for (const factor of emissionFactorsData) {
    await prisma.emissionFactor.create({ data: factor });
  }
  console.log(`✅ Seeded ${emissionFactorsData.length} emission factors.`);

  // 2. Seed Admin and Demo User
  const hashedPassword = await bcrypt.hash('Password123!', 10);

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@offset.io',
      name: 'System Admin',
      passwordHash: hashedPassword,
      role: 'ADMIN',
      profile: {
        create: {
          region: 'US',
          dietPattern: 'MIXED',
          householdSize: 1,
          primaryTransport: 'CAR_PETROL',
          targetReductionPct: 25.0,
          monthlyBudget: 3000.0,
          currency: 'USD',
          onboardingComplete: true,
        },
      },
    },
  });

  const demoUser = await prisma.user.create({
    data: {
      email: 'demo@offset.io',
      name: 'Alex Rivera',
      passwordHash: hashedPassword,
      role: 'USER',
      profile: {
        create: {
          region: 'US',
          dietPattern: 'MIXED',
          householdSize: 2,
          primaryTransport: 'CAR_PETROL',
          targetReductionPct: 20.0,
          monthlyBudget: 2000.0,
          currency: 'USD',
          onboardingComplete: true,
        },
      },
    },
  });

  console.log(`👤 Created Demo User (demo@offset.io / Password123!) and Admin User.`);

  // 3. Seed Activities for Demo User
  const demoActivities = [
    {
      userId: demoUser.id,
      category: 'TRANSPORTATION',
      activityType: 'car',
      subtype: 'petrol',
      frequency: 'MONTHLY',
      quantity: 390.0, // 390 km/month
      unit: 'km',
      region: 'US',
    },
    {
      userId: demoUser.id,
      category: 'TRANSPORTATION',
      activityType: 'flight',
      subtype: 'short_haul',
      frequency: 'YEARLY',
      quantity: 1500.0, // 1500 km/year short flight
      unit: 'km',
      region: 'GLOBAL',
    },
    {
      userId: demoUser.id,
      category: 'ENERGY',
      activityType: 'electricity',
      subtype: 'grid_us',
      frequency: 'MONTHLY',
      quantity: 320.0, // 320 kWh/month
      unit: 'kWh',
      region: 'US',
    },
    {
      userId: demoUser.id,
      category: 'FOOD',
      activityType: 'diet',
      subtype: 'mixed',
      frequency: 'DAILY',
      quantity: 1.0, // 1 day unit
      unit: 'day',
      region: 'GLOBAL',
    },
    {
      userId: demoUser.id,
      category: 'WASTE',
      activityType: 'waste',
      subtype: 'landfill',
      frequency: 'MONTHLY',
      quantity: 45.0, // 45 kg/month
      unit: 'kg',
      region: 'GLOBAL',
    },
  ];

  for (const act of demoActivities) {
    await prisma.activity.create({ data: act });
  }
  console.log(`✅ Seeded ${demoActivities.length} baseline activities for demo user.`);

  // 4. Seed Target Carbon Goal
  await prisma.carbonGoal.create({
    data: {
      userId: demoUser.id,
      targetAnnualEmissionsKg: 3800.0,
      targetMonthlyEmissionsKg: 316.6,
      reductionPercentage: 20.0,
      targetYear: 2026,
      status: 'ACTIVE',
    },
  });

  // 5. Seed Scenarios
  await prisma.scenario.create({
    data: {
      userId: demoUser.id,
      name: 'Scenario A: Public Transit & EV',
      description: 'Replace 50% car driving with metro/bus and transition to EV for remaining trips.',
      isBaseline: false,
      totalAnnualEmissionsKg: 3450.0,
      estimatedCostDeltaMonthly: 45.0,
      activities: {
        create: [
          {
            category: 'TRANSPORTATION',
            activityType: 'car',
            subtype: 'ev',
            frequency: 'MONTHLY',
            quantity: 195.0,
            unit: 'km',
            region: 'US',
          },
          {
            category: 'TRANSPORTATION',
            activityType: 'train',
            subtype: 'metro',
            frequency: 'MONTHLY',
            quantity: 195.0,
            unit: 'km',
            region: 'GLOBAL',
          },
          {
            category: 'ENERGY',
            activityType: 'electricity',
            subtype: 'grid_us',
            frequency: 'MONTHLY',
            quantity: 320.0,
            unit: 'kWh',
            region: 'US',
          },
          {
            category: 'FOOD',
            activityType: 'diet',
            subtype: 'mixed',
            frequency: 'DAILY',
            quantity: 1.0,
            unit: 'day',
            region: 'GLOBAL',
          },
        ],
      },
    },
  });

  await prisma.scenario.create({
    data: {
      userId: demoUser.id,
      name: 'Scenario B: Solar + Plant-Based Diet',
      description: 'Switch household power to rooftop solar and adopt a plant-based diet pattern.',
      isBaseline: false,
      totalAnnualEmissionsKg: 2890.0,
      estimatedCostDeltaMonthly: -15.0,
      activities: {
        create: [
          {
            category: 'TRANSPORTATION',
            activityType: 'car',
            subtype: 'petrol',
            frequency: 'MONTHLY',
            quantity: 390.0,
            unit: 'km',
            region: 'US',
          },
          {
            category: 'ENERGY',
            activityType: 'solar',
            subtype: 'renewable',
            frequency: 'MONTHLY',
            quantity: 320.0,
            unit: 'kWh',
            region: 'GLOBAL',
          },
          {
            category: 'FOOD',
            activityType: 'diet',
            subtype: 'plant_based',
            frequency: 'DAILY',
            quantity: 1.0,
            unit: 'day',
            region: 'GLOBAL',
          },
        ],
      },
    },
  });

  console.log(`✅ Seeded demo scenarios.`);

  // 6. Seed Recommendations
  const recommendationsData = [
    {
      userId: demoUser.id,
      title: 'Replace 2 Weekly Car Trips with Metro Transit',
      explanation: 'Transportation accounts for 52% of your footprint. Shifting ~100 km/month to public transit saves significant fossil fuel emissions.',
      category: 'TRANSPORTATION',
      estimatedReductionKg: 420.0,
      estimatedCostMonthly: 15.0,
      difficulty: 'EASY',
      priority: 'HIGH',
      prerequisites: 'Access to urban transit network',
    },
    {
      userId: demoUser.id,
      title: 'Transition to Renewable Solar Electricity',
      explanation: 'Replacing grid electricity with rooftop solar or green utility tariffs reduces your annual home energy footprint by over 80%.',
      category: 'ENERGY',
      estimatedReductionKg: 1400.0,
      estimatedCostMonthly: 30.0,
      difficulty: 'MEDIUM',
      priority: 'HIGH',
      prerequisites: 'Home ownership or green tariff selection',
    },
    {
      userId: demoUser.id,
      title: 'Shift 3 Days/Week to Plant-Based Meals',
      explanation: 'Reducing meat consumption on select days yields instant emissions reductions without requiring complete dietary overhaul.',
      category: 'FOOD',
      estimatedReductionKg: 330.0,
      estimatedCostMonthly: -20.0,
      difficulty: 'EASY',
      priority: 'MEDIUM',
      prerequisites: 'None',
    },
  ];

  for (const rec of recommendationsData) {
    await prisma.recommendation.create({ data: rec });
  }

  // 7. Seed Carbon Diary Entries over past 14 days
  const now = new Date();
  for (let i = 14; i >= 0; i--) {
    const entryDate = new Date(now);
    entryDate.setDate(now.getDate() - i);

    const carKm = 13 + (Math.sin(i) * 4);
    await prisma.diaryEntry.create({
      data: {
        userId: demoUser.id,
        date: entryDate,
        category: 'TRANSPORTATION',
        activityType: 'car',
        subtype: 'petrol',
        quantity: parseFloat(carKm.toFixed(1)),
        unit: 'km',
        emissionsKg: parseFloat((carKm * 0.192).toFixed(2)),
        notes: `Daily commute on day -${i}`,
      },
    });

    const isAnomalyDay = i === 3;
    const kwh = isAnomalyDay ? 38.0 : 10.6 + (Math.cos(i) * 2);
    await prisma.diaryEntry.create({
      data: {
        userId: demoUser.id,
        date: entryDate,
        category: 'ENERGY',
        activityType: 'electricity',
        subtype: 'grid_us',
        quantity: parseFloat(kwh.toFixed(1)),
        unit: 'kWh',
        emissionsKg: parseFloat((kwh * 0.385).toFixed(2)),
        notes: isAnomalyDay ? 'Unusual heavy HVAC power usage spike' : 'Standard daily electricity usage',
      },
    });
  }

  console.log(`✅ Seeded 15 days of Carbon Diary entries with a statistical anomaly.`);

  // 8. Seed Insights
  await prisma.insight.create({
    data: {
      userId: demoUser.id,
      title: 'Unusual Electricity Spike Detected',
      description: 'Your energy consumption reached 38 kWh on 3 days ago (14.6 kg CO2e), which is 2.8x higher than your 14-day rolling average (10.6 kWh/day).',
      category: 'ENERGY',
      severity: 'WARNING',
      isAnomaly: true,
      anomalyScore: 2.8,
    },
  });

  await prisma.insight.create({
    data: {
      userId: demoUser.id,
      title: 'Transportation dominates your footprint',
      description: 'Vehicle driving and air travel account for 52% of your estimated annual emissions.',
      category: 'TRANSPORTATION',
      severity: 'INFO',
      isAnomaly: false,
      anomalyScore: 0.0,
    },
  });

  console.log('🎉 Database seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
