import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { MailService } from '../mail/mail.service';
import { UserRoleInterface } from '../../user/interfaces/user.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private mailService: MailService,
  ) {}

  async register(
    email: string,
    password: string,
    name: string,
    username: string,
    baseUrl: string,
  ) {
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new BadRequestException('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = this.jwtService.sign({ email });

    const newUser = this.userRepository.create({
      name,
      username,
      email,
      password: hashedPassword,
      verificationToken,
      role: UserRoleInterface.USER,
    });

    await this.userRepository.save(newUser);
    await this.sendVerificationEmail(email, verificationToken, baseUrl);
    return {
      status: 200,
      success: true,
      message: 'Registration successful, verify your email',
    };
  }

  async login(email: string, password: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new BadRequestException('Invalid credentials');
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      throw new BadRequestException('Invalid credentials');
    }

    if (!user.isVerified) {
      throw new BadRequestException('Email not verified');
    }

    const token = this.jwtService.sign({ email: user.email, sub: user.id });
    return {
      status: 200,
      success: true,
      message: 'ok',
      access_token: token,
      user: {
        username: user.username,
        name: user.name,
        email: user.email,
        timezone: user.timezone,
        country: user.country,
        phone: user.phone,
        picture: user.picture,
      },
    };
  }

  async verifyEmail(token: string) {
    const payload = this.jwtService.verify(token);
    const user = await this.userRepository.findOne({ 
      where: { email: payload.email } 
    });

    if (!user || user.isVerified) {
      throw new BadRequestException('Invalid token');
    }

    user.isVerified = true;
    user.verificationToken = '';
    await this.userRepository.save(user);
    
    return {
      message: 'Email verified successfully',
      status: 200,
      success: true,
    };
  }

  async sendVerificationEmail(email: string, token: string, baseUrl: string) {
    const url = baseUrl + `/api/v1/auth/verify-email?token=${token}`;

    await this.mailService.sendMail(
      'noreply@leganux.com',
      [email],
      'Email Verification',
      `Click <a href="${url}">here</a> to verify your email.`,
    );
  }
}
