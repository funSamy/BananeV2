import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import * as speakeasy from 'speakeasy';
import { GenerateOtpDto } from './dto/generate-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
    });

    return {
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
        },
      },
    };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: forgotPasswordDto.email },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // Token expires in 1 hour

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: token,
        tokenExpiresAt: expiresAt,
      },
    });

    // TODO: Send email with reset token
    // In production, you would integrate with an email service here

    return {
      success: true,
      message: 'Password reset instructions sent to email',
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        resetPasswordToken: resetPasswordDto.token,
        tokenExpiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    const hashedPassword = await bcrypt.hash(resetPasswordDto.newPassword, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        tokenExpiresAt: null,
      },
    });

    return {
      success: true,
      message: 'Password reset successfully',
    };
  }

  async generateOtp(generateOtpDto: GenerateOtpDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: generateOtpDto.email },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Generate new secret if not exists
    if (!user.otpSecret) {
      const secret = speakeasy.generateSecret({ length: 20 });
      await this.prisma.user.update({
        where: { id: user.id },
        data: { otpSecret: secret.base32 },
      });
    }

    // Generate OTP
    const otp = speakeasy.totp({
      secret: user.otpSecret,
      encoding: 'base32',
      digits: 6,
      step: 300, // 5 minutes validity
    });

    console.log(otp);

    // TODO: Send OTP via email
    // In production, integrate with email service

    return {
      success: true,
      message: 'OTP sent successfully',
    };
  }

  async verifyOtp(verifyOtpDto: VerifyOtpDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: verifyOtpDto.email },
    });

    if (!user || !user.otpSecret) {
      throw new UnauthorizedException('Invalid verification attempt');
    }

    const isValid = speakeasy.totp.verify({
      secret: user.otpSecret,
      encoding: 'base32',
      token: verifyOtpDto.otp,
      digits: 6,
      step: 300, // 5 minutes validity
      window: 1, // Allow 1 step before/after for time drift
    });

    if (!isValid) {
      throw new UnauthorizedException('Invalid OTP');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { otpVerified: true },
    });

    return {
      success: true,
      message: 'OTP verified successfully',
    };
  }
}
