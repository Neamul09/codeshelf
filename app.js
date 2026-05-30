/* 
  =========================================
  CODESHELF - Core JavaScript Engine
  =========================================
  Handles:
  - Unified Offline Database (10,650+ resources across 53 global languages)
  - Progressive-enhancement local Markdown parser fallback
  - Dynamic in-memory queries & dynamic sidebar counts
  - LocalStorage Favorites Drawer synced bookshelf
  - Light/Dark mode transitions
  - Generative gradient book covers
  - Shuffle sorts and interactive confetti recommendations
*/

// Application State
let allBooks = []; // Represents the active Language + Resource Type slice
let filteredBooks = [];
let favoriteBooks = JSON.parse(localStorage.getItem('codeshelf_favorites')) || [];
let activeLanguage = 'en';
let activeType = 'Books';
let activeCategory = 'all';
let activeFormat = 'all';
let activeSort = 'alphabetical';
let activeSearchQuery = '';
let renderedLimit = 40;
let categoriesList = [];

// DOM Elements
const bookGridContainer = document.getElementById('book-grid-container');
const categoryContainer = document.getElementById('category-container');
const searchBar = document.getElementById('search-bar');
const languageSelect = document.getElementById('language-select');
const booksResultsCount = document.getElementById('books-results-count');
const sorterSelect = document.getElementById('sorter-select');
const themeToggle = document.getElementById('theme-toggle');
const themeMoon = document.getElementById('theme-moon');
const themeSun = document.getElementById('theme-sun');
const favoritesTrigger = document.getElementById('favorites-trigger');
const favoritesBadge = document.getElementById('favorites-badge');
const shelfContainer = document.getElementById('shelf-container');
const shelfBackdrop = document.getElementById('shelf-backdrop');
const shelfCloseTrigger = document.getElementById('shelf-close-trigger');
const shelfDrawerItems = document.getElementById('shelf-drawer-items');
const surpriseTrigger = document.getElementById('surprise-trigger');
const mobileSidebarToggle = document.getElementById('mobile-sidebar-toggle');
const sidebarPanel = document.getElementById('sidebar-panel');
const statBooksCount = document.getElementById('stat-books-count');
const statLanguagesCount = document.getElementById('stat-languages-count');

// Gradient classes for generative book covers
const GRADIENTS = [
  'grad-cyan', 'grad-blue', 'grad-indigo', 'grad-violet', 
  'grad-purple', 'grad-pink', 'grad-orange', 'grad-amber', 
  'grad-teal', 'grad-emerald'
];

// Map language keys to markdown file paths (used ONLY as dynamic parse fallback)
const LANGUAGE_FILES = {
  'en-subjects': 'books/free-programming-books-subjects.md',
  'en-langs': 'books/free-programming-books-langs.md',
  'es': 'books/free-programming-books-es.md',
  'fr': 'books/free-programming-books-fr.md',
  'zh': 'books/free-programming-books-zh.md',
  'ar': 'books/free-programming-books-ar.md',
  'de': 'books/free-programming-books-de.md',
  'pt_BR': 'books/free-programming-books-pt_BR.md',
  'it': 'books/free-programming-books-it.md',
  'ru': 'books/free-programming-books-ru.md',
  'ja': 'books/free-programming-books-ja.md',
  'ko': 'books/free-programming-books-ko.md'
};

// Initial setup
document.addEventListener('DOMContentLoaded', () => {
  setupTheme();
  
  if (window.CODELIB_DATABASE) {
    // 1. Dynamic Dropdown Population of all 53 languages
    populateLanguageDropdown();
    
    // 2. Setup stats counters dynamically based on full database size!
    const totalCount = window.CODELIB_DATABASE.resources.length;
    const langCount = window.CODELIB_DATABASE.languages.length;
    statBooksCount.textContent = totalCount.toLocaleString() + "+";
    statLanguagesCount.textContent = langCount.toLocaleString();
    
    // 3. Register Event Listeners
    setupEventListeners();
    
    // 4. Initial filter & render cycle!
    filterAndRender();
  } else {
    // Fall back to old Markdown fetcher if database script isn't loaded
    setupEventListeners();
    loadLibrary(languageSelect.value);
  }
  
  updateFavoritesUI();
  
  // Lucide Icons initialization
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
});

