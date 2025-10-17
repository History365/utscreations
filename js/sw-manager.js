// Service Worker Update Manager
// This script helps manage service worker updates to ensure users always get the latest version

class ServiceWorkerManager {
  constructor() {
    this.registration = null;
    this.updateFoundHandler = this.updateFoundHandler.bind(this);
    this.onControllerChangeHandler = this.onControllerChangeHandler.bind(this);
  }

  // Initialize the service worker manager
  init() {
    if ('serviceWorker' in navigator) {
      // Register the service worker
      window.addEventListener('load', () => {
        this.registerServiceWorker();
      });

      // Listen for controller changes
      navigator.serviceWorker.addEventListener('controllerchange', this.onControllerChangeHandler);
    }
  }

  // Register the service worker
  registerServiceWorker() {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('ServiceWorker registration successful with scope:', registration.scope);
        this.registration = registration;

        // Check if there's an update right away
        this.checkForUpdates();

        // Add update found listener
        registration.addEventListener('updatefound', this.updateFoundHandler);

        // Set up regular update checks
        setInterval(() => this.checkForUpdates(), 60 * 60 * 1000); // Check every hour
      })
      .catch(error => {
        console.error('ServiceWorker registration failed:', error);
      });
  }

  // Handler for when an update is found
  updateFoundHandler() {
    const newWorker = this.registration.installing;
    
    newWorker.addEventListener('statechange', () => {
      if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
        this.showUpdateNotification();
      }
    });
  }

  // Handle controller change events
  onControllerChangeHandler() {
    // This fires when the service worker controlling this page changes
    // e.g. a new service worker has skipped waiting and become active
    console.log('Controller changed - page will reload');
    window.location.reload();
  }

  // Check for service worker updates
  checkForUpdates() {
    if (!this.registration) return;

    this.registration.update()
      .catch(error => {
        console.error('Error checking for service worker updates:', error);
      });
  }

  // Show update notification to user
  showUpdateNotification() {
    // Create update notification element
    const updateNotification = document.createElement('div');
    updateNotification.className = 'update-notification';
    updateNotification.innerHTML = `
      <div class="update-notification-content">
        <p>A new version of the app is available!</p>
        <button id="update-app-btn">Update Now</button>
        <button id="dismiss-update-btn">Later</button>
      </div>
    `;

    // Add to document
    document.body.appendChild(updateNotification);

    // Add event listeners
    document.getElementById('update-app-btn').addEventListener('click', () => {
      this.applyUpdate();
      updateNotification.remove();
    });

    document.getElementById('dismiss-update-btn').addEventListener('click', () => {
      updateNotification.remove();
    });
  }

  // Apply the update
  applyUpdate() {
    if (!this.registration || !this.registration.waiting) return;
    
    // Send message to waiting service worker to skip waiting
    this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
  }
}

// Initialize the service worker manager
const swManager = new ServiceWorkerManager();
swManager.init();

// Export for potential use in other modules
export default swManager;