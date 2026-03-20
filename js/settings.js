document.addEventListener('DOMContentLoaded', () => {
  initSettings();
  initEventListeners();
  fetchGitHubStats();
});

// Initialize settings, load saved settings from localStorage
function initSettings() {
  // Keyword preference settings
  loadKeywordPreferences();
  // Author preference settings
  loadAuthorPreferences();
}

// Load keyword preferences from localStorage
function loadKeywordPreferences() {
  const selectedKeywordsContainer = document.getElementById('selectedKeywords');
  selectedKeywordsContainer.innerHTML = '';
  
  // Get saved keywords, use default if none
  let savedKeywords = localStorage.getItem('preferredKeywords');
  let keywords = []; // Default no keywords
  
  if (savedKeywords) {
    try {
      keywords = JSON.parse(savedKeywords);
    } catch (e) {
      console.error('Failed to parse saved keywords:', e);
    }
  }
  
  // Display saved keywords
  if (keywords.length > 0) {
    keywords.forEach(keyword => {
      addKeywordTag(keyword);
    });
  } else {
    // Show empty tag message
    showEmptyTagMessage();
  }
}

// Load author preferences from localStorage
function loadAuthorPreferences() {
  const selectedAuthorsContainer = document.getElementById('selectedAuthors');
  selectedAuthorsContainer.innerHTML = '';
  
  // Get saved authors, empty array if none
  let savedAuthors = localStorage.getItem('preferredAuthors');
  let authors = []; // Default no authors
  
  if (savedAuthors) {
    try {
      authors = JSON.parse(savedAuthors);
    } catch (e) {
      console.error('Failed to parse saved authors:', e);
    }
  }
  
  // Display saved authors
  if (authors.length > 0) {
    authors.forEach(author => {
      addAuthorTag(author);
    });
  } else {
    // Show empty tag message
    showEmptyAuthorMessage();
  }
}

// 显示空标签消息
function showEmptyTagMessage() {
  const selectedKeywordsContainer = document.getElementById('selectedKeywords');
  const emptyMessage = document.createElement('div');
  emptyMessage.id = 'emptyTagMessage';
  emptyMessage.className = 'empty-tag-message';
  emptyMessage.textContent = 'No keywords added yet. Add some keywords below.';
  selectedKeywordsContainer.appendChild(emptyMessage);
}

// Show empty author tag message
function showEmptyAuthorMessage() {
  const selectedAuthorsContainer = document.getElementById('selectedAuthors');
  const emptyMessage = document.createElement('div');
  emptyMessage.id = 'emptyAuthorMessage';
  emptyMessage.className = 'empty-tag-message';
  emptyMessage.textContent = 'No authors added yet. Add some authors below.';
  selectedAuthorsContainer.appendChild(emptyMessage);
}

// Hide empty tag message
function hideEmptyTagMessage() {
  const emptyMessage = document.getElementById('emptyTagMessage');
  if (emptyMessage) {
    emptyMessage.remove();
  }
}

// Hide empty author tag message
function hideEmptyAuthorMessage() {
  const emptyMessage = document.getElementById('emptyAuthorMessage');
  if (emptyMessage) {
    emptyMessage.remove();
  }
}

// Add keyword tag
function addKeywordTag(keyword) {
  const selectedKeywordsContainer = document.getElementById('selectedKeywords');
  
  // Remove empty tag message
  hideEmptyTagMessage();
  
  // Check if keyword already exists
  const existingTags = selectedKeywordsContainer.querySelectorAll('.category-button');
  for (let i = 0; i < existingTags.length; i++) {
    if (existingTags[i].textContent.trim().startsWith(keyword)) {
      // Keyword already exists, add blink animation to notify user
      existingTags[i].classList.add('tag-highlight');
      setTimeout(() => {
        existingTags[i].classList.remove('tag-highlight');
      }, 1000);
      return; // Keyword already exists, don't add
    }
  }
  
  // Create new keyword tag
  const tagElement = document.createElement('span');
  tagElement.className = 'category-button tag-appear';
  tagElement.innerHTML = `${keyword} <button class="remove-tag">×</button>`;
  
  // 添加删除按钮事件
  const removeButton = tagElement.querySelector('.remove-tag');
  removeButton.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Add delete animation
    tagElement.classList.add('tag-disappear');
    
    // Remove element after animation ends
    setTimeout(() => {
      tagElement.remove();
      
      // If no tags left, show empty tag message
      if (selectedKeywordsContainer.querySelectorAll('.category-button').length === 0) {
        showEmptyTagMessage();
      }
    }, 300);
  });
  
  selectedKeywordsContainer.appendChild(tagElement);
  
  // Remove animation class after adding appearance animation
  setTimeout(() => {
    tagElement.classList.remove('tag-appear');
  }, 300);
}

// Add author tag
function addAuthorTag(author) {
  const selectedAuthorsContainer = document.getElementById('selectedAuthors');
  
  // Remove empty tag message
  hideEmptyAuthorMessage();
  
  // Check if author already exists
  const existingTags = selectedAuthorsContainer.querySelectorAll('.category-button');
  for (let i = 0; i < existingTags.length; i++) {
    if (existingTags[i].textContent.trim().startsWith(author)) {
      // Author already exists, add blink animation to notify user
      existingTags[i].classList.add('tag-highlight');
      setTimeout(() => {
        existingTags[i].classList.remove('tag-highlight');
      }, 1000);
      return; // Author already exists, don't add
    }
  }
  
  // Create new author tag
  const tagElement = document.createElement('span');
  tagElement.className = 'category-button tag-appear';
  tagElement.innerHTML = `${author} <button class="remove-tag">×</button>`;
  
  // 添加删除按钮事件
  const removeButton = tagElement.querySelector('.remove-tag');
  removeButton.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Add delete animation
    tagElement.classList.add('tag-disappear');
    
    // Remove element after animation ends
    setTimeout(() => {
      tagElement.remove();
      
      // If no tags left, show empty tag message
      if (selectedAuthorsContainer.querySelectorAll('.category-button').length === 0) {
        showEmptyAuthorMessage();
      }
    }, 300);
  });
  
  selectedAuthorsContainer.appendChild(tagElement);
  
  // Remove animation class after adding appearance animation
  setTimeout(() => {
    tagElement.classList.remove('tag-appear');
  }, 300);
}

