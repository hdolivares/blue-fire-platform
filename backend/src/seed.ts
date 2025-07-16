import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getModelToken, getConnectionToken } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { Project, ProjectStatus } from './projects/schemas/project.schema';
import { PerformanceData } from './performance/schemas/performance-data.schema';
import { User } from './users/schemas/user.schema';
import { Investment } from './investments/schemas/investment.schema';
import * as bcrypt from 'bcrypt';
import { subDays, eachDayOfInterval } from 'date-fns';

/**
 * @function bootstrap
 * @description A standalone script to safely seed/update the database with initial data.
 * It uses an "upsert" strategy to avoid deleting existing data.
 */
async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const connection = app.get<Connection>(getConnectionToken());

  const projectModel = app.get<Model<Project>>(getModelToken(Project.name));
  const performanceModel = app.get<Model<PerformanceData>>(getModelToken(PerformanceData.name));
  const userModel = app.get<Model<User>>(getModelToken(User.name));
  const investmentModel = app.get<Model<Investment>>(getModelToken(Investment.name));
  
  console.log('Seeding database...');

  // --- 1. Upsert (Update or Insert) Admin User ---
  const adminEmail = 'hobeja7@gmail.com';
  const salt = await bcrypt.genSalt();
  const hashedPassword = await bcrypt.hash('admin_password_123', salt);
  
  await userModel.findOneAndUpdate(
    { email: adminEmail },
    {
      $setOnInsert: { // These fields are only set when the document is first created
        firstName: 'Admin',
        lastName: 'User',
        email: adminEmail,
        password: hashedPassword,
        country: 'USA',
        walletAddress: '0xAdminWalletAddressGoesHere',
        roles: ['Admin'],
      }
    },
    { upsert: true }
  );
  console.log('Admin user is up-to-date.');
  
  // --- 2. Upsert Seed Projects ---

  const projectsToSeed = [
    {
      name: 'Resort & Spa, Singapore',
      location: 'Singapore',
      status: ProjectStatus.OPERATIONAL,
      goalAmount: 250000,
      currentAmount: 250000,
      avgHumidity: 80,
      avgTemperature: 27,
      mainImage: 'https://images.unsplash.com/photo-1579693393132-73b32315a133?q=80&w=1974&auto=format&fit=crop',
      images: [
        'https://images.unsplash.com/photo-1579693393132-73b32315a133?q=80&w=1974&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=2070&auto=format&fit=crop',
      ],
    },
    {
      name: 'Eco-Lodge, Manaus, Brazil',
      location: 'Manaus, Brazil',
      status: ProjectStatus.SEEKING_FUNDING,
      goalAmount: 120000,
      currentAmount: 15000,
      avgHumidity: 85,
      avgTemperature: 28,
      mainImage: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?q=80&w=2070&auto=format&fit=crop',
      images: [
        'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?q=80&w=2070&auto=format&fit=crop',
      ],
    },
    {
        name: 'Luxury Villas, Phuket, Thailand',
        location: 'Phuket, Thailand',
        status: ProjectStatus.FUNDED_MACHINE_SHIPPED,
        goalAmount: 500000,
        currentAmount: 500000,
        avgHumidity: 75,
        avgTemperature: 29,
        mainImage: 'https://images.unsplash.com/photo-1563911302283-d2bc129e7570?q=80&w=1974&auto=format&fit=crop',
        images: [
          'https://images.unsplash.com/photo-1563911302283-d2bc129e7570?q=80&w=1974&auto=format&fit=crop',
        ]
    },
    {
        // Legacy project name for backward compatibility during upsert
        projectName: 'Hotel in Villahermosa, Mexico',
        name: 'Hotel in Villahermosa, Mexico',
        location: 'Villahermosa, Tabasco, Mexico',
        status: ProjectStatus.OPERATIONAL,
        goalAmount: 72440,
        currentAmount: 72440,
        avgHumidity: 76,
        avgTemperature: 26.6,
        mainImage: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop',
        images: [
          'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop',
        ],
    }
  ];
  
  const seededProjects: Project[] = [];
  for (const projectData of projectsToSeed) {
    console.log(`Upserting project: ${projectData.name}`);
    
    // Using a simpler query based on the unique 'name' field
    const project = await projectModel.findOneAndUpdate(
      { name: projectData.name },
      { $set: projectData },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    seededProjects.push(project);
    console.log(`-> Upserted: ${project.name} (ID: ${project._id})`);
  }

  // --- Verification Step ---
  console.log('\n--- VERIFYING CREATED PROJECTS ---');
  const allProjectsInDB = await projectModel.find({});
  console.log(`Total projects found in DB: ${allProjectsInDB.length}`);
  allProjectsInDB.forEach(p => {
    console.log(`  - Found: ${p.name} (ID: ${p._id})`);
  });
  console.log('--- VERIFICATION COMPLETE ---\n');


  // --- 3. Generate Performance Data for Operational Projects ---
  console.log('Clearing old performance data...');
  await performanceModel.deleteMany({}); // Clear the entire collection

  console.log('Generating historical performance data...');
  const operationalProjects = seededProjects.filter(p => p.status === ProjectStatus.OPERATIONAL);

  console.log(`Found ${operationalProjects.length} operational projects to seed performance data for.`);

  for (const project of operationalProjects) {
    console.log(`--> Generating data for: ${project.name} (ID: ${project._id})`);
    
    const today = new Date();
    const sixMonthsAgo = subDays(today, 180);
    const dateRange = eachDayOfInterval({ start: sixMonthsAgo, end: today });

    const performanceEntries = dateRange.map(date => {
      // Simulate some daily variance
      const tempVariance = (Math.random() - 0.5) * 5; // +/- 2.5 degrees
      const humidityVariance = (Math.random() - 0.5) * 10; // +/- 5%
      const efficiencyVariance = (Math.random() - 0.5) * 0.2; // +/- 0.1 kWh/L
      const productionVariance = (Math.random() - 0.5) * 200; // +/- 100 liters

      return {
        project: project._id,
        timestamp: date,
        temperature: parseFloat((project.avgTemperature + tempVariance).toFixed(2)),
        humidity: parseFloat((project.avgHumidity + humidityVariance).toFixed(2)),
        kwhPerLiter: parseFloat((0.8 + efficiencyVariance).toFixed(2)),
        litersProduced: parseFloat((1750 + productionVariance).toFixed(0)), // Base production
        machineStatus: 'OPERATIONAL'
      };
    });
    
    await performanceModel.insertMany(performanceEntries);
    console.log(`-----> Inserted ${performanceEntries.length} performance entries for ${project.name}.`);
  }
  
  // --- 4. Upsert a Test Investor and link them to a project ---
  console.log('Upserting test investor and investment...');
  
  const testInvestorEmail = 'hobeja7@hotmail.com';
  const investorSalt = await bcrypt.genSalt();
  const investorHashedPassword = await bcrypt.hash('password123', investorSalt);

  const testInvestor = await userModel.findOneAndUpdate(
    { email: testInvestorEmail },
    {
      $setOnInsert: {
        firstName: 'Test',
        lastName: 'Investor',
        email: testInvestorEmail,
        password: investorHashedPassword,
        country: 'Canada',
        walletAddress: '0xTestInvestorWalletAddress0000000000000',
        roles: ['Investor'],
      }
    },
    { upsert: true, new: true }
  );
  console.log('Test investor is up-to-date.');

  // Link the investor to the first project in the list
  const projectToInvestIn = seededProjects[0];
  await investmentModel.findOneAndUpdate(
    { user: testInvestor._id, project: projectToInvestIn._id },
    {
      $setOnInsert: {
        user: testInvestor._id,
        project: projectToInvestIn._id,
        amount: 15000,
      }
    },
    { upsert: true }
  );
  console.log('Test investment is up-to-date.');

  // --- 5. Safely close the connections ---
  await connection.close();
  await app.close();
  console.log('Seeding complete!');
}

// Run the script
bootstrap();