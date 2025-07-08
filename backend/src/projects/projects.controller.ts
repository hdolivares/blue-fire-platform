// In backend/src/projects/projects.controller.ts
import { Controller, Post, Get, Body } from '@nestjs/common';
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
}