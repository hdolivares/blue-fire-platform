import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ProjectsService } from './projects/projects.service';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PerformanceData } from './performance/schemas/performance-data.schema';
import { Project } from './projects/schemas/project.schema';
import { User } from './users/schemas/user.schema';
import * as bcrypt from 'bcrypt';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const projectModel = app.get<Model<Project>>(getModelToken(Project.name));
  const performanceDataModel = app.get<Model<PerformanceData>>(getModelToken(PerformanceData.name));
  const userModel = app.get<Model<User>>(getModelToken(User.name));

  console.log('Seeding database...');

  // --- Create Admin User ---
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
  // -------------------------

  // --- Create Seed Project (if it doesn't exist) ---
  const projectName = 'Hotel in Villahermosa, Mexico';
  const existingProject = await projectModel.findOne({ projectName }).exec();

  if (!existingProject) {
    console.log('Creating seed project...');
    const projectsService = app.get(ProjectsService);
    const villahermosaData = {
      projectName: 'Hotel in Villahermosa, Mexico',
      location: 'Villahermosa, Tabasco, Mexico',
      avgHumidity: 76,
      avgTemperature: 26.6,
      avgDailyWaterProduction: 1750,
      fundingGoal: 72440,
      currentFunding:72440,
      status: 'OPERATIONAL',
    };
    await projectsService.create(villahermosaData, []);
    console.log('Villahermosa project created!');
  } else {
    console.log('Seed project already exists.');
  }

  await app.close();
  console.log('Seeding complete!');
}

bootstrap();