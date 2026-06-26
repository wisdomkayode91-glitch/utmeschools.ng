/* ============================================================
   UTMESchools v2 — discussion.js
   Student discussion board. Scoped to exam/admission topics only.
   ============================================================ */

const SUBJECT_TAGS = {
  all: 'All topics', jamb: 'JAMB/UTME', admission: 'Admission',
  postutme: 'Post-UTME', study: 'Study tips',
};

const TAG_COLORS = {
  jamb: '#E8F1FF', admission: '#E7F8EF', postutme: '#FFF4DC', study: '#F1EAFB',
};

const TAG_FG = {
  jamb: '#1F5FBF', admission: '#0C8C58', postutme: '#A6760A', study: '#6C3FBF',
};

let currentFilter = 'all';
let reportingCommentId = null;

/* ================================================================
   INIT
   ================================================================ */
document.addEventListener('DOMContentLoaded', () => {
  checkLoginState();
  initFilters();
  initComposer();
  initReportModal();
  renderComments();
});

/* ================================================================
   LOGIN STATE (placeholder until Supabase auth is wired)
   ================================================================ */
function isLoggedIn(){
  return localStorage.getItem('utme_user') !== null;
}

function getCurrentUser(){
  try {
    return JSON.parse(localStorage.getItem('utme_user') || '{}');
  } catch(e) { return {}; }
}

function checkLoginState(){
  const loggedIn = isLoggedIn();
  document.getElementById('loginPrompt').style.display = loggedIn ? 'none' : 'block';
  document.getElementById('composer').style.display = loggedIn ? 'block' : 'none';
}

/* ================================================================
   COMMENTS STORAGE
   ================================================================ */
function getComments(){
  try {
    const raw = localStorage.getItem('utme_comments');
    return raw ? JSON.parse(raw) : [];
  } catch(e) { return []; }
}

function saveComments(comments){
  localStorage.setItem('utme_comments', JSON.stringify(comments));
}

function addComment(body, subjectTag){
  const user = getCurrentUser();
  const comments = getComments();
  const comment = {
    id: 'c_' + Date.now(),
    userId: user.email || 'guest',
    userName: user.full_name || 'Anonymous',
    subjectTag: subjectTag || 'jamb',
    body: body.trim(),
    likes: 0,
    likedBy: [],
    replies: [],
    isHidden: false,
    createdAt: new Date().toISOString(),
  };
  comments.unshift(comment);
  saveComments(comments);
  return comment;
}

function addReply(parentId, body){
  const user = getCurrentUser();
  const comments = getComments();
  const parent = comments.find(c => c.id === parentId);
  if (!parent) return;
  parent.replies.push({
    id: 'r_' + Date.now(),
    userId: user.email || 'guest',
    userName: user.full_name || 'Anonymous',
    body: body.trim(),
    createdAt: new Date().toISOString(),
  });
  saveComments(comments);
}

function likeComment(id){
  const user = getCurrentUser();
  const userId = user.email || 'guest';
  const comments = getComments();
  const c = comments.find(x => x.id === id);
  if (!c) return;
  if (c.likedBy.includes(userId)){
    c.likes--;
    c.likedBy = c.likedBy.filter(u => u !== userId);
  } else {
    c.likes++;
    c.likedBy.push(userId);
  }
  saveComments(comments);
  renderComments();
}

function hideComment(id){
  const comments = getComments();
  const c = comments.find(x => x.id === id);
  if (c) { c.isHidden = true; saveComments(comments); renderComments(); }
}

function reportComment(id, reason){
  // In real version, this sends to admin panel. For now, just hide locally.
  showToast('Reported. Admin will review.');
  hideComment(id);
}

/* ================================================================
   FILTERS
   ================================================================ */
function initFilters(){
  document.getElementById('subjFilter').addEventListener('click', e => {
    const chip = e.target.closest('.subj-chip');
    if (!chip) return;
    document.querySelectorAll('.subj-chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    currentFilter = chip.dataset.filter;
    renderComments();
  });
}

/* ================================================================
   COMPOSER
   ================================================================ */
function initComposer(){
  const input = document.getElementById('commentInput');
  const btn = document.getElementById('postBtn');

  btn.addEventListener('click', () => postComment());
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey){
      e.preventDefault();
      postComment();
    }
  });
}

function postComment(){
  const input = document.getElementById('commentInput');
  const body = input.value.trim();
  if (!body) return;
  if (body.length < 5){
    showToast('Comment too short');
    return;
  }
  addComment(body, currentFilter === 'all' ? 'jamb' : currentFilter);
  input.value = '';
  renderComments();
  showToast('Posted!');
}

/* ================================================================
   REPORT MODAL
   ================================================================ */
function initReportModal(){
  const overlay = document.getElementById('reportOverlay');
  document.getElementById('reportCancelBtn').addEventListener('click', closeReport);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeReport(); });

  overlay.querySelectorAll('.report-option').forEach(btn => {
    btn.addEventListener('click', () => {
      if (reportingCommentId){
        reportComment(reportingCommentId, btn.dataset.reason);
        reportingCommentId = null;
      }
      closeReport();
    });
  });
}

