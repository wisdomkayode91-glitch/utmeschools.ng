/* ============================================================
   UTMESchools v2 — select-subjects.js (PART 2)
   ============================================================ */

function calcPress(val) {
  if (val === 'C') {
    calcDisplay = '0'; calcExpr = ''; calcJustEvaled = false;
  } else if (val === 'DEL') {
    calcDisplay = calcDisplay.length > 1 ? calcDisplay.slice(0, -1) : '0';
    calcExpr = calcExpr.length > 1 ? calcExpr.slice(0, -1) : '';
  } else if (val === '=') {
    try {
      var safe = calcExpr.replace(/×/g, '*').replace(/÷/g, '/').replace(/[^0-9+\-*/.()%]/g, '');
      var result = Function('"use strict"; return (' + safe + ')')();
      calcDisplay = isFinite(result) ? String(parseFloat(result.toFixed(8))) : 'Error';
      calcExpr = calcDisplay;
      calcJustEvaled = true;
    } catch (e) {
      calcDisplay = 'Error'; calcExpr = '';
    }
  } else if (['+', '-', '×', '÷', '%'].includes(val)) {
    var opMap = { '×': '*', '÷': '/' };
    var op = opMap[val] || val;
    calcExpr += op;
    calcDisplay = calcExpr;
    calcJustEvaled = false;
  } else {
    if (calcJustEvaled) { calcExpr = val; calcJustEvaled = false; }
    else { calcExpr = (calcExpr === '0' || calcExpr === '') ? val : calcExpr + val; }
    calcDisplay = calcExpr;
  }
  updateCalcDisplay();
}

startBtn.addEventListener('click', function() {
  if (selectedIds.length === 0) return;
  var params = new URLSearchParams({
    subjects: selectedIds.join(','),
    mode: currentMode,
    h: document.getElementById('timerH')?.value || '2',
    m: document.getElementById('timerM')?.value || '0'
  });
  selectedIds.forEach(function(id) {
    params.set('year_' + id, subjectConfig[id].year);
    params.set('count_' + id, subjectConfig[id].count);
  });
  window.location.href = 'practice.html?' + params.toString();
});

document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('.calc-btn').forEach(function(btn) {
    btn.addEventListener('click', function() { calcPress(btn.dataset.val); });
  });
  document.getElementById('calcCloseBtn').addEventListener('click', closeCalc);

  var calcOpenBtn = document.getElementById('calcOpenBtn');
  if (calcOpenBtn) calcOpenBtn.addEventListener('click', openCalc);

  document.getElementById('calcOverlay').addEventListener('click', function(e) {
    if (e.target === document.getElementById('calcOverlay')) closeCalc();
  });

  renderConfigList();
});
