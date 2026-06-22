/* ===== ADMIN PANEL UTILITIES ===== */

/**
 * Logout user and redirect to login
 */
function logout() {
  if (confirm('Are you sure you want to sign out?')) {
    sessionStorage.removeItem('adminLoggedIn');
    window.location.href = 'login.html';
  }
}

/**
 * Show alert notification
 * @param {string} message - Alert message
 * @param {string} type - 'success', 'error', 'info'
 * @param {number} duration - Duration in ms (default 4000)
 */
function showAlert(message, type = 'info', duration = 4000) {
  // Remove existing alert
  const existing = document.querySelector('.alert');
  if (existing) existing.remove();

  const alertEl = document.createElement('div');
  alertEl.className = `alert alert-${type}`;
  alertEl.innerHTML = `
    <span>${message}</span>
    <button class="alert-close" onclick="this.parentElement.remove()">×</button>
  `;

  // Insert at top of main content
  const mainContent = document.querySelector('.main-content');
  if (mainContent) {
    mainContent.insertBefore(alertEl, mainContent.firstChild);
  }

  // Auto-remove after duration
  if (duration) {
    setTimeout(() => alertEl.remove(), duration);
  }
}

/**
 * Format currency
 */
function formatCurrency(value) {
  return '$' + parseInt(value).toLocaleString();
}

/**
 * Format date
 */
function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

/**
 * Format date and time
 */
function formatDateTime(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Debounce function
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Export leads to CSV
 */
function exportLeadsToCSV() {
  const leads = JSON.parse(localStorage.getItem('formLeads')) || [];

  if (leads.length === 0) {
    showAlert('No leads to export', 'info');
    return;
  }

  // Create CSV header
  const headers = ['Name', 'Phone', 'Email', 'Type', 'Address', 'Best Time', 'Message', 'Date', 'Status'];
  const csv = [headers.join(',')];

  // Add rows
  leads.forEach(lead => {
    const row = [
      `"${lead.name}"`,
      lead.phone,
      lead.email,
      lead.formType,
      `"${lead.address || ''}"`,
      lead.bestTime || '',
      `"${(lead.message || '').replace(/"/g, '""')}"`,
      formatDateTime(lead.timestamp),
      lead.contacted ? 'Contacted' : 'New'
    ];
    csv.push(row.join(','));
  });

  // Create download link
  const csvContent = csv.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `leads-${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  window.URL.revokeObjectURL(url);

  showAlert('Leads exported successfully', 'success');
}

/**
 * Copy text to clipboard
 */
function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    showAlert('Copied!', 'success', 2000);
  }).catch(() => {
    showAlert('Failed to copy', 'error');
  });
}

/**
 * Dashboard stats calculator
 */
function getDashboardStats() {
  const blogs = JSON.parse(localStorage.getItem('blogPosts')) || [];
  const sales = JSON.parse(localStorage.getItem('soldSales')) || [];
  const leads = JSON.parse(localStorage.getItem('formLeads')) || [];
  const newLeads = leads.filter(l => !l.contacted).length;

  return {
    blogCount: blogs.length,
    salesCount: sales.length,
    leadsCount: newLeads,
    totalLeads: leads.length
  };
}

/**
 * Update dashboard stats display
 */
function updateDashboardStats() {
  const stats = getDashboardStats();

  const blogEl = document.getElementById('blog-count');
  const salesEl = document.getElementById('sales-count');
  const leadsEl = document.getElementById('leads-count');

  if (blogEl) blogEl.textContent = stats.blogCount;
  if (salesEl) salesEl.textContent = stats.salesCount;
  if (leadsEl) leadsEl.textContent = stats.leadsCount;
}

/**
 * Sync admin data when storage changes (for multiple tabs)
 */
window.addEventListener('storage', () => {
  if (document.getElementById('blog-count')) {
    updateDashboardStats();
  }
});

/**
 * Export blog posts to JSON
 */
function exportBlogsToJSON() {
  const blogs = JSON.parse(localStorage.getItem('blogPosts')) || [];

  if (blogs.length === 0) {
    showAlert('No blog posts to export', 'info');
    return;
  }

  const blob = new Blob([JSON.stringify(blogs, null, 2)], { type: 'application/json' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `blog-posts-${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  window.URL.revokeObjectURL(url);

  showAlert('Blog posts exported successfully', 'success');
}

/**
 * Export sales to JSON
 */
function exportSalesToJSON() {
  const sales = JSON.parse(localStorage.getItem('soldSales')) || [];

  if (sales.length === 0) {
    showAlert('No sales to export', 'info');
    return;
  }

  const blob = new Blob([JSON.stringify(sales, null, 2)], { type: 'application/json' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `sales-${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  window.URL.revokeObjectURL(url);

  showAlert('Sales exported successfully', 'success');
}

/**
 * Clear all admin data (with confirmation)
 */
function clearAllData() {
  if (confirm('Are you sure you want to clear ALL data? This cannot be undone.')) {
    if (confirm('This will delete all blog posts, sales, and leads. Type "YES" to confirm.')) {
      const input = prompt('Type YES to confirm:');
      if (input === 'YES') {
        localStorage.removeItem('blogPosts');
        localStorage.removeItem('soldSales');
        localStorage.removeItem('formLeads');
        showAlert('All data cleared', 'success');
        location.reload();
      }
    }
  }
}

/**
 * Initialize admin panel
 */
document.addEventListener('DOMContentLoaded', () => {
  // Check authentication
  if (!sessionStorage.getItem('adminLoggedIn') && !window.location.pathname.includes('login')) {
    window.location.href = 'login.html';
  }

  // Update stats if on dashboard
  if (document.getElementById('blog-count')) {
    updateDashboardStats();
  }

  // Set current nav item as active
  const currentPage = window.location.pathname.split('/').pop();
  document.querySelectorAll('.nav-item').forEach(item => {
    const href = item.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
});

/**
 * Keyboard shortcuts
 */
document.addEventListener('keydown', (e) => {
  // Ctrl/Cmd + S to save (prevent default)
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault();
    const submitBtn = document.querySelector('form button[type="submit"]');
    if (submitBtn) submitBtn.click();
  }

  // Escape to close forms
  if (e.key === 'Escape') {
    const form = document.getElementById('postForm') || document.getElementById('saleForm');
    if (form) form.style.display = 'none';
  }
});

console.log('%cLatisha Blake Admin Panel', 'font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 16px; font-weight: 600; color: #C9A84C;');

// ===== MOBILE NAVIGATION =====
document.addEventListener('DOMContentLoaded', function() {
  // Update active nav item based on current page
  const currentPage = window.location.pathname.split('/').pop().replace('.html', '') || 'dashboard';
  const navItems = document.querySelectorAll('.admin-nav-item');

  navItems.forEach(item => {
    item.classList.remove('active');
    if (item.getAttribute('data-page') === currentPage) {
      item.classList.add('active');
    }
  });
});

// Handle window resize to show/hide bottom nav on mobile
function handleMobileNav() {
  const bottomNav = document.getElementById('admin-bottom-nav');
  if (window.innerWidth <= 768) {
    bottomNav?.classList.add('show');
  } else {
    bottomNav?.classList.remove('show');
  }
}

window.addEventListener('resize', handleMobileNav);
handleMobileNav();
