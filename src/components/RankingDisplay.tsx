'use client';

import { useState } from 'react';
import { PlayerScore } from '@/types';

interface RankingDisplayProps {
  playerScores: PlayerScore[];
}

type RankingType = 'gross' | 'net' | 'group';
type SortOrder = 'asc' | 'desc';

export default function RankingDisplay({ playerScores }: RankingDisplayProps) {
  const [rankingType, setRankingType] = useState<RankingType>('net');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // ランキングデータを計算
  const calculateRankings = () => {
    if (playerScores.length === 0) return [];

    let sortedScores = [...playerScores];

    // ランキングタイプに応じてソート
    switch (rankingType) {
      case 'gross':
        sortedScores.sort((a, b) => 
          sortOrder === 'asc' ? a.totalScore - b.totalScore : b.totalScore - a.totalScore
        );
        break;
      case 'net':
        sortedScores.sort((a, b) => 
          sortOrder === 'asc' ? a.netScore - b.netScore : b.netScore - a.netScore
        );
        break;
      case 'group':
        // 組別にソート（組名、次にネットスコア）
        sortedScores.sort((a, b) => {
          if (a.groupName !== b.groupName) {
            return a.groupName.localeCompare(b.groupName);
          }
          return sortOrder === 'asc' ? a.netScore - b.netScore : b.netScore - a.netScore;
        });
        break;
    }

    return sortedScores.map((score, index) => ({
      ...score,
      rank: index + 1
    }));
  };

  // 組別統計を計算
  const calculateGroupStats = () => {
    const groupStats: { [groupName: string]: any } = {};

    playerScores.forEach(score => {
      if (!groupStats[score.groupName]) {
        groupStats[score.groupName] = {
          players: [],
          totalGrossScore: 0,
          totalNetScore: 0,
          averageGrossScore: 0,
          averageNetScore: 0
        };
      }

      groupStats[score.groupName].players.push(score);
      groupStats[score.groupName].totalGrossScore += score.totalScore;
      groupStats[score.groupName].totalNetScore += score.netScore;
    });

    // 平均を計算
    Object.keys(groupStats).forEach(groupName => {
      const playerCount = groupStats[groupName].players.length;
      groupStats[groupName].averageGrossScore = Math.round(groupStats[groupName].totalGrossScore / playerCount);
      groupStats[groupName].averageNetScore = Math.round(groupStats[groupName].totalNetScore / playerCount);
    });

    return groupStats;
  };

  // スコアの色を決定
  const getScoreColor = (score: number, par: number) => {
    if (score < par) return 'text-green-600';
    if (score > par) return 'text-red-600';
    return 'text-gray-800';
  };

  // ランキングの色を決定
  const getRankColor = (rank: number) => {
    if (rank === 1) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    if (rank === 2) return 'bg-gray-100 text-gray-800 border-gray-300';
    if (rank === 3) return 'bg-orange-100 text-orange-800 border-orange-300';
    return 'bg-white text-gray-800 border-gray-200';
  };

  const rankings = calculateRankings();
  const groupStats = calculateGroupStats();

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        📊 リアルタイムランキング
      </h2>

      {/* ランキング設定 */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-blue-800 mb-3">
          ⚙️ ランキング設定
        </h3>
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ランキングタイプ
            </label>
            <select
              value={rankingType}
              onChange={(e) => setRankingType(e.target.value as RankingType)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-geocentric-blue focus:border-transparent"
            >
              <option value="net">ネットスコア（オリンピック形式）</option>
              <option value="gross">グロススコア</option>
              <option value="group">組別ランキング</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ソート順
            </label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as SortOrder)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-geocentric-blue focus:border-transparent"
            >
              <option value="asc">昇順（低いスコアが上位）</option>
              <option value="desc">降順（高いスコアが上位）</option>
            </select>
          </div>
        </div>
      </div>

      {/* ランキング表示 */}
      {rankings.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">まだスコアが記録されていません</p>
          <p className="text-sm text-gray-400">18ホールスコア入力でスコアを入力してください</p>
        </div>
      ) : (
        <>
          {/* ランキングテーブル */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-green-800 mb-3">
              🏆 ランキング
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      順位
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      プレイヤー
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      組
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      グロス
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ネット
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      進捗
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {rankings.map((player) => (
                    <tr key={player.playerId} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRankColor(player.rank)}`}>
                          {player.rank}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900">
                          {player.playerName}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-500">
                          {player.groupName}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900">
                          {player.totalScore}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className={`text-sm font-medium ${player.netScore < 0 ? 'text-green-600' : player.netScore > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                          {player.netScore > 0 ? '+' : ''}{player.netScore}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-500">
                          {player.scores.length}/18 ホール
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 組別統計 */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-purple-800 mb-3">
              📈 組別統計
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(groupStats).map(([groupName, stats]) => (
                <div key={groupName} className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-800 mb-3">{groupName}</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">プレイヤー数:</span>
                      <span className="font-medium">{stats.players.length}人</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">平均グロス:</span>
                      <span className="font-medium">{stats.averageGrossScore}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">平均ネット:</span>
                      <span className={`font-medium ${stats.averageNetScore < 0 ? 'text-green-600' : stats.averageNetScore > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                        {stats.averageNetScore > 0 ? '+' : ''}{stats.averageNetScore}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 詳細スコア表示 */}
          <div>
            <h3 className="text-lg font-medium text-yellow-800 mb-3">
              📋 詳細スコア
            </h3>
            <div className="space-y-4">
              {rankings.map((player) => (
                <div key={player.playerId} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <h4 className="font-medium text-gray-800">
                        {player.rank}位: {player.playerName} ({player.groupName})
                      </h4>
                      <p className="text-sm text-gray-600">
                        グロス: {player.totalScore} | ネット: {player.netScore > 0 ? '+' : ''}{player.netScore}
                      </p>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRankColor(player.rank)}`}>
                      {player.rank}位
                    </span>
                  </div>
                  
                  {/* ホール別スコア */}
                  <div className="grid grid-cols-6 gap-1">
                    {Array.from({ length: 18 }, (_, i) => i + 1).map(hole => {
                      const holeScore = player.scores.find(s => s.holeNumber === hole);
                      return (
                        <div key={hole} className="text-center p-1">
                          <div className="text-xs text-gray-500">H{hole}</div>
                          {holeScore ? (
                            <div className={`text-sm font-medium ${getScoreColor(holeScore.score, holeScore.par)}`}>
                              {holeScore.score}
                            </div>
                          ) : (
                            <div className="text-sm text-gray-300">-</div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
