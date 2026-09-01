export default function Footer() {
  return (
    <footer className="border-t border-white/10 px-6 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-sm text-zinc-500 sm:flex-row">

        <p>
          © {new Date().getFullYear()} AlphaBot
        </p>

        <p>
          Built with Django + Next.js
        </p>

      </div>
    </footer>
  );
}