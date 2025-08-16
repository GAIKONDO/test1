'use client';

import { useState, useEffect } from 'react';
import { saveAppState, loadAppState } from '@/utils/localStorage';
import { 
  getAppStateFromSupabase, 
  saveAppStateToSupabase, 
  subscribeToAppState,
  getDefaultAppState 
} from '@/utils/supabase';
import { AppState, ScoreRecord } from '@/types';
import PlayerManager from '@/components/PlayerManager';
import ScoreInput from '@/components/ScoreInput';
import RankingDisplay from '@/components/RankingDisplay';

export default function Home() {
  const [appState, setAppState] = useState<AppState>({
    groups: [],
    playerScores: [],
    scoreRecords: [],
    currentHole: 1,
    count: 0,
    name: '',
    displayName: '',
  });
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // 状態の変化を監視（デバッグ用）
  useEffect(() => {
    console.log('appStateが変更されました:', appState);
  }, [appState]);

  // 初期化状態の監視（デバッグ用）
  useEffect(() => {
    console.log('初期化状態:', { isLoading, isInitialized, isSupabaseConnected });
  }, [isLoading, isInitialized, isSupabaseConnected]);

  // 初期データの読み込み（ローカルストレージ + Supabase）
  useEffect(() => {
    // クライアントサイドでのみ実行
    if (typeof window === 'undefined') return;
    
    // 既に初期化済みの場合はスキップ
    if (isInitialized) return;
    
    const loadData = async () => {
      setIsLoading(true);
      
      try {
        // まずローカルストレージから読み込み
        const localState = loadAppState();
        console.log('ローカルストレージから読み込み:', localState);
        
        // ローカルデータを設定（必ず設定）
        setAppState(localState);

        // Supabaseからデータを取得
        const supabaseState = await getAppStateFromSupabase();
        console.log('Supabaseから読み込み:', supabaseState);
        
        // Supabaseが設定されているかどうかを判定
        const isConnected = supabaseState !== getDefaultAppState();
        setIsSupabaseConnected(isConnected);
        
        // Supabaseが接続されている場合のみ、ローカルデータを上書き
        // ただし、ローカルデータが空の場合のみ
        if (isConnected && supabaseState && 
            localState.count === 0 && 
            localState.scoreRecords.length === 0 && 
            !localState.displayName) {
          console.log('Supabaseデータで上書き:', supabaseState);
          setAppState(supabaseState);
        } else {
          console.log('ローカルデータを維持');
        }
      } catch (error) {
        console.log('Supabase接続なし、ローカルストレージを使用');
        setIsSupabaseConnected(false);
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    loadData();
  }, [isInitialized]);

  // リアルタイム購読の設定
  useEffect(() => {
    if (isSupabaseConnected) {
      const subscription = subscribeToAppState((newAppState) => {
        setAppState(newAppState);
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [isSupabaseConnected]);

  // データが変更されたら保存（ローカルストレージ + Supabase）
  useEffect(() => {
    // クライアントサイドでのみ実行
    if (typeof window === 'undefined') return;
    
    // 初期化完了後かつローディング完了後のみ保存
    if (isInitialized && !isLoading && Object.keys(appState).length > 0) {
      console.log('データ保存を実行:', appState);
      
      // ローカルストレージに保存
      saveAppState(appState);
      
      // Supabaseに保存（接続されている場合）
      if (isSupabaseConnected) {
        saveAppStateToSupabase(appState);
      }
    }
  }, [appState, isSupabaseConnected, isLoading, isInitialized]);

  // プレイヤースコアを変更
  const handlePlayerScoresChange = (newPlayerScores: any[]) => {
    setAppState(prev => ({
      ...prev,
      playerScores: newPlayerScores
    }));
  };

  // 組の変更を処理
  const handleGroupsChange = (newGroups: any[]) => {
    setAppState(prev => ({
      ...prev,
      groups: newGroups
    }));
  };

  // 現在のホールを変更
  const handleCurrentHoleChange = (hole: number) => {
    setAppState(prev => ({
      ...prev,
      currentHole: hole
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-geocentric-blue mx-auto mb-4"></div>
          <p className="text-gray-600">データを読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* ヘッダー */}
        <div className="text-center mb-8">
                           <h1 className="text-4xl font-bold text-gray-800 mb-2">
                   🏌️ ゴルフコンペアプリ v4.0.0
                 </h1>
          <p className="text-gray-600 mb-4">
            リアルタイムでスコアを共有・管理するゴルフコンペ専用アプリケーション
          </p>
          
          {/* 接続状態表示 */}
          <div className="mt-4 mb-6">
            {isSupabaseConnected ? (
              <div className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                リアルタイム共有: オン
              </div>
            ) : (
              <div className="inline-flex items-center px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                ローカルモード
              </div>
            )}
          </div>

          {/* ナビゲーション */}
          <div className="flex justify-center space-x-4 mb-6">
            <button
              onClick={() => document.getElementById('player-management')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              👥 プレイヤー管理
            </button>
            <button
              onClick={() => document.getElementById('score-input')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              🏌️ スコア入力
            </button>
            <button
              onClick={() => document.getElementById('ranking-display')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              📊 ランキング
            </button>
          </div>

          {/* 統計サマリー */}
          <div className="bg-white rounded-lg shadow-md p-4 max-w-2xl mx-auto">
            <h3 className="text-lg font-medium text-gray-800 mb-3">
              📈 コンペ概要
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{appState.groups?.length || 0}</div>
                <div className="text-gray-600">組数</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {appState.groups?.reduce((total, group) => total + (group.players?.length || 0), 0) || 0}
                </div>
                <div className="text-gray-600">プレイヤー数</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {appState.playerScores?.filter(score => score.scores?.length === 18)?.length || 0}
                </div>
                <div className="text-gray-600">完了者</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {appState.currentHole || 1}
                </div>
                <div className="text-gray-600">現在のホール</div>
              </div>
            </div>
          </div>
        </div>

        {/* メインコンテンツ */}
        <div className="space-y-6">
          {/* フェーズ4: Supabase連携 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              🔗 データ共有設定
            </h2>
            
            {/* 接続状態 */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-purple-800 mb-3">
                🔗 接続状態
              </h3>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                {isSupabaseConnected ? (
                  <div>
                    <p className="text-purple-800 font-medium mb-2">
                      ✅ Supabaseに接続されています
                    </p>
                    <ul className="text-purple-700 text-sm space-y-1">
                      <li>• リアルタイムデータ同期</li>
                      <li>• 複数デバイス間での共有</li>
                      <li>• クラウドでのデータ永続化</li>
                      <li>• 自動バックアップ</li>
                    </ul>
                  </div>
                ) : (
                  <div>
                    <p className="text-purple-800 font-medium mb-2">
                      ⚠️ ローカルモードで動作中
                    </p>
                    <ul className="text-purple-700 text-sm space-y-1">
                      <li>• ローカルストレージを使用</li>
                      <li>• このデバイスでのみ有効</li>
                      <li>• 環境変数の設定が必要</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* リアルタイム機能の説明 */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-purple-800 mb-3">
                ⚡ リアルタイム機能
              </h3>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <p className="text-purple-800 mb-3">
                  接続されている場合、以下の機能が利用できます：
                </p>
                <ul className="text-purple-700 text-sm space-y-2">
                  <li>• <strong>リアルタイム同期:</strong> 他のデバイスでの変更が即座に反映</li>
                  <li>• <strong>複数ユーザー:</strong> 複数の参加者が同時に利用可能</li>
                  <li>• <strong>データ共有:</strong> スマホとPCで同じデータを共有</li>
                  <li>• <strong>自動保存:</strong> クラウドに自動的にデータを保存</li>
                </ul>
              </div>
            </div>

            {/* 設定方法 */}
            <div>
              <h3 className="text-lg font-medium text-purple-800 mb-3">
                ⚙️ 設定方法
              </h3>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-gray-800 mb-3">
                  Supabaseを有効にするには：
                </p>
                <ol className="text-gray-700 text-sm space-y-2">
                  <li>1. Supabaseプロジェクトを作成</li>
                  <li>2. データベーステーブルを設定</li>
                  <li>3. 環境変数を設定</li>
                  <li>4. アプリケーションを再起動</li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        {/* フェーズ5: プレイヤー管理機能 */}
        <div className="mt-6" id="player-management">
          <PlayerManager 
            groups={appState.groups} 
            onGroupsChange={handleGroupsChange} 
          />
        </div>

        {/* フェーズ6: 18ホールスコア入力機能 */}
        <div className="mt-6" id="score-input">
          <ScoreInput
            groups={appState.groups}
            currentHole={appState.currentHole}
            onCurrentHoleChange={handleCurrentHoleChange}
            onPlayerScoresChange={handlePlayerScoresChange}
            playerScores={appState.playerScores}
          />
        </div>

        {/* フェーズ7: ランキング表示機能 */}
        <div className="mt-6" id="ranking-display">
          <RankingDisplay
            playerScores={appState.playerScores}
          />
        </div>

        {/* 次のフェーズの説明 */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">
            🎉 アプリケーション完成！
          </h2>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <h3 className="font-medium text-green-800 mb-2">✅ すべての機能が実装完了</h3>
            <p className="text-green-700 text-sm">
              ゴルフコンペ専用アプリケーションが完成しました！
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-medium text-green-800 mb-2">✅ プレイヤー管理機能</h3>
              <p className="text-green-700 text-sm">
                組の作成、プレイヤーの追加・削除、統計情報表示
              </p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-medium text-green-800 mb-2">✅ 18ホールスコア入力</h3>
              <p className="text-green-700 text-sm">
                各ホールのスコア入力、パー設定、確定ボタン、進捗表示
              </p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-medium text-green-800 mb-2">✅ ランキング表示</h3>
              <p className="text-green-700 text-sm">
                リアルタイムランキング、オリンピック形式計算、組別統計
              </p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-medium text-green-800 mb-2">✅ データ共有</h3>
              <p className="text-green-700 text-sm">
                ローカルストレージ + Supabase連携、リアルタイム同期
              </p>
            </div>
          </div>

          {/* 次のステップ */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-800 mb-2">🚀 次のステップ</h3>
            <div className="text-blue-700 text-sm space-y-2">
              <p>• <strong>デプロイ:</strong> Vercelでアプリケーションを公開</p>
              <p>• <strong>Supabase設定:</strong> リアルタイム共有機能を有効化</p>
              <p>• <strong>テスト:</strong> 実際のゴルフコンペで使用</p>
              <p>• <strong>改善:</strong> フィードバックに基づく機能追加</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
