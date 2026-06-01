import type { MediaType, MaturityRating } from "@/types/content";
import type { Role } from "@/types/auth";

/** High-level dashboard KPIs */
export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalTitles: number;
  totalViews: number;
  // Percentage change vs previous period
  usersChange: number;
  activeChange: number;
  titlesChange: number;
  viewsChange: number;
}

/** A single point in a time-series chart */
export interface TimeSeriesPoint {
  date: string;
  views: number;
  signups: number;
}

/** Genre distribution slice */
export interface GenreDistribution {
  genre: string;
  count: number;
}

/** Top-performing title row */
export interface TopTitle {
  id: string;
  title: string;
  posterPath: string | null;
  mediaType: MediaType;
  views: number;
  avgWatchPercent: number;
}

/** Aggregate analytics payload for the dashboard */
export interface AdminAnalytics {
  stats: DashboardStats;
  viewsOverTime: TimeSeriesPoint[];
  genreDistribution: GenreDistribution[];
  topTitles: TopTitle[];
}

/** Content row for the CMS table */
export interface AdminTitle {
  id: string;
  title: string;
  mediaType: MediaType;
  posterPath: string | null;
  releaseDate: string;
  maturityRating: MaturityRating;
  status: "PUBLISHED" | "DRAFT" | "ARCHIVED";
  voteAverage: number;
  views: number;
  updatedAt: string;
}

/** User row for the user-management table */
export interface AdminUser {
  id: string;
  email: string;
  displayName: string;
  role: Role;
  avatarUrl: string | null;
  status: "ACTIVE" | "SUSPENDED";
  profileCount: number;
  createdAt: string;
  lastActiveAt: string | null;
}