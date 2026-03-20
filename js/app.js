/**
 * Daily arXiv AI Enhanced - Main Application
 * Copyright 2026 Jonghwan Kim
 */

// change all annoation from chinese to english --2026.01.30 by JH
let currentDate = '';
let availableDates = [];
let currentView = 'grid'; // 'grid' or 'list'
let currentCategory = 'all';
let paperData = {};
let flatpickrInstance = null;
let isRangeMode = false;
let activeKeywords = []; // Store active keywords H
let userKeywords = []; // Store user's keywords 
let activeAuthors = []; // Store active authors 
let userAuthors = []; // Store user's authors 
let currentPaperIndex = 0; // Current viewing paper index 
let currentFilteredPapers = []; // Current filtered paper list
let textSearchQuery = ''; // Real-time text search query
let previousActiveKeywords = null; // Temporarily store previous keyword activation set when text search is active
let previousActiveAuthors = null; // Temporarily store previous author activation set when text search is active


// Load user's keyword settings
function loadUserKeywords() {
  const savedKeywords = localStorage.getItem('preferredKeywords');
  if (savedKeywords) {
    try {
      userKeywords = JSON.parse(savedKeywords);
      // Activate all keywords by default
      activeKeywords = [...userKeywords];
    } catch (error) {
      console.error('Failed to parse keywords:', error);
      userKeywords = [];
      activeKeywords = [];
    }
  } else {
    userKeywords = [];
    activeKeywords = [];
  }
  
  // renderKeywordTags();
  renderFilterTags();
}

// Load user's author settings
function loadUserAuthors() {
  const savedAuthors = localStorage.getItem('preferredAuthors');
  if (savedAuthors) {
    try {
      userAuthors = JSON.parse(savedAuthors);
      // Activate all authors by default
      activeAuthors = [...userAuthors];
    } catch (error) {
      console.error('Failed to parse authors:', error);
      userAuthors = [];
      activeAuthors = [];
    }
  } else {
    userAuthors = [];
    activeAuthors = [];
  }
  
  renderFilterTags();
}

// Render filter tags (authors and keywords)
function renderFilterTags() {
  const filterTagsElement = document.getElementById('filterTags');
  const filterContainer = document.querySelector('.filter-label-container');
  
  // If there are no authors and keywords, only hide the tag area, keep the container (to display the search button)
  if ((!userAuthors || userAuthors.length === 0) && (!userKeywords || userKeywords.length === 0)) {
    filterContainer.style.display = 'flex';
    if (filterTagsElement) {
      filterTagsElement.style.display = 'none';
      filterTagsElement.innerHTML = '';
    }
    return;
  }
  
  filterContainer.style.display = 'flex';
  if (filterTagsElement) {
    filterTagsElement.style.display = 'flex';
  }
  filterTagsElement.innerHTML = '';
  
  // Add author tags first
  if (userAuthors && userAuthors.length > 0) {
    userAuthors.forEach(author => {
      const tagElement = document.createElement('span');
      tagElement.className = `category-button author-button ${activeAuthors.includes(author) ? 'active' : ''}`;
      tagElement.textContent = author;
      tagElement.dataset.author = author;
      tagElement.title = "Match author name";
      
      tagElement.addEventListener('click', () => {
        toggleAuthorFilter(author);
      });
      
      filterTagsElement.appendChild(tagElement);
      
      // Remove animation class after adding appearance animation
      if (!activeAuthors.includes(author)) {
        tagElement.classList.add('tag-appear');
        setTimeout(() => {
          tagElement.classList.remove('tag-appear');
        }, 300);
      }
    });
  }
  
  // Then add keyword tags
  if (userKeywords && userKeywords.length > 0) {
    userKeywords.forEach(keyword => {
      const tagElement = document.createElement('span');
      tagElement.className = `category-button keyword-button ${activeKeywords.includes(keyword) ? 'active' : ''}`;
      tagElement.textContent = keyword;
      tagElement.dataset.keyword = keyword;
      tagElement.title = "Match keywords in title and abstract";
      
      tagElement.addEventListener('click', () => {
        toggleKeywordFilter(keyword);
      });
      
      filterTagsElement.appendChild(tagElement);
      
      // Remove animation class after adding appearance animation
      if (!activeKeywords.includes(keyword)) {
        tagElement.classList.add('tag-appear');
        setTimeout(() => {
          tagElement.classList.remove('tag-appear');
        }, 300);
      }
    });
  }
}

// Toggle keyword filter
function toggleKeywordFilter(keyword) {
  const index = activeKeywords.indexOf(keyword);
  
  if (index === -1) {
    // Activate this keyword
    activeKeywords.push(keyword);
  } else {
    // Deactivate this keyword
    activeKeywords.splice(index, 1);
  }
  
  // Update keyword tag UI
  const keywordTags = document.querySelectorAll('[data-keyword]');
  keywordTags.forEach(tag => {
    if (tag.dataset.keyword === keyword) {
      // First remove possible previous highlight animation
      tag.classList.remove('tag-highlight');
      
      // Add/remove active state
      tag.classList.toggle('active', activeKeywords.includes(keyword));
      
      // Add highlight animation
      setTimeout(() => {
        tag.classList.add('tag-highlight');
      }, 10);
      
      // Remove highlight animation
      setTimeout(() => {
        tag.classList.remove('tag-highlight');
      }, 1000);
    }
  });
  
  // Re-render paper list
  renderPapers();
}


// Toggle author filter
function toggleAuthorFilter(author) {
  const index = activeAuthors.indexOf(author);
  
  if (index === -1) {
    // Activate this author
    activeAuthors.push(author);
  } else {
    // Deactivate this author
    activeAuthors.splice(index, 1);
  }
  
  // Update author tag UI
  const authorTags = document.querySelectorAll('[data-author]');
  authorTags.forEach(tag => {
    if (tag.dataset.author === author) {
      // First remove possible previous highlight animation
      tag.classList.remove('tag-highlight');
      
      // Add/remove active state
      tag.classList.toggle('active', activeAuthors.includes(author));
      
      // Add highlight animation
      setTimeout(() => {
        tag.classList.add('tag-highlight');
      }, 10);
      
      // Remove highlight animation
      setTimeout(() => {
        tag.classList.remove('tag-highlight');
      }, 1000);
    }
  });
  
  // Re-render paper list
  renderPapers();
}

document.addEventListener('DOMContentLoaded', () => {
  initEventListeners();
  
  fetchGitHubStats();
  
  // Load user keywords
  loadUserKeywords();
  
  // Load user authors
  loadUserAuthors();
  
  fetchAvailableDates().then(() => {
    if (availableDates.length > 0) {
      loadPapersByDate(availableDates[0]);
    }
  });
});

