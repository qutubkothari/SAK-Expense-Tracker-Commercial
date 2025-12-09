// TEMPORARY FIX: Clear IndexedDB cache
// Run this in the browser console (F12) to clear cached data

console.log('Clearing IndexedDB cache...');

// Delete the entire IndexedDB
indexedDB.deleteDatabase('ExpenseTrackerDB').onsuccess = () => {
  console.log('✅ IndexedDB cleared!');
  console.log('Now refresh the page (Ctrl+Shift+R)');
  alert('Cache cleared! Please refresh the page now.');
};

// Alternative: Clear localStorage too
localStorage.clear();
sessionStorage.clear();

console.log('✅ All caches cleared! Refresh the page.');
