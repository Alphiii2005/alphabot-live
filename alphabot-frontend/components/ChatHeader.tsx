type ChatHeaderProps = {
  onNewChat: () => void;
};

export default function ChatHeader({
  onNewChat,
}: ChatHeaderProps) {
  return (
    <div className="mb-8 flex items-center justify-between">
      <div>
        <h1 className="text-xl font-semibold text-white">
          Chat
        </h1>

        <p className="mt-1 text-sm text-zinc-500">
          Talk with AlphaBot
        </p>
      </div>

      <button
        onClick={onNewChat}
        className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-zinc-400 transition hover:bg-white/[0.08] hover:text-white"
      >
        New chat
      </button>
    </div>
  );
}