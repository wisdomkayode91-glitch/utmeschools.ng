/* ============================================================
   UTMESchools v2 — dashboard.js
   Result History + Bookmarks tabs.
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

function getSubject(id) { return ALL_SUBJECTS.find(function(s){ return s.id === id; }); }

function getResults() {
  try { return JSON.parse(localStorage.getItem('utme_results') || '[]'); } catch(e) { return []; }
}
function saveResults(r) { localStorage.setItem('utme_results', JSON.stringify(r)); }
function getBookmarks() {
  try { return JSON.parse(localStorage.getItem('utme_bookmarks') || '[]'); } catch(e) { return []; }
}
function saveBookmarks(b) { localStorage.setItem('utme_bookmarks', JSON.stringify(b)); }

function formatTime(s) {
  var h=Math.floor(s/3600), m=Math.floor((s%3600)/60), sc=s%60;
  if(h>0) return h+'h '+m+'m';
  if(m>0) return m+'m '+sc+'s';
  return sc+'s';
}
function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-NG',{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'});
}
function timeAgo(iso) {
  var diff=Date.now()-new Date(iso).getTime();
  var mins=Math.floor(diff/60000), hrs=Math.floor(diff/3600000), days=Math.floor(diff/86400000);
  if(mins<1) return 'Just now';
  if(mins<60) return mins+'m ago';
  if(hrs<24) return hrs+'h ago';
  if(days<7) return days+'d ago';
  return formatDate(iso);
}

/* ============================================================
   TABS
   ============================================================ */
var activeTab = 'history';

document.querySelectorAll('.dash-tab').forEach(function(tab) {
  tab.addEventListener('click', function() {
    document.querySelectorAll('.dash-tab').forEach(function(t){ t.classList.remove('active'); });
    tab.classList.add('active');
    activeTab = tab.dataset.tab;
    document.querySelectorAll('.tab-content').forEach(function(c){ c.classList.remove('active'); });
    document.getElementById(activeTab+'Tab').classList.add('active');
  });
});

/* ============================================================
   SUBJECT FILTERS
   ============================================================ */
function populateSubjectFilters() {
  var historySel  = document.getElementById('historyFilter');
  var bookmarkSel = document.getElementById('bookmarkFilter');
  ALL_SUBJECTS.forEach(function(s) {
    var o1 = document.createElement('option'); o1.value=s.id; o1.textContent=s.name; historySel.appendChild(o1);
    var o2 = document.createElement('option'); o2.value=s.id; o2.textContent=s.name; bookmarkSel.appendChild(o2);
  });
}

/* ============================================================
   HISTORY
   ============================================================ */
var historySort   = 'date';
var historyFilter = 'all';

