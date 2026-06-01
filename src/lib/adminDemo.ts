import type { AdminAnalytics, AdminTitle, AdminUser } from "@/types/admin";

/**
 * Demo analytics used as a graceful fallback when the backend is offline,
 * so the dashboard always renders meaningful charts during development.
 */
export function getDemoAnalytics(): AdminAnalytics {
  const days = 30;
  const viewsOverTime = Array.from({ length: days }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (days - 1 - i));
    const wave = Math.sin(i / 3) * 0.3 + 1;
    return {
      date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      views: Math.round((2400 + i * 60) * wave + Math.random() * 400),
      signups: Math.round((120 + i * 4) * wave + Math.random() * 40),
    };
  });

  return {
    stats: {
      totalUsers: 48230,
      activeUsers: 12840,
      totalTitles: 3412,
      totalViews: 1284500,
      usersChange: 12.4,
      activeChange: 8.1,
      titlesChange: 3.2,
      viewsChange: -2.7,
    },
    viewsOverTime,
    genreDistribution: [
      { genre: "Drama", count: 642 },
      { genre: "Action", count: 528 },
      { genre: "Comedy", count: 487 },
      { genre: "Thriller", count: 401 },
      { genre: "Sci-Fi", count: 356 },
      { genre: "Horror", count: 289 },
      { genre: "Romance", count: 244 },
      { genre: "Documentary", count: 198 },
    ],
    topTitles: [
      { id: "1", title: "The Crimson Veil", posterPath: null, mediaType: "SERIES", views: 84200, avgWatchPercent: 87 },
      { id: "2", title: "Echoes of Tomorrow", posterPath: null, mediaType: "MOVIE", views: 71500, avgWatchPercent: 79 },
      { id: "3", title: "Northern Lights", posterPath: null, mediaType: "SERIES", views: 65300, avgWatchPercent: 82 },
      { id: "4", title: "The Last Algorithm", posterPath: null, mediaType: "MOVIE", views: 58100, avgWatchPercent: 74 },
      { id: "5", title: "Midnight Harbor", posterPath: null, mediaType: "SERIES", views: 52400, avgWatchPercent: 80 },
    ],
  };
}

const DEMO_TITLE_NAMES = [
  "The Crimson Veil", "Echoes of Tomorrow", "Northern Lights", "The Last Algorithm",
  "Midnight Harbor", "Silent Frequency", "Crown of Ashes", "The Glass Atlas",
  "Velvet Thunder", "Paper Cities", "The Quiet Hours", "Solstice",
];

export function getDemoTitles(): AdminTitle[] {
  const statuses = ["PUBLISHED", "DRAFT", "ARCHIVED"] as const;
  const ratings = ["PG-13", "TV-MA", "R", "TV-14", "PG"] as const;
  return DEMO_TITLE_NAMES.map((title, i) => ({
    id: `t-${i + 1}`,
    title,
    mediaType: i % 3 === 0 ? "SERIES" : "MOVIE",
    posterPath: null,
    releaseDate: `20${20 + (i % 5)}-0${(i % 9) + 1}-15`,
    maturityRating: ratings[i % ratings.length]!,
    status: statuses[i % (i < 9 ? 1 : statuses.length)] ?? "PUBLISHED",
    voteAverage: Math.round((6 + (i % 4) + Math.random()) * 10) / 10,
    views: Math.round(80000 - i * 5200 + Math.random() * 2000),
    updatedAt: `2026-0${(i % 5) + 1}-${10 + i}`,
  }));
}

export function getDemoUsers(): AdminUser[] {
  const first = ["Alex", "Jordan", "Sam", "Taylor", "Morgan", "Casey", "Riley", "Jamie", "Drew", "Quinn"];
  return first.map((name, i) => ({
    id: `u-${i + 1}`,
    email: `${name.toLowerCase()}@example.com`,
    displayName: name,
    role: i === 0 ? "ADMIN" : "USER",
    avatarUrl: null,
    status: i % 7 === 6 ? "SUSPENDED" : "ACTIVE",
    profileCount: (i % 4) + 1,
    createdAt: `2025-${String((i % 12) + 1).padStart(2, "0")}-${String((i % 27) + 1).padStart(2, "0")}`,
    lastActiveAt: i % 5 === 0 ? null : `2026-06-${String((i % 28) + 1).padStart(2, "0")}`,
  }));
}