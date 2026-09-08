/**
 * Find Me - Skill Up & Free Learning Recommender Module
 * Covers Skill India, NSDC, SWAYAM, NPTEL, Google, Microsoft, IBM, AWS, Salesforce, Meta, Cisco, etc.
 */

const SkillUpModule = (() => {
  let activeProviderFilter = 'all';
  let activeSkillFilter = 'all';
  let activeLevelFilter = 'all';

  function init() {
    setupListeners();
  }

  function setupListeners() {
    const providerSelect = document.getElementById('skillup-filter-provider');
    if (providerSelect) {
      providerSelect.addEventListener('change', (e) => {
        activeProviderFilter = e.target.value;
        renderCourses();
      });
    }

    const skillSelect = document.getElementById('skillup-filter-skill');
    if (skillSelect) {
      skillSelect.addEventListener('change', (e) => {
        activeSkillFilter = e.target.value;
        renderCourses();
      });
    }

    const levelSelect = document.getElementById('skillup-filter-level');
    if (levelSelect) {
      levelSelect.addEventListener('change', (e) => {
        activeLevelFilter = e.target.value;
        renderCourses();
      });
    }
  }

  function renderSkillUpView() {
    renderGapAnalysisHero();
    populateSkillFilterDropdown();
    renderCourses();
  }

  function renderGapAnalysisHero() {
    const heroTags = document.getElementById('skillup-gap-tags');
    if (!heroTags) return;

    const targetList = Object.keys(AppState.tracked).length > 0
      ? (AppState.scoredInternships.length > 0 ? AppState.scoredInternships : AppState.internships).filter(i => !!AppState.tracked[i.id])
      : (AppState.scoredInternships.slice(0, 8));

    const userSkills = new Set((AppState.profile.skills || []).map(s => s.toLowerCase()));
    const missingCounts = {};

    targetList.forEach(item => {
      (item.required_skills || []).forEach(skill => {
        if (!userSkills.has(skill.toLowerCase())) {
          missingCounts[skill] = (missingCounts[skill] || 0) + 2;
        }
      });
      (item.preferred_skills || []).forEach(skill => {
        if (!userSkills.has(skill.toLowerCase())) {
          missingCounts[skill] = (missingCounts[skill] || 0) + 1;
        }
      });
    });

    const sortedMissing = Object.entries(missingCounts).sort((a, b) => b[1] - a[1]);

    if (sortedMissing.length === 0) {
      heroTags.innerHTML = `
        <div style="font-size: 0.9rem; color: var(--success-text);">
          🎉 Superb! You already possess all fundamental skills for your target opportunities. Explore certified advanced tracks below from Skill India, SWAYAM, Google, and Microsoft.
        </div>
      `;
      return;
    }

    heroTags.innerHTML = sortedMissing.slice(0, 6).map(([skill, count]) => `
      <div class="gap-skill-chip" onclick="window.SkillUpModule.filterBySkill('${window.escapeHtml(skill)}')">
        <span>⚡ ${window.escapeHtml(skill)}</span>
        <span style="font-size: 0.725rem; color: var(--text-muted); background: var(--bg-secondary); padding: 0.1rem 0.4rem; border-radius: var(--radius-full);">${count} opps</span>
      </div>
    `).join('');
  }

  function populateSkillFilterDropdown() {
    const select = document.getElementById('skillup-filter-skill');
    if (!select) return;

    const availableSkills = Array.from(new Set(AppState.courses.map(c => c.skill))).sort();
    const currentVal = select.value;

    select.innerHTML = `<option value="all">All Skills</option>` +
      availableSkills.map(s => `<option value="${window.escapeHtml(s)}">${window.escapeHtml(s)}</option>`).join('');

    if (availableSkills.includes(currentVal)) {
      select.value = currentVal;
    }
  }

  function filterBySkill(skillName) {
    const select = document.getElementById('skillup-filter-skill');
    if (select) select.value = skillName;
    activeSkillFilter = skillName;
    renderCourses();
  }

  function renderCourses() {
    const container = document.getElementById('courses-cards-container');
    if (!container) return;

    let courses = AppState.courses;

    if (activeProviderFilter !== 'all') {
      courses = courses.filter(c => (c.provider_category || '').toLowerCase().includes(activeProviderFilter.toLowerCase()));
    }

    if (activeSkillFilter !== 'all') {
      courses = courses.filter(c => c.skill.toLowerCase() === activeSkillFilter.toLowerCase());
    }

    if (activeLevelFilter !== 'all') {
      courses = courses.filter(c => c.level.toLowerCase().includes(activeLevelFilter.toLowerCase()));
    }

    if (courses.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 2.5rem; background: var(--bg-surface); border-radius: var(--radius-lg); border: 1px dashed var(--border-strong);">
          <div style="font-size: 2rem; margin-bottom: 0.5rem;">📚</div>
          <h4>No free accredited courses found matching current filters</h4>
          <p style="color: var(--text-muted); font-size: 0.85rem; margin-top: 0.35rem;">Select "All Trusted Providers" to view Skill India, SWAYAM, Google, and Microsoft programs.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = courses.map(course => renderCourseCard(course)).join('');
  }

  function renderCourseCard(course) {
    const isSkillInProfile = (AppState.profile.skills || []).some(s => s.toLowerCase() === course.skill.toLowerCase());
    const skillsImprovedStr = (course.skills_improved || [course.skill]).join(' • ');

    return `
      <div class="course-card">
        <div class="course-provider-row">
          <span class="course-provider-badge">
            <span>${course.provider_logo || '🎓'}</span>
            <span>${window.escapeHtml(course.provider)}</span>
          </span>
          <span class="free-tag">100% Free</span>
        </div>

        <h3>${window.escapeHtml(course.title)}</h3>

        <div class="course-meta-row">
          <div>🎯 Focus Skill: <strong>${window.escapeHtml(course.skill)}</strong></div>
          <div style="display: flex; gap: 0.75rem;">
            <span>⏱️ ${window.escapeHtml(course.duration)}</span>
            <span>📶 ${window.escapeHtml(course.level)}</span>
          </div>
          ${course.eligibility ? `<div style="font-size: 0.75rem; color: var(--text-muted);">📋 Eligibility: ${window.escapeHtml(course.eligibility)}</div>` : ''}
        </div>

        <p class="course-desc">${window.escapeHtml(course.description)}</p>

        <div class="course-skills-improved">
          <strong style="font-size: 0.75rem; color: var(--primary);">Skills Improved for Internships:</strong><br>
          <span>${window.escapeHtml(skillsImprovedStr)}</span>
        </div>

        <div class="course-free-note">
          ✓ ${window.escapeHtml(course.free_details)}
        </div>

        <div style="display: flex; gap: 0.5rem; align-items: center; margin-top: auto;">
          <a href="${window.escapeHtml(course.enrollment_url)}" target="_blank" rel="noopener noreferrer" class="btn btn-primary" style="flex: 1;">
            Direct Enrollment ↗
          </a>
          ${!isSkillInProfile ? `
            <button class="btn btn-secondary" onclick="window.SkillUpModule.addSkillToProfile('${window.escapeHtml(course.skill)}')" title="Add to profile after completing course">
              + Skill
            </button>
          ` : `
            <span style="font-size: 0.775rem; color: var(--success-text); font-weight: 700; padding: 0.4rem;">
              ✓ In Profile
            </span>
          `}
        </div>
      </div>
    `;
  }

  function addSkillToProfile(skill) {
    if (!AppState.profile.skills.includes(skill)) {
      AppState.profile.skills.push(skill);
      localStorage.setItem('findme_profile', JSON.stringify(AppState.profile));
      window.showToast(`Added "${skill}" to your active skills!`, 'success');
      window.recomputeMatches();
      renderCourses();
    }
  }

  return {
    init,
    renderSkillUpView,
    filterBySkill,
    addSkillToProfile
  };
})();

window.SkillUpModule = SkillUpModule;
