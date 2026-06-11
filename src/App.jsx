import { useState, useEffect } from "react";

const CATEGORIES = ["General","Tech","Gaming","Art","Music","Sports","News","Off-Topic"];
const CAT_COLORS = { General:"#737888", Tech:"#60A5FA", Gaming:"#A78BFA", Art:"#F472B6", Music:"#34D399", Sports:"#FBBF24", News:"#F87171", "Off-Topic":"#FB923C" };
const AVATAR_COLORS = ["#E8901A","#60A5FA","#34D399","#F472B6","#A78BFA","#F87171","#FBBF24","#FB923C"];

const C = {
  bg:"#0E1014", surface:"#14171D", surface2:"#1A1D25", surface3:"#20242E",
  accent:"#E8901A", accentDim:"#2A1E08", accentText:"#F0A840",
  text:"#E0E2EC", muted:"#6B7080", dim:"#363B4A",
  border:"#1E2128", border2:"#252A35",
  error:"#F87171", success:"#34D399",
};

const AVATAR_COLS = (id) => AVATAR_COLORS[(id?.charCodeAt?.(0)||0) % AVATAR_COLORS.length];
const initials = (n) => (n||"?").split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2);
const ago = (d) => {
  const m = Math.floor((Date.now()-new Date(d).getTime())/60000);
  if (m<1) return "just now"; if (m<60) return `${m}m ago`;
  const h=Math.floor(m/60); if (h<24) return `${h}h ago`;
  return `${Math.floor(h/24)}d ago`;
};

// ─── Shared Storage ───────────────────────────────────────────────────────────
async function sget(key, def) {
  try { const r = await window.storage.get(key, true); return r ? JSON.parse(r.value) : def; }
  catch { return def; }
}
async function sset(key, val) {
  try { await window.storage.set(key, JSON.stringify(val), true); } catch {}
}
const lget = (k,d=null) => { try { return JSON.parse(localStorage.getItem(k))??d; } catch { return d; } };
const lset = (k,v) => { try { localStorage.setItem(k,JSON.stringify(v)); } catch {} };

// ─── UI Atoms ─────────────────────────────────────────────────────────────────
function Avatar({ name, userId, lg }) {
  return (
    <div style={{
      width:lg?40:28, height:lg?40:28, borderRadius:lg?8:5, flexShrink:0,
      background:AVATAR_COLS(userId), display:"flex", alignItems:"center",
      justifyContent:"center", fontSize:lg?15:10, fontWeight:900, color:"#fff",
    }}>{initials(name)}</div>
  );
}

function RoleBadge({ role }) {
  if (!role||role==="member") return null;
  const s = role==="owner" ? {bg:"#2A1A04",c:"#E8901A",t:"OWNER"} : {bg:"#0E1A2E",c:"#60A5FA",t:"MOD"};
  return <span style={{padding:"1px 6px",borderRadius:3,fontSize:9,fontWeight:900,background:s.bg,color:s.c,letterSpacing:0.8}}>{s.t}</span>;
}

function Btn({ children, primary, ghost, danger, small, full, onClick, disabled, style:ex }) {
  const [h,sH]=useState(false);
  return (
    <button disabled={disabled} onClick={onClick} onMouseEnter={()=>sH(true)} onMouseLeave={()=>sH(false)} style={{
      padding:small?"5px 11px":"9px 18px", borderRadius:5, border:"none",
      cursor:disabled?"not-allowed":"pointer", fontWeight:700, fontSize:small?11:13,
      fontFamily:"inherit", transition:"all 0.15s", opacity:disabled?0.4:1, outline:"none",
      width:full?"100%":undefined,
      ...(primary?{background:h?"#CF7F14":C.accent,color:"#fff"}
        :ghost?{background:h?C.surface2:"transparent",color:C.muted,border:`1px solid ${C.border2}`}
        :danger?{background:h?"#4A1414":"#301010",color:"#F87171",border:"1px solid #4A2020"}
        :{background:h?C.surface3:C.surface2,color:C.text}),
      ...ex,
    }}>{children}</button>
  );
}

