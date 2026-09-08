/**
 * Find Me - Main Core Application & State Manager
 * Made by Legislative
 */

const AppState = {
  currentTab: 'discover',
  
  // Default currency is INR, easily switchable to USD, EUR, GBP, etc.
  currency: 'INR',
  rates: {
    INR: { symbol: '₹', rate: 83.5, name: 'Indian Rupee' },
    USD: { symbol: '$', rate: 1.0, name: 'US Dollar' },
    EUR: { symbol: '€', rate: 0.92, name: 'Euro' },
    GBP: { symbol: '£', rate: 0.79, name: 'British Pound' },
    CAD: { symbol: 'C$', rate: 1.36, name: 'Canadian Dollar' },
    AUD: { symbol: 'A$', rate: 1.52, name: 'Australian Dollar' },
    JPY: { symbol: '¥', rate: 155.0, name: 'Japanese Yen' }
  },

  theme: 'light',

  // Current User Profile
  profile: {
    name: 'Aarav Sharma',
    education_level: "Bachelor's",
    degree: 'Computer Science & Engineering',
    graduation_year: 2027,
    skills: ['Python', 'Git', 'Data Analysis', 'SQL', 'Policy Analysis'],
    languages: ['English', 'Hindi'],
    experience_level: 'No prior experience',
    preferred_countries: ['India', 'Global Remote'],
    prefer_remote: false,
    desired_industries: ['Government & Public Policy', 'Technology & Software', 'Space & Aerospace'],
    citizenship: 'India',
    eligible_government: true
  },

  internships: [],
  scoredInternships: [],
  courses: [],
  tracked: {},
  compareIds: new Set(),

  // Filter State
  filters: {
    search: '',
    sector: 'all',
    gov_type: 'all', // 'Government of India', 'State Government', 'Private', 'Nonprofit'
    country: 'all',
    work_mode: 'all',
    industry: 'all',
    education_level: 'all',
    minScore: 0,
    sortBy: 'match' // 'match', 'deadline', 'stipend', 'title'
  }
};

document.addEventListener('DOMContentLoaded', async () => {
  loadStoredPreferences();
  initTheme();
  initNavigation();
  initCurrencySelector();
  initFooterModals();
  
  fetchCurrencies();

  if (window.ProfileModule) window.ProfileModule.init();

  await loadData();

  if (window.MatchModule) window.MatchModule.init();
  if (window.TrackerModule) window.TrackerModule.init();
  if (window.SkillUpModule) window.SkillUpModule.init();
  if (window.CompareModule) window.CompareModule.init();
  if (window.ActionPlanModule) window.ActionPlanModule.init();

  if (!localStorage.getItem('findme_profile')) {
    setTimeout(() => {
      if (window.ProfileModule) window.ProfileModule.openModal();
    }, 450);
  }
});

function loadStoredPreferences() {
  try {
    const savedTheme = localStorage.getItem('findme_theme');
    if (savedTheme) AppState.theme = savedTheme;

    const savedCurrency = localStorage.getItem('findme_currency');
    if (savedCurrency) AppState.currency = savedCurrency;

    const savedTracked = localStorage.getItem('findme_tracked');
    if (savedTracked) AppState.tracked = JSON.parse(savedTracked);

    const savedProfile = localStorage.getItem('findme_profile');
    if (savedProfile) AppState.profile = JSON.parse(savedProfile);
  } catch (err) {
    console.warn('Error loading preferences from localStorage', err);
  }
}

function saveTrackedApplications() {
  localStorage.setItem('findme_tracked', JSON.stringify(AppState.tracked));
  updateTrackerBadges();
}

function updateTrackerBadges() {
  const count = Object.keys(AppState.tracked).length;
  const badge = document.getElementById('nav-tracker-badge');
  if (badge) badge.textContent = count;

  const compareBadge = document.getElementById('nav-compare-badge');
  if (compareBadge) compareBadge.textContent = AppState.compareIds.size;
}

function formatStipend(amountUsd) {
  if (!amountUsd || amountUsd <= 0) return 'Academic / Voluntary';
  const currencyInfo = AppState.rates[AppState.currency] || AppState.rates.INR;
  const converted = Math.round(amountUsd * currencyInfo.rate);
  return `${currencyInfo.symbol}${converted.toLocaleString()} / mo`;
}

function initCurrencySelector() {
  const select = document.getElementById('currency-selector');
  if (!select) return;
  select.value = AppState.currency;
  select.addEventListener('change', (e) => {
    AppState.currency = e.target.value;
    localStorage.setItem('findme_currency', AppState.currency);
    showToast(`Currency set to ${AppState.currency}`);
    if (window.MatchModule) window.MatchModule.renderInternships();
    if (window.CompareModule) window.CompareModule.renderCompareTable();
  });
}

async function fetchCurrencies() {
  try {
    const res = await fetch('/api/currencies');
    if (res.ok) {
      const data = await res.json();
      if (data.rates) AppState.rates = data.rates;
    }
  } catch (e) {}
}

