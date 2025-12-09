# 💼 Business Expense Manager - Commercial Version

[![Status](https://img.shields.io/badge/status-ready%20for%20testing-yellow)](https://github.com/qutubkothari/SAK-Expense-Tracker-Commercial)
[![Platform](https://img.shields.io/badge/platform-Web%20%7C%20Android%20%7C%20iOS-blue)](https://github.com/qutubkothari/SAK-Expense-Tracker-Commercial)
[![License](https://img.shields.io/badge/license-Commercial-red)](https://github.com/qutubkothari/SAK-Expense-Tracker-Commercial)

A powerful, AI-enhanced business expense tracking application for single business users. Track expenses across multiple currencies, manage budgets, scan receipts with AI, and generate comprehensive reports.

## 🚀 Quick Start

**Get started in 3 steps:**

1. **Setup Database** (5 min)
   - Open [Supabase Dashboard](https://supabase.com/dashboard/project/hcjsmankbnnehylughxy)
   - Run `database/COMMERCIAL-SETUP.sql`

2. **Test Locally** (2 min)
   ```bash
   python -m http.server 8000
   # Open http://localhost:8000
   ```

3. **Build Android** (10 min)
   ```bash
   npx cap sync android
   npx cap open android
   ```

📖 **[Full Setup Guide](SETUP-GUIDE.md)** | 🎯 **[Quick Start](QUICK-START.md)** | 📊 **[Completion Report](COMPLETION-REPORT.md)**

---

## ✨ Features

### Core Functionality
- ✅ **Single-User Business Accounts** - No family sharing, simple registration
- 💰 **Multi-Currency Support** - Track expenses in INR, AED, USD, EUR, GBP, SAR, and more
- 📊 **Budget Management** - Set category budgets with automatic alerts
- 🤖 **AI-Powered Insights** - Smart spending analysis and recommendations
- 📸 **Receipt Scanner** - Extract data from receipts using OpenAI Vision API
- 🎤 **Voice Input** - Add expenses by speaking naturally
- 📱 **SMS Auto-Scan** - Parse bank SMS transactions automatically
- 📈 **Advanced Reports** - Export to CSV, Excel, and PDF
- 🔄 **Offline Sync** - Works offline, syncs when online
- 🌙 **Dark Mode** - Eye-friendly theme switching
- 🌐 **Multi-Language** - English, Arabic, Hindi, and 15+ languages

### Business-Focused
- 💼 **Expense Types** - Business, Personal, Travel
- 🏢 **Business Tracking** - Tag expenses by business name
- 🌍 **Location Tracking** - Geographic expense analysis
- 💳 **Payment Methods** - Cash, Bank, Credit/Debit Card, UPI, Wallet
- 📋 **Reimbursement Tracking** - Flag reimbursable expenses
- 🧾 **Tax Categories** - Track deductible expenses
- 🔁 **Recurring Subscriptions** - Auto-detect and manage subscriptions

---

## 🏗️ Architecture

### Tech Stack
- **Frontend:** Vanilla JavaScript, HTML5, CSS3
- **Backend:** Supabase (PostgreSQL)
- **Mobile:** Capacitor (Android/iOS)
- **AI:** OpenAI GPT-4 Vision API
- **Hosting:** Google App Engine (optional)

### Database
- 13 tables with optimized indexes
- Multi-currency exchange rate caching
- RLS disabled (REST API access)
- Automatic timestamp triggers
- Default categories and subcategories

### Security
- Phone + PIN authentication
- API keys in environment (not hardcoded)
- Input validation and sanitization
- HTTPS recommended for production

---

## 📂 Project Structure

```
SAK-Expense-Tracker-Commercial/
├── 📄 SETUP-GUIDE.md           # Comprehensive setup instructions
├── 📄 QUICK-START.md           # Quick 3-step guide
├── 📄 COMPLETION-REPORT.md     # Project status and details
├── 📁 database/
│   └── COMMERCIAL-SETUP.sql    # Master database schema
├── 📁 android/                 # Android project
├── 📁 ios/                     # iOS project  
├── 📁 www/                     # Web assets
├── 📁 scripts/                 # Build and deploy scripts
├── 🔧 app.js                   # Main application logic
├── 🔧 auth.js                  # Authentication module
├── 🔧 sync-manager.js          # Offline sync manager
├── 🔧 receipt-scanner.js       # AI receipt scanner
├── 🔧 voiceAI.js               # AI voice input
├── 🔧 budget-manager.js        # Budget management
└── 🔧 export-manager.js        # Data export
```

---

## 🔧 Configuration

### Supabase
- **URL:** `https://hcjsmankbnnehylughxy.supabase.co`
- **Project:** Business Expense Manager Commercial
- **Region:** Auto-selected
- **Database:** PostgreSQL 15

### Google Cloud
- **Project ID:** `sak-expense-tracker-commercial`
- **Service:** App Engine (optional web hosting)

### OpenAI (Optional)
- Required for AI features (Receipt Scanner, Voice AI)
- Get API key: https://platform.openai.com/api-keys
- Configure in: `app.js`, `receipt-scanner.js`

---

## 📱 Platform Support

| Platform | Status | Version |
|----------|--------|---------|
| **Web (PWA)** | ✅ Ready | 1.0.0 |
| **Android** | ✅ Ready | 1.0.0 |
| **iOS** | 🚧 Untested | 1.0.0 |

### Requirements
- **Android:** API 22+ (Android 5.1+)
- **iOS:** iOS 13.0+
- **Web:** Modern browsers (Chrome, Firefox, Safari, Edge)

---

## 🎯 Roadmap

### Phase 1: Launch (Current)
- [x] Core expense tracking
- [x] Multi-currency support
- [x] Budget management
- [x] AI receipt scanner
- [x] Voice input
- [x] SMS auto-scan
- [ ] Database setup
- [ ] Production testing
- [ ] Play Store release

### Phase 2: Enhancements (Future)
- [ ] Team accounts (different from family)
- [ ] Cloud backup/restore
- [ ] Advanced tax reports
- [ ] Integration with accounting software
- [ ] Custom categories/subcategories
- [ ] Recurring expense automation
- [ ] Bank statement import

### Phase 3: Enterprise (Future)
- [ ] Multi-user teams
- [ ] Role-based permissions
- [ ] Expense approval workflows
- [ ] API for integrations
- [ ] White-label options

---

## 🔒 Security & Privacy

### Data Protection
- User data stored in Supabase (encrypted at rest)
- HTTPS recommended for all connections
- No third-party analytics or tracking
- OpenAI API: Receipt images not stored by OpenAI

### Authentication
- Phone number + PIN (6 digits)
- No passwords stored in plain text
- Session management via localStorage
- Optional: Add JWT tokens for enhanced security

---

## 🤝 Contributing

This is a commercial project. Contributions are managed internally.

For issues or feature requests, please contact the project maintainer.

---

## 📞 Support

### Documentation
- [Setup Guide](SETUP-GUIDE.md) - Complete setup instructions
- [Quick Start](QUICK-START.md) - Get started in 3 steps
- [Completion Report](COMPLETION-REPORT.md) - Project details

### Troubleshooting
See the troubleshooting section in [SETUP-GUIDE.md](SETUP-GUIDE.md#troubleshooting)

### Contact
For support inquiries, please open an issue or contact the project owner.

---

## 📄 License

Commercial License - All Rights Reserved

This is a commercial product. Unauthorized copying, modification, or distribution is prohibited.

---

## 🎉 Credits

**Original Project:** SAK-Expense-Tracker (Family version)  
**Commercial Version:** Converted for single-user business use  
**Client:** Commercial license holder  
**Technology:** Supabase, Capacitor, OpenAI, Google Cloud

---

## 📊 Project Stats

- **Lines of Code:** ~15,000+
- **Files:** 240+
- **Database Tables:** 13
- **Supported Currencies:** 13
- **Languages:** 18
- **Features:** 25+
- **Documentation:** 1,000+ lines

---

## 🔗 Links

- **Repository:** https://github.com/qutubkothari/SAK-Expense-Tracker-Commercial
- **Supabase:** https://supabase.com/dashboard/project/hcjsmankbnnehylughxy
- **GCloud:** `sak-expense-tracker-commercial`

---

## ⚡ Status

**Current Phase:** Database Setup & Testing  
**Next Steps:** 
1. Run database setup script
2. Test locally
3. Build Android APK
4. Production release

**Last Updated:** December 9, 2025  
**Version:** 1.0.0-commercial

---

<div align="center">

**Made with ❤️ for Business Users**

[Setup Guide](SETUP-GUIDE.md) • [Quick Start](QUICK-START.md) • [Report](COMPLETION-REPORT.md)

</div>
