document.addEventListener("DOMContentLoaded", () => {
    // Select all the column divs holding your videos
    const items = document.querySelectorAll('.album .col-4');
    const paginationControls = document.getElementById('pagination-controls');

    // Set how many videos you want per page (6 is exactly two rows)
    const itemsPerPage = 6;
    let currentPage = 1;

    function renderPage(page) {
        currentPage = page;
        const start = (page - 1) * itemsPerPage;
        const end = start + itemsPerPage;

        // Loop through all items and hide/show based on the current page
        items.forEach((item, index) => {
            if (index >= start && index < end) {
                item.classList.remove('d-none'); // Show
            } else {
                item.classList.add('d-none');    // Hide
            }
        });

        renderPaginationControls();
    }

    function renderPaginationControls() {
        const totalPages = Math.ceil(items.length / itemsPerPage);
        paginationControls.innerHTML = ''; // Clear existing links

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
    }

    // Initialize the first page on load
    if (items.length > 0) {
        renderPage(1);
    }
});
