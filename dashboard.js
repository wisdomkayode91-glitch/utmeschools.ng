
# Build discussion.js - Discussion board logic

discussion_js = '''/* ============================================================
   UTMESchools v2 — discussion.js
   Student discussion board.
   Uses localStorage as placeholder until Supabase is connected.
   ============================================================ */

const ALL_SUBJECTS = [
  { id: 'english',     name: 'English Language',       icon: '🔤', bg: '#E8F1FF', fg: '#1F5FBF' },
  { id: 'accounts',    name: 'Accounts',               icon: '🧾', bg: '#E7F8EF', fg: '#0C8C58' },
  { id: 'agriculture', name: 'Agriculture',            icon: '🌾', bg: '#E8F1FF', fg: '#1F5FBF' },
  { id: 'biology',     name: 'Biology',                icon: '🧬', bg: '#F1EAFB', fg: '#6C3FBF' },
  { id: 'chemistry',   name: 'Chemistry',              icon: '⚗️', bg: '#E7F8EF', fg: '#0C8C58' },
  { id: 'commerce',    name: 'Commerce',               icon: '🛒', bg: '#FCE4E4', fg: '#C0392B' },
  { id: 'computer',    name: 'Computer Studies',       icon: '💻', bg: '#E7F8EF', fg: '#0C8C58' },
  { id: 'crk',         name: 'CRK',                    icon: '✝️', bg: '#E8F1FF', fg: '#1F5FBF' },
  { id: 'economics',   name: 'Economics',              icon: '📈', bg: '#FFF4DC', fg: '#A6760A' },
  { id: 'fineart',     name: 'Fine Art',               icon: '🎨', bg: '#FFF4DC', fg: '#A6760A' },
  { id: 'french',      name: 'French',                 icon: '🇫🇷', bg: '#E7F8EF', fg: '#0C8C58' },
  { id: 'geography',   name: 'Geography',              icon: '🌍', bg: '#FFF4DC', fg: '#A6760A' },
  { id: 'government',  name: 'Government',             icon: '🏛️', bg: '#E8F1FF', fg: '#1F5FBF' },
  { id: 'hausa',       name: 'Hausa',                  icon: '📜', bg: '#FCE4E4', fg: '#C0392B' },
  { id: 'history',     name: 'History',                icon: '🏺', bg: '#FCE4E4', fg: '#C0392B' },
  { id: 'homeec',      name: 'Home Economics',         icon: '🏠', bg: '#F1EAFB', fg: '#6C3FBF' },
  { id: 'igbo',        name: 'Igbo',                   icon: '📖', bg: '#E8F1FF', fg: '#1F5FBF' },
  { id: 'irk',         name: 'IRK',                    icon: '☪️', bg: '#F1EAFB', fg: '#6C3FBF' },
  { id: 'literature',  name: 'Literature',             icon: '📚', bg: '#FCE4E4', fg: '#C0392B' },
  { id: 'littext',     name: 'Literature Textbooks',   icon: '📗', bg: '#E7F8EF', fg: '#0C8C58' },
  { id: 'mathematics', name: 'Mathematics',            icon: '📐', bg: '#FFF4DC', fg: '#A6760A' },
  { id: 'music',       name: 'Music',                  icon: '🎵', bg: '#FCE4E4', fg: '#C0392B' },
  { id: 'phe',         name: 'PHE',                    icon: '🏃', bg: '#E7F8EF', fg: '#0C8C58' },
  { id: 'physics',     name: 'Physics',                icon: '⚛️', bg: '#FCE4E4', fg: '#C0392B' },
  { id: 'lekki',       name: 'The Lekki Headmaster',   icon: '📕', bg: '#F1EAFB', fg: '#6C3FBF' },
  { id: 'yoruba',      name: 'Yoruba',                 icon: '🌺', bg: '#FFF4DC', fg: '#A6760A' },
];

function getSubject(id) { return ALL_SUBJECTS.find(s => s.id === id); }

/* ---- localStorage helpers ---- */
function getComments() {
  try { return JSON.parse(localStorage.getItem('utme_comments') || '[]'); }
  catch(e) { return []; }
}
function saveComments(comments) {
  localStorage.setItem('utme_comments', JSON.stringify(comments));
}
function getCurrentUser() {
  try { return JSON.parse(localStorage.getItem('utme_user') || 'null'); }
  catch(e) { return null; }
}

/* ---- Check login state ---- */
const currentUser = getCurrentUser();
const isLoggedIn = !!currentUser;

/* ---- Show/hide comment form based on login ---- */
if (isLoggedIn) {
  document.getElementById('commentForm').style.display = 'block';
  document.getElementById('loginPrompt').style.display = 'none';
} else {
  document.getElementById('commentForm').style.display = 'none';
  document.getElementById('loginPrompt').style.display = 'block';
}

/* ---- Populate subject dropdown and tabs ---- */
function populateSubjects() {
  const select = document.getElementById('commentSubject');
  const tabs = document.getElementById('discTabs');

  ALL_SUBJECTS.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s.id;
    opt.textContent = s.name;
    select.appendChild(opt);

    const tab = document.createElement('button');
    tab.className = 'disc-tab';
    tab.dataset.filter = s.id;
    tab.textContent = s.name;
    tab.addEventListener('click', () => {
      document.querySelectorAll('.disc-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentFilter = s.id;
      renderComments();
    });
    tabs.appendChild(tab);
  });
}

/* ---- Format time ago ---- */
function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  if (hrs < 24) return `${hrs}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' });
}

/* ---- Avatar color from initials ---- */
function avatarColor(name) {
  const colors = ['#1F5FBF','#0C8C58','#C0392B','#6C3FBF','#A6760A','#0B2545','#E2531F'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function initials(name) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

/* ============================================================
   COMMENTS RENDERING
   ============================================================ */
let currentFilter = 'all';

function renderComments() {
  const list = document.getElementById('commentsList');
  let comments = getComments();

  // Filter
  if (currentFilter !== 'all') {
    comments = comments.filter(c => c.subjectId === currentFilter);
  }

  // Sort newest first
  comments.sort((a, b) => new Date(b.date) - new Date(a.date));

  if (comments.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <div class="icon">💬</div>
        <h3>No discussions yet</h3>
        <p>Be the first to start a conversation about JAMB and admission topics.</p>
      </div>
    `;
    return;
  }

  list.innerHTML = '';
  comments.forEach(c => {
    const s = getSubject(c.subjectId);
    const commentEl = document.createElement('div');
    commentEl.className = 'comment';
    commentEl.dataset.id = c.id;

    // Replies
    let repliesHtml = '';
    if (c.replies && c.replies.length > 0) {
      repliesHtml = '<div class="replies">';
      c.replies.forEach(r => {
        repliesHtml += `
          <div class="reply">
            <div class="reply-head">
              <div class="reply-avatar" style="background:${avatarColor(r.author)};">${initials(r.author)}</div>
              <span class="reply-author">${r.author}</span>
              <span class="reply-time">${timeAgo(r.date)}</span>
            </div>
            <div class="reply-body">${escapeHtml(r.body)}</div>
          </div>
        `;
      });
      repliesHtml += '</div>';
    }

    commentEl.innerHTML = `
      <div class="comment-head">
        <div class="comment-avatar" style="background:${avatarColor(c.author)};">${initials(c.author)}</div>
        <div class="comment-meta">
          <div class="comment-author">${escapeHtml(c.author)}</div>
          <div class="comment-time">${timeAgo(c.date)}</div>
        </div>
        <div class="comment-tag">${s?.name || 'General'}</div>
      </div>
      <div class="comment-body">${escapeHtml(c.body)}</div>
      <div class="comment-actions">
        <button class="like-btn ${c.likedBy?.includes(currentUser?.email) ? 'liked' : ''}" data-like="${c.id}">
          👍 ${c.likes || 0}
        </button>
        <button data-reply="${c.id}">💬 Reply</button>
        <button data-report="${c.id}">🚩 Report</button>
      </div>
      <div class="reply-form" id="reply-form-${c.id}">
        <textarea placeholder="Write your reply..."></textarea>
        <div class="reply-form-row">
          <button class="btn btn-ghost btn-sm" data-cancel-reply="${c.id}">Cancel</button>
          <button class="btn btn-primary btn-sm" data-post-reply="${c.id}">Reply</button>
        </div>
      </div>
      ${repliesHtml}
    `;
    list.appendChild(commentEl);
  });

  // Wire like buttons
  list.querySelectorAll('[data-like]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!isLoggedIn) { showToast('Log in to like comments'); return; }
      const id = btn.dataset.like;
      let comments = getComments();
      const c = comments.find(x => x.id === id);
      if (c) {
        if (!c.likedBy) c.likedBy = [];
        if (c.likedBy.includes(currentUser.email)) {
          c.likedBy = c.likedBy.filter(e => e !== currentUser.email);
          c.likes = (c.likes || 1) - 1;
        } else {
          c.likedBy.push(currentUser.email);
          c.likes = (c.likes || 0) + 1;
        }
        saveComments(comments);
        renderComments();
      }
    });
  });

  // Wire reply buttons
  list.querySelectorAll('[data-reply]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!isLoggedIn) { showToast('Log in to reply'); return; }
      const id = btn.dataset.reply;
      document.querySelectorAll('.reply-form').forEach(f => f.classList.remove('open'));
      document.getElementById('reply-form-' + id).classList.add('open');
    });
  });

  list.querySelectorAll('[data-cancel-reply]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById('reply-form-' + btn.dataset.cancelReply).classList.remove('open');
    });
  });

  list.querySelectorAll('[data-post-reply]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.postReply;
      const textarea = document.querySelector('#reply-form-' + id + ' textarea');
      const body = textarea.value.trim();
      if (!body) { showToast('Please write a reply'); return; }

      let comments = getComments();
      const c = comments.find(x => x.id === id);
      if (c) {
        if (!c.replies) c.replies = [];
        c.replies.push({
          author: currentUser.name || currentUser.email,
          body,
          date: new Date().toISOString()
        });
        saveComments(comments);
        renderComments();
        showToast('Reply posted');
      }
    });
  });

  // Wire report buttons
  list.querySelectorAll('[data-report]').forEach(btn => {
    btn.addEventListener('click', () => {
      showToast('Reported. Thank you for keeping the board clean.');
    });
  });
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/* ============================================================
   POST COMMENT
   ============================================================ */
function postComment() {
  if (!isLoggedIn) { showToast('Please log in first'); return; }

  const body = document.getElementById('commentBody').value.trim();
  const subjectId = document.getElementById('commentSubject').value;

  if (!body) { showToast('Please write something'); return; }

  const comments = getComments();
  comments.push({
    id: 'c_' + Date.now(),
    author: currentUser.name || currentUser.email,
    body,
    subjectId,
    date: new Date().toISOString(),
    likes: 0,
    likedBy: [],
    replies: []
  });
  saveComments(comments);

  document.getElementById('commentBody').value = '';
  renderComments();
  showToast('Comment posted');
}

/* ============================================================
   TOAST
   ============================================================ */
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2000);
}

/* ============================================================
   EVENT LISTENERS
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  populateSubjects();
  renderComments();

  // Filter tabs
  document.querySelectorAll('.disc-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.disc-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentFilter = tab.dataset.filter;
      renderComments();
    });
  });

  // Post comment
  document.getElementById('postCommentBtn').addEventListener('click', postComment);
});
'''

with open('/mnt/agents/output/discussion.js', 'w') as f:
    f.write(discussion_js)

print(f"discussion.js written: {len(discussion_js)} chars")
