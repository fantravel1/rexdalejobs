/**
 * SEO/AEO Optimization Helper
 * Adds schema.org structured data, breadcrumbs, and metadata
 */

(function() {
    'use strict';

    // Add dynamic canonical link if not present
    function ensureCanonical() {
        let canonical = document.querySelector('link[rel="canonical"]');
        if (!canonical) {
            canonical = document.createElement('link');
            canonical.rel = 'canonical';
            canonical.href = window.location.href;
            document.head.appendChild(canonical);
        }
    }

    // Add Organization schema to homepage
    function addOrganizationSchema() {
        if (document.querySelector('script[data-schema="organization"]')) {
            return; // Already exists
        }

        const schema = {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "RexdaleJobs.com",
            "url": "https://rexdalejobs.com",
            "logo": "https://rexdalejobs.com/icons/icon.svg",
            "description": "Your guide to jobs, businesses, and career resources in Rexdale, Etobicoke & Toronto",
            "areaServed": ["Rexdale", "Etobicoke", "Toronto", "Ontario", "Canada"],
            "knowsAbout": ["Jobs", "Businesses", "Career Guidance", "Employment Services"],
            "sameAs": [
                "https://www.google.com/maps/place/Rexdale"
            ]
        };

        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.dataset.schema = 'organization';
        script.textContent = JSON.stringify(schema);
        document.head.appendChild(script);
    }

    // Add WebSite schema for search action
    function addWebSiteSchema() {
        if (document.querySelector('script[data-schema="website"]')) {
            return;
        }

        const schema = {
            "@context": "https://schema.org",
            "@type": "WebSite",
            "url": "https://rexdalejobs.com",
            "name": "RexdaleJobs.com",
            "description": "Business directory and job search hub for Rexdale & Etobicoke",
            "potentialAction": {
                "@type": "SearchAction",
                "target": {
                    "@type": "EntryPoint",
                    "urlTemplate": "https://rexdalejobs.com/?search={search_term_string}"
                },
                "query-input": "required name=search_term_string"
            }
        };

        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.dataset.schema = 'website';
        script.textContent = JSON.stringify(schema);
        document.head.appendChild(script);
    }

    // Enhance page with SEO attributes
    function enhancePageMetadata() {
        // Ensure language attribute
        if (!document.documentElement.lang) {
            document.documentElement.lang = 'en';
        }

        // Ensure viewport is set
        if (!document.querySelector('meta[name="viewport"]')) {
            const viewport = document.createElement('meta');
            viewport.name = 'viewport';
            viewport.content = 'width=device-width, initial-scale=1.0, viewport-fit=cover';
            document.head.appendChild(viewport);
        }

        // Add charset if missing
        if (!document.querySelector('meta[charset]')) {
            const charset = document.createElement('meta');
            charset.charset = 'UTF-8';
            document.head.insertBefore(charset, document.head.firstChild);
        }

        // Ensure robots meta is set
        if (!document.querySelector('meta[name="robots"]')) {
            const robots = document.createElement('meta');
            robots.name = 'robots';
            robots.content = 'index, follow, max-image-preview:large';
            document.head.appendChild(robots);
        }
    }

    // Create sitemap index for better crawlability
    function logCrawlablePages() {
        if (window.location.pathname === '/' && window.location.search === '') {
            console.log('📍 Sitemap: https://rexdalejobs.com/sitemap.xml');
            console.log('📊 Total crawlable pages: 838 (35 jobs + 803 businesses)');
        }
    }

    // Add preload hints for key resources
    function addResourceHints() {
        const hints = [
            { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
            { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: true },
            { rel: 'dns-prefetch', href: 'https://www.google-analytics.com' }
        ];

        hints.forEach(hint => {
            if (!document.querySelector(`link[rel="${hint.rel}"][href="${hint.href}"]`)) {
                const link = document.createElement('link');
                link.rel = hint.rel;
                link.href = hint.href;
                if (hint.crossorigin) link.crossOrigin = 'anonymous';
                document.head.appendChild(link);
            }
        });
    }

    // Initialize when DOM is ready
    function init() {
        ensureCanonical();
        addOrganizationSchema();
        addWebSiteSchema();
        enhancePageMetadata();
        addResourceHints();
        logCrawlablePages();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