function openReport(id){
  reportingCommentId = id;
  document.getElementById('reportOverlay').classList.add('open');
}

function closeReport(){
  document.getElementById('reportOverlay').classList.remove('open');
  reportingCommentId = null;
}

/* ================================================================
   RENDER
   ================================================================ */
function renderComments(){
  const container = document.getElementById('commentList');
  let comments = getComments().filter(c => !c.isHidden);

  if (currentFilter !== 'all'){
    comments = comments.filter(c => c.subjectTag === currentFilter);
  }

  if (comments.length === 0){
    container.innerHTML = `
      <div class="empty-state">
        <div class="es-icon">💬</div>
        <h3>No discussions yet</h3>
        <p>Be the first to ask a question or share advice about JAMB, Post-UTME, or admission.</p>
      </div>`;
    return;
  }

  container.innerHTML = '';
  comments.forEach(c => {
    const card = document.createElement('div');
    card.className = 'comment-card';
    card.innerHTML = buildCommentHtml(c);
    container.appendChild(card);
  });

  // Wire like buttons
  container.querySelectorAll('.like-btn').forEach(btn => {
    btn.addEventListener('click', () => likeComment(btn.dataset.id));
  });

  // Wire reply buttons
  container.querySelectorAll('.reply-btn').forEach(btn => {
    btn.addEventListener('click', () => toggleReplyForm(btn.dataset.id));
  });

  // Wire report buttons
  container.querySelectorAll('.report-btn').forEach(btn => {
    btn.addEventListener('click', () => openReport(btn.dataset.id));
  });

  // Wire reply submit buttons
  container.querySelectorAll('.reply-submit-btn').forEach(btn => {
    btn.addEventListener('click', () => submitReply(btn.dataset.id));
  });
}

function buildCommentHtml(c){
  const user = getCurrentUser();
  const userId = user.email || 'guest';
  const hasLiked = c.likedBy && c.likedBy.includes(userId);
  const timeAgo = formatTimeAgo(new Date(c.createdAt));
  const tagBg = TAG_COLORS[c.subjectTag] || '#E8F1FF';
  const tagFg = TAG_FG[c.subjectTag] || '#1F5FBF';

  let html = `
    <div class="comment-head">
      <div class="comment-avatar">${getInitials(c.userName)}</div>
      <div class="comment-meta">
        <div class="comment-user">${escHtml(c.userName)}</div>
        <div class="comment-time">${timeAgo}</div>
      </div>
      <div class="comment-subject-tag" style="background:${tagBg};color:${tagFg};">${SUBJECT_TAGS[c.subjectTag] || c.subjectTag}</div>
    </div>
    <div class="comment-body">${escHtml(c.body)}</div>
    <div class="comment-actions">
      <button class="comment-action like-btn ${hasLiked ? 'liked' : ''}" data-id="${c.id}">
        ${hasLiked ? '❤️' : '🤍'} ${c.likes || 0}
      </button>
      <button class="comment-action reply-btn" data-id="${c.id}">💬 Reply</button>
      <button class="comment-action report-btn" data-id="${c.id}">🚩 Report</button>
    </div>
    <div class="reply-form" id="reply-form-${c.id}" style="display:none;margin-top:10px;">
      <div class="composer-inner">
        <textarea class="composer-input" id="reply-input-${c.id}" placeholder="Write a reply..." rows="1" style="font-size:12px;"></textarea>
        <button class="composer-btn reply-submit-btn" data-id="${c.id}" style="width:36px;height:36px;font-size:14px;">➤</button>
      </div>
    </div>
  `;

  // Replies
  if (c.replies && c.replies.length > 0){
    html += `<div class="replies-wrap">`;
    c.replies.forEach(r => {
      html += `
        <div class="reply-card">
          <div class="reply-head">
            <div class="reply-avatar">${getInitials(r.userName)}</div>
            <span class="reply-user">${escHtml(r.userName)}</span>
            <span class="reply-time">${formatTimeAgo(new Date(r.createdAt))}</span>
          </div>
          <div class="reply-body">${escHtml(r.body)}</div>
        </div>
      `;
    });
    html += `</div>`;
  }

  return html;
}

function toggleReplyForm(id){
  const form = document.getElementById('reply-form-' + id);
  form.style.display = form.style.display === 'none' ? 'block' : 'none';
  if (form.style.display === 'block'){
    setTimeout(() => document.getElementById('reply-input-' + id).focus(), 50);
  }
}

function submitReply(parentId){
  const input = document.getElementById('reply-input-' + parentId);
  const body = input.value.trim();
  if (!body) return;
  addReply(parentId, body);
  renderComments();
  showToast('Reply posted');
}

/* ================================================================
   UTILITIES
   ================================================================ */
function getInitials(name){
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function escHtml(str){
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatTimeAgo(date){
  const now = new Date();
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
  if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
  if (diff < 604800) return Math.floor(diff / 86400) + 'd ago';
  return date.toLocaleDateString('en-NG', { day:'numeric', month:'short' });
}

let toastTimer = null;
function showToast(msg){
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
    }
