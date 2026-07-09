import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Patch,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import type { Request } from 'express';
import { ProjectsService } from './projects.service';
import { Public } from '../common/decorators/public.decorator';
import { AdminOnly, Authenticated } from '../common/decorators/auth.decorator';

// Restrict uploads to images and bound size/count (prevents memory-exhaustion
// DoS and arbitrary file content being pushed to Cloudinary).
const MAX_IMAGES = 8;
const imageUploadOptions = {
  limits: { fileSize: 8 * 1024 * 1024, files: MAX_IMAGES }, // 8 MB each
  fileFilter: (
    _req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, acceptFile: boolean) => void,
  ) => {
    if (/^image\/(png|jpe?g|webp|gif|avif)$/i.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new BadRequestException('Only image files are allowed'), false);
    }
  },
};

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  // Admin-only: creates a project + uploads images. `body` is intentionally
  // permissive (many multipart fields); safe because creation is restricted to
  // trusted Admins by the guard.
  @AdminOnly()
  @Post()
  @UseInterceptors(FilesInterceptor('images', MAX_IMAGES, imageUploadOptions))
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

  @AdminOnly()
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

  @AdminOnly()
  @Post(':id/sync')
  syncProjectFromBlockchain(@Param('id') id: string) {
    return this.projectsService.syncProjectFromBlockchain(id);
  }

  @AdminOnly()
  @Post('sync/all')
  syncAllProjectsFromBlockchain() {
    return this.projectsService.syncAllProjectsFromBlockchain();
  }

  // Any authenticated user may trigger a post-transaction resync of a project
  // they just interacted with (investor/operator/admin). No longer public.
  @Authenticated()
  @Post(':id/sync-after-transaction')
  syncProjectAfterTransaction(
    @Param('id') id: string,
    @Body() body: { transactionType: 'investment' | 'revenue' | 'state_change' }
  ) {
    return this.projectsService.syncProjectAfterTransaction(id, body.transactionType);
  }
}