// Setup Dark/Light mode theme
function setupTheme() {
  const savedTheme = localStorage.getItem('codeshelf_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcons(savedTheme);
}

function updateThemeIcons(theme) {
  if (theme === 'dark') {
    themeMoon.style.display = 'none';
    themeSun.style.display = 'block';
  } else {
    themeMoon.style.display = 'block';
    themeSun.style.display = 'none';
  }
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('codeshelf_theme', newTheme);
  updateThemeIcons(newTheme);
}

// Populate the language select option dynamically from database
function populateLanguageDropdown() {
  const db = window.CODELIB_DATABASE;
  if (!db || !db.languages) return;
  
  let html = '';
  db.languages.forEach(lang => {
    const selected = lang.code === 'en' ? 'selected' : '';
    html += `<option value="${lang.code}" ${selected}>${lang.name} (${lang.code.toUpperCase()})</option>`;
  });
  languageSelect.innerHTML = html;
}

// Setup all user interactions
function setupEventListeners() {
  themeToggle.addEventListener('click', toggleTheme);
  
  // Search input
  searchBar.addEventListener('input', (e) => {
    activeSearchQuery = e.target.value.toLowerCase().trim();
    filterAndRender();
  });
  
  // Language selector
  languageSelect.addEventListener('change', (e) => {
    if (window.CODELIB_DATABASE) {
      activeLanguage = e.target.value;
      activeCategory = 'all';
      filterAndRender();
    } else {
      loadLibrary(e.target.value);
    }
  });
  
  // Format pills
  const filterPills = document.querySelectorAll('.filter-pill');
  filterPills.forEach(pill => {
    pill.addEventListener('click', (e) => {
      filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      activeFormat = pill.getAttribute('data-filter');
      filterAndRender();
    });
  });
  
  // Sort selector
  sorterSelect.addEventListener('change', (e) => {
    activeSort = e.target.value;
    filterAndRender();
  });
  
  // Favorites drawer toggles
  favoritesTrigger.addEventListener('click', openShelf);
  shelfCloseTrigger.addEventListener('click', closeShelf);
  shelfBackdrop.addEventListener('click', closeShelf);
  
  // Surprise Me! recommend
  surpriseTrigger.addEventListener('click', handleSurpriseMe);
  
  // Mobile sidebar categories toggle
  mobileSidebarToggle.addEventListener('click', toggleMobileSidebar);
  
  // Infinite scroll
  window.addEventListener('scroll', handleInfiniteScroll);

  // Resource Type Pills listeners
  const typeContainer = document.getElementById('resource-types-container');
  if (typeContainer) {
    const typeButtons = typeContainer.querySelectorAll('.type-btn');
    typeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        typeButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeType = btn.getAttribute('data-type');
        activeCategory = 'all';
        filterAndRender();
      });
    });
  }
}

// Fetch and dynamically parse selected Markdown library (Legacy Fallback ONLY)
async function loadLibrary(langKey) {
  showShimmerLoaders();
  const filePath = LANGUAGE_FILES[langKey] || LANGUAGE_FILES['en-subjects'];
  
  try {
    const response = await fetch(filePath);
    if (!response.ok) {
      throw new Error(`Failed to load: ${filePath}`);
    }
    const markdownText = await response.text();
    allBooks = parseMarkdown(markdownText);
    
    statBooksCount.textContent = allBooks.length.toLocaleString();
    
    activeCategory = 'all';
    activeSearchQuery = '';
    searchBar.value = '';
    
    buildSidebarCategories();
    filterAndRender();
  } catch (error) {
    console.error('CodeShelf Library Loader Error:', error);
    bookGridContainer.innerHTML = `
      <div class="empty-results">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>
        <h3>Library Offline</h3>
        <p>Failed to load resources. Double-click the <strong>start-library.bat</strong> launcher in your project folder to bypass browser security sandbox CORS blocks.</p>
      </div>
    `;
  }
}

