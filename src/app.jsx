import React, { useState } from 'react';
import './index.css';

export default function App() {
  // 1. STATE MANAGEMENT
  const [user, setUser] = useState(null); // Track who is logged in globally
  const [usernameInput, setUsernameInput] = useState('');
  const [roleInput, setRoleInput] = useState('user'); // Default register role
  
  const [activeTab, setActiveTab] = useState('feed'); // 'feed' or 'settings'
  const [newPostText, setNewPostText] = useState('');
  
  // Track active typing for comments per post ID (e.g., { 1: "my comment text" })
  const [commentInputs, setCommentInputs] = useState({});

  // Hardcoded initial data template
  const [posts, setPosts] = useState([
    { 
      id: 1, 
      author: "NexusBot", 
      role: "owner", 
      content: "Welcome to Nexus Forums! Create an account to start testing features.",
      comments: [
        { id: 101, author: "AlphaMod", role: "moderator", content: "Looks clean, boss!" }
      ]
    }
  ]);

  // 2. HANDLERS
  const handleLogin = (e) => {
    e.preventDefault();
    if (!usernameInput.trim()) return;
    
    // Set user globally based on whatever they type into the login screen
    setUser({
      username: usernameInput.trim(),
      role: usernameInput.toLowerCase() === 'momurtaja' ? 'owner' : roleInput
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
      id: Date.now(), // Generate unique ID
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

    // Map through posts and append comment to the matching post item
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

    // Clear just this specific post's comment input box
    setCommentInputs({ ...commentInputs, [postId]: '' });
  };

  // 3. RENDER: LOGIN SCREEN (If not logged in)
  if (!user) {
    return (
      <div className="login-gate">
        <div className="login-card">
          <h1>Nexus Forums</h1>
          <p>Sign in to join the community network</p>
          
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Username</label>
              <input 
                type="text" 
                placeholder="Enter screen name..." 
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Select Account Role (Testing Mode)</label>
              <select value={roleInput} onChange={(e) => setRoleInput(e.target.value)}>
                <option value="user">Standard Member</option>
                <option value="moderator">Forum Moderator</option>
              </select>
              <small>Tip: Type 'MoMurtaja' as your name to bypass and auto-login as Owner.</small>
            </div>

            <button type="submit" className="btn-primary">Access Gateway</button>
          </form>
        </div>
      </div>
    );
  }

  // 4. RENDER: MAIN APPLICATION VIEW (If authenticated)
  return (
    <div className="forum-container">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="brand">
          <h2>Nexus Forums</h2>
          <span className="online-dot"></span> Live Portal
        </div>
        
        <div className="user-profile-card">
          <p>User: <strong>{user.username}</strong></p>
          <span className={`badge badge-${user.role}`}>{user.role.toUpperCase()}</span>
        </div>
        
        <nav className="nav-menu">
          <button 
            className={`menu-item ${activeTab === 'feed' ? 'active' : ''}`}
            onClick={() => setActiveTab('feed')}
          >
            🏠 Central Feed
          </button>

          {(user.role === 'owner' || user.role === 'moderator') && (
            <button 
              className={`menu-item ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              ⚙️ Security Settings
            </button>
          )}

          <button onClick={handleLogout} className="btn-logout">
            🚪 Terminate Session
          </button>
        </nav>
      </aside>

      {/* DASHBOARD INTERFACE */}
      <main className="main-content">
        {activeTab === 'feed' ? (
          <div className="feed-view">
            <h3>Community Activity</h3>
            
            {/* Create Post Interface */}
            <form onSubmit={handleCreatePost} className="post-creator-form">
              <textarea 
                value={newPostText}
                onChange={(e) => setNewPostText(e.target.value)}
                placeholder="Share an update or broadcast to the network..."
                required
              />
              <button type="submit" className="btn-primary">Broadcast Post</button>
            </form>

            {/* Displaying Live Threads */}
            <div className="posts-container">
              {posts.map(post => (
                <div key={post.id} className="post-card">
                  <div className="card-header">
                    <span className="author-name">{post.author}</span>
                    <span className={`badge badge-${post.role}`}>{post.role}</span>
                  </div>
                  <p className="card-body">{post.content}</p>
                  
                  {/* Comments Array Area */}
                  <div className="comments-section">
                    <h4>Comments ({post.comments.length})</h4>
                    {post.comments.map(comment => (
                      <div key={comment.id} className="comment-bubble">
                        <div className="comment-header">
                          <strong>{comment.author}</strong>
                          <span className={`badge badge-${comment.role}`}>{comment.role}</span>
                        </div>
                        <p>{comment.content}</p>
                      </div>
                    ))}

                    {/* Add Comment Box form submission */}
                    <form onSubmit={(e) => handleCreateComment(e, post.id)} className="comment-form">
                      <input 
                        type="text"
                        placeholder="Write a civil response..."
                        value={commentInputs[post.id] || ''}
                        onChange={(e) => setCommentInputs({
                          ...commentInputs,
                          [post.id]: e.target.value
                        })}
                        required
                      />
                      <button type="submit">Reply</button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* SETMISSIONS LEVEL RESTRICTED UI PANEL */
          <div className="settings-view">
            <h3>⚙️ Root Administration Console</h3>
            <p className="text-muted">Node identity clearance confirmed. Welcome back Administrator.</p>
            
            <div className="settings-card">
              <h4>System Automation Node Arrays</h4>
              <ul>
                <li>Active Content Restriction Firewalls [ONLINE]</li>
                <li>Database Core State Handshakes [LOCAL SANDBOX]</li>
              </ul>
              <p className="db-alert">
                ⚠️ NOTICE: You are currently running in Frontend Simulation mode. Persisted data volumes require cloud backend database synchronization strings.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

