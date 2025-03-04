import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * DebugOverlay Component - Displays real-time debugging information
 * This component is only active in development mode
 */
const DebugOverlay = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [logs, setLogs] = useState([]);
  const [memoryUsage, setMemoryUsage] = useState(null);
  const location = useLocation();
  const logsRef = useRef([]);
  const maxLogs = 50; // Maximum number of logs to keep
  
  // Toggle visibility with keyboard shortcut (Ctrl+Shift+D)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        setIsVisible(prev => !prev);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  // Monitor memory usage
  useEffect(() => {
    if (!isVisible) return;
    
    const checkMemory = () => {
      if (window.performance && window.performance.memory) {
        const memory = window.performance.memory;
        setMemoryUsage({
          used: Math.round(memory.usedJSHeapSize / (1024 * 1024)),
          total: Math.round(memory.totalJSHeapSize / (1024 * 1024)),
          limit: Math.round(memory.jsHeapSizeLimit / (1024 * 1024)),
          percentage: Math.round((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100)
        });
      }
    };
    
    checkMemory();
    const intervalId = setInterval(checkMemory, 2000);
    
    return () => clearInterval(intervalId);
  }, [isVisible]);
  
  // Intercept console logs
  useEffect(() => {
    if (!isVisible) return;
    
    // Store original console methods
    const originalConsole = {
      log: console.log,
      warn: console.warn,
      error: console.error
    };
    
    // Override console methods
    console.log = (...args) => {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
      ).join(' ');
      
      if (message.startsWith('DEBUG-')) {
        addLog({ type: 'log', message, timestamp: new Date() });
      }
      
      originalConsole.log(...args);
    };
    
    console.warn = (...args) => {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
      ).join(' ');
      
      if (message.startsWith('DEBUG-')) {
        addLog({ type: 'warn', message, timestamp: new Date() });
      }
      
      originalConsole.warn(...args);
    };
    
    console.error = (...args) => {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
      ).join(' ');
      
      if (message.startsWith('DEBUG-')) {
        addLog({ type: 'error', message, timestamp: new Date() });
      }
      
      originalConsole.error(...args);
    };
    
    // Restore original console on cleanup
    return () => {
      console.log = originalConsole.log;
      console.warn = originalConsole.warn;
      console.error = originalConsole.error;
    };
  }, [isVisible]);
  
  // Add log to state
  const addLog = (log) => {
    logsRef.current = [log, ...logsRef.current].slice(0, maxLogs);
    setLogs(logsRef.current);
  };
  
  // Clear logs
  const clearLogs = () => {
    logsRef.current = [];
    setLogs([]);
  };
  
  // Log route changes
  useEffect(() => {
    if (isVisible) {
      addLog({ 
        type: 'log', 
        message: `DEBUG-NAV: Route changed to ${location.pathname}`,
        timestamp: new Date()
      });
    }
  }, [location.pathname, isVisible]);
  
  // Don't render anything if not visible or not in development mode
  if (!isVisible || process.env.NODE_ENV !== 'development') {
    return null;
  }
  
  return (
    <div className="debug-overlay">
      <div className="debug-header">
        <h3>Debug Overlay</h3>
        <div className="debug-controls">
          <button onClick={clearLogs}>Clear Logs</button>
          <button onClick={() => setIsVisible(false)}>Close</button>
        </div>
      </div>
      
      {memoryUsage && (
        <div className="debug-memory">
          <div className="memory-bar">
            <div 
              className="memory-used" 
              style={{ width: `${memoryUsage.percentage}%` }}
            />
          </div>
          <div className="memory-stats">
            Memory: {memoryUsage.used}MB / {memoryUsage.limit}MB ({memoryUsage.percentage}%)
          </div>
        </div>
      )}
      
      <div className="debug-logs">
        {logs.map((log, index) => (
          <div key={index} className={`log-entry log-${log.type}`}>
            <span className="log-time">
              {log.timestamp.toLocaleTimeString()}
            </span>
            <span className="log-message">{log.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DebugOverlay; 