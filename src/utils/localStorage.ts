// ローカルストレージのユーティリティ関数

// データを保存
export const saveToStorage = (key: string, data: any): void => {
  try {
    // データの検証
    if (!data) {
      console.warn('保存するデータが空です:', key);
      return;
    }
    
    const jsonData = JSON.stringify(data);
    localStorage.setItem(key, jsonData);
    console.log(`データを保存しました: ${key}`, data);
  } catch (error) {
    console.error('データの保存に失敗しました:', error);
  }
};

// データを読み込み
export const loadFromStorage = (key: string, defaultValue: any = null): any => {
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      const data = JSON.parse(stored);
      console.log(`データを読み込みました: ${key}`, data);
      return data;
    }
  } catch (error) {
    console.error('データの読み込みに失敗しました:', error);
  }
  console.log(`デフォルト値を返します: ${key}`, defaultValue);
  return defaultValue;
};

// データを削除
export const removeFromStorage = (key: string): void => {
  try {
    localStorage.removeItem(key);
    console.log(`データを削除しました: ${key}`);
  } catch (error) {
    console.error('データの削除に失敗しました:', error);
  }
};

// アプリケーション全体の状態を保存
export const saveAppState = (state: any): void => {
  // 状態の検証
  if (!state || typeof state !== 'object') {
    console.warn('無効な状態データです:', state);
    return;
  }
  
  // 必須フィールドの確認
  const requiredFields = ['groups', 'playerScores', 'scoreRecords', 'currentHole', 'count', 'name', 'displayName'];
  const hasAllFields = requiredFields.every(field => field in state);
  
  if (!hasAllFields) {
    console.warn('状態データに必須フィールドが不足しています:', state);
    return;
  }
  
  saveToStorage('golf-app-state', state);
};

// アプリケーション全体の状態を読み込み
export const loadAppState = (): any => {
  const defaultState = {
    groups: [],
    playerScores: [],
    scoreRecords: [],
    currentHole: 1,
    count: 0,
    name: '',
    displayName: '',
  };

  const stored = loadFromStorage('golf-app-state', defaultState);
  
  // 古いデータ構造から新しいデータ構造への移行
  if (stored && stored.scores && !stored.scoreRecords) {
    console.log('古いデータ構造を新しい構造に移行中...');
    return {
      ...defaultState,
      ...stored,
      scoreRecords: stored.scores, // 古いscoresをscoreRecordsに移行
      scores: undefined // 古いフィールドを削除
    };
  }
  
  return stored;
};
