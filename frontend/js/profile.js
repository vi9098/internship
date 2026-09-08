/**
 * Find Me - Profile Onboarding Wizard & Management Module
 */

const ProfileModule = (() => {
  let currentStep = 1;
  const totalSteps = 4;

  const popularSkills = [
    'Python', 'C++', 'Java', 'JavaScript', 'Go', 'SQL',
    'Machine Learning', 'Deep Learning', 'PyTorch', 'Data Analysis', 'Statistics',
    'Git', 'Linux', 'Cloud Computing', 'AWS', 'Azure', 'Cybersecurity',
    'Policy Analysis', 'Research', 'GIS', 'Financial Modeling', 'Econometrics',
    'Project Management', 'Public Sector Management', 'Communication', 'Report Writing'
  ];

  const popularCountries = [
    'India', 'Global Remote', 'Switzerland', 'United States',
    'United Kingdom', 'Germany', 'Singapore', 'Canada'
  ];

  const popularIndustries = [
    'Government & Public Policy', 'Space & Aerospace', 'Finance & Economics',
    'Technology & Software', 'AI & Machine Learning', 'Climate & Clean Energy',
    'Healthcare & Biotech', 'International Relations & Diplomacy'
  ];

  function init() {
    setupEventListeners();
    populateFormWithProfile();
    renderSkillPool();
  }

  function setupEventListeners() {
    document.querySelectorAll('.btn-profile-trigger').forEach(btn => {
      btn.addEventListener('click', openModal);
    });

    const closeBtn = document.getElementById('profile-modal-close');
    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    const nextBtn = document.getElementById('wizard-next-btn');
    const prevBtn = document.getElementById('wizard-prev-btn');
    const saveBtn = document.getElementById('wizard-save-btn');

    if (nextBtn) nextBtn.addEventListener('click', () => goToStep(currentStep + 1));
    if (prevBtn) prevBtn.addEventListener('click', () => goToStep(currentStep - 1));
    if (saveBtn) saveBtn.addEventListener('click', saveAndClose);

    const addSkillBtn = document.getElementById('btn-add-custom-skill');
    const skillInput = document.getElementById('custom-skill-input');
    if (addSkillBtn && skillInput) {
      const addAction = () => {
        const val = skillInput.value.trim();
        if (val && !AppState.profile.skills.includes(val)) {
          AppState.profile.skills.push(val);
          skillInput.value = '';
          renderSelectedSkillChips();
          renderSkillPool();
        }
      };
      addSkillBtn.addEventListener('click', addAction);
      skillInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          addAction();
        }
      });
    }
  }

  function openModal() {
    currentStep = 1;
    updateStepUI();
    populateFormWithProfile();
    const modal = document.getElementById('profile-modal');
    if (modal) modal.classList.add('active');
  }

  function closeModal() {
    const modal = document.getElementById('profile-modal');
    if (modal) modal.classList.remove('active');
  }

  function goToStep(step) {
    if (step < 1 || step > totalSteps) return;
    currentStep = step;
    updateStepUI();
  }

  function updateStepUI() {
    for (let i = 1; i <= totalSteps; i++) {
      const stepEl = document.getElementById(`profile-step-${i}`);
      if (stepEl) stepEl.classList.toggle('active', i === currentStep);

      const navEl = document.getElementById(`step-ind-${i}`);
      if (navEl) navEl.classList.toggle('active', i === currentStep);
    }

    const prevBtn = document.getElementById('wizard-prev-btn');
    const nextBtn = document.getElementById('wizard-next-btn');
    const saveBtn = document.getElementById('wizard-save-btn');

    if (prevBtn) prevBtn.style.display = currentStep > 1 ? 'inline-flex' : 'none';
    if (nextBtn) nextBtn.style.display = currentStep < totalSteps ? 'inline-flex' : 'none';
    if (saveBtn) saveBtn.style.display = currentStep === totalSteps ? 'inline-flex' : 'none';
  }

  function populateFormWithProfile() {
    const p = AppState.profile;

    setVal('prof-name', p.name);
    setVal('prof-edu-level', p.education_level);
    setVal('prof-degree', p.degree);
    setVal('prof-grad-year', p.graduation_year);
    setVal('prof-exp-level', p.experience_level);
    setVal('prof-citizenship', p.citizenship);

    const chkGov = document.getElementById('prof-gov-eligible');
    if (chkGov) chkGov.checked = !!p.eligible_government;

    const chkRemote = document.getElementById('prof-prefer-remote');
    if (chkRemote) chkRemote.checked = !!p.prefer_remote;

    renderSelectedSkillChips();
    renderCountryOptions();
    renderIndustryOptions();
  }

  function renderSelectedSkillChips() {
    const container = document.getElementById('profile-selected-skills');
    if (!container) return;

    container.innerHTML = AppState.profile.skills.map(skill => `
      <span class="profile-chip" style="background: var(--primary-light); border-color: var(--primary); color: var(--primary);">
        ${window.escapeHtml(skill)}
        <button type="button" onclick="window.ProfileModule.removeSkill('${window.escapeHtml(skill)}')" style="background:none; border:none; color:var(--primary); font-weight:bold; cursor:pointer; margin-left:4px;">×</button>
      </span>
    `).join('');
  }

  function renderSkillPool() {
    const poolContainer = document.getElementById('skill-tag-pool');
    if (!poolContainer) return;

    const currentSkills = new Set(AppState.profile.skills.map(s => s.toLowerCase()));

    poolContainer.innerHTML = popularSkills.map(skill => {
      const isSelected = currentSkills.has(skill.toLowerCase());
      return `
        <button type="button" class="tag-chip-btn ${isSelected ? 'selected' : ''}" onclick="window.ProfileModule.toggleSkill('${window.escapeHtml(skill)}')">
          ${isSelected ? '✓ ' : '+ '}${window.escapeHtml(skill)}
        </button>
      `;
    }).join('');
  }

  function toggleSkill(skill) {
    const idx = AppState.profile.skills.findIndex(s => s.toLowerCase() === skill.toLowerCase());
    if (idx >= 0) {
      AppState.profile.skills.splice(idx, 1);
    } else {
      AppState.profile.skills.push(skill);
    }
    renderSelectedSkillChips();
    renderSkillPool();
  }

  function removeSkill(skill) {
    AppState.profile.skills = AppState.profile.skills.filter(s => s.toLowerCase() !== skill.toLowerCase());
    renderSelectedSkillChips();
    renderSkillPool();
  }

  function renderCountryOptions() {
    const container = document.getElementById('country-pills-container');
    if (!container) return;

    const prefs = new Set((AppState.profile.preferred_countries || []).map(c => c.toLowerCase()));

    container.innerHTML = popularCountries.map(c => {
      const isActive = prefs.has(c.toLowerCase());
      return `
        <span class="pill-opt ${isActive ? 'active' : ''}" onclick="window.ProfileModule.toggleCountry('${window.escapeHtml(c)}')">
          ${isActive ? '✓ ' : ''}${window.escapeHtml(c)}
        </span>
      `;
    }).join('');
  }

  function toggleCountry(country) {
    const prefs = AppState.profile.preferred_countries || [];
    const idx = prefs.findIndex(c => c.toLowerCase() === country.toLowerCase());
    if (idx >= 0) {
      prefs.splice(idx, 1);
    } else {
      prefs.push(country);
    }
    AppState.profile.preferred_countries = prefs;
    renderCountryOptions();
  }

  function renderIndustryOptions() {
    const container = document.getElementById('industry-pills-container');
    if (!container) return;

    const prefs = new Set((AppState.profile.desired_industries || []).map(i => i.toLowerCase()));

    container.innerHTML = popularIndustries.map(ind => {
      const isActive = prefs.has(ind.toLowerCase());
      return `
        <span class="pill-opt ${isActive ? 'active' : ''}" onclick="window.ProfileModule.toggleIndustry('${window.escapeHtml(ind)}')">
          ${isActive ? '✓ ' : ''}${window.escapeHtml(ind)}
        </span>
      `;
    }).join('');
  }

  function toggleIndustry(industry) {
    const prefs = AppState.profile.desired_industries || [];
    const idx = prefs.findIndex(i => i.toLowerCase() === industry.toLowerCase());
    if (idx >= 0) {
      prefs.splice(idx, 1);
    } else {
      prefs.push(industry);
    }
    AppState.profile.desired_industries = prefs;
    renderIndustryOptions();
  }

  function saveAndClose() {
    AppState.profile.name = getVal('prof-name') || 'Student';
    AppState.profile.education_level = getVal('prof-edu-level') || "Bachelor's";
    AppState.profile.degree = getVal('prof-degree') || 'Computer Science';
    AppState.profile.graduation_year = parseInt(getVal('prof-grad-year')) || 2027;
    AppState.profile.experience_level = getVal('prof-exp-level') || 'No prior experience';
    AppState.profile.citizenship = getVal('prof-citizenship') || 'India';

    const chkGov = document.getElementById('prof-gov-eligible');
    if (chkGov) AppState.profile.eligible_government = chkGov.checked;

    const chkRemote = document.getElementById('prof-prefer-remote');
    if (chkRemote) AppState.profile.prefer_remote = chkRemote.checked;

    localStorage.setItem('findme_profile', JSON.stringify(AppState.profile));

    window.showToast('Profile updated & recommendations refreshed!', 'success');
    closeModal();

    window.recomputeMatches();
  }

  function getVal(id) {
    const el = document.getElementById(id);
    return el ? el.value : '';
  }

  function setVal(id, val) {
    const el = document.getElementById(id);
    if (el && val !== undefined) el.value = val;
  }

  return {
    init,
    openModal,
    closeModal,
    goToStep,
    toggleSkill,
    removeSkill,
    toggleCountry,
    toggleIndustry,
    saveAndClose
  };
})();

window.ProfileModule = ProfileModule;
