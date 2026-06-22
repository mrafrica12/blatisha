# Admin Panel — Latisha Blake Real Estate

A minimalist, Apple-inspired admin panel to manage blog posts, sales listings, and leads.

---

## 🚀 Quick Start

1. **Access the Admin Panel:**
   - URL: `https://yoursite.com/admin/login.html`
   - Or locally: `http://localhost:8000/admin/login.html`

2. **Login:**
   - Password: `latisha2024`
   - (Change this after first login — see security section)

3. **You're in!**
   - Dashboard shows stats at a glance
   - Navigate via sidebar to Blog, Sales, or Leads

---

## 📋 Features

### Dashboard
- **Overview Stats:** Blog posts, sales, new leads
- **Quick Actions:** Jump to create new content
- **Export Tools:** Backup your data as JSON/CSV
- **Last Updated:** Timestamp showing latest changes

### Blog Manager
**Manage your real estate articles and market insights**

- ✏️ **Create Posts** — Title, category, excerpt, full content
- 📅 **Date Control** — Set publication date
- 🏷️ **Categories** — Buying | Selling | Market Update
- 📖 **Full Editor** — Rich text for long-form articles
- 🗑️ **Delete** — Remove old posts instantly
- 💾 **Auto-Save** — Saves to browser storage

**Content Ideas:**
- 5 Things First-Time Buyers Should Know
- Best Time to Sell Your Home
- How to Stage Your Home
- Market Trends in 2026
- First-Time Buyer Guide

### Sales Manager
**Showcase your closed transactions**

- 🏠 **Add Sales** — Price, address, beds/baths, date sold
- 📸 **Image URLs** — Add property photos (Unsplash or your own)
- 📊 **Track Record** — Display social proof of closed deals
- 🗑️ **Edit/Delete** — Update or remove listings
- 💾 **Auto-Save** — Stored locally

**What to Include:**
- Sale price (big number, builds trust)
- Full address and ZIP
- Bedrooms & bathrooms
- Sale date (recent closings are best)
- Professional photo

### Leads Dashboard
**Manage all form submissions**

- 📧 **View Leads** — All form submissions in one place
- 🔍 **Search** — Find leads by name, phone, or email
- 🏷️ **Filter** — By type (Valuation vs. Contact)
- ✅ **Track Status** — Mark as "Contacted" or "Pending"
- 📋 **Quick Copy** — Copy phone/email with one click
- 📥 **Export** — Download as CSV for spreadsheets

**Lead Sources:**
- Valuation requests (home appraisals)
- Contact form submissions
- All data captured on your website

---

## 🎨 Design Philosophy

**Apple-Inspired Minimalism:**
- ✨ Clean, spacious interface
- 🎯 Focus on content, not chrome
- ⚡ Fast, responsive, intuitive
- 🔤 Clear typography and hierarchy
- 🎭 Subtle animations and transitions
- 📱 Perfect on mobile, tablet, desktop

---

## 💾 Data Storage

**Everything is stored locally in your browser:**
- Browser LocalStorage (not cloud)
- Survives browser restart
- Private to your device
- Export anytime as JSON/CSV backup

### Storage Keys:
- `blogPosts` — Blog articles
- `soldSales` — Sales listings
- `formLeads` — Form submissions

### Backup Data:
```bash
# Export all data
- Dashboard → Data Management → Export buttons
- Or manually access browser DevTools → Application → LocalStorage
```

---

## 🔐 Security & Access

### Current Setup (Demo)
- Password: `latisha2024`
- Session-based (logs out when browser closes)
- Works offline (no backend required)

### For Production:
1. **Change Password** — Edit `login.html` line 60:
   ```javascript
   const ADMIN_PASSWORD = 'your-secure-password-here';
   ```

2. **Use HTTPS** — Always serve admin on HTTPS

3. **Consider Auth Services:**
   - Firebase Authentication
   - Auth0
   - AWS Cognito
   - Or custom backend

4. **Secure the URL:**
   - Don't advertise `/admin/` path
   - Use IP whitelist if possible
   - Add rate limiting

---

## 📱 Responsive Design

