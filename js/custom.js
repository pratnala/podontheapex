const htmlElement = document.documentElement;

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

// 1. Check local storage, otherwise check system preferences
function getPreferredTheme() {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme) {
        return storedTheme;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

setTheme(getPreferredTheme());

document.addEventListener("DOMContentLoaded", () => {
    setTheme(htmlElement.getAttribute('data-bs-theme'));

    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', (e) => {
            e.preventDefault();
            const currentTheme = htmlElement.getAttribute('data-bs-theme');
            setTheme(currentTheme === 'dark' ? 'light' : 'dark');
        });
    }

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (!localStorage.getItem('theme')) {
            setTheme(getPreferredTheme());
        }
    });

    const currentPath = window.location.pathname.split('/').pop() || '/';
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link, .dropdown-item');

    navLinks.forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href');
        if (href === currentPath || (currentPath === '/' && (href === 'index.html' || href === '/'))) {
            link.classList.add('active');

            if (link.classList.contains('dropdown-item')) {
                const parentDropdown = link.closest('.dropdown');
                if (parentDropdown) {
                    const dropdownToggle = parentDropdown.querySelector('.dropdown-toggle');
                    if (dropdownToggle) {
                        dropdownToggle.classList.add('active');
                    }
                }
            }
        }
    });

    const videoGrid = document.getElementById('videoGrid');
    if (videoGrid) {
        const targetCategory = videoGrid.getAttribute('data-category');

        fetch('videos.json').then(response => response.json()).then(allVideos => {
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
            initializePagination();
        });
    }

    function initializePagination() {
        const allItems = document.querySelectorAll('.album .video-item');
        const paginationContainers = document.querySelectorAll('.pagination-container');
        const seasonTabs = document.querySelectorAll('.season-tabs-container .nav-link');

        const albumWrapper = document.querySelector('.album');
        const itemsPerPage = albumWrapper && albumWrapper.hasAttribute('data-items-per-page') ? parseInt(albumWrapper.getAttribute('data-items-per-page')) : 6;

        let currentPage = 1;
        let currentSeason = '2026';
        let filteredItems = [];

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
                } else {
                    tab.classList.remove('active');
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
                    item.classList.remove('d-none'); // Show
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

        function renderPaginationControls() {
            const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
            paginationContainers.forEach(container => {
                container.innerHTML = '';

                if (totalPages <= 1) {
                    return;
                }

                const prevLi = document.createElement('li');
                prevLi.className = `page-item ${currentPage === 1 ? 'd-none' : ''}`;
                const prevA = document.createElement('a');
                prevA.className = 'page-link';
                prevA.href = '#';
                prevA.textContent = 'Previous';
                prevA.addEventListener('click', (e) => {
                    e.preventDefault();
                    if (currentPage > 1) {
                        renderPage(currentPage - 1);
                    }
                });
                prevLi.appendChild(prevA);
                container.appendChild(prevLi);

                for (let i = 1; i <= totalPages; i++) {
                    const li = document.createElement('li');
                    li.className = `page-item ${i === currentPage ? 'active' : ''}`;
                    const a = document.createElement('a');
                    a.className = 'page-link';
                    a.href = '#';
                    a.textContent = i;
                    a.addEventListener('click', (e) => {
                        e.preventDefault();
                        renderPage(i);
                    });
                    li.appendChild(a);
                    container.appendChild(li);
                }

                const nextLi = document.createElement('li');
                nextLi.className = `page-item ${currentPage === totalPages ? 'd-none' : ''}`;
                const nextA = document.createElement('a');
                nextA.className = 'page-link';
                nextA.href = '#';
                nextA.textContent = 'Next';
                nextA.addEventListener('click', (e) => {
                    e.preventDefault();
                    if (currentPage < totalPages) {
                        renderPage(currentPage + 1);
                    }
                });
                nextLi.appendChild(nextA);
                container.appendChild(nextLi);
            });
        }

        seasonTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                const targetSeason = tab.getAttribute('data-target-season');
                updateSeason(targetSeason);
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
