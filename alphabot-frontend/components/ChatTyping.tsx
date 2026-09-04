export default function ChatTyping() {
  return (
    <div className="flex gap-3">
      <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-purple-400/20 bg-purple-500/10 text-lg font-semibold text-purple-400">
        α
      </div>

      <div className="flex items-center gap-1 rounded-3xl border border-white/10 bg-white/[0.04] px-5 py-4 backdrop-blur-xl">
        <span className="h-2 w-2 animate-bounce rounded-full bg-zinc-500 [animation-delay:-0.3s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-zinc-500 [animation-delay:-0.15s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-zinc-500" />
      </div>
    </div>
  );
}