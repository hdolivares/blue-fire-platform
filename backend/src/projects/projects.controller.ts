import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ProjectsService } from './projects.service';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('images')) // 'images' is the field name for files
  createProject(
    @Body() body: any,
    @UploadedFiles() images: Array<Express.Multer.File>,
  ) {
    return this.projectsService.create(body, images);
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