// Parser Engine: Uses highly tuned Regular Expressions for Markdown processing (Legacy Fallback ONLY)
function parseMarkdown(mdText) {
  const lines = mdText.split(/\r?\n/);
  const parsedBooks = [];
  let currentCategory = 'General';
  let currentSubcategory = '';
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    if (line.startsWith('### ')) {
      let cat = line.substring(4).trim();
      const skipKeywords = ['index', 'translations', 'license', 'how to contribute', 'how to share', 'by subject', 'by programming language'];
      if (skipKeywords.some(keyword => cat.toLowerCase().includes(keyword)) || cat.toLowerCase().startsWith('0 -')) {
        continue;
      }
      cat = cat.replace(/<a[^>]*>.*?<\/a>/g, '');
      cat = cat.replace(/\\#/g, '#');
      cat = cat.replace(/\\_/g, '_');
      cat = cat.trim();
      
      if (cat) {
        currentCategory = cat;
        currentSubcategory = '';
      }
      continue;
    }
    
    if (line.startsWith('#### ')) {
      let subcat = line.substring(5).trim();
      subcat = subcat.replace(/<a[^>]*>.*?<\/a>/g, '');
      subcat = subcat.replace(/\\#/g, '#');
      subcat = subcat.replace(/\\_/g, '_');
      subcat = subcat.trim();
      
      if (subcat) {
        currentSubcategory = subcat;
      }
      continue;
    }
    
    const bulletMatch = line.match(/^\s*\*\s*\[([^\]]+)\]\(([^)]+)\)(.*)/);
    if (bulletMatch) {
      const title = bulletMatch[1].trim();
      const url = bulletMatch[2].trim();
      const rawDetails = bulletMatch[3].trim();
      
      if (url.startsWith('#')) continue;
      
      const formats = [];
      const formatRegex = /\((PDF|HTML|EPUB|MOBI|Kindle|eBook|Web|Read|Markdown|Jupyter|Git|Interactive|Video|Audio|Podcast|Screencast|Online|ZIP)[^)]*\)/i;
      const formatMatch = rawDetails.match(formatRegex);
      
      if (formatMatch) {
        formats.push(formatMatch[1].toUpperCase());
      } else {
        if (url.endsWith('.pdf')) {
          formats.push('PDF');
        } else if (url.includes('github.com') || url.includes('gitbook.io')) {
          formats.push('GIT');
        } else {
          formats.push('WEB');
        }
      }
      
      let cleanDetails = rawDetails;
      cleanDetails = cleanDetails.replace(/\((PDF|HTML|EPUB|MOBI|Kindle|eBook|Web|Read|Markdown|Jupyter|Git|Interactive|Video|Audio|Podcast|Screencast|Online|ZIP)[^)]*\)/gi, '');
      cleanDetails = cleanDetails.replace(/\((CC|BY|NC|SA|ND|GFDL|archived|in process|email|sponsors|sponsorship)[^)]*\)/gi, '');
      cleanDetails = cleanDetails.replace(/\*[^)]*\*/g, '');
      
      let author = cleanDetails.trim();
      if (author.startsWith('-')) {
        author = author.substring(1).trim();
      }
      
      author = author.replace(/[\*\:]+$/g, '').trim();
      if (!author || author === '-') {
        author = 'Open Learning Community';
      }
      
      parsedBooks.push({
        id: generateBookHash(title + url),
        title: title,
        url: url,
        author: author,
        formats: formats,
        category: currentCategory,
        subcategory: currentSubcategory
      });
    }
  }
  return parsedBooks;
}

// Generate stable hash code based on string values
function generateBookHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return 'b-' + Math.abs(hash).toString(36);
}

// Sidebar Category Constructor with counters
function buildSidebarCategories() {
  const categoryCounts = {};
  
  allBooks.forEach(book => {
    categoryCounts[book.category] = (categoryCounts[book.category] || 0) + 1;
  });
  
  categoriesList = Object.keys(categoryCounts).sort();
  
  let html = `
    <li class="category-item ${activeCategory === 'all' ? 'active' : ''}" data-category="all">
      <span>All Subjects</span>
      <span class="category-count">${allBooks.length}</span>
    </li>
  `;
  
  categoriesList.forEach(cat => {
    const isActive = activeCategory === cat ? 'active' : '';
    html += `
      <li class="category-item ${isActive}" data-category="${cat}">
        <span>${cat}</span>
        <span class="category-count">${categoryCounts[cat]}</span>
      </li>
    `;
  });
  
  categoryContainer.innerHTML = html;
  
  const items = categoryContainer.querySelectorAll('.category-item');
  items.forEach(item => {
    item.addEventListener('click', () => {
      items.forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      activeCategory = item.getAttribute('data-category');
      
      if (window.innerWidth <= 1024) {
        sidebarPanel.style.display = 'none';
      }
      
      filterAndRender();
    });
  });
}

