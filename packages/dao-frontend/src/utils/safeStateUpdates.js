import { useRef, useEffect } from 'react';

/**
 * Custom hook to track if a component is mounted
 * @returns {Object} An object with a current property that is true if the component is mounted
 */
export const useIsMounted = () => {
  const isMounted = useRef(true);
  
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  return isMounted;
};

/**
 * Creates a safe state setter function that only updates state if the component is mounted
 * @param {Function} setState - The original setState function
 * @param {Object} isMounted - The ref object from useIsMounted
 * @returns {Function} A safe setState function
 */
export const createSafeStateSetter = (setState, isMounted) => {
  return (...args) => {
    if (isMounted.current) {
      setState(...args);
    }
  };
};

/**
 * Safely executes an async function, ensuring state updates only happen if component is mounted
 * @param {Function} asyncFn - The async function to execute
 * @param {Object} isMounted - The ref object from useIsMounted
 * @param {Function} onError - Optional error handler
 * @returns {Promise} The result of the async function
 */
export const safeAsyncAction = async (asyncFn, isMounted, onError) => {
  try {
    if (!isMounted.current) return null;
    const result = await asyncFn();
    if (!isMounted.current) return null;
    return result;
  } catch (error) {
    console.error('Error in safeAsyncAction:', error);
    if (isMounted.current && onError) {
      onError(error);
    }
    return null;
  }
};

/**
 * Creates a debounced function that delays invoking func until after wait milliseconds
 * @param {Function} func - The function to debounce
 * @param {number} wait - The number of milliseconds to delay
 * @returns {Function} The debounced function
 */
export const debounce = (func, wait) => {
  let timeout;
  
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Creates a throttled function that only invokes func at most once per every limit milliseconds
 * @param {Function} func - The function to throttle
 * @param {number} limit - The number of milliseconds to throttle invocations to
 * @returns {Function} The throttled function
 */
export const throttle = (func, limit) => {
  let inThrottle;
  
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
};

/**
 * Safely cleans up resources when a component unmounts
 * @param {Object} resources - An object containing resources to clean up
 * @returns {Function} A cleanup function to be used in useEffect
 */
export const createCleanupFunction = (resources) => {
  return () => {
    if (resources.intervals) {
      resources.intervals.forEach(interval => clearInterval(interval));
    }
    
    if (resources.timeouts) {
      resources.timeouts.forEach(timeout => clearTimeout(timeout));
    }
    
    if (resources.eventListeners) {
      resources.eventListeners.forEach(({ target, event, listener }) => {
        target.removeEventListener(event, listener);
      });
    }
    
    if (resources.subscriptions) {
      resources.subscriptions.forEach(subscription => {
        if (subscription && typeof subscription.unsubscribe === 'function') {
          subscription.unsubscribe();
        }
      });
    }
    
    if (resources.customCleanup && typeof resources.customCleanup === 'function') {
      resources.customCleanup();
    }
  };
}; 