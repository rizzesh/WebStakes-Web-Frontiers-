import React, { useState, useEffect } from 'react';
import { ArrowLeft, MessageSquare, ChevronUp, MessageCircle, X } from 'lucide-react';
import Comment from '../components/Comment';

export default function ThreadView({ post, onBack, onMarkSolved, onDeletePost, onUserUpvote, onPostUpvote, onProfileClick, currentUser, onCommentAdded }) {
  const [comments, setComments] = useState([]);
  const [replyContent, setReplyContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    // In a real app we'd fetch the comments here. Fetching `/api/posts/:id/comments`
    const fetchComments = async () => {
      try {
        const res = await fetch(`http://localhost:3001/api/posts/${post.id}`);
        if (res.ok) {
          const data = await res.json();
          // Assuming the backend sends a flat list or nested tree, we handle the tree here
          setComments(buildCommentTree(data.comments || []));
        } else {
          // Fallback mock comments
          setComments(buildCommentTree([
            { id: 101, post_id: post.id, text_content: 'This is a great question!', parent_comment_id: null, author: { alias: 'Senior_Dev' } },
            { id: 102, post_id: post.id, text_content: 'I agree, checking out state management guides is key.', parent_comment_id: 101, author: { alias: 'Web_Wizard' } },
            { id: 103, post_id: post.id, text_content: 'Have you tried standard context API?', parent_comment_id: null, author: { alias: 'Anonymous_User' } },
          ]));
        }
      } catch (err) {
        // Fallback for when backend isn't up
        setComments(buildCommentTree([
          { id: 101, post_id: post.id, text_content: 'Have you tried simplifying your state?', parent_comment_id: null, author: { alias: 'Senior_Dev' } },
          { id: 102, post_id: post.id, text_content: 'I agree, sometimes too deeply nested state is an anti-pattern.', parent_comment_id: 101, author: { alias: 'Web_Wizard' } },
        ]));
      }
    };
    fetchComments();
  }, [post.id]);

  // Recursively reconstruct comment tree from flat array
  const buildCommentTree = (flatComments) => {
    const commentMap = {};
    const rootComments = [];

    flatComments.forEach(c => {
      const maskedAuthor = c.is_anonymous ? { alias: 'Anonymous', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=anon' } : c.author;
      commentMap[c.id] = { ...c, author: maskedAuthor, child_comments: [] };
    });

    flatComments.forEach(c => {
      if (c.parent_comment_id) {
        if (commentMap[c.parent_comment_id]) {
          commentMap[c.parent_comment_id].child_comments.push(commentMap[c.id]);
        }
      } else {
        rootComments.push(commentMap[c.id]);
      }
    });

    return rootComments;
  };

  const handleCreateComment = async (parentId, text, isAnon) => {
    // Optimistic UI update or real backend call
    const payload = {
      post_id: post.id,
      text_content: text,
      parent_comment_id: parentId,
      is_anonymous: isAnon,
      alias: currentUser?.alias
    };

    try {
      const res = await fetch('http://localhost:3001/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        const newDbComment = await res.json();
        
        const maskedAuthor = newDbComment.is_anonymous ? { alias: 'Anonymous', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=anon' } : (newDbComment.author || {});

        // Structure the created comment like our frontend expects
        const newCommentObj = {
          id: newDbComment.id || Date.now(),
          post_id: newDbComment.post_id || post.id,
          text_content: newDbComment.text_content || text,
          parent_comment_id: newDbComment.parent_comment_id || parentId,
          author: { alias: maskedAuthor.alias || 'Unknown', avatar: maskedAuthor.avatar },
          child_comments: []
        };

        if (!parentId) {
          setComments([...comments, newCommentObj]);
        } else {
          const insertRecursive = (nodes) => {
            for (let node of nodes) {
              if (node.id === parentId) {
                node.child_comments = node.child_comments || [];
                node.child_comments.push(newCommentObj);
                return true;
              }
              if (node.child_comments && insertRecursive(node.child_comments)) {
                return true;
              }
            }
            return false;
          };
          const newTree = [...comments];
          insertRecursive(newTree);
          setComments(newTree);
        }
      } else {
        throw new Error('Backend not available');
      }
    } catch {
      // Mock Fallback UI logic
      const newCommentObj = {
        id: Date.now(),
        post_id: post.id,
        text_content: text,
        parent_comment_id: parentId,
        author: { alias: isAnon ? 'Anonymous' : (currentUser?.alias || 'CipherScholar_01'), avatar: isAnon ? 'https://api.dicebear.com/7.x/bottts/svg?seed=anon' : (currentUser?.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=default') },
        child_comments: []
      };

      if (!parentId) {
        setComments([...comments, newCommentObj]);
      } else {
        const insertRecursive = (nodes) => {
          for (let node of nodes) {
            if (node.id === parentId) {
              node.child_comments.push(newCommentObj);
              return true;
            }
            if (node.child_comments && insertRecursive(node.child_comments)) {
              return true;
            }
          }
          return false;
        };
        const newTree = [...comments];
        insertRecursive(newTree);
        setComments(newTree);
      }
    }
    if (onCommentAdded) onCommentAdded();
  };

  const handleDeleteComment = async (commentId) => {
    const removeComment = (nodes) => {
      return nodes.filter(c => c.id !== commentId).map(c => ({
        ...c,
        child_comments: removeComment(c.child_comments || [])
      }));
    };
    setComments(prev => removeComment(prev));

    try {
      await fetch(`http://localhost:3001/api/comments/${commentId}`, { method: 'DELETE' });
    } catch(e) {
      console.error(e);
    }
  };

  const submitTopLevel = () => {
    if (!replyContent.trim()) return;
    handleCreateComment(null, replyContent, isAnonymous);
    setReplyContent('');
  };

  return (
    <div className="feed-area" style={{ padding: '32px' }}>
      <button 
        onClick={onBack} 
        style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}
      >
        <ArrowLeft size={16} /> Back to Feed
      </button>

      {/* Main Post UI */}
      <div className="doubt-card" style={{ marginBottom: '32px', borderColor: 'var(--border-color)' }}>
        <div className="card-header">
          <div className="author-info">
            <img src={post.author?.includes('Anonymous') ? 'https://api.dicebear.com/7.x/bottts/svg?seed=GhostNinja' : (currentUser && post.creatorAlias && post.creatorAlias === currentUser.alias) ? currentUser.avatar : (post.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=default')} className="author-avatar" alt="author" />
            <div>
              <div 
                className="author-name" 
                style={{ cursor: post.author?.includes('Anonymous') ? 'default' : 'pointer'}}
                onClick={() => onProfileClick && onProfileClick(post.author?.alias || post.author || 'Unknown')}
              >
                {post.author?.alias || post.author || 'Unknown'}
              </div>
              <div className="post-time">{post.time || 'just now'}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {!post.isResource && !post.is_solved && currentUser && post.creatorAlias && post.creatorAlias === currentUser.alias && (
              <button 
                onClick={onMarkSolved}
                style={{ 
                  backgroundColor: 'rgba(16, 185, 129, 0.1)', 
                  color: '#10B981', 
                  border: '1px solid #10B981',
                  padding: '4px 12px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: 600
                }}
              >
                ✓ Mark Satisfactory
              </button>
            )}
            {currentUser && post.creatorAlias && post.creatorAlias === currentUser.alias && (
              <button 
                onClick={() => setShowDeleteConfirm(true)}
                style={{ 
                  backgroundColor: 'transparent', 
                  color: '#ef4444', 
                  border: '1px solid #ef4444',
                  padding: '4px 12px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: 600,
                  marginLeft: '4px'
                }}
              >
                Delete
              </button>
            )}
            {!post.isResource && post.is_solved && (
              <span style={{ color: '#10B981', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                ✓ Solved
              </span>
            )}
            {!post.isResource && (
              <button 
                className="action-btn" 
                onClick={() => onPostUpvote && onPostUpvote(post.id)}
                style={{ color: post.upvotedBy?.includes(currentUser?.alias) ? '#10B981' : 'white' }}
              >
                <ChevronUp size={20} color={post.upvotedBy?.includes(currentUser?.alias) ? '#10B981' : 'white'} />
                <span style={{ color: post.upvotedBy?.includes(currentUser?.alias) ? '#10B981' : 'white' }}>{post.upvotes || 0}</span>
              </button>
            )}
          </div>
        </div>
        <h2 style={{ fontSize: '20px', color: 'white', marginBottom: '16px' }}>{post.title}</h2>
        <p className="card-snippet" style={{ fontSize: '15px' }}>{post.text_content || post.snippet}</p>
        
        {post.image_url && (
            <img src={post.image_url} alt="Post Img" style={{ maxWidth: '100%', borderRadius: '8px', marginTop: '16px', border: '1px solid var(--border-color)' }} />
        )}
      </div>

      <div style={{ paddingBottom: '24px', borderBottom: '1px solid var(--border-color)', marginBottom: '24px' }}>
        <h3 style={{ color: 'white', marginBottom: '16px' }}>{post.isResource ? 'Add a Comment' : 'Add a Solution'}</h3>
        <textarea 
          className="reply-textarea"
          placeholder={post.isResource ? "Type your comment here..." : "Type your solution or comment here..."}
          value={replyContent}
          onChange={(e) => setReplyContent(e.target.value)}
          rows={4}
        />
        <div className="reply-controls">
          <label className="reply-identity-toggle">
            <input 
              type="checkbox" 
              checked={isAnonymous} 
              onChange={(e) => setIsAnonymous(e.target.checked)} 
            />
            Post Anonymously
          </label>
          <button className="reply-submit-btn" onClick={submitTopLevel}>
            {post.isResource ? 'Submit Comment' : 'Submit Solution'}
          </button>
        </div>
      </div>

      <div className="thread-section">
        <h3 style={{ color: 'white', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MessageCircle size={20} /> Discussion Thread ({comments.length} top-level)
        </h3>
        
        {comments.length > 0 ? comments.map(comment => (
          <Comment 
            key={comment.id} 
            comment={comment} 
            onReply={handleCreateComment} 
            onDelete={handleDeleteComment}
            onUserUpvote={(username) => {
               const upvoterIsCreator = currentUser && post.creatorAlias && post.creatorAlias === currentUser.alias;
               onUserUpvote && onUserUpvote(username, post.wingId, upvoterIsCreator);
            }}
            onProfileClick={onProfileClick}
            currentUser={currentUser}
          />
        )) : (
          <div style={{ color: 'var(--text-secondary)' }}>
            {post.isResource ? 'No comments yet. Be the first!' : 'No solutions yet. Be the first!'}
          </div>
        )}
      </div>

      {showDeleteConfirm && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(5,2,10,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
          <div style={{ background: 'linear-gradient(145deg, rgba(30,15,40,0.9) 0%, rgba(15,5,25,0.95) 100%)', padding: '32px', borderRadius: '24px', width: '380px', border: '1px solid rgba(239,68,68,0.3)', boxShadow: '0 10px 40px rgba(239,68,68,0.15)', textAlign: 'center' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}>
               <X size={24} color="#ef4444" />
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: 'white', marginBottom: '12px' }}>Delete Doubt?</h2>
            <p style={{ color: '#a1a1aa', fontSize: '14px', marginBottom: '32px', lineHeight: 1.5 }}>Are you sure you want to permanently delete this post? This action cannot be undone.</p>
            
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
               <button onClick={() => setShowDeleteConfirm(false)} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#e4e4e7', cursor: 'pointer', fontSize: '13px', fontWeight: 600, transition: 'all 0.2s ease' }}>Cancel</button>
               <button onClick={() => {
                   setShowDeleteConfirm(false);
                   onDeletePost();
               }} style={{ flex: 1, padding: '12px', borderRadius: '8px', background: '#ef4444', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '13px', transition: 'all 0.2s ease', boxShadow: '0 4px 12px rgba(239,68,68,0.3)' }}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
