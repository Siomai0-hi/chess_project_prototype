import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

interface PromotionDialogProps {
  open: boolean;
  color: "w" | "b";
  onSelect: (piece: "q" | "r" | "b" | "n") => void;
  onClose: () => void;
}

const pieces: { value: "q" | "r" | "b" | "n"; label: string; symbol: { w: string; b: string } }[] = [
  { value: "q", label: "Вазир", symbol: { w: "♕", b: "♛" } },
  { value: "r", label: "Тэрэг", symbol: { w: "♖", b: "♜" } },
  { value: "b", label: "Бишоп", symbol: { w: "♗", b: "♝" } },
  { value: "n", label: "Морь", symbol: { w: "♘", b: "♞" } }
];

export function PromotionDialog({ open, color, onSelect, onClose }: PromotionDialogProps) {
  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/65 p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 12 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            className="glass w-full max-w-sm rounded-2xl shadow-panel"
          >
            <div className="flex h-12 items-center justify-between border-b border-white/[0.07] px-4">
              <h2 className="text-sm font-bold text-white">Бодыг солих</h2>
              <button
                className="grid h-7 w-7 place-items-center rounded-lg text-white/50 transition hover:bg-white/10 hover:text-white"
                onClick={onClose}
                aria-label="Хаах"
              >
                <X size={15} />
              </button>
            </div>

            <div className="grid grid-cols-4 gap-2 p-4">
              {pieces.map((piece) => (
                <button
                  key={piece.value}
                  className="group flex flex-col items-center gap-1.5 rounded-xl border border-white/[0.07] bg-white/[0.04] p-3 transition-all duration-150 hover:border-accent/50 hover:bg-accent/10 hover:shadow-glow-sm active:scale-95"
                  onClick={() => onSelect(piece.value)}
                  title={piece.label}
                >
                  <span className="text-3xl leading-none transition-transform group-hover:scale-110">
                    {piece.symbol[color]}
                  </span>
                  <span className="text-[10px] font-semibold text-white/45 group-hover:text-accent-light">
                    {piece.label}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
