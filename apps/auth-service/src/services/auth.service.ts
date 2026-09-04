import { AppError } from "shared";
import { createUser, findByEmail, findById } from "../repositories/user.repo";
import { LoginInput, RegisterInput } from "../schemas/auth.schemas";
import bcrypt from "bcryptjs";
import { convertToPublishUser } from "../utils/auth.utils";
import { signToken } from "../utils/jwt";

export async function register(input: RegisterInput) {
  const existing = await findByEmail(input.email);

  if (existing) {
    throw new AppError("Email already registered", 409);
  }

  const passwordHash = await bcrypt.hash(input.password, 10);

  const user = await createUser({
    name: input.name,
    email: input.email,
    passwordHash,
    role: "USER",
  });

  return convertToPublishUser(user);
}

export async function login(input: LoginInput) {
  const user = await findByEmail(input.email);

  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  const valid = await bcrypt.compare(input.password, user.password_hash);

  if (!valid) {
    throw new AppError("Invalid email or password", 401);
  }

  const token = signToken({ userId: user.id, role: user.role });

  return {
    token,
    user: convertToPublishUser(user),
  };
}

export async function getMe(userId: string) {
  const user = await findById(userId);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return convertToPublishUser(user);
}
