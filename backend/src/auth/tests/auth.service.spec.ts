import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, NotFoundException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let jwtService: JwtService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('login', () => {
    const loginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should successfully login a user', async () => {
      const user = {
        id: 1,
        email: loginDto.email,
        password: await Bun.password.hash(loginDto.password, {
          algorithm: 'argon2id',
          memoryCost: 4,
          timeCost: 3,
        }),
      };

      mockPrismaService.user.findUnique.mockResolvedValue(user);
      mockJwtService.sign.mockReturnValue('jwt_token');

      const result = await service.login(loginDto);

      expect(result).toEqual({
        token: 'jwt_token',
        user: {
          id: user.id,
          email: user.email,
        },
      });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      const user = {
        id: 1,
        email: loginDto.email,
        password: await Bun.password.hash('different_password', {
          algorithm: 'argon2id',
          memoryCost: 4,
          timeCost: 3,
        }),
      };

      mockPrismaService.user.findUnique.mockResolvedValue(user);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('forgotPassword', () => {
    const email = 'test@example.com';

    it('should generate reset token for existing user', async () => {
      const user = { id: 1, email };
      mockPrismaService.user.findUnique.mockResolvedValue(user);
      mockPrismaService.user.update.mockResolvedValue(user);

      const result = await service.forgotPassword({ email });

      expect(result).toEqual({
        success: true,
        message: 'Password reset instructions sent to email',
        data: { token: expect.any(String) },
      });
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: user.id },
        data: expect.objectContaining({
          resetPasswordToken: expect.any(String),
          tokenExpiresAt: expect.any(Date),
        }),
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.forgotPassword({ email })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('resetPassword', () => {
    const resetPasswordDto = {
      token: 'valid_token',
      newPassword: 'newpassword123',
    };

    it('should reset password with valid token', async () => {
      const user = {
        id: 1,
        email: 'test@example.com',
      };

      mockPrismaService.user.findFirst.mockResolvedValue(user);
      mockPrismaService.user.update.mockResolvedValue(user);

      const result = await service.resetPassword(resetPasswordDto);

      expect(result).toEqual({
        success: true,
        message: 'Password reset successfully',
      });
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: user.id },
        data: expect.objectContaining({
          password: expect.any(String),
          resetPasswordToken: null,
          tokenExpiresAt: null,
        }),
      });
    });

    it('should throw UnauthorizedException if token invalid/expired', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(null);

      await expect(service.resetPassword(resetPasswordDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
