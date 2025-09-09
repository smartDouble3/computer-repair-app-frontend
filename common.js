// ===== CONFIG
// ใช้ค่าใน localStorage ก่อน (เผื่อสลับ endpoint ง่าย ๆ) ไม่มีให้ใช้ของ Render
const API_BASE =
  localStorage.getItem('ticket_api_base') ||
  'https://computer-repair-app-server.onrender.com/api/v1';

// ตัด /api/v1 ออกเพื่อได้ host สำหรับรูป/ไฟล์
const HOST_BASE = API_BASE.replace(/\/api\/v1\/?$/, '');

const TOKEN_KEY = 'ticket_token';

// ===== TOKEN helpers
function getToken(){ return localStorage.getItem(TOKEN_KEY) || ''; }
function setToken(t){ localStorage.setItem(TOKEN_KEY, t); }
function clearToken(){ localStorage.removeItem(TOKEN_KEY); }
function isAuthed(){ return !!getToken(); }

// ===== API wrapper
async function api(path, { method='GET', body, headers={} } = {}){
  const url = path.startsWith('http') ? path : `${API_BASE}${path}`;
  const h = { Accept: 'application/json', ...headers };
  if (body && !(body instanceof FormData)) h['Content-Type'] = 'application/json';
  const tok = getToken(); if (tok) h['Authorization'] = `Bearer ${tok}`;

  let res, data;
  try {
    res = await fetch(url, {
      method, headers: h,
      body: body && !(body instanceof FormData) ? JSON.stringify(body) : body,
      mode: 'cors'
    });
  } catch {
    throw new Error('ติดต่อเซิร์ฟเวอร์ไม่ได้');
  }

  try { data = await res.json(); } catch { data = null; }
  if (!res.ok) {
    const err = new Error(data?.message || res.statusText || 'Request failed');
    err.status = res.status; err.data = data; throw err;
  }
  return data;
}

// ===== Guards
function requireAuth(){ if (!isAuthed()) location.href = 'login.html'; }

// ===== Utils
// ให้รูปวิ่งจาก backend บน Render
function imageURL(p){ return p ? `${HOST_BASE}${p}` : ''; }
