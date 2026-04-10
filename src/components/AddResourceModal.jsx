import React, { useState } from 'react';
import { X, Link as LinkIcon, Image as ImageIcon, Type } from 'lucide-react';
import './AskDoubtModal.css';

const WINGS = [
  { id: 'app', name: 'App Wing' },
  { id: 'foss', name: 'FOSS Wing' },
  { id: 'ml', name: 'ML Wing' },
  { id: 'web', name: 'Web Wing' },
  { id: 'cp', name: 'CP Wing' },
  { id: 'infosec', name: 'Infosec Wing' },
  { id: 'design', name: 'Design Wing' },
  { id: 'web3', name: 'Web3 Wing' },
];

export default function AddResourceModal({ onClose, onSubmit, activeWingId }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [wingId, setWingId] = useState(activeWingId || WINGS[0].id);
  const [type, setType] = useState('text'); // 'text', 'link', 'image'

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    onSubmit({
      title,
      content,
      wingId,
      type
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2>Add Study Material</h2>
          <button onClick={onClose} className="close-btn"><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Title <span className="required">*</span></label>
            <input 
              type="text" 
              placeholder="E.g., Complete Guide to React Context" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="input-field"
            />
          </div>

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

          <div className="form-group">
            <label>Resource Type</label>
            <div className="identity-toggle">
              <button 
                type="button" 
                className={`ident-btn ${type === 'text' ? 'active' : ''}`}
                onClick={() => setType('text')}
              >
                <Type size={18} /> Text
              </button>
              <button 
                type="button" 
                className={`ident-btn ${type === 'link' ? 'active' : ''}`}
                onClick={() => setType('link')}
              >
                <LinkIcon size={18} /> Link
              </button>
              <button 
                type="button" 
                className={`ident-btn ${type === 'image' ? 'active' : ''}`}
                onClick={() => setType('image')}
              >
                <ImageIcon size={18} /> Image URL
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Content <span className="required">*</span></label>
            {type === 'text' ? (
              <textarea 
                placeholder="Paste your notes or text here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="input-field textarea-field"
                rows={5}
                required
              />
            ) : (
              <input 
                type="text" 
                placeholder={type === 'link' ? "Paste URL..." : "Paste Image URL..."}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="input-field"
                required
              />
            )}
            {type === 'image' && content && (
              <img src={content} alt="preview" className="image-preview" style={{marginTop: '16px'}} />
            )}
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="cancel-btn">Cancel</button>
            <button type="submit" className="submit-btn" disabled={!title.trim() || !content.trim()}>POST RESOURCE</button>
          </div>
        </form>
      </div>
    </div>
  );
}
