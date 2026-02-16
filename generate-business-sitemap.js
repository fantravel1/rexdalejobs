#!/usr/bin/env node

/**
 * Generate sitemap.xml with all business pages
 */

const fs = require('fs');

const businessesData = JSON.parse(fs.readFileSync('/home/user/rexdalejobs/data/businesses.json', 'utf8'));
const businesses = businessesData.businesses || [];

function slugify(text) {
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
}

// Start sitemap XML
let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n';

// Add main pages
const mainPages = [
    { loc: 'https://rexdalejobs.com/', lastmod: '2026-02-16', changefreq: 'daily', priority: '1.0' },
    { loc: 'https://rexdalejobs.com/jobs/', lastmod: '2026-02-16', changefreq: 'weekly', priority: '0.95' },
    { loc: 'https://rexdalejobs.com/jobs/entry-level-jobs-toronto.html', lastmod: '2026-02-16', changefreq: 'weekly', priority: '0.90' },
    { loc: 'https://rexdalejobs.com/jobs/warehouse-jobs-etobicoke.html', lastmod: '2026-02-16', changefreq: 'weekly', priority: '0.90' },
    { loc: 'https://rexdalejobs.com/jobs/pearson-airport-jobs.html', lastmod: '2026-02-16', changefreq: 'weekly', priority: '0.90' },
    { loc: 'https://rexdalejobs.com/jobs/retail-jobs-etobicoke.html', lastmod: '2026-02-16', changefreq: 'weekly', priority: '0.90' },
    { loc: 'https://rexdalejobs.com/jobs/restaurant-jobs-etobicoke.html', lastmod: '2026-02-16', changefreq: 'weekly', priority: '0.90' },
    { loc: 'https://rexdalejobs.com/jobs/security-guard-jobs-toronto.html', lastmod: '2026-02-16', changefreq: 'weekly', priority: '0.90' },
    { loc: 'https://rexdalejobs.com/jobs/cleaning-jobs-toronto.html', lastmod: '2026-02-16', changefreq: 'weekly', priority: '0.90' },
    { loc: 'https://rexdalejobs.com/jobs/healthcare-jobs-toronto.html', lastmod: '2026-02-16', changefreq: 'weekly', priority: '0.90' },
    { loc: 'https://rexdalejobs.com/jobs/construction-jobs-toronto.html', lastmod: '2026-02-16', changefreq: 'weekly', priority: '0.90' },
    { loc: 'https://rexdalejobs.com/jobs/factory-jobs-etobicoke.html', lastmod: '2026-02-16', changefreq: 'weekly', priority: '0.90' },
    { loc: 'https://rexdalejobs.com/jobs/remote-jobs-toronto.html', lastmod: '2026-02-16', changefreq: 'weekly', priority: '0.90' },
    { loc: 'https://rexdalejobs.com/jobs/delivery-driver-jobs-toronto.html', lastmod: '2026-02-16', changefreq: 'weekly', priority: '0.90' },
    { loc: 'https://rexdalejobs.com/jobs/work-from-home-customer-service.html', lastmod: '2026-02-16', changefreq: 'weekly', priority: '0.90' },
    { loc: 'https://rexdalejobs.com/jobs/night-shift-jobs-toronto.html', lastmod: '2026-02-16', changefreq: 'weekly', priority: '0.85' },
    { loc: 'https://rexdalejobs.com/jobs/weekend-jobs-toronto.html', lastmod: '2026-02-16', changefreq: 'weekly', priority: '0.85' },
    { loc: 'https://rexdalejobs.com/jobs/summer-jobs-toronto-2026.html', lastmod: '2026-02-16', changefreq: 'weekly', priority: '0.85' },
    { loc: 'https://rexdalejobs.com/jobs/jobs-near-humber-college.html', lastmod: '2026-02-16', changefreq: 'weekly', priority: '0.85' },
    { loc: 'https://rexdalejobs.com/jobs/jobs-near-woodbine-mall.html', lastmod: '2026-02-16', changefreq: 'weekly', priority: '0.85' },
    { loc: 'https://rexdalejobs.com/jobs/jobs-near-kipling-station.html', lastmod: '2026-02-16', changefreq: 'weekly', priority: '0.85' },
    { loc: 'https://rexdalejobs.com/jobs/highway-27-warehouse-jobs.html', lastmod: '2026-02-16', changefreq: 'weekly', priority: '0.85' },
    { loc: 'https://rexdalejobs.com/jobs/temp-agency-jobs-etobicoke.html', lastmod: '2026-02-16', changefreq: 'weekly', priority: '0.85' },
    { loc: 'https://rexdalejobs.com/jobs/jobs-for-newcomers-toronto.html', lastmod: '2026-02-16', changefreq: 'weekly', priority: '0.85' },
    { loc: 'https://rexdalejobs.com/jobs/jobs-for-parents-etobicoke.html', lastmod: '2026-02-16', changefreq: 'weekly', priority: '0.85' },
    { loc: 'https://rexdalejobs.com/jobs/jobs-for-teens-toronto.html', lastmod: '2026-02-16', changefreq: 'weekly', priority: '0.85' },
    { loc: 'https://rexdalejobs.com/jobs/resume-tips-no-experience.html', lastmod: '2026-02-16', changefreq: 'weekly', priority: '0.80' },
    { loc: 'https://rexdalejobs.com/jobs/interview-tips-entry-level.html', lastmod: '2026-02-16', changefreq: 'weekly', priority: '0.80' },
    { loc: 'https://rexdalejobs.com/jobs/free-job-resources-toronto.html', lastmod: '2026-02-16', changefreq: 'weekly', priority: '0.80' },
    { loc: 'https://rexdalejobs.com/jobs/minimum-wage-ontario-guide.html', lastmod: '2026-02-16', changefreq: 'weekly', priority: '0.80' },
    { loc: 'https://rexdalejobs.com/jobs/how-to-get-forklift-licence-ontario.html', lastmod: '2026-02-16', changefreq: 'monthly', priority: '0.75' },
    { loc: 'https://rexdalejobs.com/jobs/security-guard-licence-ontario.html', lastmod: '2026-02-16', changefreq: 'monthly', priority: '0.75' },
    { loc: 'https://rexdalejobs.com/jobs/workplace-safety-certifications-ontario.html', lastmod: '2026-02-16', changefreq: 'monthly', priority: '0.75' },
    { loc: 'https://rexdalejobs.com/jobs/how-to-become-psw-ontario.html', lastmod: '2026-02-16', changefreq: 'monthly', priority: '0.75' },
    { loc: 'https://rexdalejobs.com/jobs/smart-serve-certification-ontario.html', lastmod: '2026-02-16', changefreq: 'monthly', priority: '0.75' }
];

