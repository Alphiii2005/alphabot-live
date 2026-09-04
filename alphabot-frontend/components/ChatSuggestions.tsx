type ChatSuggestionsProps = {
  onSelect: (text: string) => void;
};

const suggestions = [
  {
    title: "Explain something",
    description: "Make a difficult topic easy to understand.",
    icon: "💡",
    prompt: "Explain something to me in simple terms",
  },
  {
    title: "Write something",
    description: "Create, rewrite or improve your writing.",
    icon: "✍️",
    prompt: "Help me write something",
  },
  {
    title: "Help with code",
    description: "Debug, explain or improve your code.",
    icon: "</>",
    prompt: "Help me with some code",
  },
  {
    title: "Brainstorm ideas",
    description: "Explore ideas and solve problems together.",
    icon: "✦",
    prompt: "Give me some ideas",
  },
];

export default function ChatSuggestions({
  onSelect,
}: ChatSuggestionsProps) {
  return (
    <div className="mt-10 grid w-full max-w-2xl gap-3 sm:grid-cols-2">
      {suggestions.map((suggestion) => (
        <button
          key={suggestion.title}
          onClick={() => onSelect(suggestion.prompt)}
          className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 text-left transition hover:-translate-y-1 hover:border-purple-400/30 hover:bg-white/[0.06]"
        >
          <p className="text-sm font-medium text-white">
            <span className="mr-2">{suggestion.icon}</span>
            {suggestion.title}
          </p>

          <p className="mt-1 text-sm text-zinc-500">
            {suggestion.description}
          </p>
        </button>
      ))}
    </div>
  );
}