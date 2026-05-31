import Link from "next/link";

export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="bg-animated-gradient fixed inset-0 -z-10" />

      {/* Floating accent orbs */}
      <div className="fixed top-20 left-1/4 w-72 h-72 bg-accent-purple/15 rounded-full blur-[100px] animate-float -z-10" />
      <div className="fixed bottom-32 right-1/4 w-80 h-80 bg-accent-blue/10 rounded-full blur-[120px] animate-float -z-10" style={{ animationDelay: "1.5s" }} />
      <div className="fixed top-1/2 right-1/3 w-64 h-64 bg-accent-gold/8 rounded-full blur-[100px] animate-float -z-10" style={{ animationDelay: "3s" }} />

      {/* Content */}
      <div className="relative z-10 text-center space-y-8 animate-fade-in px-6">
        {/* Logo */}
        <div className="space-y-4">
          <h1 className="text-display font-display font-extrabold tracking-tight leading-none">
            <span className="text-gradient-purple">Zephyrus</span>
          </h1>
          <p className="text-xl text-text-secondary font-medium tracking-wide">
            Stream Without Limits
          </p>
        </div>

        {/* Tagline */}
        <p className="text-text-muted max-w-lg mx-auto text-lg leading-relaxed">
          Discover thousands of movies, series, and exclusive originals.
          Your premium cinematic experience awaits.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/login"
            className="group relative inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold text-white rounded-[var(--radius-button)] bg-gradient-purple-btn shadow-glow-purple transition-all duration-300 hover:shadow-glow-purple-lg hover:scale-[1.02] active:scale-[0.98]"
          >
            Sign In
            <svg
              className="ml-2 w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>

          <Link
            href="/register"
            className="inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold text-text-primary rounded-[var(--radius-button)] glass glass-hover transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
          >
            Create Account
          </Link>
        </div>

        {/* Feature badges */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-8">
          {[
            "4K Ultra HD",
            "Dolby Atmos",
            "Offline Downloads",
            "No Ads",
            "5 Profiles",
          ].map((feature) => (
            <span
              key={feature}
              className="px-3 py-1.5 text-xs font-medium text-text-secondary bg-bg-glass rounded-full border border-border"
            >
              {feature}
            </span>
          ))}
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="fixed bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-bg-primary to-transparent -z-5" />
    </div>
  );
}
