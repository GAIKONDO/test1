// ゴルフコンペアプリの型定義

// プレイヤーの型定義
export interface Player {
  id: string;
  name: string;
  groupId: string;
}

// 組の型定義
export interface Group {
  id: string;
  name: string;
  players: Player[];
}

// ホールのスコア型定義
export interface HoleScore {
  holeNumber: number;
  score: number;
  par: number;
}

// プレイヤーのスコア型定義
export interface PlayerScore {
  playerId: string;
  playerName: string;
  groupId: string;
  groupName: string;
  scores: HoleScore[];
  totalScore: number;
  totalPar: number;
  netScore: number; // オリンピック形式用
}

// スコア記録の型定義（既存の機能用）
export interface ScoreRecord {
  id: string;
  playerName: string;
  score: number;
  date: string;
  notes?: string;
}

// アプリケーション全体の状態型定義
export interface AppState {
  groups: Group[];
  playerScores: PlayerScore[]; // ゴルフコンペ用
  scoreRecords: ScoreRecord[]; // 既存のスコア記録用
  currentHole: number;
  count: number; // 既存のカウンター機能用
  name: string; // 既存の名前入力機能用
  displayName: string; // 既存の名前入力機能用
}
