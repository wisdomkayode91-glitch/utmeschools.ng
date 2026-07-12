/* ============================================================
   UTMESchools v2 — discussion.js
   Community board. Stored in localStorage.
   ============================================================ */

const SUBJ_LIST = [
  { id:'english',name:'English' },{ id:'mathematics',name:'Maths' },
  { id:'physics',name:'Physics' },{ id:'chemistry',name:'Chemistry' },
  { id:'biology',name:'Biology' },{ id:'government',name:'Government' },
  { id:'economics',name:'Economics' },{ id:'literature',name:'Literature' },
  { id:'crk',name:'CRK' },{ id:'irk',name:'IRK' },
  { id:'geography',name:'Geography' },{ id:'commerce',name:'Commerce' },
  { id:'accounts',name:'Accounts' },{ id:'agriculture',name:'Agriculture' },
  { id:'admission',name:'Admission' },
];

let currentFilter = '';
let toastTimer;
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
}
function getUser() { try { return JSON.parse(localStorage.getItem('utme_user')||'null'); } catch(e) { return null; } }
function getComments() { try { return JSON.parse(localStorage.getItem('utme_comments')||'[]'); } catch(e) { return []; } }
function saveComments(c) { localStorage.setItem('utme_comments', JSON.stringify(c)); }

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60)    return 'just now';
  if (diff < 3600)  return Math.floor(diff/60) + 'm ago';
  if (diff < 86400) return Math.floor(diff/3600) + 'h ago';
  return Math.floor(diff/86400) + 'd ago';
}

function initials(name) {
  return (name||'?').split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
}

document.addEventListener('DOMContentLoaded', () => {
  /* Subject filter strip */
  const strip = document.getElementById('subjectFilterStrip');
  SUBJ_LIST.forEach(s => {
    const pill = document.createElement('div');
    pill.className = 'sf-pill';
    pill.dataset.subj = s.id;
    pill.textContent = s.name;
    pill.addEventListener('click', () => {
      document.querySelectorAll('.sf-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentFilter = s.id;
      renderComments();
    });
    strip.appendChild(pill);
  });
  strip.querySelector('[data-subj=""]').addEventListener('click', () => {
    document.querySelectorAll('.sf-pill').forEach(p => p.classList.remove('active'));
    strip.querySelector('[data-subj=""]').classList.add('active');
    currentFilter = '';
    renderComments();
  });

  renderPostArea();
  renderComments();
});

function renderPostArea() {
  const user = getUser();
  const postArea = document.getElementById('postArea');
  if (user) {
    postArea.innerHTML = `
      <div class="post-form">
        <textarea id="postTextarea" placeholder="Ask a question or share tips about JAMB..."></textarea>
        <div class="post-form-row">
          <select class="cr-select" id="postSubject" style="flex:1;">
            <option value="">Select subject</option>
            ${SUBJ_LIST.map(s=>`<option value="${s.id}">${s.name}</option>`).join('')}
          </select>
          <button class="btn btn-primary btn-sm" id="postBtn">Post</button>
        </div>
      </div>`;
    document.getElementById('postBtn').addEventListener('click', postComment);
  } else {
    postArea.innerHTML = `
      <div class="login-prompt">
        <div style="font-size:22px;margin-bottom:8px;">💬</div>
        <div style="font-weight:600;margin-bottom:4px;">Join the discussion</div>
        <div style="font-size:13px;color:var(--ink-soft);margin-bottom:14px;">Log in to ask questions and share tips with other students.</div>
        <a href="auth.html" class="btn btn-primary btn-sm">Log In / Sign Up</a>
      </div>`;
  }
}

function postComment() {
  const user = getUser();
  if (!user) return;
  const text = document.getElementById('postTextarea').value.trim();
  const subj = document.getElementById('postSubject').value;
  if (!text) { showToast('Please write something first.'); return; }
  if (text.length < 10) { showToast('Your message is too short.'); return; }

  const comments = getComments();
  comments.unshift({
    id: 'c_' + Date.now(),
    userId: user.id,
    userName: user.full_name || user.name || 'Student',
    subject: subj,
    body: text,
    likes: 0,
    likedBy: [],
    isHidden: false,
    createdAt: new Date().toISOString(),
  });
  saveComments(comments);
  document.getElementById('postTextarea').value = '';
  showToast('Posted!');
  renderComments();
}

function renderComments() {
  const user = getUser();
  const all  = getComments().filter(c => !c.isHidden);
  const list = currentFilter ? all.filter(c => c.subject === currentFilter) : all;
  const container = document.getElementById('commentsList');

  if (list.length === 0) {
    container.innerHTML = `<div class="empty-state" style="padding-top:40px;">
      <div class="empty-state-icon">💬</div>
      <div class="empty-state-title">No posts yet</div>
      <div class="empty-state-body">Be the first to ask a question or share a tip!</div>
    </div>`;
    return;
  }

  container.innerHTML = '';
  list.forEach(c => {
    const subjLabel = SUBJ_LIST.find(s=>s.id===c.subject)?.name || '';
    const hasLiked  = user && c.likedBy?.includes(user.id);
    const card = document.createElement('div');
    card.className = 'comment-card';
    card.innerHTML = `
      <div class="comment-head">
        <div class="comment-avatar">${initials(c.userName)}</div>
        <div class="comment-meta">
          <div class="comment-name">${c.userName}${subjLabel ? `<span class="comment-subj">${subjLabel}</span>` : ''}</div>
          <div class="comment-time">${timeAgo(c.createdAt)}</div>
        </div>
      </div>
      <div class="comment-body">${c.body}</div>
      <div class="comment-actions">
        <button class="comment-action-btn" data-like="${c.id}">
          ${hasLiked ? '❤️' : '🤍'} ${c.likes || 0}
        </button>
        <button class="comment-action-btn" data-report="${c.id}">🚩 Report</button>
      </div>`;

    card.querySelector('[data-like]').addEventListener('click', () => {
      if (!user) { showToast('Log in to like posts.'); return; }
      const comments = getComments();
      const idx = comments.findIndex(x => x.id === c.id);
      if (idx < 0) return;
      const likedBy = comments[idx].likedBy || [];
      if (likedBy.includes(user.id)) {
        comments[idx].likedBy = likedBy.filter(id => id !== user.id);
        comments[idx].likes = Math.max(0, (comments[idx].likes||0) - 1);
      } else {
        comments[idx].likedBy = [...likedBy, user.id];
        comments[idx].likes = (comments[idx].likes||0) + 1;
      }
      saveComments(comments);
      renderComments();
    });

    card.querySelector('[data-report]').addEventListener('click', () => {
      showToast('Post reported. Thank you.');
    });

    container.appendChild(card);
  });
}
  
