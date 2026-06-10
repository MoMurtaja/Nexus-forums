"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import './index.css';

export default function App() {
  // 1. GLOBAL STATE
  const [user, setUser] = useState(null); 
  const [usernameInput, setUsernameInput] = useState('');
  const [roleInput, setRoleInput] = useState('user'); 
  const [activeTab, setActiveTab] = useState('feed'); 
  
  const [posts, setPosts] = useState([]);
  const [newPostText, setNewPostText] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [commentInputs, setCommentInputs] = useState({});
  const [loading, setLoading] = useState(false);

  // 2. FETCH DATA FROM SUPABASE ON COMPONENT LOAD
  useEffect(() => {
    if (user) {
      fetchPostsAndComments();
    }
  }, [user]);

  const fetchPostsAndComments = async () => {
    // Fetch posts from your database, sorting them by newest first
    const { data: postsData, error: postsError } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (postsError) {
      console.error("Error pulling posts:", postsError.message);
      return;
    }

    // Fetch comments matching existing threads
    const { data: commentsData, error: commentsError } = await supabase
      .from('comments')
      .select('*')
      .order('created_at', { ascending: true });

    if (commentsError) {
      console.error("Error pulling comments:", commentsError.message);
      return;
    }

    // Map comments array to their corresponding post ids
    const compiledPosts = postsData.map(post => ({
      ...post,
      comments: commentsData ? commentsData.filter(c => c.post_id === post.id) : []
    }));

    setPosts(compiledPosts);
  };

  // 3. ACTION HANDLERS
  const handleLogin = (e) => {
    e.preventDefault();
    if (!usernameInput.trim()) return;
    
    const targetName = usernameInput.trim();
    const evaluatedRole = targetName.toLowerCase() === 'momurtaja' ? 'owner' : roleInput;
    
    setUser({ username: targetName, role: evaluatedRole });
  };

  const handleLogout = () => {
    setUser(null);
    setUsernameInput('');
    setActiveTab('feed');
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPostText.trim()) return;
    setLoading(true);

    let uploadedImageUrl = null;

    try {
      // Step A: Handle image storage upload if an image was selected
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `post-images/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('images')
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from('images').getPublicUrl(filePath);
        uploadedImageUrl = data.publicUrl;
      }

      // Step B: Insert row directly into Supabase Posts Table
      const { error: dbError } = await supabase
        .from('posts')
        .insert([
          {
            author: user.username,
            role: user.role,
            content: newPostText.trim(),
            image_url: uploadedImageUrl
          }
        ]);

      if (dbError) throw dbError;

      setNewPostText('');
      setImageFile(null);
      // Re-fetch database stack to refresh the UI immediately
      await fetchPostsAndComments();

    } catch (err) {
      alert("Pipeline upload failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateComment = async (e, postId) => {
    e.preventDefault();
    const text = commentInputs[postId];
    if (!text || !text.trim()) return;

    try {
      const { error } = await supabase
        .from('comments')
        .insert([
          {
            post_id: postId,
            author: user.username,
            role: user.role,
            content: text.trim()
          }
        ]);

      if (error) throw error;

      setCommentInputs({ ...commentInputs, [postId]: '' });
      await fetchPostsAndComments(); // Refresh stack to show new reply

    } catch (err) {
      alert("Failed to submit reply: " + err.message);
    }
  };

  // 4. UI SEPARATION GATES
  if (!user) {
    return (
      <div className="login-gate">
        <div className="login-card">
          <div className="login-header">
            <h1>Nexus Forums</h1>
            <p>Access the developer network terminal</p>
          </div>
          
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Authentication Username</label>
              <input 
                type="text" 
                placeholder="Enter handle name..." 
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Clearance Permissions Level</label>
              <select value={roleInput} onChange={(e) => setRoleInput(e.target.value)}>
                <option value="user">Standard User</option>
                <option value="moderator">Forum Moderator</option>
              </select>
              <span className="form-tip">Pro-tip: Input name 'MoMurtaja' to unlock absolute Owner state.</span>
            </div>

            <button type="submit" className="btn-primary">Initialize Login</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="forum-container">
      {/* APP SIDEBAR */}
      <aside className="sidebar">
        <div className="brand-header">
          <h2>Nexus Forums</h2>
          <div className="status-indicator">
            <span className="dot-green"></span> Live Cloud Database
          </div>
        </div>
        
        <div className="user-badge-card">
          <p className="profile-name">User: <strong>{user.username}</strong></p>
          <span className={`badge badge-${user.role}`}>{user.role}</span>
        </div>
        
        <nav className="navigation-links">
          <button 
            className={activeTab === 'feed' ? "menu-item active" : "menu-item"}
            onClick={() => setActiveTab('feed')}
          >
            🏠 Activity Feed
          </button>

          {(user.role === 'owner' || user.role === 'moderator') && (
            <button 
              className={activeTab === 'settings' ? "menu-item active" : "menu-item"}
              onClick={() => setActiveTab('settings')}
            >
              ⚙️ Server Controls
            </button>
          )}

          <button onClick={handleLogout} className="btn-logout">
            🚪 Disconnect Session
          </button>
        </nav>
      </aside>

      {/* DYNAMIC WINDOW WORKSPACE */}
      <main className="main-content">
        {activeTab === 'feed' ? (
          <div className="feed-layout">
            <h3>Community Pipeline</h3>
            
            {/* Create Post Interface Form */}
            <form onSubmit={handleCreatePost} className="post-creator-form">
              <textarea 
                value={newPostText}
                onChange={(e) => setNewPostText(e.target.value)}
                placeholder="Broadcast a new topic configuration to the cloud..."
                required
              />
              
              <div className="media-upload-wrapper" style={{ marginTop: '10px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Attach Image:</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => setImageFile(e.target.files[0])}
                  style={{ fontSize: '0.85rem' }}
                />
              </div>

              <button type="submit" className="btn-primary-small" disabled={loading}>
                {loading ? 'Uploading Data...' : 'Publish Thread'}
              </button>
            </form>

            {/* Iterating Global Cloud Threads Stacks */}
            <div className="posts-stack">
              {posts.map(post => (
                <div key={post.id} className="post-card">
                  <div className="card-top-row">
                    <span className="user-handle">{post.author}</span>
                    <span className={`badge badge-${post.role}`}>{post.role}</span>
                  </div>
                  <p className="card-body-text">{post.content}</p>
                  
                  {/* Dynamic Database Image Render */}
                  {post.image_url && (
                    <div className="post-image-container" style={{ margin: '15px 0', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-line)' }}>
                      <img src={post.image_url} alt="Shared content" style={{ width: '100%', maxHeight: '450px', objectFit: 'cover' }} />
                    </div>
                  )}
                  
                  {/* Comments Processing System */}
                  <div className="comments-module">
                    <h5>Replies ({post.comments ? post.comments.length : 0})</h5>
                    
                    {post.comments && post.comments.map(comment => (
                      <div key={comment.id} className="comment-bubble">
                        <div className="comment-meta">
                          <strong>{comment.author}</strong>
                          <span className={`badge badge-${comment.role}`}>{comment.role}</span>
                        </div>
                        <p className="comment-text">{comment.content}</p>
                      </div>
                    ))}

                    {/* Inline Comment Form box linked per individual Post ID row */}
                    <form onSubmit={(e) => handleCreateComment(e, post.id)} className="comment-form-row">
                      <input 
                        type="text"
                        placeholder="Type real-time response..."
                        value={commentInputs[post.id] || ''}
                        onChange={(e) => setCommentInputs({
                          ...commentInputs,
                          [post.id]: e.target.value
                        })}
                        required
                      />
                      <button type="submit" className="btn-reply">Reply</button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* CONFIG SETTINGS TAB */
          <div className="settings-layout">
            <h3>⚙️ Root Administration Infrastructure</h3>
            <p className="text-secondary">Security and active cloud deployment verification room.</p>
            
            <div className="settings-panel-card">
              <h4>System Access Matrix</h4>
              <ul className="settings-list">
                <li>Automated Profanity Moderation Filters [ENABLED]</li>
                <li>Anonymous User Registration Gateways [SANDBOX ACTIVE]</li>
                <li>Supabase Live Cluster Network Connection [STABLE SHAKING]</li>
              </ul>
              <div className="alert-banner" style={{ border: '1px solid var(--accent-green)', background: 'rgba(16, 185, 129, 0.05)', color: '#d1fae5' }}>
                <strong>Cloud Engine Verified:</strong> Your post inputs, image binaries, and user commenting logic are running directly on remote cloud database tables. Reloading your browser will no longer cause data memory state volatile destruction!
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

