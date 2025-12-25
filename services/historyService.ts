
import { ChatSession, LabAsset, AIMode } from '../types';

const CHAT_PREFIX = 'nexus_chats_';
const ASSET_PREFIX = 'nexus_assets_';

export const saveChat = (userId: string, chat: ChatSession) => {
  const chats = getHistory(userId);
  const idx = chats.findIndex(c => c.id === chat.id);
  if (idx >= 0) chats[idx] = chat;
  else chats.unshift(chat);
  localStorage.setItem(CHAT_PREFIX + userId, JSON.stringify(chats));
};

export const getHistory = (userId: string): ChatSession[] => {
  return JSON.parse(localStorage.getItem(CHAT_PREFIX + userId) || '[]');
};

export const createNewChat = (userId: string, mode: AIMode): ChatSession => {
  const chat: ChatSession = {
    id: Math.random().toString(36).substr(2, 9),
    userId,
    title: 'New Discussion',
    mode,
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
  saveChat(userId, chat);
  return chat;
};

export const deleteChat = (userId: string, id: string) => {
  const chats = getHistory(userId).filter(c => c.id !== id);
  localStorage.setItem(CHAT_PREFIX + userId, JSON.stringify(chats));
};

export const saveAsset = (userId: string, asset: LabAsset) => {
  const assets = getAssets(userId);
  assets.unshift(asset);
  localStorage.setItem(ASSET_PREFIX + userId, JSON.stringify(assets));
};

export const getAssets = (userId: string): LabAsset[] => {
  return JSON.parse(localStorage.getItem(ASSET_PREFIX + userId) || '[]');
};
