// In backend/src/users/users.module.ts
import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { ProjectsModule } from '../projects/projects.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    ProjectsModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  // Add MongooseModule to the exports array
  exports: [UsersService, MongooseModule],
})
export class UsersModule {}