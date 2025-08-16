'use client';

import { useState } from 'react';
import { Player, Group, HoleScore, PlayerScore } from '@/types';

interface ScoreInputProps {
  groups: Group[];
  currentHole: number;
  onCurrentHoleChange: (hole: number) => void;
  onPlayerScoresChange: (scores: PlayerScore[]) => void;
  playerScores: PlayerScore[];
}

// 18ホールのパー設定（一般的なゴルフコース）
const HOLE_PARS = [4, 4, 3, 4, 5, 4, 3, 4, 4, 4, 3, 4, 5, 4, 3, 4, 4, 4];

export default function ScoreInput({ 
  groups, 
  currentHole, 
  onCurrentHoleChange, 
  onPlayerScoresChange,
  playerScores 
}: ScoreInputProps) {
  const [scores, setScores] = useState<{ [playerId: string]: number }>({});
  const [confirmedScores, setConfirmedScores] = useState<{ [playerId: string]: boolean }>({});

  // プレイヤーのスコアを取得または初期化
  const getPlayerScore = (playerId: string): PlayerScore | null => {
    return playerScores.find(score => score.playerId === playerId) || null;
  };

  // プレイヤーのスコアを更新
  const updatePlayerScore = (playerId: string, holeNumber: number, score: number) => {
    const existingScore = getPlayerScore(playerId);
    const player = groups.flatMap(g => g.players).find(p => p.id === playerId);
    
    if (!player) return;

    const group = groups.find(g => g.id === player.groupId);
    if (!group) return;

    let updatedScores: HoleScore[];
    
    if (existingScore) {
      // 既存のスコアを更新
      const existingHoleScore = existingScore.scores.find(s => s.holeNumber === holeNumber);
      if (existingHoleScore) {
        updatedScores = existingScore.scores.map(s => 
          s.holeNumber === holeNumber 
            ? { ...s, score } 
            : s
        );
      } else {
        updatedScores = [...existingScore.scores, {
          holeNumber,
          score,
          par: HOLE_PARS[holeNumber - 1]
        }];
      }
    } else {
      // 新しいスコアを作成
      updatedScores = [{
        holeNumber,
        score,
        par: HOLE_PARS[holeNumber - 1]
      }];
    }

    // 合計スコアを計算
    const totalScore = updatedScores.reduce((sum, s) => sum + s.score, 0);
    const totalPar = updatedScores.reduce((sum, s) => sum + s.par, 0);
    const netScore = totalScore - totalPar;

    const newPlayerScore: PlayerScore = {
      playerId,
      playerName: player.name,
      groupId: player.groupId,
      groupName: group.name,
      scores: updatedScores,
      totalScore,
      totalPar,
      netScore
    };

    // プレイヤースコアを更新
    const updatedPlayerScores = existingScore
      ? playerScores.map(ps => ps.playerId === playerId ? newPlayerScore : ps)
      : [...playerScores, newPlayerScore];

    onPlayerScoresChange(updatedPlayerScores);
  };

  // スコア入力ハンドラー
  const handleScoreChange = (playerId: string, score: string) => {
    const numScore = parseInt(score) || 0;
    setScores(prev => ({ ...prev, [playerId]: numScore }));
  };

  // スコア確定
  const confirmScores = () => {
    Object.entries(scores).forEach(([playerId, score]) => {
      if (score > 0) {
        updatePlayerScore(playerId, currentHole, score);
      }
    });
    
    setScores({});
    setConfirmedScores(prev => {
      const newConfirmed = { ...prev };
      Object.keys(scores).forEach(playerId => {
        newConfirmed[playerId] = true;
      });
      return newConfirmed;
    });
  };

  // スコアリセット
  const resetScores = () => {
    setScores({});
    setConfirmedScores(prev => {
      const newConfirmed = { ...prev };
      Object.keys(scores).forEach(playerId => {
        newConfirmed[playerId] = false;
      });
      return newConfirmed;
    });
  };

  // ホール変更
  const changeHole = (direction: 'prev' | 'next') => {
    const newHole = direction === 'prev' ? currentHole - 1 : currentHole + 1;
    if (newHole >= 1 && newHole <= 18) {
      onCurrentHoleChange(newHole);
      setScores({});
      setConfirmedScores({});
    }
  };

  // 全プレイヤーを取得
  const allPlayers = groups.flatMap(g => g.players);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        🏌️ 18ホールスコア入力
      </h2>

      {/* ホールナビゲーション */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-blue-800 mb-3">
          🎯 ホール {currentHole} (パー {HOLE_PARS[currentHole - 1]})
        </h3>
        <div className="flex items-center space-x-4 mb-4">
          <button
            onClick={() => changeHole('prev')}
            disabled={currentHole <= 1}
            className="bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white font-bold py-2 px-4 rounded"
          >
            ← 前のホール
          </button>
          <span className="text-xl font-bold text-gray-800">
            ホール {currentHole} / 18
          </span>
          <button
            onClick={() => changeHole('next')}
            disabled={currentHole >= 18}
            className="bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white font-bold py-2 px-4 rounded"
          >
            次のホール →
          </button>
        </div>
      </div>

      {/* スコア入力フォーム */}
      {allPlayers.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">プレイヤーが登録されていません</p>
          <p className="text-sm text-gray-400">プレイヤー管理でプレイヤーを追加してください</p>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <h3 className="text-lg font-medium text-green-800 mb-3">
              📝 スコア入力
            </h3>
            <div className="space-y-3">
              {groups.map(group => (
                <div key={group.id} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-800 mb-3">{group.name}</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {group.players.map(player => {
                      const playerScore = getPlayerScore(player.id);
                      const currentHoleScore = playerScore?.scores.find(s => s.holeNumber === currentHole);
                      const isConfirmed = confirmedScores[player.id];
                      
                      return (
                        <div key={player.id} className="bg-gray-50 rounded-lg p-3">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium text-gray-800">{player.name}</span>
                            {isConfirmed && (
                              <span className="text-green-600 text-sm">✅</span>
                            )}
                          </div>
                          
                          {currentHoleScore ? (
                            <div className="text-center">
                              <span className={`text-lg font-bold ${
                                currentHoleScore.score < currentHoleScore.par ? 'text-green-600' :
                                currentHoleScore.score > currentHoleScore.par ? 'text-red-600' :
                                'text-gray-800'
                              }`}>
                                {currentHoleScore.score}
                              </span>
                              <span className="text-sm text-gray-500 ml-1">
                                (パー {currentHoleScore.par})
                              </span>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <input
                                type="number"
                                min="1"
                                max="10"
                                value={scores[player.id] || ''}
                                onChange={(e) => handleScoreChange(player.id, e.target.value)}
                                placeholder={`パー ${HOLE_PARS[currentHole - 1]}`}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-geocentric-blue focus:border-transparent ${
                                  scores[player.id] ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                }`}
                              />
                              <div className="text-xs text-gray-500">
                                パー {HOLE_PARS[currentHole - 1]} がデフォルト
                              </div>
                            </div>
                          )}
                          
                          {playerScore && (
                            <div className="mt-2 text-xs text-gray-600">
                              合計: {playerScore.totalScore} (ネット: {playerScore.netScore})
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 操作ボタン */}
          <div className="flex space-x-4">
            <button
              onClick={confirmScores}
              disabled={Object.keys(scores).length === 0}
              className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white font-bold py-2 px-6 rounded"
            >
              スコア確定
            </button>
            <button
              onClick={resetScores}
              disabled={Object.keys(scores).length === 0}
              className="bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white font-bold py-2 px-6 rounded"
            >
              スコアリセット
            </button>
          </div>

          {/* 進捗表示 */}
          <div className="mt-6">
            <h3 className="text-lg font-medium text-purple-800 mb-3">
              📊 進捗状況
            </h3>
            <div className="grid grid-cols-6 gap-2">
              {Array.from({ length: 18 }, (_, i) => i + 1).map(hole => (
                <div
                  key={hole}
                  className={`text-center p-2 rounded-lg text-sm font-medium cursor-pointer ${
                    hole === currentHole
                      ? 'bg-blue-500 text-white'
                      : allPlayers.some(player => {
                          const playerScore = getPlayerScore(player.id);
                          return playerScore?.scores.some(s => s.holeNumber === hole);
                        })
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                  onClick={() => onCurrentHoleChange(hole)}
                >
                  {hole}
                </div>
              ))}
            </div>
            <div className="mt-2 text-xs text-gray-600">
              <span className="inline-block w-3 h-3 bg-blue-500 rounded mr-1"></span>
              現在のホール
              <span className="inline-block w-3 h-3 bg-green-100 border border-green-300 rounded ml-4 mr-1"></span>
              完了済み
              <span className="inline-block w-3 h-3 bg-gray-100 border border-gray-300 rounded ml-4 mr-1"></span>
              未完了
            </div>
          </div>
        </>
      )}
    </div>
  );
}
