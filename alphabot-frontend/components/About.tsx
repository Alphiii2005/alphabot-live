export default function About() {
  return (
    <section
      id="about"
      className="relative px-6 py-32"
    >
      <div className="mx-auto max-w-4xl text-center">

        <p className="mb-4 text-sm font-medium uppercase tracking-[0.3em] text-purple-400">
          About AlphaBot
        </p>

        <h2 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
          Built to be useful.
        </h2>

        <p className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-zinc-400">
          AlphaBot brings multiple AI-powered tools into one simple
          workspace. Chat, code, write, create and experiment without
          jumping between different applications.
        </p>

      </div>
    </section>
  );
}