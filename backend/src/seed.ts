import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Project } from './projects/schemas/project.schema';
import { User } from './users/schemas/user.schema';
import * as bcrypt from 'bcrypt';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const projectModel = app.get<Model<Project>>(getModelToken(Project.name));
  const userModel = app.get<Model<User>>(getModelToken(User.name));
  
  console.log('Seeding database...');

  // --- Upsert Admin User ---
  const adminEmail = 'hobeja7@gmail.com';
  const existingAdmin = await userModel.findOne({ email: adminEmail }).exec();
  if (!existingAdmin) {
    console.log('Creating admin user...');
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash('admin_password_123', salt);
    await userModel.create({
      firstName: 'Admin',
      lastName: 'User',
      email: adminEmail,
      password: hashedPassword,
      country: 'USA',
      walletAddress: '0xAdminWalletAddressGoesHere',
      roles: ['Admin'],
    });
    console.log('Admin user created successfully!');
  } else {
    console.log('Admin user already exists.');
  }
  
  // --- Upsert Seed Project ---
  // This is the data we want in the database.
  const villahermosaData = {
    projectName: 'Hotel in Villahermosa, Mexico',
    location: 'Villahermosa, Tabasco, Mexico',
    avgHumidity: 76,
    avgTemperature: 26.6,
    avgDailyWaterProduction: 1750,
    fundingGoal: 72440,
    currentFunding: 72440, 
    status: 'OPERATIONAL',
  };

  console.log('Upserting Villahermosa project...');
  
  // Mongoose's findOneAndUpdate with upsert:true will create the document if it doesn't exist,
  // or update it if it does. This is exactly what we need.
  await projectModel.findOneAndUpdate(
    { projectName: villahermosaData.projectName }, // Find a project with this name
    villahermosaData, // The data to use for the update or creation
    { upsert: true, new: true } // Options: upsert = true, new = return the new doc
  );
  
  console.log('Villahermosa project is up-to-date.');
  
  await app.close();
  console.log('Seeding complete!');
}

bootstrap();