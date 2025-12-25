
import { LectureData } from '../types';

const HISTORY_KEY_PREFIX = 'studyeasier_history_';

export const saveToHistory = (userId: string, data: LectureData) => {
  const key = HISTORY_KEY_PREFIX + userId;
  const history = JSON.parse(localStorage.getItem(key) || '[]');
  
  // Update if exists, otherwise add
  const index = history.findIndex((item: LectureData) => item.id === data.id);
  if (index >= 0) {
    history[index] = data;
  } else {
    history.unshift(data);
  }
  
  localStorage.setItem(key, JSON.stringify(history));
};

export const getHistory = (userId: string): LectureData[] => {
  const key = HISTORY_KEY_PREFIX + userId;
  return JSON.parse(localStorage.getItem(key) || '[]');
};

export const deleteFromHistory = (userId: string, lectureId: string) => {
  const key = HISTORY_KEY_PREFIX + userId;
  const history = JSON.parse(localStorage.getItem(key) || '[]');
  const filtered = history.filter((item: LectureData) => item.id !== lectureId);
  localStorage.setItem(key, JSON.stringify(filtered));
};