// Primary Filter and Sort Engine
function filterAndRender() {
  renderedLimit = 40;
  
  if (window.CODELIB_DATABASE) {
    // 1. First, establish current Language + Resource Type slice
    allBooks = window.CODELIB_DATABASE.resources.filter(res => {
      return res.lang === activeLanguage && res.type === activeType;
    });

    // 2. Rebuild the dynamic category sidebar counters
    buildSidebarCategories();

    // 3. Apply search, category sidebar, and format pill filters
    filteredBooks = allBooks.filter(book => {
      const matchesCategory = activeCategory === 'all' || book.category === activeCategory;
      
      const matchesSearch = !activeSearchQuery || 
        book.title.toLowerCase().includes(activeSearchQuery) || 
        book.author.toLowerCase().includes(activeSearchQuery) ||
        book.category.toLowerCase().includes(activeSearchQuery) ||
        (book.subcategory && book.subcategory.toLowerCase().includes(activeSearchQuery));
        
      let matchesFormat = true;
      if (activeFormat !== 'all') {
        const isEbook = ['EPUB', 'MOBI', 'KINDLE', 'EBOOK'].some(f => book.formats.includes(f));
        const isPDF = book.formats.includes('PDF');
        const isHTML = book.formats.includes('HTML') || book.formats.includes('WEB') || book.formats.includes('GIT');
        
        if (activeFormat === 'pdf') matchesFormat = isPDF;
        else if (activeFormat === 'html') matchesFormat = isHTML;
        else if (activeFormat === 'epub') matchesFormat = isEbook;
      }
      
      return matchesCategory && matchesSearch && matchesFormat;
    });
  } else {
    // Legacy parsed fallback list filter
    filteredBooks = allBooks.filter(book => {
      const matchesCategory = activeCategory === 'all' || book.category === activeCategory;
      
      const matchesSearch = !activeSearchQuery || 
        book.title.toLowerCase().includes(activeSearchQuery) || 
        book.author.toLowerCase().includes(activeSearchQuery) ||
        book.category.toLowerCase().includes(activeSearchQuery);
        
      let matchesFormat = true;
      if (activeFormat !== 'all') {
        const isEbook = ['EPUB', 'MOBI', 'KINDLE', 'EBOOK'].some(f => book.formats.includes(f));
        const isPDF = book.formats.includes('PDF');
        const isHTML = book.formats.includes('HTML') || book.formats.includes('WEB') || book.formats.includes('GIT');
        
        if (activeFormat === 'pdf') matchesFormat = isPDF;
        else if (activeFormat === 'html') matchesFormat = isHTML;
        else if (activeFormat === 'epub') matchesFormat = isEbook;
      }
      
      return matchesCategory && matchesSearch && matchesFormat;
    });
  }
  
  // Apply sorting
  if (activeSort === 'alphabetical') {
    filteredBooks.sort((a, b) => a.title.localeCompare(b.title));
  } else if (activeSort === 'random') {
    shuffleArray(filteredBooks);
  }
  
  booksResultsCount.innerHTML = `Found <span>${filteredBooks.length}</span> resources`;
  renderGrid();
}

