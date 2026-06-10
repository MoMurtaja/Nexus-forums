import React, { useState } from 'react';
import './index.css';

export default function App() {
  // 1. STATE CONFIGURATIONS
  const [user, setUser] = useState(null); 
  const [usernameInput, setUsernameInput] = useState('');
  const [roleInput, setRoleInput] = useState('user'); 
  const [activeTab, setActiveTab] = useState('feed'); 
  const [newPostText, setNewPostText] = useState('');
  const [commentInputs, setCommentInputs] = useState({});

  // Static Simulator Database Array
  const [posts, setPosts] = useState([
    { 
      id: 1, 
      author: "NexusBot", 
      role: "owner", 
      content: "Welcome to Nexus Forums! Submit a thread or add responses down below.",
      comments: [
        { id: 101, author: "AlphaMod", role: "moderator", content: "Systems operational." }
      ]
    }
  ]);

  // 2. LOGIC OPERATIONS
  const handleLogin = (e) => {
    e.preventDefault();
    if (!usernameInput.trim()) return;
    
    // Automatically flag creator profile as owner, otherwise apply selected role
    const assignedRole = usernameInput.toLowerCase() === 'momurtaja' ? 'owner' : roleInput;
    
    setUser({
      username: usernameInput.trim(),
      role: assignedRole
    });
  };

  const handleLogout = () => {
    setUser(null);
    setUsernameInput('');
    setActiveTab('feed');
  };

  const handleCreatePost = (e) => {
    e.preventDefault();
    if (!newPostText.trim()) return;

    const newPost = {
      id: Date.now(), 
      author: user.username,
      role: user.role,
      content: newPostText,
      comments: []
    };

    setPosts([newPost, ...posts]);
    setNewPostText('');
  };

  const handleCreateComment = (e, postId) => {
    e.preventDefault();
    const text = commentInputs[postId];
    if (!text || !text.trim()) return;

    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: [
            ...post.comments,
            {
              id: Date.now(),
              author: user.username,
              role: user.role,
              content: text.trim()
            }
          ]
        };
      }
      return post;
    }));

    setCommentInputs({ ...commentInputs, [postId]: '' });
  };

  // 3. GATE VIEW: LOGIN GATEWAY
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

  // 4. MAIN INTERFACE VIEW
  return (
    <div className="forum-container">
      {/* COLUMN A: CONTROL SIDEBAR */}
      <aside className="sidebar">
        <div className="brand-header">
          <h2>Nexus Forums</h2>
          <div className="status-indicator">
            <span className="dot-green"></span> Online Local Sandbox
          </div>
        </div>
        
        <div className="user-badge-card">
          <p className="profile-name">User: <strong>{user.username}</strong></p>
          <span className={`badge badge-${user.role}`}>{user.role}</span>
        </div>
        
        <nav className="navigation-links">
          <button 
            className={`menu-item ${activeTab === 'feed' ? 'active' : ''}`}
            onClick={() => setActiveTab('feed')}
          >
            🏠 Activity Feed
          </button>

          {(user.role === 'owner' || user.role === 'moderator') && (
            <button 
              className={`menu-item ${activeTab === 'settings' ? 'active' : ''}`}
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

      {/* COLUMN B: DYNAMIC CONTENT PANEL */}
      <main className="main-content">
        {activeTab === 'feed' ? (
          <div className="feed-layout">
            <h3>Community Pipeline</h3>
            
            {/* Create Post Interface Form */}
            <form onSubmit={handleCreatePost} className="post-creator-form">
              <textarea 
                value={newPostText}
                onChange={(e) => setNewPostText(e.target.value)}
                placeholder="Broadcast a new topic configuration to the dashboard..."
                required
              />
              <button type="submit" className="btn-primary-small">Publish Thread</button>
            </form>

            {/* Iterating Content Stack */}
            <div className="posts-stack">
              {posts.map(post => (
                <div key={post.id} className="post-card">
                  <div className="card-top-row">
                    <span className="user-handle">{post.author}</span>
                    <span className={`badge badge-${post.role}`}>{post.role}</span>
                  </div>
                  <p className="card-body-text">{post.content}</p>
                  
                  {/* Nested Comments Sub-System */}
                  <div className="comments-module">
                    <h5>Replies ({post.comments.length})</h5>
                    
                    {post.comments.map(comment => (
                      <div key={comment.id} className="comment-bubble">
                        <div className="comment-meta">
                          <strong>{comment.author}</strong>
                          <span className={`badge badge-${comment.role}`}>{comment.role}</span>
                        </div>
                        <p className="comment-text">{comment.content}</p>
                      </div>
                    ))}

                    {/* Inline Comment Entry Form */}
                    <form onSubmit={(e) => handleCreateComment(e, post.id)} className="comment-form-row">
                      <input 
                        type="text"
                        placeholder="Type standard response..."
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
          /* SECURITY CONTROL TAB VIEW PANEL */
          <div className="settings-layout">
            <h3>⚙️ Root Administration Infrastructure</h3>
            <p className="text-secondary">Security context configuration workspace.</p>
            
            <div className="settings-panel-card">
              <h4>System Access Matrix</h4>
              <ul className="settings-list">
                <li>Automated Profanity Moderation Filters [ENABLED]</li>
                <li>Anonymous User Registration Gateways [SANDBOX MODE]</li>
                <li>Database Volatility Status Tracking [VIRTUAL ENVIROMENT]</li>
              </ul>
              <div className="alert-banner">
                <strong>Memory Persistence Notice:</strong> This build is running entirely in temporary memory variables. To prevent comments and accounts from disappearing on page reload, standard production configurations require a cloud cluster backend (such as a Supabase or Postgres pool instance).
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

