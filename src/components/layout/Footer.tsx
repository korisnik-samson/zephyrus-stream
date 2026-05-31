import Link from "next/link";
import { Separator } from "@/components/ui";

const footerSections = [
  {
    title: "Navigation",
    links: [
      { label: "Home", href: "/" },
      { label: "Series", href: "/browse/series" },
      { label: "Films", href: "/browse/films" },
      { label: "New & Popular", href: "/browse/new" },
      { label: "My List", href: "/my-list" },
    ],
  },
  {
    title: "Help Center",
    links: [
      { label: "FAQ", href: "/help/faq" },
      { label: "Account Support", href: "/help/account" },
      { label: "Streaming Issues", href: "/help/streaming" },
      { label: "Device Support", href: "/help/devices" },
      { label: "Contact Us", href: "/help/contact" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Manage Profiles", href: "/profile" },
      { label: "Settings", href: "/settings" },
      { label: "Subscription", href: "/settings/subscription" },
      { label: "Redeem Gift Card", href: "/redeem" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/legal/privacy" },
      { label: "Terms of Service", href: "/legal/terms" },
      { label: "Cookie Preferences", href: "/legal/cookies" },
      { label: "Imprint", href: "/legal/imprint" },
    ],
  },
] as const;

function SocialIcon({ d, label }: { d: string; label: string }) {
  return (
    <a
      href="#"
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-text-muted transition-colors hover:border-accent-purple hover:text-accent-purple-light"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="h-4 w-4"
      >
        <path d={d} />
      </svg>
    </a>
  );
}

export default function Footer() {
  return (
    <footer className="border-t border-border bg-bg-secondary">
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
        {/* Social icons row */}
        <div className="mb-8 flex items-center gap-4">
          <SocialIcon
            label="Twitter"
            d="M22.46 6c-.77.35-1.6.58-2.46.69a4.3 4.3 0 0 0 1.88-2.38 8.6 8.6 0 0 1-2.72 1.04 4.28 4.28 0 0 0-7.32 3.91A12.16 12.16 0 0 1 3 4.79a4.28 4.28 0 0 0 1.32 5.72 4.24 4.24 0 0 1-1.94-.54v.05a4.28 4.28 0 0 0 3.43 4.19 4.28 4.28 0 0 1-1.93.07 4.29 4.29 0 0 0 4 2.97A8.59 8.59 0 0 1 2 19.54a12.13 12.13 0 0 0 6.56 1.92c7.88 0 12.2-6.53 12.2-12.2l-.01-.56A8.7 8.7 0 0 0 23 6.68a8.5 8.5 0 0 1-2.54.7z"
          />
          <SocialIcon
            label="Instagram"
            d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2m-.25 2A3.5 3.5 0 0 0 4 7.5v9A3.5 3.5 0 0 0 7.5 20h9a3.5 3.5 0 0 0 3.5-3.5v-9A3.5 3.5 0 0 0 16.5 4h-9m9.75 1.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5M12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10m0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"
          />
          <SocialIcon
            label="YouTube"
            d="M10 15l5.19-3L10 9v6m11.56-7.83c.13.47.22 1.1.28 1.9.07.8.1 1.49.1 2.09L22 12c0 2.19-.16 3.8-.44 4.83-.25.9-.83 1.48-1.73 1.73-.47.13-1.33.22-2.65.28-1.3.07-2.49.1-3.59.1L12 19c-4.19 0-6.8-.16-7.83-.44-.9-.25-1.48-.83-1.73-1.73-.13-.47-.22-1.1-.28-1.9-.07-.8-.1-1.49-.1-2.09L2 12c0-2.19.16-3.8.44-4.83.25-.9.83-1.48 1.73-1.73.47-.13 1.33-.22 2.65-.28 1.3-.07 2.49-.1 3.59-.1L12 5c4.19 0 6.8.16 7.83.44.9.25 1.48.83 1.73 1.73z"
          />
          <SocialIcon
            label="Facebook"
            d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z"
          />
        </div>

        {/* 4-column grid */}
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="mb-3 text-sm font-semibold text-text-primary">
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-xs text-text-muted transition-colors hover:text-text-secondary hover:underline"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-8 bg-border" />

        {/* Copyright */}
        <div className="flex flex-col items-center justify-between gap-2 sm:flex-row">
          <p className="text-xs text-text-muted">
            © 2026 Zephyrus. All rights reserved.
          </p>
          <p className="text-xs text-text-muted">
            Powered by{" "}
            <span className="text-gradient-purple font-semibold">
              ZEPHYRUS
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}
