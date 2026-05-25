import bcrypt from "bcryptjs";
import jwt, { type SignOptions } from "jsonwebtoken";
import type { SupportedLanguage } from "@mda-chess/shared";
import { env } from "../../config/env";
import { prisma } from "../../services/prisma";
import { HttpError } from "../../utils/http";
import type { loginSchema, registerSchema } from "./auth.schemas";
import type { z } from "zod";

type RegisterInput = z.infer<typeof registerSchema>;
type LoginInput = z.infer<typeof loginSchema>;

export async function registerUser(input: RegisterInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email.toLowerCase() } });
  if (existing) {
    throw new HttpError(409, "Email is already registered", "EMAIL_EXISTS");
  }

  const passwordHash = await bcrypt.hash(input.password, 12);
  const user = await prisma.user.create({
    data: {
      email: input.email.toLowerCase(),
      passwordHash,
      name: input.name,
      preferredLanguage: toDbLanguage(input.preferredLanguage)
    }
  });

  return {
    token: signToken(toPublicUser(user)),
    user: toPublicUser(user)
  };
}

export async function loginUser(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email.toLowerCase() } });
  if (!user) {
    throw new HttpError(401, "Invalid email or password", "INVALID_CREDENTIALS");
  }

  const validPassword = await bcrypt.compare(input.password, user.passwordHash);
  if (!validPassword) {
    throw new HttpError(401, "Invalid email or password", "INVALID_CREDENTIALS");
  }

  return {
    token: signToken(toPublicUser(user)),
    user: toPublicUser(user)
  };
}

export async function getCurrentUser(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new HttpError(404, "User not found", "USER_NOT_FOUND");
  }

  return toPublicUser(user);
}

function signToken(user: ReturnType<typeof toPublicUser>) {
  return jwt.sign(
    {
      email: user.email,
      preferredLanguage: user.preferredLanguage
    },
    env.JWT_SECRET,
    {
      subject: user.id,
      expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"]
    }
  );
}

function toDbLanguage(language: SupportedLanguage) {
  return language === "en" ? "EN" : "MN";
}

function fromDbLanguage(language: "MN" | "EN"): SupportedLanguage {
  return language === "EN" ? "en" : "mn";
}

function toPublicUser(user: {
  id: string;
  email: string;
  name: string | null;
  preferredLanguage: "MN" | "EN";
}) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    preferredLanguage: fromDbLanguage(user.preferredLanguage)
  };
}
