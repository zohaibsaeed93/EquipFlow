import { Repository } from "typeorm";
import { AppDataSource } from "../../config/database";
import { User } from "../entities/User.entity";
import bcrypt from "bcrypt";

export class UserService {
  private userRepository: Repository<User>;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
  }

  /**
   * Create a new user
   */
  async createUser(data: {
    username: string;
    name: string;
    password: string;
    email?: string;
  }): Promise<User> {
    // Check if username already exists
    const existingUser = await this.userRepository.findOne({
      where: { username: data.username },
    });

    if (existingUser) {
      throw new Error("Username already exists");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create user
    const user = this.userRepository.create({
      ...data,
      password: hashedPassword,
    });

    return await this.userRepository.save(user);
  }

  /**
   * Get all users
   */
  async getAllUsers(options?: {
    skip?: number;
    take?: number;
    isActive?: boolean;
  }): Promise<{ users: User[]; total: number }> {
    const where: any = {};

    if (options?.isActive !== undefined) {
      where.isActive = options.isActive;
    }

    const [users, total] = await this.userRepository.findAndCount({
      where,
      skip: options?.skip || 0,
      take: options?.take || 10,
      order: { createdAt: "DESC" },
    });

    return { users, total };
  }

  /**
   * Get user by ID
   */
  async getUserById(id: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { id },
    });
  }

  /**
   * Get user by username
   */
  async getUserByUsername(username: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { username },
    });
  }

  /**
   * Get user by username with password (for authentication)
   */
  async getUserByUsernameWithPassword(username: string): Promise<User | null> {
    return await this.userRepository
      .createQueryBuilder("user")
      .addSelect("user.password")
      .where("user.username = :username", { username })
      .getOne();
  }

  /**
   * Update user
   */
  async updateUser(
    id: string,
    data: {
      name?: string;
      email?: string;
      username?: string;
      isActive?: boolean;
    },
  ): Promise<User> {
    const user = await this.getUserById(id);

    if (!user) {
      throw new Error("User not found");
    }

    // If username is being updated, check if it's already taken
    if (data.username && data.username !== user.username) {
      const existingUser = await this.getUserByUsername(data.username);
      if (existingUser) {
        throw new Error("Username already exists");
      }
    }

    // Update user fields
    Object.assign(user, data);

    return await this.userRepository.save(user);
  }

  /**
   * Update user password
   */
  async updatePassword(id: string, newPassword: string): Promise<void> {
    const user = await this.getUserById(id);

    if (!user) {
      throw new Error("User not found");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    await this.userRepository.save(user);
  }

  /**
   * Delete user (soft delete by setting isActive to false)
   */
  async deleteUser(id: string): Promise<void> {
    const user = await this.getUserById(id);

    if (!user) {
      throw new Error("User not found");
    }

    user.isActive = false;
    await this.userRepository.save(user);
  }

  /**
   * Delete user permanently
   */
  async permanentlyDeleteUser(id: string): Promise<void> {
    const result = await this.userRepository.delete(id);

    if (result.affected === 0) {
      throw new Error("User not found");
    }
  }

  /**
   * Verify user credentials
   */
  async verifyCredentials(
    username: string,
    password: string,
  ): Promise<User | null> {
    const user = await this.getUserByUsernameWithPassword(username);

    if (!user || !user.isActive) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return null;
    }

    // Remove password from returned user object
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
  }
}

export const userService = new UserService();
