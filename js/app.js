/**
 * Rexdale Business Directory v2.0
 * Enhanced Application JavaScript
 * Features: Dark mode, favorites, advanced filters, featured carousel, toast notifications
 */

(function() {
    'use strict';

    // ============================================
    // Global State
    // ============================================
    const state = {
        businesses: [],
        categories: [],
        filteredBusinesses: [],
        favorites: JSON.parse(localStorage.getItem('rexdale_favorites') || '[]'),
        currentPage: 1,
        itemsPerPage: 12,
        showAllCategories: false,
        maxInitialCategories: 15,
        viewMode: 'grid',
        filters: {
            search: '',
            category: '',
            sort: 'name',
            halal: false,
            rated: false,
            hasWebsite: false,
            hasPhone: false,
            area: ''
        },
        carouselIndex: 0
    };

    // Category icons mapping
    const categoryIcons = {
        'FOOD & RESTAURANTS': '🍽️',
        'GAS STATIONS & AUTOMOTIVE': '⛽',
        'HEALTH & MEDICAL': '🏥',
        'RETAIL & SHOPPING': '🛍️',
        'PERSONAL SERVICES': '💇',
        'FINANCIAL SERVICES': '🏦',
        'GOVERNMENT & COMMUNITY SERVICES': '🏛️',
        'PROFESSIONAL SERVICES': '💼',
        'ENTERTAINMENT & RECREATION': '🎭',
        'EDUCATION & CHILDCARE': '📚',
        'OTHER SERVICES': '🔧',
        'Dental Clinics': '🦷',
        'Jewelry Stores': '💎',
        'Banks & Credit Unions': '💰',
        'Driving Schools': '🚗',
        'Halal Butchers & Meat Shops': '🥩',
        'African Food Markets': '🌍',
        'Caribbean Bakeries & Patty Shops': '🥧',
        'Religious Institutions': '🕌',
        'Christian Churches': '⛪',
        'Mosques': '🕌',
        'Gurdwaras (Sikh Temples)': '🛕',
        'Hindu Temples': '🛕',
        'Fitness Facilities': '💪',
        'Bicycle Shops': '🚲',
        'Pet Stores': '🐕',
        'Veterinary Clinics': '🐾',
        'Alarm Systems': '🔒',
        'Electricians': '⚡',
        'Plumbers (24/7 Emergency Services)': '🔧',
        'HVAC Companies': '❄️',
        'Landscaping Companies': '🌳',
        'default': '📍'
    };

    // Category groups for filtering
    const categoryGroups = {
        food: ['FOOD & RESTAURANTS', 'African Food Markets', 'Caribbean Bakeries', 'Halal Butchers', 'Restaurants', 'Grocery', 'Bakery', 'Food'],
        services: ['OTHER SERVICES', 'PROFESSIONAL SERVICES', 'Cleaning', 'Repair', 'Moving', 'Plumber', 'Electric'],
        health: ['HEALTH & MEDICAL', 'Dental', 'Medical', 'Clinic', 'Healthcare', 'Pharmacy', 'Veterinary'],
        shopping: ['RETAIL & SHOPPING', 'Jewelry', 'Electronics', 'Furniture', 'Dollar', 'Pet Store']
    };

    // ============================================
    // DOM Elements Cache
    // ============================================
    const $ = (selector) => document.querySelector(selector);
    const $$ = (selector) => document.querySelectorAll(selector);

    const elements = {
        // Core elements
        loadingScreen: $('#loadingScreen'),
        searchInput: $('#searchInput'),
        clearSearch: $('#clearSearch'),
        searchSuggestions: $('#searchSuggestions'),
        categoryGrid: $('#categoryGrid'),
        showAllCategories: $('#showAllCategories'),
        categoryFilter: $('#categoryFilter'),
        sortFilter: $('#sortFilter'),
        resultsCount: $('#resultsCount'),
        listingsGrid: $('#listingsGrid'),
        pagination: $('#pagination'),

        // Header elements
        header: $('#header'),
        themeToggle: $('#themeToggle'),
        favoritesBtn: $('#favoritesBtn'),
        favoritesCount: $('#favoritesCount'),
        mobileMenuBtn: $('#mobileMenuBtn'),
        mobileNav: $('#mobileNav'),
        announcementBar: $('#announcementBar'),

        // Featured section
        featuredCarousel: $('#featuredCarousel'),
        carouselPrev: $('#carouselPrev'),
        carouselNext: $('#carouselNext'),
        carouselDots: $('#carouselDots'),

        // Filters
        advancedFilterToggle: $('#advancedFilterToggle'),
        advancedFilters: $('#advancedFilters'),
        filterHalal: $('#filterHalal'),
        filterRated: $('#filterRated'),
        filterWebsite: $('#filterWebsite'),
        filterPhone: $('#filterPhone'),
        clearFilters: $('#clearFilters'),
        activeFilters: $('#activeFilters'),

        // View toggle
        gridViewBtn: $('#gridViewBtn'),
        listViewBtn: $('#listViewBtn'),

        // Modal
        businessModal: $('#businessModal'),
        modalBody: $('#modalBody'),

        // Submit Business Modal
        submitModal: $('#submitModal'),
        openSubmitModal: $('#openSubmitModal'),
        closeSubmitModal: $('#closeSubmitModal'),
        cancelSubmitModal: $('#cancelSubmitModal'),
        submitBusinessForm: $('#submitBusinessForm'),

        // Quick Info Modal
        infoModal: $('#infoModal'),
        closeInfoModal: $('#closeInfoModal'),
        cancelInfoModal: $('#cancelInfoModal'),
        infoForm: $('#infoForm'),
        infoModalBusiness: $('#infoModalBusiness'),
        infoBusinessName: $('#infoBusinessName'),
        infoBusinessCategory: $('#infoBusinessCategory'),
        infoMissingFields: $('#infoMissingFields'),
        infoPhoneGroup: $('#infoPhoneGroup'),
        infoAddressGroup: $('#infoAddressGroup'),
        infoWebsiteGroup: $('#infoWebsiteGroup'),

        // Favorites panel
        favoritesPanel: $('#favoritesPanel'),
        favoritesBody: $('#favoritesBody'),
        favoritesClose: $('#favoritesClose'),
        favoritesOverlay: $('#favoritesOverlay'),

        // Other
        backToTop: $('#backToTop'),
        toastContainer: $('#toastContainer'),
        newsletterForm: $('#newsletterForm')
    };

    // ============================================
    // Theme Management
    // ============================================
    const theme = {
        init() {
            const saved = localStorage.getItem('rexdale_theme');
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            const theme = saved || (prefersDark ? 'dark' : 'light');
            this.set(theme);

            // Listen for system preference changes
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                if (!localStorage.getItem('rexdale_theme')) {
                    this.set(e.matches ? 'dark' : 'light');
                }
            });
        },

        set(mode) {
            document.documentElement.setAttribute('data-theme', mode);
            localStorage.setItem('rexdale_theme', mode);
        },

        toggle() {
            const current = document.documentElement.getAttribute('data-theme');
            const next = current === 'dark' ? 'light' : 'dark';
            this.set(next);
            showToast(`Switched to ${next} mode`);
        }
    };

    // ============================================
    // Initialize Application
    // ============================================
    async function init() {
        // Initialize theme
        theme.init();

        try {
            // Try multiple paths for data file (handles different deployment scenarios)
            let response = await fetch('data/businesses.json');
            if (!response.ok) {
                response = await fetch('./data/businesses.json');
            }
            if (!response.ok) {
                response = await fetch('/data/businesses.json');
            }
            if (!response.ok) throw new Error('Failed to load data');

            const data = await response.json();

            state.businesses = data.businesses || [];
            state.categories = data.categories || [];
            state.filteredBusinesses = [...state.businesses];

            // Render all components with null checks
            if (elements.categoryGrid) renderCategories();
            if (elements.categoryFilter) populateCategoryFilter();
            if (elements.featuredCarousel) renderFeaturedCarousel();
            if (elements.listingsGrid) renderListings();
            updateFavoritesCount();

            // Setup event listeners
            setupEventListeners();

            // Hide loading screen
            if (elements.loadingScreen) {
                setTimeout(() => {
                    elements.loadingScreen.classList.add('hidden');
                }, 300);
            }

            // Animate counters
            animateCounters();

        } catch (error) {
            console.error('Error loading data:', error);
            if (elements.loadingScreen) {
                elements.loadingScreen.innerHTML = `
                    <div style="text-align: center; padding: 2rem;">
                        <p style="margin-bottom: 1rem;">Error loading data. Please refresh the page.</p>
                        <button onclick="location.reload()" class="btn btn-primary">Refresh</button>
                    </div>
                `;
            }
        }
    }

    // ============================================
    // Counter Animation
    // ============================================
    function animateCounters() {
        const counters = $$('.counter');
        counters.forEach(counter => {
            const target = parseInt(counter.dataset.target);
            const duration = 2000;
            const step = target / (duration / 16);
            let current = 0;

            const update = () => {
                current += step;
                if (current < target) {
                    counter.textContent = Math.floor(current);
                    requestAnimationFrame(update);
                } else {
                    counter.textContent = target;
                }
            };

            // Start animation when element is visible
            const observer = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting) {
                    update();
                    observer.disconnect();
                }
            });
            observer.observe(counter);
        });
    }

    // ============================================
    // Featured Carousel
    // ============================================
    function renderFeaturedCarousel() {
        if (!elements.featuredCarousel) return;

        // Get businesses with ratings or complete info
        const featured = state.businesses
            .filter(b => b.rating || (b.address && b.phone && b.services))
            .slice(0, 8);

        if (featured.length === 0) {
            // Fallback to first 8 businesses with most info
            featured.push(...state.businesses.slice(0, 8));
        }

        elements.featuredCarousel.innerHTML = featured.map((business, index) => {
            const icon = categoryIcons[business.category] || categoryIcons['default'];
            return `
                <div class="featured-card" data-index="${state.businesses.indexOf(business)}">
                    <div class="featured-card-header">
                        <div class="featured-card-icon">${icon}</div>
                        ${business.rating ? `<span class="featured-card-badge">★ ${business.rating.split(' ')[0]}</span>` : ''}
                    </div>
                    <h3 class="featured-card-title">${escapeHtml(business.name)}</h3>
                    <p class="featured-card-category">${escapeHtml(business.category)}</p>
                    ${business.address ? `
                        <p class="featured-card-info">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"></path>
                                <circle cx="12" cy="10" r="3"></circle>
                            </svg>
                            ${truncateText(business.address, 40)}
                        </p>
                    ` : ''}
                </div>
            `;
        }).join('');

        // Add click handlers
        elements.featuredCarousel.querySelectorAll('.featured-card').forEach(card => {
            card.addEventListener('click', () => {
                const index = parseInt(card.dataset.index);
                openBusinessModal(state.businesses[index]);
            });
        });

        // Render dots
        if (elements.carouselDots) {
            const numDots = Math.ceil(featured.length / 3);
            elements.carouselDots.innerHTML = Array(numDots).fill(0).map((_, i) =>
                `<button class="carousel-dot ${i === 0 ? 'active' : ''}" data-index="${i}"></button>`
            ).join('');
        }
    }

    function scrollCarousel(direction) {
        const carousel = elements.featuredCarousel;
        const cardWidth = carousel.querySelector('.featured-card')?.offsetWidth || 320;
        const gap = 24;
        const scrollAmount = (cardWidth + gap) * 3;

        if (direction === 'next') {
            carousel.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        } else {
            carousel.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        }
    }

    // ============================================
    // Categories Rendering
    // ============================================
    function renderCategories(groupFilter = 'all') {
        if (!elements.categoryGrid) return;

        const categoryCounts = {};
        state.businesses.forEach(b => {
            categoryCounts[b.category] = (categoryCounts[b.category] || 0) + 1;
        });

        let filteredCategories = state.categories.filter(cat => categoryCounts[cat]);

        // Apply group filter
        if (groupFilter !== 'all' && categoryGroups[groupFilter]) {
            filteredCategories = filteredCategories.filter(cat =>
                categoryGroups[groupFilter].some(keyword =>
                    cat.toLowerCase().includes(keyword.toLowerCase())
                )
            );
        }

        const sortedCategories = filteredCategories.sort((a, b) => categoryCounts[b] - categoryCounts[a]);

        elements.categoryGrid.innerHTML = sortedCategories
            .map((category, index) => {
                const icon = categoryIcons[category] || categoryIcons['default'];
                const count = categoryCounts[category] || 0;
                const hidden = !state.showAllCategories && index >= state.maxInitialCategories;

                return `
                    <div class="category-card ${hidden ? 'hidden' : ''}" data-category="${escapeHtml(category)}" role="listitem">
                        <div class="category-icon">${icon}</div>
                        <span class="category-name">${escapeHtml(category)}</span>
                        <span class="category-count">${count}</span>
                    </div>
                `;
            })
            .join('');

        // Update show all button
        if (elements.showAllCategories) {
            const hiddenCount = sortedCategories.length - state.maxInitialCategories;
            if (hiddenCount > 0 && groupFilter === 'all') {
                elements.showAllCategories.innerHTML = state.showAllCategories
                    ? '<span>Show Less</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M18 15l-6-6-6 6"></path></svg>'
                    : `<span>Show All (+${hiddenCount})</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M6 9l6 6 6-6"></path></svg>`;
                elements.showAllCategories.style.display = 'inline-flex';
            } else {
                elements.showAllCategories.style.display = 'none';
            }
        }

        // Add click handlers
        elements.categoryGrid.querySelectorAll('.category-card').forEach(card => {
            card.addEventListener('click', () => {
                const category = card.dataset.category;
                if (elements.categoryFilter) elements.categoryFilter.value = category;
                state.filters.category = category;
                filterBusinesses();
                scrollToSection('#directory');
            });
        });
    }

    function populateCategoryFilter() {
        const categoryCounts = {};
        state.businesses.forEach(b => {
            categoryCounts[b.category] = (categoryCounts[b.category] || 0) + 1;
        });

        const sortedCategories = state.categories
            .filter(cat => categoryCounts[cat])
            .sort((a, b) => a.localeCompare(b));

        elements.categoryFilter.innerHTML = '<option value="">All Categories</option>' +
            sortedCategories.map(cat =>
                `<option value="${escapeHtml(cat)}">${escapeHtml(cat)} (${categoryCounts[cat]})</option>`
            ).join('');
    }

    // ============================================
    // Business Listings
    // ============================================
    function renderListings() {
        if (!elements.listingsGrid) return;

        const startIndex = (state.currentPage - 1) * state.itemsPerPage;
        const endIndex = startIndex + state.itemsPerPage;
        const pageBusinesses = state.filteredBusinesses.slice(startIndex, endIndex);

        if (pageBusinesses.length === 0) {
            elements.listingsGrid.innerHTML = `
                <div class="no-results">
                    <div class="no-results-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="11" cy="11" r="8"></circle>
                            <path d="m21 21-4.35-4.35"></path>
                        </svg>
                    </div>
                    <h3 class="no-results-title">No businesses found</h3>
                    <p class="no-results-text">Try adjusting your search or filter criteria</p>
                </div>
            `;
            if (elements.resultsCount) elements.resultsCount.textContent = '0';
            if (elements.pagination) elements.pagination.innerHTML = '';
            return;
        }

        const isListView = state.viewMode === 'list';
        elements.listingsGrid.className = `listings-grid ${isListView ? 'list-view' : ''}`;

        elements.listingsGrid.innerHTML = pageBusinesses.map(business => {
            const isFavorite = state.favorites.includes(state.businesses.indexOf(business));
            const tags = [];
            if (business.halal_status) tags.push({ text: 'Halal', class: 'halal' });
            if (business.rating) tags.push({ text: business.rating.split(' ')[0], class: 'rated' });

            // Check for missing info
            const missingInfo = [];
            if (!business.phone) missingInfo.push('phone');
            if (!business.address) missingInfo.push('address');
            if (!business.website) missingInfo.push('website');
            const hasMissingInfo = missingInfo.length > 0;

            return `
                <article class="business-card" data-id="${state.businesses.indexOf(business)}">
                    <div class="business-card-header">
                        <div class="business-card-top">
                            <span class="business-category">${escapeHtml(business.category)}</span>
                            <button class="business-favorite-btn ${isFavorite ? 'active' : ''}"
                                    data-id="${state.businesses.indexOf(business)}"
                                    aria-label="${isFavorite ? 'Remove from favorites' : 'Add to favorites'}">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                                </svg>
                            </button>
                        </div>
                        <h3 class="business-name">${escapeHtml(business.name)}</h3>
                    </div>
                    <div class="business-card-body">
                        <div class="business-info">
                            ${business.address ? `
                                <div class="business-info-item">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"></path>
                                        <circle cx="12" cy="10" r="3"></circle>
                                    </svg>
                                    <span>${escapeHtml(business.address)}</span>
                                </div>
                            ` : ''}
                            ${business.phone ? `
                                <div class="business-info-item">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"></path>
                                    </svg>
                                    <span>${escapeHtml(business.phone)}</span>
                                </div>
                            ` : ''}
                            ${business.services ? `
                                <div class="business-info-item">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <polyline points="9 11 12 14 22 4"></polyline>
                                        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                                    </svg>
                                    <span>${truncateText(business.services, 80)}</span>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                    <div class="business-card-footer">
                        <div class="business-tags">
                            ${tags.map(tag => `<span class="business-tag ${tag.class}">${escapeHtml(tag.text)}</span>`).join('')}
                        </div>
                        ${hasMissingInfo ? `
                            <button class="submit-info-btn"
                                    data-business="${escapeHtml(business.name)}"
                                    data-category="${escapeHtml(business.category)}"
                                    data-missing="${missingInfo.join(',')}"
                                    title="Help us complete this listing">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <line x1="12" y1="8" x2="12" y2="12"></line>
                                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                                </svg>
                                Add Info
                            </button>
                        ` : ''}
                    </div>
                </article>
            `;
        }).join('');

        if (elements.resultsCount) elements.resultsCount.textContent = state.filteredBusinesses.length.toLocaleString();
        renderPagination();
        setupCardListeners();
    }

    function setupCardListeners() {
        if (!elements.listingsGrid) return;

        // Card click to open modal
        elements.listingsGrid.querySelectorAll('.business-card').forEach(card => {
            card.addEventListener('click', (e) => {
                // Don't open modal if clicking favorite or submit info button
                if (e.target.closest('.business-favorite-btn') || e.target.closest('.submit-info-btn')) return;
                const index = parseInt(card.dataset.id);
                openBusinessModal(state.businesses[index]);
            });
        });

        // Favorite button clicks
        elements.listingsGrid.querySelectorAll('.business-favorite-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = parseInt(btn.dataset.id);
                toggleFavorite(id);
                btn.classList.toggle('active');
            });
        });

        // Submit Info button clicks
        elements.listingsGrid.querySelectorAll('.submit-info-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                openInfoModal(btn.dataset.business, btn.dataset.category, btn.dataset.missing);
            });
        });
    }

    // Open Info Modal with pre-filled business info
    function openInfoModal(businessName, category, missingFields) {
        if (!elements.infoModal) return;

        const missing = missingFields.split(',');

        // Set business info
        if (elements.infoModalBusiness) elements.infoModalBusiness.textContent = businessName;
        if (elements.infoBusinessName) elements.infoBusinessName.value = businessName;
        if (elements.infoBusinessCategory) elements.infoBusinessCategory.value = category;
        if (elements.infoMissingFields) elements.infoMissingFields.value = missingFields;

        // Show/hide fields based on what's missing
        if (elements.infoPhoneGroup) {
            elements.infoPhoneGroup.style.display = missing.includes('phone') ? 'block' : 'none';
        }
        if (elements.infoAddressGroup) {
            elements.infoAddressGroup.style.display = missing.includes('address') ? 'block' : 'none';
        }
        if (elements.infoWebsiteGroup) {
            elements.infoWebsiteGroup.style.display = missing.includes('website') ? 'block' : 'none';
        }

        // Reset form
        elements.infoForm?.reset();
        if (elements.infoBusinessName) elements.infoBusinessName.value = businessName;
        if (elements.infoBusinessCategory) elements.infoBusinessCategory.value = category;
        if (elements.infoMissingFields) elements.infoMissingFields.value = missingFields;

        // Open modal
        elements.infoModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function renderPagination() {
        const totalPages = Math.ceil(state.filteredBusinesses.length / state.itemsPerPage);

        if (totalPages <= 1) {
            elements.pagination.innerHTML = '';
            return;
        }

        let html = '';

        // Previous button
        html += `
            <button class="pagination-btn" ${state.currentPage === 1 ? 'disabled' : ''} data-page="${state.currentPage - 1}" aria-label="Previous page">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M15 18l-6-6 6-6"></path>
                </svg>
            </button>
        `;

        // Page numbers
        const maxVisible = 5;
        let startPage = Math.max(1, state.currentPage - Math.floor(maxVisible / 2));
        let endPage = Math.min(totalPages, startPage + maxVisible - 1);

        if (endPage - startPage + 1 < maxVisible) {
            startPage = Math.max(1, endPage - maxVisible + 1);
        }

        if (startPage > 1) {
            html += `<button class="pagination-btn" data-page="1">1</button>`;
            if (startPage > 2) {
                html += `<span class="pagination-btn" style="pointer-events: none;">...</span>`;
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            html += `
                <button class="pagination-btn ${i === state.currentPage ? 'active' : ''}" data-page="${i}" ${i === state.currentPage ? 'aria-current="page"' : ''}>
                    ${i}
                </button>
            `;
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                html += `<span class="pagination-btn" style="pointer-events: none;">...</span>`;
            }
            html += `<button class="pagination-btn" data-page="${totalPages}">${totalPages}</button>`;
        }

        // Next button
        html += `
            <button class="pagination-btn" ${state.currentPage === totalPages ? 'disabled' : ''} data-page="${state.currentPage + 1}" aria-label="Next page">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 18l6-6-6-6"></path>
                </svg>
            </button>
        `;

        elements.pagination.innerHTML = html;

        // Add click handlers
        elements.pagination.querySelectorAll('.pagination-btn[data-page]').forEach(btn => {
            btn.addEventListener('click', () => {
                const page = parseInt(btn.dataset.page);
                if (page >= 1 && page <= totalPages) {
                    state.currentPage = page;
                    renderListings();
                    scrollToSection('#directory');
                }
            });
        });
    }

    // ============================================
    // Filtering
    // ============================================
    function filterBusinesses() {
        state.filteredBusinesses = state.businesses.filter(business => {
            // Category filter
            if (state.filters.category && business.category !== state.filters.category) {
                return false;
            }

            // Search filter
            if (state.filters.search) {
                const searchTerm = state.filters.search.toLowerCase();
                const searchFields = [
                    business.name,
                    business.category,
                    business.address,
                    business.services,
                    business.notes
                ].filter(Boolean).map(f => f.toLowerCase());

                if (!searchFields.some(field => field.includes(searchTerm))) {
                    return false;
                }
            }

            // Area/Neighborhood filter
            if (state.filters.area) {
                const area = state.filters.area.toLowerCase();
                const neighborhood = (business.neighborhood || '').toLowerCase();
                const address = (business.address || '').toLowerCase();
                // Match either neighborhood field or address contains area name
                if (!neighborhood.includes(area) && !address.includes(area)) {
                    return false;
                }
            }

            // Advanced filters
            if (state.filters.halal && !business.halal_status) {
                return false;
            }
            if (state.filters.rated && !business.rating) {
                return false;
            }
            if (state.filters.hasWebsite && !business.website) {
                return false;
            }
            if (state.filters.hasPhone && !business.phone) {
                return false;
            }

            return true;
        });

        // Sort
        state.filteredBusinesses.sort((a, b) => {
            switch (state.filters.sort) {
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'name-desc':
                    return b.name.localeCompare(a.name);
                case 'category':
                    return a.category.localeCompare(b.category) || a.name.localeCompare(b.name);
                case 'rating':
                    const ratingA = a.rating ? parseFloat(a.rating) : 0;
                    const ratingB = b.rating ? parseFloat(b.rating) : 0;
                    return ratingB - ratingA;
                default:
                    return 0;
            }
        });

        state.currentPage = 1;
        renderListings();
        updateActiveFilters();
    }

    function updateActiveFilters() {
        const activeFilters = [];

        if (state.filters.category) {
            activeFilters.push({ label: state.filters.category, type: 'category' });
        }
        if (state.filters.halal) {
            activeFilters.push({ label: 'Halal Only', type: 'halal' });
        }
        if (state.filters.rated) {
            activeFilters.push({ label: 'Has Ratings', type: 'rated' });
        }
        if (state.filters.hasWebsite) {
            activeFilters.push({ label: 'Has Website', type: 'hasWebsite' });
        }
        if (state.filters.hasPhone) {
            activeFilters.push({ label: 'Has Phone', type: 'hasPhone' });
        }
        if (state.filters.area) {
            activeFilters.push({ label: `Area: ${state.filters.area}`, type: 'area' });
        }

        if (activeFilters.length === 0) {
            elements.activeFilters.hidden = true;
            return;
        }

        elements.activeFilters.hidden = false;
        elements.activeFilters.innerHTML = activeFilters.map(filter => `
            <span class="active-filter-tag">
                ${escapeHtml(filter.label)}
                <button data-filter="${filter.type}" aria-label="Remove filter">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                        <path d="M18 6L6 18M6 6l12 12"></path>
                    </svg>
                </button>
            </span>
        `).join('');

        // Add remove handlers
        elements.activeFilters.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('click', () => {
                const filterType = btn.dataset.filter;
                clearFilter(filterType);
            });
        });
    }

    function clearFilter(type) {
        switch (type) {
            case 'category':
                state.filters.category = '';
                elements.categoryFilter.value = '';
                break;
            case 'halal':
                state.filters.halal = false;
                if (elements.filterHalal) elements.filterHalal.checked = false;
                break;
            case 'rated':
                state.filters.rated = false;
                if (elements.filterRated) elements.filterRated.checked = false;
                break;
            case 'hasWebsite':
                state.filters.hasWebsite = false;
                if (elements.filterWebsite) elements.filterWebsite.checked = false;
                break;
            case 'hasPhone':
                state.filters.hasPhone = false;
                if (elements.filterPhone) elements.filterPhone.checked = false;
                break;
            case 'area':
                state.filters.area = '';
                break;
        }
        filterBusinesses();
    }

    function clearAllFilters() {
        state.filters = {
            search: '',
            category: '',
            sort: 'name',
            halal: false,
            rated: false,
            hasWebsite: false,
            hasPhone: false,
            area: ''
        };

        elements.searchInput.value = '';
        elements.categoryFilter.value = '';
        elements.sortFilter.value = 'name';
        if (elements.filterHalal) elements.filterHalal.checked = false;
        if (elements.filterRated) elements.filterRated.checked = false;
        if (elements.filterWebsite) elements.filterWebsite.checked = false;
        if (elements.filterPhone) elements.filterPhone.checked = false;

        filterBusinesses();
        showToast('Filters cleared');
    }

    function showSearchSuggestions() {
        const searchTerm = elements.searchInput.value.toLowerCase().trim();

        if (searchTerm.length < 2) {
            elements.searchSuggestions.classList.remove('active');
            return;
        }

        const matches = state.businesses
            .filter(business => {
                const searchFields = [business.name, business.category]
                    .filter(Boolean)
                    .map(f => f.toLowerCase());
                return searchFields.some(field => field.includes(searchTerm));
            })
            .slice(0, 6);

        if (matches.length === 0) {
            elements.searchSuggestions.classList.remove('active');
            return;
        }

        elements.searchSuggestions.innerHTML = matches.map(business => `
            <div class="suggestion-item" data-id="${state.businesses.indexOf(business)}" role="option">
                <div class="suggestion-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                </div>
                <div class="suggestion-content">
                    <div class="suggestion-name">${highlightMatch(business.name, searchTerm)}</div>
                    <div class="suggestion-category">${escapeHtml(business.category)}</div>
                </div>
            </div>
        `).join('');

        elements.searchSuggestions.classList.add('active');

        // Add click handlers
        elements.searchSuggestions.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('click', () => {
                const index = parseInt(item.dataset.id);
                openBusinessModal(state.businesses[index]);
                elements.searchSuggestions.classList.remove('active');
            });
        });
    }

    // ============================================
    // Modal
    // ============================================
    function openBusinessModal(business) {
        const businessIndex = state.businesses.indexOf(business);
        const isFavorite = state.favorites.includes(businessIndex);

        elements.modalBody.innerHTML = `
            <div class="modal-header">
                <span class="modal-category">${escapeHtml(business.category)}</span>
                <h2 class="modal-title" id="modalTitle">${escapeHtml(business.name)}</h2>
            </div>

            ${business.address || business.phone || business.email || business.website || business.hours ? `
                <div class="modal-section">
                    <h3 class="modal-section-title">Contact Information</h3>
                    <div class="modal-info-list">
                        ${business.address ? `
                            <div class="modal-info-item">
                                <div class="modal-info-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"></path>
                                        <circle cx="12" cy="10" r="3"></circle>
                                    </svg>
                                </div>
                                <div class="modal-info-content">
                                    <div class="modal-info-label">Address</div>
                                    <div class="modal-info-value">
                                        <a href="https://maps.google.com/?q=${encodeURIComponent(business.address)}" target="_blank" rel="noopener">
                                            ${escapeHtml(business.address)}
                                        </a>
                                    </div>
                                </div>
                            </div>
                        ` : ''}
                        ${business.phone ? `
                            <div class="modal-info-item">
                                <div class="modal-info-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"></path>
                                    </svg>
                                </div>
                                <div class="modal-info-content">
                                    <div class="modal-info-label">Phone</div>
                                    <div class="modal-info-value">
                                        <a href="tel:${business.phone.replace(/[^\d+]/g, '')}">${escapeHtml(business.phone)}</a>
                                    </div>
                                </div>
                            </div>
                        ` : ''}
                        ${business.email ? `
                            <div class="modal-info-item">
                                <div class="modal-info-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                        <polyline points="22,6 12,13 2,6"></polyline>
                                    </svg>
                                </div>
                                <div class="modal-info-content">
                                    <div class="modal-info-label">Email</div>
                                    <div class="modal-info-value">
                                        <a href="mailto:${business.email}">${escapeHtml(business.email)}</a>
                                    </div>
                                </div>
                            </div>
                        ` : ''}
                        ${business.website ? `
                            <div class="modal-info-item">
                                <div class="modal-info-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <circle cx="12" cy="12" r="10"></circle>
                                        <line x1="2" y1="12" x2="22" y2="12"></line>
                                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                                    </svg>
                                </div>
                                <div class="modal-info-content">
                                    <div class="modal-info-label">Website</div>
                                    <div class="modal-info-value">
                                        <a href="${formatWebsiteUrl(business.website)}" target="_blank" rel="noopener">${escapeHtml(business.website)}</a>
                                    </div>
                                </div>
                            </div>
                        ` : ''}
                        ${business.hours ? `
                            <div class="modal-info-item">
                                <div class="modal-info-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <circle cx="12" cy="12" r="10"></circle>
                                        <polyline points="12 6 12 12 16 14"></polyline>
                                    </svg>
                                </div>
                                <div class="modal-info-content">
                                    <div class="modal-info-label">Hours</div>
                                    <div class="modal-info-value">${escapeHtml(business.hours)}</div>
                                </div>
                            </div>
                        ` : ''}
                    </div>
                </div>
            ` : ''}

            ${business.services ? `
                <div class="modal-section">
                    <h3 class="modal-section-title">Services</h3>
                    <div class="modal-services">${escapeHtml(business.services)}</div>
                </div>
            ` : ''}

            ${business.notes ? `
                <div class="modal-section">
                    <h3 class="modal-section-title">Additional Information</h3>
                    <div class="modal-services">${escapeHtml(business.notes)}</div>
                </div>
            ` : ''}

            ${business.halal_status || business.rating || business.languages ? `
                <div class="modal-section">
                    <div class="business-tags">
                        ${business.halal_status ? `<span class="business-tag halal">${escapeHtml(business.halal_status)}</span>` : ''}
                        ${business.rating ? `<span class="business-tag rated">${escapeHtml(business.rating)}</span>` : ''}
                        ${business.languages ? `<span class="business-tag">Languages: ${escapeHtml(business.languages)}</span>` : ''}
                    </div>
                </div>
            ` : ''}

            <div class="modal-actions">
                <button class="btn btn-secondary" id="modalFavoriteBtn" data-id="${businessIndex}">
                    <svg viewBox="0 0 24 24" fill="${isFavorite ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" width="18" height="18">
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                    </svg>
                    ${isFavorite ? 'Saved' : 'Save'}
                </button>
                <button class="btn btn-primary" id="modalShareBtn">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                        <circle cx="18" cy="5" r="3"></circle>
                        <circle cx="6" cy="12" r="3"></circle>
                        <circle cx="18" cy="19" r="3"></circle>
                        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                    </svg>
                    Share
                </button>
            </div>
        `;

        // Add modal action handlers
        $('#modalFavoriteBtn').addEventListener('click', () => {
            toggleFavorite(businessIndex);
            const btn = $('#modalFavoriteBtn');
            const newIsFavorite = state.favorites.includes(businessIndex);
            btn.innerHTML = `
                <svg viewBox="0 0 24 24" fill="${newIsFavorite ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" width="18" height="18">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                </svg>
                ${newIsFavorite ? 'Saved' : 'Save'}
            `;
        });

        $('#modalShareBtn').addEventListener('click', () => {
            shareBusiness(business);
        });

        elements.businessModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeBusinessModal() {
        elements.businessModal.classList.remove('active');
        document.body.style.overflow = '';
    }

    // ============================================
    // Favorites
    // ============================================
    function toggleFavorite(businessIndex) {
        const index = state.favorites.indexOf(businessIndex);
        if (index > -1) {
            state.favorites.splice(index, 1);
            showToast('Removed from favorites');
        } else {
            state.favorites.push(businessIndex);
            showToast('Added to favorites');
        }
        localStorage.setItem('rexdale_favorites', JSON.stringify(state.favorites));
        updateFavoritesCount();
    }

    function updateFavoritesCount() {
        elements.favoritesCount.textContent = state.favorites.length;
        elements.favoritesCount.setAttribute('data-count', state.favorites.length);
    }

    function openFavoritesPanel() {
        renderFavorites();
        elements.favoritesPanel.classList.add('active');
        elements.favoritesOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeFavoritesPanel() {
        elements.favoritesPanel.classList.remove('active');
        elements.favoritesOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    function renderFavorites() {
        if (state.favorites.length === 0) {
            elements.favoritesBody.innerHTML = `
                <div class="favorites-empty">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                    </svg>
                    <p>No saved businesses yet</p>
                    <p style="font-size: 0.875rem; margin-top: 0.5rem;">Click the bookmark icon on any business to save it here</p>
                </div>
            `;
            return;
        }

        elements.favoritesBody.innerHTML = state.favorites.map(index => {
            const business = state.businesses[index];
            if (!business) return '';
            return `
                <div class="business-card" data-id="${index}" style="margin-bottom: 1rem;">
                    <div class="business-card-header">
                        <span class="business-category">${escapeHtml(business.category)}</span>
                        <h3 class="business-name">${escapeHtml(business.name)}</h3>
                    </div>
                    ${business.phone ? `
                        <div class="business-card-body">
                            <div class="business-info-item">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"></path>
                                </svg>
                                <span>${escapeHtml(business.phone)}</span>
                            </div>
                        </div>
                    ` : ''}
                </div>
            `;
        }).join('');

        // Add click handlers
        elements.favoritesBody.querySelectorAll('.business-card').forEach(card => {
            card.addEventListener('click', () => {
                const index = parseInt(card.dataset.id);
                closeFavoritesPanel();
                openBusinessModal(state.businesses[index]);
            });
        });
    }

    // ============================================
    // Share Functionality
    // ============================================
    async function shareBusiness(business) {
        const shareData = {
            title: business.name,
            text: `Check out ${business.name} on Rexdale Directory`,
            url: window.location.href
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
                showToast('Shared successfully');
            } catch (err) {
                if (err.name !== 'AbortError') {
                    copyToClipboard(window.location.href);
                }
            }
        } else {
            copyToClipboard(window.location.href);
        }
    }

    function copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            showToast('Link copied to clipboard');
        }).catch(() => {
            showToast('Failed to copy link', 'error');
        });
    }

    // ============================================
    // Toast Notifications
    // ============================================
    function showToast(message, type = 'default') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            ${type === 'success' ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>' : ''}
            ${type === 'error' ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>' : ''}
            <span>${message}</span>
        `;

        elements.toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideUp 0.3s ease reverse';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // ============================================
    // Event Listeners
    // ============================================
    function setupEventListeners() {
        // Theme toggle
        elements.themeToggle?.addEventListener('click', () => theme.toggle());

        // Search
        let searchTimeout;
        elements.searchInput?.addEventListener('input', () => {
            const hasValue = elements.searchInput.value.length > 0;
            elements.clearSearch.hidden = !hasValue;

            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                state.filters.search = elements.searchInput.value;
                filterBusinesses();
                showSearchSuggestions();
            }, 300);
        });

        elements.clearSearch?.addEventListener('click', () => {
            elements.searchInput.value = '';
            elements.clearSearch.hidden = true;
            elements.searchSuggestions.classList.remove('active');
            state.filters.search = '';
            filterBusinesses();
        });

        // Hide suggestions when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-wrapper')) {
                elements.searchSuggestions?.classList.remove('active');
            }
        });

        // Quick filters
        $$('.quick-filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const filter = btn.dataset.filter;
                elements.searchInput.value = filter;
                state.filters.search = filter;
                filterBusinesses();
                scrollToSection('#directory');
            });
        });

        // Category tabs
        $$('.category-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                $$('.category-tab').forEach(t => {
                    t.classList.remove('active');
                    t.setAttribute('aria-selected', 'false');
                });
                tab.classList.add('active');
                tab.setAttribute('aria-selected', 'true');
                renderCategories(tab.dataset.group);
            });
        });

        // Show all categories
        elements.showAllCategories?.addEventListener('click', () => {
            state.showAllCategories = !state.showAllCategories;
            renderCategories();
        });

        // Neighborhood cards
        $$('.neighborhood-card').forEach(card => {
            card.addEventListener('click', () => {
                const area = card.dataset.area;
                state.filters.area = area;
                filterBusinesses();
                scrollToSection('#directory');
                showToast(`Showing businesses in ${area}`);
            });
        });

        // Filters
        elements.categoryFilter?.addEventListener('change', () => {
            state.filters.category = elements.categoryFilter.value;
            filterBusinesses();
        });

        elements.sortFilter?.addEventListener('change', () => {
            state.filters.sort = elements.sortFilter.value;
            filterBusinesses();
        });

        // Advanced filters toggle
        elements.advancedFilterToggle?.addEventListener('click', () => {
            const isExpanded = elements.advancedFilters.hidden;
            elements.advancedFilters.hidden = !isExpanded;
            elements.advancedFilterToggle.setAttribute('aria-expanded', isExpanded);
        });

        // Advanced filter checkboxes
        elements.filterHalal?.addEventListener('change', () => {
            state.filters.halal = elements.filterHalal.checked;
            filterBusinesses();
        });

        elements.filterRated?.addEventListener('change', () => {
            state.filters.rated = elements.filterRated.checked;
            filterBusinesses();
        });

        elements.filterWebsite?.addEventListener('change', () => {
            state.filters.hasWebsite = elements.filterWebsite.checked;
            filterBusinesses();
        });

        elements.filterPhone?.addEventListener('change', () => {
            state.filters.hasPhone = elements.filterPhone.checked;
            filterBusinesses();
        });

        elements.clearFilters?.addEventListener('click', clearAllFilters);

        // View toggle
        elements.gridViewBtn?.addEventListener('click', () => {
            state.viewMode = 'grid';
            elements.gridViewBtn.classList.add('active');
            elements.listViewBtn.classList.remove('active');
            renderListings();
        });

        elements.listViewBtn?.addEventListener('click', () => {
            state.viewMode = 'list';
            elements.listViewBtn.classList.add('active');
            elements.gridViewBtn.classList.remove('active');
            renderListings();
        });

        // Carousel
        elements.carouselPrev?.addEventListener('click', () => scrollCarousel('prev'));
        elements.carouselNext?.addEventListener('click', () => scrollCarousel('next'));

        // Modal
        elements.businessModal?.querySelector('.modal-overlay')?.addEventListener('click', closeBusinessModal);
        elements.businessModal?.querySelector('.modal-close')?.addEventListener('click', closeBusinessModal);

        // Favorites
        elements.favoritesBtn?.addEventListener('click', openFavoritesPanel);
        elements.favoritesClose?.addEventListener('click', closeFavoritesPanel);
        elements.favoritesOverlay?.addEventListener('click', closeFavoritesPanel);

        // Mobile menu
        elements.mobileMenuBtn?.addEventListener('click', () => {
            const isActive = elements.mobileMenuBtn.classList.toggle('active');
            elements.mobileNav.classList.toggle('active');
            elements.mobileMenuBtn.setAttribute('aria-expanded', isActive);
            elements.mobileNav.setAttribute('aria-hidden', !isActive);
        });

        // Close mobile menu when clicking a link
        $$('.mobile-nav-link').forEach(link => {
            link.addEventListener('click', () => {
                elements.mobileMenuBtn.classList.remove('active');
                elements.mobileNav.classList.remove('active');
                elements.mobileMenuBtn.setAttribute('aria-expanded', 'false');
                elements.mobileNav.setAttribute('aria-hidden', 'true');
            });
        });

        // Announcement bar close
        $('.announcement-close')?.addEventListener('click', () => {
            elements.announcementBar.classList.add('hidden');
            localStorage.setItem('rexdale_announcement_closed', 'true');
        });

        // Check if announcement was previously closed
        if (localStorage.getItem('rexdale_announcement_closed')) {
            elements.announcementBar?.classList.add('hidden');
        }

        // Scroll events
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                const scrollY = window.scrollY;

                // Header shadow
                elements.header?.classList.toggle('scrolled', scrollY > 10);

                // Back to top button
                elements.backToTop?.classList.toggle('visible', scrollY > 500);
            }, 10);
        });

        // Back to top
        elements.backToTop?.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (elements.businessModal.classList.contains('active')) {
                    closeBusinessModal();
                }
                if (elements.favoritesPanel.classList.contains('active')) {
                    closeFavoritesPanel();
                }
            }
        });

        // Footer category links
        $$('[data-category]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const category = link.dataset.category;
                elements.categoryFilter.value = category;
                state.filters.category = category;
                filterBusinesses();
                scrollToSection('#directory');
            });
        });

        // Newsletter form - submit via Formspree
        elements.newsletterForm?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const form = e.target;
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;

            submitBtn.innerHTML = 'Sending...';
            submitBtn.disabled = true;

            try {
                const response = await fetch(form.action, {
                    method: 'POST',
                    body: new FormData(form),
                    headers: { 'Accept': 'application/json' }
                });

                if (response.ok) {
                    showToast('Thank you for subscribing!', 'success');
                    form.reset();
                } else {
                    showToast('Something went wrong. Please try again.', 'error');
                }
            } catch (error) {
                showToast('Something went wrong. Please try again.', 'error');
            }

            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        });

        // Submit Business Modal
        elements.openSubmitModal?.addEventListener('click', () => {
            elements.submitModal?.classList.add('active');
            document.body.style.overflow = 'hidden';
        });

        const closeSubmitModalFn = () => {
            elements.submitModal?.classList.remove('active');
            document.body.style.overflow = '';
        };

        elements.closeSubmitModal?.addEventListener('click', closeSubmitModalFn);
        elements.cancelSubmitModal?.addEventListener('click', closeSubmitModalFn);

        elements.submitModal?.querySelector('.modal-overlay')?.addEventListener('click', closeSubmitModalFn);

        // Submit Business Form - submit via Formspree
        elements.submitBusinessForm?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const form = e.target;
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;

            submitBtn.innerHTML = 'Submitting...';
            submitBtn.disabled = true;

            try {
                const response = await fetch(form.action, {
                    method: 'POST',
                    body: new FormData(form),
                    headers: { 'Accept': 'application/json' }
                });

                if (response.ok) {
                    showToast('Business submitted successfully! We\'ll review it soon.', 'success');
                    form.reset();
                    closeSubmitModalFn();
                } else {
                    showToast('Something went wrong. Please try again.', 'error');
                }
            } catch (error) {
                showToast('Something went wrong. Please try again.', 'error');
            }

            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        });

        // Quick Info Modal
        const closeInfoModalFn = () => {
            elements.infoModal?.classList.remove('active');
            document.body.style.overflow = '';
        };

        elements.closeInfoModal?.addEventListener('click', closeInfoModalFn);
        elements.cancelInfoModal?.addEventListener('click', closeInfoModalFn);
        elements.infoModal?.querySelector('.modal-overlay')?.addEventListener('click', closeInfoModalFn);

        // Info Form - submit via Formspree
        elements.infoForm?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const form = e.target;
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;

            submitBtn.innerHTML = 'Submitting...';
            submitBtn.disabled = true;

            try {
                const response = await fetch(form.action, {
                    method: 'POST',
                    body: new FormData(form),
                    headers: { 'Accept': 'application/json' }
                });

                if (response.ok) {
                    showToast('Thank you! Your info will help the community.', 'success');
                    form.reset();
                    closeInfoModalFn();
                } else {
                    showToast('Something went wrong. Please try again.', 'error');
                }
            } catch (error) {
                showToast('Something went wrong. Please try again.', 'error');
            }

            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        });

        // Cuisine tags
        $$('.cuisine-tag').forEach(tag => {
            tag.addEventListener('click', () => {
                elements.searchInput.value = tag.textContent;
                state.filters.search = tag.textContent;
                filterBusinesses();
                scrollToSection('#directory');
            });
        });
    }

    // ============================================
    // Utility Functions
    // ============================================
    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function truncateText(text, maxLength) {
        if (!text) return '';
        if (text.length <= maxLength) return escapeHtml(text);
        return escapeHtml(text.substring(0, maxLength)) + '...';
    }

    function highlightMatch(text, term) {
        if (!text || !term) return escapeHtml(text);
        const escaped = escapeHtml(text);
        const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        return escaped.replace(regex, '<strong>$1</strong>');
    }

    function formatWebsiteUrl(url) {
        if (!url) return '';
        if (url.startsWith('http://') || url.startsWith('https://')) {
            return url;
        }
        return 'https://' + url;
    }

    function scrollToSection(selector) {
        const section = $(selector);
        if (section) {
            const headerHeight = elements.header?.offsetHeight || 64;
            const top = section.offsetTop - headerHeight - 20;
            window.scrollTo({ top, behavior: 'smooth' });
        }
    }

    // ============================================
    // Initialize on DOM Ready
    // ============================================
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