Works perfectly on:
- ✅ Desktop (full sidebar + content)
- ✅ Tablet (collapsible sidebar)
- ✅ Mobile (stacked layout)

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + S` | Submit form |
| `Escape` | Close form |

---

## 🔄 Syncing with Website

### Blog Posts → Website
1. Add blog post in Admin → Blog
2. Post appears on website's Blog section automatically
3. Website reads from `localStorage` (`blogPosts` key)

**Implementation in website:**
```javascript
// In main.js, the website checks:
let blogPosts = JSON.parse(localStorage.getItem('blogPosts')) || [];
// Renders blog posts dynamically
```

### Sales → Website
1. Add sale in Admin → Sales
2. Sale appears in "Recent Sales" section automatically
3. Website reads from `localStorage` (`soldSales` key)

### Leads → Admin Dashboard
1. Visitor submits valuation or contact form
2. Automatically captured and stored
3. Appears in Admin → Leads instantly

---

## 🚀 Advanced Features

### Export Data
**Dashboard > Data Management**
- Blog posts as JSON
- Sales as JSON
- Leads as CSV (spreadsheet-friendly)

### Mark Leads as Contacted
- Click "Mark Contacted" button
- Tracked with visual indicator
- Helps you remember follow-ups

### Search & Filter
- Search by name, phone, email, or address
- Filter by form type (Valuation / Contact)
- Perfect for finding specific leads

---

## ⚙️ Troubleshooting

### "No posts/sales/leads showing"
- Check browser console (F12) for errors
- Verify LocalStorage has data (DevTools → Application → LocalStorage)
- Try clearing browser cache and reload

### "Lost my data"
- Check if using different browser/device
- Data is per-device/per-browser
- Use export feature regularly to backup

### "Forms not appearing in Leads"
- Ensure website's main.js saves form data to localStorage
- Check that key is `formLeads`
- Verify website and admin share same domain

### "Password not working"
- Make sure CAPS LOCK is off
- Default: `latisha2024` (case-sensitive)
- Check browser console for errors

---

## 📝 Content Best Practices

### Blog Posts
- **Title:** Clear, SEO-friendly (50-60 characters)
- **Category:** Pick one (Buying/Selling/Market Update)
- **Excerpt:** Compelling 2-line summary (150-200 characters)
- **Body:** 300-800 words, valuable info, authentic voice
- **Frequency:** 1-2 posts per month recommended

### Sales Listings
- **Price:** Always include (removes guesswork)
- **Address:** Full address + ZIP (builds trust)
- **Photo:** Professional property image
- **Specs:** Accurate beds/baths/sqft
- **Date:** Recent closings show activity
- **Frequency:** Add as you close deals

### Leads
- **Follow up quickly** — Within 24 hours
- **Personal touch** — Reference their submission
- **Track status** — Mark as contacted when reached
- **Archive old leads** — Export and clear regularly

---

## 🔗 Related Files

- **Website:** `/index.html` — Main site
- **Website JS:** `/assets/js/main.js` — Handles form capture
- **Website CSS:** `/assets/css/style.css` — Styling
- **Admin CSS:** `/admin/assets/css/admin.css` — Admin styling
- **Admin JS:** `/admin/assets/js/admin.js` — Admin utilities

---

## 📞 Support & Tips

**Quick Wins:**
1. Create 3 blog posts this week
2. Add your 5 most recent sales closings
3. Export your data weekly to backup

**Monthly Routine:**
1. Add 1-2 new blog posts
2. Review and respond to new leads
3. Update sales if closed new deals
4. Export data backup

**SEO Tips:**
- Blog titles with "Atlanta," "Marietta," "Decatur" for local SEO
- Include neighborhood names in content
- Keyword examples: "best time to sell," "first-time buyer," "Atlanta real estate"

---

## ✨ Features Coming Soon

- Integration with MLS API (auto-pull listings)
- Email templates for lead follow-up
- Analytics dashboard (traffic, leads source)
- Testimonials manager
- Schedule blog posts for future publish
- Database backend instead of LocalStorage

---

## 📄 License & Terms

This admin panel is built for Latisha Blake Real Estate and is part of the website codebase. All content you add remains your property.

---

**Made with ❤️ — Clean, minimal, powerful.**