function Inp({ label, type="text", value, onChange, placeholder, onKeyDown }) {
  const [f,sF]=useState(false);
  return (
    <div style={{marginBottom:14}}>
      {label&&<label style={{display:"block",marginBottom:5,fontSize:10,fontWeight:800,color:C.muted,textTransform:"uppercase",letterSpacing:1}}>{label}</label>}
      <input type={type} value={value} onChange={onChange} placeholder={placeholder} onKeyDown={onKeyDown}
        onFocus={()=>sF(true)} onBlur={()=>sF(false)}
        style={{width:"100%",background:"#090B0F",border:`1px solid ${f?C.accent:C.border2}`,borderRadius:5,padding:"9px 12px",color:C.text,fontSize:13,fontFamily:"inherit",outline:"none",boxSizing:"border-box",transition:"border-color 0.2s"}}
      />
    </div>
  );
}

function TA({ label, value, onChange, placeholder, rows=4 }) {
  const [f,sF]=useState(false);
  return (
    <div style={{marginBottom:14}}>
      {label&&<label style={{display:"block",marginBottom:5,fontSize:10,fontWeight:800,color:C.muted,textTransform:"uppercase",letterSpacing:1}}>{label}</label>}
      <textarea value={value} onChange={onChange} placeholder={placeholder} rows={rows}
        onFocus={()=>sF(true)} onBlur={()=>sF(false)}
        style={{width:"100%",background:"#090B0F",border:`1px solid ${f?C.accent:C.border2}`,borderRadius:5,padding:"9px 12px",color:C.text,fontSize:13,fontFamily:"inherit",outline:"none",resize:"vertical",boxSizing:"border-box",transition:"border-color 0.2s"}}
      />
    </div>
  );
}

function Box({ children, style:ex }) {
  return <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:7,padding:20,...ex}}>{children}</div>;
}