function renderHistory() {
  var list = document.getElementById('historyList');
  var results = getResults();

  if (historyFilter !== 'all') {
    results = results.filter(function(r){ return r.subjects && r.subjects.includes(historyFilter); });
  }
  results.sort(function(a,b){
    if (historySort==='date') return new Date(b.date)-new Date(a.date);
    var ap=a.totalPossible>0?a.totalScore/a.totalPossible:0;
    var bp=b.totalPossible>0?b.totalScore/b.totalPossible:0;
    return bp-ap;
  });

  if (results.length===0) {
    list.innerHTML='<div class="empty-state"><div class="icon">📭</div><h3>No results yet</h3><p>Your practice results will appear here.</p><a href="select-subjects.html" class="btn btn-primary btn-sm">Start practicing</a></div>';
    document.getElementById('deleteAllHistory').style.display='none';
    return;
  }

  document.getElementById('deleteAllHistory').style.display='block';
  list.innerHTML='';

  results.forEach(function(r, idx) {
    var pct=r.totalPossible>0?Math.round((r.totalScore/r.totalPossible)*100):0;
    var badgeClass=pct>=60?'green':pct>=40?'amber':'red';
    var subjNames=(r.subjects||[]).map(function(sid){ return (getSubject(sid)||{name:sid}).name; });
    var modeLabel=r.mode==='mock'?'Mock':r.mode==='study'?'Study':'Practice';
    var rid = r.id || String(idx);

    var card=document.createElement('div');
    card.className='result-card';
    var scoresHtml = Object.entries(r.subjectScores||{}).map(function(e){
      var s=getSubject(e[0]); return '<span>'+(s?s.icon:'📚')+' '+(s?s.name:e[0])+': '+e[1].score+'/'+e[1].possible+'</span>';
    }).join('');

    card.innerHTML=
      '<div class="result-card-head">'+
        '<div class="result-card-num">'+(idx+1)+'</div>'+
        '<div class="result-card-info">'+
          '<div class="result-card-title">'+subjNames.join(', ')+'</div>'+
          '<div class="result-card-meta">'+formatDate(r.date)+' · '+modeLabel+' · '+formatTime(r.timeTaken||0)+'</div>'+
        '</div>'+
        '<div class="result-card-badge '+badgeClass+'">'+pct+'%</div>'+
      '</div>'+
      '<div class="result-card-scores">'+scoresHtml+'</div>'+
      '<div class="result-card-actions">'+
        '<button class="primary" data-view="'+rid+'">View Result</button>'+
        '<button data-correct="'+rid+'">Correction</button>'+
        '<button data-expand="'+rid+'">▾ More</button>'+
      '</div>'+
      '<div class="card-details" id="details-'+rid+'">'+
        '<button data-delete="'+rid+'">🗑 Delete this result</button>'+
      '</div>';
    list.appendChild(card);
  });

  list.querySelectorAll('[data-view]').forEach(function(btn){
    btn.addEventListener('click', function(){
      var res=getResults(); var r=res.find(function(x,i){ return (x.id||String(i))===btn.dataset.view; });
      if(r){ sessionStorage.setItem('utme_result',JSON.stringify(r)); window.location.href='results.html'; }
    });
  });
  list.querySelectorAll('[data-correct]').forEach(function(btn){
    btn.addEventListener('click', function(){
      var res=getResults(); var r=res.find(function(x,i){ return (x.id||String(i))===btn.dataset.correct; });
      if(r){ sessionStorage.setItem('utme_result',JSON.stringify(r)); window.location.href='results.html?view=correction'; }
    });
  });
  list.querySelectorAll('[data-expand]').forEach(function(btn){
    btn.addEventListener('click', function(){
      var d=document.getElementById('details-'+btn.dataset.expand);
      d.classList.toggle('open');
      btn.textContent=d.classList.contains('open')?'▴ Less':'▾ More';
    });
  });
  list.querySelectorAll('[data-delete]').forEach(function(btn){
    btn.addEventListener('click', function(){
      openConfirm('Delete Result','Are you sure you want to delete this result?',function(){
        var res=getResults().filter(function(x,i){ return (x.id||String(i))!==btn.dataset.delete; });
        saveResults(res); renderHistory(); showToast('Result deleted');
      });
    });
  });
}

/* ============================================================
   BOOKMARKS
   ============================================================ */
var bookmarkFilter = 'all';