async function fetchGitHubStats() {
  try {
    // #modified by JH(2026.03.20) - use DATA_CONFIG so repo name stays in sync
    const response = await fetch(`https://api.github.com/repos/${DATA_CONFIG.repoOwner}/${DATA_CONFIG.repoName}`);
    const data = await response.json();
    const starCount = data.stargazers_count;
    const forkCount = data.forks_count;
    
    document.getElementById('starCount').textContent = starCount;
    document.getElementById('forkCount').textContent = forkCount;
  } catch (error) {
    console.error('Failed to fetch GitHub statistics:', error);
    document.getElementById('starCount').textContent = '?';
    document.getElementById('forkCount').textContent = '?';
  }
}

function initEventListeners() {
  // Date picker related event listeners
  const calendarButton = document.getElementById('calendarButton');
  calendarButton.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleDatePicker();
  });
  
  const datePickerModal = document.querySelector('.date-picker-modal');
  datePickerModal.addEventListener('click', (event) => {
    if (event.target === datePickerModal) {
      toggleDatePicker();
    }
  });
  
  const datePickerContent = document.querySelector('.date-picker-content');
  datePickerContent.addEventListener('click', (e) => {
    e.stopPropagation();
  });

  document.getElementById('dateRangeMode').addEventListener('change', toggleRangeMode);
  
  // Other original event listeners
  document.getElementById('closeModal').addEventListener('click', closeModal);
  
  document.querySelector('.paper-modal').addEventListener('click', (event) => {
    const modal = document.querySelector('.paper-modal');
    const pdfContainer = modal.querySelector('.pdf-container');
    
    // If clicking on modal background
    if (event.target === modal) {
      // Check if PDF is in expanded state
      if (pdfContainer && pdfContainer.classList.contains('expanded')) {
        // If PDF is expanded, restore it to normal size first
        const expandButton = modal.querySelector('.pdf-expand-btn');
        if (expandButton) {
          togglePdfSize(expandButton);
        }
        // Prevent event propagation to avoid closing the entire modal
        event.stopPropagation();
      } else {
        // If PDF is not expanded, close the entire modal
        closeModal();
      }
    }
  });
  
  // Add keyboard event listeners - Esc to close modal, arrow keys to switch papers, Space to show random paper
  document.addEventListener('keydown', (event) => {
    // Check if input or textarea is focused
    const activeElement = document.activeElement;
    const isInputFocused = activeElement && (
      activeElement.tagName === 'INPUT' || 
      activeElement.tagName === 'TEXTAREA' || 
      activeElement.isContentEditable
    );
    
    if (event.key === 'Escape') {
      const paperModal = document.getElementById('paperModal');
      const datePickerModal = document.getElementById('datePickerModal');
      
      // Close paper modal
      if (paperModal.classList.contains('active')) {
        closeModal();
      }
      // Close date picker modal
      else if (datePickerModal.classList.contains('active')) {
        toggleDatePicker();
      }
    }
    // Arrow keys navigate papers (only when paper modal is open)
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      const paperModal = document.getElementById('paperModal');
      if (paperModal.classList.contains('active')) {
        event.preventDefault(); // Prevent page scrolling
        
        if (event.key === 'ArrowLeft') {
          navigateToPreviousPaper();
        } else if (event.key === 'ArrowRight') {
          navigateToNextPaper();
        }
      }
    }
    // Space key shows random paper (when no input is focused and date picker is not open)
    else if (event.key === ' ' || event.key === 'Spacebar') {
      const paperModal = document.getElementById('paperModal');
      const datePickerModal = document.getElementById('datePickerModal');
      
      // Only trigger when no input is focused and date picker is not open
      // Now allow using Space key to switch to random paper even when paper modal is open
      if (!isInputFocused && !datePickerModal.classList.contains('active')) {
        event.preventDefault(); // Prevent page refresh
        event.stopPropagation(); // Prevent event bubbling
        showRandomPaper();
      }
    }
  });
  
  // Add mouse wheel horizontal scrolling support
  const categoryScroll = document.querySelector('.category-scroll');
  const keywordScroll = document.querySelector('.keyword-scroll');
  const authorScroll = document.querySelector('.author-scroll');
  
  // Add mouse wheel event for category scrolling
  if (categoryScroll) {
    categoryScroll.addEventListener('wheel', function(e) {
      if (e.deltaY !== 0) {
        e.preventDefault();
        this.scrollLeft += e.deltaY;
      }
    });
  }
  
  // Add mouse wheel event to keyword scrolling
  if (keywordScroll) {
    keywordScroll.addEventListener('wheel', function(e) {
      if (e.deltaY !== 0) {
        e.preventDefault();
        this.scrollLeft += e.deltaY;
      }
    });
  }
  
  // Add mouse wheel event to author scrolling
  if (authorScroll) {
    authorScroll.addEventListener('wheel', function(e) {
      if (e.deltaY !== 0) {
        e.preventDefault();
        this.scrollLeft += e.deltaY;
      }
    });
  }

  // Add event listeners for category buttons
  const categoryButtons = document.querySelectorAll('.category-button');
  categoryButtons.forEach(button => {
    button.addEventListener('click', () => {
      const category = button.dataset.category;
      filterByCategory(category);
    });
  });

  // Add event listener for back to top button
  const backToTopButton = document.getElementById('backToTop');
  if (backToTopButton) {
    const updateBackToTopVisibility = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
      if (scrollTop > 300) {
        backToTopButton.classList.add('visible');
      } else {
        backToTopButton.classList.remove('visible');
      }
    };

    // Initial check (to show button if already scrolled)
    updateBackToTopVisibility();
    window.addEventListener('scroll', updateBackToTopVisibility, { passive: true });

    backToTopButton.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Add event listener for text search toggle
  const searchToggle = document.getElementById('textSearchToggle');
  const searchWrapper = document.querySelector('#textSearchContainer .search-input-wrapper');
  const searchInput = document.getElementById('textSearchInput');
  const searchClear = document.getElementById('textSearchClear');

  if (searchToggle && searchWrapper && searchInput && searchClear) {
    searchToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      searchWrapper.style.display = 'flex';
      searchInput.focus();
    });

    // Update query and re-render on input
    const handleInput = () => {
      const value = searchInput.value.trim();
      textSearchQuery = value;
      //  non-empty text : Use a toggle function
      if (textSearchQuery.length > 0) {
        if (previousActiveKeywords === null) {
          previousActiveKeywords = [...activeKeywords];
        }
        if (previousActiveAuthors === null) {
          previousActiveAuthors = [...activeAuthors];
        }
        // Disable each active keyword/author
        // Note: Copy array before iteration to avoid modifying original array during iteration
        const keywordsToDisable = [...activeKeywords];
        const authorsToDisable = [...activeAuthors];
        keywordsToDisable.forEach(k => toggleKeywordFilter(k));
        authorsToDisable.forEach(a => toggleAuthorFilter(a));
      } else {
        // Text deleted to empty, restore previous active keywords/authors
        if (previousActiveKeywords && previousActiveKeywords.length > 0) {
          previousActiveKeywords.forEach(k => {
            // If not currently active, toggle back to active
            if (!activeKeywords.includes(k)) toggleKeywordFilter(k);
          });
        }
        if (previousActiveAuthors && previousActiveAuthors.length > 0) {
          previousActiveAuthors.forEach(a => {
            if (!activeAuthors.includes(a)) toggleAuthorFilter(a);
          });
        }
        previousActiveKeywords = null;
        previousActiveAuthors = null;
        // Text empty, hide input box
        searchWrapper.style.display = 'none';
      }

      // Control clear button display
      searchClear.style.display = textSearchQuery.length > 0 ? 'inline-flex' : 'none';

      renderPapers();
    };

    searchInput.addEventListener('input', handleInput);

    // Clear button: clear text, restore other filters
    searchClear.addEventListener('click', (e) => {
      e.stopPropagation();
      searchInput.value = '';
      textSearchQuery = '';
      searchClear.style.display = 'none';
      // Restore previous filters if any
      if (previousActiveKeywords && previousActiveKeywords.length > 0) {
        previousActiveKeywords.forEach(k => {
          if (!activeKeywords.includes(k)) toggleKeywordFilter(k);
        });
      }
      if (previousActiveAuthors && previousActiveAuthors.length > 0) {
        previousActiveAuthors.forEach(a => {
          if (!activeAuthors.includes(a)) toggleAuthorFilter(a);
        });
      }
      previousActiveKeywords = null;
      previousActiveAuthors = null;
      renderPapers();
      // Clear after hiding input box
      searchWrapper.style.display = 'none';
    });

    // Blur event: if text is empty, hide input box (keep hidden if text is not empty)
    searchInput.addEventListener('blur', () => {
      const value = searchInput.value.trim();
      if (value.length === 0) {
        searchWrapper.style.display = 'none';
      }
    });

    // Clicking elsewhere does not hide the input box (requirement 4), so no blur hide logic added
  }
}

