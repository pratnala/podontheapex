const htmlElement = document.documentElement;

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.min.js')
            .then(registration => {
                console.log('ServiceWorker registered successfully with scope: ', registration.scope);
            })
            .catch(error => {
                console.log('ServiceWorker registration failed: ', error);
            });
    });
}

function applyTheme(theme) {
    htmlElement.setAttribute('data-bs-theme', theme);
}

// Only a press of the toggle is saved, so the site keeps following the system theme until then
function setTheme(theme) {
    applyTheme(theme);
    localStorage.setItem('theme', theme);
}

function getPreferredTheme() {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme) {
        return storedTheme;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

applyTheme(getPreferredTheme());

document.addEventListener("DOMContentLoaded", () => {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (!localStorage.getItem('theme')) {
            applyTheme(getPreferredTheme());
        }
    });

    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', () => {
            const currentTheme = htmlElement.getAttribute('data-bs-theme');
            setTheme(currentTheme === 'dark' ? 'light' : 'dark');
        });
    }

    const mainNav = document.getElementById('mainNav');
    if (mainNav) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                mainNav.classList.add('scrolled');
            } else {
                mainNav.classList.remove('scrolled');
            }
        });
    }

    function playVideo(link) {
        const iframe = document.createElement('iframe');
        iframe.src = `https://www.youtube.com/embed/${link.getAttribute('data-video-id')}?autoplay=1`;
        iframe.title = link.getAttribute('data-video-title');
        iframe.className = link.classList.contains('short-video') ? 'short-video' : '';
        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
        iframe.referrerPolicy = 'strict-origin-when-cross-origin';
        iframe.allowFullscreen = true;
        iframe.videoLink = link;
        link.replaceWith(iframe);
    }

    document.addEventListener('click', e => {
        // A button that plays a player elsewhere on the page; once that player is playing, it opens YouTube
        const trigger = e.target.closest('[data-play]');
        const target = trigger && document.getElementById(trigger.getAttribute('data-play'));
        if (target) {
            e.preventDefault();
            playVideo(target);
            return;
        }

        const link = e.target.closest('[data-video-id]');
        if (link) {
            e.preventDefault();
            playVideo(link);
        }
    });

    const videoGrid = document.getElementById('videoGrid');
    if (videoGrid) {
        const albumWrapper = document.querySelector('.album');
        const itemsPerPage = parseInt(albumWrapper.getAttribute('data-items-per-page'));
        const allItems = Array.from(videoGrid.querySelectorAll('.video-item'));
        const paginationContainers = document.querySelectorAll('.pagination-container');
        const seasonTabs = document.querySelectorAll('.season-tabs-container .nav-link');
        const seasons = [...new Set(Array.from(seasonTabs).map(tab => tab.getAttribute('data-target-season')))];
        const defaultSeason = seasons[0];

        let currentPage = 1;
        let currentSeason = defaultSeason;
        let filteredItems = allItems;

        function scrollToGrid() {
            if (videoGrid.getBoundingClientRect().top < 0) {
                videoGrid.scrollIntoView();
            }
        }

        function stopVideo(item) {
            const iframe = item.querySelector('iframe');
            if (iframe) {
                iframe.replaceWith(iframe.videoLink);
            }
        }

        function getStateFromUrl() {
            const params = new URLSearchParams(window.location.search);
            const season = params.get('season');
            return {
                season: seasons.includes(season) ? season : defaultSeason,
                page: parseInt(params.get('page')) || 1
            };
        }

        function updateUrl() {
            const params = new URLSearchParams();
            if (currentSeason !== defaultSeason) {
                params.set('season', currentSeason);
            }
            if (currentPage > 1) {
                params.set('page', currentPage);
            }
            const query = params.toString();
            window.history.pushState(null, '', query ? `?${query}` : window.location.pathname);
        }

        function render(season, page) {
            currentSeason = season;
            filteredItems = season ? allItems.filter(item => item.getAttribute('data-season') === season) : allItems;
            const totalPages = Math.max(Math.ceil(filteredItems.length / itemsPerPage), 1);
            currentPage = Math.min(Math.max(page, 1), totalPages);

            const start = (currentPage - 1) * itemsPerPage;
            const visibleItems = filteredItems.slice(start, start + itemsPerPage);
            allItems.forEach(item => {
                const visible = visibleItems.includes(item);
                item.classList.toggle('d-none', !visible);
                if (!visible) {
                    stopVideo(item);
                }
            });

            seasonTabs.forEach(tab => {
                const active = tab.getAttribute('data-target-season') === currentSeason;
                tab.classList.toggle('active', active);
                tab.setAttribute('aria-pressed', active ? 'true' : 'false');
            });

            renderPaginationControls(totalPages);
        }

        function goTo(season, page) {
            render(season, page);
            updateUrl();
            scrollToGrid();
        }

        function createPageButton(label, onClick) {
            const button = document.createElement('button');
            button.className = 'page-link';
            button.type = 'button';
            button.textContent = label;
            button.addEventListener('click', onClick);
            return button;
        }

        function renderPaginationControls(totalPages) {
            paginationContainers.forEach(container => {
                container.innerHTML = '';

                if (totalPages <= 1) {
                    return;
                }

                const prevLi = document.createElement('li');
                prevLi.className = `page-item ${currentPage === 1 ? 'd-none' : ''}`;
                prevLi.appendChild(createPageButton('Previous', () => goTo(currentSeason, currentPage - 1)));
                container.appendChild(prevLi);

                for (let i = 1; i <= totalPages; i++) {
                    const li = document.createElement('li');
                    li.className = `page-item ${i === currentPage ? 'active' : ''}`;
                    const button = createPageButton(i, () => goTo(currentSeason, i));
                    if (i === currentPage) {
                        button.setAttribute('aria-current', 'page');
                    }
                    li.appendChild(button);
                    container.appendChild(li);
                }

                const nextLi = document.createElement('li');
                nextLi.className = `page-item ${currentPage === totalPages ? 'd-none' : ''}`;
                nextLi.appendChild(createPageButton('Next', () => goTo(currentSeason, currentPage + 1)));
                container.appendChild(nextLi);
            });
        }

        seasonTabs.forEach(tab => {
            tab.addEventListener('click', () => goTo(tab.getAttribute('data-target-season'), 1));
        });

        window.addEventListener('popstate', () => {
            const { season, page } = getStateFromUrl();
            render(season, page);
        });

        const { season, page } = getStateFromUrl();
        render(season, page);
    }
});
