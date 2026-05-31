/** Media type discriminator for titles */
export type MediaType = "MOVIE" | "SERIES";

/** Content maturity ratings */
export type MaturityRating =
    | "G"
    | "PG"
    | "PG-13"
    | "R"
    | "NC-17"
    | "TV-Y"
    | "TV-Y7"
    | "TV-G"
    | "TV-PG"
    | "TV-14"
    | "TV-MA"
    | "NR";

/** Row display types on the home/browse pages */
export type ContentRowType =
    | "TRENDING"
    | "NEW_RELEASES"
    | "TOP_RATED"
    | "GENRE"
    | "CONTINUE_WATCHING"
    | "PERSONALIZED"
    | "SIMILAR";

/** Primary title entity — represents a movie or series */
export interface Title {
    id: string;
    tmdbId: number;
    mediaType: MediaType;
    title: string;
    overview: string;
    tagline?: string;
    releaseDate: string;
    runtime?: number;
    posterPath: string | null;
    backdropPath: string | null;
    voteAverage: number;
    popularity: number;
    originalLanguage: string;
    maturityRating: MaturityRating;
    status: string;
    genres?: Genre[];
    cast?: CastMember[];
    seasons?: Season[];
}

/** Genre classification */
export interface Genre {
    id: string;
    tmdbId: number;
    name: string;
}

/** Season of a series */
export interface Season {
    id: string;
    titleId: string;
    seasonNumber: number;
    name: string;
    overview: string;
    posterPath: string | null;
    episodeCount: number;
    airDate: string | null;
    episodes?: Episode[];
}

/** Episode within a season */
export interface Episode {
    id: string;
    seasonId: string;
    episodeNumber: number;
    name: string;
    overview: string;
    stillPath: string | null;
    runtime: number | null;
    airDate: string | null;
}

/** Cast member for a title */
export interface CastMember {
    id: string;
    tmdbPersonId: number;
    name: string;
    character: string;
    profilePath: string | null;
    displayOrder: number;
}

/** Pre-assembled content row for the home page */
export interface ContentRow {
    id: string;
    label: string;
    rowType: ContentRowType;
    genreId?: string;
    titles: Title[];
}

/** Featured content item for the hero billboard */
export interface FeaturedTitle extends Title {
    logoPath?: string;
    trailerUrl?: string;
}

/** Watch progress for continue watching */
export interface WatchProgress {
    id: string;
    profileId: string;
    titleId: string;
    episodeId?: string;
    progressSeconds: number;
    durationSeconds: number;
    lastWatchedAt: string;
    completed: boolean;
    title?: Title;
    episode?: Episode;
}
