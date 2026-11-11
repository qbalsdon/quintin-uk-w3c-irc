'use strict';
const status = document.getElementById('forget-status');
document.getElementById('forget').addEventListener('click', async () => {
  try { await fetch('api/forget', { method: 'POST', credentials: 'same-origin' }); } catch {}
  const path = location.pathname.replace(/[^/]*$/, '') || '/';
  document.cookie = `w3circ_prefs=; Path=${path}; Max-Age=0; SameSite=Strict`;
  try { for (const k of Object.keys(localStorage)) if (k.startsWith('irc.')) localStorage.removeItem(k); } catch {}
  status.textContent = 'Done. You are disconnected and this browser no longer remembers you.';
});
