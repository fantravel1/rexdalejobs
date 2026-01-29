/**
 * Rexdale Business Directory
 * Main Application JavaScript
 */

(function() {
    'use strict';

    // ============================================
    // Global State
    // ============================================
    let businesses = [];
    let categories = [];
    let filteredBusinesses = [];
    let currentPage = 1;
    const itemsPerPage = 12;
    let showAllCategories = false;
    const maxInitialCategories = 15;

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

    // ============================================
    // DOM Elements
    // ============================================
    const elements = {
        searchInput: document.getElementById('searchInput'),
        clearSearch: document.getElementById('clearSearch'),
        searchSuggestions: document.getElementById('searchSuggestions'),
        categoryGrid: document.getElementById('categoryGrid'),
        showAllCategories: document.getElementById('showAllCategories'),
        categoryFilter: document.getElementById('categoryFilter'),
        sortFilter: document.getElementById('sortFilter'),
        resultsCount: document.getElementById('resultsCount'),
        listingsGrid: document.getElementById('listingsGrid'),
        pagination: document.getElementById('pagination'),
        totalBusinesses: document.getElementById('totalBusinesses'),
        totalCategories: document.getElementById('totalCategories'),
        businessModal: document.getElementById('businessModal'),
        modalBody: document.getElementById('modalBody'),
        mobileMenuBtn: document.querySelector('.mobile-menu-btn'),
        mobileNav: document.querySelector('.mobile-nav'),
        header: document.querySelector('.header'),
        backToTop: document.getElementById('backToTop')
    };

    // ============================================
    // Initialize Application
    // ============================================
    async function init() {
        showLoading();

        try {
            const response = await fetch('data/businesses.json');
            const data = await response.json();

            businesses = data.businesses;
            categories = data.categories;
            filteredBusinesses = [...businesses];

            // Update stats
            elements.totalBusinesses.textContent = businesses.length.toLocaleString();
            elements.totalCategories.textContent = categories.length.toLocaleString();

            // Render components
            renderCategories();
            populateCategoryFilter();
            renderListings();

            // Setup event listeners
            setupEventListeners();

        } catch (error) {
            console.error('Error loading data:', error);
            showError();
        }
    }

    // ============================================
    // Render Functions
    // ============================================
    function renderCategories() {
        // Count businesses per category
        const categoryCounts = {};
        businesses.forEach(b => {
            categoryCounts[b.category] = (categoryCounts[b.category] || 0) + 1;
        });

        // Sort categories by count
        const sortedCategories = categories
            .filter(cat => categoryCounts[cat])
            .sort((a, b) => categoryCounts[b] - categoryCounts[a]);

        elements.categoryGrid.innerHTML = sortedCategories
            .map((category, index) => {
                const icon = categoryIcons[category] || categoryIcons['default'];
                const count = categoryCounts[category] || 0;
                const hidden = !showAllCategories && index >= maxInitialCategories;

                return `
                    <div class="category-card ${hidden ? 'hidden' : ''}" data-category="${escapeHtml(category)}">
                        <div class="category-icon">${icon}</div>
                        <span class="category-name">${escapeHtml(category)}</span>
                        <span class="category-count">${count} businesses</span>
                    </div>
                `;
            })
            .join('');

        // Update show all button text
        const hiddenCount = sortedCategories.length - maxInitialCategories;
        if (hiddenCount > 0) {
            elements.showAllCategories.innerHTML = showAllCategories
                ? 'Show Less <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M18 15l-6-6-6 6"></path></svg>'
                : `Show All Categories (+${hiddenCount}) <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M6 9l6 6 6-6"></path></svg>`;
            elements.showAllCategories.style.display = 'inline-flex';
        } else {
            elements.showAllCategories.style.display = 'none';
        }

        // Add click handlers
        document.querySelectorAll('.category-card').forEach(card => {
            card.addEventListener('click', () => {
                const category = card.dataset.category;
                elements.categoryFilter.value = category;
                filterBusinesses();
                scrollToListings();
            });
        });
    }

    function populateCategoryFilter() {
        const categoryCounts = {};
        businesses.forEach(b => {
            categoryCounts[b.category] = (categoryCounts[b.category] || 0) + 1;
        });

        const sortedCategories = categories
            .filter(cat => categoryCounts[cat])
            .sort((a, b) => a.localeCompare(b));

        elements.categoryFilter.innerHTML = '<option value="">All Categories</option>' +
            sortedCategories.map(cat =>
                `<option value="${escapeHtml(cat)}">${escapeHtml(cat)} (${categoryCounts[cat]})</option>`
            ).join('');
    }

    function renderListings() {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const pageBusinesses = filteredBusinesses.slice(startIndex, endIndex);

        if (pageBusinesses.length === 0) {
            elements.listingsGrid.innerHTML = `
                <div class="no-results" style="grid-column: 1 / -1;">
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
        } else {
            elements.listingsGrid.innerHTML = pageBusinesses.map(business => {
                const tags = [];
                if (business.halal_status) tags.push({ text: 'Halal', class: 'halal' });
                if (business.rating) tags.push({ text: business.rating, class: 'rated' });

                return `
                    <article class="business-card" data-id="${businesses.indexOf(business)}">
                        <div class="business-card-header">
                            <span class="business-category">${escapeHtml(business.category)}</span>
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
                                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
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
                        ${tags.length > 0 ? `
                            <div class="business-card-footer">
                                <div class="business-tags">
                                    ${tags.map(tag => `<span class="business-tag ${tag.class}">${escapeHtml(tag.text)}</span>`).join('')}
                                </div>
                            </div>
                        ` : ''}
                    </article>
                `;
            }).join('');
        }

        // Update results count
        elements.resultsCount.textContent = filteredBusinesses.length.toLocaleString();

        // Render pagination
        renderPagination();

        // Add click handlers to cards
        document.querySelectorAll('.business-card').forEach(card => {
            card.addEventListener('click', () => {
                const index = parseInt(card.dataset.id);
                openBusinessModal(businesses[index]);
            });
        });
    }

    function renderPagination() {
        const totalPages = Math.ceil(filteredBusinesses.length / itemsPerPage);

        if (totalPages <= 1) {
            elements.pagination.innerHTML = '';
            return;
        }

        let html = '';

        // Previous button
        html += `
            <button class="pagination-btn" ${currentPage === 1 ? 'disabled' : ''} data-page="${currentPage - 1}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M15 18l-6-6 6-6"></path>
                </svg>
            </button>
        `;

        // Page numbers
        const maxVisible = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
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
                <button class="pagination-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">
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
            <button class="pagination-btn" ${currentPage === totalPages ? 'disabled' : ''} data-page="${currentPage + 1}">
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
                    currentPage = page;
                    renderListings();
                    scrollToListings();
                }
            });
        });
    }

    // ============================================
    // Filter & Search Functions
    // ============================================
    function filterBusinesses() {
        const searchTerm = elements.searchInput.value.toLowerCase().trim();
        const categoryFilter = elements.categoryFilter.value;
        const sortBy = elements.sortFilter.value;

        filteredBusinesses = businesses.filter(business => {
            // Category filter
            if (categoryFilter && business.category !== categoryFilter) {
                return false;
            }

            // Search filter
            if (searchTerm) {
                const searchFields = [
                    business.name,
                    business.category,
                    business.address,
                    business.services,
                    business.notes
                ].filter(Boolean).map(f => f.toLowerCase());

                return searchFields.some(field => field.includes(searchTerm));
            }

            return true;
        });

        // Sort
        filteredBusinesses.sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'name-desc':
                    return b.name.localeCompare(a.name);
                case 'category':
                    return a.category.localeCompare(b.category) || a.name.localeCompare(b.name);
                default:
                    return 0;
            }
        });

        currentPage = 1;
        renderListings();
    }

    function showSearchSuggestions() {
        const searchTerm = elements.searchInput.value.toLowerCase().trim();

        if (searchTerm.length < 2) {
            elements.searchSuggestions.classList.remove('active');
            return;
        }

        const matches = businesses
            .filter(business => {
                const searchFields = [
                    business.name,
                    business.category
                ].filter(Boolean).map(f => f.toLowerCase());

                return searchFields.some(field => field.includes(searchTerm));
            })
            .slice(0, 6);

        if (matches.length === 0) {
            elements.searchSuggestions.classList.remove('active');
            return;
        }

        elements.searchSuggestions.innerHTML = matches.map(business => `
            <div class="suggestion-item" data-id="${businesses.indexOf(business)}">
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
                openBusinessModal(businesses[index]);
                elements.searchSuggestions.classList.remove('active');
            });
        });
    }

    // ============================================
    // Modal Functions
    // ============================================
    function openBusinessModal(business) {
        elements.modalBody.innerHTML = `
            <div class="modal-header">
                <span class="modal-category">${escapeHtml(business.category)}</span>
                <h2 class="modal-title">${escapeHtml(business.name)}</h2>
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
                                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
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
                    <div class="modal-tags">
                        ${business.halal_status ? `<span class="business-tag halal">${escapeHtml(business.halal_status)}</span>` : ''}
                        ${business.rating ? `<span class="business-tag rated">${escapeHtml(business.rating)}</span>` : ''}
                        ${business.languages ? `<span class="business-tag">Languages: ${escapeHtml(business.languages)}</span>` : ''}
                    </div>
                </div>
            ` : ''}
        `;

        elements.businessModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeBusinessModal() {
        elements.businessModal.classList.remove('active');
        document.body.style.overflow = '';
    }

    // ============================================
    // Event Listeners
    // ============================================
    function setupEventListeners() {
        // Search
        let searchTimeout;
        elements.searchInput.addEventListener('input', () => {
            // Show/hide clear button
            elements.clearSearch.classList.toggle('visible', elements.searchInput.value.length > 0);

            // Debounced search
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                filterBusinesses();
                showSearchSuggestions();
            }, 300);
        });

        elements.clearSearch.addEventListener('click', () => {
            elements.searchInput.value = '';
            elements.clearSearch.classList.remove('visible');
            elements.searchSuggestions.classList.remove('active');
            filterBusinesses();
        });

        // Hide suggestions when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-wrapper')) {
                elements.searchSuggestions.classList.remove('active');
            }
        });

        // Show all categories
        elements.showAllCategories.addEventListener('click', () => {
            showAllCategories = !showAllCategories;
            renderCategories();
        });

        // Filters
        elements.categoryFilter.addEventListener('change', filterBusinesses);
        elements.sortFilter.addEventListener('change', filterBusinesses);

        // Modal
        elements.businessModal.querySelector('.modal-overlay').addEventListener('click', closeBusinessModal);
        elements.businessModal.querySelector('.modal-close').addEventListener('click', closeBusinessModal);
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && elements.businessModal.classList.contains('active')) {
                closeBusinessModal();
            }
        });

        // Mobile menu
        elements.mobileMenuBtn.addEventListener('click', () => {
            elements.mobileMenuBtn.classList.toggle('active');
            elements.mobileNav.classList.toggle('active');
        });

        // Close mobile menu when clicking a link
        document.querySelectorAll('.mobile-nav-link').forEach(link => {
            link.addEventListener('click', () => {
                elements.mobileMenuBtn.classList.remove('active');
                elements.mobileNav.classList.remove('active');
            });
        });

        // Scroll events
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                // Header shadow
                elements.header.classList.toggle('scrolled', window.scrollY > 10);

                // Back to top button
                elements.backToTop.classList.toggle('visible', window.scrollY > 500);
            }, 10);
        });

        // Back to top
        elements.backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        // Footer category links
        document.querySelectorAll('[data-category]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const category = link.dataset.category;
                elements.categoryFilter.value = category;
                filterBusinesses();
                scrollToListings();
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

    function scrollToListings() {
        const section = document.querySelector('.featured-section');
        if (section) {
            const headerHeight = elements.header.offsetHeight;
            const top = section.offsetTop - headerHeight - 20;
            window.scrollTo({ top, behavior: 'smooth' });
        }
    }

    function showLoading() {
        elements.listingsGrid.innerHTML = `
            <div class="loading" style="grid-column: 1 / -1;">
                <div class="loading-spinner"></div>
                <p style="margin-top: 1rem;">Loading businesses...</p>
            </div>
        `;
    }

    function showError() {
        elements.listingsGrid.innerHTML = `
            <div class="no-results" style="grid-column: 1 / -1;">
                <div class="no-results-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="15" y1="9" x2="9" y2="15"></line>
                        <line x1="9" y1="9" x2="15" y2="15"></line>
                    </svg>
                </div>
                <h3 class="no-results-title">Error loading data</h3>
                <p class="no-results-text">Please try refreshing the page</p>
            </div>
        `;
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