// Render filtered slices onto display grid
function renderGrid() {
  const visibleSlice = filteredBooks.slice(0, renderedLimit);
  
  if (visibleSlice.length === 0) {
    bookGridContainer.innerHTML = `
      <div class="empty-results">
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-search-x"><path d="m21 21-4.3-4.3"/><circle cx="11" cy="11" r="8"/><path d="m8 8 6 6"/><path d="m14 8-6 6"/></svg>
        <h3>No resources found</h3>
        <p>Try refining your search parameters, changing formats, or selecting another subject category in the sidebar.</p>
      </div>
    `;
    return;
  }
  
  let html = '';
  visibleSlice.forEach((book, index) => {
    const isFav = favoriteBooks.some(f => f.id === book.id);
    const favClass = isFav ? 'active' : '';
    const gradient = getGradientForCategory(book.category);
    const formatTags = book.formats.map(f => `<span class="format-tag">${f}</span>`).join('');
    const delay = (index % 10) * 0.04;
    
    html += `
      <article class="book-card" style="animation-delay: ${delay}s">
        <!-- Procedural Typographic Cover -->
        <div class="book-cover-wrapper">
          <div class="book-cover ${gradient}">
            <div class="book-cover-category">${book.category}</div>
            <h3 class="book-cover-title">${book.title}</h3>
            <div class="book-cover-badge">${formatTags}</div>
          </div>
        </div>
        
        <!-- Book Details Metadata -->
        <div class="book-info">
          <span class="book-card-category">${book.subcategory || book.category}</span>
          <h4 class="book-card-title" title="${book.title}">${book.title}</h4>
          <span class="book-card-author" title="${book.author}">${book.author}</span>
        </div>
        
        <!-- Interactive Actions -->
        <div class="book-card-actions">
          <a href="${book.url}" target="_blank" rel="noopener noreferrer" class="read-btn" title="Open resource link">
            <span>Read Now</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-external-link"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>
          </a>
          <button class="favorite-btn ${favClass}" onclick="toggleFavorite('${book.id}')" title="Save to bookshelf">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bookmark"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>
          </button>
        </div>
      </article>
    `;
  });
  
  bookGridContainer.innerHTML = html;
  
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
}

