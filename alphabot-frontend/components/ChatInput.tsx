type ChatInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled?: boolean;
};

export default function ChatInput({
  value,
  onChange,
  onSend,
  disabled = false,
}: ChatInputProps) {
  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      onSend();
    }
  };

  return (
    <div className="mt-auto">
      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-3 shadow-2xl shadow-black/20 backdrop-blur-xl">
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="Message AlphaBot..."
          rows={1}
          className="w-full resize-none bg-transparent px-3 py-3 text-sm text-white outline-none placeholder:text-zinc-600"
        />

        <div className="flex items-center justify-between px-2 pb-1">
          <p className="text-xs text-zinc-600">
            Enter to send · Shift + Enter for new line
          </p>

          <button
            onClick={onSend}
            disabled={!value.trim() || disabled}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500 text-white transition hover:bg-purple-400 disabled:cursor-not-allowed disabled:opacity-30"
          >
            ↑
          </button>
        </div>
      </div>

      <p className="mt-3 text-center text-xs text-zinc-600">
        AlphaBot can make mistakes. Check important information.
      </p>
    </div>
  );
}