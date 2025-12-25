
import React, { useState, useEffect } from 'react';
import { User, ChatSession, ViewState, LabAsset, AuthState, AIMode } from './types';
import { getCurrentSession, logout } from './services/authService';
import { getHistory, saveChat, deleteChat, createNewChat, getAssets, saveAsset } from './services/historyService';
import AuthForm from './components/AuthForm';
import Sidebar from './components/Sidebar';
import ChatInterface from './components/ChatInterface';
import Dashboard from './components/Dashboard';
import LabPanel from './components/LabPanel';
import Vault from './components/Vault';

const App: React.FC = () => {
  const [auth, setAuth] = useState<AuthState>({ user: null, token: null, isAuthenticated: false });
  const [view, setView] = useState<ViewState>('dashboard');
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [assets, setAssets] = useState<LabAsset[]>([]);
  const [viewingAsset, setViewingAsset] = useState<LabAsset | null>(null);

  // Init Session
  useEffect(() => {
    const session = getCurrentSession();
    if (session) {
      setAuth({ user: session.user, token: session.token, isAuthenticated: true });
      loadUserData(session.user.id);
    }
  }, []);

  const loadUserData = (userId: string) => {
    setChats(getHistory(userId));
    setAssets(getAssets(userId));
  };

  const handleAuth = (user: User, token: string) => {
    setAuth({ user, token, isAuthenticated: true });
    loadUserData(user.id);
    setView('dashboard');
  };

  const handleLogout = () => {
    logout();
    setAuth({ user: null, token: null, isAuthenticated: false });
    setView('dashboard');
    setViewingAsset(null);
  };

  const handleNewChat = (mode: AIMode = 'study') => {
    if (!auth.user) return;
    const chat = createNewChat(auth.user.id, mode);
    setChats([chat, ...chats]);
    setActiveChatId(chat.id);
    setView('chat');
  };

  const handleDeleteChat = (id: string) => {
    if (!auth.user) return;
    deleteChat(auth.user.id, id);
    const updatedChats = chats.filter(c => c.id !== id);
    setChats(updatedChats);
    if (activeChatId === id) setActiveChatId(null);
  };

  const handleSaveAsset = (asset: Omit<LabAsset, 'id' | 'timestamp' | 'userId'>) => {
    if (!auth.user) return;
    const newAsset: LabAsset = {
      ...asset,
      id: Math.random().toString(36).substr(2, 9),
      userId: auth.user.id,
      timestamp: Date.now()
    };
    saveAsset(auth.user.id, newAsset);
    setAssets([newAsset, ...assets]);
  };

  const handleOpenAsset = (asset: LabAsset) => {
    setViewingAsset(asset);
    setView('lab');
  };

  if (!auth.isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6">
        <AuthForm onAuthComplete={handleAuth} />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-slate-100 overflow-hidden">
      <Sidebar 
        view={view} 
        setView={(v) => { setView(v); if(v !== 'lab') setViewingAsset(null); }} 
        chats={chats}
        activeChatId={activeChatId}
        onSelectChat={(id) => { setActiveChatId(id); setView('chat'); }}
        onNewChat={() => handleNewChat()}
        onDeleteChat={handleDeleteChat}
        user={auth.user!}
        onLogout={handleLogout}
      />

      <main className="flex-1 relative flex flex-col overflow-hidden">
        {view === 'dashboard' && (
          <Dashboard 
            user={auth.user!} 
            chats={chats} 
            assets={assets}
            onAction={(target) => setView(target)}
            onNewChat={handleNewChat}
          />
        )}

        {view === 'chat' && (
          <ChatInterface 
            chat={chats.find(c => c.id === activeChatId) || null}
            onSendMessage={(msg) => {/* handled in ChatInterface */}}
            onUpdateChat={(updated) => {
               saveChat(auth.user!.id, updated);
               setChats(chats.map(c => c.id === updated.id ? updated : c));
            }}
          />
        )}

        {view === 'lab' && (
          <LabPanel onSaveAsset={handleSaveAsset} viewingAsset={viewingAsset} />
        )}

        {view === 'vault' && (
          <Vault 
            assets={assets} 
            chats={chats} 
            onViewAsset={handleOpenAsset}
          />
        )}
      </main>
    </div>
  );
};

export default App;
