#!/usr/bin/env node

/**
 * Generate sitemap.xml with all pages:
 *   - Homepage
 *   - Jobs hub + all job landing pages
 *   - All individual business pages (with proper slug dedup)
 *   - Discovery files (llms.txt)
 */

const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'data/businesses.json');
const businessesData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
const businesses = businessesData.businesses || [];

const today = new Date().toISOString().split('T')[0];

function slugify(text) {
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
}

// ── Static pages ───────────────────────────────────────────

const staticPages = [
    // Homepage
    { loc: 'https://rexdalejobs.com/', changefreq: 'daily', priority: '1.0' },

    // Jobs hub
    { loc: 'https://rexdalejobs.com/jobs/', changefreq: 'weekly', priority: '0.95' },

    // Core job category pages
    { loc: 'https://rexdalejobs.com/jobs/entry-level-jobs-toronto.html', changefreq: 'weekly', priority: '0.90' },
    { loc: 'https://rexdalejobs.com/jobs/warehouse-jobs-etobicoke.html', changefreq: 'weekly', priority: '0.90' },
    { loc: 'https://rexdalejobs.com/jobs/pearson-airport-jobs.html', changefreq: 'weekly', priority: '0.90' },
    { loc: 'https://rexdalejobs.com/jobs/retail-jobs-etobicoke.html', changefreq: 'weekly', priority: '0.90' },
    { loc: 'https://rexdalejobs.com/jobs/restaurant-jobs-etobicoke.html', changefreq: 'weekly', priority: '0.90' },
    { loc: 'https://rexdalejobs.com/jobs/security-guard-jobs-toronto.html', changefreq: 'weekly', priority: '0.90' },
    { loc: 'https://rexdalejobs.com/jobs/cleaning-jobs-toronto.html', changefreq: 'weekly', priority: '0.90' },
    { loc: 'https://rexdalejobs.com/jobs/healthcare-jobs-toronto.html', changefreq: 'weekly', priority: '0.90' },
    { loc: 'https://rexdalejobs.com/jobs/construction-jobs-toronto.html', changefreq: 'weekly', priority: '0.90' },
    { loc: 'https://rexdalejobs.com/jobs/factory-jobs-etobicoke.html', changefreq: 'weekly', priority: '0.90' },
    { loc: 'https://rexdalejobs.com/jobs/remote-jobs-toronto.html', changefreq: 'weekly', priority: '0.90' },
    { loc: 'https://rexdalejobs.com/jobs/delivery-driver-jobs-toronto.html', changefreq: 'weekly', priority: '0.90' },
    { loc: 'https://rexdalejobs.com/jobs/work-from-home-customer-service.html', changefreq: 'weekly', priority: '0.90' },
    { loc: 'https://rexdalejobs.com/jobs/student-jobs-etobicoke.html', changefreq: 'weekly', priority: '0.90' },

    // Schedule/location/demographic job pages
    { loc: 'https://rexdalejobs.com/jobs/night-shift-jobs-toronto.html', changefreq: 'weekly', priority: '0.85' },
    { loc: 'https://rexdalejobs.com/jobs/weekend-jobs-toronto.html', changefreq: 'weekly', priority: '0.85' },
    { loc: 'https://rexdalejobs.com/jobs/summer-jobs-toronto-2026.html', changefreq: 'weekly', priority: '0.85' },
    { loc: 'https://rexdalejobs.com/jobs/jobs-near-humber-college.html', changefreq: 'weekly', priority: '0.85' },
    { loc: 'https://rexdalejobs.com/jobs/jobs-near-woodbine-mall.html', changefreq: 'weekly', priority: '0.85' },
    { loc: 'https://rexdalejobs.com/jobs/jobs-near-kipling-station.html', changefreq: 'weekly', priority: '0.85' },
    { loc: 'https://rexdalejobs.com/jobs/highway-27-warehouse-jobs.html', changefreq: 'weekly', priority: '0.85' },
    { loc: 'https://rexdalejobs.com/jobs/temp-agency-jobs-etobicoke.html', changefreq: 'weekly', priority: '0.85' },
    { loc: 'https://rexdalejobs.com/jobs/jobs-for-newcomers-toronto.html', changefreq: 'weekly', priority: '0.85' },
    { loc: 'https://rexdalejobs.com/jobs/jobs-for-parents-etobicoke.html', changefreq: 'weekly', priority: '0.85' },
    { loc: 'https://rexdalejobs.com/jobs/jobs-for-teens-toronto.html', changefreq: 'weekly', priority: '0.85' },

    // Career resource & guide pages
    { loc: 'https://rexdalejobs.com/jobs/resume-tips-no-experience.html', changefreq: 'monthly', priority: '0.80' },
    { loc: 'https://rexdalejobs.com/jobs/interview-tips-entry-level.html', changefreq: 'monthly', priority: '0.80' },
    { loc: 'https://rexdalejobs.com/jobs/free-job-resources-toronto.html', changefreq: 'monthly', priority: '0.80' },
    { loc: 'https://rexdalejobs.com/jobs/minimum-wage-ontario-guide.html', changefreq: 'monthly', priority: '0.80' },

    // Certification guides
    { loc: 'https://rexdalejobs.com/jobs/how-to-get-forklift-licence-ontario.html', changefreq: 'monthly', priority: '0.75' },
    { loc: 'https://rexdalejobs.com/jobs/security-guard-licence-ontario.html', changefreq: 'monthly', priority: '0.75' },
    { loc: 'https://rexdalejobs.com/jobs/workplace-safety-certifications-ontario.html', changefreq: 'monthly', priority: '0.75' },
    { loc: 'https://rexdalejobs.com/jobs/how-to-become-psw-ontario.html', changefreq: 'monthly', priority: '0.75' },
    { loc: 'https://rexdalejobs.com/jobs/smart-serve-certification-ontario.html', changefreq: 'monthly', priority: '0.75' },
];

// ── Generate XML ───────────────────────────────────────────

let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

// Static pages
staticPages.forEach(page => {
    xml += '  <url>\n';
    xml += `    <loc>${page.loc}</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
    xml += `    <priority>${page.priority}</priority>\n`;
    xml += '  </url>\n';
});

// Business pages (with proper slug dedup matching the generator)
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

let bizCount = 0;
businesses.forEach((business) => {
    const name = business.name || 'Unknown';
    const neighborhood = business.neighborhood || 'Rexdale';
    const rawSlug = slugify(`${name}-${neighborhood}`);
    const slug = getUniqueSlug(rawSlug);

    xml += '  <url>\n';
    xml += `    <loc>https://rexdalejobs.com/businesses/${slug}.html</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += '    <changefreq>monthly</changefreq>\n';
    xml += '    <priority>0.70</priority>\n';
    xml += '  </url>\n';
    bizCount++;
});

xml += '</urlset>\n';

const outputPath = path.join(__dirname, 'sitemap.xml');
fs.writeFileSync(outputPath, xml, 'utf8');

const totalUrls = staticPages.length + bizCount;
console.log(`Sitemap generated: ${totalUrls} URLs (${staticPages.length} static + ${bizCount} businesses)`);
console.log(`Written to: ${outputPath}`);