// Function to detect preferred language based on browser settings
function getPreferredLanguage() {
  const browserLang = navigator.language || navigator.userLanguage;
  // Check if browser is set to Chinese variants
  if (browserLang.startsWith('zh')) {
    return 'Chinese';
  }
  // # Korean language support (commented for future use with premium API)
  // if (browserLang.startsWith('ko')) {
  //   return 'Korean';
  // }
  // Default to English for all other languages
  return 'English';
}

// Function to select the best available language for a date
function selectLanguageForDate(date, preferredLanguage = null) {
  const availableLanguages = window.dateLanguageMap?.get(date) || [];
  
  if (availableLanguages.length === 0) {
    return 'Chinese'; // fallback
  }
  
  // Use provided preference or detect from browser
  const preferred = preferredLanguage || getPreferredLanguage();
  
  // If preferred language is available, use it
  if (availableLanguages.includes(preferred)) {
    return preferred;
  }
  
  // Fallback: prefer English if available, then Chinese, otherwise use the first available
  // # Korean language support (commented for future use with premium API)
  // if (availableLanguages.includes('Korean')) return 'Korean';
  if (availableLanguages.includes('English')) return 'English';
  if (availableLanguages.includes('Chinese')) return 'Chinese';
  return availableLanguages[0];
}

async function fetchAvailableDates() {
  try {
    // Get file list from data branch
    const fileListUrl = DATA_CONFIG.getDataUrl('assets/file-list.txt');
    const response = await fetch(fileListUrl);
    if (!response.ok) {
      console.error('Error fetching file list:', response.status);
      return [];
    }
    const text = await response.text();
    const files = text.trim().split('\n');

    const dateRegex = /(\d{4}-\d{2}-\d{2})_AI_enhanced_(English|Chinese)\.jsonl/;
    // # Korean language support (commented for future use with premium API)
    // const dateRegex = /(\d{4}-\d{2}-\d{2})_AI_enhanced_(English|Chinese|Korean)\.jsonl/;
    const dateLanguageMap = new Map(); // Store date -> available languages
    const dates = [];
    
    files.forEach(file => {
      const match = file.match(dateRegex);
      if (match && match[1] && match[2]) {
        const date = match[1];
        const language = match[2];
        
        if (!dateLanguageMap.has(date)) {
          dateLanguageMap.set(date, []);
          dates.push(date);
        }
        dateLanguageMap.get(date).push(language);
      }
    });
    
    // Store the language mapping globally for later use
    window.dateLanguageMap = dateLanguageMap;
    availableDates = [...new Set(dates)];
    availableDates.sort((a, b) => new Date(b) - new Date(a));

    initDatePicker(); // Assuming this function uses availableDates

    return availableDates;
  } catch (error) {
    console.error('Failed to fetch available dates:', error);
  }
}

function initDatePicker() {
  const datepickerInput = document.getElementById('datepicker');
  
  if (flatpickrInstance) {
    flatpickrInstance.destroy();
  }
  
  // Create mapping of available dates to disable invalid dates
  const enabledDatesMap = {};
  availableDates.forEach(date => {
    enabledDatesMap[date] = true;
  });
  
  // Configure Flatpickr
  flatpickrInstance = flatpickr(datepickerInput, {
    inline: true,
    dateFormat: "Y-m-d",
    defaultDate: availableDates[0],
    enable: [
      function(date) {
        // Modified by JH 2026-03-20: only enable dates that actually have data.
        // Previously used `dateStr <= availableDates[0]` which enabled every date
        // up to the most recent, making date-less days appear clickable but fail to load.
        const dateStr = date.getFullYear() + "-" +
                        String(date.getMonth() + 1).padStart(2, '0') + "-" +
                        String(date.getDate()).padStart(2, '0');
        return enabledDatesMap[dateStr] === true;
      }
    ],
    onChange: function(selectedDates, dateStr) {
      if (isRangeMode && selectedDates.length === 2) {
        // Handle date range selection
        const startDate = formatDateForAPI(selectedDates[0]);
        const endDate = formatDateForAPI(selectedDates[1]);
        loadPapersByDateRange(startDate, endDate);
        toggleDatePicker();
      } else if (!isRangeMode && selectedDates.length === 1) {
        // Handle single date selection
        const selectedDate = formatDateForAPI(selectedDates[0]);
        // if (availableDates.includes(selectedDate)) {
          loadPapersByDate(selectedDate);
          toggleDatePicker();
        // }
      }
    }
  });
  
  // Hide date input box
  const inputElement = document.querySelector('.flatpickr-input');
  if (inputElement) {
    inputElement.style.display = 'none';
  }
}

