import type { UserProgressSummary } from "@mda-chess/shared";
import { prisma } from "../../services/prisma";

export async function getProgressSummary(userId: string): Promise<UserProgressSummary> {
  const [gamesReviewed, games, mistakes] = await Promise.all([
    prisma.game.count({ where: { userId } }),
    prisma.game.findMany({
      where: { userId },
      select: {
        accuracyWhite: true,
        accuracyBlack: true,
        criticalMistakes: true
      },
      take: 50,
      orderBy: { createdAt: "desc" }
    }),
    prisma.mistake.findMany({
      where: { userId },
      select: { tags: true, classification: true },
      take: 100,
      orderBy: { createdAt: "desc" }
    })
  ]);

  const accuracyValues = games.flatMap((game) =>
    [game.accuracyWhite, game.accuracyBlack].filter((value): value is number => typeof value === "number")
  );
  const averageAccuracy =
    accuracyValues.length === 0
      ? 0
      : Math.round(accuracyValues.reduce((total, value) => total + value, 0) / accuracyValues.length);

  const blunders = mistakes.filter((mistake) => mistake.classification === "BLUNDER").length;
  const tagCounts = new Map<string, number>();

  for (const mistake of mistakes) {
    for (const tag of mistake.tags) {
      tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
    }
  }

  const commonMistakeTags = Array.from(tagCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([tag]) => tag);

  return {
    gamesReviewed,
    averageAccuracy,
    blundersPerGame: gamesReviewed === 0 ? 0 : Number((blunders / gamesReviewed).toFixed(2)),
    commonMistakeTags,
    nextTrainingFocus:
      commonMistakeTags.length > 0
        ? commonMistakeTags.map((tag) => `${tag} давтах`)
        : ["Тактикийн аюул шалгах", "Төвийн хяналт", "Ноёны аюулгүй байдал"]
  };
}
