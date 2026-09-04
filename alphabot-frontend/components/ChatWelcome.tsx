import ChatSuggestions from "./ChatSuggestions";

type ChatWelcomeProps = {
  onSelectSuggestion: (text: string) => void;
};

export default function ChatWelcome({
  onSelectSuggestion,
}: ChatWelcomeProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center pb-20 text-center">
      <div className="mb-6 text-6xl font-semibold text-purple-400">
        α
      </div>

      <h2 className="text-3xl font-semibold sm:text-4xl">
        How can I help?
      </h2>

      <p className="mt-4 max-w-md text-zinc-500">
        Ask AlphaBot anything. Write, learn, code,
        brainstorm or just have a conversation.
      </p>

      <ChatSuggestions onSelect={onSelectSuggestion} />
    </div>
  );
}