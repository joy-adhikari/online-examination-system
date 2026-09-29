export function Avatar({ name, className = "" }: { name?: string | null; className?: string }) {
  const initials =
    (name || "?")
      .replace(/^(Dr\.|Mr\.|Mrs\.|Ms\.|Prof\.)\s*/i, "")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join("") || "?";

  return (
    <div
      role="img"
      aria-label={name || "User"}
      className={`${className} shrink-0 overflow-hidden bg-zinc-900 text-white dark:bg-zinc-100 dark:text-black select-none`}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <text
          x="50"
          y="50"
          dominantBaseline="central"
          textAnchor="middle"
          fontSize="38"
          fontWeight="800"
          fontFamily="ui-monospace, monospace"
          fill="currentColor"
        >
          {initials}
        </text>
      </svg>
    </div>
  );
}
