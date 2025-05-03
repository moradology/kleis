// This is a vanilla JS island that will fetch price/stock/mg data and patch the DOM

// Make sure the code only runs in the browser
if (typeof window !== 'undefined') {
  class LivePriceUpdater extends HTMLElement {
    private interval: number | null = null;
    private productId: string | null = null;
    private priceElement: HTMLElement | null = null;
    private stockElement: HTMLElement | null = null;
    private mgElement: HTMLElement | null = null;

    constructor() {
      super();
      this.productId = this.getAttribute('data-product-id');
    }

    connectedCallback() {
      // Find elements to update
      this.priceElement = document.getElementById(`price-${this.productId}`);
      this.stockElement = document.getElementById(`stock-${this.productId}`);
      this.mgElement = document.getElementById(`mg-${this.productId}`);

      // Initial fetch
      this.fetchAndUpdateData();

      // Set up interval for periodic updates
      this.interval = window.setInterval(() => {
        this.fetchAndUpdateData();
      }, 30000); // Update every 30 seconds
    }

    disconnectedCallback() {
      // Clean up interval when element is removed
      if (this.interval) {
        window.clearInterval(this.interval);
        this.interval = null;
      }
    }

    private async fetchAndUpdateData() {
      if (!this.productId) return;

      try {
        const response = await fetch(`/api/products/${this.productId}/live-data`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.status}`);
        }

        const data = await response.json();
        
        // Update DOM elements if they exist
        if (this.priceElement && data.price) {
          this.priceElement.textContent = `$${data.price.toFixed(2)}`;
          
          // Add animation class to highlight the change
          this.priceElement.classList.add('price-updated');
          setTimeout(() => {
            this.priceElement?.classList.remove('price-updated');
          }, 1000);
        }

        if (this.stockElement && data.stock !== undefined) {
          this.stockElement.textContent = data.stock > 0
            ? `In Stock (${data.stock})`
            : 'Out of Stock';
            
          // Update styling based on stock status
          if (data.stock > 10) {
            this.stockElement.className = 'text-green-500';
          } else if (data.stock > 0) {
            this.stockElement.className = 'text-yellow-500';
          } else {
            this.stockElement.className = 'text-red-500';
          }
        }

        if (this.mgElement && data.mg) {
          this.mgElement.textContent = `${data.mg}mg`;
        }
      } catch (error) {
        console.error('Error fetching live data:', error);
      }
    }
  }

  // Register the custom element
  customElements.define('live-price-updater', LivePriceUpdater);
}

// Export an empty object to make this a valid module
export {};