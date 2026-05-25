import type { SupportedLanguage } from "@mda-chess/shared";
import { prisma } from "../../services/prisma";
import { HttpError } from "../../utils/http";

export async function getUserProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      preferredLanguage: true,
      ratingEstimate: true,
      createdAt: true
    }
  });

  if (!user) {
    throw new HttpError(404, "User not found", "USER_NOT_FOUND");
  }

  return {
    ...user,
    preferredLanguage: fromDbLanguage(user.preferredLanguage)
  };
}

export async function updateUserProfile(
  userId: string,
  input: { name?: string; preferredLanguage?: SupportedLanguage; ratingEstimate?: number }
) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      name: input.name,
      preferredLanguage: input.preferredLanguage ? toDbLanguage(input.preferredLanguage) : undefined,
      ratingEstimate: input.ratingEstimate
    },
    select: {
      id: true,
      email: true,
      name: true,
      preferredLanguage: true,
      ratingEstimate: true,
      createdAt: true
    }
  });

  return {
    ...user,
    preferredLanguage: fromDbLanguage(user.preferredLanguage)
  };
}

function toDbLanguage(language: SupportedLanguage) {
  return language === "en" ? "EN" : "MN";
}

function fromDbLanguage(language: "MN" | "EN"): SupportedLanguage {
  return language === "EN" ? "en" : "mn";
}
