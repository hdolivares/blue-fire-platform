// In backend/src/seed.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ProjectsService } from './projects/projects.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const projectsService = app.get(ProjectsService);

  console.log('Seeding database with Villahermosa project...');

  // Data based on the Villahermosa hotel installation
  const villahermosaProject = {
    [cite_start]projectName: 'Hotel in Villahermosa, Mexico', // [cite: 497]
    [cite_start]fundingGoal: 72440, // Net yearly saving in USD [cite: 619]
    currentFunding: 72440, // It's fully funded
    status: 'OPERATIONAL',
  };

  // This prevents creating a duplicate project if the script is run more than once
  const existingProject = await projectsService.findOneByName(villahermosaProject.projectName);
  if (!existingProject) {
    await projectsService.create(villahermosaProject);
    console.log('Villahermosa project created successfully!');
  } else {
    console.log('Villahermosa project already exists.');
  }
  
  console.log('Seeding complete!');
  await app.close();
}

bootstrap();