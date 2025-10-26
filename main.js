
const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/RuzickaHub/UDF/main/docs/';
const PAGES = [
  {file: 'intro.md', title: 'Úvod'},
  {file: 'installation.md', title: 'Instalace'},
  {file: 'usage.md', title: 'Použití'},
  {file: 'api.md', title: 'API'}
];

function createNav(){
  const nav = document.getElementById('navlist');
  nav.innerHTML = '';
  PAGES.forEach(p=>{
    const a = document.createElement('a');
    a.href = '#'+p.file;
    a.textContent = p.title;
    a.setAttribute('data-file', p.file);
    a.addEventListener('click', (e)=>{
      e.preventDefault();
      closeSidebarIfMobile();
      loadPage(p.file);
      history.pushState({page:p.file}, '', '#'+p.file);
    });
    nav.appendChild(a);
  });
  setActiveLinkFromHash();
}

function setActiveLink(filename){
  document.querySelectorAll('#navlist a').forEach(a=>{
    a.classList.remove('active');
    if (a.getAttribute('data-file') === filename) a.classList.add('active');
  });
}

function setActiveLinkFromHash(){
  const file = location.hash.replace('#','') || PAGES[0].file;
  setActiveLink(file);
}

async function fetchMarkdown(file){
  const url = GITHUB_RAW_BASE + file;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Remote not available');
    return await res.text();
  } catch(err){
    console.warn('Remote fetch failed, trying local fallback', err);
    try {
      const local = await fetch('docs/'+file);
      if (!local.ok) throw new Error('Local fallback missing');
      return await local.text();
    } catch(e){
      return '# Chyba načtení\n\nObsah není dostupný.';
    }
  }
}

async function loadPage(file){
  const raw = await fetchMarkdown(file);
  const html = marked.parse(raw);
  const content = document.getElementById('content');
  content.innerHTML = html;
  document.title = document.querySelector('h1') ? document.querySelector('h1').innerText + ' – UDF' : 'UDF Documentation';
  setActiveLink(file);
  window.scrollTo(0,0);
}

function setupTheme(){
  const btn = document.getElementById('theme-toggle');
  const preferred = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const saved = localStorage.getItem('udf-theme');
  if (saved === 'dark' || (!saved && preferred)) {
    document.body.classList.add('dark');
    btn.setAttribute('aria-pressed','true');
  } else {
    document.body.classList.remove('dark');
    btn.setAttribute('aria-pressed','false');
  }
  btn.addEventListener('click', ()=>{
    const isDark = document.body.classList.toggle('dark');
    btn.setAttribute('aria-pressed', isDark ? 'true' : 'false');
    localStorage.setItem('udf-theme', isDark ? 'dark' : 'light');
  });
}

function setupMobileMenu(){
  const openBtn = document.getElementById('mobile-menu-open');
  const closeBtn = document.getElementById('mobile-menu-close');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('overlay');

  function openSidebar(){
    sidebar.classList.add('open');
    overlay.classList.remove('hidden');
    overlay.setAttribute('aria-hidden','false');
    openBtn.setAttribute('aria-expanded','true');
    document.body.style.overflow = 'hidden';
  }
  function closeSidebar(){
    sidebar.classList.remove('open');
    overlay.classList.add('hidden');
    overlay.setAttribute('aria-hidden','true');
    openBtn.setAttribute('aria-expanded','false');
    document.body.style.overflow = '';
  }
  openBtn.addEventListener('click', openSidebar);
  closeBtn.addEventListener('click', closeSidebar);
  overlay.addEventListener('click', closeSidebar);
  document.addEventListener('keydown', (e)=>{
    if (e.key === 'Escape') closeSidebar();
  });
  window.closeSidebarIfMobile = function(){
    if (window.innerWidth <= 1024) closeSidebar();
  };
}

window.addEventListener('popstate', (e)=>{
  const page = (e.state && e.state.page) || location.hash.replace('#','') || PAGES[0].file;
  loadPage(page);
});

document.addEventListener('DOMContentLoaded', ()=>{
  createNav();
  setupTheme();
  setupMobileMenu();
  const initial = location.hash.replace('#','') || PAGES[0].file;
  loadPage(initial);
});
