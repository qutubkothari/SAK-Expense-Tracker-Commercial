// Onboarding Tutorial System
const ONBOARDING_KEY = 'expense-tracker-onboarding-completed';

const tutorialSteps = [
  {
    target: '.summary-cards',
    title: '📊 Your Dashboard',
    content: 'Track your business expenses, transaction count, and AI insights at a glance.',
    position: 'bottom'
  },
  {
    target: '#amount',
    title: '💰 Add Expenses',
    content: 'Enter the amount, select category, and click Add. Track business and personal expenses separately.',
    position: 'bottom'
  },
  {
    target: '#voiceBtn',
    title: '🎤 Voice Input',
    content: 'Click Voice, wait for "Listening...", then say: "500 rupees for office supplies at Staples"',
    position: 'top'
  },
  {
    target: '#smsBtn',
    title: '📱 SMS Scanner',
    content: 'Paste bank transaction SMS to automatically extract expense details.',
    position: 'top'
  },
  {
    target: '#receiptBtn',
    title: '📸 Receipt Scanner',
    content: 'Take photos of business receipts and we\'ll extract the amount, merchant, and date automatically!',
    position: 'top'
  },
  {
    target: '#manageBudgetsBtn',
    title: '📊 Set Budgets',
    content: 'Create category budgets for your business and get alerts when approaching limits.',
    position: 'bottom'
  },
  {
    target: '#themeToggle',
    title: '🌙 Dark Mode',
    content: 'Toggle between light and dark themes for comfortable viewing any time.',
    position: 'bottom'
  },
  {
    target: '.filters-card',
    title: '🔍 Filters & Reports',
    content: 'Filter by date, category, location, or business to analyze your spending patterns and generate reports.',
    position: 'top'
  }
];

let currentStep = 0;
let onboardingOverlay = null;
let tooltipElement = null;

// Check if onboarding should be shown
function shouldShowOnboarding() {
  return !localStorage.getItem(ONBOARDING_KEY);
}

// Start onboarding tutorial
function startOnboarding() {
  if (!shouldShowOnboarding()) return;
  
  // Wait for page to fully load
  setTimeout(() => {
    createOverlay();
    showStep(0);
  }, 1000);
}

// Create dark overlay
function createOverlay() {
  onboardingOverlay = document.createElement('div');
  onboardingOverlay.id = 'onboardingOverlay';
  onboardingOverlay.className = 'onboarding-overlay';
  document.body.appendChild(onboardingOverlay);
}

// Remove overlay
function removeOverlay() {
  if (onboardingOverlay) {
    onboardingOverlay.remove();
    onboardingOverlay = null;
  }
  if (tooltipElement) {
    tooltipElement.remove();
    tooltipElement = null;
  }
}

// Show specific step
function showStep(stepIndex) {
  if (stepIndex >= tutorialSteps.length) {
    completeOnboarding();
    return;
  }
  
  currentStep = stepIndex;
  const step = tutorialSteps[stepIndex];
  
  // Find target element
  const targetElement = document.querySelector(step.target);
  if (!targetElement) {
    console.warn(`Onboarding target not found: ${step.target}`);
    showStep(stepIndex + 1);
    return;
  }
  
  // Highlight target element
  highlightElement(targetElement);
  
  // Show tooltip
  showTooltip(targetElement, step, stepIndex);
}

