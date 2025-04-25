// enhanced-dashboard.js

document.addEventListener('DOMContentLoaded', function() {
    const greetingElement = document.getElementById("greeting");
    const totalMaterialsElement = document.getElementById("total-materials");
    const totalDownloadsElement = document.getElementById("total-downloads");
    const recentUploadsList = document.getElementById("recent-uploads-list");
    const mobileMenuButton = document.querySelector('.mobile-menu-button');
    const bodyElement = document.body;
    const asideElement = document.querySelector('aside');
    const mainElement = document.querySelector('main');

    let totalMaterials = 65; // Example updated value
    let totalDownloads = 150; // Example updated value
    let recentUploads = ["new_document_1.pdf", "research_paper_2.docx", "presentation_3.pptx"]; // Example updated uploads

    function updateGreeting() {
        const hour = new Date().getHours();
        let greeting = "Good morning!";
        if (hour >= 12 && hour < 18) {
            greeting = "Good afternoon!";
        } else if (hour >= 18) {
            greeting = "Good evening!";
        }
        if (greetingElement) {
            greetingElement.textContent = greeting;
        }
    }

    function updateTotalMaterials(count) {
        totalMaterials = count;
        if (totalMaterialsElement) {
            totalMaterialsElement.textContent = totalMaterials;
        }
    }

    function updateTotalDownloads(count) {
        totalDownloads = count;
        if (totalDownloadsElement) {
            totalDownloadsElement.textContent = totalDownloads;
        }
    }

    function updateRecentUploads(uploads) {
        recentUploads = uploads;
        if (recentUploadsList) {
            recentUploadsList.innerHTML = ''; // Clear previous uploads
            if (recentUploads.length > 0) {
                recentUploads.forEach(file => {
                    const listItem = document.createElement("li");
                    const link = document.createElement("a");
                    link.href = "#"; // You can add specific links later
                    link.textContent = file;
                    listItem.appendChild(link);
                    recentUploadsList.appendChild(listItem);
                });
            } else {
                const listItem = document.createElement("li");
                listItem.innerHTML = '<a href="#">No recent uploads</a>';
                recentUploadsList.appendChild(listItem);
            }
        }
    }

    // Initialize dashboard data
    updateGreeting();
    updateTotalMaterials(totalMaterials);
    updateTotalDownloads(totalDownloads);
    updateRecentUploads(recentUploads);

    // Mobile menu toggle functionality
    if (mobileMenuButton && bodyElement && asideElement && mainElement) {
        mobileMenuButton.addEventListener('click', () => {
            bodyElement.classList.toggle('mobile-menu-open');
        });
    }

    // --- Optional Enhancements (for smoother UI/UX) ---

    // Add subtle animations on page load for elements
    const overviewCards = document.querySelectorAll('.overview-card');
    overviewCards.forEach((card, index) => {
        card.style.opacity = 0;
        card.style.transform = 'translateY(20px)';
        setTimeout(() => {
            card.style.opacity = 1;
            card.style.transform = 'translateY(0)';
            card.style.transition = 'opacity 0.3s ease-in-out, transform 0.3s ease-in-out';
        }, 100 * (index + 1));
    });

    const dashboardSections = document.querySelectorAll('.dashboard-section');
    dashboardSections.forEach((section, index) => {
        section.style.opacity = 0;
        section.style.transform = 'translateX(-20px)';
        setTimeout(() => {
            section.style.opacity = 1;
            section.style.transform = 'translateX(0)';
            section.style.transition = 'opacity 0.3s ease-in-out, transform 0.3s ease-in-out';
        }, 200 * (index + 1));
    });

    // Consider adding a "scroll to top" button for better navigation on long pages
    function scrollToTop() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // You could dynamically add a button like this:
    // const topButton = document.createElement('button');
    // topButton.textContent = '↑ Top';
    // topButton.classList.add('scroll-top-button'); // Add some styling in your CSS
    // topButton.addEventListener('click', scrollToTop);
    // document.body.appendChild(topButton);

    // Basic debouncing function (for search functionality if you add it later)
    function debounce(func, delay) {
        let timeoutId;
        return function(...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                func.apply(this, args);
            }, delay);
        };
    }

    // Example of using debounce (if you had an input field with ID "search-input"):
    // const searchInput = document.getElementById('search-input');
    // if (searchInput) {
    //     searchInput.addEventListener('input', debounce(function() {
    //         console.log('Searching for:', this.value);
    //         // Your search logic here
    //     }, 300));
    // }

    // You can add more interactive elements and animations as needed.
});

// --- Instructions for linking externally ---
// 1. Save this code as a .js file (e.g., "enhanced-dashboard.js").
// 2. Link this file in the <head> or before the closing </body> tag of your HTML file:
//    <script src="enhanced-dashboard.js"></script>