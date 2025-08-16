import { supabase } from '@/lib/supabase';
import { AppState, ScoreRecord } from '@/types';

// アプリケーション状態をSupabaseから取得
export const getAppStateFromSupabase = async (): Promise<AppState> => {
  if (!supabase) {
    console.log('Supabaseが設定されていません。ローカルモードで動作します。');
    return getDefaultAppState();
  }

  try {
    const { data, error } = await supabase
      .from('app_state')
      .select('*')
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Supabaseからデータ取得エラー:', error);
      return getDefaultAppState();
    }

    // Supabaseから取得したデータを正しい形式に変換
    if (data) {
      return {
        groups: data.groups || [],
        playerScores: data.player_scores || [],
        scoreRecords: data.score_records || [],
        currentHole: data.current_hole || 1,
        count: data.count || 0,
        name: data.name || '',
        displayName: data.display_name || '',
      };
    }
    return getDefaultAppState();
  } catch (error) {
    console.error('Supabase接続エラー:', error);
    return getDefaultAppState();
  }
};

// アプリケーション状態をSupabaseに保存
export const saveAppStateToSupabase = async (appState: AppState): Promise<void> => {
  if (!supabase) {
    console.log('Supabaseが設定されていません。ローカルモードで動作します。');
    return;
  }

  try {
    const { error } = await supabase
      .from('app_state')
      .upsert({
        id: 1,
        count: appState.count,
        name: appState.name,
        display_name: appState.displayName,
        player_scores: appState.playerScores,
        score_records: appState.scoreRecords,
        groups: appState.groups,
        current_hole: appState.currentHole,
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error('Supabaseへの保存エラー:', error);
    }
  } catch (error) {
    console.error('Supabase接続エラー:', error);
  }
};

// スコアをSupabaseに追加
export const addScoreToSupabase = async (score: ScoreRecord): Promise<void> => {
  if (!supabase) {
    console.log('Supabaseが設定されていません。ローカルモードで動作します。');
    return;
  }

  try {
    const { error } = await supabase
      .from('scores')
      .insert({
        player_name: score.playerName,
        score: score.score,
        date: score.date,
        notes: score.notes
      });

    if (error) {
      console.error('スコア保存エラー:', error);
    }
  } catch (error) {
    console.error('Supabase接続エラー:', error);
  }
};

// スコアをSupabaseから削除
export const deleteScoreFromSupabase = async (id: string): Promise<void> => {
  if (!supabase) {
    console.log('Supabaseが設定されていません。ローカルモードで動作します。');
    return;
  }

  try {
    const { error } = await supabase
      .from('scores')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('スコア削除エラー:', error);
    }
  } catch (error) {
    console.error('Supabase接続エラー:', error);
  }
};

// リアルタイムでアプリケーション状態の変更を監視
export const subscribeToAppState = (callback: (appState: AppState) => void) => {
  if (!supabase) {
    console.log('Supabaseが設定されていません。リアルタイム機能は無効です。');
    return {
      unsubscribe: () => {}
    };
  }

  return supabase
    .channel('app_state_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'app_state'
      },
      (payload: any) => {
        if (payload.new) {
          const newData = payload.new as any;
          const appState: AppState = {
            groups: newData.groups || [],
            playerScores: newData.player_scores || [],
            scoreRecords: newData.score_records || [],
            currentHole: newData.current_hole || 1,
            count: newData.count || 0,
            name: newData.name || '',
            displayName: newData.display_name || '',
          };
          callback(appState);
        }
      }
    )
    .subscribe();
};

// デフォルトのアプリケーション状態
export const getDefaultAppState = (): AppState => ({
  groups: [],
  playerScores: [],
  scoreRecords: [],
  currentHole: 1,
  count: 0,
  name: '',
  displayName: '',
});
