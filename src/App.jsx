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

// Skeleton UI Components
const DoubtSkeleton = () => (
  <div className="doubt-card skeleton-rect" style={{ padding: '24px', marginBottom: '16px', opacity: 0.5 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
      <div className="skeleton skeleton-circle" style={{ width: '32px', height: '32px' }}></div>
      <div style={{ flex: 1 }}>
        <div className="skeleton skeleton-text" style={{ width: '120px', height: '14px' }}></div>
        <div className="skeleton skeleton-text" style={{ width: '80px', height: '10px' }}></div>
      </div>
    </div>
    <div className="skeleton skeleton-text" style={{ width: '60%', height: '18px', marginBottom: '16px' }}></div>
    <div className="skeleton skeleton-text" style={{ width: '90%' }}></div>
    <div className="skeleton skeleton-text" style={{ width: '40%' }}></div>
    <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between' }}>
      <div className="skeleton skeleton-text" style={{ width: '100px', height: '20px', margin: 0 }}></div>
      <div className="skeleton skeleton-text" style={{ width: '80px', height: '20px', margin: 0 }}></div>
    </div>
  </div>
);

const LeaderboardSkeleton = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '12px', marginBottom: '12px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
      <div className="skeleton skeleton-text" style={{ width: '20px', margin: 0 }}></div>
      <div className="skeleton skeleton-circle" style={{ width: '40px', height: '40px' }}></div>
      <div style={{ flex: 1 }}>
        <div className="skeleton skeleton-text" style={{ width: '120px', height: '14px', marginBottom: '6px' }}></div>
        <div className="skeleton skeleton-text" style={{ width: '80px', height: '10px', margin: 0 }}></div>
      </div>
    </div>
    <div className="skeleton skeleton-text" style={{ width: '60px', height: '20px', margin: 0 }}></div>
  </div>
);

const SidebarSkeleton = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <div className="skeleton skeleton-circle" style={{ width: '36px', height: '36px' }}></div>
      <div>
        <div className="skeleton skeleton-text" style={{ width: '80px', height: '12px', marginBottom: '6px' }}></div>
        <div className="skeleton skeleton-text" style={{ width: '60px', height: '8px', margin: 0 }}></div>
      </div>
    </div>
    <div className="skeleton skeleton-text" style={{ width: '40px', height: '16px', margin: 0 }}></div>
  </div>
);

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
  const [contributors, setContributors] = useState([]);
  
  // New States for Doubt Flow & Thread
  const [doubts, setDoubts] = useState(() => {
    return []; // Always start fresh from Supabase to avoid stale mock data
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
  
  const [resources, setResources] = useState([]);
  const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      const { supabase } = await import('./lib/supabaseClient');
      
      // 1. Fetch Posts & Contributors
      try {
        const { data: posts, error: postsErr } = await supabase
          .from('posts')
          .select('*, profiles(*), comments(count)')
          .order('created_at', { ascending: false });
        
        if (posts) {
          setDoubts(posts.map(p => ({
            id: p.id,
            wingId: p.wing_id,
            creatorAlias: p.profiles?.alias,
            author: p.is_anonymous ? 'Anonymous (Masked)' : p.profiles?.alias || 'Unknown',
            avatar: p.is_anonymous ? 'https://api.dicebear.com/7.x/bottts/svg?seed=GhostNinja' : p.profiles?.avatar,
            rollNumber: p.profiles?.roll_number,
            time: formatDateTime(p.created_at),
            title: p.title,
            snippet: p.text_content,
            solutions: p.comments?.[0]?.count || 0,
            upvotes: p.upvotes,
            image_url: p.image_url,
            is_solved: p.is_solved,
            upvotedBy: p.upvoted_by || []
          })));
        }

        const { data: profs } = await supabase
          .from('profiles')
          .select('*')
          .order('xp', { ascending: false });
          
        if (profs) {
          setContributors(profs.map(p => ({ 
            ...p, 
            name: p.alias, 
            wingXp: { general: p.xp },
            solved: p.solved || 0
          })));
        }
        const { data: rescs } = await supabase
          .from('resources')
          .select('*, profiles(*), comments(count)')
          .order('created_at', { ascending: false });
          
        if (rescs) {
          setResources(rescs.map(r => ({
            id: r.id,
            wingId: r.wing_id,
            author: r.author_id ? r.profiles?.alias : 'System',
            creatorAlias: r.profiles?.alias,
            avatar: r.profiles?.avatar,
            time: formatDateTime(r.created_at),
            title: r.title,
            content: r.content,
            type: r.type,
            solutions: r.comments?.[0]?.count || 0,
            upvotes: r.upvotes,
            upvotedBy: r.upvoted_by || []
          })));
        }
      } catch (err) {
        console.error("Initialization error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  useEffect(() => {
    localStorage.setItem('iiitldoubtmask_view', currentView);
    if (currentUser) {
      localStorage.setItem('iiitldoubtmask_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('iiitldoubtmask_user');
    }
    
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
  }, [currentView, currentUser, activeWing, activeTab, doubtsType, activePost, viewedUser]);

  const sortedContributors = [...contributors]
    // Aggressive filter for test accounts (no roll number OR name is one of the known technical ones)
    .filter(c => {
      const isTechnical = ['newtester', 'jon', 'Yash', 'tester1', 'tester2', 'CipherScholar_01'].includes(c.alias);
      const hasRoll = !!(c.roll_number || c.rollNumber);
      return hasRoll && !isTechnical;
    })
    .map(user => ({
      ...user,
      displayXp: activeWing.id === 'general' ? getTotalXp(user.wingXp) : getWingXp(user.wingXp, activeWing.id)
    }))
    .sort((a,b) => b.displayXp - a.displayXp);

  // Legacy local-backend fetch removed. Pure Supabase logic is handled in the mount useEffect above.

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
    const { supabase } = await import('./lib/supabaseClient');
    const { data: newPost, error } = await supabase
      .from('posts')
      .insert([{
        author_id: currentUser.id,
        wing_id: data.wing_id,
        title: data.title,
        text_content: data.text_content,
        is_anonymous: !!data.is_anonymous,
        image_url: data.image_url
      }])
      .select('*, profiles(*), comments(count)')
      .single();

    if (error) {
      console.error("Doubt Posting Error:", error);
      return;
    }

    if (newPost) {
      const mapped = {
        id: newPost.id,
        wingId: newPost.wing_id,
        author: newPost.is_anonymous ? 'Anonymous (Masked)' : newPost.profiles.alias,
        avatar: newPost.is_anonymous ? 'https://api.dicebear.com/7.x/bottts/svg?seed=GhostNinja' : newPost.profiles.avatar,
        time: 'just now',
        title: newPost.title,
        snippet: newPost.text_content,
        solutions: 0,
        upvotes: 0,
        is_solved: false,
        creatorAlias: newPost.profiles.alias
      };
      setDoubts([mapped, ...doubts]);
    }
    setIsAskModalOpen(false);
  };

  const handleMarkSolved = async (postId, solverAlias) => {
    const { supabase } = await import('./lib/supabaseClient');
    
    // Call RPC to handle solve (marks post solved and awards XP to solver)
    const { error } = await supabase.rpc('handle_solve', {
      target_post_id: Number(postId),
      solver_alias: solverAlias || currentUser.alias // Fallback to self if no specific solver (e.g. self-solved)
    });
    
    if (!error) {
      setDoubts(doubts.map(d => d.id === postId ? { ...d, is_solved: true } : d));
      
      // Update local solver stats for immediate feedback
      const solver = solverAlias || currentUser.alias;
      setContributors(prev => prev.map(p => 
        p.alias === solver 
          ? { ...p, xp: (p.xp || 0) + 50, solved: (p.solved || 0) + 1 } 
          : p
      ));
      
      // If we are the solver, update currentUser as well
      if (currentUser.alias === solver) {
        setCurrentUser(prev => ({
          ...prev,
          xp: (prev.xp || 0) + 50,
          solved: (prev.solved || 0) + 1
        }));
      }
      
      setActivePost(null); 
      setDoubtsType('solved');
    } else {
      console.error("Resolution Error:", error);
      alert(`FAILED TO RESOLVE: ${error.message}`);
      // Fallback
      const { error: updateErr } = await supabase.from('posts').update({ is_solved: true }).eq('id', postId);
      if (!updateErr) {
        setDoubts(doubts.map(d => d.id === postId ? { ...d, is_solved: true } : d));
        setActivePost(null); 
        setDoubtsType('solved');
      }
    }
  };

  const handleDeletePost = async (postId) => {
    const { supabase } = await import('./lib/supabaseClient');
    await supabase.from('posts').delete().eq('id', postId);
    setDoubts(prev => prev.filter(d => d.id !== postId));
    if (activePost && activePost.id === postId) setActivePost(null);
  };

  const handleUserUpvote = async (username, wingId, upvoterIsCreator = false) => {
    if (!username || username.includes('Anonymous') || !wingId) return;
    const { supabase } = await import('./lib/supabaseClient');
    
    // Fetch current profile to increment
    const { data: prof } = await supabase.from('profiles').select('xp, solved').eq('alias', username).single();
    if (prof) {
      const { data: updated } = await supabase
        .from('profiles')
        .update({ 
          xp: prof.xp + 10, 
          solved: upvoterIsCreator ? prof.solved + 1 : prof.solved 
        })
        .eq('alias', username)
        .select()
        .single();
      
      if (updated) {
        if (currentUser?.alias === username) setCurrentUser(updated);
        setContributors(prev => prev.map(p => p.alias === username ? { ...p, xp: updated.xp, solved: updated.solved } : p));
      }
    }
  };

  const handlePostUpvote = async (postId) => {
    if (!currentUser) return;
    const { supabase } = await import('./lib/supabaseClient');
    
    const targetDoubt = doubts.find(d => d.id === postId);
    if (!targetDoubt) return;

    const upvotedTracker = targetDoubt.upvotedBy || [];
    if (upvotedTracker.includes(currentUser.alias)) return;

    // Upvote on Supabase via RPC
    const { data: updatedPost, error } = await supabase
      .rpc('handle_upvote', { 
        target_post_id: Number(postId),
        user_alias: currentUser.alias
      });

    if (!error && updatedPost) {
      // The RPC returns a single object but select() on RPC might wrap it
      const postData = Array.isArray(updatedPost) ? updatedPost[0] : updatedPost;
      
      setDoubts(prev => prev.map(d => d.id === postId ? { 
        ...d, 
        upvotes: postData.upvotes, 
        upvotedBy: postData.upvoted_by 
      } : d));
      
      if (activePost && activePost.id === postId) {
        setActivePost(prev => ({ 
          ...prev, 
          upvotes: postData.upvotes, 
          upvotedBy: postData.upvoted_by 
        }));
      }
      
      // Update the contributor's XP locally for immediate feedback
      if (targetDoubt.creatorAlias) {
        setContributors(prev => prev.map(p => 
          p.alias === targetDoubt.creatorAlias ? { ...p, xp: (p.xp || 0) + 10 } : p
        ));
      }
    } else {
      console.error("Upvote failed:", error);
      alert(`UPVOTE FAILED: ${error.message || 'Check database RPC.'}`);
    }
  };
  
  const handleResourceUpvote = async (resId) => {
    if (!currentUser) return;
    const { supabase } = await import('./lib/supabaseClient');
    
    // Call RPC
    const { data: updatedRes, error } = await supabase
      .rpc('handle_resource_upvote', {
        target_res_id: Number(resId),
        user_alias: currentUser.alias
      });
      
    if (!error && updatedRes) {
      const resData = Array.isArray(updatedRes) ? updatedRes[0] : updatedRes;
      setResources(prev => prev.map(r => r.id === resId ? { 
        ...r, 
        upvotes: resData.upvotes, 
        upvotedBy: resData.upvoted_by 
      } : r));
      
      if (activePost && activePost.id === resId && activePost.isResource) {
        setActivePost(prev => ({ 
          ...prev, 
          upvotes: resData.upvotes, 
          upvotedBy: resData.upvoted_by 
        }));
      }
    } else {
       console.error("Resource upvote failed:", error);
    }
  };

  const handleProfileClick = async (authorName) => {
    if (!authorName || authorName.includes('Anonymous')) return;
    const { supabase } = await import('./lib/supabaseClient');
    const { data: user } = await supabase.from('profiles').select('*').eq('alias', authorName).single();
    if (user) {
      setViewedUser(user);
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
    if (view === 'app') setDoubtsType('unsolved'); // Default to Unsolved on app entry
    if (view === 'dashboard') setViewedUser(null);
    setCurrentView(view);
    if (tabOverride) setActiveTab(tabOverride);
    if (userData) {
      // Map database property to frontend property
      const mappedUser = {
        ...userData,
        rollNumber: userData.roll_number || userData.rollNumber
      };
      setCurrentUser(mappedUser);
      setContributors(prev => {
        if (!prev.find(p => p.alias === mappedUser.alias)) return [...prev, { ...mappedUser, name: mappedUser.alias }];
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
           setContributors(prev => prev.map(c => c.alias === updated.alias ? { ...c, ...updated } : c));
        }}
        onViewThread={(doubt) => {
           setViewedUser(null);
           handleNavigate('app');
           setActivePost(doubt);
        }} 
        onCommentAdded={(postId) => {
           setDoubts(prev => prev.map(item => item.id === postId ? { ...item, solutions: (item.solutions || 0) + 1 } : item));
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
          onSubmit={async (data) => {
             const { supabase } = await import('./lib/supabaseClient');
             const { data: newRes, error } = await supabase
               .from('resources')
               .insert([{
                 author_id: currentUser.id,
                 wing_id: data.wingId,
                 title: data.title,
                 content: data.content,
                 type: data.type
               }])
               .select('*, profiles(*)')
               .single();

             if (newRes) {
               const mapped = {
                 id: newRes.id,
                 wingId: newRes.wing_id,
                 author: newRes.profiles.alias,
                 creatorAlias: newRes.profiles.alias,
                 avatar: newRes.profiles.avatar,
                 time: 'just now',
                 title: newRes.title,
                 content: newRes.content,
                 type: newRes.type,
                 solutions: 0,
                 upvotes: 0,
                 upvotedBy: []
               };
               setResources([mapped, ...resources]);
             } else if (error) {
               console.error("Resource Upload Error:", error);
               alert(`FAILED TO ARCHIVE RESOURCE: ${error.message}`);
             }
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
              onPostUpvote={activePost.isResource ? handleResourceUpvote : handlePostUpvote}
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
                    {isLoading ? (
                      [1, 2, 3].map(i => <DoubtSkeleton key={i} />)
                    ) : (
                      <>
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
                                    onClick={(e) => { e.stopPropagation(); (doubt.isResource ? handleResourceUpvote : handlePostUpvote)(doubt.id); }}
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
                      </>
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
                  {isLoading ? (
                    [1, 2, 3].map(i => <DoubtSkeleton key={i} />)
                  ) : (
                    <>
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
                                 <button 
                                    className="action-btn" 
                                    onClick={(e) => { e.stopPropagation(); handleResourceUpvote(r.id); }}
                                    style={{ color: r.upvotedBy?.includes(currentUser?.alias) ? '#10B981' : 'white', display: 'flex', gap: '4px', alignItems: 'center', background: 'transparent', border: 'none', cursor: 'pointer' }}
                                  >
                                    <ChevronUp size={16} color={r.upvotedBy?.includes(currentUser?.alias) ? '#10B981' : 'white'} />
                                    <span style={{ color: r.upvotedBy?.includes(currentUser?.alias) ? '#10B981' : 'white' }}>{r.upvotes || 0}</span>
                                  </button>
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
                    </>
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
                          backgroundColor: '#27272a', color: '#10b981', border: '2px solid white', 
                          padding: '10px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: 800, cursor: 'pointer',
                          display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 4px 15px rgba(255,255,255,0.1)'
                        }}
                      >
                        < Trophy size={14} color="#fbbf24" fill="#fbbf24" style={{ opacity: 0.9 }} /> Show My Position
                      </button>
                    )}
                  </div>
                  
                  {isLoading ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                      <LeaderboardSkeleton />
                      <LeaderboardSkeleton />
                      <LeaderboardSkeleton />
                      <p style={{ marginTop: '16px', fontSize: '12px' }}>Establishing neural link...</p>
                    </div>
                  ) : (
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
                      {sortedContributors.length === 0 && (
                        <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '20px' }}>
                          No contributors found in this sector.
                        </div>
                      )}
                    </div>
                  )}
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
                  {isLoading ? (
                    <div style={{ color: 'var(--text-secondary)', fontSize: '12px', padding: '10px 0' }}>
                      <SidebarSkeleton />
                      <SidebarSkeleton />
                      <SidebarSkeleton />
                    </div>
                  ) : (
                    sortedContributors.slice(0, 5).map(user => (
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
                    ))
                  )}
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
