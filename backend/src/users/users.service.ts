import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { RegisterUserDto } from './dto/register-user.dto';
import * as bcrypt from 'bcrypt';
import { Project } from '../projects/schemas/project.schema';

@Injectable()
export class UsersService {
  // The constructor now takes both the UserModel and ProjectModel
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Project.name) private projectModel: Model<Project>,
  ) {}

  async register(registerUserDto: RegisterUserDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(registerUserDto.password, 10);
    const newUser = new this.userModel({
      ...registerUserDto,
      password: hashedPassword,
    });
    return newUser.save();
  }

  async findOneByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).select('+password').exec();
  }

  async findUserByResetToken(token: string): Promise<UserDocument | null> {
    return this.userModel.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() },
    }).select('+password').exec();
  }

  async findAllOperators(): Promise<User[]> {
    return this.userModel.find({ roles: 'Operator' }).exec();
  }

  // Find all projects assigned to a specific operator
  async findProjectsByOperator(operatorId: string): Promise<Project[]> {
    // We change findOne to find to get a list (an array)
    return this.projectModel.find({ operator: operatorId }).exec();
  }
}