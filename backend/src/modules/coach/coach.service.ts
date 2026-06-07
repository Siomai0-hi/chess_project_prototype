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

  // Retry once on transient OpenAI failures
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
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
        temperature: 0.35,
        timeout: 12000
      });

      const content = response.choices[0]?.message.content;
      if (!content) continue;

      const parsed = safeParseCoachResponse(content, input.language, input.move);
      if (parsed) return parsed;
    } catch (err) {
      // On last attempt, fall through to fallback
      if (attempt === 1) {
        console.error("[coach] OpenAI request failed after retry:", err);
      }
    }
  }

  return fallbackExplanation(input.move, input.language);
}

function safeParseCoachResponse(
  content: string,
  language: SupportedLanguage,
  move: MoveAnalysis
): CoachExplanation | null {
  try {
    const raw = JSON.parse(content) as Partial<Omit<CoachExplanation, "language">>;

    // Validate required fields exist and are strings
    if (
      typeof raw.short !== "string" ||
      typeof raw.long !== "string" ||
      typeof raw.tacticalReason !== "string" ||
      typeof raw.positionalReason !== "string" ||
      typeof raw.trainingTip !== "string"
    ) {
      return null;
    }

    return {
      language,
      short: raw.short,
      long: raw.long,
      tacticalReason: raw.tacticalReason,
      positionalReason: raw.positionalReason,
      betterMove: typeof raw.betterMove === "string" ? raw.betterMove : move.bestMove,
      trainingTip: raw.trainingTip
    };
  } catch {
    return null;
  }
}

function fallbackExplanation(move: MoveAnalysis, language: SupportedLanguage): CoachExplanation {
  if (language === "en") {
    return {
      language,
      short: `${move.san} is classified as ${move.classification}. ${move.bestMove ? `${move.bestMove} was a stronger option.` : ""}`,
      long: "This move should be reviewed by checking immediate threats, loose pieces, king safety, and center control before committing.",
      tacticalReason: "Look for forcing moves such as checks, captures, threats, forks, pins, and discovered attacks.",
      positionalReason:
        "Compare piece activity, center control, king safety, pawn structure, and weak squares after the move.",
      betterMove: move.bestMove,
      trainingTip: "Before every move, pause for ten seconds and ask: what is my opponent threatening?"
    };
  }

  return {
    language,
    short: `${move.san} нүүдэл нь "${move.classification}" гэж ангилагдлаа. ${
      move.bestMove ? `${move.bestMove} илүү сайн хувилбар байж болно.` : ""
    }`,
    long: "Энэ нүүдлийг дахин харахдаа шууд аюул, хамгаалалтгүй бод, ноёны аюулгүй байдал, төвийн хяналт өөрчлөгдсөн эсэхийг шалгаарай.",
    tacticalReason:
      "Шах, идэлт, давхар довтолгоо, хадаас, ил довтолгоо зэрэг хүчтэй тактикийн боломжийг эхэлж тооц.",
    positionalReason:
      "Нүүдлийн дараа боднууд идэвхтэй эсэх, төвийн хяналт, сул нүд, хүүгийн бүтэц сайжирсан эсэхийг харьцуул.",
    betterMove: move.bestMove,
    trainingTip:
      "Нүүдэл бүрийн өмнө арван секунд зогсоод: өрсөлдөгч яг юу заналхийлж байна вэ гэж асуу."
  };
}
