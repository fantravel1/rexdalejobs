#!/usr/bin/env node

/**
 * Generate individual business pages from businesses.json
 * Creates SEO-optimized HTML pages with full LocalBusiness schema,
 * proper meta tags, hreflang, HTML escaping, and all data fields.
 */

const fs = require('fs');
const path = require('path');

// Load businesses data
const dataPath = path.join(__dirname, 'data/businesses.json');
const businessesData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
const businesses = businessesData.businesses || [];

// Ensure output directory exists
const outputDir = path.join(__dirname, 'businesses');
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// ── Utilities ──────────────────────────────────────────────

function slugify(text) {
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
}

function escapeHtml(text) {
    if (!text) return '';
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function escapeJsonLdString(text) {
    if (!text) return '';
    return String(text)
        .replace(/\\/g, '\\\\')
        .replace(/"/g, '\\"')
        .replace(/\n/g, ' ')
        .replace(/\r/g, '')
        .replace(/\t/g, ' ');
}

// Check if a string looks like a valid URL (not a description)
function isValidUrl(str) {
    if (!str) return false;
    const s = str.trim();
    if (s.startsWith('http://') || s.startsWith('https://')) return true;
    // Must contain a dot, no spaces
    if (s.includes(' ') || !s.includes('.')) return false;
    // Filter obvious non-URLs
    if (/^(yes|no|none|n\/a|english|french|call|email|open|closed|from \$)/i.test(s)) return false;
    return true;
}

function normalizeUrl(website) {
    if (!website || !isValidUrl(website)) return '';
    return website.startsWith('http') ? website : `https://${website}`;
}

function extractDomain(url) {
    if (!url) return '';
    return url.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];
}

function formatPhoneTel(phone) {
    if (!phone) return '';
    return phone.replace(/[^\d+]/g, '');
}

function aOrAn(word) {
    if (!word) return 'a';
    const first = word.trim()[0];
    return first && 'aeiouAEIOU'.includes(first) ? 'an' : 'a';
}

function titleCase(str) {
    if (!str) return '';
    // If already mixed case (not ALL CAPS), return as-is
    if (str !== str.toUpperCase()) return str;
    return str.replace(/\w\S*/g, (txt) =>
        txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
}

// Truncate at word boundary, max 155 chars
function generateMetaDescription(business) {
    const { name, category, services, neighborhood } = business;
    const svc = services || 'Local business serving Rexdale & Etobicoke.';
    const full = `${name} - ${titleCase(category)} in ${neighborhood}, Toronto. ${svc} Contact info, hours & more.`;
    if (full.length <= 155) return full;
    const truncated = full.substring(0, 152);
    const lastSpace = truncated.lastIndexOf(' ');
    return truncated.substring(0, lastSpace) + '...';
}

// ── Page Generator ─────────────────────────────────────────

function generateBusinessPage(business) {
    const {
        name = 'Unknown Business',
        category = 'Services',
        website = '',
        services = '',
        neighborhood = 'Rexdale',
        address = '',
        phone = '',
        hours = '',
        postal_code = '',
        email = '',
        languages = '',
        notes = '',
        rating = null,
        halal = false,
    } = business;

    const slug = slugify(`${name}-${neighborhood}`);
    const websiteUrl = normalizeUrl(website);
    const displayDomain = extractDomain(websiteUrl);
    const metaDesc = generateMetaDescription(business);
    const displayCategory = titleCase(category);
    const canonicalUrl = `https://rexdalejobs.com/businesses/${slug}.html`;
    const phoneTel = formatPhoneTel(phone);
    const currentYear = new Date().getFullYear();

    // Escaped versions for HTML attributes
    const eName = escapeHtml(name);
    const eCat = escapeHtml(displayCategory);
    const eNeighborhood = escapeHtml(neighborhood);
    const eMetaDesc = escapeHtml(metaDesc);

    // ── JSON-LD: LocalBusiness ──
    const schemaObj = {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        '@id': canonicalUrl,
        name: name,
        image: 'https://rexdalejobs.com/images/og-business.png',
        description: metaDesc,
        address: {
            '@type': 'PostalAddress',
            ...(address && { streetAddress: address }),
            addressLocality: neighborhood,
            addressRegion: 'ON',
            addressCountry: 'CA',
            ...(postal_code && { postalCode: postal_code }),
        },
        areaServed: [
            { '@type': 'City', name: 'Toronto' },
            { '@type': 'Place', name: 'Rexdale' },
            { '@type': 'Place', name: 'Etobicoke' },
        ],
    };
    if (websiteUrl) schemaObj.url = websiteUrl;
    if (phone) schemaObj.telephone = phone;
    if (email) schemaObj.email = email;
    if (hours) schemaObj.openingHours = hours;
    if (services) schemaObj.makesOffer = { '@type': 'Offer', description: services };
    if (languages) schemaObj.availableLanguage = languages.split(',').map(l => l.trim());
    if (rating) {
        schemaObj.aggregateRating = {
            '@type': 'AggregateRating',
            ratingValue: rating,
            bestRating: 5,
            worstRating: 1,
        };
    }
    if (halal) {
        schemaObj.additionalProperty = {
            '@type': 'PropertyValue',
            name: 'Halal Certified',
            value: 'Yes',
        };
    }

    const schemaJson = JSON.stringify(schemaObj, null, 8).replace(/<\//g, '<\\/');

    // ── JSON-LD: BreadcrumbList ──
    const breadcrumbJson = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://rexdalejobs.com/' },
            { '@type': 'ListItem', position: 2, name: 'Directory', item: 'https://rexdalejobs.com/#directory' },
            { '@type': 'ListItem', position: 3, name: name, item: canonicalUrl },
        ],
    }, null, 8);

    // ── Build contact info section ──
    const contactLines = [];
    if (phone) contactLines.push(`<p><strong>Phone:</strong> <a href="tel:${phoneTel}">${escapeHtml(phone)}</a></p>`);
    if (address) {
        contactLines.push(`<p><strong>Address:</strong> ${escapeHtml(address)}${postal_code ? ', ' + escapeHtml(postal_code) : ''}</p>`);
    } else {
        contactLines.push(`<p><strong>Location:</strong> ${eNeighborhood}, Toronto, ON${postal_code ? ' ' + escapeHtml(postal_code) : ''}</p>`);
    }
    if (hours) contactLines.push(`<p><strong>Hours:</strong> ${escapeHtml(hours)}</p>`);
    if (email) contactLines.push(`<p><strong>Email:</strong> <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></p>`);
    if (websiteUrl) contactLines.push(`<p><strong>Website:</strong> <a href="${escapeHtml(websiteUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(displayDomain)}</a></p>`);
    contactLines.push(`<p><strong>Category:</strong> ${eCat}</p>`);
    if (languages) contactLines.push(`<p><strong>Languages:</strong> ${escapeHtml(languages)}</p>`);
    if (halal) contactLines.push(`<p><strong>Halal:</strong> Yes</p>`);
    const contactHtml = contactLines.map(l => `                            ${l}`).join('\n');

    // ── Build sidebar actions ──
    const sidebarBtns = [];
    if (websiteUrl) sidebarBtns.push(`<a href="${escapeHtml(websiteUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-full">Visit Website</a>`);
    if (phone) sidebarBtns.push(`<a href="tel:${phoneTel}" class="btn btn-secondary btn-full">Call ${escapeHtml(phone)}</a>`);
    sidebarBtns.push(`<a href="../#directory" class="btn btn-secondary btn-full">View More Businesses</a>`);
    const sidebarHtml = sidebarBtns.map(b => `                            ${b}`).join('\n');

    // ── Rating display ──
    let ratingHtml = '';
    if (rating) {
        const stars = '\u2605'.repeat(Math.round(rating)) + '\u2606'.repeat(5 - Math.round(rating));
        ratingHtml = `\n                <p class="business-rating">${stars} <span>${rating}/5</span></p>`;
    }

    // ── Services list ──
    let servicesHtml = '';
    if (services) {
        const items = services.split(',').map(s => `                            <li>${escapeHtml(s.trim())}</li>`).join('\n');
        servicesHtml = `
                        <h3>Services Offered</h3>
                        <ul class="services-list">
${items}
                        </ul>`;
    }

    // ── About paragraph ──
    const article = aOrAn(displayCategory);
    let aboutText = `${eName} is ${article} ${eCat} business located in ${eNeighborhood}, serving the Rexdale, Etobicoke, and Toronto community.`;
    if (notes) aboutText += ` ${escapeHtml(notes)}`;

    // ── Full HTML ──
    const html = `<!DOCTYPE html>
<html lang="en-CA" data-theme="light">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
    <meta name="description" content="${eMetaDesc}">
    <meta name="keywords" content="${eName}, ${eCat}, ${eNeighborhood}, Toronto, Etobicoke, Rexdale, local business">
    <meta name="author" content="RexdaleJobs.com">
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
    <meta name="theme-color" content="#2563eb" media="(prefers-color-scheme: light)">
    <meta name="theme-color" content="#1e40af" media="(prefers-color-scheme: dark)">
    <meta name="color-scheme" content="light dark">
    <meta name="geo.region" content="CA-ON">
    <meta name="geo.placename" content="${eNeighborhood}, Toronto">

    <!-- Open Graph -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="${canonicalUrl}">
    <meta property="og:title" content="${eName} | ${eCat} in ${eNeighborhood}">
    <meta property="og:description" content="${eMetaDesc}">
    <meta property="og:image" content="https://rexdalejobs.com/images/og-business.png">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:locale" content="en_CA">
    <meta property="og:site_name" content="RexdaleJobs.com">

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary">
    <meta name="twitter:title" content="${eName} | ${eCat} in ${eNeighborhood}">
    <meta name="twitter:description" content="${eMetaDesc}">
    <meta name="twitter:image" content="https://rexdalejobs.com/images/og-business.png">

    <!-- Canonical & hreflang -->
    <link rel="canonical" href="${canonicalUrl}">
    <link rel="alternate" hreflang="en-CA" href="${canonicalUrl}">
    <link rel="alternate" hreflang="x-default" href="${canonicalUrl}">

    <!-- Favicon -->
    <link rel="icon" type="image/svg+xml" href="../favicon.svg">

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">

    <!-- Stylesheets -->
    <link rel="stylesheet" href="../css/style.css">
    <link rel="stylesheet" href="../css/jobs.css">

    <title>${eName} | ${eCat} in ${eNeighborhood} - RexdaleJobs.com</title>

    <!-- Structured Data - LocalBusiness -->
    <script type="application/ld+json">
    ${schemaJson}
    </script>

    <!-- Structured Data - BreadcrumbList -->
    <script type="application/ld+json">
    ${breadcrumbJson}
    </script>
</head>
<body>
    <a href="#main-content" class="skip-link">Skip to main content</a>

    <!-- Header -->
    <header class="header">
        <div class="container">
            <div class="header-content">
                <a href="../" class="logo" aria-label="RexdaleJobs Home">
                    <span class="logo-icon" aria-hidden="true">R</span>
                    <span class="logo-text">Rexdale<span class="logo-accent">Directory</span></span>
                </a>
                <nav class="nav" role="navigation" aria-label="Main navigation">
                    <a href="../jobs/" class="nav-link">Jobs</a>
                    <a href="../#directory" class="nav-link">Directory</a>
                    <a href="../#about" class="nav-link">About</a>
                    <a href="../#contact" class="nav-link">Contact</a>
                </nav>
            </div>
        </div>
    </header>

    <main id="main-content">
        <!-- Hero -->
        <section class="business-hero">
            <div class="container">
                <nav class="breadcrumb" aria-label="Breadcrumb">
                    <a href="../">Home</a>
                    <span class="separator">/</span>
                    <a href="../#directory">Directory</a>
                    <span class="separator">/</span>
                    <span aria-current="page">${eName}</span>
                </nav>

                <h1>${eName}</h1>
                <p class="business-category">${eCat}</p>
                <p class="business-location">\u{1F4CD} ${eNeighborhood}, Toronto, ON${postal_code ? ' ' + escapeHtml(postal_code) : ''}</p>${ratingHtml}
            </div>
        </section>

        <!-- Business Details -->
        <section class="business-details">
            <div class="container">
                <div class="business-content">
                    <div class="business-main">
                        <h2>About ${eName}</h2>
                        <p>${aboutText}</p>
${servicesHtml}
                        <div class="business-contact">
                            <h3>Contact Information</h3>
${contactHtml}
                        </div>
                    </div>

                    <aside class="business-sidebar">
                        <div class="business-card">
                            <h3>Get in Touch</h3>
${sidebarHtml}
                        </div>
                        <div class="business-card">
                            <h3>Why This Business?</h3>
                            <ul class="benefits-list">
                                <li>Serving ${eNeighborhood} &amp; Etobicoke</li>
                                <li>Local expertise &amp; community presence</li>${phone ? '\n                                <li>Direct phone contact available</li>' : ''}${websiteUrl ? '\n                                <li>Visit their website for more info</li>' : ''}
                                <li>Part of the Rexdale business community</li>
                            </ul>
                        </div>
                    </aside>
                </div>
            </div>
        </section>

        <!-- Related Businesses -->
        <section class="related-businesses">
            <div class="container">
                <h2>Other ${eCat} Businesses</h2>
                <p>Looking for similar services in ${eNeighborhood}? Browse more businesses in the ${eCat} category.</p>
                <a href="../#directory" class="btn btn-secondary">Browse More Businesses</a>
            </div>
        </section>

        <!-- CTA -->
        <section class="business-cta">
            <div class="container">
                <h2>Need Help Finding a Business?</h2>
                <p>Browse our complete directory of 800+ local businesses in Rexdale, Etobicoke &amp; Toronto.</p>
                <div>
                    <a href="../" class="btn btn-white">View Full Directory</a>
                    <a href="../jobs/" class="btn btn-white" style="margin-left: 0.5rem;">Browse Jobs</a>
                </div>
            </div>
        </section>
    </main>

    <footer class="landing-footer" role="contentinfo">
        <div class="container">
            <div class="footer-links-inline">
                <a href="../">Home</a>
                <a href="../#directory">Directory</a>
                <a href="../jobs/">Jobs</a>
                <a href="../#about">About</a>
                <a href="../#contact">Contact</a>
            </div>
            <p>&copy; ${currentYear} RexdaleJobs.com. All rights reserved. Your guide to businesses and jobs in Rexdale, Etobicoke, Toronto.</p>
        </div>
    </footer>

    <script>
    (function() {
        var html = document.documentElement;
        var stored = localStorage.getItem('theme');
        if (stored) {
            html.setAttribute('data-theme', stored);
        } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            html.setAttribute('data-theme', 'dark');
        }
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
            if (!localStorage.getItem('theme')) {
                html.setAttribute('data-theme', e.matches ? 'dark' : 'light');
            }
        });
    })();
    </script>
</body>
</html>`;

    return { slug, html };
}

