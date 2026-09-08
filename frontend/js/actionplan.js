/**
 * Internship Finder - Personalized Action Plan Generator
 */

const ActionPlanModule = (() => {
  let currentPlanData = null;

  function init() {
    setupListeners();
  }

  function setupListeners() {
    const refreshBtn = document.getElementById('btn-refresh-plan');
    if (refreshBtn) refreshBtn.addEventListener('click', generatePlan);

    const printBtn = document.getElementById('btn-print-plan');
    if (printBtn) printBtn.addEventListener('click', printPlan);

    const copyBtn = document.getElementById('btn-copy-plan');
    if (copyBtn) copyBtn.addEventListener('click', copyMarkdownPlan);
  }

  async function generatePlan() {
    const container = document.getElementById('actionplan-content-area');
    if (!container) return;

    container.innerHTML = `
      <div style="text-align: center; padding: 3rem;">
        <div style="font-size: 2rem; animation: spin 1s infinite linear;">⚙️</div>
        <div style="margin-top: 0.75rem; font-weight: 600; color: var(--text-muted);">Synthesizing your personalized application roadmap...</div>
      </div>
    `;

    try {
      const trackedIds = Object.keys(AppState.tracked);
      const res = await fetch('/api/actionplan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: AppState.profile,
          tracked_ids: trackedIds
        })
      });

      if (res.ok) {
        currentPlanData = await res.json();
        renderPlanUI(currentPlanData);
      } else {
        container.innerHTML = `<div style="color: var(--danger-text); padding: 2rem;">Failed to generate action plan. Please try again.</div>`;
      }
    } catch (err) {
      console.error(err);
      container.innerHTML = `<div style="color: var(--danger-text); padding: 2rem;">Error connecting to plan service.</div>`;
    }
  }

  function renderPlanUI(plan) {
    const container = document.getElementById('actionplan-content-area');
    if (!container) return;

    container.innerHTML = `
      <div class="actionplan-card">
        <div class="actionplan-header">
          <div>
            <h2 style="font-size: 1.4rem; font-weight: 800; color: var(--text-primary);">
              Career Action Plan: ${window.escapeHtml(plan.student_name)}
            </h2>
            <div style="font-size: 0.875rem; color: var(--text-muted); margin-top: 0.2rem;">
              Target: ${window.escapeHtml(plan.education_summary)} • Generated: ${plan.generated_at}
            </div>
          </div>
          <div style="display: flex; gap: 0.5rem;">
            <button class="btn btn-outline" id="btn-copy-plan" onclick="window.ActionPlanModule.copyMarkdownPlan()">
              📋 Copy Markdown
            </button>
            <button class="btn btn-primary" id="btn-print-plan" onclick="window.ActionPlanModule.printPlan()">
              🖨️ Print / Save PDF
            </button>
          </div>
        </div>

        <!-- Section 1: Priority Applications -->
        <div style="margin-bottom: 2rem;">
          <h3 class="plan-section-title">
            <span>🎯</span> Step 1: Internships to Apply for First (Priority Deadlines &amp; Fit)
          </h3>
          <p style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 1rem;">
            Ranked by closest submission deadline combined with your qualifications profile match:
          </p>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1rem;">
            ${(plan.priority_applications || []).map(item => {
              const daysLeft = window.calculateDaysLeft(item.deadline);
              return `
                <div style="background: var(--bg-secondary); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 1rem; display: flex; flex-direction: column;">
                  <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 0.5rem; margin-bottom: 0.4rem;">
                    <span style="font-weight: 800; font-size: 0.95rem; color: var(--text-primary);">${window.escapeHtml(item.title)}</span>
                    <span class="badge ${item.match_score >= 80 ? 'badge-gov' : 'badge-priv'}">${item.match_score}% Match</span>
                  </div>
                  <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.5rem;">
                    ${window.escapeHtml(item.organization)} • ${item.work_mode}
                  </div>
                  <div style="margin-bottom: 0.75rem; font-size: 0.8rem;">
                    📅 Deadline: <strong>${item.deadline}</strong>
                    ${daysLeft !== null && daysLeft <= 14 ? `<span class="deadline-urgency" style="margin-left: 6px;">${daysLeft} days remaining</span>` : ''}
                  </div>
                  <div style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 0.75rem; flex: 1;">
                    ${window.escapeHtml(item.why_matched)}
                  </div>
                  <div style="display: flex; gap: 0.5rem; margin-top: auto;">
                    <a href="${window.escapeHtml(item.application_url)}" target="_blank" rel="noopener noreferrer" class="btn btn-primary" style="font-size: 0.8rem; padding: 0.4rem 0.6rem; flex: 1;">
                      Apply on Official Portal ↗
                    </a>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Section 2: Missing Skills Bridge -->
        <div style="margin-bottom: 2rem;">
          <h3 class="plan-section-title">
            <span>🚀</span> Step 2: Missing Skills to Bridge (Recommended Free Courses)
          </h3>
          <p style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 1rem;">
            Enroll in these 100% free courses to close qualification gaps and add verified credentials to your resume:
          </p>

          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1rem;">
            ${(plan.recommended_courses || []).map(course => `
              <div style="background: var(--bg-secondary); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 1rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem;">
                  <span style="font-size: 0.8rem; font-weight: 700; color: var(--primary);">Skill Gap: ${window.escapeHtml(course.skill)}</span>
                  <span class="free-tag">Free</span>
                </div>
                <h4 style="font-size: 0.95rem; font-weight: 700; margin-bottom: 0.35rem;">${window.escapeHtml(course.course_title)}</h4>
                <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.5rem;">
                  Provider: ${window.escapeHtml(course.provider)} • Duration: ${window.escapeHtml(course.duration)}
                </div>
                <div style="font-size: 0.75rem; color: var(--success-text); margin-bottom: 0.75rem;">
                  ✓ ${window.escapeHtml(course.free_details)}
                </div>
                <a href="${window.escapeHtml(course.enrollment_url)}" target="_blank" rel="noopener noreferrer" class="btn btn-outline" style="font-size: 0.8rem; width: 100%;">
                  Start Learning Free ↗
                </a>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Section 3: Action Checklist -->
        <div>
          <h3 class="plan-section-title">
            <span>✅</span> Step 3: Application Execution Checklist
          </h3>
          <div class="checklist-list">
            ${(plan.action_checklist || []).map((task, idx) => `
              <div class="checklist-item">
                <input type="checkbox" id="task-${idx}" onchange="window.ActionPlanModule.saveChecklistProgress(${idx}, this.checked)">
                <label for="task-${idx}" style="cursor: pointer; flex: 1;">
                  <strong>Milestone ${task.step}:</strong> ${window.escapeHtml(task.task)}
                </label>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Verification Notice -->
        <div style="margin-top: 1.5rem; padding: 1rem; background: var(--warning-bg); border-radius: var(--radius-md); font-size: 0.825rem; color: var(--warning-text); display: flex; gap: 0.5rem;">
          <span>⚠️</span>
          <div>
            <strong>Important Official Verification Notice:</strong> Internship availability, visa/citizenship eligibility requirements, and deadlines change frequently. Always confirm details on the official host organization's careers portal prior to submitting materials.
          </div>
        </div>
      </div>
    `;

    restoreChecklistProgress();
  }

  function saveChecklistProgress(idx, isChecked) {
    try {
      const saved = JSON.parse(localStorage.getItem('internship_finder_checklist') || '{}');
      saved[idx] = isChecked;
      localStorage.setItem('internship_finder_checklist', JSON.stringify(saved));
    } catch (e) {}
  }

  function restoreChecklistProgress() {
    try {
      const saved = JSON.parse(localStorage.getItem('internship_finder_checklist') || '{}');
      Object.keys(saved).forEach(idx => {
        const chk = document.getElementById(`task-${idx}`);
        if (chk) chk.checked = !!saved[idx];
      });
    } catch (e) {}
  }

  function printPlan() {
    window.print();
  }

  function copyMarkdownPlan() {
    if (!currentPlanData) return;

    let md = `# Personalized Career Action Plan\n`;
    md += `**Candidate**: ${currentPlanData.student_name}\n`;
    md += `**Degree**: ${currentPlanData.education_summary}\n`;
    md += `**Generated**: ${currentPlanData.generated_at}\n\n`;

    md += `## 1. Priority Applications\n`;
    (currentPlanData.priority_applications || []).forEach(item => {
      md += `- **${item.title}** at ${item.organization} (${item.work_mode})\n`;
      md += `  - Match Score: ${item.match_score}%\n`;
      md += `  - Deadline: ${item.deadline}\n`;
      md += `  - Official Portal: ${item.application_url}\n`;
    });

    md += `\n## 2. Skill Bridge (Recommended Free Courses)\n`;
    (currentPlanData.recommended_courses || []).forEach(c => {
      md += `- **${c.skill}**: [${c.course_title}](${c.enrollment_url}) (${c.provider}, ${c.duration}) - ${c.free_details}\n`;
    });

    md += `\n## 3. Application Checklist\n`;
    (currentPlanData.action_checklist || []).forEach(task => {
      md += `- [ ] Milestone ${task.step}: ${task.task}\n`;
    });

    md += `\n*Note: Always verify eligibility criteria and deadlines on official employer portals.*\n`;

    navigator.clipboard.writeText(md).then(() => {
      window.showToast('Action plan copied as Markdown!', 'success');
    }).catch(() => {
      window.showToast('Unable to copy to clipboard', 'warning');
    });
  }

  return {
    init,
    generatePlan,
    printPlan,
    copyMarkdownPlan,
    saveChecklistProgress
  };
})();

window.ActionPlanModule = ActionPlanModule;