// ─── Page Transition ──────────────────────────────────────────────────────────
function Fade({ children, k }) {
  const [vis,sV]=useState(false);
  useEffect(()=>{ sV(false); const t=setTimeout(()=>sV(true),40); return()=>clearTimeout(t); },[k]);
  return <div style={{opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(10px)",transition:"opacity 0.2s ease,transform 0.2s ease"}}>{children}</div>;
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Navbar({ user, role, go, logout }) {
  return (
    <nav style={{background:"rgba(14,16,20,0.97)",backdropFilter:"blur(12px)",borderBottom:`1px solid ${C.border}`,padding:"0 22px",height:56,display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:100}}>
      <div style={{cursor:"pointer",display:"flex",alignItems:"center",gap:6}} onClick={()=>go("home")}>
        <span style={{fontSize:18,fontWeight:900,letterSpacing:"-1px",color:C.text}}>NEXUS</span>
        <span style={{color:C.accent,fontSize:20,fontWeight:900}}>·</span>
        <span style={{fontSize:18,fontWeight:900,letterSpacing:"-1px",color:C.text}}>FORUMS</span>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        {user ? (
          <>
            <div style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",padding:"4px 8px",borderRadius:5,transition:"background 0.15s"}} onClick={()=>go("settings")}
              onMouseEnter={e=>e.currentTarget.style.background=C.surface2} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              <Avatar name={user.username} userId={user.id} />
              <div>
                <div style={{fontSize:13,fontWeight:700,color:C.text,lineHeight:1.1}}>{user.username}</div>
                {role&&role!=="member"&&<div style={{fontSize:9,color:C.accentText,fontWeight:900,textTransform:"uppercase",letterSpacing:0.8}}>{role}</div>}
              </div>
            </div>
            <Btn ghost small onClick={()=>go("settings")}>⚙ Settings</Btn>
            <Btn ghost small onClick={logout}>Sign Out</Btn>
          </>
        ) : (
          <>
            <Btn ghost small onClick={()=>go("login")}>Sign In</Btn>
            <Btn primary small onClick={()=>go("register")}>Register</Btn>
          </>
        )}
      </div>
    </nav>
  );
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
function Auth({ mode, users, onLogin, onRegister, switchMode }) {
  const [form,sF]=useState({username:"",email:"",password:""});
  const [err,sE]=useState(""); const [loading,sL]=useState(false);
  async function go() {
    sE(""); sL(true);
    if (mode==="register") {
      if (!form.username.trim()||!form.email.trim()||!form.password){sE("All fields required.");sL(false);return;}
      if (users.find(u=>u.email===form.email)){sE("Email already registered.");sL(false);return;}
      await onRegister(form);
    } else {
      const u=users.find(u=>u.email===form.email&&u.password===form.password);
      if (!u){sE("Wrong email or password.");sL(false);return;}
      onLogin(u);
    }
    sL(false);
  }
  return (
    <div style={{maxWidth:380,margin:"68px auto",padding:"0 16px"}}>
      <h2 style={{fontSize:24,fontWeight:900,margin:"0 0 2px",color:C.text,letterSpacing:"-0.8px"}}>{mode==="login"?"Sign in":"Create account"}</h2>
      <p style={{color:C.muted,fontSize:13,margin:"0 0 24px"}}>{mode==="login"?"Welcome back":"Join the community"}</p>
      <Box style={{padding:24}}>
        {mode==="register"&&<Inp label="Username" value={form.username} onChange={e=>sF({...form,username:e.target.value})} placeholder="username"/>}
        <Inp label="Email" type="email" value={form.email} onChange={e=>sF({...form,email:e.target.value})} placeholder="you@example.com"/>
        <Inp label="Password" type="password" value={form.password} onChange={e=>sF({...form,password:e.target.value})} placeholder="••••••••" onKeyDown={e=>e.key==="Enter"&&go()}/>
        {err&&<p style={{color:C.error,fontSize:12,margin:"-4px 0 12px"}}>⚠ {err}</p>}
        <Btn primary full onClick={go} disabled={loading}>{loading?"…":mode==="login"?"Sign In":"Create Account"}</Btn>
        <div style={{borderTop:`1px solid ${C.border}`,margin:"16px 0"}}/>
        <p style={{color:C.muted,fontSize:13,textAlign:"center",margin:0}}>
          {mode==="login"?"No account? ":"Have an account? "}
          <span style={{color:C.accentText,cursor:"pointer",fontWeight:700}} onClick={switchMode}>{mode==="login"?"Register":"Sign in"}</span>
        </p>
      </Box>
    </div>
  );
}

// ─── Settings ─────────────────────────────────────────────────────────────────
function Settings({ user, users, roles, back, updateUser, updateRole }) {
  const [uname,sU]=useState(user.username);
  const [pw,sP]=useState({cur:"",new_:"",conf:""});
  const [uMsg,sUM]=useState(""); const [pMsg,sPM]=useState("");
  const myRole=roles[user.id]||"member";

  function saveUser() {
    if (!uname.trim()){sUM("Can't be empty.");return;}
    updateUser({...user,username:uname.trim()}); sUM("✓ Saved!");
  }
  function savePw() {
    if (pw.cur!==user.password){sPM("Current password wrong.");return;}
    if (pw.new_.length<4){sPM("Too short.");return;}
    if (pw.new_!==pw.conf){sPM("Passwords don't match.");return;}
    updateUser({...user,password:pw.new_}); sPM("✓ Updated!"); sP({cur:"",new_:"",conf:""});
  }

  return (
    <div style={{maxWidth:660,margin:"0 auto",padding:"28px 16px"}}>
      <Btn ghost onClick={back} style={{marginBottom:18}}>← Back</Btn>
      <h2 style={{fontSize:20,fontWeight:900,margin:"0 0 20px",letterSpacing:"-0.4px"}}>Settings</h2>

      <Box style={{marginBottom:12}}>
        <div style={{fontSize:10,fontWeight:800,color:C.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:14}}>Profile</div>
        <Inp label="Username" value={uname} onChange={e=>sU(e.target.value)}/>
        {uMsg&&<p style={{color:uMsg.includes("✓")?C.success:C.error,fontSize:12,margin:"-4px 0 10px"}}>{uMsg}</p>}
        <Btn primary small onClick={saveUser}>Save</Btn>
      </Box>

      <Box style={{marginBottom:12}}>
        <div style={{fontSize:10,fontWeight:800,color:C.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:14}}>Change Password</div>
        <Inp label="Current" type="password" value={pw.cur} onChange={e=>sP({...pw,cur:e.target.value})} placeholder="••••••••"/>
        <Inp label="New" type="password" value={pw.new_} onChange={e=>sP({...pw,new_:e.target.value})} placeholder="••••••••"/>
        <Inp label="Confirm" type="password" value={pw.conf} onChange={e=>sP({...pw,conf:e.target.value})} placeholder="••••••••"/>
        {pMsg&&<p style={{color:pMsg.includes("✓")?C.success:C.error,fontSize:12,margin:"-4px 0 10px"}}>{pMsg}</p>}
        <Btn primary small onClick={savePw}>Update Password</Btn>
      </Box>

      {myRole==="owner"&&(
        <Box>
          <div style={{fontSize:10,fontWeight:800,color:C.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>Manage Moderators</div>
          <p style={{color:C.muted,fontSize:12,margin:"0 0 14px"}}>Mods can delete any post or comment.</p>
          {users.filter(u=>u.id!==user.id).length===0&&<p style={{color:C.dim,fontSize:13}}>No other members yet.</p>}
          {users.filter(u=>u.id!==user.id).map(u=>{
            const r=roles[u.id]||"member";
            return (
              <div key={u.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 0",borderBottom:`1px solid ${C.border}`}}>
                <div style={{display:"flex",alignItems:"center",gap:9}}>
                  <Avatar name={u.username} userId={u.id}/>
                  <span style={{fontWeight:700,fontSize:13}}>{u.username}</span>
                  <RoleBadge role={r}/>
                </div>
                <Btn small danger={r==="moderator"} primary={r!=="moderator"} onClick={()=>updateRole(u.id,r==="moderator"?"member":"moderator")}>
                  {r==="moderator"?"Remove Mod":"Make Mod"}
                </Btn>
              </div>
            );
          })}
        </Box>
      )}
    </div>
  );
}

// ─── Home ─────────────────────────────────────────────────────────────────────
function Home({ posts, comments, user, roles, newPost, openPost, cat, setCat, delPost }) {
  const filtered = cat==="All" ? posts : posts.filter(p=>p.category===cat);
  const myRole = user?(roles[user.id]||"member"):null;
  const canDel = (p) => user&&(user.id===p.authorId||myRole==="owner"||myRole==="moderator");

  return (
    <div style={{maxWidth:1040,margin:"0 auto",padding:"28px 16px"}}>
      <div style={{display:"flex",gap:20,alignItems:"flex-start"}}>
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18}}>
            <div>
              <h1 style={{fontSize:19,fontWeight:900,margin:0,letterSpacing:"-0.4px"}}>{cat==="All"?"All Discussions":cat}</h1>
              <p style={{color:C.dim,fontSize:11,margin:"2px 0 0"}}>{filtered.length} post{filtered.length!==1?"s":""}</p>
            </div>
            {user?<Btn primary onClick={newPost}>+ New Post</Btn>:<span style={{color:C.dim,fontSize:12}}>Sign in to post</span>}
          </div>

          {filtered.length===0?(
            <Box style={{textAlign:"center",padding:52}}>
              <p style={{fontWeight:800,color:C.text,margin:"0 0 4px"}}>Nothing here yet</p>
              <p style={{color:C.muted,fontSize:12,margin:0}}>Start the first discussion!</p>
            </Box>
          ):filtered.map(post=>{
            const cc=comments.filter(c=>c.postId===post.id).length;
            const col=CAT_COLORS[post.category]||C.muted;
            return (
              <div key={post.id} style={{
                background:C.surface,border:`1px solid ${C.border}`,borderRadius:7,
                marginBottom:6,display:"flex",overflow:"hidden",cursor:"pointer",transition:"border-color 0.15s,background 0.15s",
              }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=C.border2;e.currentTarget.style.background=C.surface2;}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.background=C.surface;}}
                onClick={()=>openPost(post)}
              >
                <div style={{width:3,background:col,flexShrink:0}}/>
                <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"14px 12px",minWidth:46,gap:1}}>
                  <span style={{color:C.accent,fontSize:10}}>▲</span>
                  <span style={{color:C.accentText,fontSize:12,fontWeight:900}}>{post.upvotes}</span>
                </div>
                <div style={{flex:1,padding:"13px 12px 13px 0",minWidth:0}}>
                  <h2 style={{fontSize:14,fontWeight:700,margin:"0 0 4px",color:C.text,lineHeight:1.4}}>{post.title}</h2>
                  <p style={{color:C.muted,fontSize:12,margin:"0 0 10px",lineHeight:1.5,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:1,WebkitBoxOrient:"vertical"}}>{post.content}</p>
                  <div style={{display:"flex",alignItems:"center",gap:7}}>
                    <Avatar name={post.authorName} userId={post.authorId}/>
                    <span style={{fontSize:11,fontWeight:700,color:C.muted}}>{post.authorName}</span>
                    <RoleBadge role={roles[post.authorId]}/>
                    <span style={{color:C.dim,fontSize:11}}>· {ago(post.createdAt)}</span>
                    <span style={{color:C.dim,fontSize:11}}>💬 {cc}</span>
                    <span style={{color:C.dim,fontSize:11}}>· {post.views||0} views</span>
                    {canDel(post)&&<button onClick={e=>{e.stopPropagation();delPost(post.id);}} style={{marginLeft:"auto",background:"none",border:"none",color:C.dim,cursor:"pointer",fontSize:12,padding:"2px 5px"}}>🗑</button>}
                  </div>
                </div>
                <div style={{display:"flex",alignItems:"center",padding:"0 14px",flexShrink:0}}>
                  <span style={{fontSize:9,fontWeight:900,color:col,textTransform:"uppercase",letterSpacing:0.8}}>{post.category}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{width:190,flexShrink:0}}>
          <Box style={{marginBottom:12,padding:14}}>
            <div style={{fontSize:9,fontWeight:900,color:C.dim,textTransform:"uppercase",letterSpacing:1.2,marginBottom:10}}>Categories</div>
            {["All",...CATEGORIES].map(c=>(
              <div key={c} onClick={()=>setCat(c)} style={{
                padding:"6px 8px",borderRadius:4,cursor:"pointer",marginBottom:1,
                fontWeight:cat===c?700:400, color:cat===c?C.accentText:C.muted,
                background:cat===c?C.accentDim:"transparent", fontSize:13,
                borderLeft:cat===c?`2px solid ${C.accent}`:"2px solid transparent",
                transition:"all 0.1s",
              }}>{c}</div>
            ))}
          </Box>
          <Box style={{padding:14}}>
            <div style={{fontSize:9,fontWeight:900,color:C.dim,textTransform:"uppercase",letterSpacing:1.2,marginBottom:10}}>Stats</div>
            {[["Posts",posts.length],["Comments",comments.length]].map(([k,v])=>(
              <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:`1px solid ${C.border}`}}>
                <span style={{color:C.muted,fontSize:12}}>{k}</span>
                <span style={{fontWeight:900,fontSize:13}}>{v}</span>
              </div>
            ))}
          </Box>
        </div>
      </div>
    </div>
  );
}

// ─── New Post ─────────────────────────────────────────────────────────────────
function NewPost({ user, submit, back }) {
  const [f,sF]=useState({title:"",content:"",category:"General"});
  const [err,sE]=useState("");
  function go(){
    if(!f.title.trim()||!f.content.trim()){sE("Title and content required.");return;}
    submit({...f,authorId:user.id,authorName:user.username,id:Date.now().toString(),createdAt:new Date().toISOString(),upvotes:0,upvotedBy:[],views:0});
  }
  return (
    <div style={{maxWidth:660,margin:"0 auto",padding:"28px 16px"}}>
      <Btn ghost onClick={back} style={{marginBottom:18}}>← Back</Btn>
      <Box style={{padding:24}}>
        <h2 style={{fontSize:19,fontWeight:900,margin:"0 0 18px",letterSpacing:"-0.4px"}}>New Post</h2>
        <Inp label="Title" value={f.title} onChange={e=>sF({...f,title:e.target.value})} placeholder="What's your topic?"/>
        <div style={{marginBottom:14}}>
          <label style={{display:"block",marginBottom:5,fontSize:10,fontWeight:800,color:C.muted,textTransform:"uppercase",letterSpacing:1}}>Category</label>
          <select value={f.category} onChange={e=>sF({...f,category:e.target.value})}
            style={{width:"100%",background:"#090B0F",border:`1px solid ${C.border2}`,borderRadius:5,padding:"9px 12px",color:C.text,fontSize:13,fontFamily:"inherit",outline:"none"}}>
            {CATEGORIES.map(c=><option key={c}>{c}</option>)}
          </select>
        </div>
        <TA label="Content" value={f.content} onChange={e=>sF({...f,content:e.target.value})} placeholder="Write your post…" rows={7}/>
        {err&&<p style={{color:C.error,fontSize:12,margin:"-4px 0 10px"}}>⚠ {err}</p>}
        <div style={{display:"flex",gap:8}}><Btn primary onClick={go}>Publish</Btn><Btn ghost onClick={back}>Cancel</Btn></div>
      </Box>
    </div>
  );
}

// ─── Post View ────────────────────────────────────────────────────────────────
function PostView({ postId, posts, comments, user, roles, back, upvote, addComment, delComment }) {
  const [txt,sT]=useState(""); const [replyTo,sRT]=useState(null); const [rTxts,sRTx]=useState({});
  const post=posts.find(p=>p.id===postId); if(!post) return null;
  const myRole=user?(roles[user.id]||"member"):null;
  const canDel=(aId)=>user&&(user.id===aId||myRole==="owner"||myRole==="moderator");
  const up=user&&(post.upvotedBy||[]).includes(user.id);
  const top=comments.filter(c=>c.postId===postId&&!c.parentId);
  const total=comments.filter(c=>c.postId===postId).length;
  const col=CAT_COLORS[post.category]||C.muted;

  return (
    <div style={{maxWidth:1040,margin:"0 auto",padding:"28px 16px"}}>
      <Btn ghost onClick={back} style={{marginBottom:18}}>← Back</Btn>
      <div style={{display:"flex",gap:20,alignItems:"flex-start"}}>
        <div style={{flex:1,minWidth:0}}>
          <Box style={{marginBottom:10,overflow:"hidden",padding:0}}>
            <div style={{height:3,background:col}}/>
            <div style={{padding:22}}>
              <span style={{fontSize:9,fontWeight:900,color:col,textTransform:"uppercase",letterSpacing:1.2}}>{post.category}</span>
              <h1 style={{fontSize:22,fontWeight:900,margin:"10px 0 12px",color:C.text,letterSpacing:"-0.6px",lineHeight:1.3}}>{post.title}</h1>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16}}>
                <Avatar name={post.authorName} userId={post.authorId}/>
                <span style={{fontWeight:700,fontSize:13}}>{post.authorName}</span>
                <RoleBadge role={roles[post.authorId]}/>
                <span style={{color:C.dim,fontSize:12}}>· {ago(post.createdAt)} · {post.views||0} views</span>
              </div>
              <p style={{lineHeight:1.8,color:"#B8BBC8",whiteSpace:"pre-wrap",margin:"0 0 18px",fontSize:14}}>{post.content}</p>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <button onClick={()=>upvote(post.id)} style={{
                  padding:"5px 13px",borderRadius:5,fontSize:12,fontWeight:800,cursor:"pointer",fontFamily:"inherit",
                  background:up?C.accentDim:C.surface2, color:up?C.accentText:C.muted,
                  border:`1px solid ${up?"#5A3810":C.border2}`, transition:"all 0.15s",
                }}>▲ {post.upvotes}</button>
                <span style={{color:C.dim,fontSize:12}}>💬 {total} comment{total!==1?"s":""}</span>
              </div>
            </div>
          </Box>

          {user?(
            <Box style={{marginBottom:10,padding:16}}>
              <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
                <Avatar name={user.username} userId={user.id}/>
                <div style={{flex:1}}>
                  <TA value={txt} onChange={e=>sT(e.target.value)} placeholder="Write a comment…" rows={2}/>
                  <Btn primary small onClick={()=>{if(!txt.trim())return;addComment({id:Date.now().toString(),postId,authorId:user.id,authorName:user.username,content:txt,createdAt:new Date().toISOString(),parentId:null});sT("");}} disabled={!txt.trim()}>Post Comment</Btn>
                </div>
              </div>
            </Box>
          ):(
            <Box style={{marginBottom:10,textAlign:"center",padding:18}}>
              <span style={{color:C.muted,fontSize:13}}>Sign in to comment</span>
            </Box>
          )}

          {top.length===0?<Box style={{textAlign:"center",padding:30,color:C.dim}}>No comments yet</Box>
          :top.map(c=>{
            const replies=comments.filter(r=>r.parentId===c.id);
            const ir=replyTo===c.id;
            return (
              <Box key={c.id} style={{marginBottom:8,padding:16}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                  <Avatar name={c.authorName} userId={c.authorId}/>
                  <span style={{fontWeight:700,fontSize:13}}>{c.authorName}</span>
                  <RoleBadge role={roles[c.authorId]}/>
                  <span style={{color:C.dim,fontSize:11}}>{ago(c.createdAt)}</span>
                  {canDel(c.authorId)&&<button onClick={()=>delComment(c.id)} style={{marginLeft:"auto",background:"none",border:"none",color:C.dim,cursor:"pointer",fontSize:11}}>🗑</button>}
                </div>
                <p style={{color:"#B8BBC8",lineHeight:1.7,margin:"0 0 10px",fontSize:13}}>{c.content}</p>
                {user&&<Btn ghost small onClick={()=>sRT(ir?null:c.id)}>{ir?"Cancel":"↩ Reply"}</Btn>}
                {ir&&(
                  <div style={{marginTop:12,paddingLeft:14,borderLeft:`2px solid ${C.accent}`}}>
                    <TA value={rTxts[c.id]||""} onChange={e=>sRTx({...rTxts,[c.id]:e.target.value})} placeholder={`Reply to ${c.authorName}…`} rows={2}/>
                    <div style={{display:"flex",gap:8}}>
                      <Btn primary small onClick={()=>{if(!(rTxts[c.id]||"").trim())return;addComment({id:(Date.now()+Math.random()).toString(),postId,authorId:user.id,authorName:user.username,content:rTxts[c.id],createdAt:new Date().toISOString(),parentId:c.id});sRTx({...rTxts,[c.id]:""});sRT(null);}}>Reply</Btn>
                      <Btn ghost small onClick={()=>sRT(null)}>Cancel</Btn>
                    </div>
                  </div>
                )}
                {replies.map(r=>(
                  <div key={r.id} style={{marginTop:12,paddingLeft:14,borderLeft:`2px solid ${C.border2}`}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                      <Avatar name={r.authorName} userId={r.authorId}/>
                      <span style={{fontWeight:700,fontSize:13}}>{r.authorName}</span>
                      <RoleBadge role={roles[r.authorId]}/>
                      <span style={{color:C.dim,fontSize:11}}>{ago(r.createdAt)}</span>
                      {canDel(r.authorId)&&<button onClick={()=>delComment(r.id)} style={{marginLeft:"auto",background:"none",border:"none",color:C.dim,cursor:"pointer",fontSize:11}}>🗑</button>}
                    </div>
                    <p style={{color:"#B8BBC8",lineHeight:1.7,margin:0,fontSize:13}}>{r.content}</p>
                  </div>
                ))}
              </Box>
            );
          })}
        </div>
        <div style={{width:190,flexShrink:0}}>
          <Box style={{padding:14}}>
            <div style={{fontSize:9,fontWeight:900,color:C.dim,textTransform:"uppercase",letterSpacing:1.2,marginBottom:10}}>Post Stats</div>
            {[["Upvotes",post.upvotes,C.accentText],["Comments",total,null],["Views",post.views||0,null]].map(([k,v,c])=>(
              <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${C.border}`}}>
                <span style={{color:C.muted,fontSize:12}}>{k}</span>
                <span style={{fontWeight:900,color:c||C.text}}>{v}</span>
              </div>
            ))}
          </Box>
        </div>
      </div>
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [users,sUsers]=useState([]);
  const [posts,sPosts]=useState([]);
  const [comments,sCom]=useState([]);
  const [roles,sRoles]=useState({});
  const [user,sUser]=useState(null);
  const [view,sView]=useState("home");
  const [authMode,sAM]=useState("login");
  const [selPost,sSel]=useState(null);
  const [cat,sCat]=useState("All");
  const [ready,sReady]=useState(false);

  useEffect(()=>{
    async function init(){
      const [u,p,c,r]=await Promise.all([sget("f_users",[]),sget("f_posts",[]),sget("f_comments",[]),sget("f_roles",{})]);
      sUsers(u);sPosts(p);sCom(c);sRoles(r);
      const sid=lget("f_sid");
      if(sid){const found=u.find(x=>x.id===sid);if(found)sUser(found);}
      sReady(true);
    }
    init();
    const poll=setInterval(async()=>{
      const [u,p,c,r]=await Promise.all([sget("f_users",[]),sget("f_posts",[]),sget("f_comments",[]),sget("f_roles",{})]);
      sUsers(u);sPosts(p);sCom(c);sRoles(r);
      sUser(cu=>cu?(u.find(x=>x.id===cu.id)||cu):null);
    },8000);
    return()=>clearInterval(poll);
  },[]);

  const go=(v)=>sView(v);

  async function reg({username,email,password}){
    const first=users.length===0;
    const u={id:Date.now().toString(),username,email,password,createdAt:new Date().toISOString()};
    const nu=[...users,u]; const nr={...roles,[u.id]:first?"owner":"member"};
    sUsers(nu);sRoles(nr);sUser(u);lset("f_sid",u.id);
    await Promise.all([sset("f_users",nu),sset("f_roles",nr)]);
    go("home");
  }

  async function updUser(u){
    const nu=users.map(x=>x.id===u.id?u:x);
    sUsers(nu);sUser(u);await sset("f_users",nu);
  }

  async function updRole(uid,role){
    const nr={...roles,[uid]:role};sRoles(nr);await sset("f_roles",nr);
  }

  async function createPost(p){
    const np=[p,...posts];sPosts(np);await sset("f_posts",np);sSel(p.id);go("post");
  }

  async function delPost(id){
    const np=posts.filter(p=>p.id!==id); const nc=comments.filter(c=>c.postId!==id);
    sPosts(np);sCom(nc);await Promise.all([sset("f_posts",np),sset("f_comments",nc)]);
  }

  async function upvote(id){
    if(!user)return;
    const np=posts.map(p=>{
      if(p.id!==id)return p;
      const a=(p.upvotedBy||[]).includes(user.id);
      return{...p,upvotes:a?p.upvotes-1:p.upvotes+1,upvotedBy:a?p.upvotedBy.filter(x=>x!==user.id):[...(p.upvotedBy||[]),user.id]};
    });
    sPosts(np);await sset("f_posts",np);
  }

  async function addCom(c){
    const nc=[...comments,c];sCom(nc);await sset("f_comments",nc);
  }

  async function delCom(id){
    const nc=comments.filter(c=>c.id!==id&&c.parentId!==id);sCom(nc);await sset("f_comments",nc);
  }

  async function openPost(p){
    const np=posts.map(x=>x.id===p.id?{...x,views:(x.views||0)+1}:x);
    sPosts(np);await sset("f_posts",np);sSel(p.id);go("post");
  }

  if(!ready) return (
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <span style={{color:C.muted,fontSize:13,letterSpacing:2}}>LOADING…</span>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:C.bg,color:C.text,fontFamily:"'Inter',-apple-system,BlinkMacSystemFont,sans-serif",fontSize:14}}>
      <Navbar user={user} role={user?roles[user.id]:null} go={v=>{if(v==="login")sAM("login");if(v==="register")sAM("register");go(v);}}
        logout={()=>{sUser(null);lset("f_sid",null);go("home");}}/>
      <Fade k={view}>
        {(view==="login"||view==="register")&&<Auth mode={authMode} users={users}
          onLogin={u=>{sUser(u);lset("f_sid",u.id);go("home");}}
          onRegister={reg} switchMode={()=>sAM(m=>m==="login"?"register":"login")}/>}
        {view==="home"&&<Home posts={posts} comments={comments} user={user} roles={roles}
          newPost={()=>go("new-post")} openPost={openPost} cat={cat} setCat={sCat} delPost={delPost}/>}
        {view==="new-post"&&user&&<NewPost user={user} submit={createPost} back={()=>go("home")}/>}
        {view==="post"&&selPost&&<PostView postId={selPost} posts={posts} comments={comments} user={user} roles={roles}
          back={()=>go("home")} upvote={upvote} addComment={addCom} delComment={delCom}/>}
        {view==="settings"&&user&&<Settings user={user} users={users} roles={roles}
          back={()=>go("home")} updateUser={updUser} updateRole={updRole}/>}
      </Fade>
    </div>
  );
}