function formatDateForAPI(date) {
  return date.getFullYear() + "-" + 
         String(date.getMonth() + 1).padStart(2, '0') + "-" + 
         String(date.getDate()).padStart(2, '0');
}

function toggleRangeMode() {
  isRangeMode = document.getElementById('dateRangeMode').checked;
  
  if (flatpickrInstance) {
    flatpickrInstance.set('mode', isRangeMode ? 'range' : 'single');
  }
}

async function loadPapersByDate(date) {
  currentDate = date;
  document.getElementById('currentDate').textContent = formatDate(date);
  
  // Update selected date in date picker
  if (flatpickrInstance) {
    flatpickrInstance.setDate(date, false);
  }
  
  // 不再重置激活的关键词和作者
  // 而是保持当前选择状态
  
  const container = document.getElementById('paperContainer');
  container.innerHTML = `
    <div class="loading-container">
      <div class="loading-spinner"></div>
      <p>Loading paper...</p>
    </div>
  `;
  
  try {
    const selectedLanguage = selectLanguageForDate(date);
    // Get data file from data branch
    const dataUrl = DATA_CONFIG.getDataUrl(`data/${date}_AI_enhanced_${selectedLanguage}.jsonl`);
    const response = await fetch(dataUrl);
    // If file doesn't exist (e.g., returns 404), show no papers message in display area
    if (!response.ok) {
      if (response.status === 404) {
        container.innerHTML = `
          <div class="loading-container">
            <p>No papers found for this date.</p>
          </div>
        `;
        paperData = {};
        renderCategoryFilter({ sortedCategories: [], categoryCounts: {} });
        return;
      }
      throw new Error(`HTTP ${response.status}`);
    }
    const text = await response.text();
    // Empty file also shows no papers message
    if (!text || text.trim() === '') {
      container.innerHTML = `
        <div class="loading-container">
          <p>No papers found for this date.</p>
        </div>
      `;
      paperData = {};
      renderCategoryFilter({ sortedCategories: [], categoryCounts: {} });
      return;
    }
    
    paperData = parseJsonlData(text, date);
    
    const categories = getAllCategories(paperData);
    
    renderCategoryFilter(categories);
    
    renderPapers();
  } catch (error) {
    console.error('Failed to load paper data:', error);
    container.innerHTML = `
      <div class="loading-container">
        <p>Loading data fails. Please retry.</p>
        <p>Error messages: ${error.message}</p>
      </div>
    `;
  }
}

function parseJsonlData(jsonlText, date) {
  const result = {};
  
  const lines = jsonlText.trim().split('\n');
  
  lines.forEach(line => {
    try {
      const paper = JSON.parse(line);
      
      if (!paper.categories) {
        return;
      }
      
      let allCategories = Array.isArray(paper.categories) ? paper.categories : [paper.categories];
      
      const primaryCategory = allCategories[0];
      
      if (!result[primaryCategory]) {
        result[primaryCategory] = [];
      }
      
      const summary = paper.AI && paper.AI.tldr ? paper.AI.tldr : paper.summary;
      
      result[primaryCategory].push({
        title: paper.title,
        url: paper.abs || paper.pdf || `https://arxiv.org/abs/${paper.id}`,
        authors: Array.isArray(paper.authors) ? paper.authors.join(', ') : paper.authors,
        category: allCategories,
        summary: summary,
        details: paper.summary || '',
        date: date,
        id: paper.id,
        motivation: paper.AI && paper.AI.motivation ? paper.AI.motivation : '',
        method: paper.AI && paper.AI.method ? paper.AI.method : '',
        result: paper.AI && paper.AI.result ? paper.AI.result : '',
        conclusion: paper.AI && paper.AI.conclusion ? paper.AI.conclusion : '',
        code_url: paper.code_url || '',
        code_stars: paper.code_stars || 0,
        code_last_update: paper.code_last_update || ''
      });
    } catch (error) {
      console.error('解析JSON行失败:', error, line);
    }
  });
  
  return result;
}

// Get all categories and sort by preference
function getAllCategories(data) {
  const categories = Object.keys(data);
  const catePaperCount = {};
  
  categories.forEach(category => {
    catePaperCount[category] = data[category] ? data[category].length : 0;
  });
  
  return {
    sortedCategories: categories.sort((a, b) => {
      return a.localeCompare(b);
    }),
    categoryCounts: catePaperCount
  };
}

function renderCategoryFilter(categories) {
  const container = document.querySelector('.category-scroll');
  const { sortedCategories, categoryCounts } = categories;
  
  let totalPapers = 0;
  Object.values(categoryCounts).forEach(count => {
    totalPapers += count;
  });
  
  container.innerHTML = `
    <button class="category-button ${currentCategory === 'all' ? 'active' : ''}" data-category="all">All<span class="category-count">${totalPapers}</span></button>
  `;
  
  sortedCategories.forEach(category => {
    const count = categoryCounts[category];
    const button = document.createElement('button');
    button.className = `category-button ${category === currentCategory ? 'active' : ''}`;
    button.innerHTML = `${category}<span class="category-count">${count}</span>`;
    button.dataset.category = category;
    button.addEventListener('click', () => {
      filterByCategory(category);
    });
    
    container.appendChild(button);
  });
  
  document.querySelector('.category-button[data-category="all"]').addEventListener('click', () => {
    filterByCategory('all');
  });
}

function filterByCategory(category) {
  currentCategory = category;
  
  document.querySelectorAll('.category-button').forEach(button => {
    button.classList.toggle('active', button.dataset.category === category);
  });
  
  // Keep current active filter tags
  renderFilterTags();
  
  // Reset page scroll to top
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
  
  renderPapers();
}

// Highlight matching content in text
function highlightMatches(text, terms, className = 'highlight-match') {
  if (!terms || terms.length === 0 || !text) {
    return text;
  }
  
  let result = text;
  
  // 按照长度排序关键词，从长到短，避免短词先替换导致长词匹配失败
  const sortedTerms = [...terms].sort((a, b) => b.length - a.length);
  
  // 为每个词创建一个正则表达式，使用 'gi' 标志进行全局、不区分大小写的匹配
  sortedTerms.forEach(term => {
    const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    result = result.replace(regex, `<span class="${className}">$1</span>`);
  });
  
  return result;
}

