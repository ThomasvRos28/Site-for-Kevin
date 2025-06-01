import axios from 'axios';
import { PurchaseOrder, Ticket, MaterialType, UnitOfMeasure } from '../types';

class SyncService {
  private static instance: SyncService;
  private syncQueue: any[] = [];
  private isOnline: boolean = true;
  private lastSyncTimestamp: number = 0;
  private readonly SYNC_INTERVAL = 5 * 60 * 1000; // 5 minutes

  private constructor() {
    // Initialize online status monitoring
    window.addEventListener('online', this.handleOnlineStatus.bind(this));
    window.addEventListener('offline', this.handleOnlineStatus.bind(this));
    
    // Start periodic sync
    setInterval(this.syncData.bind(this), this.SYNC_INTERVAL);
  }

  public static getInstance(): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService();
    }
    return SyncService.instance;
  }

  private handleOnlineStatus() {
    this.isOnline = navigator.onLine;
    if (this.isOnline) {
      this.syncData();
    }
  }

  // Queue data for sync when offline
  public queueForSync(data: any, type: string) {
    this.syncQueue.push({
      data,
      type,
      timestamp: Date.now()
    });
    this.saveQueueToStorage();
  }

  // Save queue to localStorage
  private saveQueueToStorage() {
    localStorage.setItem('syncQueue', JSON.stringify(this.syncQueue));
  }

  // Load queue from localStorage
  private loadQueueFromStorage() {
    const queue = localStorage.getItem('syncQueue');
    if (queue) {
      this.syncQueue = JSON.parse(queue);
    }
  }

  // Sync all pending data
  private async syncData() {
    if (!this.isOnline) return;

    this.loadQueueFromStorage();
    const queue = [...this.syncQueue];
    this.syncQueue = [];

    for (const item of queue) {
      try {
        switch (item.type) {
          case 'ticket':
            await this.syncTicket(item.data);
            break;
          case 'po':
            await this.syncPurchaseOrder(item.data);
            break;
          // Add other sync types as needed
        }
      } catch (error) {
        console.error(`Failed to sync ${item.type}:`, error);
        this.syncQueue.push(item); // Put back in queue if sync fails
      }
    }

    this.saveQueueToStorage();
    this.lastSyncTimestamp = Date.now();
  }

  // Sync individual ticket
  private async syncTicket(ticket: Ticket) {
    try {
      await axios.post('/api/tickets/sync', ticket);
    } catch (error) {
      throw new Error('Failed to sync ticket');
    }
  }

  // Sync purchase order
  private async syncPurchaseOrder(po: PurchaseOrder) {
    try {
      await axios.post('/api/purchaseorders/sync', po);
    } catch (error) {
      throw new Error('Failed to sync purchase order');
    }
  }

  // Export all data
  public async exportData() {
    try {
      const response = await axios.get('/api/export/all', {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `export-${new Date().toISOString()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Export failed:', error);
      throw new Error('Failed to export data');
    }
  }

  // Get rates
  public async getRates() {
    try {
      const response = await axios.get('/api/rates');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch rates:', error);
      throw new Error('Failed to fetch rates');
    }
  }
}

export default SyncService; 