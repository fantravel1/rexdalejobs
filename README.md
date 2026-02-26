# RexdaleJobs.com

**A free, community-driven local business directory and jobs hub for Rexdale, Etobicoke & Toronto.**

Live site: [rexdalejobs.com](https://rexdalejobs.com)

---

## What This Project Is

RexdaleJobs.com is a static website that serves as a hyperlocal business directory and employment resource for the Rexdale neighborhood and surrounding areas of Etobicoke, Toronto. It features **803 local business listings** across 201 categories and **35 job/career guide pages** covering everything from entry-level warehouse work to certification guides and resume tips.

The site is entirely static HTML/CSS/JS hosted on GitHub Pages with no backend, no database, and no ongoing server costs. It is designed to be the go-to resource for residents looking for local businesses and job opportunities in their area.

---

## Features

### Business Directory (Homepage)
- **803 businesses** with individual detail pages
- **201 categories** (restaurants, retail, automotive, healthcare, etc.)
- **7 neighborhoods** covered: Rexdale, North Etobicoke, Etobicoke, Woodbine, Weston, Humber Summit, Jamestown
- Full-text search with autocomplete suggestions
- Filter by category, neighborhood, halal, rated, has website, has phone
- Sort by name, category, or rating
- Grid and list view toggle
- Pagination (12 items per page)
- Featured businesses carousel on the homepage
- Favorites system (saved to localStorage)
- Business detail modal with full info
- "Submit a Business" form (via Formspree)
- "Help Complete This Listing" form for crowdsourcing missing info

### Jobs & Career Resource Hub (`/jobs/`)
35 standalone landing pages covering:

| Category | Examples |
|---|---|
| **Job types** | Entry-level, warehouse, retail, restaurant, security, cleaning, healthcare, construction, factory, delivery, remote, night shift, weekend |
| **Location-based** | Pearson Airport jobs, jobs near Humber College, jobs near Kipling Station, jobs near Woodbine Mall, Highway 27 warehouse corridor |
| **Audience-specific** | Jobs for students, teens, newcomers to Canada, parents |
| **Certification guides** | Forklift licence Ontario, security guard licence, Smart Serve, PSW certification, workplace safety certifications |
| **Career resources** | Resume tips (no experience), interview tips, minimum wage guide, free job resources, temp agency guide, summer jobs 2026 |

### Progressive Web App (PWA)
- Installable on mobile and desktop
- Offline support via service worker with stale-while-revalidate caching
- Precaches core assets (HTML, CSS, JS, data)
- Offline fallback page

### SEO & AEO (Answer Engine Optimization)
- **838 crawlable URLs** in the sitemap
- schema.org structured data: `LocalBusiness`, `Organization`, `WebSite`, `BreadcrumbList`, `ItemList`, `FAQPage`
- Open Graph and Twitter Card meta tags on every page
- Canonical URLs, robots.txt, XML sitemap
- Optimized for Google, Bing, and AI search (ChatGPT, Perplexity, etc.)
- Detailed documentation in `SEO_OPTIMIZATION.md`

### UI/UX
- Dark mode with system preference detection and manual toggle
- Mobile-first responsive design
- Toast notifications
- Loading screen with animation
- Announcement bar
- Back-to-top button
- Voice search support
- Accessible (ARIA labels, semantic HTML, proper heading hierarchy, keyboard navigation)
- Google Fonts (Inter)
- CSS custom properties design system with light/dark theme tokens

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Hosting** | GitHub Pages |
| **Domain** | Custom domain via CNAME (`rexdalejobs.com`) |
| **HTML** | Static HTML5, semantic markup |
| **CSS** | Vanilla CSS with custom properties (CSS variables), mobile-first, no frameworks |
| **JavaScript** | Vanilla JS (ES6+, IIFE pattern), no frameworks or build tools |
| **Data** | Single JSON file (`data/businesses.json`) |
| **Forms** | Formspree (newsletter, business submissions, info contributions) |
| **Fonts** | Google Fonts (Inter) |
| **Icons** | Inline SVGs, emoji for category icons |
| **PWA** | Service worker + web app manifest |
| **SEO** | JSON-LD structured data, dynamic SEO optimization script |

**Zero dependencies.** No npm, no build step, no framework. Just files served by GitHub Pages.

---

## Project Structure

```
rexdalejobs/
├── index.html                     # Homepage - directory, search, hero, community stats, about, newsletter, contact
├── CNAME                          # Custom domain: rexdalejobs.com
├── manifest.json                  # PWA web app manifest
├── sw.js                          # Service worker (offline support, caching)
├── robots.txt                     # Search engine crawl rules
├── sitemap.xml                    # 838 URLs for search engines
├── favicon.svg                    # Site favicon
├── offline.html                   # Offline fallback page
│
├── css/
│   ├── style.css                  # Main stylesheet (~3100 lines) - design system, components, responsive
│   └── jobs.css                   # Additional styles for /jobs/ landing pages
│
├── js/
│   ├── app.js                     # Main application (~1650 lines) - search, filters, carousel, favorites, modals
│   └── seo-optimization.js        # Dynamic SEO helpers (schema injection, canonical, resource hints)
│
├── data/
│   └── businesses.json            # All 803 businesses with categories, contact info, services, neighborhoods
│
├── businesses/                    # 803 individual business HTML pages (generated)
│   ├── _template.html             # Template reference
│   ├── master-maid-rexdale.html   # Example: {slug}-{neighborhood}.html
│   └── ...                        # 803 total pages
│
├── jobs/                          # 35 job/career guide landing pages
│   ├── index.html                 # Jobs hub - all categories, career resources, FAQs
│   ├── entry-level-jobs-toronto.html
│   ├── warehouse-jobs-etobicoke.html
│   ├── pearson-airport-jobs.html
│   ├── how-to-get-forklift-licence-ontario.html
│   ├── resume-tips-no-experience.html
│   └── ...                        # 35 total pages
│
├── icons/
│   └── icon.svg                   # App icon for PWA
│
├── Research/                      # Source research data (PDFs, CSV, XLSX)
│   ├── Rexdale_Business_Directory_Complete.csv
│   ├── Toronto_Business_Directory.xlsx
│   └── *.pdf                      # 10 research PDFs covering different business sectors
│
├── generate-business-pages.js     # Node.js script to generate /businesses/ pages from JSON
├── generate-business-sitemap.js   # Node.js script to generate sitemap.xml
│
├── SEO_OPTIMIZATION.md            # Detailed SEO/AEO strategy documentation
├── GENERATION_REPORT.txt          # Business page generation report
├── GENERATION_SUMMARY.txt         # Executive summary of generation
├── BUSINESS_FILES_LIST.txt        # Complete list of generated business files
└── generation_summary.json        # Generation stats in JSON format
```

---

## Data Model

All business data lives in `data/businesses.json`. The structure:

```json
{
  "categories": ["African Food Markets", "Auto Body Shops", "Banks & Credit Unions", "...201 total"],
  "businesses": [
    {
      "name": "Business Name",
      "category": "Category Name",
      "website": "https://example.com",
      "services": "Description of what they offer",
      "neighborhood": "Rexdale",
      "address": "123 Rexdale Blvd, Etobicoke, ON",
      "phone": "(416) 555-1234",
      "hours": "Mon-Fri: 9am-5pm",
      "postal_code": "M9W 1P1",
      "email": "contact@example.com",
      "languages": "English, Somali, Arabic",
      "notes": "Additional notes",
      "halal": true,
      "rating": 4.5,
      "featured": true
    }
  ]
}
```

**Required fields:** `name`
**All other fields are optional** - the UI gracefully handles missing data and even prompts users to crowdsource missing info.

---

## How It Works

### Homepage Flow
1. On page load, `app.js` fetches `data/businesses.json`
2. Categories are extracted and rendered as filterable chips
3. Businesses are filtered/sorted based on user input (search, category, area, toggles)
4. Results display in a paginated grid or list view
5. Clicking a business opens a detail modal
6. Featured businesses rotate in a carousel
7. Favorites are persisted in `localStorage`

### Business Detail Pages
- Generated once from `data/businesses.json` using `generate-business-pages.js`
- Each page is standalone HTML with embedded CSS (no external stylesheet dependency)
- Includes `LocalBusiness` schema.org structured data for SEO
- Naming convention: `{slugified-name}-{neighborhood}.html`

### Job Pages
- Hand-crafted HTML landing pages targeting specific job search intents
- Each page targets specific long-tail keywords (e.g., "warehouse jobs Etobicoke")
- Includes structured data, FAQs, related links, and actionable guidance
- Links back to the main directory and related job categories

### Forms
- All forms submit via [Formspree](https://formspree.io) (form ID: `meekgwvo`)
- Three form types:
  - **Newsletter signup** - email subscription
  - **Submit a Business** - full business details + submitter info
  - **Help Complete a Listing** - crowdsource missing phone/address/website for existing businesses

---

## How to Run Locally

```bash
# Clone the repository
git clone https://github.com/fantravel1/rexdalejobs.git
cd rexdalejobs

# Serve with any static file server
# Option 1: Python
python3 -m http.server 8000

# Option 2: Node.js (npx, no install needed)
npx serve .

# Option 3: PHP
php -S localhost:8000

# Open http://localhost:8000 in your browser
```

No build step required. No dependencies to install.

---

## How to Regenerate Business Pages

If you update `data/businesses.json` and need to regenerate the 803 individual business pages:

```bash
node generate-business-pages.js
```

To regenerate the sitemap:

```bash
node generate-business-sitemap.js
```

---

## How to Deploy

The site is deployed via **GitHub Pages** with a custom domain.

1. Push changes to the repository's deployment branch
2. GitHub Pages serves the files automatically
3. The `CNAME` file points the custom domain `rexdalejobs.com` to GitHub Pages
4. SSL/HTTPS is handled by GitHub Pages

---

## Adapting This for Another City

This project was designed to be replicable. Here is a step-by-step blueprint for creating a similar site for any other neighborhood or city.

### Phase 1: Research & Data Collection (1-2 weeks)

1. **Define your geographic scope.** Pick a specific neighborhood, district, or small city. Hyperlocal focus is key - "Rexdale" not "Toronto."

2. **Research local businesses.** Sources to use:
   - Google Maps: search your area systematically by category
   - Yelp, Yellow Pages, 411.ca (or your country's equivalent)
   - Walk/drive the main streets and strip malls noting every storefront
   - Local Facebook community groups (people post about businesses constantly)
   - City/municipal business registries
   - Local chamber of commerce directories
   - Local newspaper business listings or "best of" lists
   - Community center bulletin boards

3. **Build your dataset.** Create a spreadsheet (CSV or Excel) with these columns for every business:
   - `name` (required)
   - `category` (required - create a consistent taxonomy)
   - `neighborhood` (required - define 4-7 sub-areas within your geographic scope)
   - `address`
   - `phone`
   - `website`
   - `services` (brief description of what they do)
   - `hours`
   - `email`
   - `languages` (especially important for immigrant/multicultural neighborhoods)
   - `halal` or other cultural/dietary indicators relevant to your community
   - `rating` (from Google/Yelp if available)
   - `notes`

   **Aim for 300+ businesses minimum** to make the directory feel comprehensive. This project has 803.

4. **Research job market.** For the jobs section, research:
   - What industries are the biggest local employers?
   - What entry-level jobs are commonly available?
   - What certifications or licences are relevant in your region?
   - Are there nearby transit hubs, airports, malls, or industrial zones that are employment centers?
   - What government job resources exist locally?
   - What temp agencies operate in the area?

5. **Organize your research.** Store source PDFs, spreadsheets, and notes in a `/Research` folder for reference. This project's research includes 10 PDFs and 2 spreadsheets.

### Phase 2: Set Up the Project (1 day)

1. **Fork or clone this repository.**

2. **Find-and-replace city-specific references.** You need to replace these throughout the codebase:
   - `Rexdale` -> Your neighborhood name
   - `Etobicoke` -> Your surrounding district/borough
   - `Toronto` -> Your city
   - `Ontario` -> Your province/state
   - `rexdalejobs.com` -> Your domain
   - `info@kingstrust.ca` -> Your contact email
   - Formspree form ID `meekgwvo` -> Your own Formspree form ID (free at formspree.io)
   - Neighborhood names (Rexdale, North Etobicoke, Woodbine, Weston, Humber Summit, Jamestown) -> Your sub-areas
   - Pearson Airport, Humber College, Kipling Station, Woodbine Mall, Highway 27 -> Your local landmarks
   - Cultural tags (African, Caribbean, South Asian, Somali, etc.) -> Cultures represented in YOUR community

3. **Files you must edit:**

   | File | What to change |
   |---|---|
   | `CNAME` | Your custom domain |
   | `index.html` | All city references, meta tags, hero text, community stats, neighborhood cards, cuisine tags, about text, contact info, structured data |
   | `manifest.json` | App name, description, start_url, scope |
   | `robots.txt` | Sitemap URL |
   | `favicon.svg` | Your branding |
   | `icons/icon.svg` | Your branding |
   | `js/app.js` | Category icon mapping (line ~37), any city-specific logic |
   | `js/seo-optimization.js` | Organization schema, URLs, area served |
   | `css/style.css` | Brand colors in CSS custom properties (`:root` section, lines 1-60) |

### Phase 3: Build Your Data (1-2 days)

1. **Convert your spreadsheet to JSON.** Format it to match the data model described above and save as `data/businesses.json`. The structure must include a `categories` array (unique sorted list of all categories) and a `businesses` array.

2. **Generate individual business pages:**
   ```bash
   node generate-business-pages.js
   ```
   You may need to update the paths in this script. It reads from `data/businesses.json` and writes to `businesses/`.

3. **Generate the sitemap:**
   ```bash
   node generate-business-sitemap.js
   ```

### Phase 4: Create Job Pages (3-5 days)

The `/jobs/` section requires the most original content work. For each job page:

1. **Identify 15-35 job categories** relevant to your area. Look at what jobs are actually hiring locally.

2. **For each category, create a landing page** in `/jobs/`. Use the existing pages as templates. Each page should include:
   - What the job involves (day-to-day duties)
   - Typical pay range in your region
   - Requirements (education, certifications, experience)
   - Where to find these jobs locally (specific employers, job boards, agencies)
   - How to apply (practical steps)
   - Related certifications or training
   - FAQ section with schema.org `FAQPage` markup
   - Links to related job categories

3. **Create certification/resource guides** specific to your region:
   - What licences are needed for common jobs? (security guard, forklift, food handling, etc.)
   - What is the local minimum wage?
   - What free government job resources exist?
   - Resume and interview tips

4. **Update `/jobs/index.html`** to list all your job pages with proper structured data.

### Phase 5: Deploy (1 hour)

1. **Register a domain.** Something like `[neighborhood]jobs.com` or `[city]directory.com`.

2. **Push to GitHub** and enable GitHub Pages in repository settings.

3. **Configure your custom domain:**
   - Add a `CNAME` file with your domain
   - Set up DNS records pointing to GitHub Pages (see [GitHub docs](https://docs.github.com/en/pages/configuring-a-custom-domain-for-github-pages))
   - Enable HTTPS in repo settings

4. **Set up Formspree:**
   - Create a free account at [formspree.io](https://formspree.io)
   - Create a form and get your form ID
   - Replace the Formspree form ID in `index.html` (search for `formspree.io/f/`)

### Phase 6: SEO & Launch (ongoing)

1. **Submit sitemap** to [Google Search Console](https://search.google.com/search-console) and [Bing Webmaster Tools](https://www.bing.com/webmasters)
2. **Verify** all pages are being indexed (target: all URLs in sitemap)
3. **Validate structured data** with [Google Rich Results Test](https://search.google.com/test/rich-results)
4. **Test page speed** with [PageSpeed Insights](https://pagespeed.web.dev/)
5. **Post in local community groups** (Facebook, Reddit, Nextdoor) to get initial traffic and backlinks
6. **Contact local organizations** (community centers, libraries, settlement agencies) to link to your site
7. **Monitor rankings** for key search terms like "[neighborhood] jobs", "businesses in [neighborhood]"

### Cost Breakdown

| Item | Cost |
|---|---|
| GitHub Pages hosting | Free |
| Formspree (free tier, 50 submissions/month) | Free |
| Google Fonts | Free |
| Domain name | ~$12/year |
| SSL certificate | Free (via GitHub Pages) |
| **Total** | **~$12/year** |

---

## Suggested Next Steps

### High Priority
- [ ] **Set up Google Search Console** - submit sitemap, monitor indexation of all 838 URLs
- [ ] **Set up Google Analytics or Plausible** - track traffic, popular pages, search queries
- [ ] **Validate structured data** - run all page types through Google Rich Results Test
- [ ] **Audit business data accuracy** - verify phone numbers, websites, and hours are current
- [ ] **Add a "Last verified" date** to business listings to build user trust

### Content & Growth
- [ ] **Add user reviews/ratings** - even a simple star rating system increases engagement and SEO value
- [ ] **Create neighborhood landing pages** - dedicated pages for each sub-area (e.g., `/neighborhoods/humber-summit.html`) with area-specific business listings and local info
- [ ] **Write "Best of" guide pages** - "Best Halal Restaurants in Rexdale", "Best Barber Shops in Etobicoke" etc. These rank extremely well for local search
- [ ] **Add event listings** - local community events, job fairs, business openings
- [ ] **Create a blog or news section** - even 1-2 posts per month about local business news helps SEO massively
- [ ] **Expand business data** - add photos (even street view screenshots), menus for restaurants, price ranges
- [ ] **Partner with local businesses** - offer featured placement in exchange for linking back to the directory

### Technical Improvements
- [ ] **Add a JSON API endpoint** - serve `data/businesses.json` with proper CORS headers so other local apps can use the data
- [ ] **Implement real-time job feeds** - pull from Indeed/LinkedIn APIs for actual current job postings (would require a simple backend or serverless function)
- [ ] **Add map integration** - embed a Google Maps or OpenStreetMap view showing business locations
- [ ] **Implement search analytics** - log what users search for to identify unmet needs and missing businesses
- [ ] **Add multi-language support** - Rexdale has large Somali, Tamil, and Urdu-speaking populations; even basic translations of key navigation would be valuable
- [ ] **Automate data freshness checks** - script to verify business websites are still live, phone numbers are valid
- [ ] **Add structured data for `JobPosting`** - if real job postings are added, use schema.org `JobPosting` markup for Google Jobs integration

### Community & Engagement
- [ ] **Launch on social media** - create profiles on Instagram, Facebook, TikTok featuring local business spotlights
- [ ] **Build an email newsletter** - the signup form exists; create a regular newsletter highlighting new businesses and job opportunities
- [ ] **Partner with Humber College** - student job board integration, co-op placement directory
- [ ] **Connect with settlement agencies** - many Rexdale residents are newcomers; these agencies can recommend the site
- [ ] **Reach out to the local city councillor's office** - community directories often get linked from municipal websites
- [ ] **Create a "Suggest an Edit" flow** - make it even easier for the community to keep data accurate

### Scaling to Multiple Neighborhoods
- [ ] **Template the entire project** - extract all city-specific content into a config file so new cities can be spun up by changing one JSON config
- [ ] **Build a site generator CLI** - `npx create-local-directory --city "Scarborough" --data ./data.csv` that scaffolds the entire site
- [ ] **Create a shared component library** - common CSS and JS that all city sites share, with per-city theming
- [ ] **Consider a monorepo** - multiple city directories sharing infrastructure but with independent data and content

---

## Key Files Reference

| File | Lines | Purpose |
|---|---|---|
| `index.html` | 1,181 | Homepage with all sections: hero/search, featured carousel, neighborhoods, jobs preview, category browser, full directory with filters, community stats, about, newsletter, contact, modals |
| `js/app.js` | 1,653 | Core application: state management, search, filtering, sorting, pagination, favorites, carousel, dark mode, modals, toast notifications, form handling, voice search |
| `css/style.css` | 3,099 | Full design system: CSS variables for theming, all component styles, responsive breakpoints, dark mode, animations |
| `css/jobs.css` | 1,166 | Styles for job landing pages (hero, content layout, FAQ, cards) |
| `data/businesses.json` | 6,757 | All 803 businesses with 201 categories across 7 neighborhoods |
| `sw.js` | 186 | Service worker: precaching, stale-while-revalidate, offline fallback |
| `js/seo-optimization.js` | 149 | Dynamic SEO: schema injection, canonical URLs, resource hints |
| `generate-business-pages.js` | ~300 | Node.js generator: reads JSON, outputs 803 HTML pages with SEO markup |

---

## License

This project is open source. The business data was compiled from publicly available sources.

---

## Contact

- Email: info@kingstrust.ca
- Website: [rexdalejobs.com](https://rexdalejobs.com)
