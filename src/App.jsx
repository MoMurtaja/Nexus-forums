import React, { useState } from 'react';
import './globals.css';

export default function ForumApp() {
  // Simulator for who is currently logged in.
  // Change role to 'user' or 'moderator' to see the settings option disappear!
  const [currentUser, setCurrentUser] = useState({
    id: "user_01",
    username: "MoMurtaja",
    role: "owner" // Options: 'user', 'moderator', 'owner'
  });

  const [activeTab, setActiveTab] = useState('feed'); // Tab states: 'feed' or 'settings'
  
  // Hardcoded posts layout setup
  const [posts, setPosts] = useState([
    { id: 1, author: "MoMurtaja", role: "owner", content: "Welcome to the new Nexus Forums setup!" },
    { id: 2, author: "AlphaMod", role: "moderator", content: "Keep discussions civil in the community threads." },
    { id: 3, author: "Gamer99", role: "user", content: "Does anyone know how to update the database configs?" }
  ]);

  const [newPostText, setNewPostText] = useState("");

  const handleCreatePost = (e) => {
    e.preventDefault();
    if (!newPostText.trim()) return;

    const newPost = {
      id: posts.length + 1,
      author: currentUser.username,
      role: currentUser.role,
      content: newPostText
    };

    // Note: This updates the local screen state. To make others see it live,
    // you will link this function to a cloud database pool like Supabase or Firebase!
    setPosts([newPost, ...posts]);
    setNewPostText("");
  };

  return (
    <div className="forum-container">
      {/* SIDEBAR NAVIGATION */}
      <aside className="sidebar">
        <h2>Nexus Forums</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Logged in as: <strong>{currentUser.username}</strong>
        </p>
        
        <nav style={{ display: 'flex', flexDirection: 'col', gap: '10px', marginTop: '20px' }}>
          <button 
            className="menu-item" 
            style={{ background: activeTab === 'feed' ? var(--accent) : 'transparent', border: 'none', color: '#fff', textAlign: 'left', padding: '10px', cursor: 'pointer', borderRadius: '4px' }}
            onClick={() => setActiveTab('feed')}
          >
            🏠 Community Feed
          </button>

          {/* DYNAMIC PERMISSION CHECK: Only show settings menu to Owner or Mods */}
          {(currentUser.role === 'owner' || currentUser.role === 'moderator') && (
            <button 
              className="menu-item" 
              style={{ background: activeTab === 'settings' ? 'rgba(2, 132, 199, 0.2)' : 'transparent', border: '1px dashed var(--border)', color: '#fff', textAlign: 'left', padding: '10px', cursor: 'pointer', borderRadius: '4px' }}
              onClick={() => setActiveTab('settings')}
            >
              ⚙️ Admin Settings panel ({currentUser.role})
            </button>
          )}
        </nav>
      </aside>

      {/* MAIN CONTENT WORKSPACE */}
      <main className="main-content">
        {activeTab === 'feed' ? (
          <div>
            <h3>Community Feed</h3>
            
            {/* Create Post Interface */}
            <form onSubmit={handleCreatePost} style={{ marginBottom: '30px' }}>
              <textarea 
                value={newPostText}
                onChange={(e) => setNewPostText(e.target.value)}
                placeholder="What's on your mind?"
                style={{ width: '100%', minHeight: '80px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', color: '#fff', padding: '12px', borderRadius: '6px', resize: 'vertical' }}
              />
              <button type="submit" style={{ marginTop: '8px', backgroundColor: 'var(--accent)', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' }}>
                Publish Post
              </button>
            </form>

            {/* Render Posts List */}
            <div className="posts-list">
              {posts.map(post => (
                <div key={post.id} className="post-card">
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 'bold' }}>{post.author}</span>
                    {post.role === 'owner' && <span className="badge badge-owner">Owner</span>}
                    {post.role === 'moderator' && <span className="badge badge-mod">Mod</span>}
                  </div>
                  <p style={{ margin: 0, color: '#e4e4e7' }}>{post.content}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* SETTINGS TAB */
          <div>
            <h3>⚙️ Staff Administration Dashboard</h3>
            <p style={{ color: 'var(--text-muted)' }}>Welcome back, Creator. Manage Nexus Forums security levels here.</p>
            
            <div style={{ backgroundColor: 'var(--bg-card)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <h4>Management Controls</h4>
              <ul>
                <li>System-wide Content Censorship Configurations</li>
                <li>Approve New Forum Moderator Access Request Nodes</li>
                <li>Database Sync Portals (Supabase Connection Utilities)</li>
              </ul>
              {currentUser.role !== 'owner' && (
                <p style={{ color: 'var(--text-owner)', fontSize: '0.85rem' }}>⚠️ Warning: Only the full system Owner has write permissions to modify database environment variables.</p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

