import React, { useState } from 'react';
import { MessageSquare, ChevronUp, User } from 'lucide-react';
import './Comment.css';

export default function Comment({ comment, onReply, onDelete, onUserUpvote, onProfileClick, currentUser }) {
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [upvotes, setUpvotes] = useState(0);
  const [hasUpvoted, setHasUpvoted] = useState(false);

  const handleReplySubmit = () => {
    if (!replyContent.trim()) return;
    onReply(comment.id, replyContent, isAnonymous);
    setReplyContent('');
    setIsReplying(false);
  };

  const handleUpvote = () => {
    if (!hasUpvoted) {
      setUpvotes(prev => prev + 1);
      setHasUpvoted(true);
      if (onUserUpvote) {
        onUserUpvote(comment.author?.alias || 'Unknown');
      }
    }
  };

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  return (
    <div className="comment-wrapper">
      <div className="comment-header">
        <img src={(comment.author?.alias?.includes('Anonymous')) ? 'https://api.dicebear.com/7.x/bottts/svg?seed=GhostNinja' : (currentUser && comment.author?.alias === currentUser?.alias) ? currentUser.avatar : (comment.author?.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=default')} className="comment-avatar" alt="author" />
        <span 
           className="comment-author"
           style={{ cursor: (comment.author?.alias || 'Unknown').includes('Anonymous') ? 'default' : 'pointer' }}
           onClick={() => onProfileClick && onProfileClick(comment.author?.alias || 'Unknown')}
        >
           {comment.author?.alias || 'Unknown'}
        </span>
        <span className="comment-time">just now</span>
      </div>
      
      <div className="comment-body">
        {comment.text_content}
      </div>

      <div className="comment-actions">
        {!showDeleteConfirm ? (
          <>
            <button className={`comment-action-btn ${hasUpvoted ? 'active-upvote' : ''}`} onClick={handleUpvote} style={{ color: hasUpvoted ? '#10B981' : 'white' }}>
              <ChevronUp size={16} color={hasUpvoted ? '#10B981' : 'white'} /> 
              <span>{upvotes}</span>
            </button>
            <button className="comment-action-btn" onClick={() => setIsReplying(!isReplying)}>
              <MessageSquare size={16} /> Reply
            </button>
            {currentUser && comment.author?.alias === currentUser?.alias && (
              <button 
                className="comment-action-btn" 
                onClick={() => setShowDeleteConfirm(true)}
                style={{ color: '#ef4444' }}
              >
                Delete
              </button>
            )}
          </>
        ) : (
          <div className="delete-confirm-block" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 8px', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '4px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            <span style={{ fontSize: '13px', color: '#fca5a5', fontWeight: 500 }}>Delete this comment?</span>
            <button 
              onClick={() => {
                onDelete && onDelete(comment.id);
                setShowDeleteConfirm(false);
              }}
              style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', padding: '2px 10px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
            >
              Confirm
            </button>
            <button 
              onClick={() => setShowDeleteConfirm(false)}
              style={{ background: 'transparent', color: '#a1a1aa', border: 'none', cursor: 'pointer', fontSize: '12px' }}
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {isReplying && (
        <div className="reply-box">
          <textarea 
            className="reply-textarea"
            placeholder="What are your thoughts?"
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            rows={3}
          />
          <div className="reply-controls">
            <label className="reply-identity-toggle">
              <input 
                type="checkbox" 
                checked={isAnonymous} 
                onChange={(e) => setIsAnonymous(e.target.checked)} 
              />
              Reply Anonymously
            </label>
            <button className="reply-submit-btn" onClick={handleReplySubmit}>
              Submit Reply
            </button>
          </div>
        </div>
      )}

      {/* Render child comments recursively if they exist */}
      {comment.child_comments && comment.child_comments.length > 0 && (
        <div className="comment-thread-container">
          {comment.child_comments.map(child => (
            <Comment 
               key={child.id} 
               comment={child} 
               onReply={onReply} 
               onDelete={onDelete}
               onUserUpvote={onUserUpvote} 
               onProfileClick={onProfileClick} 
               currentUser={currentUser}
            />
          ))}
        </div>
      )}
    </div>
  );
}
