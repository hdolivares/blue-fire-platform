import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Patch,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ProjectsService } from './projects.service';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';

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

  @Roles('Admin')
  @Patch(':id/blockchain')
  linkToBlockchain(
    @Param('id') id: string,
    @Body() body: { blockchainProjectId: number; blockchainAddress: string }
  ) {
    return this.projectsService.updateBlockchainInfo(
      id,
      body.blockchainProjectId,
      body.blockchainAddress
    );
  }

  @Public()
  @Get('blockchain/:blockchainId')
  getByBlockchainId(@Param('blockchainId') blockchainId: string) {
    return this.projectsService.findByBlockchainId(Number(blockchainId));
  }

  @Public()
  @Get('enhanced/all')
  getEnhancedProjects() {
    return this.projectsService.getProjectsWithBlockchainInfo();
  }
}