document.addEventListener("DOMContentLoaded", () => {
    // Select all the column divs holding your videos
    const items = document.querySelectorAll('.album .col-12');
    const paginationControls = document.getElementById('pagination-controls');

    const itemsPerPage = 6;
    let currentPage = 1;

    function renderPage(page) {
        currentPage = page;
        const start = (page - 1) * itemsPerPage;
        const end = start + itemsPerPage;

        // Loop through all items and hide/show based on the current page
        items.forEach((item, index) => {
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
        const totalPages = Math.ceil(items.length / itemsPerPage);
        paginationControls.innerHTML = ''; // Clear existing links

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

    // Initialize the first page on load
    if (items.length > 0) {
        renderPage(1);
    }
});
