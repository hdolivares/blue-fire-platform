import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../users/schemas/user.schema';
import { Project } from '../projects/schemas/project.schema';
import { EmailService } from '../email/email.service';

@Injectable()
export class StatusReportService {
  private readonly logger = new Logger(StatusReportService.name);

  constructor(
    private readonly emailService: EmailService,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Project.name) private readonly projectModel: Model<Project>,
  ) {}

  // Every Monday 09:00 (server time). Doubles as a keep-alive: Brevo deactivates
  // API keys after prolonged inactivity, and weekly leaves generous margin. We
  // run a single PM2 instance, so there is no multi-node double-send to guard.
  @Cron('0 9 * * 1', { name: 'weekly-status-report' })
  async sendWeeklyStatus(): Promise<void> {
    try {
      const [users, projects] = await Promise.all([
        this.userModel.countDocuments().exec(),
        this.projectModel.countDocuments().exec(),
      ]);

      await this.emailService.sendStatusReport({
        users,
        projects,
        generatedAt: new Date().toISOString(),
      });
      this.logger.log('Weekly status report sent.');
    } catch (err) {
      // Never let a failed report crash the scheduler; just log it.
      this.logger.error('Weekly status report failed to send', err as Error);
    }
  }
}