// Generate stable gradient cover selector based on category string
function getGradientForCategory(category) {
  let hash = 0;
  for (let i = 0; i < category.length; i++) {
    hash = category.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % GRADIENTS.length;
  return GRADIENTS[index];
}

// Shimmer Loader Placeholders Renderer
function showShimmerLoaders() {
  let html = '';
  for (let i = 0; i < 8; i++) {
    html += `
      <div class="shimmer-card">
        <div class="shimmer-element shimmer-cover"></div>
        <div class="shimmer-element shimmer-title"></div>
        <div class="shimmer-element shimmer-author"></div>
      </div>
    `;
  }
  bookGridContainer.innerHTML = html;
}

// Fisher-Yates array shuffling logic
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// Infinite scrolling loading triggers
function handleInfiniteScroll() {
  if (renderedLimit >= filteredBooks.length) return;
  
  const buffer = 400;
  if ((window.innerHeight + window.scrollY) >= (document.documentElement.scrollHeight - buffer)) {
    renderedLimit += 30;
    renderGrid();
  }
}

// Favorites Shelf Logic
function toggleFavorite(id) {
  const isFav = favoriteBooks.some(f => f.id === id);
  
  if (isFav) {
    favoriteBooks = favoriteBooks.filter(f => f.id !== id);
  } else {
    // Locate full book record from either DB or legacy list
    let book = null;
    if (window.CODELIB_DATABASE) {
      book = window.CODELIB_DATABASE.resources.find(b => b.id === id);
    } else {
      book = allBooks.find(b => b.id === id);
    }
    
    if (book) {
      favoriteBooks.push(book);
      triggerConfetti();
    }
  }
  
  localStorage.setItem('codeshelf_favorites', JSON.stringify(favoriteBooks));
  updateFavoritesUI();
  renderGrid(); // Refresh grid active tags
}

function updateFavoritesUI() {
  const favCount = favoriteBooks.length;
  if (favCount > 0) {
    favoritesBadge.textContent = favCount;
    favoritesBadge.style.display = 'block';
  } else {
    favoritesBadge.style.display = 'none';
  }
  renderDrawerItems();
}

function renderDrawerItems() {
  if (favoriteBooks.length === 0) {
    shelfDrawerItems.innerHTML = `
      <div class="drawer-empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bookmark-minus"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v11"/><line x1="15" x2="21" y1="10" y2="10"/></svg>
        <p>Your bookshelf is currently empty.<br>Click the bookmark icon on any book to add it here!</p>
      </div>
    `;
    return;
  }
  
  let html = '';
  favoriteBooks.forEach(book => {
    const gradient = getGradientForCategory(book.category);
    html += `
      <div class="fav-item">
        <a href="${book.url}" target="_blank" rel="noopener noreferrer" class="fav-item-link">
          <div class="fav-item-cover-mini ${gradient}"></div>
          <div class="fav-item-details">
            <h5 class="fav-item-title">${book.title}</h5>
            <span class="fav-item-author">${book.author}</span>
          </div>
        </a>
        <div class="fav-item-remove-btn" onclick="toggleFavorite('${book.id}')" title="Remove from shelf">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash-2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
        </div>
      </div>
    `;
  });
  
  shelfDrawerItems.innerHTML = html;
  
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
}

// Drawer Toggles
function openShelf() {
  shelfContainer.classList.add('open');
  shelfBackdrop.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeShelf() {
  shelfContainer.classList.remove('open');
  shelfBackdrop.classList.remove('open');
  document.body.style.overflow = '';
}

// Mobile sidebar categories toggle
function toggleMobileSidebar() {
  if (sidebarPanel.style.display === 'none' || !sidebarPanel.style.display) {
    sidebarPanel.style.display = 'block';
    sidebarPanel.style.position = 'fixed';
    sidebarPanel.style.zIndex = '99';
    sidebarPanel.style.width = '280px';
    sidebarPanel.style.background = 'var(--bg-secondary)';
    sidebarPanel.style.boxShadow = '10px 0 20px rgba(0,0,0,0.15)';
  } else {
    sidebarPanel.style.display = 'none';
  }
}

// Surprise Me! recomendations
function handleSurpriseMe() {
  if (filteredBooks.length === 0) return;
  
  const randomIndex = Math.floor(Math.random() * filteredBooks.length);
  const randomBook = filteredBooks[randomIndex];
  
  triggerConfetti();
  
  const notice = document.createElement('div');
  notice.style.position = 'fixed';
  notice.style.bottom = '30px';
  notice.style.left = '50%';
  notice.style.transform = 'translateX(-50%)';
  notice.style.background = 'linear-gradient(135deg, var(--primary), var(--secondary))';
  notice.style.color = '#ffffff';
  notice.style.padding = '1rem 2rem';
  notice.style.borderRadius = 'var(--radius-full)';
  notice.style.boxShadow = '0 10px 30px rgba(99, 102, 241, 0.4)';
  notice.style.fontFamily = 'var(--font-display)';
  notice.style.fontWeight = '700';
  notice.style.zIndex = '999';
  notice.style.animation = 'popScale 0.3s ease';
  notice.innerHTML = `📚 Surprised with: "${randomBook.title}"! Redirecting...`;
  
  document.body.appendChild(notice);
  
  setTimeout(() => {
    notice.style.animation = 'popScale 0.3s ease reverse';
    setTimeout(() => notice.remove(), 300);
    window.open(randomBook.url, '_blank');
  }, 1800);
}

// Lightweight Custom CSS particle confetti explosion
function triggerConfetti() {
  for (let i = 0; i < 40; i++) {
    const particle = document.createElement('div');
    particle.style.position = 'fixed';
    particle.style.width = Math.random() * 8 + 4 + 'px';
    particle.style.height = Math.random() * 8 + 4 + 'px';
    particle.style.borderRadius = '50%';
    
    const colors = ['#6366f1', '#ec4899', '#8b5cf6', '#14b8a6', '#f59e0b', '#10b981'];
    particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    
    particle.style.left = '50%';
    particle.style.top = '50%';
    particle.style.pointerEvents = 'none';
    particle.style.zIndex = '9999';
    
    const angle = Math.random() * Math.PI * 2;
    const velocity = Math.random() * 120 + 80;
    const xDist = Math.cos(angle) * velocity;
    const yDist = Math.sin(angle) * velocity;
    
    document.body.appendChild(particle);
    
    const anim = particle.animate([
      { transform: 'translate(0, 0) scale(1)', opacity: 1 },
      { transform: `translate(${xDist}px, ${yDist}px) scale(0)`, opacity: 0 }
    ], {
      duration: Math.random() * 800 + 600,
      easing: 'cubic-bezier(0.1, 0.8, 0.3, 1)'
    });
    
    anim.onfinish = () => particle.remove();
  }
}

// Resize event setups
window.addEventListener('resize', () => {
  if (window.innerWidth > 1024) {
    sidebarPanel.style.display = 'block';
    sidebarPanel.style.position = 'sticky';
    sidebarPanel.style.boxShadow = 'none';
  } else {
    sidebarPanel.style.display = 'none';
  }
});