// Initialize event listeners
function initEventListeners() {
  // Keyword add button
  const addKeywordButton = document.getElementById('addKeyword');
  addKeywordButton.addEventListener('click', () => {
    const keywordInput = document.getElementById('keywordInput');
    const keyword = keywordInput.value.trim();
    
    if (keyword) {
      addKeywordTag(keyword);
      keywordInput.value = '';
    }
  });
  
  // Keyword input enter event
  const keywordInput = document.getElementById('keywordInput');
  keywordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const keyword = keywordInput.value.trim();
      
      if (keyword) {
        addKeywordTag(keyword);
        keywordInput.value = '';
      }
    }
  });
  
  // Author add button
  const addAuthorButton = document.getElementById('addAuthor');
  addAuthorButton.addEventListener('click', () => {
    const authorInput = document.getElementById('authorInput');
    const author = authorInput.value.trim();
    
    if (author) {
      addAuthorTag(author);
      authorInput.value = '';
    }
  });
  
  // Author input enter event
  const authorInput = document.getElementById('authorInput');
  authorInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const author = authorInput.value.trim();
      
      if (author) {
        addAuthorTag(author);
        authorInput.value = '';
      }
    }
  });
  
  // Save settings button
  const saveSettingsButton = document.getElementById('saveSettings');
  saveSettingsButton.addEventListener('click', saveSettings);
  
  // Reset settings button
  const resetSettingsButton = document.getElementById('resetSettings');
  resetSettingsButton.addEventListener('click', resetSettings);
}

// Save settings
function saveSettings() {
  // Get all selected keywords
  const keywordTags = document.getElementById('selectedKeywords').querySelectorAll('.category-button');
  const keywords = [];
  keywordTags.forEach(tag => {
    const keywordName = tag.textContent.trim().replace('×', '').trim();
    keywords.push(keywordName);
  });
  
  // Get all selected authors
  const authorTags = document.getElementById('selectedAuthors').querySelectorAll('.category-button');
  const authors = [];
  authorTags.forEach(tag => {
    const authorName = tag.textContent.trim().replace('×', '').trim();
    authors.push(authorName);
  });
  
  // Save settings to localStorage
  localStorage.setItem('preferredKeywords', JSON.stringify(keywords));
  localStorage.setItem('preferredAuthors', JSON.stringify(authors));
  
  // Show save success notification with success icon
  showNotification('Settings saved successfully!', 'success');
}

// Reset settings
function resetSettings() {
  // Reset keywords
  const selectedKeywordsContainer = document.getElementById('selectedKeywords');
  selectedKeywordsContainer.innerHTML = '';
  
  // Reset authors
  const selectedAuthorsContainer = document.getElementById('selectedAuthors');
  selectedAuthorsContainer.innerHTML = '';
  
  // Show empty tag message
  showEmptyTagMessage();
  showEmptyAuthorMessage();
  
  // Show reset success notification
  showNotification('Settings reset to default!', 'info');
}

// Show notification
function showNotification(message, type = 'success') {
  // Check if notification element already exists
  let notification = document.querySelector('.settings-notification');
  
  if (!notification) {
    // Create notification element
    notification = document.createElement('div');
    notification.className = 'settings-notification';
    document.body.appendChild(notification);
  }
  
  // Set icon based on type
  let icon = '';
  let bgColor = 'var(--primary-color)';
  
  if (type === 'success') {
    icon = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="currentColor"/></svg>';
  } else if (type === 'info') {
    icon = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 15c-.55 0-1-.45-1-1v-4c0-.55.45-1 1-1s1 .45 1 1v4c0 .55-.45 1-1 1zm1-8h-2V7h2v2z" fill="currentColor"/></svg>';
    bgColor = '#3b82f6';
  }
  
  // Set notification content and style
  notification.innerHTML = `${icon}<span>${message}</span>`;
  notification.style.display = 'flex';
  notification.style.alignItems = 'center';
  notification.style.gap = '8px';
  notification.style.position = 'fixed';
  notification.style.bottom = '20px';
  notification.style.right = '20px';
  notification.style.backgroundColor = bgColor;
  notification.style.color = 'white';
  notification.style.padding = '12px 20px';
  notification.style.borderRadius = 'var(--radius-sm)';
  notification.style.boxShadow = 'var(--shadow-md)';
  notification.style.zIndex = '1000';
  notification.style.opacity = '0';
  notification.style.transform = 'translateY(20px)';
  notification.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
  
  // Show notification
  setTimeout(() => {
    notification.style.opacity = '1';
    notification.style.transform = 'translateY(0)';
  }, 10);
  
  // Hide notification after 3 seconds
  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transform = 'translateY(20px)';
    
    // Remove element after animation ends
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 3000);
}

// Fetch GitHub statistics
async function fetchGitHubStats() {
  try {
    const response = await fetch('https://api.github.com/repos/Jonghwan-dev/Daily-ArXiv-Tool');
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