// Format author list for paper card display
// Rule: <=4 authors show all, >4 authors show first 2+last 2, with ellipsis in between
function formatAuthorsForCard(authorsString, authorTerms = []) {
  if (!authorsString) {
    return '';
  }
  
  // Parse author string into array (handle comma-separated cases)
  const authorsArray = authorsString.split(',').map(author => author.trim()).filter(author => author.length > 0);
  
  if (authorsArray.length === 0) {
    return '';
  }
  
  // If not more than 4 authors, show all
  if (authorsArray.length <= 4) {
    return authorsArray.map(author => {
      // Apply highlight to each author
      const highlightedAuthor = authorTerms.length > 0 
        ? highlightMatches(author, authorTerms, 'author-highlight')
        : author;
      return `<span class="author-item">${highlightedAuthor}</span>`;
    }).join(', ');
  }
  
  // If more than 4 authors, show first 2+last 2 with ellipsis
  const firstTwo = authorsArray.slice(0, 2);
  const lastTwo = authorsArray.slice(-2);
  
  const result = [];
  
  // First 2 authors
  firstTwo.forEach(author => {
    const highlightedAuthor = authorTerms.length > 0 
      ? highlightMatches(author, authorTerms, 'author-highlight')
      : author;
    result.push(`<span class="author-item">${highlightedAuthor}</span>`);
  });
  
  // Ellipsis
  result.push('<span class="author-ellipsis">...</span>');
  
  // Last 2 authors
  lastTwo.forEach(author => {
    const highlightedAuthor = authorTerms.length > 0 
      ? highlightMatches(author, authorTerms, 'author-highlight')
      : author;
    result.push(`<span class="author-item">${highlightedAuthor}</span>`);
  });
  
  return result.join(', ');
}

