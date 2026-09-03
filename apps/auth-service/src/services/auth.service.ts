import { AppError } from "shared";
import { createUser, findByEmail } from "../repositories/user.repo";
import { RegisterInput } from "../schemas/auth.schemas";
import bcrypt from "bcryptjs";
import { convertToPublishUser } from "../utils/auth.utils";

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
