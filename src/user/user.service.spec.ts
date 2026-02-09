import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import * as fs from 'fs';
import { UserRole } from '../utils/enums';

import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');
jest.mock('fs');

describe('UserService', () => {
  let service: UserService;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let userRepository: jest.Mocked<Repository<User>>;

  const mockUser: User = {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    password_hash: 'hashedPassword123',
    role: UserRole.USER,
    avatar_url: null,
    created_at: new Date(),
    updated_at: new Date(),
    products: [],
    reviews: [],
    get isAdmin(): boolean {
      return mockUser.role === UserRole.ADMIN;
    },
  };

  const mockUserRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createUserDto = {
      name: 'New User',
      email: 'newuser@example.com',
      password: 'Password123!',
    };

    it('should create a new user successfully', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue({
        ...mockUser,
        ...createUserDto,
      });
      mockUserRepository.save.mockResolvedValue({
        ...mockUser,
        ...createUserDto,
      });
      (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');

      const result = await service.create(createUserDto);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: createUserDto.email },
      });
      expect(mockUserRepository.create).toHaveBeenCalledWith(createUserDto);
      expect(bcrypt.genSalt).toHaveBeenCalled();
      expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 'salt');
      expect(mockUserRepository.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should throw BadRequestException if email already exists', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      await expect(service.create(createUserDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw InternalServerErrorException on unexpected error', async () => {
      mockUserRepository.findOne.mockRejectedValue(new Error('DB error'));

      await expect(service.create(createUserDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('validateUser', () => {
    const email = 'test@example.com';
    const password = 'Password123!';

    it('should return user if credentials are valid', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser(email, password);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        password,
        mockUser.password_hash,
      );
      expect(result).toEqual(mockUser);
    });

    it('should throw BadRequestException if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.validateUser(email, password)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if password is invalid', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.validateUser(email, password)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw InternalServerErrorException on unexpected error', async () => {
      mockUserRepository.findOne.mockRejectedValue(new Error('DB error'));

      await expect(service.validateUser(email, password)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const users = [mockUser];
      mockUserRepository.find.mockResolvedValue(users);

      const result = await service.findAll();

      expect(mockUserRepository.find).toHaveBeenCalledWith({});
      expect(result).toEqual(users);
    });

    it('should throw InternalServerErrorException on error', async () => {
      mockUserRepository.find.mockRejectedValue(new Error('DB error'));

      await expect(service.findAll()).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findUserByEmail', () => {
    it('should return user if found', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findUserByEmail(mockUser.email);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: mockUser.email },
      });
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(
        service.findUserByEmail('nonexistent@example.com'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findById', () => {
    it('should return user if found', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findById(mockUser.id);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockUser.id },
      });
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.findById(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updateUserDto = { name: 'Updated Name' };

    it('should update user successfully', async () => {
      const existingUser = { ...mockUser };
      mockUserRepository.findOne.mockResolvedValue(existingUser);
      mockUserRepository.save.mockResolvedValue({
        ...existingUser,
        ...updateUserDto,
      });

      const result = await service.update(mockUser.id, updateUserDto);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockUser.id },
      });
      expect(mockUserRepository.save).toHaveBeenCalled();
      expect(result.name).toBe(updateUserDto.name);
    });

    it('should update email if new email is provided and not in use', async () => {
      const updateDto = { email: 'newemail@example.com' };
      const existingUser = { ...mockUser };
      mockUserRepository.findOne
        .mockResolvedValueOnce(existingUser) // First call to find user by id
        .mockResolvedValueOnce(null); // Second call to check if email exists
      mockUserRepository.save.mockResolvedValue({
        ...existingUser,
        email: updateDto.email,
      });

      const result = await service.update(mockUser.id, updateDto);

      expect(result.email).toBe(updateDto.email);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.update(999, updateUserDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw InternalServerErrorException on unexpected error', async () => {
      mockUserRepository.findOne.mockRejectedValue(new Error('DB error'));

      await expect(service.update(1, updateUserDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('setProfileImage', () => {
    const filename = 'profile.jpg';

    it('should set profile image successfully', async () => {
      const existingUser = { ...mockUser, avatar_url: null };
      mockUserRepository.findOne.mockResolvedValue(existingUser);
      mockUserRepository.save.mockResolvedValue({
        ...existingUser,
        avatar_url: filename,
      });

      const result = await service.setProfileImage(mockUser.id, filename);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockUser.id },
      });
      expect(result.avatar_url).toBe(filename);
    });

    it('should remove old profile image before setting new one', async () => {
      const existingUser = { ...mockUser, avatar_url: 'old-image.jpg' };
      mockUserRepository.findOne.mockResolvedValue(existingUser);
      mockUserRepository.save.mockResolvedValue({
        ...existingUser,
        avatar_url: filename,
      });
      (fs.unlinkSync as jest.Mock).mockReturnValue(undefined);

      const result = await service.setProfileImage(mockUser.id, filename);

      expect(result.avatar_url).toBe(filename);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.setProfileImage(999, filename)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw InternalServerErrorException on unexpected error', async () => {
      mockUserRepository.findOne.mockRejectedValue(new Error('DB error'));

      await expect(service.setProfileImage(1, filename)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('removeProfileImage', () => {
    it('should remove profile image successfully', async () => {
      const userWithAvatar = { ...mockUser, avatar_url: 'profile.jpg' };
      mockUserRepository.findOne.mockResolvedValue(userWithAvatar);
      mockUserRepository.save.mockResolvedValue({
        ...userWithAvatar,
        avatar_url: null,
      });
      (fs.unlinkSync as jest.Mock).mockReturnValue(undefined);

      const result = await service.removeProfileImage(mockUser.id);

      expect(fs.unlinkSync).toHaveBeenCalled();
      expect(result.avatar_url).toBeNull();
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.removeProfileImage(999)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if user has no profile image', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      await expect(service.removeProfileImage(mockUser.id)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw InternalServerErrorException on unexpected error', async () => {
      mockUserRepository.findOne.mockRejectedValue(new Error('DB error'));

      await expect(service.removeProfileImage(1)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('updateAvatar', () => {
    const mockFile = {
      filename: 'avatar.jpg',
      originalname: 'avatar.jpg',
      mimetype: 'image/jpeg',
      buffer: Buffer.from(''),
      size: 1000,
    } as Express.Multer.File;

    it('should update avatar successfully', async () => {
      const existingUser = { ...mockUser, avatar_url: null };
      mockUserRepository.findOne.mockResolvedValue(existingUser);
      mockUserRepository.save.mockResolvedValue({
        ...existingUser,
        avatar_url: mockFile.filename,
      });

      const result = await service.updateAvatar(mockUser.id, mockFile);

      expect(result.avatar_url).toBe(mockFile.filename);
    });

    it('should throw BadRequestException if file is not provided', async () => {
      await expect(
        service.updateAvatar(
          mockUser.id,
          null as unknown as Express.Multer.File,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('should return removal message', () => {
      const result = service.remove(1);

      expect(result).toBe('This action removes a #1 user');
    });
  });
});