mainPages.forEach(page => {
    xml += '  <url>\n';
    xml += `    <loc>${page.loc}</loc>\n`;
    xml += `    <lastmod>${page.lastmod}</lastmod>\n`;
    xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
    xml += `    <priority>${page.priority}</priority>\n`;
    xml += '  </url>\n';
});

// Add all business pages
console.log('Adding business pages to sitemap...');
businesses.forEach((business, index) => {
    const name = business.name || 'Unknown';
    const neighborhood = business.neighborhood || 'Rexdale';
    const slug = slugify(`${name}-${neighborhood}`);
    
    xml += '  <url>\n';
    xml += `    <loc>https://rexdalejobs.com/businesses/${slug}.html</loc>\n`;
    xml += `    <lastmod>2026-02-16</lastmod>\n`;
    xml += `    <changefreq>monthly</changefreq>\n`;
    xml += `    <priority>0.70</priority>\n`;
    xml += '  </url>\n';
    
    if ((index + 1) % 200 === 0) {
        console.log(`  Added ${index + 1}/${businesses.length} business pages...`);
    }
});

xml += '</urlset>';

fs.writeFileSync('/home/user/rexdalejobs/sitemap.xml', xml, 'utf8');
console.log(`\nSitemap generated with ${mainPages.length + businesses.length} URLs`);
