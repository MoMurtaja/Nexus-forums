import { useState, useEffect } from "react";

const CATEGORIES = ["General","Tech","Gaming","Art","Music","Sports","News","Off-Topic"];
const AVATAR_COLORS = ["#7C5CFC","#F59E0B","#10B981","#EF4444","#3B82F6","#EC4899","#8B5CF6","#14B8A6"];

const storage = {
  get: (key, def = null) => { try { return JSON.parse(localStorage.getItem(key)) ?? def; } catch { return def; } },
  set: (key, val) => { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} },
};

const getAvatarColor = (id) => AVATAR_COLORS[(id?.charCodeAt?.(0) || 0) % AVATAR_COLORS.length];
const getInitials = (name) => (name || "?").split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
const timeAgo = (d) => {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

// ─── Reusable Components ─────────────────────────────────────────────────────

function Avatar({ name, userId, lg }) {
  const size = lg ? 42 : 32;
  return (
    <div style={{
      width: size, height: size, borderRadius: lg ? 10 : 8, flexShrink: 0,
      background: getAvatarColor(userId), display: "flex",
      alignItems: "center", justifyContent: "center",
      fontSize: lg ? 16 : 12, fontWeight: 800, color: "#fff",
    }}>{getInitials(name)}</div>
  );
}

function Badge({ text }) {
  return (
    <span style={{
      padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700,
      background: "#2D2550", color: "#9B7DFC", display: "inline-block", letterSpacing: 0.3,
    }}>{text}</span>
  );
}

function Btn({ children, primary, ghost, small, onClick, style: ex, disabled }) {
  const [hover, setHover] = useState(false);
  const base = {
    padding: small ? "5px 12px" : "9px 18px",
    borderRadius: small ? 6 : 8,
    border: "none", cursor: disabled ? "not-allowed" : "pointer",
    fontWeight: 600, fontSize: small ? 12 : 13, fontFamily: "inherit",
    transition: "all 0.15s", opacity: disabled ? 0.45 : 1,
    outline: "none",
    ...(primary ? {
      background: hover ? "#6B4EE6" : "#7C5CFC", color: "#fff",
    } : ghost ? {
      background: hover ? "#1E2232" : "transparent", color: "#9BA0B8",
      border: "1px solid #2A2D3E",
    } : {
      background: hover ? "#333650" : "#2A2D3E", color: "#E8E9F0",
    }),
    ...ex,
  };
  return (
    <button style={base} onClick={onClick} disabled={disabled}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      {children}
    </button>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      {label && <label style={{ display: "block", marginBottom: 6, fontSize: 12, fontWeight: 700, color: "#8B8FA8", textTransform: "uppercase", letterSpacing: 0.8 }}>{label}</label>}
      {children}
    </div>
  );
}

const inputStyle = {
  width: "100%", background: "#0A0C14", border: "1px solid #252838",
  borderRadius: 8, padding: "10px 14px", color: "#E8E9F0", fontSize: 14,
  fontFamily: "inherit", outline: "none", boxSizing: "border-box", transition: "border-color 0.15s",
};

function TextInput({ label, type = "text", value, onChange, placeholder, onKeyDown }) {
  return (
    <Field label={label}>
      <input type={type} value={value} onChange={onChange} placeholder={placeholder} onKeyDown={onKeyDown}
        style={inputStyle} onFocus={e => e.target.style.borderColor = "#7C5CFC"} onBlur={e => e.target.style.borderColor = "#252838"} />
    </Field>
  );
}

function TextArea({ label, value, onChange, placeholder, rows = 4 }) {
  return (
    <Field label={label}>
      <textarea value={value} onChange={onChange} placeholder={placeholder} rows={rows}
        style={{ ...inputStyle, resize: "vertical" }}
        onFocus={e => e.target.style.borderColor = "#7C5CFC"} onBlur={e => e.target.style.borderColor = "#252838"} />
    </Field>
  );
}

function Card({ children, style: ex, onClick, hoverable }) {
  const [hover, setHover] = useState(false);
  return (
    <div style={{
      background: hover && hoverable ? "#1C1F2E" : "#161923",
      border: `1px solid ${hover && hoverable ? "#35395A" : "#222536"}`,
      borderRadius: 14, padding: 20, transition: "all 0.15s",
      cursor: hoverable ? "pointer" : "default", ...ex,
    }}
      onClick={onClick}
      onMouseEnter={() => hoverable && setHover(true)}
      onMouseLeave={() => hoverable && setHover(false)}>
      {children}
    </div>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────

function Navbar({ currentUser, onNavigate, onLogout }) {
  return (
    <nav style={{
      background: "rgba(16,18,28,0.95)", backdropFilter: "blur(12px)",
      borderBottom: "1px solid #1E2132",
      padding: "0 24px", height: 62,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      position: "sticky", top: 0, zIndex: 100,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 9, cursor: "pointer" }} onClick={() => onNavigate("home")}>
        <div style={{ width: 32, height: 32, borderRadius: 9, background: "linear-gradient(135deg,#7C5CFC,#B47DFC)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>◈</div>
        <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.5px", color: "#fff" }}>
          Nexus<span style={{ color: "#9B7DFC" }}>Forums</span>
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {currentUser ? (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Avatar name={currentUser.username} userId={currentUser.id} />
              <span style={{ fontSize: 13, fontWeight: 700, color: "#E8E9F0" }}>{currentUser.username}</span>
            </div>
            <Btn ghost small onClick={onLogout}>Sign Out</Btn>
          </>
        ) : (
          <>
            <Btn ghost small onClick={() => onNavigate("login")}>Sign In</Btn>
            <Btn primary small onClick={() => onNavigate("register")}>Register</Btn>
          </>
        )}
      </div>
    </nav>
  );
}

// ─── Auth View ────────────────────────────────────────────────────────────────

function AuthView({ mode, users, onLogin, onRegister, onSwitchMode }) {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");

  function submit() {
    setError("");
    if (mode === "register") {
      if (!form.username.trim() || !form.email.trim() || !form.password) { setError("All fields are required."); return; }
      if (users.find(u => u.email === form.email)) { setError("Email already registered."); return; }
      onRegister(form);
    } else {
      if (!form.email || !form.password) { setError("Please fill all fields."); return; }
      const user = users.find(u => u.email === form.email && u.password === form.password);
      if (!user) { setError("Invalid email or password."); return; }
      onLogin(user);
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: "64px auto", padding: "0 16px" }}>
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div style={{ width: 52, height: 52, borderRadius: 14, background: "linear-gradient(135deg,#7C5CFC,#B47DFC)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, margin: "0 auto 16px" }}>◈</div>
        <h2 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 4px", color: "#fff", letterSpacing: "-0.5px" }}>
          {mode === "login" ? "Welcome back" : "Create your account"}
        </h2>
        <p style={{ color: "#8B8FA8", fontSize: 13, margin: 0 }}>
          {mode === "login" ? "Sign in to NexusForums" : "Join the community today"}
        </p>
      </div>
      <Card style={{ padding: 28 }}>
        {mode === "register" && (
          <TextInput label="Username" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} placeholder="YourUsername" />
        )}
        <TextInput label="Email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" />
        <TextInput label="Password" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="••••••••" onKeyDown={e => e.key === "Enter" && submit()} />
        {error && <p style={{ color: "#F87171", fontSize: 12, margin: "-6px 0 14px", display: "flex", alignItems: "center", gap: 5 }}>⚠ {error}</p>}
        <Btn primary onClick={submit} style={{ width: "100%", padding: "11px 18px", fontSize: 14, marginTop: 4 }}>
          {mode === "login" ? "Sign In" : "Create Account"}
        </Btn>
        <div style={{ borderTop: "1px solid #1E2132", margin: "20px 0" }} />
        <p style={{ color: "#8B8FA8", fontSize: 13, textAlign: "center", margin: 0 }}>
          {mode === "login" ? "Don't have an account? " : "Already have an account? "}
          <span style={{ color: "#9B7DFC", cursor: "pointer", fontWeight: 700 }} onClick={onSwitchMode}>
            {mode === "login" ? "Register" : "Sign In"}
          </span>
        </p>
      </Card>
    </div>
  );
}

// ─── New Post View ────────────────────────────────────────────────────────────

function NewPostView({ currentUser, onSubmit, onBack }) {
  const [form, setForm] = useState({ title: "", content: "", category: "General" });
  const [error, setError] = useState("");

  function submit() {
    if (!form.title.trim() || !form.content.trim()) { setError("Title and content are required."); return; }
    onSubmit({ ...form, authorId: currentUser.id, authorName: currentUser.username, id: Date.now().toString(), createdAt: new Date().toISOString(), upvotes: 0, upvotedBy: [], views: 0 });
  }

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "28px 16px" }}>
      <Btn ghost onClick={onBack} style={{ marginBottom: 20 }}>← Back</Btn>
      <Card style={{ padding: 28 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 22px", color: "#fff", letterSpacing: "-0.3px" }}>Create Post</h2>
        <TextInput label="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="What's on your mind?" />
        <Field label="Category">
          <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
            style={{ ...inputStyle, cursor: "pointer" }}>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </Field>
        <TextArea label="Content" value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} placeholder="Write your post here..." rows={7} />
        {error && <p style={{ color: "#F87171", fontSize: 12, margin: "-4px 0 12px" }}>⚠ {error}</p>}
        <div style={{ display: "flex", gap: 8 }}>
          <Btn primary onClick={submit}>Publish Post</Btn>
          <Btn ghost onClick={onBack}>Cancel</Btn>
        </div>
      </Card>
    </div>
  );
}

// ─── Post Detail View ─────────────────────────────────────────────────────────

function PostView({ postId, posts, comments, currentUser, onBack, onUpvote, onAddComment }) {
  const [commentText, setCommentText] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [replyTexts, setReplyTexts] = useState({});
  const post = posts.find(p => p.id === postId);
  if (!post) return null;

  const upvoted = currentUser && (post.upvotedBy || []).includes(currentUser.id);
  const topComments = comments.filter(c => c.postId === postId && !c.parentId);
  const totalComments = comments.filter(c => c.postId === postId).length;

  function submitComment() {
    if (!commentText.trim()) return;
    onAddComment({ id: Date.now().toString(), postId, authorId: currentUser.id, authorName: currentUser.username, content: commentText, createdAt: new Date().toISOString(), parentId: null });
    setCommentText("");
  }

  function submitReply(parentId) {
    const txt = replyTexts[parentId]?.trim();
    if (!txt) return;
    onAddComment({ id: (Date.now() + Math.random()).toString(), postId, authorId: currentUser.id, authorName: currentUser.username, content: txt, createdAt: new Date().toISOString(), parentId });
    setReplyTexts({ ...replyTexts, [parentId]: "" });
    setReplyTo(null);
  }

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 16px" }}>
      <Btn ghost onClick={onBack} style={{ marginBottom: 20 }}>← Back to Forum</Btn>
      <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
        {/* Main */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <Card style={{ marginBottom: 14 }}>
            <div style={{ marginBottom: 14 }}><Badge text={post.category} /></div>
            <h1 style={{ fontSize: 26, fontWeight: 800, margin: "0 0 14px", lineHeight: 1.3, color: "#fff", letterSpacing: "-0.5px" }}>{post.title}</h1>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
              <Avatar name={post.authorName} userId={post.authorId} />
              <span style={{ fontWeight: 700, fontSize: 13, color: "#E8E9F0" }}>{post.authorName}</span>
              <span style={{ color: "#8B8FA8", fontSize: 12 }}>· {timeAgo(post.createdAt)}</span>
              <span style={{ color: "#555A78", fontSize: 12 }}>· {post.views || 0} views</span>
            </div>
            <p style={{ lineHeight: 1.8, color: "#BFC2D4", whiteSpace: "pre-wrap", margin: "0 0 22px", fontSize: 14 }}>{post.content}</p>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button onClick={() => onUpvote(post.id)} style={{
                padding: "6px 16px", borderRadius: 7, fontSize: 13, fontWeight: 700, cursor: "pointer",
                background: upvoted ? "#2D2550" : "#181B28",
                color: upvoted ? "#9B7DFC" : "#8B8FA8",
                border: `1px solid ${upvoted ? "#4A3990" : "#252838"}`,
                fontFamily: "inherit", transition: "all 0.15s",
              }}>▲ {post.upvotes}</button>
              <span style={{ color: "#555A78", fontSize: 13 }}>💬 {totalComments} comment{totalComments !== 1 ? "s" : ""}</span>
            </div>
          </Card>

          {/* Comment input */}
          {currentUser ? (
            <Card style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 12 }}>
                <Avatar name={currentUser.username} userId={currentUser.id} />
                <span style={{ fontWeight: 700, fontSize: 13 }}>{currentUser.username}</span>
              </div>
              <TextArea value={commentText} onChange={e => setCommentText(e.target.value)} placeholder="Write a comment..." rows={3} />
              <Btn primary small onClick={submitComment} disabled={!commentText.trim()}>Post Comment</Btn>
            </Card>
          ) : (
            <Card style={{ marginBottom: 14, textAlign: "center", padding: 28 }}>
              <p style={{ color: "#8B8FA8", marginBottom: 0, fontSize: 13 }}>Sign in to join the conversation</p>
            </Card>
          )}

          {/* Comments */}
          {topComments.length === 0 ? (
            <Card style={{ textAlign: "center", padding: 36, color: "#555A78" }}>
              No comments yet — start the discussion!
            </Card>
          ) : topComments.map(comment => {
            const replies = comments.filter(c => c.parentId === comment.id);
            const isReplying = replyTo === comment.id;
            return (
              <Card key={comment.id} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <Avatar name={comment.authorName} userId={comment.authorId} />
                  <div>
                    <span style={{ fontWeight: 700, fontSize: 13 }}>{comment.authorName}</span>
                    <span style={{ color: "#555A78", fontSize: 12, marginLeft: 8 }}>{timeAgo(comment.createdAt)}</span>
                  </div>
                </div>
                <p style={{ color: "#BFC2D4", lineHeight: 1.7, margin: "0 0 12px", fontSize: 14 }}>{comment.content}</p>
                {currentUser && (
                  <Btn ghost small onClick={() => setReplyTo(isReplying ? null : comment.id)}>
                    {isReplying ? "✕ Cancel" : "↩ Reply"}
                  </Btn>
                )}
                {isReplying && (
                  <div style={{ marginTop: 14, paddingLeft: 16, borderLeft: "2px solid #7C5CFC" }}>
                    <TextArea value={replyTexts[comment.id] || ""} onChange={e => setReplyTexts({ ...replyTexts, [comment.id]: e.target.value })}
                      placeholder={`Reply to ${comment.authorName}...`} rows={2} />
                    <div style={{ display: "flex", gap: 8 }}>
                      <Btn primary small onClick={() => submitReply(comment.id)} disabled={!replyTexts[comment.id]?.trim()}>Reply</Btn>
                      <Btn ghost small onClick={() => setReplyTo(null)}>Cancel</Btn>
                    </div>
                  </div>
                )}
                {replies.map(reply => (
                  <div key={reply.id} style={{ marginTop: 14, paddingLeft: 16, borderLeft: "2px solid #1E2132" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <Avatar name={reply.authorName} userId={reply.authorId} />
                      <span style={{ fontWeight: 700, fontSize: 13 }}>{reply.authorName}</span>
                      <span style={{ color: "#555A78", fontSize: 12 }}>{timeAgo(reply.createdAt)}</span>
                    </div>
                    <p style={{ color: "#BFC2D4", lineHeight: 1.7, margin: 0, fontSize: 14 }}>{reply.content}</p>
                  </div>
                ))}
              </Card>
            );
          })}
        </div>

        {/* Sidebar */}
        <div style={{ width: 210, flexShrink: 0 }}>
          <Card>
            <h3 style={{ fontSize: 11, fontWeight: 700, color: "#555A78", marginBottom: 14, textTransform: "uppercase", letterSpacing: 1.2, margin: "0 0 14px" }}>Post Stats</h3>
            {[["Upvotes", post.upvotes, "#9B7DFC"], ["Comments", totalComments, null], ["Views", post.views || 0, null]].map(([k, v, c]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #1E2132" }}>
                <span style={{ color: "#8B8FA8", fontSize: 13 }}>{k}</span>
                <span style={{ fontWeight: 800, fontSize: 15, color: c || "#E8E9F0" }}>{v}</span>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}

// ─── Home View ────────────────────────────────────────────────────────────────

function HomeView({ posts, comments, users, currentUser, onNewPost, onOpenPost, selectedCategory, onSelectCategory }) {
  const filtered = selectedCategory === "All" ? posts : posts.filter(p => p.category === selectedCategory);
  const memberCount = [...new Set([...posts.map(p => p.authorId), ...comments.map(c => c.authorId)])].length;

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 16px" }}>
      <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
        {/* Main */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, color: "#fff", letterSpacing: "-0.4px" }}>
                {selectedCategory === "All" ? "All Discussions" : selectedCategory}
              </h1>
              <p style={{ color: "#555A78", fontSize: 12, margin: "3px 0 0" }}>{filtered.length} post{filtered.length !== 1 ? "s" : ""}</p>
            </div>
            {currentUser
              ? <Btn primary onClick={onNewPost}>+ New Post</Btn>
              : <span style={{ fontSize: 13, color: "#555A78" }}>Sign in to post</span>
            }
          </div>

          {filtered.length === 0 ? (
            <Card style={{ textAlign: "center", padding: 56 }}>
              <div style={{ fontSize: 40, marginBottom: 14, opacity: 0.3 }}>◈</div>
              <p style={{ fontWeight: 700, color: "#fff", marginBottom: 4, margin: "0 0 6px" }}>Nothing here yet</p>
              <p style={{ color: "#555A78", fontSize: 13, margin: 0 }}>Be the first to start a discussion!</p>
            </Card>
          ) : filtered.map(post => {
            const commentCount = comments.filter(c => c.postId === post.id).length;
            return (
              <Card key={post.id} hoverable style={{ marginBottom: 10, padding: "18px 20px" }} onClick={() => onOpenPost(post)}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                  {/* Upvote column */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, paddingTop: 2, minWidth: 32 }}>
                    <span style={{ color: "#9B7DFC", fontSize: 13, fontWeight: 800 }}>▲</span>
                    <span style={{ color: "#9B7DFC", fontSize: 13, fontWeight: 800 }}>{post.upvotes}</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ marginBottom: 8 }}><Badge text={post.category} /></div>
                    <h2 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 6px", color: "#fff", lineHeight: 1.4 }}>{post.title}</h2>
                    <p style={{ color: "#8B8FA8", fontSize: 13, margin: "0 0 12px", lineHeight: 1.5, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                      {post.content}
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Avatar name={post.authorName} userId={post.authorId} />
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#BFC2D4" }}>{post.authorName}</span>
                      <span style={{ color: "#555A78", fontSize: 12 }}>· {timeAgo(post.createdAt)}</span>
                      <span style={{ color: "#555A78", fontSize: 12, marginLeft: "auto" }}>💬 {commentCount}</span>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Sidebar */}
        <div style={{ width: 210, flexShrink: 0 }}>
          <Card style={{ marginBottom: 14 }}>
            <h3 style={{ fontSize: 11, fontWeight: 700, color: "#555A78", textTransform: "uppercase", letterSpacing: 1.2, margin: "0 0 12px" }}>Categories</h3>
            {["All", ...CATEGORIES].map(cat => (
              <div key={cat} onClick={() => onSelectCategory(cat)} style={{
                padding: "8px 10px", borderRadius: 8, cursor: "pointer", marginBottom: 1,
                fontWeight: selectedCategory === cat ? 700 : 400,
                color: selectedCategory === cat ? "#9B7DFC" : "#BFC2D4",
                background: selectedCategory === cat ? "#2D2550" : "transparent",
                fontSize: 13, transition: "all 0.1s",
              }}>{cat}</div>
            ))}
          </Card>
          <Card>
            <h3 style={{ fontSize: 11, fontWeight: 700, color: "#555A78", textTransform: "uppercase", letterSpacing: 1.2, margin: "0 0 14px" }}>Community</h3>
            {[["Members", memberCount || users.length], ["Posts", posts.length], ["Comments", comments.length]].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #1E2132" }}>
                <span style={{ color: "#8B8FA8", fontSize: 13 }}>{k}</span>
                <span style={{ fontWeight: 800, fontSize: 15 }}>{v}</span>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}

// ─── Root App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [users, setUsers] = useState(() => storage.get("f_users", []));
  const [posts, setPosts] = useState(() => storage.get("f_posts", []));
  const [comments, setComments] = useState(() => storage.get("f_comments", []));
  const [currentUser, setCurrentUser] = useState(() => storage.get("f_session", null));
  const [view, setView] = useState("home");
  const [authMode, setAuthMode] = useState("login");
  const [selectedPost, setSelectedPost] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => storage.set("f_users", users), [users]);
  useEffect(() => storage.set("f_posts", posts), [posts]);
  useEffect(() => storage.set("f_comments", comments), [comments]);
  useEffect(() => storage.set("f_session", currentUser), [currentUser]);

  function navigate(to) {
    if (to === "login") setAuthMode("login");
    if (to === "register") setAuthMode("register");
    setView(to);
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0D0F1A", color: "#E8E9F0", fontFamily: "'Inter',-apple-system,BlinkMacSystemFont,sans-serif", fontSize: 14 }}>
      <Navbar currentUser={currentUser} onNavigate={navigate} onLogout={() => { setCurrentUser(null); setView("home"); }} />

      {(view === "login" || view === "register") && (
        <AuthView
          mode={authMode} users={users}
          onLogin={user => { setCurrentUser(user); setView("home"); }}
          onRegister={({ username, email, password }) => {
            const user = { id: Date.now().toString(), username, email, password, createdAt: new Date().toISOString() };
            setUsers(u => [...u, user]); setCurrentUser(user); setView("home");
          }}
          onSwitchMode={() => setAuthMode(m => m === "login" ? "register" : "login")}
        />
      )}

      {view === "home" && (
        <HomeView posts={posts} comments={comments} users={users} currentUser={currentUser}
          onNewPost={() => setView("new-post")}
          onOpenPost={post => {
            setPosts(ps => ps.map(p => p.id === post.id ? { ...p, views: (p.views || 0) + 1 } : p));
            setSelectedPost(post.id); setView("post");
          }}
          selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory}
        />
      )}

      {view === "new-post" && currentUser && (
        <NewPostView currentUser={currentUser}
          onSubmit={post => { setPosts(ps => [post, ...ps]); setSelectedPost(post.id); setView("post"); }}
          onBack={() => setView("home")}
        />
      )}

      {view === "post" && selectedPost && (
        <PostView
          postId={selectedPost} posts={posts} comments={comments} currentUser={currentUser}
          onBack={() => setView("home")}
          onUpvote={postId => {
            if (!currentUser) return;
            setPosts(ps => ps.map(p => {
              if (p.id !== postId) return p;
              const already = (p.upvotedBy || []).includes(currentUser.id);
              return { ...p, upvotes: already ? p.upvotes - 1 : p.upvotes + 1, upvotedBy: already ? p.upvotedBy.filter(id => id !== currentUser.id) : [...(p.upvotedBy || []), currentUser.id] };
            }));
          }}
          onAddComment={comment => setComments(cs => [...cs, comment])}
        />
      )}
    </div>
  );
}