function initTheme() {
  applyTheme(AppState.theme);
  const toggleBtn = document.getElementById('theme-toggle-btn');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const nextTheme = AppState.theme === 'light' ? 'dark' : 'light';
      applyTheme(nextTheme);
    });
  }
}

function applyTheme(theme) {
  AppState.theme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('findme_theme', theme);
  const toggleBtn = document.getElementById('theme-toggle-btn');
  if (toggleBtn) {
    toggleBtn.innerHTML = theme === 'light' ? '🌙' : '☀️';
    toggleBtn.setAttribute('title', `Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`);
  }
}

function initNavigation() {
  const tabs = document.querySelectorAll('.nav-tab-btn');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetView = tab.getAttribute('data-view');
      switchView(targetView);
    });
  });
}

function switchView(viewName) {
  AppState.currentTab = viewName;
  
  document.querySelectorAll('.nav-tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-view') === viewName);
  });

  document.querySelectorAll('.view-section').forEach(sec => {
    sec.classList.remove('active');
  });

  const activeSection = document.getElementById(`view-${viewName}`);
  if (activeSection) activeSection.classList.add('active');

  if (viewName === 'tracker' && window.TrackerModule) window.TrackerModule.renderKanban();
  if (viewName === 'skillup' && window.SkillUpModule) window.SkillUpModule.renderSkillUpView();
  if (viewName === 'compare' && window.CompareModule) window.CompareModule.renderCompareTable();
  if (viewName === 'actionplan' && window.ActionPlanModule) window.ActionPlanModule.generatePlan();

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function loadData() {
  try {
    await recomputeMatches();

    const courseRes = await fetch('/api/courses');
    if (courseRes.ok) {
      const data = await courseRes.json();
      AppState.courses = data.courses || [];
    }

    fetchOverviewStats();
  } catch (err) {
    console.error('Error loading data:', err);
    showToast('Offline mode: Using cached baseline', 'warning');
  }
}

async function recomputeMatches() {
  try {
    const res = await fetch('/api/match', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile: AppState.profile, min_score: 0 })
    });
    if (res.ok) {
      const data = await res.json();
      AppState.scoredInternships = data.results || [];
      if (window.MatchModule) window.MatchModule.renderInternships();
      updateDashboardHero();
    }
  } catch (e) {
    console.warn('Match calculation error', e);
  }
}

async function fetchOverviewStats() {
  try {
    const res = await fetch('/api/stats');
    if (res.ok) {
      const stats = await res.json();
      const elTotal = document.getElementById('stat-total-opps');
      if (elTotal) elTotal.textContent = stats.total_internships;
      const elGovIndia = document.getElementById('stat-gov-india-opps');
      if (elGovIndia) elGovIndia.textContent = stats.gov_india_count;
      const elStateGov = document.getElementById('stat-state-gov-opps');
      if (elStateGov) elStateGov.textContent = stats.state_gov_count;
      const elRemote = document.getElementById('stat-remote-opps');
      if (elRemote) elRemote.textContent = stats.remote_count;

      const refreshEl = document.getElementById('live-refresh-time');
      if (refreshEl && stats.last_refresh_time) {
        refreshEl.textContent = stats.last_refresh_time;
      }
    }
  } catch (e) {}
}

function updateDashboardHero() {
  const heroName = document.getElementById('hero-student-name');
  if (heroName) heroName.textContent = AppState.profile.name || 'Student';

  const heroMajor = document.getElementById('hero-student-major');
  if (heroMajor) heroMajor.textContent = `${AppState.profile.education_level} in ${AppState.profile.degree}`;

  const heroSkills = document.getElementById('hero-skills-chips');
  if (heroSkills) {
    heroSkills.innerHTML = (AppState.profile.skills || []).slice(0, 5)
      .map(s => `<span class="profile-chip">⚡ ${escapeHtml(s)}</span>`).join('');
  }

  const topMatchCount = AppState.scoredInternships.filter(i => (i.match?.total_score || 0) >= 75).length;
  const matchStat = document.getElementById('stat-high-matches');
  if (matchStat) matchStat.textContent = topMatchCount;
}

/**
 * Footer Interactive Info Modals (About, Privacy, Terms, Contact, Data Sources)
 */
