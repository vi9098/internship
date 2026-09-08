/**
 * Find Me - Match Score Engine & Directory Presentation
 * Prioritizes Indian Government, State Government, and Active Open Deadlines
 */

const MatchModule = (() => {
  function init() {
    setupFilterListeners();
    renderInternships();
  }

  function setupFilterListeners() {
    const searchInput = document.getElementById('search-query');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        AppState.filters.search = e.target.value.toLowerCase();
        renderInternships();
      });
    }

    // Sector & Gov Type Filter Pills
    document.querySelectorAll('.filter-sector-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('.filter-sector-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        const sectorVal = pill.getAttribute('data-sector');
        
        if (sectorVal === 'Government of India' || sectorVal === 'State Government') {
          AppState.filters.gov_type = sectorVal;
          AppState.filters.sector = 'all';
        } else {
          AppState.filters.sector = sectorVal;
          AppState.filters.gov_type = 'all';
        }
        renderInternships();
      });
    });

    // Work Mode Filter Pills
    document.querySelectorAll('.filter-workmode-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('.filter-workmode-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        AppState.filters.work_mode = pill.getAttribute('data-workmode');
        renderInternships();
      });
    });

    // Country Select
    const countrySelect = document.getElementById('filter-country');
    if (countrySelect) {
      countrySelect.addEventListener('change', (e) => {
        AppState.filters.country = e.target.value;
        renderInternships();
      });
    }

    // Industry Select
    const industrySelect = document.getElementById('filter-industry');
    if (industrySelect) {
      industrySelect.addEventListener('change', (e) => {
        AppState.filters.industry = e.target.value;
        renderInternships();
      });
    }

    // Qualification Level Select
    const eduSelect = document.getElementById('filter-education');
    if (eduSelect) {
      eduSelect.addEventListener('change', (e) => {
        AppState.filters.education_level = e.target.value;
        renderInternships();
      });
    }

    // Min Match Score Slider
    const scoreSlider = document.getElementById('filter-min-score');
    const scoreValBadge = document.getElementById('min-score-badge');
    if (scoreSlider && scoreValBadge) {
      scoreSlider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value) || 0;
        scoreValBadge.textContent = `${val}%`;
        AppState.filters.minScore = val;
        renderInternships();
      });
    }

    // Sort Select
    const sortSelect = document.getElementById('filter-sort-by');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        AppState.filters.sortBy = e.target.value;
        renderInternships();
      });
    }

    // Reset Filters Button
    const resetBtn = document.getElementById('btn-reset-filters');
    if (resetBtn) resetBtn.addEventListener('click', resetFilters);
  }

  function resetFilters() {
    AppState.filters = {
      search: '',
      sector: 'all',
      gov_type: 'all',
      country: 'all',
      work_mode: 'all',
      industry: 'all',
      education_level: 'all',
      minScore: 0,
      sortBy: 'match'
    };

    const s = document.getElementById('search-query');
    if (s) s.value = '';

    const slider = document.getElementById('filter-min-score');
    const badge = document.getElementById('min-score-badge');
    if (slider) slider.value = 0;
    if (badge) badge.textContent = '0%';

    document.querySelectorAll('.filter-sector-pill').forEach(p => p.classList.toggle('active', p.getAttribute('data-sector') === 'all'));
    document.querySelectorAll('.filter-workmode-pill').forEach(p => p.classList.toggle('active', p.getAttribute('data-workmode') === 'all'));

    const countrySelect = document.getElementById('filter-country');
    if (countrySelect) countrySelect.value = 'all';

    const industrySelect = document.getElementById('filter-industry');
    if (industrySelect) industrySelect.value = 'all';

    const eduSelect = document.getElementById('filter-education');
    if (eduSelect) eduSelect.value = 'all';

    const sortSelect = document.getElementById('filter-sort-by');
    if (sortSelect) sortSelect.value = 'match';

    renderInternships();
  }

  function getFilteredAndSorted() {
    const list = AppState.scoredInternships.length > 0 ? AppState.scoredInternships : AppState.internships;
    const f = AppState.filters;

    let filtered = list.filter(item => {
      // Gov Type Filter (e.g. Government of India, State Government)
      if (f.gov_type !== 'all') {
        if ((item.gov_type || '').toLowerCase() !== f.gov_type.toLowerCase()) return false;
      }

      // Sector Filter
      if (f.sector !== 'all' && item.sector.toLowerCase() !== f.sector.toLowerCase()) return false;

      // Work Mode
      if (f.work_mode !== 'all' && item.work_mode.toLowerCase() !== f.work_mode.toLowerCase()) return false;

      // Country
      if (f.country !== 'all' && !item.country.toLowerCase().includes(f.country.toLowerCase())) return false;

      // Industry
      if (f.industry !== 'all' && !item.industry.toLowerCase().includes(f.industry.toLowerCase())) return false;

      // Education Level
      if (f.education_level !== 'all') {
        const allowed = (item.education_level || []).map(e => e.toLowerCase());
        if (allowed.length > 0 && !allowed.includes(f.education_level.toLowerCase())) return false;
      }

      // Min Match Score
      const score = item.match ? item.match.total_score : 0;
      if (score < f.minScore) return false;

      // Keyword Search
      if (f.search) {
        const text = [
          item.title,
          item.organization,
          item.gov_type || '',
          item.country,
          item.city,
          item.industry,
          ...(item.required_skills || []),
          ...(item.preferred_skills || []),
          item.description
        ].join(' ').toLowerCase();

        if (!text.includes(f.search)) return false;
      }

      return true;
    });

    // Sorting: Prioritizes Indian Government programs and open deadlines
    filtered.sort((a, b) => {
      if (f.sortBy === 'match') {
        const scoreA = a.match ? a.match.total_score : 0;
        const scoreB = b.match ? b.match.total_score : 0;
        return scoreB - scoreA;
      } else if (f.sortBy === 'deadline') {
        return (a.deadline || '9999').localeCompare(b.deadline || '9999');
      } else if (f.sortBy === 'stipend') {
        return (b.stipend_monthly_usd || 0) - (a.stipend_monthly_usd || 0);
      } else if (f.sortBy === 'title') {
        return (a.title || '').localeCompare(b.title || '');
      }
      return 0;
    });

    return filtered;
  }

  function renderInternships() {
    const container = document.getElementById('internship-cards-container');
    const countEl = document.getElementById('visible-results-count');
    if (!container) return;

    const items = getFilteredAndSorted();
    if (countEl) countEl.textContent = items.length;

    if (items.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 3rem 1.5rem; background: var(--bg-surface); border-radius: var(--radius-lg); border: 1px dashed var(--border-strong);">
          <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">🔍</div>
          <h3 style="font-size: 1.15rem; font-weight: 700;">No internships found matching your filters</h3>
          <p style="color: var(--text-muted); font-size: 0.875rem; margin-top: 0.35rem; margin-bottom: 1rem;">
            Try clearing the sector filter or selecting "All" to view the full directory of Government of India and global listings.
          </p>
          <button class="btn btn-primary" onclick="window.MatchModule.resetFilters()">Reset All Filters</button>
        </div>
      `;
      return;
    }

    container.innerHTML = items.map(item => renderInternshipCard(item)).join('');
  }

  function renderInternshipCard(item) {
    const score = item.match ? item.match.total_score : 50;
    const scoreClass = score >= 80 ? '' : (score >= 65 ? 'score-mid' : 'score-low');
    const whyMatched = item.match ? item.match.why_matched : `${score}% Overall Profile Match`;

    // Days left calculation & urgency
    const daysLeft = window.calculateDaysLeft(item.deadline);
    let deadlineBadge = `<span class="meta-item">📅 Deadline: <strong>${item.deadline}</strong></span>`;
    if (daysLeft !== null) {
      if (daysLeft <= 7 && daysLeft > 0) {
        deadlineBadge = `<span class="deadline-urgency">⚡ Closing soon: ${daysLeft} days left</span>`;
      } else if (daysLeft > 0) {
        deadlineBadge = `<span class="meta-item">⏳ <strong>${daysLeft} days left</strong> (${item.deadline})</span>`;
      } else {
        deadlineBadge = `<span class="meta-item" style="color: var(--danger-text);">⚠️ Passed (${item.deadline})</span>`;
      }
    }

    // Specialized Sector Badge
    let sectorBadgeHtml = '';
    let cardHighlightClass = '';

    if (item.gov_type === 'Government of India') {
      sectorBadgeHtml = `<span class="badge badge-gov-india">🇮🇳 Government of India</span>`;
      cardHighlightClass = 'card-gov-india';
    } else if (item.gov_type === 'State Government') {
      sectorBadgeHtml = `<span class="badge badge-state-gov">🏛️ State Government</span>`;
      cardHighlightClass = 'card-state-gov';
    } else if (item.sector === 'Government') {
      sectorBadgeHtml = `<span class="badge badge-gov">Government</span>`;
    } else if (item.sector === 'Nonprofit') {
      sectorBadgeHtml = `<span class="badge badge-nonprof">Nonprofit</span>`;
    } else {
      sectorBadgeHtml = `<span class="badge badge-priv">Private</span>`;
    }

    // Official Verification Badge
    let verifiedBadgeHtml = '';
    if (item.is_official_verified) {
      verifiedBadgeHtml = `
        <span class="badge badge-verified" title="Verified official application page from host organization">
          ✓ ${item.verification_badge || 'Verified Official Portal'}
        </span>
      `;
    }

    // Work Mode badge
    const isRemote = item.work_mode === 'Remote';

    // Tracked & Compare state
    const isTracked = !!AppState.tracked[item.id];
    const trackedStatus = isTracked ? AppState.tracked[item.id].status : null;
    const isCompared = AppState.compareIds.has(item.id);

    // User skills for tagging
    const userSkills = new Set((AppState.profile.skills || []).map(s => s.toLowerCase()));
    const skillsBadges = (item.required_skills || []).slice(0, 5).map(skill => {
      const isMatched = userSkills.has(skill.toLowerCase());
      return `<span class="skill-tag ${isMatched ? 'matched' : 'missing'}">${isMatched ? '✓ ' : ''}${window.escapeHtml(skill)}</span>`;
    }).join('');

    return `
      <div class="internship-card ${cardHighlightClass}" id="card-${item.id}">
        <!-- Card Header -->
        <div class="card-top-row">
          <div class="card-org-info">
            <div class="org-avatar">${item.logo || '🏛️'}</div>
            <div class="org-details">
              <h4>${window.escapeHtml(item.organization)}</h4>
              <h3>${window.escapeHtml(item.title)}</h3>
            </div>
          </div>
          <div class="match-score-pill ${scoreClass}" title="Calculated Match Score">
            <span>🎯</span>
            <span>${score}% Match</span>
          </div>
        </div>

        <!-- Badges & Verification Row -->
        <div class="badges-row">
          ${sectorBadgeHtml}
          ${verifiedBadgeHtml}
          ${isRemote ? '<span class="badge badge-remote">Remote</span>' : `<span class="badge badge-meta">📍 ${item.city}, ${item.country}</span>`}
          <span class="badge badge-meta">🎓 ${(item.education_level || []).join(', ')}</span>
          <span class="badge badge-meta">⏱️ ${item.duration}</span>
        </div>

        <!-- Why It Matches Box -->
        <div class="why-matches-box">
          <span>💡</span>
          <div>${window.escapeHtml(whyMatched)}</div>
        </div>

        <!-- Meta Grid -->
        <div class="card-meta-grid">
          <div class="meta-item">
            <span>💰 Stipend:</span>
            <strong>${window.formatStipend(item.stipend_monthly_usd)}</strong>
          </div>
          <div>${deadlineBadge}</div>
          <div class="meta-item" style="font-size: 0.775rem; color: var(--text-muted);">
            <span>🕒 Updated:</span>
            <strong>${item.last_updated || 'Active'}</strong>
          </div>
        </div>

        <!-- Skills Row -->
        <div class="card-skills-row">
          <span style="font-size: 0.775rem; color: var(--text-muted); align-self: center; font-weight: 600;">Key Skills:</span>
          ${skillsBadges}
        </div>

        <!-- Card Actions -->
        <div class="card-actions-bar">
          <div class="card-actions-left">
            <button class="btn btn-outline" onclick="window.MatchModule.openDetailModal('${item.id}')">
              Details
            </button>
            <button class="btn ${isTracked ? 'btn-success' : 'btn-secondary'}" onclick="window.TrackerModule.quickTrackPrompt('${item.id}')">
              ${isTracked ? `✓ ${trackedStatus}` : '📌 Track Application'}
            </button>
            <button class="btn ${isCompared ? 'btn-primary' : 'btn-secondary'}" onclick="window.CompareModule.toggleCompare('${item.id}')">
              ${isCompared ? '✓ Compared' : '⚖️ Compare'}
            </button>
          </div>
          <div>
            <a href="${window.escapeHtml(item.application_url)}" target="_blank" rel="noopener noreferrer" class="btn btn-primary" title="Open official application portal">
              Official Apply ↗
            </a>
          </div>
        </div>
      </div>
    `;
  }

  function openDetailModal(internshipId) {
    const item = (AppState.scoredInternships.length > 0 ? AppState.scoredInternships : AppState.internships).find(i => i.id === internshipId);
    if (!item) return;

    const modal = document.getElementById('detail-modal');
    const content = document.getElementById('detail-modal-content');
    if (!modal || !content) return;

    const score = item.match ? item.match.total_score : 50;
    const whyMatched = item.match ? item.match.why_matched : `${score}% Overall Profile Match`;

    content.innerHTML = `
      <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1.25rem;">
        <div style="font-size: 2.5rem; background: var(--bg-secondary); border-radius: var(--radius-md); width: 64px; height: 64px; display: flex; align-items: center; justify-content: center;">
          ${item.logo || '🏛️'}
        </div>
        <div>
          <h2 style="font-size: 1.35rem; font-weight: 800;">${window.escapeHtml(item.title)}</h2>
          <div style="color: var(--text-muted); font-size: 0.95rem; font-weight: 600;">
            ${window.escapeHtml(item.organization)} • ${item.gov_type || item.sector}
          </div>
        </div>
      </div>

      <!-- Match Breakdown Callout -->
      <div style="background: var(--primary-light); border: 1px solid var(--primary); border-radius: var(--radius-md); padding: 1rem; margin-bottom: 1.25rem;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.4rem;">
          <strong style="color: var(--primary); font-size: 0.95rem;">🎯 Profile Match Score: ${score}%</strong>
          <span style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted);">Calculated for ${window.escapeHtml(AppState.profile.name)}</span>
        </div>
        <p style="font-size: 0.875rem; color: var(--text-primary); margin-bottom: 0.6rem;">${window.escapeHtml(whyMatched)}</p>
        
        ${item.match ? `
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.5rem; font-size: 0.775rem; text-align: center; border-top: 1px solid rgba(37,99,235,0.2); padding-top: 0.5rem;">
            <div>Skills: <strong>${item.match.skills_score}/35</strong></div>
            <div>Education: <strong>${item.match.education_score}/25</strong></div>
            <div>Eligibility: <strong>${item.match.eligibility_score}/20</strong></div>
            <div>Location: <strong>${item.match.location_score}/15</strong></div>
          </div>
        ` : ''}
      </div>

      <!-- Description -->
      <div style="margin-bottom: 1.25rem;">
        <h4 style="font-size: 0.95rem; font-weight: 700; margin-bottom: 0.4rem;">Official Program Overview</h4>
        <p style="font-size: 0.9rem; color: var(--text-secondary); line-height: 1.6;">${window.escapeHtml(item.description)}</p>
      </div>

      <!-- Key Details Grid -->
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.85rem; background: var(--bg-secondary); padding: 1rem; border-radius: var(--radius-md); margin-bottom: 1.25rem; font-size: 0.875rem;">
        <div><strong>📍 Location:</strong> ${item.city}, ${item.country} (${item.work_mode})</div>
        <div><strong>💰 Monthly Stipend:</strong> ${window.formatStipend(item.stipend_monthly_usd)}</div>
        <div><strong>⏱️ Duration:</strong> ${item.duration}</div>
        <div><strong>📅 Application Deadline:</strong> ${item.deadline}</div>
        <div><strong>🎓 Allowed Degrees:</strong> ${(item.degrees || []).join(', ')}</div>
        <div><strong>🕒 Verified Timestamp:</strong> ${item.last_updated || 'Current'}</div>
      </div>

      <!-- Eligibility & Clearance -->
      <div style="margin-bottom: 1.25rem; background: var(--warning-bg); border-left: 4px solid var(--warning); padding: 0.85rem; border-radius: 0 var(--radius-sm) var(--radius-sm) 0;">
        <h4 style="font-size: 0.9rem; font-weight: 700; color: var(--warning-text); margin-bottom: 0.25rem;">Official Eligibility Criteria</h4>
        <p style="font-size: 0.85rem; color: var(--warning-text);">${window.escapeHtml(item.gov_eligibility)}</p>
      </div>

      <!-- Benefits -->
      ${item.benefits && item.benefits.length > 0 ? `
        <div style="margin-bottom: 1.25rem;">
          <h4 style="font-size: 0.95rem; font-weight: 700; margin-bottom: 0.5rem;">Key Benefits &amp; Certification</h4>
          <ul style="padding-left: 1.25rem; font-size: 0.875rem; color: var(--text-secondary); line-height: 1.6;">
            ${item.benefits.map(b => `<li>${window.escapeHtml(b)}</li>`).join('')}
          </ul>
        </div>
      ` : ''}

      <!-- Links & Disclaimer -->
      <div style="border-top: 1px solid var(--border-subtle); padding-top: 1rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.75rem;">
        <div>
          <a href="${window.escapeHtml(item.source_url)}" target="_blank" rel="noopener noreferrer" style="color: var(--text-muted); font-size: 0.8rem; text-decoration: underline;">
            Official Host Website (${item.source_url}) ↗
          </a>
        </div>
        <div style="display: flex; gap: 0.6rem;">
          <button class="btn btn-secondary" onclick="window.TrackerModule.quickTrackPrompt('${item.id}'); document.getElementById('detail-modal').classList.remove('active');">
            Track Application
          </button>
          <a href="${window.escapeHtml(item.application_url)}" target="_blank" rel="noopener noreferrer" class="btn btn-primary">
            Official Application Portal ↗
          </a>
        </div>
      </div>
    `;

    modal.classList.add('active');
  }

  return {
    init,
    resetFilters,
    renderInternships,
    openDetailModal
  };
})();

window.MatchModule = MatchModule;
