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

function setTheme(theme) {
    htmlElement.setAttribute('data-bs-theme', theme);
    localStorage.setItem('theme', theme);

    const darkModeIcon = document.getElementById('darkModeIcon');
    if (darkModeIcon) {
        if (theme === 'dark') {
            darkModeIcon.className = 'fas fa-sun text-warning';
        } else {
            darkModeIcon.className = 'fas fa-moon text-light';
        }
    }
}

function getPreferredTheme() {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme) {
        return storedTheme;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

setTheme(getPreferredTheme());

document.addEventListener("DOMContentLoaded", () => {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (!localStorage.getItem('theme')) {
            setTheme(getPreferredTheme());
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

    const videoGrid = document.getElementById('videoGrid');
    if (videoGrid) {
        const targetCategory = videoGrid.getAttribute('data-category');

        fetch('/videos.json').then(response => response.json()).then(allVideos => {
            allVideos.sort((a, b) => new Date(b.date) - new Date(a.date));
            videoGrid.innerHTML = '';
            const pageVideos = allVideos.filter(video => video.categories.includes(targetCategory));
            pageVideos.forEach(video => {
                const shortCategories = ['history', 'instant-reaction', 'short'];
                const isShort = shortCategories.includes(targetCategory);
                const colClasses = isShort ? 'col-6 col-md-4 col-lg-3' : 'col-12 col-md-6 col-lg-4';
                const iFrameClass = isShort ? 'short-video' : '';
                const videoCard = `
                    <div class="${colClasses} video-item" data-season="${video.season}">
                        <div class="card border-0 shadow-none text-center">
                            <iframe loading="lazy" class="${iFrameClass}" data-src="https://www.youtube.com/embed/${video.id}" title="${video.title}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
                            <div class="card-body">
                                <p class="card-text">${video.title}</p>
                            </div>
                        </div>
                    </div>
                `;
                videoGrid.insertAdjacentHTML('beforeend', videoCard);
            });
            const seasonTabContainers = document.querySelectorAll('.season-tabs-container');
            const uniqueSeasons = [...new Set(pageVideos.map(v => v.season))].sort((a, b) => b - a);
            if (uniqueSeasons.length > 0) {
                seasonTabContainers.forEach(container => {
                    container.innerHTML = '';
                    uniqueSeasons.forEach(season => {
                        const li = `
                            <li class="nav-item">
                                <button class="nav-link" type="button" data-target-season="${season}">Season ${season}</button>
                            </li>
                        `;
                        container.insertAdjacentHTML('beforeend', li);
                    });
                });
            }
            const defaultSeason = uniqueSeasons.length > 0 ? uniqueSeasons[0] : new Date().getFullYear().toString();
            initializePagination(defaultSeason);
        });
    }

    function initializePagination(defaultSeason) {
        const allItems = document.querySelectorAll('.album .video-item');
        const paginationContainers = document.querySelectorAll('.pagination-container');
        const seasonTabs = document.querySelectorAll('.season-tabs-container .nav-link');

        const albumWrapper = document.querySelector('.album');
        const itemsPerPage = albumWrapper && albumWrapper.hasAttribute('data-items-per-page') ? parseInt(albumWrapper.getAttribute('data-items-per-page')) : 6;

        let currentPage = 1;
        let currentSeason = defaultSeason;
        let filteredItems = [];

        function scrollToGrid() {
            const grid = document.getElementById('videoGrid');
            if (grid && grid.getBoundingClientRect().top < 0) {
                grid.scrollIntoView();
            }
        }

        function updateSeason(season) {
            currentSeason = season;
            currentPage = 1;

            allItems.forEach(item => {
                item.classList.add('d-none');
                const iframe = item.querySelector('iframe');
                if (iframe && iframe.hasAttribute('src')) {
                    iframe.removeAttribute('src');
                }
            });

            filteredItems = Array.from(allItems).filter(item => item.getAttribute('data-season') === currentSeason);

            seasonTabs.forEach(tab => {
                if (tab.getAttribute('data-target-season') === currentSeason) {
                    tab.classList.add('active');
                    tab.setAttribute('aria-pressed', 'true');
                } else {
                    tab.classList.remove('active');
                    tab.setAttribute('aria-pressed', 'false');
                }
            });

            renderPage(1);
        }

        function renderPage(page) {
            currentPage = page;
            const start = (page - 1) * itemsPerPage;
            const end = start + itemsPerPage;

            filteredItems.forEach((item, index) => {
                const iframe = item.querySelector('iframe');

                if (index >= start && index < end) {
                    item.classList.remove('d-none');
                    if (iframe && iframe.getAttribute('data-src') && !iframe.getAttribute('src')) {
                        iframe.setAttribute('src', iframe.getAttribute('data-src'));
                    }
                } else {
                    item.classList.add('d-none');
                    if (iframe && iframe.hasAttribute('src')) {
                        iframe.removeAttribute('src');
                    }
                }
            });

            renderPaginationControls();
        }

        function createPageButton(label, onClick) {
            const button = document.createElement('button');
            button.className = 'page-link';
            button.type = 'button';
            button.textContent = label;
            button.addEventListener('click', onClick);
            return button;
        }

        function renderPaginationControls() {
            const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
            paginationContainers.forEach(container => {
                container.innerHTML = '';

                if (totalPages <= 1) {
                    return;
                }

                const prevLi = document.createElement('li');
                prevLi.className = `page-item ${currentPage === 1 ? 'd-none' : ''}`;
                prevLi.appendChild(createPageButton('Previous', () => {
                    if (currentPage > 1) {
                        renderPage(currentPage - 1);
                        scrollToGrid();
                    }
                }));
                container.appendChild(prevLi);

                for (let i = 1; i <= totalPages; i++) {
                    const li = document.createElement('li');
                    li.className = `page-item ${i === currentPage ? 'active' : ''}`;
                    const button = createPageButton(i, () => {
                        renderPage(i);
                        scrollToGrid();
                    });
                    if (i === currentPage) {
                        button.setAttribute('aria-current', 'page');
                    }
                    li.appendChild(button);
                    container.appendChild(li);
                }

                const nextLi = document.createElement('li');
                nextLi.className = `page-item ${currentPage === totalPages ? 'd-none' : ''}`;
                nextLi.appendChild(createPageButton('Next', () => {
                    if (currentPage < totalPages) {
                        renderPage(currentPage + 1);
                        scrollToGrid();
                    }
                }));
                container.appendChild(nextLi);
            });
        }

        seasonTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetSeason = tab.getAttribute('data-target-season');
                updateSeason(targetSeason);
                scrollToGrid();
            });
        });

        if (allItems.length > 0) {
            if (seasonTabs.length > 0) {
                updateSeason(currentSeason);
            } else {
                filteredItems = Array.from(allItems);
                renderPage(1);
            }
        }
    }
});
