// In backend/src/projects/projects.module.ts
import { Module } from '@nestjs/common';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Project, ProjectSchema } from './schemas/project.schema';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { BlockchainService } from '../services/blockchain.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Project.name, schema: ProjectSchema }]),
    CloudinaryModule,
  ],
  controllers: [ProjectsController],
  providers: [ProjectsService, BlockchainService],
  exports: [MongooseModule, ProjectsService], // Export ProjectsService for other modules
})
export class ProjectsModule {}