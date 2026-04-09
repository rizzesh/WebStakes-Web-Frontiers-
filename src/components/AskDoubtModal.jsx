import React, { useState } from 'react';
import { X, Image as ImageIcon, Globe, User, UserX } from 'lucide-react';
import './AskDoubtModal.css';

const WINGS = [
  { id: 'general', name: 'General Chat' },
  { id: 'app', name: 'App Wing' },
  { id: 'foss', name: 'FOSS Wing' },
  { id: 'ml', name: 'ML Wing' },
  { id: 'web', name: 'Web Wing' },
  { id: 'cp', name: 'CP Wing' },
  { id: 'infosec', name: 'Infosec Wing' },
  { id: 'design', name: 'Design Wing' },
  { id: 'web3', name: 'Web3 Wing' },
];

export default function AskDoubtModal({ onClose, onSubmit, currentUser, activeWingId }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [wingId, setWingId] = useState(activeWingId && activeWingId !== 'general' ? activeWingId : WINGS[0].id);
  const [isMainFeed, setIsMainFeed] = useState(true);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSubmit({
      title,
      text_content: content,
      wing_id: wingId,
      is_main_feed: isMainFeed,
      is_anonymous: isAnonymous,
      image_url: imageUrl || null
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2>Ask a Doubt</h2>
          <button onClick={onClose} className="close-btn"><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Identity</label>
            <div className="identity-toggle">
              <button 
                type="button" 
                className={`ident-btn ${!isAnonymous ? 'active' : ''}`}
                onClick={() => setIsAnonymous(false)}
              >
                <User size={18} /> Post as {currentUser?.alias || 'CipherScholar_01'}
              </button>
              <button 
                type="button" 
                className={`ident-btn anon-btn ${isAnonymous ? 'active' : ''}`}
                onClick={() => setIsAnonymous(true)}
              >
                <UserX size={18} /> Post Anonymously (Masked)
              </button>
            </div>
            <p className="help-text">
              {isAnonymous 
                ? "Your identity will be completely hidden from peers." 
                : "You will earn XP towards the leaderboard for this post."}
            </p>
          </div>

          <div className="form-group">
            <label>Title <span className="required">*</span></label>
            <input 
              type="text" 
              placeholder="E.g., How to optimize Transformer training on limited VRAM?" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="input-field"
            />
          </div>

          {(!activeWingId || activeWingId === 'general') && (
            <div className="form-group">
              <label>Development Wing</label>
              <select 
                value={wingId} 
                onChange={(e) => setWingId(e.target.value)}
                className="input-field select-field"
              >
                {WINGS.map(w => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="form-group checkbox-group">
            <input 
              type="checkbox" 
              id="mainFeed" 
              checked={isMainFeed} 
              onChange={(e) => setIsMainFeed(e.target.checked)} 
            />
            <label htmlFor="mainFeed">Also post on Main Feed (with Wing Tag)</label>
          </div>

          <div className="form-group">
            <label>Body Content <span className="required">*</span></label>
            <textarea 
              placeholder="Describe your issue, paste logs, or link to relevant code..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="input-field textarea-field"
              rows={5}
              required
            />
          </div>

          <div className="form-group">
            <label>Image Upload (Optional URL mock)</label>
            <div className="image-upload-zone">
              <ImageIcon size={24} className="upload-icon" />
              <input 
                type="text" 
                placeholder="Paste Image URL here (e.g. imgur link)"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="input-field image-url-input"
              />
            </div>
            {imageUrl && <img src={imageUrl} alt="preview" className="image-preview" />}
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="cancel-btn">Cancel</button>
            <button type="submit" className="submit-btn" disabled={!title.trim() || !content.trim()}>POST DOUBT</button>
          </div>
        </form>
      </div>
    </div>
  );
}
