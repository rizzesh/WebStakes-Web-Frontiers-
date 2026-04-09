import React, { useState, useEffect } from 'react';
import { 
  Search, Bell, MessageSquare, BookOpen, Trophy, 
  Smartphone, Code, Cpu, Globe, Terminal, Shield, 
  PenTool, Box, Hash, Plus, ArrowRight, ChevronUp,
  MessageCircle, Clock
} from 'lucide-react';
import './App.css';
import AskDoubtModal from './components/AskDoubtModal';
import AddResourceModal from './components/AddResourceModal';
import ThreadView from './views/ThreadView';
import LandingPage from './views/LandingPage';
import DashboardPage from './views/DashboardPage';

const WINGS = [
  { id: 'general', name: 'General Chat', icon: Hash, color: 'var(--color-general)' },
  { id: 'app', name: 'App Wing', icon: Smartphone, color: 'var(--color-app)' },
  { id: 'foss', name: 'FOSS Wing', icon: Code, color: 'var(--color-foss)' },
  { id: 'ml', name: 'ML Wing', icon: Cpu, color: 'var(--color-ml)' },
  { id: 'web', name: 'Web Wing', icon: Globe, color: 'var(--color-web)' },
  { id: 'cp', name: 'CP Wing', icon: Terminal, color: 'var(--color-cp)' },
  { id: 'infosec', name: 'Infosec Wing', icon: Shield, color: 'var(--color-infosec)' },
  { id: 'design', name: 'Design Wing', icon: PenTool, color: 'var(--color-design)' },
  { id: 'web3', name: 'Web3 Wing', icon: Box, color: 'var(--color-web3)' },
];

const INITIAL_MOCK_DOUBTS = [
  {
    id: 1,
    wingId: 'app',
    author: 'Dev_Cipher',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=1',
    time: '15 min ago',
    title: 'Handling nested state updates in Riverpod 2.0 with custom providers?',
    snippet: 'I\'m running into an issue where the UI doesn\'t rebuild when a deeply nested property in my StateNotifier changes. I\'ve tried using copyWith, but it feels clunky...',
    solutions: 12,
    upvotes: 45,
    is_solved: false
  },
  {
    id: 2,
    wingId: 'foss',
    author: 'Kernel_Panic_404',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=2',
    time: '1 hour ago',
    title: 'Implementing a custom trait for async closures in Rust?',
    snippet: 'Having trouble with the borrow checker when passing async closures to a generic function that requires a specific trait bound. Any workaround for Lifetime constraints?',
    solutions: 4,
    upvotes: 28,
    is_solved: false
  },
  {
    id: 3,
    wingId: 'ml',
    author: 'NeuralNet_Queen',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=3',
    time: '3 hours ago',
    title: 'Optimizing Transformer training on limited VRAM (RTX 3060)?',
    snippet: 'I\'m trying to fine-tune Llama-3 but keep hitting OOM errors. Is DeepSpeed or BitsAndBytes the best path for an 8GB card, or should I stick to LoRA?',
    solutions: 22,
    upvotes: 112,
    is_solved: true
  }
];