function initFooterModals() {
  const modalContents = {
    about: {
      title: "About Find Me",
      body: `
        <div style="line-height:1.7; font-size:0.925rem; color:var(--text-secondary);">
          <p><strong>Find Me</strong> is a career discovery platform built to connect students and early-career job seekers with authentic, verified internship opportunities worldwide.</p>
          <br>
          <p>Our primary mission is to make <strong>Indian Government internships</strong> (Central Ministries, NITI Aayog, RBI, SEBI, ISRO, DRDO, MeitY, MEA, Railways) and <strong>State Government fellowships</strong> transparently accessible to every student, alongside top private technology firms and global public institutions.</p>
          <br>
          <p><strong>Architected &amp; Built by Legislative</strong> with a privacy-first, zero-tracking philosophy.</p>
        </div>
      `
    },
    privacy: {
      title: "Privacy Policy",
      body: `
        <div style="line-height:1.7; font-size:0.925rem; color:var(--text-secondary);">
          <p><strong>Safe &amp; Private by Design:</strong></p>
          <ul style="padding-left:1.25rem; margin-top:0.5rem; margin-bottom:1rem;">
            <li>All student qualifications, skills, application notes, and tracker milestones are stored strictly in your local browser's storage.</li>
            <li>No personal data is sold, rented, or tracked across third parties.</li>
            <li>Direct official application links take you directly to host portals (e.g. niti.gov.in, rbi.org.in, isro.gov.in) with complete autonomy.</li>
          </ul>
        </div>
      `
    },
    terms: {
      title: "Terms of Use",
      body: `
        <div style="line-height:1.7; font-size:0.925rem; color:var(--text-secondary);">
          <p><strong>Educational &amp; Career Discovery Advisory:</strong></p>
          <br>
          <p>Find Me aggregates official public notifications, career pages, and approved educational repositories. We do not charge students for accessing internship listings.</p>
          <br>
          <p><strong>Official Verification Requirement:</strong> Internship criteria, reservations, citizenship rules, and deadlines must always be verified on the official portal before submitting applications.</p>
        </div>
      `
    },
    contact: {
      title: "Contact & Support",
      body: `
        <div style="line-height:1.7; font-size:0.925rem; color:var(--text-secondary);">
          <p>Have suggestions, new government notifications to suggest, or want to connect?</p>
          <br>
          <p><strong>Creator &amp; Maintainer:</strong> Legislative</p>
          <p><strong>LinkedIn:</strong> <a href="https://www.linkedin.com/in/legislative" target="_blank" rel="noopener" style="color:var(--primary); font-weight:700;">linkedin.com/in/legislative ↗</a></p>
          <p><strong>GitHub:</strong> <a href="https://github.com/legislative/find-me" target="_blank" rel="noopener" style="color:var(--primary); font-weight:700;">github.com/legislative/find-me ↗</a></p>
          <p><strong>Email:</strong> support@findme-careers.org</p>
        </div>
      `
    },
    datasources: {
      title: "Verified Data Sources",
      body: `
        <div style="line-height:1.7; font-size:0.925rem; color:var(--text-secondary);">
          <p>Find Me sources and indexes opportunities from verified public domains:</p>
          <ul style="padding-left:1.25rem; margin-top:0.5rem;">
            <li><strong>Government of India:</strong> NITI Aayog (niti.gov.in), Reserve Bank of India (rbi.org.in), SEBI (sebi.gov.in), ISRO (isro.gov.in), DRDO (drdo.gov.in), MeitY (meity.gov.in), Ministry of External Affairs (mea.gov.in), Indian Railways CRIS (cris.org.in), ONGC.</li>
            <li><strong>State Governments:</strong> Karnataka Innovation &amp; Tech Society (ktech.karnataka.gov.in), Maharashtra Govt (mahagov.in).</li>
            <li><strong>National Skilling:</strong> Skill India Digital Hub, NSDC, SWAYAM, NPTEL (IITs &amp; IISc).</li>
            <li><strong>Enterprise Skilling:</strong> Google Cloud Skills Boost, Microsoft Learn, IBM SkillsBuild, AWS Skill Builder, Salesforce Trailhead, Cisco Networking Academy, Meta Blueprint, HubSpot Academy, LinkedIn Learning.</li>
          </ul>
        </div>
      `
    }
  };

  document.querySelectorAll('[data-footer-modal]').forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      const modalKey = trigger.getAttribute('data-footer-modal');
      const data = modalContents[modalKey];
      if (data) {
        openGenericInfoModal(data.title, data.body);
      }
    });
  });
}

function openGenericInfoModal(title, htmlBody) {
  const modal = document.getElementById('generic-info-modal');
  const titleEl = document.getElementById('generic-modal-title');
  const bodyEl = document.getElementById('generic-modal-content');
  if (!modal || !titleEl || !bodyEl) return;

  titleEl.textContent = title;
  bodyEl.innerHTML = htmlBody;
  modal.classList.add('active');
}

function showToast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const icons = { info: 'ℹ️', success: '✅', warning: '⚠️', danger: '❌' };
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span>${icons[type] || 'ℹ️'}</span><span>${escapeHtml(message)}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function calculateDaysLeft(deadlineStr) {
  if (!deadlineStr) return null;
  const deadlineDate = new Date(deadlineStr);
  const now = new Date();
  const diffTime = deadlineDate - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

window.AppState = AppState;
window.formatStipend = formatStipend;
window.showToast = showToast;
window.escapeHtml = escapeHtml;
window.calculateDaysLeft = calculateDaysLeft;
window.switchView = switchView;
window.saveTrackedApplications = saveTrackedApplications;
window.recomputeMatches = recomputeMatches;
window.openGenericInfoModal = openGenericInfoModal;
