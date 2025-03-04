import React from 'react';

/**
 * Memory management utilities to prevent memory leaks and improve application stability
 * DEBUG TAG: Memory Management - Version 1.2 (Crash Debugging)
 */

console.log('DEBUG-MEM: Memory management utilities loaded');

/**
 * Monitors memory usage and logs warnings when memory usage is high
 * @param {Function} callback - Optional callback function that receives the memory usage ratio
 * @returns {Function} A cleanup function to stop monitoring
 */
export const monitorMemoryUsage = (callback) => {
  console.log('DEBUG-MEM: Memory monitoring started');
  
  // Only run if performance API is available
  if (!window.performance || !window.performance.memory) {
    console.log('DEBUG-MEM: Performance API not available, memory monitoring disabled');
    return () => {}; // Return empty cleanup function
  }
  
  const memoryWarningThreshold = 0.7; // 70% of available memory
  let intervalId = null;
  
  const checkMemory = () => {
    try {
      const memory = window.performance.memory;
      const usageRatio = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
      
      console.log(`DEBUG-MEM: Memory check - Usage: ${Math.round(usageRatio * 100)}%, ` +
        `Used: ${Math.round(memory.usedJSHeapSize / (1024 * 1024))}MB, ` +
        `Total: ${Math.round(memory.totalJSHeapSize / (1024 * 1024))}MB, ` +
        `Limit: ${Math.round(memory.jsHeapSizeLimit / (1024 * 1024))}MB`);
      
      // Call the callback with the usage ratio if provided
      if (typeof callback === 'function') {
        callback(usageRatio);
      }
      
      if (usageRatio > memoryWarningThreshold) {
        console.warn(
          `DEBUG-MEM: High memory usage detected: ${Math.round(usageRatio * 100)}% of available memory used`,
          `(${Math.round(memory.usedJSHeapSize / (1024 * 1024))}MB / ${Math.round(memory.jsHeapSizeLimit / (1024 * 1024))}MB)`
        );
        
        // If memory usage is very high, force cleanup
        if (usageRatio > 0.85) {
          console.warn('DEBUG-MEM: Critical memory usage, forcing cleanup');
          cleanupMemory();
        }
      }
    } catch (error) {
      console.error('DEBUG-MEM: Error checking memory:', error);
    }
  };
  
  // Check memory usage every 5 seconds instead of 10
  intervalId = setInterval(checkMemory, 5000);
  
  // Run an initial check
  checkMemory();
  
  // Return cleanup function
  return () => {
    console.log('DEBUG-MEM: Memory monitoring stopped');
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  };
};

/**
 * Garbage collection helper - attempts to free memory by removing references
 * Note: This doesn't force garbage collection but helps the GC by removing references
 */
export const cleanupMemory = () => {
  console.log('DEBUG-MEM: Running memory cleanup');
  
  // Log memory before cleanup
  if (window.performance && window.performance.memory) {
    const memory = window.performance.memory;
    console.log(`DEBUG-MEM: Memory before cleanup: ${Math.round(memory.usedJSHeapSize / (1024 * 1024))}MB used`);
  }
  
  // Clear any cached images that might be in memory
  if (window.caches) {
    try {
      console.log('DEBUG-MEM: Clearing image caches');
      caches.keys().then(cacheNames => {
        cacheNames.forEach(cacheName => {
          if (cacheName.includes('image-cache')) {
            caches.delete(cacheName);
          }
        });
      });
    } catch (e) {
      console.error('DEBUG-MEM: Error clearing image caches:', e);
    }
  }
  
  // Clear any unused event listeners
  console.log('DEBUG-MEM: Suggesting garbage collection');
  
  // Log memory after cleanup
  if (window.performance && window.performance.memory) {
    setTimeout(() => {
      const memory = window.performance.memory;
      console.log(`DEBUG-MEM: Memory after cleanup: ${Math.round(memory.usedJSHeapSize / (1024 * 1024))}MB used`);
    }, 100);
  }
};

/**
 * Detects memory leaks by tracking component mount/unmount cycles
 * @param {string} componentName - The name of the component to track
 * @returns {Object} An object with mount and unmount methods
 */
