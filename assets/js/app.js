(() => {
    'use strict';

    const app = document.getElementById('app');
    const toast = document.getElementById('toast');
    const root = document.documentElement;

    const THEMES = [
        { id: 'gratitude', label: 'Gratitude', icon: '✦', description: 'Begin with thanksgiving.' },
        { id: 'peace', label: 'Peace', icon: '◌', description: 'Rest your mind in God.' },
        { id: 'healing', label: 'Healing', icon: '♡', description: 'Bring every wound to Him.' },
        { id: 'wisdom', label: 'Wisdom', icon: '✧', description: 'Seek guidance before you move.' },
        { id: 'understanding', label: 'Understanding', icon: '⌁', description: 'Find light for what feels unclear.' },
        { id: 'protection', label: 'Protection', icon: '⌂', description: 'Place your life in His care.' },
        { id: 'provision', label: 'Provision', icon: '◇', description: 'Trust the One who supplies.' },
        { id: 'purpose', label: 'Purpose', icon: '↟', description: 'Walk in what God has prepared.' },
        { id: 'living-right', label: 'Living Right', icon: '✓', description: 'Choose integrity and obedience.' },
        { id: 'spirit', label: 'Holy Spirit', icon: '❧', description: 'Grow in the fruit and gifts of the Holy Spirit.' }
    ];

    const STORAGE_KEYS = {
        saved: 'twg_saved_prayers',
        memorised: 'twg_memorised_verses',
        recent: 'twg_recent_prayers',
        last: 'twg_last_prayer',
        visits: 'twg_prayer_visits',
        amens: 'twg_prayer_amens',
        appearance: 'twg_appearance'
    };

    const state = {
        prayers: [],
        search: '',
        theme: 'all'
    };

    const storage = {
        get(key, fallback) {
            try {
                const value = localStorage.getItem(key);
                return value === null ? fallback : JSON.parse(value);
            } catch (error) {
                console.warn(`Could not read ${key}`, error);
                return fallback;
            }
        },
        set(key, value) {
            try {
                localStorage.setItem(key, JSON.stringify(value));
            } catch (error) {
                console.warn(`Could not save ${key}`, error);
                showToast('This browser could not save that change.');
            }
        }
    };

    function escapeHTML(value = '') {
        return String(value)
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#039;');
    }

    function getTheme(themeId) {
        return THEMES.find((theme) => theme.id === themeId) || THEMES[0];
    }

    function showToast(message) {
        toast.textContent = message;
        toast.classList.add('is-visible');
        window.clearTimeout(showToast.timeout);
        showToast.timeout = window.setTimeout(() => {
            toast.classList.remove('is-visible');
        }, 2300);
    }

    function getSavedIds() {
        return storage.get(STORAGE_KEYS.saved, []);
    }

    function getMemorisedIds() {
        return storage.get(STORAGE_KEYS.memorised, []);
    }

    function getVisits() {
        return storage.get(STORAGE_KEYS.visits, {});
    }

    function getAmens() {
        return storage.get(STORAGE_KEYS.amens, {});
    }

    function toggleListItem(key, id) {
        const items = storage.get(key, []);
        const exists = items.includes(id);
        const next = exists ? items.filter((item) => item !== id) : [id, ...items];
        storage.set(key, next);
        return !exists;
    }

    function recordVisit(id) {
        const visits = getVisits();
        visits[id] = (visits[id] || 0) + 1;
        storage.set(STORAGE_KEYS.visits, visits);
        storage.set(STORAGE_KEYS.last, id);

        const recent = storage.get(STORAGE_KEYS.recent, []);
        const nextRecent = [id, ...recent.filter((item) => item !== id)].slice(0, 6);
        storage.set(STORAGE_KEYS.recent, nextRecent);
    }

    function recordAmen(id) {
        const amens = getAmens();
        amens[id] = (amens[id] || 0) + 1;
        storage.set(STORAGE_KEYS.amens, amens);
        return amens[id];
    }

    function randomPrayer(collection = state.prayers) {
        if (!collection.length) return null;
        return collection[Math.floor(Math.random() * collection.length)];
    }

    function prayerById(id) {
        return state.prayers.find((prayer) => prayer.id === id) || null;
    }

    function prayerCard(prayer) {
        const theme = getTheme(prayer.theme);
        const saved = getSavedIds().includes(prayer.id);

        return `
            <article class="library-card">
                <div class="card-topline">
                    <span class="theme-pill">${theme.icon} ${escapeHTML(theme.label)}</span>
                    <span class="meta">${escapeHTML(prayer.reference)}</span>
                </div>
                <h3>${escapeHTML(prayer.title)}</h3>
                <blockquote>“${escapeHTML(prayer.verse)}”</blockquote>
                <div class="card-actions">
                    <a class="button button-primary" href="#prayer=${encodeURIComponent(prayer.id)}">Open prayer</a>
                    <button class="button button-secondary ${saved ? 'is-active' : ''}" type="button" data-action="save" data-id="${escapeHTML(prayer.id)}">
                        ${saved ? 'Saved' : 'Save'}
                    </button>
                </div>
            </article>
        `;
    }

    function setActiveNav(route) {
        const base = route.split('=')[0];
        const active = base === 'prayer' || base === 'theme' ? 'explore' : base;
        document.querySelectorAll('[data-nav]').forEach((link) => {
            link.classList.toggle('is-active', link.dataset.nav === active);
        });
    }

    function renderHome() {
        const gratitudePrayers = state.prayers.filter((prayer) => prayer.theme === 'gratitude');
        const featured = gratitudePrayers.find((prayer) => prayer.featured) || gratitudePrayers[0];
        const lastId = storage.get(STORAGE_KEYS.last, null);
        const lastPrayer = lastId ? prayerById(lastId) : null;
        const recentIds = storage.get(STORAGE_KEYS.recent, []);
        const recent = recentIds.map(prayerById).filter(Boolean).slice(0, 3);

        app.innerHTML = `
            <section class="section">
                <article class="feature-card">
                    <div>
                        <span class="theme-pill">✦ Begin with gratitude</span>
                        <h3>${escapeHTML(featured.title)}</h3>
                        <p>Pause before asking for anything. Remember what God has done, thank Him for what is present, and trust Him with what is still unfolding.</p>
                    </div>
                    <div class="feature-actions">
                        <a class="button button-primary" href="#prayer=${encodeURIComponent(featured.id)}">Begin prayer</a>
                        <button class="button button-secondary" type="button" data-action="random" data-theme="gratitude">Another gratitude prayer</button>
                    </div>
                </article>
            </section>

            ${lastPrayer ? `
                <section class="section">
                    <div class="section-heading">
                        <div>
                            <h2>Continue where you stopped</h2>
                            <p>Your last prayer is ready whenever you are.</p>
                        </div>
                    </div>
                    <article class="recent-card">
                        <div class="card-topline">
                            <span class="theme-pill">${getTheme(lastPrayer.theme).icon} ${escapeHTML(getTheme(lastPrayer.theme).label)}</span>
                            <span class="meta">${escapeHTML(lastPrayer.reference)}</span>
                        </div>
                        <h3>${escapeHTML(lastPrayer.title)}</h3>
                        <p>Return to this prayer and read the verse again.</p>
                        <a class="button button-secondary" href="#prayer=${encodeURIComponent(lastPrayer.id)}">Continue</a>
                    </article>
                </section>
            ` : ''}

            <section class="section">
                <div class="section-heading">
                    <div>
                        <h2>Prayer library</h2>
                        <p>Prayer and Scripture for every season of life.</p>
                    </div>
                </div>
                <div class="theme-grid">
                    ${THEMES.map((theme) => `
                        <a class="theme-card ${theme.id === 'gratitude' ? 'theme-card--gratitude' : ''}" href="#theme=${encodeURIComponent(theme.id)}">
                            <span class="theme-icon" aria-hidden="true">${theme.icon}</span>
                            <span>
                                <strong>${escapeHTML(theme.label)}</strong>
                                <small>${escapeHTML(theme.description)}</small>
                            </span>
                        </a>
                    `).join('')}
                </div>
            </section>

            <section class="section">
                <div class="section-heading">
                    <div>
                        <h2>Open something unexpected</h2>
                        <p>Receive a prayer from any theme.</p>
                    </div>
                </div>
                <article class="content-card">
                    <h3>Surprise me</h3>
                    <p>Open a prayer from any theme. You can stay with it, save it or choose another.</p>
                    <button class="button button-primary" type="button" data-action="random">Open a prayer</button>
                </article>
            </section>

            ${recent.length ? `
                <section class="section">
                    <div class="section-heading">
                        <div>
                            <h2>Recently visited</h2>
                            <p>Prayers you may want to return to.</p>
                        </div>
                        <a class="text-link" href="#explore">View all</a>
                    </div>
                    <div class="card-grid">
                        ${recent.map((prayer) => `
                            <article class="recent-card">
                                <div class="card-topline">
                                    <span class="theme-pill">${getTheme(prayer.theme).icon} ${escapeHTML(getTheme(prayer.theme).label)}</span>
                                    <span class="meta">${escapeHTML(prayer.reference)}</span>
                                </div>
                                <h3>${escapeHTML(prayer.title)}</h3>
                                <a class="button button-secondary" href="#prayer=${encodeURIComponent(prayer.id)}">Return to prayer</a>
                            </article>
                        `).join('')}
                    </div>
                </section>
            ` : ''}
        `;
    }

    function renderExplore(themeFromRoute = null, shouldFocusSearch = false) {
        if (themeFromRoute) state.theme = themeFromRoute;

        const query = state.search.trim().toLowerCase();
        const filtered = state.prayers.filter((prayer) => {
            const themeMatches = state.theme === 'all' || prayer.theme === state.theme;
            const queryMatches = !query || [
                prayer.title,
                prayer.theme,
                prayer.verse,
                prayer.reference,
                prayer.prayer
            ].some((value) => value.toLowerCase().includes(query));
            return themeMatches && queryMatches;
        });

        const activeTheme = state.theme === 'all' ? null : getTheme(state.theme);

        app.innerHTML = `
            <section class="page-heading">
                <div>
                    <span class="eyebrow">Browse freely</span>
                    <h1>${activeTheme ? escapeHTML(activeTheme.label) : 'Explore prayers'}</h1>
                    <p>${activeTheme ? escapeHTML(activeTheme.description) : 'Search by a word, scripture reference or the season you are in.'}</p>
                </div>
            </section>

            <section class="search-wrap">
                <input class="search-field" type="search" placeholder="Search prayers, verses or references" aria-label="Search prayers" value="${escapeHTML(state.search)}" data-search>
                <div class="filter-row" aria-label="Prayer themes">
                    <button class="filter-chip ${state.theme === 'all' ? 'is-active' : ''}" type="button" data-filter="all">All</button>
                    ${THEMES.map((theme) => `
                        <button class="filter-chip ${state.theme === theme.id ? 'is-active' : ''}" type="button" data-filter="${escapeHTML(theme.id)}">${theme.icon} ${escapeHTML(theme.label)}</button>
                    `).join('')}
                </div>
            </section>

            <section class="section">
                <div class="list-header">
                    <p class="meta">${filtered.length} ${filtered.length === 1 ? 'prayer' : 'prayers'}</p>
                    <button class="text-link" type="button" data-action="random" ${filtered.length ? '' : 'disabled'}>Surprise me</button>
                </div>
                ${filtered.length ? `<div class="library-grid">${filtered.map(prayerCard).join('')}</div>` : `
                    <div class="empty-state">
                        <h2>No prayers found</h2>
                        <p>Try another word or choose a different theme.</p>
                        <button class="button button-secondary" type="button" data-action="clear-search">Clear search</button>
                    </div>
                `}
            </section>
        `;

        const searchInput = app.querySelector('[data-search]');
        searchInput?.addEventListener('input', (event) => {
            state.search = event.target.value;
            window.clearTimeout(renderExplore.searchTimeout);
            renderExplore.searchTimeout = window.setTimeout(() => renderExplore(null, true), 140);
        });

        if (shouldFocusSearch && searchInput) {
            searchInput.focus();
            const end = searchInput.value.length;
            searchInput.setSelectionRange(end, end);
        }
    }

    function renderPrayer(id) {
        const prayer = prayerById(id);

        if (!prayer) {
            renderNotFound();
            return;
        }

        recordVisit(prayer.id);

        const theme = getTheme(prayer.theme);
        const saved = getSavedIds().includes(prayer.id);
        const memorised = getMemorisedIds().includes(prayer.id);
        const visits = getVisits()[prayer.id] || 1;
        const amens = getAmens()[prayer.id] || 0;
        const paragraphs = prayer.prayer.split(/\n\n+/).map((paragraph) => `<p>${escapeHTML(paragraph)}</p>`).join('');

        app.innerHTML = `
            <section class="prayer-layout">
                <article class="prayer-paper">
                    <div class="detail-topline">
                        <button class="back-link" type="button" data-action="back">← Back</button>
                        <span class="theme-pill">${theme.icon} ${escapeHTML(theme.label)}</span>
                    </div>

                    <h1 class="prayer-title">${escapeHTML(prayer.title)}</h1>

                    <div class="memory-verse">
                        <small>Memory verse</small>
                        <blockquote>“${escapeHTML(prayer.verse)}”</blockquote>
                        <span class="reference">${escapeHTML(prayer.reference)} · ${escapeHTML(prayer.translation)}</span>
                    </div>

                    <div class="prayer-body">
                        <small>Prayer</small>
                        ${paragraphs}
                    </div>

                    <div class="prayer-actions">
                        <button class="button button-primary" type="button" data-action="amen" data-id="${escapeHTML(prayer.id)}">Amen${amens ? ` · ${amens}` : ''}</button>
                        <button class="button button-secondary ${saved ? 'is-active' : ''}" type="button" data-action="save" data-id="${escapeHTML(prayer.id)}">${saved ? 'Saved' : 'Save prayer'}</button>
                        <button class="button button-secondary ${memorised ? 'is-active' : ''}" type="button" data-action="memorise" data-id="${escapeHTML(prayer.id)}">${memorised ? 'Verse memorised' : 'Mark verse memorised'}</button>
                    </div>
                </article>

                <aside class="prayer-side">
                    <div class="stat-card">
                        <strong>${visits}</strong>
                        <small>${visits === 1 ? 'visit to this prayer' : 'visits to this prayer'}</small>
                    </div>
                    <div class="stat-card">
                        <strong>${amens}</strong>
                        <small>${amens === 1 ? 'amen recorded' : 'amens recorded'}</small>
                    </div>
                    <button class="button button-ghost" type="button" data-action="random" data-theme="${escapeHTML(prayer.theme)}">Another ${escapeHTML(theme.label.toLowerCase())} prayer</button>
                    <button class="button button-ghost" type="button" data-action="share" data-id="${escapeHTML(prayer.id)}">Share verse</button>
                </aside>
            </section>
        `;
    }

    function renderSaved() {
        const saved = getSavedIds().map(prayerById).filter(Boolean);

        app.innerHTML = `
            <section class="page-heading">
                <div>
                    <span class="eyebrow">Return anytime</span>
                    <h1>Saved prayers</h1>
                    <p>Keep the prayers that speak to the season you are in.</p>
                </div>
            </section>

            <section class="section">
                ${saved.length ? `<div class="library-grid">${saved.map(prayerCard).join('')}</div>` : `
                    <div class="empty-state">
                        <h2>No saved prayers yet</h2>
                        <p>Save any prayer you want to revisit from the prayer library.</p>
                        <a class="button button-primary" href="#explore">Explore prayers</a>
                    </div>
                `}
            </section>
        `;
    }

    function renderVerses() {
        const memorisedIds = getMemorisedIds();
        const memorised = memorisedIds.map(prayerById).filter(Boolean);

        app.innerHTML = `
            <section class="page-heading">
                <div>
                    <span class="eyebrow">Verses I carry</span>
                    <h1>Memory verses</h1>
                    <p>Revisit Scripture you have chosen to learn and keep close.</p>
                </div>
            </section>

            <section class="section">
                ${memorised.length ? `
                    <div class="library-grid">
                        ${memorised.map((prayer) => {
                            const theme = getTheme(prayer.theme);
                            return `
                                <article class="verse-card is-memorised">
                                    <div class="card-topline">
                                        <span class="theme-pill">${theme.icon} ${escapeHTML(theme.label)}</span>
                                        <span class="meta">Memorised</span>
                                    </div>
                                    <blockquote>“${escapeHTML(prayer.verse)}”</blockquote>
                                    <p class="reference">${escapeHTML(prayer.reference)}</p>
                                    <div class="card-actions">
                                        <a class="button button-secondary" href="#prayer=${encodeURIComponent(prayer.id)}">Open prayer</a>
                                        <button class="button button-ghost" type="button" data-action="memorise" data-id="${escapeHTML(prayer.id)}">Remove</button>
                                    </div>
                                </article>
                            `;
                        }).join('')}
                    </div>
                ` : `
                    <div class="empty-state">
                        <h2>No verses marked yet</h2>
                        <p>Open a prayer and mark its memory verse when you are ready to carry it with you.</p>
                        <a class="button button-primary" href="#explore">Find a verse</a>
                    </div>
                `}
            </section>
        `;
    }

    function renderNotFound() {
        app.innerHTML = `
            <section class="page-heading">
                <div>
                    <span class="eyebrow">Page not found</span>
                    <h1>Let us return home.</h1>
                    <p>The prayer you tried to open could not be found.</p>
                </div>
            </section>
            <div class="empty-state">
                <a class="button button-primary" href="#home">Go to Today With God</a>
            </div>
        `;
    }

    function currentRoute() {
        return window.location.hash.replace(/^#/, '') || 'home';
    }

    function renderRoute() {
        const route = currentRoute();
        const [name, rawValue = ''] = route.split('=');
        const value = decodeURIComponent(rawValue);

        setActiveNav(route);

        if (name === 'home') renderHome();
        else if (name === 'explore') renderExplore();
        else if (name === 'theme') renderExplore(value);
        else if (name === 'prayer') renderPrayer(value);
        else if (name === 'saved') renderSaved();
        else if (name === 'verses') renderVerses();
        else renderNotFound();

        window.scrollTo({ top: 0, behavior: 'auto' });
        app.focus({ preventScroll: true });
    }

    function updateAppearance() {
        const savedAppearance = storage.get(STORAGE_KEYS.appearance, 'light');
        root.dataset.theme = savedAppearance;
        const icon = document.querySelector('[data-theme-icon]');
        if (icon) icon.textContent = savedAppearance === 'dark' ? '☀' : '☾';
    }

    async function sharePrayer(id) {
        const prayer = prayerById(id);
        if (!prayer) return;

        const text = `“${prayer.verse}” — ${prayer.reference}`;
        const url = `${window.location.href.split('#')[0]}#prayer=${encodeURIComponent(prayer.id)}`;

        if (navigator.share) {
            try {
                await navigator.share({ title: prayer.title, text, url });
                return;
            } catch (error) {
                if (error.name === 'AbortError') return;
            }
        }

        try {
            await navigator.clipboard.writeText(`${text}\n${url}`);
            showToast('Verse link copied.');
        } catch (error) {
            showToast('Sharing is not available in this browser.');
        }
    }

    function handleAction(button) {
        const action = button.dataset.action;
        const id = button.dataset.id;

        if (action === 'toggle-theme') {
            const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
            storage.set(STORAGE_KEYS.appearance, next);
            updateAppearance();
            return;
        }

        if (action === 'random') {
            const theme = button.dataset.theme;
            const collection = theme ? state.prayers.filter((prayer) => prayer.theme === theme) : state.prayers;
            const prayer = randomPrayer(collection);
            if (prayer) window.location.hash = `prayer=${encodeURIComponent(prayer.id)}`;
            return;
        }

        if (action === 'save') {
            const added = toggleListItem(STORAGE_KEYS.saved, id);
            showToast(added ? 'Prayer saved.' : 'Prayer removed from saved.');

            if (currentRoute().startsWith('prayer=')) {
                document.querySelectorAll('[data-action="save"]').forEach((item) => {
                    if (item.dataset.id !== id) return;
                    item.classList.toggle('is-active', added);
                    item.textContent = added ? 'Saved' : 'Save prayer';
                });
            } else {
                renderRoute();
            }
            return;
        }

        if (action === 'memorise') {
            const added = toggleListItem(STORAGE_KEYS.memorised, id);
            showToast(added ? 'Verse added to Verses I Carry.' : 'Verse removed.');

            if (currentRoute().startsWith('prayer=')) {
                document.querySelectorAll('[data-action="memorise"]').forEach((item) => {
                    if (item.dataset.id !== id) return;
                    item.classList.toggle('is-active', added);
                    item.textContent = added ? 'Verse memorised' : 'Mark verse memorised';
                });
            } else {
                renderRoute();
            }
            return;
        }

        if (action === 'amen') {
            const count = recordAmen(id);
            button.textContent = `Amen · ${count}`;
            showToast('Amen. Return to this prayer whenever you need it.');
            const stat = app.querySelector('.prayer-side .stat-card:nth-child(2) strong');
            if (stat) stat.textContent = String(count);
            return;
        }

        if (action === 'share') {
            sharePrayer(id);
            return;
        }

        if (action === 'back') {
            if (window.history.length > 1) window.history.back();
            else window.location.hash = 'explore';
            return;
        }

        if (action === 'clear-search') {
            state.search = '';
            state.theme = 'all';
            renderExplore();
        }
    }

    document.addEventListener('click', (event) => {
        const actionButton = event.target.closest('[data-action]');
        if (actionButton) {
            event.preventDefault();
            handleAction(actionButton);
            return;
        }

        const filterButton = event.target.closest('[data-filter]');
        if (filterButton) {
            state.theme = filterButton.dataset.filter;
            renderExplore();
        }
    });

    window.addEventListener('hashchange', renderRoute);

    async function initialise() {
        updateAppearance();

        try {
            const response = await fetch('./data/prayers.json', { cache: 'no-store' });
            if (!response.ok) throw new Error(`Prayer data returned ${response.status}`);
            state.prayers = await response.json();
            renderRoute();
        } catch (error) {
            console.error(error);
            app.innerHTML = `
                <div class="empty-state">
                    <h2>The prayer library could not open.</h2>
                    <p>Please refresh the page. If you opened the files directly from your computer, run them through a local server or GitHub Pages.</p>
                </div>
            `;
        }

        if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('./service-worker.js').catch((error) => {
                    console.warn('Service worker registration failed', error);
                });
            });
        }
    }

    initialise();
})();
