import React, { useState } from 'react';
import { Bell, ChevronRight, CheckCircle, Clock, X, ArrowLeft } from 'lucide-react';

export default function DashboardPage({ currentUser, viewedUser, doubts, contributors, sortedContributors, WINGS, onNavigate, onUpdateUser, onViewThread }) {
  const [isEditing, setIsEditing] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [tempAvatar, setTempAvatar] = useState('');
  const [tempDesc, setTempDesc] = useState('');
  const [tempName, setTempName] = useState('');
  const displayUser = viewedUser || currentUser;
  const isOwnProfile = (!viewedUser || (currentUser && viewedUser.alias === currentUser.alias));

  // Dynamic Theme Mapping
  const GET_PROFILE_THEME = (avatarUrl) => {
    if (!avatarUrl) return { primary: '#a855f7', bg: 'linear-gradient(180deg, #0d0814 0%, #05020a 100%)' };
    const seed = avatarUrl.split('seed=')[1]?.split('&')[0] || '';
    
    const themes = {
      'Alpha': { primary: '#6366f1', bg: 'linear-gradient(180deg, #1e1b4b 0%, #05020a 100%)' },
      'Beta': { primary: '#10b981', bg: 'linear-gradient(180deg, #064e3b 0%, #05020a 100%)' },
      'Gamma': { primary: '#f43f5e', bg: 'linear-gradient(180deg, #4c0519 0%, #05020a 100%)' },
      'Delta': { primary: '#fbbf24', bg: 'linear-gradient(180deg, #451a03 0%, #05020a 100%)' },
      'Omega': { primary: '#94a3b8', bg: 'linear-gradient(180deg, #0f172a 0%, #05020a 100%)' },
      'Zeta': { primary: '#d946ef', bg: 'linear-gradient(180deg, #4a044e 0%, #05020a 100%)' },
      'Sigma': { primary: '#0ea5e9', bg: 'linear-gradient(180deg, #082f49 0%, #05020a 100%)' },
      'Kappa': { primary: '#818cf8', bg: 'linear-gradient(180deg, #312e81 0%, #05020a 100%)' },
      'Epsilon': { primary: '#84cc16', bg: 'linear-gradient(180deg, #1a2e05 0%, #05020a 100%)' },
      'Theta': { primary: '#f97316', bg: 'linear-gradient(180deg, #431407 0%, #05020a 100%)' },
    };

    return themes[seed] || { primary: '#a855f7', bg: 'linear-gradient(180deg, #0d0814 0%, #05020a 100%)' };
  };

  const theme = GET_PROFILE_THEME(displayUser?.avatar);

  // Extrapolate mock data
  const userStats = contributors.find(c => c.name === displayUser?.alias);
  const totalSolved = displayUser?.solved || 0;
  const userRank = sortedContributors.findIndex(c => c.name === displayUser?.alias) + 1 || '?';
  const userDoubts = doubts.filter(d => (isOwnProfile && d.creatorAlias === displayUser?.alias) || (!isOwnProfile && d.author === displayUser?.alias));

  const CARTOON_AVATARS = [
    'https://api.dicebear.com/7.x/bottts/svg?seed=Alpha',
    'https://api.dicebear.com/7.x/bottts/svg?seed=Beta',
    'https://api.dicebear.com/7.x/bottts/svg?seed=Gamma',
    'https://api.dicebear.com/7.x/bottts/svg?seed=Delta',
    'https://api.dicebear.com/7.x/bottts/svg?seed=Omega',
    'https://api.dicebear.com/7.x/bottts/svg?seed=Zeta',
    'https://api.dicebear.com/7.x/bottts/svg?seed=Sigma',
    'https://api.dicebear.com/7.x/bottts/svg?seed=Kappa',
    'https://api.dicebear.com/7.x/bottts/svg?seed=Epsilon',
    'https://api.dicebear.com/7.x/bottts/svg?seed=Theta',
  ];

  const getSafeAvatar = (user) => {
    return user?.avatar && user.avatar.includes('http') ? user.avatar : `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.rollNumber || 'default'}`;
  };

  return (
    <div style={{ background: theme.bg, minHeight: '100vh', width: '100vw', fontFamily: 'Inter, sans-serif', color: '#fff', overflowY: 'auto' }}>
      
      {/* BRAND HEADER */}
      <header style={{ height: '100px', borderBottom: '1px solid rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 48px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontSize: '24px', fontWeight: 800, cursor: 'pointer', letterSpacing: '-0.5px' }} onClick={() => onNavigate('app')}>
            <span style={{ color: 'white' }}>IIITL</span><span style={{color: '#a1a1aa'}}>DoubtMask</span>
          </div>
          <div 
             onClick={() => onNavigate('app')}
             style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: theme.primary, fontWeight: 600, cursor: 'pointer', opacity: 0.8 }}
          >
             <ArrowLeft size={14} /> Go Back to Feed
          </div>
        </div>

        {/* Removed Nav Bar as requested */}
      </header>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '64px 48px' }}>
        
        {/* PROFILE BANNER BLOCK */}
        <section style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '64px' }}>
          <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
            {/* Avatar block with gradient background */}
            <div style={{ position: 'relative', width: '100px', height: '100px', borderRadius: '16px', background: `linear-gradient(135deg, ${theme.primary}, #6366f1)`, padding: '2px', boxShadow: `0 0 20px ${theme.primary}66` }}>
               <img src={getSafeAvatar(displayUser)} style={{ width: '100%', height: '100%', borderRadius: '14px', objectFit: 'cover', backgroundColor: '#120b1c' }} alt="Avatar" />
               <div style={{ position: 'absolute', bottom: '-6px', right: '-6px', backgroundColor: theme.primary, borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid #0d0814' }}>
                 <CheckCircle size={12} color="#0d0814" fill="white" />
               </div>
            </div>
            
            <div style={{ marginTop: '8px' }}>
              <h1 style={{ fontSize: '36px', fontWeight: 'bold', margin: '0 0 4px 0', color: 'white', letterSpacing: '-0.5px' }}>{displayUser?.alias || 'CipherScholar_01'}</h1>
              {displayUser?.name && (
                <div style={{ fontSize: '18px', color: theme.primary, fontWeight: 600, marginBottom: '12px' }}>{displayUser.name}</div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px', marginBottom: displayUser?.description ? '16px' : '0' }}>
                <span style={{ backgroundColor: 'rgba(255,255,255,0.08)', padding: '4px 10px', borderRadius: '4px', color: '#a1a1aa', fontWeight: 600, letterSpacing: '0.5px', fontSize: '11px', textTransform: 'uppercase' }}>{displayUser?.rollNumber || 'LCI2024001'}</span>
              </div>
              {displayUser?.description && (
                <p style={{ fontSize: '14px', color: '#d4d4d8', maxWidth: '600px', lineHeight: 1.5 }}>
                  {displayUser.description}
                </p>
              )}
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
            {isOwnProfile && <button onClick={() => {
                setTempAvatar(currentUser?.avatar || '');
                setTempDesc(currentUser?.description || '');
                setTempName(currentUser?.name || '');
                setIsEditing(true);
            }} style={{ padding: '10px 24px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'transparent', color: '#e4e4e7', fontWeight: 600, cursor: 'pointer', fontSize: '13px' }}>Edit Profile</button>}
            <button 
              onClick={() => {
                 if (isOwnProfile) {
                    setShowLogoutConfirm(true);
                 } else {
                    onNavigate('app');
                 }
              }}
              style={{ padding: '10px 24px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'transparent', color: '#e4e4e7', fontWeight: 600, cursor: 'pointer', fontSize: '13px' }}
            >
              {isOwnProfile ? 'Log Out' : 'Back to Feed'}
            </button>
          </div>
        </section>

        {isEditing && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(5,2,10,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
            <div style={{ background: 'linear-gradient(145deg, rgba(30,15,40,0.9) 0%, rgba(15,5,25,0.95) 100%)', padding: '32px', borderRadius: '24px', width: '400px', border: '1px solid rgba(168,85,247,0.3)', boxShadow: '0 10px 40px rgba(168,85,247,0.15)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#e9d5ff' }}>Edit Profile</h2>
                <X size={20} style={{ cursor: 'pointer', color: '#a855f7' }} onClick={() => setIsEditing(false)} />
              </div>
              
              <h3 style={{ fontSize: '13px', color: '#c084fc', marginBottom: '12px', fontWeight: 600 }}>Choose Avatar</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', marginBottom: '12px' }}>
                {CARTOON_AVATARS.map((url, idx) => (
                  <button 
                    key={idx} 
                    style={{ 
                      width: '100%', aspectRatio: '1', borderRadius: '12px', border: (tempAvatar || currentUser?.avatar) === url ? '2px solid #a855f7' : '2px solid transparent', 
                      backgroundColor: 'rgba(128,90,213,0.1)', cursor: 'pointer', overflow: 'hidden', padding: 0, transition: 'all 0.2s ease', 
                      boxShadow: (tempAvatar || currentUser?.avatar) === url ? '0 0 15px rgba(168,85,247,0.4)' : 'none'
                    }}
                    onClick={() => setTempAvatar(url)}
                  >
                     <img src={url} alt={`Avatar ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
              <p style={{ fontSize: '11px', color: '#9333ea', textAlign: 'center', fontStyle: 'italic', marginBottom: '24px' }}>Avatars provided by DiceBear API</p>

              <div style={{ marginBottom: '24px' }}>
                 <h3 style={{ fontSize: '13px', color: '#c084fc', marginBottom: '12px', fontWeight: 600 }}>Full Name</h3>
                 <input 
                    type="text" 
                    value={tempName} 
                    onChange={(e) => setTempName(e.target.value)}
                    placeholder="Enter your full name"
                    style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(168,85,247,0.3)', borderRadius: '8px', padding: '12px', color: 'white', fontSize: '13px', outline: 'none' }} 
                 />
              </div>

              <div>
                 <h3 style={{ fontSize: '13px', color: '#c084fc', marginBottom: '12px', fontWeight: 600 }}>Bio / Description</h3>
                 <textarea 
                    value={tempDesc}
                    onChange={(e) => setTempDesc(e.target.value)}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(168,85,247,0.3)', borderRadius: '8px', padding: '12px', color: 'white', fontSize: '13px', resize: 'none', outline: 'none' }}
                    rows={3}
                    placeholder="Tell everyone a bit about yourself..."
                 />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                 <button onClick={() => setIsEditing(false)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(168,85,247,0.3)', background: 'transparent', color: '#e9d5ff', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>Cancel</button>
                  <button onClick={async () => {
                      if (currentUser?.alias) {
                         try {
                            const res = await fetch('http://localhost:3001/api/users/profile', {
                               method: 'PATCH',
                               headers: { 'Content-Type': 'application/json' },
                               body: JSON.stringify({ 
                                  alias: currentUser.alias, 
                                  avatar: tempAvatar || currentUser?.avatar, 
                                  description: tempDesc,
                                  name: tempName
                               })
                            });
                            if (!res.ok) throw new Error('Update failed');
                            const updatedUser = await res.json();
                            if (onUpdateUser) onUpdateUser(updatedUser);
                            setIsEditing(false);
                         } catch(e) { console.error(e); }
                      }
                  }} style={{ padding: '8px 16px', borderRadius: '8px', background: '#a855f7', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}>Save Profile</button>
              </div>
            </div>
          </div>
        )}

        {showLogoutConfirm && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(5,2,10,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
            <div style={{ background: 'linear-gradient(145deg, rgba(30,15,40,0.9) 0%, rgba(15,5,25,0.95) 100%)', padding: '32px', borderRadius: '24px', width: '380px', border: '1px solid rgba(239,68,68,0.3)', boxShadow: '0 10px 40px rgba(239,68,68,0.15)', textAlign: 'center' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}>
                 <X size={24} color="#ef4444" />
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: 'white', marginBottom: '12px' }}>End Session?</h2>
              <p style={{ color: '#a1a1aa', fontSize: '14px', marginBottom: '32px', lineHeight: 1.5 }}>Are you sure you want to log out? You will need to re-enter your university credentials to access the Sanctuary again.</p>
              
              <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                 <button onClick={() => setShowLogoutConfirm(false)} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#e4e4e7', cursor: 'pointer', fontSize: '13px', fontWeight: 600, transition: 'all 0.2s ease' }}>Cancel</button>
                 <button onClick={() => {
                     setShowLogoutConfirm(false);
                     onNavigate('logout');
                 }} style={{ flex: 1, padding: '12px', borderRadius: '8px', background: '#ef4444', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '13px', transition: 'all 0.2s ease', boxShadow: '0 4px 12px rgba(239,68,68,0.3)' }}>Yes, Log Out</button>
              </div>
            </div>
          </div>
        )}

        {/* METRICS GRID */}
        <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px', marginBottom: '64px' }}>
          
          {/* Card 1 */}
          <div style={{ background: 'linear-gradient(145deg, rgba(30,20,40,0.6) 0%, rgba(15,8,25,0.8) 100%)', border: `1px solid ${theme.primary}33`, borderRadius: '16px', padding: '32px', position: 'relative', boxShadow: `0 8px 32px ${theme.primary}11` }}>
            <div style={{ color: theme.primary, fontSize: '11px', fontWeight: 700, letterSpacing: '1px', marginBottom: '32px', textTransform: 'uppercase' }}>Doubts Asked</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '16px' }}>
              <div style={{ fontSize: '56px', fontWeight: 'bold', lineHeight: 1, color: 'white', textShadow: `0 2px 10px ${theme.primary}44` }}>{userDoubts.length}</div>
            </div>
            <div style={{ color: theme.primary, fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 500, opacity: 0.8 }}>
              Active
            </div>
          </div>

          {/* Card 2 */}
          <div style={{ background: 'linear-gradient(145deg, rgba(30,20,40,0.6) 0%, rgba(15,8,25,0.8) 100%)', border: `1px solid ${theme.primary}33`, borderRadius: '16px', padding: '32px', position: 'relative', boxShadow: `0 8px 32px ${theme.primary}11` }}>
            <div style={{ color: theme.primary, fontSize: '11px', fontWeight: 700, letterSpacing: '1px', marginBottom: '32px', textTransform: 'uppercase' }}>Doubts Solved</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '16px' }}>
              <div style={{ fontSize: '56px', fontWeight: 'bold', lineHeight: 1, color: 'white', textShadow: `0 2px 10px ${theme.primary}44` }}>{totalSolved}</div>
            </div>
            <div style={{ color: theme.primary, fontSize: '12px', fontWeight: 500, opacity: 0.8 }}>
              Points of Honor
            </div>
          </div>

          {/* Card 2.5 (XP) */}
          <div style={{ background: 'linear-gradient(145deg, rgba(30,20,40,0.6) 0%, rgba(15,8,25,0.8) 100%)', border: `1px solid ${theme.primary}33`, borderRadius: '16px', padding: '32px', position: 'relative', boxShadow: `0 8px 32px ${theme.primary}11` }}>
            <div style={{ color: theme.primary, fontSize: '11px', fontWeight: 700, letterSpacing: '1px', marginBottom: '32px', textTransform: 'uppercase' }}>Academic XP</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '16px' }}>
              <div style={{ fontSize: '56px', fontWeight: 'bold', lineHeight: 1, color: 'white', textShadow: `0 2px 10px ${theme.primary}44` }}>{displayUser?.xp || 0}</div>
            </div>
            <div style={{ color: theme.primary, fontSize: '12px', fontWeight: 500, opacity: 0.8 }}>
               Global Standing: #{userRank}
            </div>
          </div>

        </section>

        {/* MY DOUBTS LIST */}
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '24px', marginBottom: '1px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 600, color: 'white', margin: 0 }}>{isOwnProfile ? 'My Doubts' : `${displayUser?.alias || 'User'}'s Doubts`}</h2>
            <span style={{ color: '#60a5fa', fontSize: '13px', cursor: 'pointer', fontWeight: 500 }}>View All History</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {userDoubts.map(doubt => {
              const wing = WINGS.find(w => w.id === doubt.wingId) || WINGS[0];
              return (
                <div key={doubt.id} style={{ background: 'rgba(25,12,35,0.6)', border: '1px solid rgba(168,85,247,0.1)', borderRadius: '12px', padding: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backdropFilter: 'blur(10px)' }}>
                  <div style={{ flex: 1, paddingRight: '24px' }}>
                     <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '16px' }}>
                        <span style={{ backgroundColor: 'rgba(255,255,255,0.08)', padding: '4px 8px', borderRadius: '4px', color: '#d4d4d8', fontSize: '10px', fontWeight: 700 }}>{wing.name.toUpperCase()}</span>
                        <span style={{ color: '#71717a', fontSize: '12px' }}>{doubt.time}</span>
                     </div>
                    <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'white', margin: 0, letterSpacing: '-0.2px' }}>{doubt.title}</h3>
                  </div>

                  <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
                    <div style={{ textAlign: 'right' }}>
                      {doubt.is_solved ? (
                        <div style={{ color: '#10b981', fontWeight: 600, fontSize: '12px', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end', marginBottom: '6px' }}>
                          <CheckCircle size={14} /> SOLVED
                        </div>
                      ) : (
                        <div style={{ color: '#f87171', fontWeight: 600, fontSize: '12px', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end', marginBottom: '6px' }}>
                          <Clock size={14} /> UNSOLVED
                        </div>
                      )}
                      <div style={{ color: '#71717a', fontSize: '11px' }}>{doubt.solutions} Solutions {doubt.is_solved ? 'provided' : 'pending'}</div>
                    </div>

                    <button 
                      onClick={() => onViewThread(doubt)}
                      style={{ width: '40px', height: '40px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#a1a1aa' }}
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              );
            })}
            
            {userDoubts.length === 0 && (
              <div style={{ backgroundColor: '#1e1e1e', padding: '64px', textAlign: 'center', color: '#71717a', fontSize: '14px', borderRadius: '0 0 16px 16px' }}>
                 No records found here.
              </div>
            )}
          </div>
        </section>

        <footer style={{ marginTop: '120px', display: 'flex', justifyContent: 'space-between', color: '#52525b', fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 600 }}>
          <div>© 2024 CIPHER SCHOLAR CORE • PROTOCOL 9.2.1</div>
          <div style={{ display: 'flex', gap: '32px' }}>
            <span style={{ cursor: 'pointer' }}>SYSTEM STATUS</span>
            <span style={{ cursor: 'pointer' }}>NEURAL PRIVACY</span>
            <span style={{ cursor: 'pointer' }}>CONTACT NODE</span>
          </div>
        </footer>

      </main>
    </div>
  );
}