// ── Slug collision handling ────────────────────────────────

const usedSlugs = new Map();

function getUniqueSlug(slug) {
    if (!usedSlugs.has(slug)) {
        usedSlugs.set(slug, 1);
        return slug;
    }
    const count = usedSlugs.get(slug);
    usedSlugs.set(slug, count + 1);
    return `${slug}-${count}`;
}

// ── Main generation loop ───────────────────────────────────

console.log(`Generating ${businesses.length} business pages...`);

let created = 0;
let failed = 0;
const createdFiles = [];

businesses.forEach((business, index) => {
    try {
        const { slug: rawSlug, html } = generateBusinessPage(business);
        const slug = getUniqueSlug(rawSlug);
        const filename = path.join(outputDir, `${slug}.html`);

        fs.writeFileSync(filename, html, 'utf8');
        createdFiles.push(`${slug}.html`);
        created++;

        if ((created + failed) % 100 === 0) {
            console.log(`  ${created + failed}/${businesses.length}...`);
        }
    } catch (err) {
        failed++;
        console.error(`FAIL [${index}] ${business.name}: ${err.message}`);
    }
});

// Save summary
const summary = {
    totalBusinesses: businesses.length,
    pagesCreated: created,
    pagesFailed: failed,
    timestamp: new Date().toISOString(),
    files: createdFiles,
};

fs.writeFileSync(
    path.join(outputDir, 'GENERATION_SUMMARY.json'),
    JSON.stringify(summary, null, 2)
);

console.log(`\nDone: ${created} created, ${failed} failed.`);