function renderPapers() {
  const container = document.getElementById('paperContainer');
  container.innerHTML = '';
  container.className = `paper-container ${currentView === 'list' ? 'list-view' : ''}`;
  
  let papers = [];
  if (currentCategory === 'all') {
    const { sortedCategories } = getAllCategories(paperData);
    sortedCategories.forEach(category => {
      if (paperData[category]) {
        papers = papers.concat(paperData[category]);
      }
    });
  } else if (paperData[currentCategory]) {
    papers = paperData[currentCategory];
  }
  
  // Create collection of papers matching filters
  let filteredPapers = [...papers];

  // Reset all papers' match status to avoid residual from previous render
  filteredPapers.forEach(p => {
    p.isMatched = false;
    p.matchReason = undefined;
  });

  // Text search priority: when non-empty text exists, sort like keywords/authors without hiding
  if (textSearchQuery && textSearchQuery.trim().length > 0) {
    const q = textSearchQuery.toLowerCase();

    // Sort: matched papers first
    filteredPapers.sort((a, b) => {
      const hayA = [
        a.title,
        a.authors,
        Array.isArray(a.category) ? a.category.join(', ') : a.category,
        a.summary,
        a.details || '',
        a.motivation || '',
        a.method || '',
        a.result || '',
        a.conclusion || ''
      ].join(' ').toLowerCase();
      const hayB = [
        b.title,
        b.authors,
        Array.isArray(b.category) ? b.category.join(', ') : b.category,
        b.summary,
        b.details || '',
        b.motivation || '',
        b.method || '',
        b.result || '',
        b.conclusion || ''
      ].join(' ').toLowerCase();
      const am = hayA.includes(q);
      const bm = hayB.includes(q);
      if (am && !bm) return -1;
      if (!am && bm) return 1;
      return 0;
    });

    // Mark matched items for card styles and tooltips
    filteredPapers.forEach(p => {
      const hay = [
        p.title,
        p.authors,
        Array.isArray(p.category) ? p.category.join(', ') : p.category,
        p.summary,
        p.details || '',
        p.motivation || '',
        p.method || '',
        p.result || '',
        p.conclusion || ''
      ].join(' ').toLowerCase();
      const matched = hay.includes(q);
      p.isMatched = matched;
      p.matchReason = matched ? [`文本: ${textSearchQuery}`] : undefined;
    });
  } else {
    // Keywords and authors match, but do not filter, only sort
    if (activeKeywords.length > 0 || activeAuthors.length > 0) {
      // Sort papers, put matched papers first
      filteredPapers.sort((a, b) => {
        const aMatchesKeyword = activeKeywords.length > 0 ? 
          activeKeywords.some(keyword => {
            // 仅在标题和摘要中搜索关键词
            const searchText = `${a.title} ${a.summary}`.toLowerCase();
            return searchText.includes(keyword.toLowerCase());
          }) : false;
          
        const aMatchesAuthor = activeAuthors.length > 0 ?
          activeAuthors.some(author => {
            // 仅在作者中搜索作者名
            return a.authors.toLowerCase().includes(author.toLowerCase());
          }) : false;
          
        const bMatchesKeyword = activeKeywords.length > 0 ?
          activeKeywords.some(keyword => {
            // 仅在标题和摘要中搜索关键词
            const searchText = `${b.title} ${b.summary}`.toLowerCase();
            return searchText.includes(keyword.toLowerCase());
          }) : false;
          
        const bMatchesAuthor = activeAuthors.length > 0 ?
          activeAuthors.some(author => {
            // 仅在作者中搜索作者名
            return b.authors.toLowerCase().includes(author.toLowerCase());
          }) : false;
      
        // a和b的匹配状态（关键词或作者匹配都算）
        const aMatches = aMatchesKeyword || aMatchesAuthor;
        const bMatches = bMatchesKeyword || bMatchesAuthor;
        
        if (aMatches && !bMatches) return -1;
        if (!aMatches && bMatches) return 1;
        return 0;
      });
      
      // 标记匹配的论文
      filteredPapers.forEach(paper => {
        const matchesKeyword = activeKeywords.length > 0 ?
          activeKeywords.some(keyword => {
            const searchText = `${paper.title} ${paper.summary}`.toLowerCase();
            return searchText.includes(keyword.toLowerCase());
          }) : false;
          
        const matchesAuthor = activeAuthors.length > 0 ?
          activeAuthors.some(author => {
            return paper.authors.toLowerCase().includes(author.toLowerCase());
          }) : false;
          
        // 添加匹配标记（用于后续高亮整个论文卡片）
        paper.isMatched = matchesKeyword || matchesAuthor;
        
        // 添加匹配原因（用于显示匹配提示）
        if (paper.isMatched) {
          paper.matchReason = [];
          if (matchesKeyword) {
            const matchedKeywords = activeKeywords.filter(keyword => 
              `${paper.title} ${paper.summary}`.toLowerCase().includes(keyword.toLowerCase())
            );
            if (matchedKeywords.length > 0) {
              paper.matchReason.push(`关键词: ${matchedKeywords.join(', ')}`);
            }
          }
          if (matchesAuthor) {
            const matchedAuthors = activeAuthors.filter(author => 
              paper.authors.toLowerCase().includes(author.toLowerCase())
            );
            if (matchedAuthors.length > 0) {
              paper.matchReason.push(`作者: ${matchedAuthors.join(', ')}`);
            }
          }
        }
      });
    }
  }
  
  // Keywords and authors match, but do not filter, only sort
  if (activeKeywords.length > 0 || activeAuthors.length > 0) {
    // Sort papers, put matched papers first
    filteredPapers.sort((a, b) => {
      const aMatchesKeyword = activeKeywords.length > 0 ? 
        activeKeywords.some(keyword => {
          // Search keywords only in title and summary
          const searchText = `${a.title} ${a.summary}`.toLowerCase();
          return searchText.includes(keyword.toLowerCase());
        }) : false;
        
      const aMatchesAuthor = activeAuthors.length > 0 ?
        activeAuthors.some(author => {
          // Search authors only in authors field
          return a.authors.toLowerCase().includes(author.toLowerCase());
        }) : false;
        
      const bMatchesKeyword = activeKeywords.length > 0 ?
        activeKeywords.some(keyword => {
          // Search keywords only in title and summary
          const searchText = `${b.title} ${b.summary}`.toLowerCase();
          return searchText.includes(keyword.toLowerCase());
        }) : false;
        
      const bMatchesAuthor = activeAuthors.length > 0 ?
        activeAuthors.some(author => {
          // Search authors only in authors field
          return b.authors.toLowerCase().includes(author.toLowerCase());
        }) : false;
      
      // a and b match status (keyword or author match counts)
      const aMatches = aMatchesKeyword || aMatchesAuthor;
      const bMatches = bMatchesKeyword || bMatchesAuthor;
      
      if (aMatches && !bMatches) return -1;
      if (!aMatches && bMatches) return 1;
      return 0;
    });
    
    // Mark matched papers
    filteredPapers.forEach(paper => {
      const matchesKeyword = activeKeywords.length > 0 ?
        activeKeywords.some(keyword => {
          const searchText = `${paper.title} ${paper.summary}`.toLowerCase();
          return searchText.includes(keyword.toLowerCase());
        }) : false;
        
      const matchesAuthor = activeAuthors.length > 0 ?
        activeAuthors.some(author => {
          return paper.authors.toLowerCase().includes(author.toLowerCase());
        }) : false;
        
      // Add match mark (for later highlighting the entire paper card)
      paper.isMatched = matchesKeyword || matchesAuthor;
      
      // Add match reason (for display of match提示）
      if (paper.isMatched) {
        paper.matchReason = [];
        if (matchesKeyword) {
          const matchedKeywords = activeKeywords.filter(keyword => 
            `${paper.title} ${paper.summary}`.toLowerCase().includes(keyword.toLowerCase())
          );
          if (matchedKeywords.length > 0) {
            paper.matchReason.push(`关键词: ${matchedKeywords.join(', ')}`);
          }
        }
        if (matchesAuthor) {
          const matchedAuthors = activeAuthors.filter(author => 
            paper.authors.toLowerCase().includes(author.toLowerCase())
          );
          if (matchedAuthors.length > 0) {
            paper.matchReason.push(`作者: ${matchedAuthors.join(', ')}`);
          }
        }
      }
    });
  }
  
  // Store current filtered papers for arrow key navigation
  currentFilteredPapers = [...filteredPapers];
  
  if (filteredPapers.length === 0) {
    container.innerHTML = `
      <div class="loading-container">
        <p>No paper found.</p>
      </div>
    `;
    return;
  }
  
  filteredPapers.forEach((paper, index) => {
    const paperCard = document.createElement('div');
    // Add match highlight class
    paperCard.className = `paper-card ${paper.isMatched ? 'matched-paper' : ''}`;
    paperCard.dataset.id = paper.id || paper.url;
    
    if (paper.isMatched) {
      // Add match reason tooltip
      paperCard.title = `匹配: ${paper.matchReason.join(' | ')}`;
    }
    
    const categoryTags = paper.allCategories ? 
      paper.allCategories.map(cat => `<span class="category-tag">${cat}</span>`).join('') : 
      `<span class="category-tag">${paper.category}</span>`;
    
    // Combine terms to highlight: keywords + text search
    const titleSummaryTerms = [];
    if (activeKeywords.length > 0) {
      titleSummaryTerms.push(...activeKeywords);
    }
    if (textSearchQuery && textSearchQuery.trim().length > 0) {
      titleSummaryTerms.push(textSearchQuery.trim());
    }

    // Highlight title and summary (keywords + text search)
    const highlightedTitle = titleSummaryTerms.length > 0 
      ? highlightMatches(paper.title, titleSummaryTerms, 'keyword-highlight') 
      : paper.title;
    const highlightedSummary = titleSummaryTerms.length > 0 
      ? highlightMatches(paper.summary, titleSummaryTerms, 'keyword-highlight') 
      : paper.summary;

    // Highlight authors (author filter + text search)
    const authorTerms = [];
    if (activeAuthors.length > 0) authorTerms.push(...activeAuthors);
    if (textSearchQuery && textSearchQuery.trim().length > 0) authorTerms.push(textSearchQuery.trim());
    
    // Format author list (apply truncation rules and highlighting)
    const formattedAuthors = formatAuthorsForCard(paper.authors, authorTerms);
    
    // Build GitHub button HTML
    // let githubHtml = '';
    // if (paper.code_url) {
    //   const stars = paper.code_stars ? `<span class="github-stars">★ ${paper.code_stars}</span>` : '';
    //   const isHot = paper.code_stars > 100;
      
    //   githubHtml = `
    //     <a href="${paper.code_url}" target="_blank" class="github-link" title="View Code" onclick="event.stopPropagation()">
    //       <svg height="16" width="16" viewBox="0 0 16 16" fill="currentColor" style="vertical-align: text-bottom; margin-right: 4px;">
    //         <path fill-rule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
    //       </svg>
    //       Code ${stars}
    //       ${isHot ? '<span class="hot-icon">🔥</span>' : ''}
    //     </a>
    //   `;
    // }

    paperCard.innerHTML = `
      <div class="paper-card-index">${index + 1}</div>
      ${paper.isMatched ? '<div class="match-badge" title="匹配您的搜索条件"></div>' : ''}
      <div class="paper-card-header">
        <h3 class="paper-card-title">${highlightedTitle}</h3>
        <p class="paper-card-authors">${formattedAuthors}</p>
        <div class="paper-card-categories">
          ${categoryTags}
        </div>
      </div>
      <div class="paper-card-body">
        <p class="paper-card-summary">${highlightedSummary}</p>
        <div class="paper-card-footer">
          <div class="footer-left">
            <span class="paper-card-date">${formatDate(paper.date)}</span>
          </div>
          <span class="paper-card-link">Details</span>
        </div>
      </div>
    `;
    
    paperCard.addEventListener('click', () => {
      currentPaperIndex = index; // Record current clicked paper index
      showPaperDetails(paper, index + 1);
    });
    
    container.appendChild(paperCard);
  });
}

