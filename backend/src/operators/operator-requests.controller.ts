import { Controller, Post, Get, Patch, Param, Body, Request } from '@nestjs/common';
import { OperatorRequestsService } from './operator-requests.service';
import { CreateOperatorRequestDto } from './dto/create-operator-request.dto';
import { ReviewOperatorRequestDto } from './dto/review-operator-request.dto';
import { AdminOnly } from '../common/decorators/auth.decorator';
import { AdminOrOperator } from '../common/decorators/auth.decorator';

@Controller('operator-requests')
export class OperatorRequestsController {
  constructor(private readonly operatorRequestsService: OperatorRequestsService) {}

  @Post()
  @AdminOrOperator()
  createRequest(@Request() req, @Body() createOperatorRequestDto: CreateOperatorRequestDto) {
    const operatorId = req.user.userId;
    return this.operatorRequestsService.createRequest(operatorId, createOperatorRequestDto);
  }

  @Get('pending')
  @AdminOnly()
  getAllPendingRequests() {
    return this.operatorRequestsService.getAllPendingRequests();
  }

  @Patch(':requestId/review')
  @AdminOnly()
  reviewRequest(
    @Param('requestId') requestId: string,
    @Request() req,
    @Body() reviewDto: ReviewOperatorRequestDto,
  ) {
    const adminId = req.user.userId;
    return this.operatorRequestsService.reviewRequest(requestId, adminId, reviewDto);
  }

  @Get('my-requests')
  @AdminOrOperator()
  getMyRequests(@Request() req) {
    const operatorId = req.user.userId;
    return this.operatorRequestsService.getOperatorRequests(operatorId);
  }

  @Get(':requestId')
  @AdminOrOperator()
  getRequestById(@Param('requestId') requestId: string) {
    return this.operatorRequestsService.getRequestById(requestId);
  }
} 