// Highlight target element
function highlightElement(element) {
  // Remove previous highlights
  document.querySelectorAll('.onboarding-highlight').forEach(el => {
    el.classList.remove('onboarding-highlight');
  });
  
  // Add highlight to current element
  element.classList.add('onboarding-highlight');
  
  // Scroll element into view
  element.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Show tooltip with step information
function showTooltip(targetElement, step, stepIndex) {
  // Remove existing tooltip
  if (tooltipElement) {
    tooltipElement.remove();
  }
  
  // Create tooltip
  tooltipElement = document.createElement('div');
  tooltipElement.className = 'onboarding-tooltip';
  
  const isLastStep = stepIndex === tutorialSteps.length - 1;
  
  tooltipElement.innerHTML = `
    <div class="tooltip-header">
      <h3>${step.title}</h3>
      <button class="tooltip-close" onclick="skipOnboarding()">×</button>
    </div>
    <div class="tooltip-content">
      <p>${step.content}</p>
    </div>
    <div class="tooltip-footer">
      <div class="tooltip-progress">
        <span>${stepIndex + 1} of ${tutorialSteps.length}</span>
        <div class="progress-dots">
          ${tutorialSteps.map((_, i) => 
            `<span class="dot ${i === stepIndex ? 'active' : i < stepIndex ? 'completed' : ''}"></span>`
          ).join('')}
        </div>
      </div>
      <div class="tooltip-actions">
        ${stepIndex > 0 ? '<button class="btn-tooltip btn-secondary" onclick="previousStep()">Back</button>' : ''}
        ${isLastStep 
          ? '<button class="btn-tooltip btn-primary" onclick="completeOnboarding()">Get Started! 🚀</button>'
          : '<button class="btn-tooltip btn-primary" onclick="nextStep()">Next</button>'
        }
      </div>
    </div>
  `;
  
  document.body.appendChild(tooltipElement);
  
  // Position tooltip
  positionTooltip(tooltipElement, targetElement, step.position);
}

// Position tooltip relative to target
function positionTooltip(tooltip, target, position) {
  const targetRect = target.getBoundingClientRect();
  const tooltipRect = tooltip.getBoundingClientRect();
  
  let top, left;
  
  switch (position) {
    case 'top':
      top = targetRect.top - tooltipRect.height - 20;
      left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);
      tooltip.classList.add('tooltip-top');
      break;
      
    case 'bottom':
      top = targetRect.bottom + 20;
      left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);
      tooltip.classList.add('tooltip-bottom');
      break;
      
    case 'left':
      top = targetRect.top + (targetRect.height / 2) - (tooltipRect.height / 2);
      left = targetRect.left - tooltipRect.width - 20;
      tooltip.classList.add('tooltip-left');
      break;
      
    case 'right':
      top = targetRect.top + (targetRect.height / 2) - (tooltipRect.height / 2);
      left = targetRect.right + 20;
      tooltip.classList.add('tooltip-right');
      break;
      
    default:
      top = targetRect.bottom + 20;
      left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);
  }
  
  // Keep tooltip within viewport
  const margin = 10;
  top = Math.max(margin, Math.min(top, window.innerHeight - tooltipRect.height - margin));
  left = Math.max(margin, Math.min(left, window.innerWidth - tooltipRect.width - margin));
  
  tooltip.style.top = `${top + window.scrollY}px`;
  tooltip.style.left = `${left}px`;
}

// Navigate to next step
window.nextStep = function() {
  showStep(currentStep + 1);
};

// Navigate to previous step
window.previousStep = function() {
  if (currentStep > 0) {
    showStep(currentStep - 1);
  }
};

// Skip onboarding
window.skipOnboarding = function() {
  if (confirm('Skip the tutorial? You can restart it from Settings later.')) {
    completeOnboarding();
  }
};

// Complete onboarding
function completeOnboarding() {
  localStorage.setItem(ONBOARDING_KEY, 'true');
  removeOverlay();
  
  // Remove highlights
  document.querySelectorAll('.onboarding-highlight').forEach(el => {
    el.classList.remove('onboarding-highlight');
  });
  
  // Show completion message
  showCompletionMessage();
}

// Show completion message
function showCompletionMessage() {
  const message = document.createElement('div');
  message.className = 'onboarding-complete-message';
  message.innerHTML = `
    <div class="completion-content">
      <div class="completion-icon">🎉</div>
      <h2>You're all set!</h2>
      <p>Start tracking your expenses and let AI help you save money.</p>
    </div>
  `;
  
  document.body.appendChild(message);
  
  setTimeout(() => {
    message.classList.add('show');
  }, 100);
  
  setTimeout(() => {
    message.classList.remove('show');
    setTimeout(() => message.remove(), 300);
  }, 3000);
}

// Restart onboarding (for settings)
window.restartOnboarding = function() {
  localStorage.removeItem(ONBOARDING_KEY);
  startOnboarding();
};

// Initialize onboarding after app loads
window.addEventListener('load', () => {
  // Wait for app to be ready
  const checkAppReady = setInterval(() => {
    const appSection = document.getElementById('appSection');
    if (appSection && appSection.style.display !== 'none') {
      clearInterval(checkAppReady);
      startOnboarding();
    }
  }, 500);
});
