#!/usr/bin/env node

/**
 * Generate 803 individual business pages from businesses.json
 * Creates SEO-optimized HTML pages with LocalBusiness schema
 */

const fs = require('fs');
const path = require('path');

// Load businesses data
const businessesData = JSON.parse(fs.readFileSync('/home/user/rexdalejobs/data/businesses.json', 'utf8'));
const businesses = businessesData.businesses || [];

// Ensure output directory exists
const outputDir = '/home/user/rexdalejobs/businesses';
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// Utility function to slugify text
function slugify(text) {
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
}

// Extract domain from website URL
function extractDomain(website) {
    if (!website) return '';
    let domain = website.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];
    return domain;
}

// Generate meta description
function generateMetaDescription(business) {
    const { name, category, services, neighborhood } = business;
    const desc = `${name} - ${category} in ${neighborhood}, Toronto. ${services || 'Professional services for Rexdale & Etobicoke.'} Find contact info, hours, and more.`;
    return desc.substring(0, 160);
}

// Generate keywords
function generateKeywords(business) {
    const { name, category, neighborhood, services } = business;
    return `${name}, ${category}, ${neighborhood}, Toronto, Etobicoke, Rexdale`;
}

// Generate HTML page
function generateBusinessPage(business, index) {
    const {
        name = 'Unknown Business',
        category = 'Services',
        website = '',
        services = '',
        neighborhood = 'Rexdale'
    } = business;

    const slug = slugify(`${name}-${neighborhood}`);
    const websiteUrl = website ? (website.startsWith('http') ? website : `https://${website}`) : '';
    const metaDesc = generateMetaDescription(business);
    const keywords = generateKeywords(business);

    const html = `<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
    <meta name="description" content="${metaDesc}">
    <meta name="keywords" content="${keywords}">
    <meta name="author" content="RexdaleJobs.com">
    <meta name="robots" content="index, follow, max-image-preview:large">
    <meta name="theme-color" content="#2563eb" media="(prefers-color-scheme: light)">
    <meta name="theme-color" content="#1e40af" media="(prefers-color-scheme: dark)">
    <meta name="color-scheme" content="light dark">

    <!-- Open Graph / Social Media -->
    <meta property="og:type" content="local.business">
    <meta property="og:url" content="https://rexdalejobs.com/businesses/${slug}.html">
    <meta property="og:title" content="${name} | ${category}">
    <meta property="og:description" content="${metaDesc}">
    <meta property="og:image" content="https://rexdalejobs.com/images/og-business.png">
    <meta property="og:locale" content="en_CA">
    <meta property="og:site_name" content="Rexdale Directory">

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary">
    <meta name="twitter:title" content="${name} | ${category}">
    <meta name="twitter:description" content="${metaDesc}">

    <!-- Canonical URL -->
    <link rel="canonical" href="https://rexdalejobs.com/businesses/${slug}.html">

    <!-- Favicon -->
    <link rel="icon" type="image/svg+xml" href="../favicon.svg">

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">

    <!-- Stylesheets -->
    <link rel="stylesheet" href="../css/style.css">
    <link rel="stylesheet" href="../css/jobs.css">

    <title>${name} | ${category} in ${neighborhood} - RexdaleJobs.com</title>

    <!-- Structured Data - LocalBusiness Schema -->
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "name": "${name}",
        "image": "https://rexdalejobs.com/images/og-business.png",
        "description": "${metaDesc}",
        "address": {
            "@type": "PostalAddress",
            "addressLocality": "${neighborhood}",
            "addressRegion": "ON",
            "addressCountry": "CA"
        },
        "areaServed": ["Rexdale", "Etobicoke", "Toronto"],
        ${websiteUrl ? `"url": "${websiteUrl}",` : ''}
        "priceRange": "$$"
    }
    </script>

    <!-- Structured Data - BreadcrumbList -->
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://rexdalejobs.com/"
            },
            {
                "@type": "ListItem",
                "position": 2,
                "name": "Business Directory",
                "item": "https://rexdalejobs.com/#directory"
            },
            {
                "@type": "ListItem",
                "position": 3,
                "name": "${name}",
                "item": "https://rexdalejobs.com/businesses/${slug}.html"
            }
        ]
    }
    </script>
</head>
<body>
    <a href="#main-content" class="skip-link">Skip to main content</a>

    <main id="main-content">
        <!-- Hero Section -->
        <section class="business-hero">
            <div class="container">
                <nav class="breadcrumb" aria-label="Breadcrumb">
                    <a href="../">Home</a>
                    <span class="separator">/</span>
                    <a href="../#directory">Directory</a>
                    <span class="separator">/</span>
                    <span>${name}</span>
                </nav>

                <h1>${name}</h1>
                <p class="business-category">${category}</p>
                <p class="business-location">📍 ${neighborhood}, Toronto, ON</p>
            </div>
        </section>

        <!-- Business Details Section -->
        <section class="business-details">
            <div class="container">
                <div class="business-content">
                    <!-- Main Info -->
                    <div class="business-main">
                        <h2>About ${name}</h2>
                        <p>${name} is a ${category} business located in ${neighborhood}, serving the Rexdale, Etobicoke, and Toronto community.</p>

                        ${services ? `
                        <h3>Services Offered</h3>
                        <ul class="services-list">
                            ${services.split(',').map(s => `<li>${s.trim()}</li>`).join('')}
                        </ul>
                        ` : ''}

                        <!-- Contact Information -->
                        <div class="business-contact">
                            <h3>Contact Information</h3>
                            ${websiteUrl ? `<p><strong>Website:</strong> <a href="${websiteUrl}" target="_blank" rel="noopener noreferrer">${extractDomain(website)}</a></p>` : ''}
                            <p><strong>Location:</strong> ${neighborhood}, Toronto, ON</p>
                            <p><strong>Category:</strong> ${category}</p>
                        </div>
                    </div>

                    <!-- Sidebar -->
                    <aside class="business-sidebar">
                        <!-- Quick Actions -->
                        <div class="business-card">
                            <h3>Get in Touch</h3>
                            ${websiteUrl ? `<a href="${websiteUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-full">Visit Website</a>` : ''}
                            <a href="../#directory" class="btn btn-secondary btn-full">View More Businesses</a>
                        </div>

                        <!-- Key Benefits -->
                        <div class="business-card">
                            <h3>Why This Business?</h3>
                            <ul class="benefits-list">
                                <li>Serving Rexdale & Etobicoke</li>
                                <li>Local expertise & community presence</li>
                                <li>Professional services</li>
                                <li>Convenient location</li>
                            </ul>
                        </div>
                    </aside>
                </div>
            </div>
        </section>

        <!-- Related Businesses -->
        <section class="related-businesses">
            <div class="container">
                <h2>Other ${category} Businesses</h2>
                <p>Looking for similar services in ${neighborhood}? Browse more businesses in the ${category} category.</p>
                <a href="../#directory" class="btn btn-secondary">Browse More Businesses</a>
            </div>
        </section>

        <!-- CTA Section -->
        <section class="business-cta">
            <div class="container">
                <h2>Need Help Finding a Business?</h2>
                <p>Browse our complete directory of 800+ local businesses in Rexdale, Etobicoke & Toronto.</p>
                <a href="../" class="btn btn-white">View Full Directory</a>
            </div>
        </section>
    </main>

    <!-- Footer -->
    <footer class="landing-footer" role="contentinfo">
        <div class="container">
            <div class="footer-links-inline">
                <a href="../">Home</a>
                <a href="../#directory">Directory</a>
                <a href="../jobs/">Jobs</a>
                <a href="../#contact">Contact</a>
            </div>
            <p>&copy; 2025 RexdaleJobs.com. All rights reserved. Your guide to businesses and jobs in Rexdale, Etobicoke, Toronto.</p>
        </div>
    </footer>

    <!-- Dark mode detection -->
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

// Main generation loop
console.log(`Starting generation of ${businesses.length} business pages...`);

let created = 0;
let failed = 0;
const createdFiles = [];

businesses.forEach((business, index) => {
    try {
        const { slug, html } = generateBusinessPage(business, index);
        const filename = path.join(outputDir, `${slug}.html`);
        
        fs.writeFileSync(filename, html, 'utf8');
        createdFiles.push(`${slug}.html`);
        created++;
        
        if ((created + failed) % 100 === 0) {
            console.log(`Progress: ${created + failed}/${businesses.length} processed...`);
        }
    } catch (err) {
        failed++;
        console.error(`Failed to create page for business ${index}: ${err.message}`);
    }
});

// Generate summary
const summary = {
    totalBusinesses: businesses.length,
    pagesCreated: created,
    pagesFailed: failed,
    timestamp: new Date().toISOString(),
    createdFiles: createdFiles.slice(0, 50) // Show first 50 for brevity
};

console.log('\n=== GENERATION SUMMARY ===');
console.log(`Total businesses: ${summary.totalBusinesses}`);
console.log(`Pages created: ${summary.pagesCreated}`);
console.log(`Pages failed: ${summary.pagesFailed}`);
console.log(`\nFirst 50 files created:`);
summary.createdFiles.forEach(f => console.log(`  - ${f}`));

fs.writeFileSync(
    '/home/user/rexdalejobs/businesses/GENERATION_SUMMARY.json',
    JSON.stringify(summary, null, 2)
);

console.log('\nGeneration complete! Summary saved to GENERATION_SUMMARY.json');
