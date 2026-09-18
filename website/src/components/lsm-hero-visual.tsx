export function LsmHeroVisual() {
  const levels = [
    { label: "L0", width: "42%", delay: "0s" },
    { label: "L1", width: "58%", delay: "0.35s" },
    { label: "L2", width: "74%", delay: "0.7s" },
    { label: "L3", width: "92%", delay: "1.05s" },
  ];

  return (
    <div
      className="animate-drift relative isolate overflow-hidden rounded-none"
      aria-hidden
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(15,122,122,0.35),transparent_45%),linear-gradient(145deg,#0a2a33_0%,#071820_55%,#0c3d3d_100%)]" />
      <svg
        className="absolute inset-0 h-full w-full opacity-40"
        viewBox="0 0 800 500"
        fill="none"
      >
        <path
          className="thread-path"
          d="M40 420 C180 360, 220 280, 320 250 S520 210, 760 80"
          stroke="#71b8b8"
          strokeWidth="1.5"
        />
        <path
          className="thread-path"
          style={{ animationDelay: "0.4s" }}
          d="M60 460 C200 400, 260 320, 380 290 S560 240, 780 140"
          stroke="#d9c4a0"
          strokeWidth="1"
          opacity="0.7"
        />
      </svg>

      <div className="relative z-10 flex min-h-[min(68vh,560px)] flex-col justify-end gap-4 p-6 md:p-10">
        <div className="mb-auto flex items-center justify-between text-[11px] uppercase tracking-[0.22em] text-mist/70">
          <span>Leveled LSM</span>
          <span className="font-mono normal-case tracking-normal text-sand">
            SPNDLSST
          </span>
        </div>

        <div className="space-y-3">
          {levels.map((level) => (
            <div key={level.label} className="flex items-center gap-3">
              <span className="w-8 font-mono text-xs text-mist/70">
                {level.label}
              </span>
              <div className="h-3 flex-1 overflow-hidden bg-white/5">
                <div
                  className="level-bar h-full bg-gradient-to-r from-teal to-sand/80"
                  style={{
                    width: level.width,
                    animationDelay: level.delay,
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3 font-mono text-[11px] text-mist/80 md:text-xs">
          <div className="border border-white/10 bg-black/20 px-3 py-2">
            WAL → mem
          </div>
          <div className="border border-white/10 bg-black/20 px-3 py-2">
            bloom probe
          </div>
          <div className="border border-white/10 bg-black/20 px-3 py-2">
            seq MVCC
          </div>
        </div>
      </div>
    </div>
  );
}
