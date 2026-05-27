document.addEventListener("DOMContentLoaded", () => {
    const allItems = document.querySelectorAll('.album .video-item');
    const paginationControls = document.getElementById('pagination-controls');
    const seasonTabs = document.querySelectorAll('#season-tabs .nav-link');

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
        paginationControls.innerHTML = ''; // Clear existing links

        if (totalPages <= 1) {
            return;
        }

        // Generate "Previous" button
        const prevLi = document.createElement('li');
        // Add Bootstrap's 'disabled' class if we are on the first page
        prevLi.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;

        const prevA = document.createElement('a');
        prevA.className = 'page-link';
        prevA.href = '#';
        prevA.textContent = 'Previous';

        prevA.addEventListener('click', (e) => {
            e.preventDefault();
            // Only go back if we aren't on page 1
            if (currentPage > 1) {
                renderPage(currentPage - 1);
            }
        });

        prevLi.appendChild(prevA);
        paginationControls.appendChild(prevLi);

        // Generate the page buttons dynamically
        for (let i = 1; i <= totalPages; i++) {
            const li = document.createElement('li');
            li.className = `page-item ${i === currentPage ? 'active' : ''}`;

            const a = document.createElement('a');
            a.className = 'page-link';
            a.href = '#';
            a.textContent = i;

            // Listen for clicks to change pages
            a.addEventListener('click', (e) => {
                e.preventDefault(); // Prevents the browser from jumping to the top of the page
                renderPage(i);
            });

            li.appendChild(a);
            paginationControls.appendChild(li);
        }

        // Generate "Next" button
        const nextLi = document.createElement('li');
        // Add Bootstrap's 'disabled' class if we are on the last page
        nextLi.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;

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
        paginationControls.appendChild(nextLi);
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