function renderBookmarks() {
  var list=document.getElementById('bookmarkList');
  var bmarks=getBookmarks();
  if(bookmarkFilter!=='all'){ bmarks=bmarks.filter(function(b){ return b.subjectId===bookmarkFilter; }); }

  if(bmarks.length===0){
    list.innerHTML='<div class="empty-state"><div class="icon">🔖</div><h3>No bookmarks yet</h3><p>Bookmark questions during practice to revisit them here.</p><a href="select-subjects.html" class="btn btn-primary btn-sm">Start practicing</a></div>';
    document.getElementById('deleteAllBookmarks').style.display='none';
    return;
  }

  document.getElementById('deleteAllBookmarks').style.display='block';
  list.innerHTML='';

  bmarks.forEach(function(b, idx){
    var s=getSubject(b.subjectId)||{name:b.subjectId,icon:'📚',bg:'#eee',fg:'#333'};
    var card=document.createElement('div');
    card.className='bookmark-card';
    card.innerHTML=
      '<div class="bookmark-card-head">'+
        '<div class="bookmark-card-icon" style="background:'+s.bg+';color:'+s.fg+';">'+s.icon+'</div>'+
        '<div class="bookmark-card-info">'+
          '<div class="bookmark-card-subj">'+s.name+'</div>'+
          '<div class="bookmark-card-meta">'+(b.year||'Random')+' · '+timeAgo(b.date)+'</div>'+
        '</div>'+
      '</div>'+
      '<div class="bookmark-card-text">'+(b.text||b.questionText||'Question text unavailable')+'</div>'+
      '<div class="bookmark-card-actions">'+
        '<button data-view="'+idx+'">View</button>'+
        '<button class="danger" data-remove="'+idx+'">Remove</button>'+
      '</div>';
    list.appendChild(card);
  });

  list.querySelectorAll('[data-remove]').forEach(function(btn){
    btn.addEventListener('click', function(){
      openConfirm('Remove Bookmark','Remove this bookmark?',function(){
        var bm=getBookmarks(); bm.splice(parseInt(btn.dataset.remove),1);
        saveBookmarks(bm); renderBookmarks(); showToast('Bookmark removed');
      });
    });
  });
}

/* ============================================================
   CONFIRM DIALOG
   ============================================================ */
var confirmCallback=null;
function openConfirm(title,text,cb){
  confirmCallback=cb;
  document.getElementById('confirmTitle').textContent=title;
  document.getElementById('confirmText').textContent=text;
  document.getElementById('confirmOverlay').classList.add('open');
  document.body.style.overflow='hidden';
}
function closeConfirm(){
  document.getElementById('confirmOverlay').classList.remove('open');
  document.body.style.overflow='';
  confirmCallback=null;
}

/* ============================================================
   TOAST
   ============================================================ */
function showToast(msg){
  var t=document.getElementById('toast');
  t.textContent=msg; t.classList.add('show');
  setTimeout(function(){ t.classList.remove('show'); },2000);
}

/* ============================================================
   INIT
   ============================================================ */
document.addEventListener('DOMContentLoaded', function(){
  populateSubjectFilters();
  renderHistory();
  renderBookmarks();

  document.getElementById('historyFilter').addEventListener('change',function(e){
    historyFilter=e.target.value; renderHistory();
  });
  document.getElementById('historySort').addEventListener('click',function(){
    historySort=historySort==='date'?'score':'date';
    document.getElementById('historySort').textContent=historySort==='date'?'Sort: Date ▾':'Sort: Score ▾';
    renderHistory();
  });
  document.getElementById('bookmarkFilter').addEventListener('change',function(e){
    bookmarkFilter=e.target.value; renderBookmarks();
  });
  document.getElementById('deleteAllHistory').addEventListener('click',function(){
    openConfirm('Delete All History','Delete ALL result history? Cannot be undone.',function(){
      saveResults([]); renderHistory(); showToast('All history deleted');
    });
  });
  document.getElementById('deleteAllBookmarks').addEventListener('click',function(){
    openConfirm('Delete All Bookmarks','Remove ALL bookmarks?',function(){
      saveBookmarks([]); renderBookmarks(); showToast('All bookmarks removed');
    });
  });
  document.getElementById('confirmCancel').addEventListener('click',closeConfirm);
  document.getElementById('confirmOk').addEventListener('click',function(){
    if(confirmCallback) confirmCallback(); closeConfirm();
  });
  document.getElementById('confirmOverlay').addEventListener('click',function(e){
    if(e.target===document.getElementById('confirmOverlay')) closeConfirm();
  });
});
                  
