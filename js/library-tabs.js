// Library page tab navigation functionality
document.addEventListener('DOMContentLoaded', function() {
    // Only run this code when we're on the library page
    if (!window.location.hash.includes('#library')) return;
    
    // Get all vertical navigation items
    const navItems = document.querySelectorAll('.vertical-nav-item');
    
    // Add click event listeners to each nav item
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            // Prevent default hash change behavior
            e.preventDefault();
            
            // Remove active class from all nav items
            navItems.forEach(nav => nav.classList.remove('active'));
            
            // Add active class to clicked nav item
            this.classList.add('active');
            
            // Get the tab parameter from the href attribute
            const href = this.getAttribute('href');
            const tabParam = href.includes('?tab=') ? href.split('?tab=')[1] : 'playlists';
            
            // Update the URL hash without causing page reload
            history.pushState(null, null, href);
            
            // Call function to show the appropriate tab content
            showTabContent(tabParam);
        });
    });
    
    // Function to show the appropriate tab content
    function showTabContent(tabName) {
        // Hide all tab content
        const tabContents = document.querySelectorAll('.library-tab-content');
        tabContents.forEach(tab => tab.classList.remove('active'));
        
        // Show the selected tab content
        const activeTab = document.getElementById(`${tabName}-tab`) || document.getElementById('playlists-tab');
        if (activeTab) {
            activeTab.classList.add('active');
        }
    }
    
    // Initialize the correct tab based on URL hash
    function initializeTab() {
        const hash = window.location.hash;
        const tabParam = hash.includes('?tab=') ? hash.split('?tab=')[1] : 'playlists';
        
        // Set the active navigation item
        const activeNavItem = document.querySelector(`.vertical-nav-item[href="${hash}"]`) || 
                             document.querySelector('.vertical-nav-item[href="#library"]');
        if (activeNavItem) {
            navItems.forEach(nav => nav.classList.remove('active'));
            activeNavItem.classList.add('active');
        }
        
        // Show the appropriate tab content
        showTabContent(tabParam);
    }
    
    // Call the initialization function
    initializeTab();
    
    // Listen for hash changes to update tabs accordingly
    window.addEventListener('hashchange', function() {
        if (window.location.hash.includes('#library')) {
            initializeTab();
        }
    });
});