function showPaperDetails(paper, paperIndex) {
  const modal = document.getElementById('paperModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalBody = document.getElementById('modalBody');
  const paperLink = document.getElementById('paperLink');
  const pdfLink = document.getElementById('pdfLink');
  const htmlLink = document.getElementById('htmlLink');
  
  // Reset modal scroll position
  modalBody.scrollTop = 0;
  
  // Combine highlight terms: keywords + text search
  const modalTitleTerms = [];
  if (activeKeywords.length > 0) modalTitleTerms.push(...activeKeywords);
  if (textSearchQuery && textSearchQuery.trim().length > 0) modalTitleTerms.push(textSearchQuery.trim());
  // Highlight title
  const highlightedTitle = modalTitleTerms.length > 0 
    ? highlightMatches(paper.title, modalTitleTerms, 'keyword-highlight') 
    : paper.title;
  
  // Add index number before title
  modalTitle.innerHTML = paperIndex ? `<span class="paper-index-badge">${paperIndex}</span> ${highlightedTitle}` : highlightedTitle;
  
  const abstractText = paper.details || '';
  
  const categoryDisplay = paper.allCategories ? 
    paper.allCategories.join(', ') : 
    paper.category;
  
  // Highlight authors (author filter + text search)
  const modalAuthorTerms = [];
  if (activeAuthors.length > 0) modalAuthorTerms.push(...activeAuthors);
  if (textSearchQuery && textSearchQuery.trim().length > 0) modalAuthorTerms.push(textSearchQuery.trim());
  const highlightedAuthors = modalAuthorTerms.length > 0 
    ? highlightMatches(paper.authors, modalAuthorTerms, 'author-highlight') 
    : paper.authors;
  
  // Highlight summary (keywords + text search)
  const highlightedSummary = modalTitleTerms.length > 0 
    ? highlightMatches(paper.summary, modalTitleTerms, 'keyword-highlight') 
    : paper.summary;
  
  // Highlight abstract (Abstract/details)
  const highlightedAbstract = modalTitleTerms.length > 0 
    ? highlightMatches(abstractText, modalTitleTerms, 'keyword-highlight') 
    : abstractText;
  
  // Highlight other sections (if exist and part of abstract)
  const highlightedMotivation = paper.motivation && modalTitleTerms.length > 0 
    ? highlightMatches(paper.motivation, modalTitleTerms, 'keyword-highlight') 
    : paper.motivation;
  
  const highlightedMethod = paper.method && modalTitleTerms.length > 0 
    ? highlightMatches(paper.method, modalTitleTerms, 'keyword-highlight') 
    : paper.method;
  
  const highlightedResult = paper.result && modalTitleTerms.length > 0 
    ? highlightMatches(paper.result, modalTitleTerms, 'keyword-highlight') 
    : paper.result;
  
  const highlightedConclusion = paper.conclusion && modalTitleTerms.length > 0 
    ? highlightMatches(paper.conclusion, modalTitleTerms, 'keyword-highlight') 
    : paper.conclusion;
  
  // Determine if highlight legend should be shown
  const showHighlightLegend = activeKeywords.length > 0 || activeAuthors.length > 0;
  
  // Add match mark
  const matchedPaperClass = paper.isMatched ? 'matched-paper-details' : '';
  
  const modalContent = `
    <div class="paper-details ${matchedPaperClass}">
      <p><strong>Authors: </strong>${highlightedAuthors}</p>
      <p><strong>Categories: </strong>${categoryDisplay}</p>
      <p><strong>Date: </strong>${formatDate(paper.date)}</p>
      
      
      <h3>TL;DR</h3>
      <p>${highlightedSummary}</p>
      
      <div class="paper-sections">
        ${paper.motivation ? `<div class="paper-section"><h4>Motivation</h4><p>${highlightedMotivation}</p></div>` : ''}
        ${paper.method ? `<div class="paper-section"><h4>Method</h4><p>${highlightedMethod}</p></div>` : ''}
        ${paper.result ? `<div class="paper-section"><h4>Result</h4><p>${highlightedResult}</p></div>` : ''}
        ${paper.conclusion ? `<div class="paper-section"><h4>Conclusion</h4><p>${highlightedConclusion}</p></div>` : ''}
      </div>
      
      ${highlightedAbstract ? `<h3>Abstract</h3><p class="original-abstract">${highlightedAbstract}</p>` : ''}
      
      <div class="pdf-preview-section">
        <div class="pdf-header">
          <h3>PDF Preview</h3>
          <button class="pdf-expand-btn" onclick="togglePdfSize(this)">
            <svg class="expand-icon" viewBox="0 0 24 24" width="24" height="24">
              <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
            </svg>
            <svg class="collapse-icon" viewBox="0 0 24 24" width="24" height="24" style="display: none;">
              <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/>
            </svg>
          </button>
        </div>
        <div class="pdf-container">
          <iframe src="${paper.url.replace('abs', 'pdf')}" width="100%" height="800px" frameborder="0"></iframe>
        </div>
      </div>
    </div>
  `;
  
  // Update modal content
  document.getElementById('modalBody').innerHTML = modalContent;
  document.getElementById('paperLink').href = paper.url;
  document.getElementById('pdfLink').href = paper.url.replace('abs', 'pdf');
  document.getElementById('htmlLink').href = paper.url.replace('abs', 'html');
  
  // --- GitHub Button Logic ---
  const githubLink = document.getElementById('githubLink');
  
  if (paper.code_url) {
    githubLink.href = paper.code_url;
    githubLink.style.display = 'flex'; 
    githubLink.title = "View Code on GitHub";
  } else {
    githubLink.style.display = 'none';
  }
  // ---------------------------

  // Prompt from: https://papers.cool/-------------------------------------------------------------
  // prompt = `Read this paper ${paper.url.replace('abs', 'pdf')}, summarize the problems solved, related work, research methods, experiments and results, conclusion, and finally summarize the content of this paper.`
  // document.getElementById('GeminiLink').href = `https://gemini.google.com/app?text=You%20are%20an%20academic%20assistant.%20The%20conversation%20will%20revolve%20around%20the%20content%20of%20the%20paper.%20Answer%20professionally%20in%20the%20third%20person%20and%20use%20Markdown.%0A%0A${prompt}`;
  const systemInstruction = "You are an academic assistant. The conversation will revolve around the content of the paper. Answer professionally in the third person and use Markdown.";
  const taskPrompt = `Read this paper ${paper.url.replace('abs', 'pdf')}, summarize the problems solved, related work, research methods, experiments and results, conclusion, and finally summarize the content of this paper.`;

  // Concatenate system instruction and task prompt
  const fullQuery = `${systemInstruction}\n\n${taskPrompt}`;

  document.getElementById('GeminiLink').href = `https://gemini.google.com/app?text=${encodeURIComponent(fullQuery)}`;
  // -----------------------------------------------------------------------------------------------
  
  // Update paper position information
  const paperPosition = document.getElementById('paperPosition');
  if (paperPosition && currentFilteredPapers.length > 0) {
    paperPosition.textContent = `${currentPaperIndex + 1} / ${currentFilteredPapers.length}`;
  }
  
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  const modal = document.getElementById('paperModal');
  const modalBody = document.getElementById('modalBody');
  
  // Reset modal scroll position
  modalBody.scrollTop = 0;
  
  modal.classList.remove('active');
  document.body.style.overflow = '';
}

// Navigate to previous paper
function navigateToPreviousPaper() {
  if (currentFilteredPapers.length === 0) return;
  
  currentPaperIndex = currentPaperIndex > 0 ? currentPaperIndex - 1 : currentFilteredPapers.length - 1;
  const paper = currentFilteredPapers[currentPaperIndex];
  showPaperDetails(paper, currentPaperIndex + 1);
}

// Navigate to next paper
function navigateToNextPaper() {
  if (currentFilteredPapers.length === 0) return;
  
  currentPaperIndex = currentPaperIndex < currentFilteredPapers.length - 1 ? currentPaperIndex + 1 : 0;
  const paper = currentFilteredPapers[currentPaperIndex];
  showPaperDetails(paper, currentPaperIndex + 1);
}

// Show random paper
function showRandomPaper() {
  // Check if there are available papers
  if (currentFilteredPapers.length === 0) {
    console.log('No papers available to show random paper');
    return;
  }
  
  // Generate random index
  const randomIndex = Math.floor(Math.random() * currentFilteredPapers.length);
  const randomPaper = currentFilteredPapers[randomIndex];
  
  // Update current paper index
  currentPaperIndex = randomIndex;
  
  // Show random paper
  showPaperDetails(randomPaper, currentPaperIndex + 1);
  
  // Show random paper indicator
  showRandomPaperIndicator();
  
  console.log(`Showing random paper: ${randomIndex + 1}/${currentFilteredPapers.length}`);
}

// Show random paper indicator
function showRandomPaperIndicator() {
  // Remove existing indicator
  const existingIndicator = document.querySelector('.random-paper-indicator');
  if (existingIndicator) {
    existingIndicator.remove();
  }
  
  // Create new indicator
  const indicator = document.createElement('div');
  indicator.className = 'random-paper-indicator';
  indicator.textContent = 'Random Paper';
  
  // Add to page
  document.body.appendChild(indicator);
  
  // Remove after 3 seconds
  setTimeout(() => {
    if (indicator && indicator.parentNode) {
      indicator.remove();
    }
  }, 3000);
}

function toggleDatePicker() {
  const datePicker = document.getElementById('datePickerModal');
  datePicker.classList.toggle('active');
  
  if (datePicker.classList.contains('active')) {
    document.body.style.overflow = 'hidden';
    
    // Reinitialize date picker to ensure it reflects the latest available dates
    if (flatpickrInstance) {
      flatpickrInstance.setDate(currentDate, false);
    }
  } else {
    document.body.style.overflow = '';
  }
}

function toggleView() {
  currentView = currentView === 'grid' ? 'list' : 'grid';
  document.getElementById('paperContainer').classList.toggle('list-view', currentView === 'list');
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric'
  });
}

