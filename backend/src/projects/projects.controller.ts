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
import { Public } from '../common/decorators/public.decorator';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Public()
  @Post()
  @UseInterceptors(FilesInterceptor('images')) // 'images' is the field name for files
  createProject(
    @Body() body: any,
    @UploadedFiles() images: Array<Express.Multer.File>,
  ) {
    return this.projectsService.create(body, images);
  }

  @Public()
  @Get()
  getAllProjects() {
    return this.projectsService.findAll();
  }

  @Public()
  @Get(':id')
  getProjectById(@Param('id') id: string) {
    return this.projectsService.findById(id);
  }
}