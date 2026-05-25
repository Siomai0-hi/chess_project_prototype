export interface VoiceCoachingJob {
  explanationId: string;
  language: "mn" | "en";
  voiceId?: string;
}

export interface OcrBoardRecognitionJob {
  imageUrl: string;
  userId?: string;
}

export interface GameImportJob {
  source: "LICHESS" | "CHESSCOM";
  externalId: string;
  userId: string;
}

export interface RealtimeAnalysisEvent {
  gameId: string;
  moveId?: string;
  type: "analysis.started" | "analysis.completed" | "coach.completed";
}
