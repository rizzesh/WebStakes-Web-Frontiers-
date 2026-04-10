import React, { useState, useEffect } from 'react';
import { ArrowLeft, MessageSquare, ChevronUp, MessageCircle, X } from 'lucide-react';
import Comment from '../components/Comment';

export default function ThreadView({ post, onBack, onMarkSolved, onDeletePost, onUserUpvote, onPostUpvote, onProfileClick, currentUser, onCommentAdded }) {
  const [comments, setComments] = useState([]);
  const [replyContent, setReplyContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const fetchComments = async () => {
      const { supabase } = await import('../lib/supabaseClient');
      const { data, error } = await supabase
        .from('comments')
        .select('*, profiles(*)')
        .eq(post.isResource ? 'resource_id' : 'post_id', post.id)
        .order('created_at', { ascending: true });

      if (data) {
        const mapped = data.map(c => ({
          ...c,
          parent_comment_id: c.parent_id,
          author: c.is_anonymous ? { alias: 'Anonymous', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=anon' } : { alias: c.profiles?.alias, avatar: c.profiles?.avatar }
        }));
        setComments(buildCommentTree(mapped));
      }
    };
    fetchComments();
  }, [post.id]);

  // Recursively reconstruct comment tree from flat array
  const buildCommentTree = (flatComments) => {
    const commentMap = {};
    const rootComments = [];

    flatComments.forEach(c => {
      commentMap[c.id] = { ...c, child_comments: [] };
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
    const { supabase } = await import('../lib/supabaseClient');
    
    const { data: newDbComment, error } = await supabase
      .from('comments')
      .insert([{
        post_id: post.isResource ? null : post.id,
        resource_id: post.isResource ? post.id : null,
        author_id: currentUser.id,
        parent_id: parentId,
        text_content: text,
        is_anonymous: isAnon
      }])
      .select('*, profiles(*)')
      .single();

    if (newDbComment) {
      const maskedAuthor = newDbComment.is_anonymous ? { alias: 'Anonymous', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=anon' } : { alias: newDbComment.profiles.alias, avatar: newDbComment.profiles.avatar };
      
      const newCommentObj = {
        id: newDbComment.id,
        post_id: newDbComment.post_id,
        text_content: newDbComment.text_content,
        parent_comment_id: newDbComment.parent_id,
        author: maskedAuthor,
        created_at: newDbComment.created_at,
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
            if (node.child_comments && insertRecursive(node.child_comments)) return true;
          }
          return false;
        };
        const newTree = [...comments];
        insertRecursive(newTree);
        setComments(newTree);
      }
      if (onCommentAdded) onCommentAdded(post.id);
    }
  };

  const handleDeleteComment = async (commentId) => {
    const { supabase } = await import('../lib/supabaseClient');
    await supabase.from('comments').delete().eq('id', commentId);
    
    const removeRecursive = (nodes) => {
      return nodes.filter(c => c.id !== commentId).map(c => ({
        ...c,
        child_comments: removeRecursive(c.child_comments || [])
      }));
    };
    setComments(prev => removeRecursive(prev));
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
