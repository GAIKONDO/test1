'use client';

import { useState } from 'react';
import { Player, Group } from '@/types';

interface PlayerManagerProps {
  groups: Group[];
  onGroupsChange: (groups: Group[]) => void;
}

export default function PlayerManager({ groups, onGroupsChange }: PlayerManagerProps) {
  const [newPlayerName, setNewPlayerName] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState('');

  // 新しい組を作成
  const createGroup = () => {
    const newGroup: Group = {
      id: Date.now().toString(),
      name: `組${groups.length + 1}`,
      players: []
    };
    onGroupsChange([...groups, newGroup]);
  };

  // プレイヤーを追加
  const addPlayer = () => {
    if (!newPlayerName.trim() || !selectedGroupId) return;

    const updatedGroups = groups.map(group => {
      if (group.id === selectedGroupId) {
        const newPlayer: Player = {
          id: Date.now().toString(),
          name: newPlayerName.trim(),
          groupId: selectedGroupId
        };
        return {
          ...group,
          players: [...group.players, newPlayer]
        };
      }
      return group;
    });

    onGroupsChange(updatedGroups);
    setNewPlayerName('');
  };

  // プレイヤーを削除
  const removePlayer = (groupId: string, playerId: string) => {
    const updatedGroups = groups.map(group => {
      if (group.id === groupId) {
        return {
          ...group,
          players: group.players.filter(player => player.id !== playerId)
        };
      }
      return group;
    });
    onGroupsChange(updatedGroups);
  };

  // 組を削除
  const removeGroup = (groupId: string) => {
    onGroupsChange(groups.filter(group => group.id !== groupId));
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        👥 プレイヤー管理
      </h2>

      {/* 組作成 */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-blue-800 mb-3">
          🏗️ 組の作成
        </h3>
        <button
          onClick={createGroup}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
        >
          新しい組を作成
        </button>
        <p className="text-sm text-gray-600 mt-2">
          4人組でゴルフコンペを開催します
        </p>
      </div>

      {/* プレイヤー追加 */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-green-800 mb-3">
          ➕ プレイヤー追加
        </h3>
        <div className="flex space-x-2 mb-3">
          <input
            type="text"
            value={newPlayerName}
            onChange={(e) => setNewPlayerName(e.target.value)}
            placeholder="プレイヤー名"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-geocentric-blue focus:border-transparent"
          />
          <select
            value={selectedGroupId}
            onChange={(e) => setSelectedGroupId(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-geocentric-blue focus:border-transparent"
          >
            <option value="">組を選択</option>
            {groups.map(group => (
              <option key={group.id} value={group.id}>
                {group.name} ({group.players.length}/4)
              </option>
            ))}
          </select>
          <button
            onClick={addPlayer}
            disabled={!newPlayerName.trim() || !selectedGroupId}
            className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white font-bold py-2 px-4 rounded"
          >
            追加
          </button>
        </div>
        <p className="text-sm text-gray-600">
          プレイヤー名を入力して組を選択してください
        </p>
      </div>

      {/* 組とプレイヤー一覧 */}
      <div>
        <h3 className="text-lg font-medium text-purple-800 mb-3">
          📋 組とプレイヤー一覧
        </h3>
        {groups.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            まだ組が作成されていません
          </p>
        ) : (
          <div className="space-y-4">
            {groups.map(group => (
              <div key={group.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-lg font-medium text-gray-800">
                    {group.name} ({group.players.length}/4)
                  </h4>
                  <button
                    onClick={() => removeGroup(group.id)}
                    className="bg-red-500 hover:bg-red-600 text-white text-xs px-2 py-1 rounded"
                  >
                    組を削除
                  </button>
                </div>
                
                {group.players.length === 0 ? (
                  <p className="text-gray-500 text-sm">プレイヤーがまだいません</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {group.players.map(player => (
                      <div key={player.id} className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded">
                        <span className="text-gray-800">{player.name}</span>
                        <button
                          onClick={() => removePlayer(group.id, player.id)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          削除
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                {group.players.length >= 4 && (
                  <p className="text-green-600 text-sm mt-2">
                    ✅ この組は満員です
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 統計情報 */}
      <div className="mt-6 bg-gray-50 rounded-lg p-4">
        <h3 className="text-lg font-medium text-gray-800 mb-2">
          📊 統計情報
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">総組数:</span>
            <span className="font-medium ml-2">{groups.length}</span>
          </div>
          <div>
            <span className="text-gray-600">総プレイヤー数:</span>
            <span className="font-medium ml-2">
              {groups.reduce((total, group) => total + group.players.length, 0)}
            </span>
          </div>
          <div>
            <span className="text-gray-600">満員の組:</span>
            <span className="font-medium ml-2">
              {groups.filter(group => group.players.length >= 4).length}
            </span>
          </div>
          <div>
            <span className="text-gray-600">空き枠:</span>
            <span className="font-medium ml-2">
              {groups.reduce((total, group) => total + Math.max(0, 4 - group.players.length), 0)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