const MOCK_CONTRIBUTORS = [
  { id: 1, name: 'Nexus_Master', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=4', solved: '1.2k', wingXp: { app: 140, foss: 100 } },
  { id: 2, name: 'Web_Wizard', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=5', solved: '980', wingXp: { web: 150, app: 30 } },
  { id: 3, name: 'Bit_Commander', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=6', solved: '850', wingXp: { ml: 50, cp: 100 } },
];

const INITIAL_RESOURCES = [
  { id: 1, wingId: 'web', type: 'link', content: 'https://developer.mozilla.org/en-US/docs/Web', title: 'MDN Web Docs', author: 'Web_Wizard', time: '2 days ago' },
  { id: 2, wingId: 'ml', type: 'text', content: 'Always check if you have NaN in your dataset before compiling the model.', title: 'Quick tip for NaN gradients', author: 'NeuralNet_Queen', time: '1 week ago' }
];

const getTotalXp = (wingXp) => Object.values(wingXp || {}).reduce((a, b) => a + b, 0);
const getWingXp = (wingXp, wingId) => (wingXp || {})[wingId] || 0;

const formatDateTime = (dateStr) => {
  if (!dateStr) return 'just now';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

function App() {
  const [currentView, setCurrentView] = useState(() => {
    return localStorage.getItem('iiitldoubtmask_view') || 'landing';
  });
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('iiitldoubtmask_user');
    try { return saved && saved !== 'undefined' ? JSON.parse(saved) : null; } catch { return null; }
  });

  const [viewedUser, setViewedUser] = useState(() => {
    const saved = localStorage.getItem('iiitldoubtmask_viewedUser');
    try {
      return saved && saved !== 'undefined' ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [activeWing, setActiveWing] = useState(() => {
    const savedId = localStorage.getItem('iiitldoubtmask_wingId');
    return WINGS.find(w => w.id === savedId) || WINGS[0];
  });
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('iiitldoubtmask_tab') || 'doubts';
  });
  const [doubtsType, setDoubtsType] = useState(() => {
    return localStorage.getItem('iiitldoubtmask_doubtsType') || 'unsolved';
  });
  const [contributors, setContributors] = useState(() => {
    const saved = localStorage.getItem('iiitldoubtmask_contributors');
    try { return saved && saved !== 'undefined' ? JSON.parse(saved) : MOCK_CONTRIBUTORS; } catch { return MOCK_CONTRIBUTORS; }
  });
  
  // New States for Doubt Flow & Thread
  const [doubts, setDoubts] = useState(() => {
    const saved = localStorage.getItem('iiitldoubtmask_doubts');
    try { return saved && saved !== 'undefined' ? JSON.parse(saved) : INITIAL_MOCK_DOUBTS; } catch { return INITIAL_MOCK_DOUBTS; }
  });
  const [isAskModalOpen, setIsAskModalOpen] = useState(false);
  const [activePost, setActivePost] = useState(() => {
    const saved = localStorage.getItem('iiitldoubtmask_activePost');
    try {
      return saved && saved !== 'undefined' ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  
  const [resources, setResources] = useState(() => {
    const saved = localStorage.getItem('iiitldoubtmask_resources');
    try { return saved && saved !== 'undefined' ? JSON.parse(saved) : INITIAL_RESOURCES; } catch { return INITIAL_RESOURCES; }
  });
  const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('iiitldoubtmask_view', currentView);
    if (currentUser) {
      localStorage.setItem('iiitldoubtmask_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('iiitldoubtmask_user');
    }
    
    // Persist session navigation
    localStorage.setItem('iiitldoubtmask_wingId', activeWing.id);
    localStorage.setItem('iiitldoubtmask_tab', activeTab);
    localStorage.setItem('iiitldoubtmask_doubtsType', doubtsType);
    if (activePost) {
      localStorage.setItem('iiitldoubtmask_activePost', JSON.stringify(activePost));
    } else {
      localStorage.removeItem('iiitldoubtmask_activePost');
    }
    if (viewedUser) {
      localStorage.setItem('iiitldoubtmask_viewedUser', JSON.stringify(viewedUser));
    } else {
      localStorage.removeItem('iiitldoubtmask_viewedUser');
    }
    localStorage.setItem('iiitldoubtmask_doubts', JSON.stringify(doubts));
    localStorage.setItem('iiitldoubtmask_contributors', JSON.stringify(contributors));
    localStorage.setItem('iiitldoubtmask_resources', JSON.stringify(resources));
  }, [currentView, currentUser, activeWing, activeTab, doubtsType, activePost, viewedUser, doubts, contributors, resources]);

  const sortedContributors = [...contributors].map(user => ({
    ...user,
    displayXp: activeWing.id === 'general' ? getTotalXp(user.wingXp) : getWingXp(user.wingXp, activeWing.id)
  })).sort((a,b) => b.displayXp - a.displayXp);

  useEffect(() => {
    // Try to fetch from backend if running, otherwise keep fallback mocks
    fetch('http://localhost:3001/api/posts')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.length > 0) {
          // Map backend DB fields to frontend mock names if needed
          const backendDoubts = data.map(p => ({
            id: p.id,
            wingId: p.wing_id,
            creatorAlias: p.author?.alias || '',
            author: p.is_anonymous ? 'Anonymous (Masked)' : p.author?.alias || 'Unknown',
            avatar: p.is_anonymous ? 'https://api.dicebear.com/7.x/bottts/svg?seed=GhostNinja' : p.author?.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=default',
            time: formatDateTime(p.created_at),
            title: p.title,
            snippet: p.text_content,
            solutions: p._count?.comments || 0,
            upvotes: p.upvotes || 0,
            image_url: p.image_url,
            is_solved: p.is_solved,
            upvotedBy: p.upvotedBy ? JSON.parse(p.upvotedBy).filter(Boolean) : [],
            created_at: p.created_at
          }));
          setDoubts(backendDoubts);
        }
      })
      .catch((e) => {
        console.log("Using Mock data, backend offline.");
      });
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty('--active-color', activeWing.color);
  }, [activeWing]);

  // Filter based on active wing AND solved state
  const isSolvedWanted = doubtsType === 'solved';
  
  const filteredDoubts = doubts.filter(d => {
    const matchesWing = activeWing.id === 'general' || d.wingId === activeWing.id;
    const matchesSolvedState = !!d.is_solved === isSolvedWanted;
    return matchesWing && matchesSolvedState;
  });

  const handlePostSubmit = async (data) => {
    try {
      const res = await fetch('http://localhost:3001/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, alias: currentUser?.alias })
      });
      if (res.ok) {
        const newDbPost = await res.json();
        const mappedPost = {
          id: newDbPost.id,
          wingId: newDbPost.wing_id,
          author: newDbPost.is_anonymous ? 'Anonymous (Masked)' : (newDbPost.author?.alias || currentUser?.alias || 'Unknown'),
          avatar: newDbPost.is_anonymous ? 'https://api.dicebear.com/7.x/bottts/svg?seed=GhostNinja' : (newDbPost.author?.avatar || currentUser?.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=default'),
          time: formatDateTime(new Date()),
          title: newDbPost.title,
          snippet: newDbPost.text_content,
          solutions: 0,
          upvotes: 0,
          image_url: newDbPost.image_url,
          creatorAlias: currentUser?.alias
        };
        setDoubts([mappedPost, ...doubts]); // Prepend new post
      } else {
        throw new Error('Backend failed');
      }
    } catch {
      // Offline Mock Fallback Create
      const mockPost = {
        id: Date.now(),
        wingId: data.wing_id,
        author: data.is_anonymous ? 'Anonymous (Masked)' : (currentUser?.alias || 'CipherScholar_01'),
        creatorAlias: currentUser?.alias,
        avatar: data.is_anonymous ? 'https://api.dicebear.com/7.x/bottts/svg?seed=GhostNinja' : (currentUser?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser?.rollNumber || Date.now()}`),
        time: 'just now',
        title: data.title,
        snippet: data.text_content,
        solutions: 0,
        upvotes: 0,
        image_url: data.image_url,
        is_solved: false
      };
      setDoubts([mockPost, ...doubts]);
    }
    
    setIsAskModalOpen(false);
  };

  const handleMarkSolved = async (postId) => {
    try {
      const res = await fetch(`http://localhost:3001/api/posts/${postId}/solve`, {
        method: 'PATCH'
      });
      if (!res.ok) throw new Error('Backend failed');
      
      const updatedDoubts = doubts.map(d => 
        d.id === postId ? { ...d, is_solved: true } : d
      );
      setDoubts(updatedDoubts);
      setActivePost(null); 
      setDoubtsType('solved');
    } catch(e) {
      console.error("Failed to solve doubt", e);
      // Fallback local update
      const updatedDoubts = doubts.map(d => 
        d.id === postId ? { ...d, is_solved: true } : d
      );
      setDoubts(updatedDoubts);
      setActivePost(null); 
      setDoubtsType('solved');
    }
  };

  const handleDeletePost = async (postId) => {
    setDoubts(prev => prev.filter(d => d.id !== postId));
    if (activePost && activePost.id === postId) {
      setActivePost(null);
    }
    try {
      await fetch(`http://localhost:3001/api/posts/${postId}`, {
        method: 'DELETE'
      });
    } catch (e) {
      console.error("Failed to delete post", e);
    }
  };

  const handleUserUpvote = async (username, wingId, upvoterIsCreator = false) => {
    if (!username || username.includes('Anonymous') || username === 'Unknown' || !wingId) return;
    
    // Sync to backend first
    try {
      const res = await fetch(`http://localhost:3001/api/users/${username}/increment-solved`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ incrementSolved: upvoterIsCreator })
      });
      if (res.ok) {
        const updatedUser = await res.json();
        // Update local currentUser if it matches
        if (currentUser && currentUser.alias === username) {
           setCurrentUser(updatedUser);
        }
        // Update viewedUser if it matches
        if (viewedUser && viewedUser.alias === username) {
           setViewedUser(updatedUser);
        }
      }
    } catch (e) { console.error("Failed to sync upvote to backend", e); }

    setContributors(prev => {
      const existing = prev.find(p => p.name === username);
      if (existing) {
        return prev.map(p => {
          if (p.name === username) {
            let newlySolved = typeof p.solved === 'string' ? parseInt(p.solved) : (p.solved || 0);
            if (upvoterIsCreator) { newlySolved += 1; }
            return { ...p, wingXp: { ...p.wingXp, [wingId]: (p.wingXp?.[wingId] || 0) + 10 }, solved: newlySolved };
          }
          return p;
        });
      } else {
        return [...prev, { 
          id: Date.now(), 
          name: username, 
          avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${Date.now()}`, 
          solved: upvoterIsCreator ? 1 : 0, 
          wingXp: { [wingId]: 10 } 
        }];
      }
    });
  };

  const handlePostUpvote = async (postId) => {
    if (!currentUser) return; // Must be logged in to upvote
    
    const targetDoubt = doubts.find(d => d.id === postId);
    if (!targetDoubt) return;

    const upvotedTracker = targetDoubt.upvotedBy || [];
    // Prevent duplicate upvotes entirely
    if (upvotedTracker.includes(currentUser.alias)) return;

    // Valid upvote, update post state
    setDoubts(prev => prev.map(d => 
      d.id === postId 
        ? { ...d, upvotes: (d.upvotes || 0) + 1, upvotedBy: [...upvotedTracker, currentUser.alias] }
        : d
    ));

    // Also update activePost immediately if it's currently being viewed
    if (activePost && activePost.id === postId) {
      setActivePost(prev => ({ 
        ...prev, 
        upvotes: (prev.upvotes || 0) + 1, 
        upvotedBy: [...upvotedTracker, currentUser.alias] 
      }));
    }

    // Valid upvote, award XP to the post creator (if not anonymous)
    if (targetDoubt.author && !targetDoubt.author.includes('Anonymous')) {
      handleUserUpvote(targetDoubt.author, targetDoubt.wingId);
    }

    try {
      await fetch(`http://localhost:3001/api/posts/${postId}/upvote`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alias: currentUser.alias })
      });
    } catch (e) {
      console.error("Upvote backend sync failed", e);
    }
  };

  const handleProfileClick = async (authorName) => {
    if (!authorName || authorName.includes('Anonymous')) return;
    try {
      const profileRes = await fetch(`http://localhost:3001/api/users/${authorName}`);
      if (profileRes.ok) {
        const user = await profileRes.json();
        setViewedUser(user);
        setCurrentView('dashboard');
      } else {
        throw new Error("User not found");
      }
    } catch(e) { 
      const mock = contributors.find(c => c.name === authorName);
      setViewedUser(mock ? { alias: mock.name, avatar: mock.avatar, solved: mock.solved, name: mock.fullName } : { alias: authorName, avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${authorName}`, solved: 0 });
      setCurrentView('dashboard');
    }
  };

  const handleNavigate = (view, tabOverride, userData) => {
    if (view === 'logout') {
       setCurrentUser(null);
       setViewedUser(null);
       setCurrentView('landing');
       return;
    }
    if (view === 'dashboard') {
       setViewedUser(null);
    }
    setCurrentView(view);
    if (tabOverride) {
      setActiveTab(tabOverride);
    }

    if (userData) {
      const rollNumber = userData.rollNumber || 'LCI2024001';
      setCurrentUser({ ...userData, rollNumber });
      
      // Auto-update global contributors so rank populates correctly on first login
      setContributors(prev => {
        if (!prev.find(p => p.name === userData.alias)) {
           return [...prev, { 
             id: Date.now(), 
             name: userData.alias, 
             fullName: userData.name, 
             avatar: userData.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${rollNumber}`, 
             solved: 0, 
             wingXp: { general: 0 } 
           }];
        }
        return prev;
      });
    }
  };

  if (currentView === 'landing') {
    return <LandingPage onNavigate={handleNavigate} currentUser={currentUser} />;
  }

  if (currentView === 'dashboard') {
    return (
      <DashboardPage 
        currentUser={currentUser} 
        viewedUser={viewedUser}
        doubts={doubts} 
        contributors={contributors} 
        sortedContributors={sortedContributors} 
        WINGS={WINGS} 
        onNavigate={handleNavigate} 
        onUpdateUser={(updated) => {
           setCurrentUser(updated);
           setContributors(prev => prev.map(c => c.name === updated.alias ? { ...c, avatar: updated.avatar, fullName: updated.name } : c));
        }}
        onViewThread={(doubt) => {
           setViewedUser(null);
           handleNavigate('app');
           setActivePost(doubt);
        }} 
        onCommentAdded={(postId, isResource) => {
           const updateFn = prev => prev.map(item => item.id === postId ? { ...item, solutions: (item.solutions || 0) + 1 } : item);
           if (isResource) setResources(updateFn);
           else setDoubts(updateFn);
           if (activePost && activePost.id === postId) {
             setActivePost(prev => ({ ...prev, solutions: (prev.solutions || 0) + 1 }));
           }
        }}
      />
    );
  }

  return (
    <div className="app-container">
      {/* Ask Doubt Modal */}
      {isAskModalOpen && (
        <AskDoubtModal 
          onClose={() => setIsAskModalOpen(false)} 
          onSubmit={handlePostSubmit}
          currentUser={currentUser}
          activeWingId={activeWing.id}
        />
      )}

      {/* Add Resource Modal */}
      {isResourceModalOpen && (
        <AddResourceModal 
          onClose={() => setIsResourceModalOpen(false)} 
          onSubmit={(data) => {
             const newRes = { id: Date.now(), ...data, author: currentUser?.alias || 'CipherScholar_01', time: 'just now', solutions: 0, upvotes: 0, upvotedBy: [] };
             setResources([newRes, ...resources]);
             setIsResourceModalOpen(false);
          }}
          activeWingId={activeWing.id !== 'general' ? activeWing.id : WINGS[1].id}
        />
      )}

      {/* Left Sidebar */}
      <aside className="sidebar">
        <div className="logo-container" onClick={() => handleNavigate('landing')} style={{cursor: 'pointer'}}>
          <Terminal className="text-white" />
          <span>IIITLDoubtMask</span>
        </div>
        
        <div className="sub-title">Feed</div>
        <button 
          className={`nav-item ${activeWing.id === 'general' ? 'active' : ''}`}
          onClick={() => { setActiveWing(WINGS[0]); setActivePost(null); }}
        >
          <Hash size={18} />
          Main Feed
        </button>

        <div className="sub-title" style={{ marginTop: '24px' }}>WINGS</div>
        {WINGS.slice(1).map(wing => (
          <button 
            key={wing.id}
            className={`nav-item ${activeWing.id === wing.id ? 'active' : ''}`}
            onClick={() => { setActiveWing(wing); setActivePost(null); }}
          >
            <wing.icon size={18} color={wing.color} />
            <span>{wing.name}</span>
          </button>
        ))}

        <button className="ask-btn" style={{ backgroundColor: 'var(--active-color)' }} onClick={() => setIsAskModalOpen(true)}>
          <Plus size={18} />
          Ask a Doubt
        </button>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Top Navbar */}
        <header className="top-navbar">
          <div className="nav-title" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px', fontSize: '24px', fontWeight: 'bold', color: 'white' }}>
            <activeWing.icon size={28} color={activeWing.color} />
            {activeWing.id === 'general' ? 'Main Feed' : activeWing.name}
          </div>
          
          <div className="user-profile">
            <div className="profile-info" style={{cursor: 'pointer'}} onClick={() => handleNavigate('dashboard')}>
              <div className="profile-text">
                <div className="profile-name">{currentUser?.name || currentUser?.alias || 'CipherScholar_01'}</div>
                <div className="profile-rank">RANK: #{sortedContributors.findIndex(c => c.name === (currentUser?.alias || 'CipherScholar_01')) + 1 || '?'}</div>
              </div>
              <img className="avatar" src={currentUser?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser?.rollNumber || 'user'}`} alt="Profile" />
            </div>
          </div>
        </header>

        <div className="content-wrapper">
          {/* Main conditional rendering for feed vs thread */}
          {activePost ? (
            <ThreadView 
              post={activePost} 
              onBack={() => setActivePost(null)} 
              onMarkSolved={() => handleMarkSolved(activePost.id)}
              onDeletePost={() => handleDeletePost(activePost.id)}
              onUserUpvote={handleUserUpvote}
              onPostUpvote={handlePostUpvote}
              onProfileClick={handleProfileClick}
              onCommentAdded={() => {
                const updateFn = prev => prev.map(item => item.id === activePost.id ? { ...item, solutions: (item.solutions || 0) + 1 } : item);
                if (activePost.isResource) setResources(updateFn);
                else setDoubts(updateFn);
                setActivePost(prev => ({ ...prev, solutions: (prev.solutions || 0) + 1 }));
              }}
              currentUser={currentUser}
            />
          ) : (
            <div className="feed-area">
              <div className="tabs-container">
                <button 
                  className={`tab ${activeTab === 'doubts' ? 'active' : ''}`}
                  onClick={() => setActiveTab('doubts')}
                >
                  DOUBTS
                </button>
                <button 
                  className={`tab ${activeTab === 'resources' ? 'active' : ''}`}
                  onClick={() => setActiveTab('resources')}
                >
                  RESOURCES
                </button>
                <button 
                  className={`tab ${activeTab === 'leaderboard' ? 'active' : ''}`}
                  onClick={() => setActiveTab('leaderboard')}
                >
                  LEADERBOARD
                </button>
              </div>

              {activeTab === 'doubts' && (
                <>
                  <div className="sub-tabs">
                    <button 
                      className={`sub-tab ${doubtsType === 'unsolved' ? 'active' : ''}`}
                      onClick={() => setDoubtsType('unsolved')}
                    >
                      Unsolved
                    </button>
                    <button 
                      className={`sub-tab ${doubtsType === 'solved' ? 'active' : ''}`}
                      onClick={() => setDoubtsType('solved')}
                    >
                      Solved
                    </button>
                  </div>

                  <div className="doubts-list">
                    {filteredDoubts.map(doubt => {
                      const wing = WINGS.find(w => w.id === doubt.wingId) || WINGS[0];
                      return (
                        <div key={doubt.id} className="doubt-card">
                          <div className="card-header">
                            <div className="author-info" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                              <img src={doubt.author?.includes('Anonymous') ? 'https://api.dicebear.com/7.x/bottts/svg?seed=GhostNinja' : (currentUser && doubt.creatorAlias && doubt.creatorAlias === currentUser.alias) ? currentUser.avatar : (doubt.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=default')} className="author-avatar" alt="author" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                              <div>
                                <div 
                                  className="author-name" 
                                  style={{cursor: doubt.author.includes('Anonymous') ? 'default' : 'pointer'}}
                                  onClick={(e) => { e.stopPropagation(); handleProfileClick(doubt.author); }}
                                >
                                  {doubt.author}
                                </div>
                                <div className="post-time">{doubt.time} • {wing.name}</div>
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              {doubt.is_solved && (
                                <div style={{ 
                                  padding: '4px 8px', borderRadius: '4px', backgroundColor: 'rgba(16, 185, 129, 0.1)', 
                                  color: '#10B981', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' 
                                }}>
                                  Solved
                                </div>
                              )}
                              <div className="wing-badge" style={{ '--wing-color': wing.color, color: wing.color }}>
                                {wing.id}
                              </div>
                            </div>
                          </div>
                          <h3 className="card-title">{doubt.title}</h3>
                          <p className="card-snippet">{doubt.snippet}</p>
                          <div className="card-footer">
                            <div className="metrics">
                              <div className="metric-item" style={{ color: 'white' }}>
                                <MessageCircle size={16} color="white" />
                                <span>{doubt.solutions} Solutions</span>
                              </div>
                              <button 
                                className="action-btn" 
                                onClick={(e) => { e.stopPropagation(); handlePostUpvote(doubt.id); }}
                                style={{ color: doubt.upvotedBy?.includes(currentUser?.alias) ? '#10B981' : 'white' }}
                              >
                                <ChevronUp size={16} color={doubt.upvotedBy?.includes(currentUser?.alias) ? '#10B981' : 'white'} />
                                <span style={{ color: doubt.upvotedBy?.includes(currentUser?.alias) ? '#10B981' : 'white' }}>{doubt.upvotes || 0}</span>
                              </button>
                            </div>
                            <button className="view-thread" onClick={() => setActivePost(doubt)}>
                              VIEW THREAD <ArrowRight size={16} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                    {filteredDoubts.length === 0 && (
                      <div style={{ textAlign: 'center', margin: '40px 0', color: 'var(--text-secondary)' }}>
                        No doubts found. Be the first to ask!
                      </div>
                    )}
                  </div>
                </>
              )}

              {activeTab === 'resources' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h2 style={{color: 'white', margin: 0}}>Study Materials</h2>
                    <button className="ask-btn" style={{ marginTop: 0, width: 'auto', padding: '8px 16px', backgroundColor: 'var(--active-color)' }} onClick={() => setIsResourceModalOpen(true)}>
                      <Plus size={16} /> Add Resource
                    </button>
                  </div>
                  {resources.filter(r => activeWing.id === 'general' || r.wingId === activeWing.id).map(r => {
                     const wing = WINGS.find(w => w.id === r.wingId) || WINGS[0];
                     return (
                      <div key={r.id} className="doubt-card">
                         <div className="card-header">
                           <div className="author-info">
                             <div>
                               <div className="author-name">{r.author}</div>
                               <div className="post-time">{r.time} • <span style={{color: wing.color}}>{wing.name}</span></div>
                             </div>
                           </div>
                           <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                             <div className="wing-badge" style={{ '--wing-color': wing.color, color: wing.color }}>
                               {r.type.toUpperCase()}
                             </div>
                           </div>
                         </div>
                         <h3 className="card-title">{r.title}</h3>
                         {r.type === 'link' && <a href={r.content} target="_blank" rel="noreferrer" style={{color: '#3b82f6', textDecoration: 'underline', display: 'block', marginBottom: '20px', wordBreak: 'break-all'}}>{r.content}</a>}
                         {r.type === 'text' && <p className="card-snippet">{r.content}</p>}
                         {r.type === 'image' && (
                            r.content ? <img src={r.content} alt="Resource" style={{maxWidth: '100%', borderRadius: '8px', marginBottom: '16px'}} /> : <p className="card-snippet">Image Not Available</p>
                         )}
                         <div className="card-footer" style={{ marginTop: '16px' }}>
                           <div className="metrics">
                             <div className="metric-item" style={{ color: 'white' }}>
                               <MessageCircle size={16} color="white" />
                               <span>{r.solutions || 0} Comments</span>
                             </div>
                           </div>
                           <button className="view-thread" onClick={() => setActivePost({
                             id: r.id,
                             wingId: r.wingId,
                             title: r.title,
                             text_content: r.type === 'text' ? r.content : (r.type === 'link' ? `Resource Link: ${r.content}` : 'Image attached.'),
                             image_url: r.type === 'image' ? r.content : null,
                             author: r.author,
                             creatorAlias: r.author,
                             time: r.time,
                             solutions: r.solutions || 0,
                             upvotes: r.upvotes || 0,
                             upvotedBy: r.upvotedBy || [],
                             isResource: true
                           })}>
                             DISCUSS <ArrowRight size={16} />
                           </button>
                         </div>
                      </div>
                     );
                  })}
                  {resources.filter(r => activeWing.id === 'general' || r.wingId === activeWing.id).length === 0 && (
                    <div style={{ textAlign: 'center', margin: '40px 0', color: 'var(--text-secondary)' }}>
                      No study materials found for this wing. Share something useful!
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'leaderboard' && (
                <div className="leaderboard-view" style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h2 style={{color: 'white', margin: 0}}>{activeWing.id === 'general' ? 'Combined Leaderboard' : `${activeWing.name} Leaderboard`}</h2>
                    {currentUser && sortedContributors.some(c => c.name === currentUser.alias) && (
                      <button 
                        onClick={() => {
                          const el = document.getElementById(`rank-${currentUser.alias}`);
                          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }}
                        style={{ 
                          backgroundColor: '#27272a', color: '#10b981', 
                          border: '2px solid #10b981', 
                          padding: '10px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: 900, cursor: 'pointer',
                          display: 'flex', alignItems: 'center', gap: '10px', 
                          boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)',
                          transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.transform = 'scale(1.02)';
                          e.currentTarget.style.boxShadow = '0 0 30px rgba(16, 185, 129, 0.6)';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.transform = 'scale(1)';
                          e.currentTarget.style.boxShadow = '0 0 20px rgba(16, 185, 129, 0.4)';
                        }}
                      >
                        <Trophy size={14} color="#fbbf24" fill="#fbbf24" strokeWidth={3} /> Show My Position
                      </button>
                    )}
                  </div>
                  <div className="leaderboard-list">
                     {sortedContributors.map((user, index) => (
                        <div 
                          key={user.id} 
                          id={`rank-${user.name}`}
                          style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', 
                            backgroundColor: (currentUser && user.name === currentUser.alias) ? 'rgba(var(--active-color-rgb, 168, 85, 247), 0.15)' : 'rgba(255,255,255,0.05)', 
                            borderRadius: '12px', marginBottom: '12px',
                            border: (currentUser && user.name === currentUser.alias) ? '1px solid var(--active-color)' : '1px solid transparent',
                            transition: 'all 0.3s ease'
                          }}
                        >
                         <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
                           <div style={{color: 'var(--text-secondary)', fontSize: '18px', fontWeight: 'bold', width: '24px'}}>#{index + 1}</div>
                           <img src={(currentUser && user.name === currentUser.alias) ? currentUser.avatar : user.avatar} style={{width: '40px', height: '40px', borderRadius: '50%'}} alt={user.name} />
                           <div>
                              <div 
                                style={{color: 'white', fontWeight: 600, cursor: 'pointer'}}
                                onClick={() => handleProfileClick(user.name)}
                              >
                                {user.name}
                              </div>
                              <div style={{color: 'var(--text-secondary)', fontSize: '12px'}}>{user.solved} Doubts Solved</div>
                           </div>
                         </div>
                         <div style={{color: '#10B981', fontWeight: 'bold'}}>{user.displayXp} XP</div>
                       </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Right Sidebar */}
          {!activePost && (
            <aside className="right-sidebar">
              <div className="sidebar-widget">
                <div className="widget-title">
                  <Trophy size={20} color="var(--active-color)" />
                  Top Contributors
                </div>
                <div className="user-list">
                  {sortedContributors.slice(0, 5).map(user => (
                    <div key={user.id} className="user-list-item">
                      <div className="user-listing-info">
                        <img src={(currentUser && user.name === currentUser.alias) ? currentUser.avatar : user.avatar} className="avatar" alt={user.name} />
                        <div>
                          <div 
                             className="profile-name" 
                             onClick={() => handleProfileClick(user.name)} 
                             style={{cursor: 'pointer'}}
                          >
                             {user.name}
                          </div>
                          <div className="profile-rank">{user.solved} Doubts Solved</div>
                        </div>
                      </div>
                      <div className="xp-badge">{user.displayXp} XP</div>
                    </div>
                  ))}
                </div>
                <button style={{ 
                  width: '100%', padding: '12px', marginTop: '16px', 
                  backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '8px', 
                  color: 'white', fontSize: '13px', fontWeight: 600, cursor: 'pointer'
                }} onClick={() => setActiveTab('leaderboard')}>
                  VIEW FULL RANKING
                </button>
              </div>

              {currentUser && (() => {
                const pendingDoubts = doubts.filter(d => d.creatorAlias === currentUser.alias && !d.is_solved);
                const displayPending = pendingDoubts.slice(0, 3);
                return (
                  <div className="sidebar-widget">
                    <div className="widget-title" style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Clock size={16} color="#f87171" />
                        Pending Doubts
                      </div>
                      {pendingDoubts.length > 0 && (
                        <span style={{ backgroundColor: '#f87171', color: '#161618', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}>
                          {pendingDoubts.length}
                        </span>
                      )}
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px', marginTop: '16px' }}>
                      {displayPending.map(d => (
                         <div 
                            key={d.id} 
                            style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.05)' }}
                            onClick={() => setActivePost(d)}
                         >
                            <div style={{ fontSize: '13px', color: 'white', fontWeight: 600, marginBottom: '6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                               {d.title}
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
                               <span>{d.time}</span>
                               <span style={{ color: d.solutions > 0 ? '#60a5fa' : 'inherit' }}>{d.solutions} Solutions</span>
                            </div>
                         </div>
                      ))}
                      {pendingDoubts.length === 0 && (
                         <div style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '12px', padding: '16px 0' }}>
                            You have no unresolved doubts.
                         </div>
                      )}
                    </div>

                    {pendingDoubts.length > 3 && (
                      <button style={{ 
                        width: '100%', padding: '10px', 
                        backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '6px', 
                        color: 'white', fontSize: '12px', fontWeight: 600, cursor: 'pointer'
                      }} onClick={() => handleNavigate('dashboard')}>
                        VIEW ALL HISTORY
                      </button>
                    )}
                  </div>
                );
              })()}
            </aside>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
