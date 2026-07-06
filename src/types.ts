/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Role = 'controller' | 'initiator' | 'sentinel' | 'duelist';
export type Difficulty = 'easy' | 'medium' | 'hard' | 'pro-only';
export type LineupType = 'pre-plant' | 'post-plant' | 'retake' | 'execute' | 'on-the-fly';
export type Side = 'attack' | 'defense';

export interface Agent {
  id: string;
  name: string;
  role: Role | string;
  icon: string;
}

export interface MapData {
  id: string;
  name: string;
  minimap: string;
}

export interface LineupImage {
  url: string;
  alt: string;
  type: 'position' | 'crosshair' | 'result' | string;
}

export interface LineupVideo {
  type: 'youtube' | string;
  videoId: string;
  startSeconds: number;
}

export interface MinimapMark {
  x: number; // 0 to 1 scaling relative to the minimap container width
  y: number; // 0 to 1 scaling relative to the minimap container height
  angle?: number; // rotation in radians for line/cone overlays
}

export interface LineupMedia {
  images: LineupImage[];
  video?: LineupVideo;
  minimapMark: MinimapMark;
  standMark?: MinimapMark;
}

export interface LineupDetails {
  title: string;
  description: string;
  type: LineupType | string;
  side: Side;
  site: 'A' | 'B' | 'C' | 'Mid' | string;
  ability: string;
  difficulty: Difficulty;
  tags: string[];
  media: LineupMedia;
}

export type UserRole = 'jogador' | 'contribuinte' | 'pro-player' | 'admin';

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  provider: 'riot' | 'google' | 'manual';
  approvedSubmissionsCount: number;
}

export interface Lineup {
  id: string;
  version: number;
  agent: Agent;
  map: MapData;
  lineup: LineupDetails;
  isCustom?: boolean;      // Marks if it was created by the user in IndexedDB
  isBookmarked?: boolean;  // Saved locally by the user
  status?: 'pending' | 'approved' | 'rejected';
  authorId?: string;
  authorName?: string;
}

export interface AppState {
  lineups: Lineup[];
  selectedMap: string;   // 'all' or actual mapId
  selectedAgent: string; // 'all' or actual agentId
  selectedDifficulty: string; // 'all' or actual difficulty
  searchQuery: string;
  activeLineupId: string | null;
}
