type CVEditorProps = {
  editedCV: string;
  onChange: (value: string) => void;
};

export default function CVEditor({
  editedCV,
  onChange,
}: CVEditorProps) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-5">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-white">
          Edit your CV
        </h2>

        <p className="mt-1 text-xs leading-5 text-zinc-500">
          You can directly edit the generated Markdown.
        </p>
      </div>

      <textarea
        value={editedCV}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-[750px] w-full resize-y rounded-2xl border border-white/10 bg-black/30 p-5 font-mono text-sm leading-6 text-zinc-200 outline-none transition placeholder:text-zinc-700 focus:border-purple-400/40"
        spellCheck={false}
      />
    </div>
  );
}