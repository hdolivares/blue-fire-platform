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

  // Specific routes MUST come before generic parameter routes
  @Public()
  @Get('blockchain-id/:blockchainId')
  getByBlockchainProjectId(@Param('blockchainId') blockchainId: string) {
    return this.projectsService.findByBlockchainProjectId(Number(blockchainId));
  }

  @Public()
  @Get('enhanced/all')
  getEnhancedProjects() {
    return this.projectsService.getProjectsWithBlockchainInfo();
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

  @Roles('Admin')
  @Post(':id/sync')
  syncProjectFromBlockchain(@Param('id') id: string) {
    return this.projectsService.syncProjectFromBlockchain(id);
  }

  @Roles('Admin')
  @Post('sync/all')
  syncAllProjectsFromBlockchain() {
    return this.projectsService.syncAllProjectsFromBlockchain();
  }

  @Public()
  @Post(':id/sync-after-transaction')
  syncProjectAfterTransaction(
    @Param('id') id: string,
    @Body() body: { transactionType: 'investment' | 'revenue' | 'state_change' }
  ) {
    return this.projectsService.syncProjectAfterTransaction(id, body.transactionType);
  }
}