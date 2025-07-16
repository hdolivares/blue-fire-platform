import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OperatorsController } from './operators.controller';
import { OperatorRequestsController } from './operator-requests.controller';
import { OperatorRequestsService } from './operator-requests.service';
import { OperatorRequest, OperatorRequestSchema } from './schemas/operator-request.schema';
import { Project, ProjectSchema } from '../projects/schemas/project.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: OperatorRequest.name, schema: OperatorRequestSchema },
      { name: Project.name, schema: ProjectSchema },
      { name: User.name, schema: UserSchema },
    ]),
    UsersModule,
  ],
  controllers: [OperatorsController, OperatorRequestsController],
  providers: [OperatorRequestsService],
  exports: [OperatorRequestsService],
})
export class OperatorsModule {}