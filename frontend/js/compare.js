/**
 * Internship Finder - Side-by-Side Comparison Matrix Module
 */

const CompareModule = (() => {
  function init() {
    renderCompareTable();
  }

  function toggleCompare(internshipId) {
    if (AppState.compareIds.has(internshipId)) {
      AppState.compareIds.delete(internshipId);
      window.showToast('Removed from comparison', 'info');
    } else {
      if (AppState.compareIds.size >= 3) {
        window.showToast('You can compare up to 3 internships at a time. Remove one first.', 'warning');
        return;
      }
      AppState.compareIds.add(internshipId);
      window.showToast('Added to comparison matrix', 'success');
    }

    window.updateTrackerBadges();
    if (window.MatchModule) window.MatchModule.renderInternships();
    renderCompareTable();
  }

  function clearCompare() {
    AppState.compareIds.clear();
    window.updateTrackerBadges();
    if (window.MatchModule) window.MatchModule.renderInternships();
    renderCompareTable();
  }

  function renderCompareTable() {
    const container = document.getElementById('compare-table-container');
    if (!container) return;

    const allList = AppState.scoredInternships.length > 0 ? AppState.scoredInternships : AppState.internships;
    const items = Array.from(AppState.compareIds).map(id => allList.find(i => i.id === id)).filter(Boolean);

    if (items.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 3rem 1.5rem; background: var(--bg-surface); border-radius: var(--radius-lg); border: 1px dashed var(--border-strong);">
          <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">⚖️</div>
          <h3 style="font-size: 1.15rem; font-weight: 700;">No internships selected for comparison</h3>
          <p style="color: var(--text-muted); font-size: 0.875rem; margin-top: 0.35rem; margin-bottom: 1.25rem;">
            Click the "⚖️ Compare" button on any internship card in Discover to compare requirements, stipends, and deadlines side by side.
          </p>
          <button class="btn btn-primary" onclick="window.switchView('discover')">Explore Internships</button>
        </div>
      `;
      return;
    }

    const rows = [
      { label: '🎯 Match Score', fn: (i) => `<strong style="color: var(--primary); font-size: 1.05rem;">${i.match ? i.match.total_score : 50}% Match</strong>` },
      { label: '💡 Why It Matches', fn: (i) => `<span style="font-size: 0.825rem;">${window.escapeHtml(i.match ? i.match.why_matched : 'Aligned with profile')}</span>` },
      { label: '🏛️ Sector', fn: (i) => `<span class="badge ${i.sector === 'Government' ? 'badge-gov' : (i.sector === 'Nonprofit' ? 'badge-nonprof' : 'badge-priv')}">${i.sector}</span>` },
      { label: '📍 Location & Work Mode', fn: (i) => `${i.city}, ${i.country} (${i.work_mode})` },
      { label: '💰 Monthly Stipend', fn: (i) => `<strong>${window.formatStipend(i.stipend_monthly_usd)}</strong>` },
      { label: '⏱️ Duration', fn: (i) => i.duration },
      { label: '📅 Deadline', fn: (i) => {
        const days = window.calculateDaysLeft(i.deadline);
        return `<div>${i.deadline} ${days !== null ? `<span class="deadline-urgency" style="margin-left: 4px;">${days}d left</span>` : ''}</div>`;
      }},
      { label: '🎓 Education Level', fn: (i) => (i.education_level || []).join(', ') },
      { label: '📖 Target Degrees', fn: (i) => (i.degrees || []).join(', ') },
      { label: '⚡ Required Skills', fn: (i) => {
        const userSkills = new Set((AppState.profile.skills || []).map(s => s.toLowerCase()));
        return (i.required_skills || []).map(s => `
          <span class="skill-tag ${userSkills.has(s.toLowerCase()) ? 'matched' : 'missing'}" style="margin: 2px;">
            ${userSkills.has(s.toLowerCase()) ? '✓ ' : ''}${window.escapeHtml(s)}
          </span>
        `).join(' ');
      }},
      { label: '🛡️ Government / Eligibility', fn: (i) => `<span style="font-size: 0.825rem; color: var(--text-secondary);">${window.escapeHtml(i.gov_eligibility)}</span>` },
      { label: '🔗 Official Links', fn: (i) => `
        <div style="display: flex; flex-direction: column; gap: 0.4rem;">
          <a href="${window.escapeHtml(i.application_url)}" target="_blank" rel="noopener noreferrer" class="btn btn-primary" style="font-size: 0.8rem; padding: 0.4rem 0.6rem;">
            Official Application ↗
          </a>
          <a href="${window.escapeHtml(i.source_url)}" target="_blank" rel="noopener noreferrer" style="font-size: 0.75rem; color: var(--text-muted); text-align: center; text-decoration: underline;">
            Host Portal
          </a>
        </div>
      `}
    ];

    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
        <span style="font-size: 0.9rem; font-weight: 700; color: var(--text-secondary);">Comparing ${items.length} of 3 maximum listings</span>
        <button class="btn btn-outline" style="font-size: 0.8rem; padding: 0.35rem 0.75rem;" onclick="window.CompareModule.clearCompare()">Clear All</button>
      </div>

      <div class="compare-container">
        <table class="compare-table">
          <thead>
            <tr>
              <th style="background: var(--bg-surface-elevated);">Feature</th>
              ${items.map(item => `
                <th class="compare-header-cell">
                  <div style="font-size: 1.5rem; margin-bottom: 0.25rem;">${item.logo || '🏢'}</div>
                  <div style="font-size: 1rem; font-weight: 800; color: var(--text-primary);">${window.escapeHtml(item.title)}</div>
                  <div style="font-size: 0.8rem; color: var(--text-muted); font-weight: 600; margin-bottom: 0.5rem;">${window.escapeHtml(item.organization)}</div>
                  <button class="btn btn-secondary" style="font-size: 0.75rem; padding: 0.2rem 0.5rem;" onclick="window.CompareModule.toggleCompare('${item.id}')">
                    ✕ Remove
                  </button>
                </th>
              `).join('')}
            </tr>
          </thead>
          <tbody>
            ${rows.map(row => `
              <tr>
                <th>${row.label}</th>
                ${items.map(item => `<td>${row.fn(item)}</td>`).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  return {
    init,
    toggleCompare,
    clearCompare,
    renderCompareTable
  };
})();

window.CompareModule = CompareModule;
