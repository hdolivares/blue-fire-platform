import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AlertsController } from './alerts.controller';
import { AlertsService } from '../services/alerts.service';

@Module({
  imports: [EventEmitterModule.forRoot()],
  controllers: [AlertsController],
  providers: [AlertsService],
  exports: [AlertsService],
})
export class AlertsModule {} 