import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getModelToken, getConnectionToken } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { Project } from './projects/schemas/project.schema';
import { User } from './users/schemas/user.schema';
import { Investment } from './investments/schemas/investment.schema';
import * as bcrypt from 'bcrypt';

/**
 * @function bootstrap
 * @description A standalone script to safely seed/update the database with initial data.
 * It uses an "upsert" strategy to avoid deleting existing data.
 */
async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const connection = app.get<Connection>(getConnectionToken());

  const projectModel = app.get<Model<Project>>(getModelToken(Project.name));
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
  
  // --- 2. Upsert Seed Project ---
  const villahermosaData = {
    projectName: 'Hotel in Villahermosa, Mexico',
    location: 'Villahermosa, Tabasco, Mexico',
    avgHumidity: 76,
    avgTemperature: 26.6,
    avgDailyWaterProduction: 1750,
    fundingGoal: 72440,
    currentFunding: 72440, 
    status: 'OPERATIONAL',
    unitControllerAddress: '0xYourUnitControllerAddressGoesHere' 
  };
  console.log('Upserting Villahermosa project...');
  const villahermosaProject = await projectModel.findOneAndUpdate(
    { projectName: villahermosaData.projectName },
    villahermosaData,
    { upsert: true, new: true }
  );
  console.log('Villahermosa project is up-to-date.');

  // --- 3. Create a Test Investor and link them to the project ---
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

  // Link the investor to the project
  await investmentModel.findOneAndUpdate(
    { user: testInvestor._id, project: villahermosaProject._id },
    {
      $setOnInsert: {
        user: testInvestor._id,
        project: villahermosaProject._id,
        amount: 15000,
      }
    },
    { upsert: true }
  );
  console.log('Test investment is up-to-date.');

  // --- 4. Safely close the connections ---
  await connection.close();
  await app.close();
  console.log('Seeding complete!');
}

// Run the script
bootstrap();