export const createMemoryLeakDetector = (componentName) => {
  console.log(`DEBUG-MEM: Creating memory leak detector for ${componentName}`);
  
  // Only run in development mode
  if (process.env.NODE_ENV !== 'development') {
    return {
      mount: () => {},
      unmount: () => {}
    };
  }
  
  const mountedComponents = new Map();
  
  return {
    mount: () => {
      const timestamp = Date.now();
      const instanceId = `${componentName}_${timestamp}_${Math.random().toString(36).substr(2, 9)}`;
      mountedComponents.set(instanceId, timestamp);
      console.log(`DEBUG-MEM: ${componentName} mounted (${instanceId})`);
      return instanceId;
    },
    unmount: (instanceId) => {
      if (mountedComponents.has(instanceId)) {
        const mountTime = mountedComponents.get(instanceId);
        const lifetimeMs = Date.now() - mountTime;
        console.log(`DEBUG-MEM: ${componentName} unmounted after ${lifetimeMs}ms (${instanceId})`);
        mountedComponents.delete(instanceId);
      } else {
        console.warn(`DEBUG-MEM: Unmount called for unknown instance: ${instanceId}`);
      }
    }
  };
};

/**
 * Optimizes React component rendering by preventing unnecessary re-renders
 * @param {Function} shouldUpdate - Function that determines if component should update
 * @returns {Function} A memoization function
 */
export const optimizeRenders = (shouldUpdate) => {
  console.log('DEBUG-MEM: Optimizing component renders');
  return (Component) => {
    return React.memo(Component, shouldUpdate);
  };
};

/**
 * Limits the number of items in an array to prevent memory issues with large datasets
 * @param {Array} array - The array to limit
 * @param {number} maxItems - Maximum number of items to keep
 * @returns {Array} The limited array
 */
export const limitArraySize = (array, maxItems = 100) => {
  if (!Array.isArray(array)) {
    console.warn('DEBUG-MEM: limitArraySize called with non-array:', array);
    return [];
  }
  
  if (array.length <= maxItems) {
    return array;
  }
  
  console.log(`DEBUG-MEM: Limiting array size from ${array.length} to ${maxItems} items`);
  
  // Keep the most recent items
  return array.slice(array.length - maxItems);
};

/**
 * Adds a global error handler to catch and log unhandled errors
 * @param {Function} callback - Optional callback function that receives the error and info
 * @returns {Function} A cleanup function to remove the handler
 */
export const setupGlobalErrorHandler = (callback) => {
  console.log('DEBUG-MEM: Setting up global error handler');
  
  const errorHandler = (event) => {
    const error = event.error || event.reason || event;
    console.error('DEBUG-MEM: Global error caught:', error);
    
    // Create a timestamp for the error
    const timestamp = new Date().toISOString();
    console.error(`DEBUG-MEM: Error timestamp: ${timestamp}`);
    
    // Get stack trace if available
    if (error && error.stack) {
      console.error('DEBUG-MEM: Error stack:', error.stack);
    }
    
    // Call the callback if provided
    if (typeof callback === 'function') {
      const errorInfo = {
        timestamp,
        type: event.type,
        message: error.message || 'Unknown error',
        componentStack: null
      };
      
      callback(error, errorInfo);
    }
    
    // Log memory usage at time of error
    if (window.performance && window.performance.memory) {
      const memory = window.performance.memory;
      console.error(`DEBUG-MEM: Memory at time of error: ${Math.round(memory.usedJSHeapSize / (1024 * 1024))}MB / ${Math.round(memory.jsHeapSizeLimit / (1024 * 1024))}MB`);
    }
    
    // Force memory cleanup
    cleanupMemory();
  };
  
  // Handle regular errors
  window.addEventListener('error', errorHandler);
  
  // Handle promise rejections
  window.addEventListener('unhandledrejection', errorHandler);
  
  // Return cleanup function
  return () => {
    console.log('DEBUG-MEM: Removing global error handler');
    window.removeEventListener('error', errorHandler);
    window.removeEventListener('unhandledrejection', errorHandler);
  };
}; 