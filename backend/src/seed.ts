import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ProjectsService } from './projects/projects.service';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PerformanceData } from './performance/schemas/performance-data.schema';
import { Project } from './projects/schemas/project.schema';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const projectsService = app.get(ProjectsService);
  const performanceDataModel = app.get<Model<PerformanceData>>(
    getModelToken(PerformanceData.name),
  );
  const projectModel = app.get<Model<Project>>(getModelToken(Project.name));

  console.log('Seeding database...');

  await projectModel.deleteMany({});
  await performanceDataModel.deleteMany({});

  const villahermosaData = {
    projectName: 'Hotel in Villahermosa, Mexico',
    location: 'Villahermosa, Tabasco, Mexico',
    avgHumidity: 76,
    avgTemperature: 26.6,
    fundingGoal: 72440,
    currentFunding: 72440,
    status: 'OPERATIONAL',
  };

  const newProject = await projectsService.create(villahermosaData);
  console.log('Villahermosa project created!');

  const performanceEntries = [
    { date: new Date('2015-11-10'), waterProduction: 1808, energyConsumption: 859 },
    { date: new Date('2015-11-11'), waterProduction: 1732, energyConsumption: 870 },
    { date: new Date('2015-11-12'), waterProduction: 1755, energyConsumption: 873 },
  ];

  for (const entry of performanceEntries) {
    const newPerformanceData = new performanceDataModel({
      project: newProject,
      ...entry,
    });
    await newPerformanceData.save();
  }

  console.log('Performance data seeded!');
  await app.close();
}

bootstrap();