import OpenAI from "openai";
import type { CoachExplanation, MoveAnalysis, SupportedLanguage } from "@mda-chess/shared";
import { env } from "../../config/env";
import { buildCoachSystemPrompt, buildCoachUserPrompt } from "../../ai/coachPrompt";

let openai: OpenAI | undefined;

export async function explainMove(input: {
  move: MoveAnalysis;
  language: SupportedLanguage;
  userLevel: "beginner" | "intermediate" | "advanced";
}): Promise<CoachExplanation> {
  if (!env.OPENAI_API_KEY) {
    return fallbackExplanation(input.move, input.language);
  }

  openai ??= new OpenAI({ apiKey: env.OPENAI_API_KEY });

  const response = await openai.chat.completions.create({
    model: env.OPENAI_MODEL,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: buildCoachSystemPrompt(input.language)
      },
      {
        role: "user",
        content: `${buildCoachUserPrompt(input.move)}\nUser level: ${input.userLevel}`
      }
    ],
    temperature: 0.35
  });

  const content = response.choices[0]?.message.content;
  if (!content) {
    return fallbackExplanation(input.move, input.language);
  }

  try {
    const parsed = JSON.parse(content) as Omit<CoachExplanation, "language">;
    return {
      language: input.language,
      short: parsed.short,
      long: parsed.long,
      tacticalReason: parsed.tacticalReason,
      positionalReason: parsed.positionalReason,
      betterMove: parsed.betterMove,
      trainingTip: parsed.trainingTip
    };
  } catch {
    return fallbackExplanation(input.move, input.language);
  }
}

function fallbackExplanation(move: MoveAnalysis, language: SupportedLanguage): CoachExplanation {
  if (language === "en") {
    return {
      language,
      short: `${move.san} is classified as ${move.classification}. ${move.bestMove ? `${move.bestMove} was a stronger option.` : ""}`,
      long: "This move should be reviewed by checking immediate threats, loose pieces, king safety, and center control before committing.",
      tacticalReason: "Look for forcing moves such as checks, captures, threats, forks, pins, and discovered attacks.",
      positionalReason: "Compare piece activity, center control, king safety, pawn structure, and weak squares after the move.",
      betterMove: move.bestMove,
      trainingTip: "Before every move, pause for ten seconds and ask: what is my opponent threatening?",
    };
  }

  return {
    language,
    short: `${move.san} нүүдэл нь "${move.classification}" гэж ангилагдлаа. ${
      move.bestMove ? `${move.bestMove} илүү сайн хувилбар байж болно.` : ""
    }`,
    long: "Энэ нүүдлийг дахин харахдаа шууд аюул, хамгаалалтгүй бод, ноёны аюулгүй байдал, төвийн хяналт өөрчлөгдсөн эсэхийг шалгаарай.",
    tacticalReason: "Шах, идэлт, давхар довтолгоо, хадаас, ил довтолгоо зэрэг хүчтэй тактикийн боломжийг эхэлж тооц.",
    positionalReason: "Нүүдлийн дараа боднууд идэвхтэй эсэх, төвийн хяналт, сул нүд, хүүгийн бүтэц сайжирсан эсэхийг харьцуул.",
    betterMove: move.bestMove,
    trainingTip: "Нүүдэл бүрийн өмнө арван секунд зогсоод: өрсөлдөгч яг юу заналхийлж байна вэ гэж асуу."
  };
}
