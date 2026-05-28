const htmlElement = document.documentElement;

// Function to set the theme and update the icon
function setTheme(theme) {
    htmlElement.setAttribute('data-bs-theme', theme);
    localStorage.setItem('theme', theme);

    // Update the icon once the DOM is loaded
    const darkModeIcon = document.getElementById('darkModeIcon');
    if (darkModeIcon) {
        if (theme === 'dark') {
            darkModeIcon.className = 'fas fa-sun text-warning'; // Yellow sun for dark mode
        } else {
            darkModeIcon.className = 'fas fa-moon text-light'; // Moon for light mode
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

// Apply the theme immediately to prevent a white flash on load
setTheme(getPreferredTheme());

document.addEventListener("DOMContentLoaded", () => {
    // Re-run setTheme to ensure the correct icon loads on the button
    setTheme(htmlElement.getAttribute('data-bs-theme'));

    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', (e) => {
            e.preventDefault();
            const currentTheme = htmlElement.getAttribute('data-bs-theme');
            setTheme(currentTheme === 'dark' ? 'light' : 'dark');
        });
    }

    // 3. Listen for system-level changes (e.g., user's OS switches at sunset)
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        // Only auto-switch if the user hasn't manually overridden it
        if (!localStorage.getItem('theme')) {
            setTheme(getPreferredTheme());
        }
    });

    const allItems = document.querySelectorAll('.album .video-item');
    const paginationContainers = document.querySelectorAll('.pagination-container');
    const seasonTabs = document.querySelectorAll('.season-tabs-container .nav-link');

    const itemsPerPage = 6;
    let currentPage = 1;
    let currentSeason = '2026';
    let filteredItems = [];

    function updateSeason(season) {
        currentSeason = season;
        currentPage = 1; // Reset to page 1 whenever the season changes

        // 1. Hide EVERYTHING and unload all iframes first
        allItems.forEach(item => {
            item.classList.add('d-none');
            const iframe = item.querySelector('iframe');
            if (iframe && iframe.hasAttribute('src')) {
                iframe.removeAttribute('src');
            }
        });

        // 2. Filter down to only items matching the selected season
        filteredItems = Array.from(allItems).filter(item => item.getAttribute('data-season') === currentSeason);

        // 3. Update the visual state of the Tabs
        seasonTabs.forEach(tab => {
            if (tab.getAttribute('data-target-season') === currentSeason) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });

        // 4. Render the first page of the newly selected season
        renderPage(1);
    }

    function renderPage(page) {
        currentPage = page;
        const start = (page - 1) * itemsPerPage;
        const end = start + itemsPerPage;

        // Loop through filtered items and hide/show based on the current page
        filteredItems.forEach((item, index) => {
            // Find the iframe inside this specific column
            const iframe = item.querySelector('iframe');

            if (index >= start && index < end) {
                item.classList.remove('d-none'); // Show
                // If it has a data-src but no src, it hasn't been loaded yet
                if (iframe && iframe.getAttribute('data-src') && !iframe.getAttribute('src')) {
                    // Inject the URL to trigger the load
                    iframe.setAttribute('src', iframe.getAttribute('data-src'));
                }
            } else {
                item.classList.add('d-none'); // Hide

                // Unload the iframe to stop the video when it's not visible
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

            // Generate "Previous" button
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

            // Generate the page buttons dynamically
            for (let i = 1; i <= totalPages; i++) {
                const li = document.createElement('li');
                li.className = `page-item ${i === currentPage ? 'active' : ''}`;
                const a = document.createElement('a');
                a.className = 'page-link';
                a.href = '#';
                a.textContent = i;
                a.addEventListener('click', (e) => {
                    e.preventDefault(); // Prevents the browser from jumping to the top of the page
                    renderPage(i);
                });
                li.appendChild(a);
                container.appendChild(li);
            }

            // Generate "Next" button
            const nextLi = document.createElement('li');
            nextLi.className = `page-item ${currentPage === totalPages ? 'd-none' : ''}`;
            const nextA = document.createElement('a');
            nextA.className = 'page-link';
            nextA.href = '#';
            nextA.textContent = 'Next';
            nextA.addEventListener('click', (e) => {
                e.preventDefault();
                // Only go forward if we haven't hit the total pages limit
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

    // Initialize the first page on load
    if (allItems.length > 0) {
        updateSeason(currentSeason);
    }
});
