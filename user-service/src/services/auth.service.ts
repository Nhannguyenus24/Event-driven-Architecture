import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User } from '../entities/user.entity';
import { RegisterUserDto, LoginUserDto } from '../dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(registerUserDto: RegisterUserDto): Promise<any> {
    const { username, password } = registerUserDto;

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { username },
    });

    if (existingUser) {
      throw new ConflictException('Username already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = this.userRepository.create({
      username,
      password: hashedPassword,
    });

    const savedUser = await this.userRepository.save(user);

    // Generate JWT token
    const payload = { sub: savedUser.id, username: savedUser.username };
    const access_token = await this.jwtService.signAsync(payload);

    return {
      access_token,
      user: {
        id: savedUser.id,
        username: savedUser.username,
      },
    };
  }

  async login(loginUserDto: LoginUserDto): Promise<any> {
    const { username, password } = loginUserDto;

    // Find user
    const user = await this.userRepository.findOne({
      where: { username },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token
    const payload = { sub: user.id, username: user.username };
    const access_token = await this.jwtService.signAsync(payload);

    return {
      access_token,
      user: {
        id: user.id,
        username: user.username,
      },
    };
  }

  async validateUser(userId: number): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { id: userId },
    });
  }
}
