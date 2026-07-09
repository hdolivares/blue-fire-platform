import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { RegisterUserDto } from './dto/register-user.dto';
import * as bcrypt from 'bcrypt';
import { Project } from '../projects/schemas/project.schema';
// This is the corrected import path. It now goes "up" one folder from 'users'
// before going "down" into 'investments'.
import { Investment } from '../investments/schemas/investment.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Project.name) private projectModel: Model<Project>,
    @InjectModel(Investment.name) private investmentModel: Model<Investment>,
  ) {}

  async register(registerUserDto: RegisterUserDto): Promise<User> {
    // Convert email to lowercase
    const email = registerUserDto.email.toLowerCase();
    
    // Check if user already exists (case-insensitive)
    const existingUser = await this.findOneByEmail(email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }
    
    const hashedPassword = await bcrypt.hash(registerUserDto.password, 10);
    const newUser = new this.userModel({
      firstName: registerUserDto.firstName,
      lastName: registerUserDto.lastName,
      country: registerUserDto.country,
      walletAddress: registerUserDto.walletAddress,
      email, // Use lowercase email
      password: hashedPassword,
      // Roles are assigned server-side, never taken from the client, to prevent
      // privilege escalation. New self-service accounts are Investors by default.
      roles: ['Investor'],
    });
    return newUser.save();
  }

  async findOneByEmail(email: string): Promise<UserDocument | null> {
    // Exact, case-insensitive match via collation — never interpolate user
    // input into a RegExp (avoids NoSQL regex injection / ReDoS).
    return this.userModel
      .findOne({ email: email.toLowerCase() })
      .collation({ locale: 'en', strength: 2 })
      .select('+password')
      .exec();
  }

  async findUserByResetToken(token: string): Promise<UserDocument | null> {
    // The reset fields are select:false; they must be loaded here so that
    // clearing them after a successful reset registers as a modification —
    // otherwise the used token would stay valid until it expires.
    return this.userModel.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() },
    }).select('+password +passwordResetToken +passwordResetExpires').exec();
  }

  async findAllOperators(): Promise<User[]> {
    return this.userModel.find({ roles: 'Operator' }).exec();
  }

  async findProjectsByOperator(operatorId: string): Promise<Project[]> {
    return this.projectModel.find({ operator: operatorId }).exec();
  }
  
  async findMyPortfolio(userId: string): Promise<any[]> {
    return this.investmentModel
      .find({ user: userId })
      .populate('project')
      .exec();
  }
}