
import { ChatSession, LabAsset, AIMode, Message } from '../types';
import { supabase } from './supabaseClient';
import { db } from './db';

/**
 * Dual-Storage Strategy:
 * 1. Always save to local IndexedDB (Instant, Offline-ready)
 * 2. Attempt to sync to Supabase (Cloud backup/Sync)
 */

export const saveChat = async (userId: string, chat: ChatSession) => {
  // 1. Local Persistence (Primary)
  await db.saveChat(chat);

  // 2. Cloud Sync (Secondary)
  try {
    const { error } = await supabase
      .from('chats')
      .upsert({
        id: chat.id,
        user_id: userId,
        title: chat.title,
        mode: chat.mode,
        updated_at: new Date().toISOString()
      });
    if (error) throw error;
  } catch (e) {
    console.warn("Supabase Sync Failed: Operating in Local-Only mode for this session.");
  }
};

export const getHistory = async (userId: string): Promise<ChatSession[]> => {
  // 1. Get Local History (Instant)
  const localHistory = await db.getChats(userId);

  // 2. Try to fetch Cloud updates
  try {
    const { data, error } = await supabase
      .from('chats')
      .select('*, messages(*)')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (!error && data) {
      // Logic to merge could go here, for now return merged or cloud as source of truth if newer
      return (data || []).map((chat: any) => ({
        id: chat.id,
        userId: chat.user_id,
        title: chat.title,
        mode: chat.mode,
        messages: (chat.messages || []).map((m: any) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          timestamp: new Date(m.created_at).getTime()
        })),
        createdAt: new Date(chat.created_at).getTime(),
        updatedAt: new Date(chat.updated_at).getTime()
      }));
    }
  } catch (e) {
    console.warn("Cloud History unavailable, using local database.");
  }

  return localHistory;
};

export const createNewChat = async (userId: string, mode: AIMode): Promise<ChatSession> => {
  const newChat: ChatSession = {
    id: Math.random().toString(36).substr(2, 9),
    userId,
    title: 'New Discussion',
    mode,
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  // Save locally first
  await db.saveChat(newChat);

  // Try cloud creation
  try {
    const { data, error } = await supabase
      .from('chats')
      .insert([{ id: newChat.id, user_id: userId, mode, title: 'New Discussion' }])
      .select()
      .single();
    
    if (!error && data) {
      return {
        ...newChat,
        id: data.id,
        createdAt: new Date(data.created_at).getTime()
      };
    }
  } catch (err) {
    console.warn("Database sync failed, chat is local-only.");
  }

  return newChat;
};

export const deleteChat = async (userId: string, id: string) => {
  // Delete from both
  await db.deleteChat(id);
  try {
    await supabase.from('chats').delete().eq('id', id);
  } catch (e) {
    console.error("Cloud delete failed");
  }
};

export const saveAsset = async (userId: string, asset: Omit<LabAsset, 'id' | 'timestamp' | 'userId'>) => {
  const fullAsset: LabAsset = {
    ...asset,
    id: Math.random().toString(36).substr(2, 9),
    userId,
    timestamp: Date.now()
  };

  // 1. Save to Local DB
  await db.saveAsset(fullAsset);

  // 2. Save to Cloud
  try {
    const { error } = await supabase
      .from('assets')
      .insert([{
        id: fullAsset.id,
        user_id: userId,
        title: asset.title,
        type: asset.type,
        content: asset.content,
        source_name: asset.sourceName
      }]);
    if (error) throw error;
  } catch (e) {
    console.warn("Failed to sync asset to Cloud. Saved locally.");
  }
};

export const getAssets = async (userId: string): Promise<LabAsset[]> => {
  // Load local first
  const localAssets = await db.getAssets(userId);

  try {
    const { data, error } = await supabase
      .from('assets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      return (data || []).map((asset: any) => ({
        id: asset.id,
        userId: asset.user_id,
        title: asset.title,
        type: asset.type,
        content: asset.content,
        sourceName: asset.source_name,
        timestamp: new Date(asset.created_at).getTime()
      }));
    }
  } catch (e) {
    console.warn("Cloud assets unavailable, using local vault.");
  }

  return localAssets;
};

export const deleteAsset = async (userId: string, id: string) => {
  await db.deleteAsset(id);
  try {
    await supabase.from('assets').delete().eq('id', id);
  } catch (e) {
    console.error("Cloud asset delete failed");
  }
};

export const clearAllAssets = async (userId: string) => {
  await db.clearAssets(userId);
  try {
    await supabase.from('assets').delete().eq('user_id', userId);
  } catch (e) {
    console.error("Cloud mass delete failed");
  }
};
