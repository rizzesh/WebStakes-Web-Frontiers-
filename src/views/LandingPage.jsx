import React, { useState } from 'react';
import { Lock, Shield, User, Bell, ChevronRight, Terminal, AtSign, Globe, Code, Box, Trophy, MessageSquare, Cpu, ArrowRight, Key, Hash, Eye, EyeOff } from 'lucide-react';
import './LandingPage.css';

export default function LandingPage({ onNavigate, currentUser }) {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [identifier, setIdentifier] = useState(''); // For Login
  const [alias, setAlias] = useState(''); // For Register
  const [rollNumber, setRollNumber] = useState(''); // For Register
  const [name, setName] = useState(''); // For Register
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');

    const { supabase } = await import('../lib/supabaseClient');

    if (isLoginMode) {
      if (!identifier || !password) {
        setAuthError('ID / Alias and Password required.');
        return;
      }
    } else {
      if (!alias || !rollNumber || !password) {
        setAuthError('Username, Roll Number, and Password are required.');
        return;
      }
      if (!rollNumber.match(/^[a-zA-Z]{3}\d{7}$/)) {
        setAuthError('Invalid IIITL Roll Number format (e.g. LCI2024001)');
        return;
      }
    }

    try {
      if (isLoginMode) {
        // 1. Identify if it's an alias or roll number
        let email = "";
        if (identifier.match(/^[a-zA-Z]{3}\d{7}$/i)) {
          email = `${identifier.toLowerCase()}@iiitl.ac.in`;
        } else {
          // It's an alias, we need to find the roll number from the profiles table
          const { data: profile, error: profileErr } = await supabase
            .from('profiles')
            .select('roll_number')
            .eq('alias', identifier)
            .single();
          
          if (profileErr || !profile) throw new Error('Alias not found or invalid.');
          email = `${profile.roll_number.toLowerCase()}@iiitl.ac.in`;
        }

        // 2. Sign in with Supabase
        const { data: authData, error: signInErr } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (signInErr) throw signInErr;

        // 3. Fetch full profile
        const { data: fullProfile, error: fetchErr } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authData.user.id)
          .single();

        if (fetchErr) throw fetchErr;
        onNavigate('app', null, fullProfile);

      } else {
        // REGISTRATION
        const email = `${rollNumber.toLowerCase()}@iiitl.ac.in`;
        
        // 1. Sign up with Supabase Auth + Metadata
        const { data: authData, error: signUpErr } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              alias: alias,
              full_name: name,
              roll_number: rollNumber.toUpperCase()
            }
          }
        });

        if (signUpErr) throw signUpErr;
        if (!authData.user) throw new Error("Registration failed.");

        // 2. Fetch the profile created by the Database Trigger
        // We wait a tiny bit to ensure the trigger finishes
        const { data: newProfile, error: profileErr } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authData.user.id)
          .single();

        if (profileErr || !newProfile) {
          throw new Error("Profile creation in progress. Please try logging in.");
        }

        onNavigate('app', null, newProfile);
      }
    } catch (err) {
      console.error("AUTH ERROR DIAGNOSTICS:", err);
      let friendlyMsg = err.message;
      
      // SCRUB ALL TERMINOLOGY RELATING TO EMAIL SO THE USER NEVER SEES IT
      if (err.message.toLowerCase().includes('email')) {
        friendlyMsg = "Account access is currently restricted. Please check system settings.";
      }
      if (err.message.includes('profiles_alias_key')) {
        friendlyMsg = "This Username (Alias) is already taken.";
      }
      if (err.message.includes('profiles_roll_number_key')) {
        friendlyMsg = "This Roll Number is already registered.";
      }
      if (err.message.includes('Invalid login credentials')) {
        friendlyMsg = "Incorrect Roll Number / Username or Password.";
      }

      setAuthError(`ACCESS BLOCKED: ${friendlyMsg}`);
    }
  };

  const handleProtectedLink = () => {
    setAuthError('Access restricted: Please log in or create an account to access this section.');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="landing-container">
      {/* Top Navbar */}
      <nav className="landing-nav" style={{ padding: '24px 48px', display: 'flex', justifyContent: 'flex-start' }}>
        <span className="landing-logo-text" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} style={{ cursor: 'pointer', fontSize: '24px', fontWeight: 'bold', color: 'white' }}>
          IIITL<span style={{ color: '#d4d4d8' }}>DoubtMask</span>
        </span>
      </nav>

      <main className="landing-main">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-content">
            <div className="chip-badge">
              <Lock size={12} /> IIITL ACADEMIC SANCTUARY
            </div>
            <h1 className="hero-headline">
              Silence the <span className="highlight-purple">Ego</span>,<br/>
              Speak the <span className="highlight-blue">Doubt</span>.
            </h1>
            <p className="hero-subtext">
              IIITLDoubtMask is a focused, end-to-end encrypted forum designed specifically for the IIITL community. Discuss complex algorithms, FOSS projects, and academic hurdles without the weight of your identity.
            </p>
            
            <div className="hero-features-chips">
              <div className="feature-chip">
                <div className="feature-icon"><Lock size={16} /></div>
                <div>
                  <strong>Be Anonymous</strong>
                  <span>Zero identity tracking</span>
                </div>
              </div>
              <div className="feature-chip">
                <div className="feature-icon"><MessageSquare size={16} /></div>
                <div>
                  <strong>Zero Judgement</strong>
                  <span>Ask freely, learn faster</span>
                </div>
              </div>
            </div>
          </div>

          <div className="hero-form-card">
            {currentUser ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 16px', textAlign: 'center' }}>
                <img src={currentUser.avatar} alt="Profile" style={{ width: '64px', height: '64px', borderRadius: '50%', marginBottom: '16px' }} />
                <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>Welcome back, {currentUser.alias}</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>You are currently logged into the Sanctuary.</p>
                <button className="init-btn login-btn" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '16px' }} onClick={() => onNavigate('app')}>
                   Return to Main Feed <ArrowRight size={18} />
                </button>
              </div>
            ) : (
              <form onSubmit={handleAuth}>
                <h2>{isLoginMode ? 'Claim Your Mask' : 'Forge Your Mask'}</h2>
                <p>Access the crypt using your university credentials.</p>
                
                {isLoginMode ? (
                  <div className="form-group">
                    <label>USERNAME OR ROLL NO.</label>
                    <div className="input-with-icon">
                      <User size={16} />
                      <input 
                        type="text" 
                        placeholder="e.g. BinaryGhost_42 or LCI2024001" 
                        value={identifier}
                        onChange={(e) => { setIdentifier(e.target.value); setAuthError(''); }}
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="form-group">
                      <label>FULL NAME</label>
                      <div className="input-with-icon">
                        <User size={16} />
                        <input 
                          type="text" 
                          placeholder="e.g. John Doe" 
                          value={name}
                          onChange={(e) => { setName(e.target.value); setAuthError(''); }}
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>USERNAME</label>
                      <div className="input-with-icon">
                        <AtSign size={16} />
                        <input 
                          type="text" 
                          placeholder="e.g. BinaryGhost_42" 
                          value={alias}
                          onChange={(e) => { setAlias(e.target.value); setAuthError(''); }}
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>ROLL NUMBER</label>
                      <div className="input-with-icon">
                        <Hash size={16} />
                        <input 
                          type="text" 
                          placeholder="LCI2024001" 
                          value={rollNumber}
                          onChange={(e) => { setRollNumber(e.target.value); setAuthError(''); }}
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="form-group">
                  <label>PASSWORD</label>
                  <div className="input-with-icon" style={{ position: 'relative' }}>
                    <Key size={16} />
                    <input 
                      type={showPassword ? "text" : "password"} 
                      placeholder="••••••••" 
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setAuthError(''); }}
                      style={{ paddingRight: '40px' }}
                    />
                    <div 
                      style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: '#a1a1aa' }}
                      title={showPassword ? "Hide password" : "Show password"}
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </div>
                  </div>
                </div>

                {authError && <div className="auth-error-msg">{authError}</div>}

                <div className="auth-buttons-row" style={{ flexDirection: 'column', gap: '12px' }}>
                  <button type="submit" className="init-btn login-btn" style={{ width: '100%' }}>
                    {isLoginMode ? 'LOG IN' : 'CREATE ACCOUNT'}
                  </button>
                  <div 
                    style={{ textAlign: 'center', fontSize: '13px', color: '#a855f7', cursor: 'pointer', marginTop: '12px' }}
                    onClick={() => { setIsLoginMode(!isLoginMode); setAuthError(''); }}
                  >
                    {isLoginMode ? "Don't have an account? Register" : "Already have an account? Log In"}
                  </div>
                </div>
              </form>
            )}
          </div>
        </section>

        {/* Feature Grid */}
        <section className="feature-grid">
          <div className="feature-card large-card">
            <h3>The Academic Wings</h3>
            <p>Structured knowledge silos dedicated to specific domains of computing. From competitive programming to deep learning, find your niche.</p>
            <div className="tags-row">
               <span className="tag purple-tag">App</span>
               <span className="tag orange-tag">FOSS</span>
               <span className="tag blue-tag">ML</span>
               <span className="tag purple-tag">Web</span>
               <span className="tag orange-tag">CP</span>
               <span className="tag blue-tag">Infosec</span>
               <span className="tag purple-tag">Design</span>
               <span className="tag orange-tag">Web3</span>
            </div>
            {/* Visual Abstract representation */}
            <div className="abstract-graphic">
              <div className="connector-line"></div>
              <div className="creative-node node-1"><Code size={20} /></div>
              <div className="creative-node node-2"><Terminal size={28} /></div>
              <div className="creative-node node-3"><Globe size={18} /></div>
              <div className="creative-node node-4"><Cpu size={14} /></div>
            </div>
          </div>

          <div className="feature-cards-right">
            <div className="feature-card split-row-full">
              <div className="card-icon"><Terminal size={20} /></div>
              <div>
                <h3>Anonymous Posting</h3>
                <p>Post your doubts and queries completely anonymously. Choose when to reveal your identity or remain a hidden scholar indefinitely.</p>
              </div>
            </div>
            
            <div className="feature-cards-bottom-row">
              <div className="feature-card block-card">
                <div className="card-icon"><Trophy size={18} /></div>
                <h3>Ego-less Leaderboard</h3>
                <p>Rank based on the quality of your anonymous answers.</p>
              </div>
              <div className="feature-card block-card">
                <div className="card-icon"><MessageSquare size={18} /></div>
                <h3>Peer Doubts</h3>
                <p>No question is too basic when nobody knows who is asking.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Metrics Section */}
        <section className="metrics-section">
          <div className="metrics-intro">
            <h2>Trusted by IIITL Scholars</h2>
            <p>"A safe space to admit when you don't know the answer."</p>
          </div>
          <div className="metrics-row">
            <div className="metric">
              <div className="metric-num">1.2k+</div>
              <div className="metric-label">DOUBTS SOLVED</div>
            </div>
            <div className="metric">
              <div className="metric-num">400+</div>
              <div className="metric-label">ACTIVE ALIASES</div>
            </div>
            <div className="metric">
              <div className="metric-num">0</div>
              <div className="metric-label">IDENTITY LEAKS</div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="landing-footer">
          <div className="footer-col brand-col">
            <h3 onClick={handleProtectedLink}>IIITLDoubtMask</h3>
            <p>An IIIT Lucknow initiative to foster open academic discourse through privacy-preserving technology. Developed by the Academic Sanctuary team.</p>
            <div className="footer-socials">
              <Terminal size={18} />
              <Globe size={18} />
              <User size={18} />
            </div>
          </div>
          <div className="footer-col">
            <h4>NAVIGATE</h4>
            <ul>
              <li onClick={handleProtectedLink}>Development Wings</li>
              <li onClick={handleProtectedLink}>Research Vault</li>
              <li onClick={handleProtectedLink}>Community Guidelines</li>
              <li onClick={handleProtectedLink}>Privacy Manifesto</li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>SYSTEM STATUS</h4>
            <div className="status-indicator">
              <div className="dot green"></div> All Systems Operational
            </div>
            <p className="system-minitext">Encryption Layer: v2.4.1 (Stable)<br/>Node Latency: 12ms</p>
          </div>
        </footer>
        
        <div className="footer-bottom">
          <p>© 2024 IIITLDoubtMask. Unauthorized decryption is prohibited.</p>
          <div className="footer-legal-links">
            <span onClick={handleProtectedLink}>Security Audit</span>
            <span onClick={handleProtectedLink}>Bug Bounty</span>
            <span onClick={handleProtectedLink}>Credits</span>
          </div>
        </div>
      </main>
    </div>
  );
}