async function loadPapersByDateRange(startDate, endDate) {
  // Get all valid dates within the selected date range
  const validDatesInRange = availableDates.filter(date => {
    return date >= startDate && date <= endDate;
  });
  
  if (validDatesInRange.length === 0) {
    alert('No available papers in the selected date range.');
    return;
  }
  
  currentDate = `${startDate} to ${endDate}`;
  document.getElementById('currentDate').textContent = `${formatDate(startDate)} - ${formatDate(endDate)}`;
  
  // Do not reset active keywords and authors
  // Instead, keep the current selection state
  
  const container = document.getElementById('paperContainer');
  container.innerHTML = `
    <div class="loading-container">
      <div class="loading-spinner"></div>
      <p>Loading papers from ${formatDate(startDate)} to ${formatDate(endDate)}...</p>
    </div>
  `;
  
  try {
    // Load paper data for all dates
    const allPaperData = {};
    
    for (const date of validDatesInRange) {
      const selectedLanguage = selectLanguageForDate(date);
      // Get data file from data branch
      const dataUrl = DATA_CONFIG.getDataUrl(`data/${date}_AI_enhanced_${selectedLanguage}.jsonl`);
      const response = await fetch(dataUrl);
      const text = await response.text();
      const dataPapers = parseJsonlData(text, date);
      
      // Merge data
      Object.keys(dataPapers).forEach(category => {
        if (!allPaperData[category]) {
          allPaperData[category] = [];
        }
        allPaperData[category] = allPaperData[category].concat(dataPapers[category]);
      });
    }
    
    paperData = allPaperData;
    
    const categories = getAllCategories(paperData);
    
    renderCategoryFilter(categories);
    
    renderPapers();
  } catch (error) {
    console.error('Failed to load paper data:', error);
    container.innerHTML = `
      <div class="loading-container">
        <p>Loading data fails. Please retry.</p>
        <p>Error messages: ${error.message}</p>
      </div>
    `;
  }
}

// Clear all active keywords
function clearAllKeywords() {
  activeKeywords = [];
  // renderKeywordTags();
  // Re-render paper list, remove keyword match highlighting and priority sorting
  renderPapers();
}

// Clear all author filters
function clearAllAuthors() {
  activeAuthors = [];
  renderFilterTags();
  // Re-render paper list, remove author match highlighting and priority sorting
  renderPapers();
}

// Toggle PDF preview size
function togglePdfSize(button) {
  const pdfContainer = button.closest('.pdf-preview-section').querySelector('.pdf-container');
  const iframe = pdfContainer.querySelector('iframe');
  const expandIcon = button.querySelector('.expand-icon');
  const collapseIcon = button.querySelector('.collapse-icon');
  
  if (pdfContainer.classList.contains('expanded')) {
    // Restore normal size
    pdfContainer.classList.remove('expanded');
    iframe.style.height = '800px';
    expandIcon.style.display = 'block';
    collapseIcon.style.display = 'none';
    
    // Remove overlay
    const overlay = document.querySelector('.pdf-overlay');
    if (overlay) {
      overlay.remove();
    }
  } else {
    // Expand display
    pdfContainer.classList.add('expanded');
    iframe.style.height = '90vh';
    expandIcon.style.display = 'none';
    collapseIcon.style.display = 'block';
    
    // Add overlay
    const overlay = document.createElement('div');
    overlay.className = 'pdf-overlay';
    document.body.appendChild(overlay);
    
    // Click overlay to collapse PDF
    overlay.addEventListener('click', () => {
      togglePdfSize(button);
    });
  }
}
