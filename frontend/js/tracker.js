/**
 * Internship Finder - Application Tracker (Kanban Board & Metrics)
 */

const TrackerModule = (() => {
  const STAGES = [
    { id: 'Saved', label: '📌 Saved', color: 'var(--text-muted)' },
    { id: 'Applied', label: '📝 Applied', color: 'var(--primary)' },
    { id: 'Interview', label: '💬 Interview', color: 'var(--warning)' },
    { id: 'Offer', label: '🎉 Offer', color: 'var(--success)' },
    { id: 'Rejected', label: '❌ Rejected', color: 'var(--danger)' }
  ];

  function init() {
    renderKanban();
  }

  function quickTrackPrompt(internshipId) {
    const list = AppState.scoredInternships.length > 0 ? AppState.scoredInternships : AppState.internships;
    const item = list.find(i => i.id === internshipId);
    if (!item) return;

    const currentTrack = AppState.tracked[internshipId] || {
      status: 'Saved',
      notes: '',
      appliedDate: new Date().toISOString().split('T')[0]
    };

    const modal = document.getElementById('tracker-modal');
    const content = document.getElementById('tracker-modal-content');
    if (!modal || !content) return;

    content.innerHTML = `
      <div style="margin-bottom: 1.25rem;">
        <h4 style="font-size: 1.1rem; font-weight: 800;">${window.escapeHtml(item.title)}</h4>
        <div style="color: var(--text-muted); font-size: 0.85rem;">${window.escapeHtml(item.organization)} • Deadline: ${item.deadline}</div>
      </div>

      <div class="form-row">
        <label class="form-label">Application Status</label>
        <select id="track-modal-status" class="form-input">
          ${STAGES.map(s => `
            <option value="${s.id}" ${currentTrack.status === s.id ? 'selected' : ''}>${s.label}</option>
          `).join('')}
        </select>
      </div>

      <div class="form-row">
        <label class="form-label">Application Notes / Interview Details</label>
        <textarea id="track-modal-notes" class="form-input" rows="4" placeholder="e.g. Referred by Jane, submitted cover letter, technical interview date...">${window.escapeHtml(currentTrack.notes || '')}</textarea>
      </div>

      <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1.25rem;">
        ${AppState.tracked[internshipId] ? `
          <button type="button" class="btn btn-outline" style="color: var(--danger-text);" onclick="window.TrackerModule.untrackItem('${internshipId}')">
            Remove from Tracker
          </button>
        ` : '<div></div>'}
        <div style="display: flex; gap: 0.5rem;">
          <button type="button" class="btn btn-secondary" onclick="document.getElementById('tracker-modal').classList.remove('active')">Cancel</button>
          <button type="button" class="btn btn-primary" onclick="window.TrackerModule.saveTrackedDetails('${internshipId}')">Save Tracking</button>
        </div>
      </div>
    `;

    modal.classList.add('active');
  }

  function saveTrackedDetails(internshipId) {
    const status = document.getElementById('track-modal-status').value;
    const notes = document.getElementById('track-modal-notes').value;

    AppState.tracked[internshipId] = {
      status,
      notes,
      updatedAt: new Date().toISOString()
    };

    window.saveTrackedApplications();
    window.showToast(`Updated tracking: ${status}`, 'success');

    const modal = document.getElementById('tracker-modal');
    if (modal) modal.classList.remove('active');

    renderKanban();
    if (window.MatchModule) window.MatchModule.renderInternships();
  }

  function updateStatus(internshipId, newStatus) {
    if (!AppState.tracked[internshipId]) {
      AppState.tracked[internshipId] = { notes: '' };
    }
    AppState.tracked[internshipId].status = newStatus;
    AppState.tracked[internshipId].updatedAt = new Date().toISOString();

    window.saveTrackedApplications();
    window.showToast(`Status moved to ${newStatus}`);
    renderKanban();
    if (window.MatchModule) window.MatchModule.renderInternships();
  }

  function untrackItem(internshipId) {
    delete AppState.tracked[internshipId];
    window.saveTrackedApplications();
    window.showToast('Removed from tracking', 'info');

    const modal = document.getElementById('tracker-modal');
    if (modal) modal.classList.remove('active');

    renderKanban();
    if (window.MatchModule) window.MatchModule.renderInternships();
  }

  function renderKanban() {
    renderMetrics();

    const container = document.getElementById('kanban-board-container');
    if (!container) return;

    const allInternships = { ...(AppState.scoredInternships.length > 0 ? AppState.scoredInternships : AppState.internships).reduce((acc, cur) => ({ ...acc, [cur.id]: cur }), {}) };

    container.innerHTML = STAGES.map(stage => {
      const itemsInStage = Object.keys(AppState.tracked)
        .filter(id => AppState.tracked[id].status === stage.id)
        .map(id => ({ id, meta: allInternships[id], track: AppState.tracked[id] }))
        .filter(entry => !!entry.meta);

      return `
        <div class="kanban-column" id="kanban-col-${stage.id}">
          <div class="kanban-col-header">
            <span class="kanban-col-title">${stage.label}</span>
            <span class="kanban-col-count">${itemsInStage.length}</span>
          </div>

          <div class="kanban-cards-list">
            ${itemsInStage.length === 0 ? `
              <div style="font-size: 0.775rem; color: var(--text-muted); text-align: center; padding: 2rem 0.5rem; border: 1px dashed var(--border-subtle); border-radius: var(--radius-md);">
                No applications in ${stage.id}
              </div>
            ` : itemsInStage.map(entry => renderKanbanCard(entry, stage.id)).join('')}
          </div>
        </div>
      `;
    }).join('');
  }

  function renderKanbanCard(entry, currentStageId) {
    const item = entry.meta;
    const track = entry.track;
    const daysLeft = window.calculateDaysLeft(item.deadline);

    let deadlineBadge = `<span style="font-size: 0.75rem; color: var(--text-muted);">📅 ${item.deadline}</span>`;
    if (daysLeft !== null && daysLeft <= 7 && daysLeft > 0) {
      deadlineBadge = `<span class="deadline-urgency">⚡ ${daysLeft} days left</span>`;
    }

    return `
      <div class="kanban-item-card" id="kanban-card-${item.id}">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 0.5rem;">
          <div style="font-size: 1.1rem;">${item.logo || '🏢'}</div>
          <div style="font-size: 0.75rem; font-weight: 700; color: var(--primary);">
            ${item.match ? `${item.match.total_score}% Match` : ''}
          </div>
        </div>
        <h4 style="margin-top: 0.25rem;">${window.escapeHtml(item.title)}</h4>
        <div class="kanban-item-org">${window.escapeHtml(item.organization)}</div>

        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem;">
          ${deadlineBadge}
          <span style="font-size: 0.75rem; font-weight: 700;">${window.formatStipend(item.stipend_monthly_usd)}</span>
        </div>

        ${track.notes ? `
          <div style="font-size: 0.775rem; background: var(--bg-secondary); padding: 0.35rem 0.5rem; border-radius: var(--radius-sm); color: var(--text-secondary); margin-bottom: 0.4rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${window.escapeHtml(track.notes)}">
            📝 ${window.escapeHtml(track.notes)}
          </div>
        ` : ''}

        <div style="display: flex; gap: 0.4rem; align-items: center; margin-top: 0.5rem;">
          <select class="kanban-status-select" onchange="window.TrackerModule.updateStatus('${item.id}', this.value)">
            ${STAGES.map(s => `
              <option value="${s.id}" ${s.id === currentStageId ? 'selected' : ''}>Move: ${s.id}</option>
            `).join('')}
          </select>
          <button class="btn btn-icon" style="width: 28px; height: 28px; font-size: 0.8rem;" onclick="window.TrackerModule.quickTrackPrompt('${item.id}')" title="Edit notes">
            ✏️
          </button>
        </div>
      </div>
    `;
  }

  function renderMetrics() {
    const trackedKeys = Object.keys(AppState.tracked);
    const total = trackedKeys.length;
    const applied = trackedKeys.filter(k => AppState.tracked[k].status === 'Applied').length;
    const interview = trackedKeys.filter(k => AppState.tracked[k].status === 'Interview').length;
    const offer = trackedKeys.filter(k => AppState.tracked[k].status === 'Offer').length;
    const saved = trackedKeys.filter(k => AppState.tracked[k].status === 'Saved').length;

    const rate = total > 0 ? Math.round(((interview + offer) / total) * 100) : 0;

    setVal('metric-total-tracked', total);
    setVal('metric-saved-count', saved);
    setVal('metric-applied-count', applied);
    setVal('metric-interview-count', interview);
    setVal('metric-offer-count', offer);
  }

  function setVal(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  }

  return {
    init,
    quickTrackPrompt,
    saveTrackedDetails,
    updateStatus,
    untrackItem,
    renderKanban
  };
})();

window.TrackerModule = TrackerModule;
