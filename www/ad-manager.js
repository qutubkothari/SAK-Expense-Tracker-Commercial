// Ad Manager - Controls when and where ads are shown
// Only shows ads to FREE users (not premium subscribers)

class AdManager {
  constructor() {
    this.adsEnabled = false;
    this.adSlots = {
      banner: null,
      expenseList: null,
      interstitial: null
    };
    this.expenseCount = 0;
    this.showInterstitialAfter = 10; // Show interstitial after 10 expenses added
  }

  async init() {
    // Check if user is premium subscriber
    const subscription = await this.checkSubscription();
    
    if (subscription === 'free') {
      this.adsEnabled = true;
      this.loadAds();
      console.log('📢 Ads enabled for free tier');
    } else {
      console.log('✨ Premium user - No ads');
      this.hideAllAdSlots();
    }
  }

  async checkSubscription() {
    // Get user subscription status from your existing system
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return 'free';

      const { data: userData } = await supabase
        .from('users')
        .select('subscription_tier')
        .eq('id', user.id)
        .single();

      return userData?.subscription_tier || 'free';
    } catch (error) {
      console.error('Error checking subscription:', error);
      return 'free';
    }
  }

  loadAds() {
    // Load banner ad at bottom of screen
    this.createBannerAd();
    
    // Load ad in expense list (after every 5 expenses)
    this.createExpenseListAd();
    
    // Setup interstitial ad
    this.setupInterstitialAd();
  }

  createBannerAd() {
    const container = document.getElementById('bannerAdContainer');
    if (!container) {
      console.log('Banner ad container not found');
      return;
    }

    // Google AdSense banner ad with strict size constraints
    const ad = document.createElement('ins');
    ad.className = 'adsbygoogle';
    ad.style.display = 'inline-block';
    ad.style.width = '100%';
    ad.style.maxWidth = '728px';
    ad.style.height = '60px';
    ad.style.maxHeight = '60px';
    ad.style.minHeight = '50px';
    ad.setAttribute('data-ad-client', 'ca-pub-YOUR_PUBLISHER_ID');
    ad.setAttribute('data-ad-slot', 'YOUR_BANNER_SLOT_ID');
    ad.setAttribute('data-ad-format', 'horizontal');
    
    container.appendChild(ad);
    
    // Add additional constraint wrapper
    container.style.minHeight = '60px';
    container.style.maxHeight = '90px';
    
    try {
      (adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error('Ad error:', e);
    }
  }

  createExpenseListAd() {
    // This will be inserted into the expense list every 5 items
    const adHTML = `
      <div class="expense-list-ad" style="margin: 15px 0; text-align: center;">
        <ins class="adsbygoogle"
             style="display:block"
             data-ad-format="fluid"
             data-ad-layout-key="-fb+5w+4e-db+86"
             data-ad-client="ca-pub-YOUR_PUBLISHER_ID"
             data-ad-slot="YOUR_LIST_SLOT_ID"></ins>
      </div>
    `;
    
    this.adSlots.expenseList = adHTML;
  }

  insertAdInExpenseList(expenseListContainer, position) {
    if (!this.adsEnabled) return;
    
    const expenses = expenseListContainer.querySelectorAll('.expense-item');
    if (expenses.length >= position) {
      const adDiv = document.createElement('div');
      adDiv.innerHTML = this.adSlots.expenseList;
      expenses[position - 1].after(adDiv);
      
      try {
        (adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        console.error('Ad error:', e);
      }
    }
  }

  setupInterstitialAd() {
    // Show interstitial ad after user adds certain number of expenses
    window.addEventListener('expenseAdded', () => {
      this.expenseCount++;
      
      if (this.expenseCount % this.showInterstitialAfter === 0) {
        this.showInterstitial();
      }
    });
  }

  showInterstitial() {
    if (!this.adsEnabled) return;
    
    // Create interstitial overlay
    const overlay = document.createElement('div');
    overlay.id = 'interstitialAdOverlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      z-index: 10000;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    `;
    
    overlay.innerHTML = `
      <div style="background: white; padding: 20px; border-radius: 10px; max-width: 90%; max-height: 80%; overflow: auto;">
        <div style="text-align: right; margin-bottom: 10px;">
          <button onclick="adManager.closeInterstitial()" style="background: #667eea; color: white; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer; font-size: 14px;">
            ✕ Close (5s)
          </button>
        </div>
        <ins class="adsbygoogle"
             style="display:block"
             data-ad-format="interstitial"
             data-ad-client="ca-pub-YOUR_PUBLISHER_ID"
             data-ad-slot="YOUR_INTERSTITIAL_SLOT_ID"></ins>
        <div style="text-align: center; margin-top: 15px;">
          <p style="color: #666; font-size: 14px;">💎 Upgrade to Premium to remove ads</p>
          <button onclick="openPaywallModal()" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; font-size: 16px; margin-top: 10px;">
            Go Premium - ₹199/month
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(overlay);
    
    try {
      (adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error('Ad error:', e);
    }
    
    // Enable close button after 5 seconds
    let countdown = 5;
    const closeBtn = overlay.querySelector('button');
    const interval = setInterval(() => {
      countdown--;
      closeBtn.textContent = `✕ Close (${countdown}s)`;
      if (countdown <= 0) {
        closeBtn.textContent = '✕ Close';
        closeBtn.disabled = false;
        clearInterval(interval);
      }
    }, 1000);
    
    closeBtn.disabled = true;
  }

  closeInterstitial() {
    const overlay = document.getElementById('interstitialAdOverlay');
    if (overlay) {
      overlay.remove();
    }
  }

  hideAllAdSlots() {
    // Hide all ad containers for premium users
    const containers = document.querySelectorAll('[id$="AdContainer"], .expense-list-ad');
    containers.forEach(container => {
      container.style.display = 'none';
    });
  }

  // Call this when user upgrades to premium
  async disableAds() {
    this.adsEnabled = false;
    this.hideAllAdSlots();
    console.log('✨ Ads disabled - Premium active');
  }
}

// Initialize ad manager
const adManager = new AdManager();

// Initialize when DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    adManager.init();
  }, 2000); // Wait 2 seconds for app to initialize
});
