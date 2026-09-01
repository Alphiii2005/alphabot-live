import Link from "next/link";

type ToolCardProps = {
  title: string;
  description: string;
  icon: string;
  href: string;
};

export default function ToolCard({
  title,
  description,
  icon,
  href,
}: ToolCardProps) {
  return (
    <Link
      href={href}
      className="group rounded-3xl border border-white/10 bg-white/[0.035] p-7 backdrop-blur-xl transition duration-300 hover:-translate-y-2 hover:border-purple-400/30 hover:bg-white/[0.06] hover:shadow-2xl hover:shadow-purple-950/30"
    >
      {/* Icon */}
      <div className="mb-7 flex h-14 w-14 items-center justify-center rounded-2xl border border-purple-400/20 bg-purple-500/10 font-mono text-lg text-purple-300 transition duration-300 group-hover:scale-110 group-hover:bg-purple-500/20">
        {icon}
      </div>

      <h3 className="text-xl font-semibold text-white">
        {title}
      </h3>

      <p className="mt-3 leading-7 text-zinc-400">
        {description}
      </p>

      <div className="mt-7 text-sm text-purple-400 opacity-0 transition group-hover:opacity-100">
        Open tool →
      </div>
    </Link>
  );
}