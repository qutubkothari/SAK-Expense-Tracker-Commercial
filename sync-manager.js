// Offline-First Sync Manager with IndexedDB and Supabase
class SyncManager {
  constructor() {
    this.isOnline = navigator.onLine;
    this.isSyncing = false;
    this.syncQueue = [];
    this.db = null;
    this.dbName = 'ExpenseTrackerDB';
    this.dbVersion = 4; // Incremented to force cache refresh after business categories update
    
    // Listen for online/offline events
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());
    
    this.initDB();
  }

  // Initialize IndexedDB
  async initDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        console.log('✅ IndexedDB initialized');
        this.loadSyncQueue();
        resolve(this.db);
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        const oldVersion = event.oldVersion;
        
        // Create object stores for offline data
        if (!db.objectStoreNames.contains('expenses')) {
          const expenseStore = db.createObjectStore('expenses', { keyPath: 'id' });
          expenseStore.createIndex('user_id', 'user_id', { unique: false });
          expenseStore.createIndex('date', 'date', { unique: false });
        }
        
        // For version 4 upgrade: Clear categories cache to force fresh load of business categories
        if (oldVersion < 4 && db.objectStoreNames.contains('categories')) {
          const transaction = event.target.transaction;
          const categoriesStore = transaction.objectStore('categories');
          categoriesStore.clear();
          console.log('🔄 Categories cache cleared for business categories refresh');
        }
        
        if (!db.objectStoreNames.contains('categories')) {
          db.createObjectStore('categories', { keyPath: 'id' });
        }
        
        // For version 4 upgrade: Clear subcategories cache to force fresh load of business subcategories
        if (oldVersion < 4 && db.objectStoreNames.contains('subcategories')) {
          const transaction = event.target.transaction;
          const subcatStore = transaction.objectStore('subcategories');
          subcatStore.clear();
          console.log('🔄 Subcategories cache cleared for business categories refresh');
        }
        
        if (!db.objectStoreNames.contains('subcategories')) {
          const subcatStore = db.createObjectStore('subcategories', { keyPath: 'id' });
          subcatStore.createIndex('category_id', 'category_id', { unique: false });
        }
        
        if (!db.objectStoreNames.contains('budgets')) {
          const budgetStore = db.createObjectStore('budgets', { keyPath: 'id' });
          budgetStore.createIndex('user_id', 'user_id', { unique: false });
        }
        
        if (!db.objectStoreNames.contains('syncQueue')) {
          const queueStore = db.createObjectStore('syncQueue', { keyPath: 'queueId', autoIncrement: true });
          queueStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
        
        console.log('✅ IndexedDB schema created');
      };
    });
  }

  // Check if online
  checkOnline() {
    return this.isOnline;
  }

  // Handle going online
  async handleOnline() {
    console.log('🌐 Back online - starting sync...');
    this.isOnline = true;
    this.updateSyncStatus('online');
    await this.syncToCloud();
  }

  // Handle going offline
  handleOffline() {
    console.log('📴 Gone offline - switching to local storage');
    this.isOnline = false;
    this.updateSyncStatus('offline');
  }

  // Update UI sync status indicator
  updateSyncStatus(status) {
    const indicator = document.getElementById('syncStatus');
    if (!indicator) return;
    
    if (status === 'online') {
      indicator.innerHTML = '<i class="fas fa-cloud-upload-alt"></i> Online';
      indicator.className = 'sync-status online';
    } else if (status === 'offline') {
      indicator.innerHTML = '<i class="fas fa-cloud-download-alt"></i> Offline';
      indicator.className = 'sync-status offline';
    } else if (status === 'syncing') {
      indicator.innerHTML = '<i class="fas fa-sync fa-spin"></i> Syncing...';
      indicator.className = 'sync-status syncing';
    }
  }

  // Add operation to sync queue
  async queueOperation(operation) {
    const queueItem = {
      ...operation,
      timestamp: new Date().toISOString(),
      retries: 0
    };
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['syncQueue'], 'readwrite');
      const store = transaction.objectStore('syncQueue');
      const request = store.add(queueItem);
      
      request.onsuccess = () => {
        console.log('📝 Operation queued:', operation.type, operation.table);
        resolve(request.result);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Load sync queue from IndexedDB
  async loadSyncQueue() {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['syncQueue'], 'readonly');
      const store = transaction.objectStore('syncQueue');
      const request = store.getAll();
      
      request.onsuccess = () => {
        this.syncQueue = request.result || [];
        console.log(`📋 Loaded ${this.syncQueue.length} pending operations`);
        resolve(this.syncQueue);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Sync all pending operations to cloud
  async syncToCloud() {
    if (this.isSyncing || !this.isOnline || this.syncQueue.length === 0) return;
    
    this.isSyncing = true;
    this.updateSyncStatus('syncing');
    
    console.log(`🔄 Syncing ${this.syncQueue.length} operations...`);
    
    const transaction = this.db.transaction(['syncQueue'], 'readwrite');
    const store = transaction.objectStore('syncQueue');
    
    for (const item of this.syncQueue) {
      try {
        await this.executeSyncOperation(item);
        
        // Remove from queue after successful sync
        store.delete(item.queueId);
        console.log('✅ Synced:', item.type, item.table);
      } catch (error) {
        console.error('❌ Sync failed:', error);
        
        // Increment retry count
        item.retries++;
        if (item.retries < 3) {
          store.put(item);
        } else {
          console.error('❌ Max retries reached, removing from queue:', item);
          store.delete(item.queueId);
        }
      }
    }
    
    await this.loadSyncQueue();
    this.isSyncing = false;
    this.updateSyncStatus('online');
    
    console.log('✅ Sync complete!');
    
    // Trigger a full refresh from cloud
    if (window.loadExpenses) {
      await window.loadExpenses();
    }
  }

  // Execute a single sync operation
  async executeSyncOperation(item) {
    if (!window.supabase) throw new Error('Supabase not initialized');
    
    const { type, table, data, id } = item;
    
    switch (type) {
      case 'insert':
        const { error: insertError } = await window.supabase
          .from(table)
          .insert(data);
        if (insertError) throw insertError;
        break;
        
      case 'update':
        const { error: updateError } = await window.supabase
          .from(table)
          .update(data)
          .eq('id', id);
        if (updateError) throw updateError;
        break;
        
      case 'delete':
        const { error: deleteError } = await window.supabase
          .from(table)
          .delete()
          .eq('id', id);
        if (deleteError) throw deleteError;
        break;
        
      default:
        throw new Error(`Unknown operation type: ${type}`);
    }
  }

  // Generic CRUD operations with offline support
  async insert(table, data) {
    // Always save locally first
    await this.saveLocal(table, data);
    
    if (this.isOnline) {
      try {
        // Try to save to cloud immediately
        const { error } = await window.supabase.from(table).insert(data);
        if (error) throw error;
        console.log('✅ Saved to cloud:', table);
      } catch (error) {
        console.log('⚠️ Cloud save failed, queuing for later sync');
        await this.queueOperation({ type: 'insert', table, data });
      }
    } else {
      // Queue for sync when online
      await this.queueOperation({ type: 'insert', table, data });
    }
    
    return data;
  }

  async update(table, id, data) {
    // Update locally first
    await this.updateLocal(table, id, data);
    
    if (this.isOnline) {
      try {
        const { error } = await window.supabase
          .from(table)
          .update(data)
          .eq('id', id);
        if (error) throw error;
        console.log('✅ Updated in cloud:', table);
      } catch (error) {
        console.log('⚠️ Cloud update failed, queuing for later sync');
        await this.queueOperation({ type: 'update', table, data, id });
      }
    } else {
      await this.queueOperation({ type: 'update', table, data, id });
    }
    
    return data;
  }

  async delete(table, id) {
    // Delete locally first
    await this.deleteLocal(table, id);
    
    if (this.isOnline) {
      try {
        const { error } = await window.supabase
          .from(table)
          .delete()
          .eq('id', id);
        if (error) throw error;
        console.log('✅ Deleted from cloud:', table);
      } catch (error) {
        console.log('⚠️ Cloud delete failed, queuing for later sync');
        await this.queueOperation({ type: 'delete', table, id });
      }
    } else {
      await this.queueOperation({ type: 'delete', table, id });
    }
  }

  async getAll(table, userId = null) {
    if (this.isOnline) {
      try {
        // Try to fetch from cloud first
        let query = window.supabase.from(table).select('*');
        if (userId) query = query.eq('user_id', userId);
        
        const { data, error } = await query;
        if (error) throw error;
        
        // Update local cache
        await this.saveAllLocal(table, data);
        return data;
      } catch (error) {
        console.log('⚠️ Cloud fetch failed, using local data');
        return await this.getAllLocal(table, userId);
      }
    } else {
      // Use local data when offline
      return await this.getAllLocal(table, userId);
    }
  }

  // Local IndexedDB operations
  async saveLocal(table, data) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([table], 'readwrite');
      const store = transaction.objectStore(table);
      const request = store.put(data);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async saveAllLocal(table, dataArray) {
    const transaction = this.db.transaction([table], 'readwrite');
    const store = transaction.objectStore(table);
    
    // Clear existing data
    store.clear();
    
    // Add all new data
    for (const item of dataArray) {
      store.put(item);
    }
    
    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  async updateLocal(table, id, data) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([table], 'readwrite');
      const store = transaction.objectStore(table);
      const getRequest = store.get(id);
      
      getRequest.onsuccess = () => {
        const existing = getRequest.result;
        const updated = { ...existing, ...data };
        const putRequest = store.put(updated);
        
        putRequest.onsuccess = () => resolve(updated);
        putRequest.onerror = () => reject(putRequest.error);
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async deleteLocal(table, id) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([table], 'readwrite');
      const store = transaction.objectStore(table);
      const request = store.delete(id);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getAllLocal(table, userId = null) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([table], 'readonly');
      const store = transaction.objectStore(table);
      const request = store.getAll();
      
      request.onsuccess = () => {
        let results = request.result || [];
        if (userId && results.length > 0) {
          results = results.filter(item => item.user_id === userId);
        }
        resolve(results);
      };
      request.onerror = () => reject(request.error);
    });
  }
}

// Initialize global sync manager
window.syncManager = new SyncManager();
console.log('✅ Sync Manager initialized');
