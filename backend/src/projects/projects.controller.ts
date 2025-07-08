// In backend/src/projects/projects.controller.ts
import { Controller, Post, Get, Body, Param } from '@nestjs/common'; // <-- Add Param here
import { ProjectsService } from './projects.service';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  createProject(@Body() body: { projectName: string; fundingGoal: number }) {
    return this.projectsService.create(body);
  }

  @Get()
  getAllProjects() {
    return this.projectsService.findAll();
  }

  @Get(':id')
  getProjectById(@Param('id') id: string) {
    return this.projectsService.findById(id);
  }
}