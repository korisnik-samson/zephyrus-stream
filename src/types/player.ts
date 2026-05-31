export interface SubtitleTrack {
  id: string;
  label: string;
  language: string;
  src: string;
  kind: "subtitles" | "captions";
}

/** Full data contract for a play session, returned by /api/content/{id}/watch */
export interface WatchSession {
  titleId: string;
  titleName: string;
  overview: string;
  backdropPath: string | null;
  mediaType: "MOVIE" | "SERIES";

  // Series only
  episodeId?: string;
  episodeName?: string;
  episodeNumber?: number;
  seasonNumber?: number;

  // Stream
  streamUrl: string;
  subtitleTracks: SubtitleTrack[];

  // Timestamps in seconds
  introStart?: number;
  introEnd?: number;

  // Next episode (series)
  nextEpisodeId?: string;
  nextEpisodeName?: string;

  // Resume from saved position
  savedProgress?: number;
}