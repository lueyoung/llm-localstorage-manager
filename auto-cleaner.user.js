// ==UserScript==
// @name         LLM localStorage Auto Cleaner - Enhanced Version
// @namespace    http://tampermonkey.net/
// @version      2.1
// @description  Automatically clean localStorage to prevent QuotaExceededError (No Auto-Reload)
// @author       lueyoung
// @match        https://chatgpt.com/*
// @match        https://chat.openai.com/*
// @match        https://claude.ai/*
// @match        https://gemini.google.com/*
// @match        https://qianwen.aliyun.com/*
// @match        https://chatglm.cn/*
// @match        https://yiyan.baidu.com/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    // ========== Configuration ==========
    const CONFIG = {
        // Check interval (milliseconds)
        checkInterval: 30000, // 30 seconds

        // localStorage usage threshold (bytes)
        maxStorageSize: 2 * 1024 * 1024, // 2MB

        // Emergency cleanup threshold
        emergencyThreshold: 3 * 1024 * 1024, // 3MB

        // Show notifications
        showNotification: true,

        // Problematic key prefixes (will be cleaned first)
        problematicPrefixes: [
            'statsig',
            'failed_logs',
            '__Secure',
            'analytics',
            'tracking',
            'telemetry'
        ],

        // Cleanup ratio
        normalCleanRatio: 0.5,    // Normal: 50%
        emergencyCleanRatio: 0.8,  // Emergency: 80%

        // Single key size limit
        maxKeySize: 500 * 1024, // 500KB
    };

    // ========== Core Functions ==========

    // Calculate localStorage usage
    function getStorageSize() {
        let total = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                total += (localStorage[key].length + key.length) * 2;
            }
        }
        return total;
    }

    // Get size of a single key
    function getKeySize(key) {
        const value = localStorage.getItem(key);
        if (!value) return 0;
        return (value.length + key.length) * 2;
    }

    // Show notification
    function showNotify(message, type = 'info') {
        if (!CONFIG.showNotification) return;

        const colors = {
            success: '#4CAF50',
            info: '#2196F3',
            warning: '#FF9800',
            error: '#F44336'
        };

        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            background: ${colors[type] || colors.info};
            color: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 999999;
            font-family: Arial, sans-serif;
            font-size: 14px;
            max-width: 320px;
            animation: slideIn 0.3s ease-out;
        `;
        notification.textContent = message;

        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(400px); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideIn 0.3s ease-out reverse';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Check if key is problematic
    function isProblematicKey(key) {
        return CONFIG.problematicPrefixes.some(prefix => 
            key.toLowerCase().includes(prefix.toLowerCase())
        );
    }

    // Enhanced smart clean
    function smartClean(isEmergency = false) {
        const items = [];
        const problematicItems = [];
        const oversizedItems = [];

        console.log(`[LLM Cleaner] Starting ${isEmergency ? 'emergency' : 'regular'} cleanup...`);

        // Categorize and collect all keys
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                const value = localStorage[key];
                const size = (value.length + key.length) * 2;
                let timestamp = Date.now();

                // Try to extract timestamp
                const match = key.match(/_(\d{13})$/);
                if (match) {
                    timestamp = parseInt(match[1]);
                } else {
                    try {
                        const parsed = JSON.parse(value);
                        timestamp = parsed.timestamp || parsed.createdAt || parsed.updatedAt || Date.now();
                    } catch (e) {
                        // Non-JSON, keep current time
                    }
                }

                const item = { key, timestamp, size };

                // Categorize
                if (size > CONFIG.maxKeySize) {
                    oversizedItems.push(item);
                    console.warn(`[LLM Cleaner] Found oversized key: ${key} (${(size / 1024).toFixed(2)} KB)`);
                } else if (isProblematicKey(key)) {
                    problematicItems.push(item);
                } else {
                    items.push(item);
                }
            }
        }

        let cleaned = 0;
        let deletedCount = 0;

        // 1. First delete all oversized keys
        oversizedItems.forEach(item => {
            localStorage.removeItem(item.key);
            cleaned += item.size;
            deletedCount++;
            console.log(`[LLM Cleaner] Deleted oversized key: ${item.key}`);
        });

        // 2. Delete all problematic keys
        problematicItems.forEach(item => {
            localStorage.removeItem(item.key);
            cleaned += item.size;
            deletedCount++;
        });
        
        if (problematicItems.length > 0) {
            console.log(`[LLM Cleaner] Deleted ${problematicItems.length} problematic keys`);
        }

        // 3. Sort normal keys by time, delete old data
        items.sort((a, b) => a.timestamp - b.timestamp);
        
        const ratio = isEmergency ? CONFIG.emergencyCleanRatio : CONFIG.normalCleanRatio;
        const toDelete = Math.ceil(items.length * ratio);

        for (let i = 0; i < toDelete && i < items.length; i++) {
            localStorage.removeItem(items[i].key);
            cleaned += items[i].size;
            deletedCount++;
        }

        const cleanedMB = (cleaned / 1024 / 1024).toFixed(2);
        console.log(`[LLM Cleaner] Deleted ${deletedCount} items total, freed ${cleanedMB} MB`);
        showNotify(`✓ Cleaned ${deletedCount} items (${cleanedMB} MB)`, 'success');

        return cleaned;
    }

    // Main check function
    function checkAndClean() {
        const currentSize = getStorageSize();
        const sizeMB = (currentSize / 1024 / 1024).toFixed(2);
        const maxMB = (CONFIG.maxStorageSize / 1024 / 1024).toFixed(2);
        const emergencyMB = (CONFIG.emergencyThreshold / 1024 / 1024).toFixed(2);

        console.log(`[LLM Cleaner] Current usage: ${sizeMB} MB / ${maxMB} MB (Emergency line: ${emergencyMB} MB)`);

        // Emergency cleanup
        if (currentSize > CONFIG.emergencyThreshold) {
            console.error(`[LLM Cleaner] 🚨 Emergency cleanup triggered!`);
            showNotify('🚨 Storage critically exceeded, performing emergency cleanup...', 'warning');
            smartClean(true);
        } 
        // Regular cleanup
        else if (currentSize > CONFIG.maxStorageSize) {
            console.warn(`[LLM Cleaner] ⚠️ Storage exceeded, starting cleanup...`);
            smartClean(false);
        }
    }

    // Intercept localStorage.setItem
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = function(key, value) {
        try {
            originalSetItem.call(localStorage, key, value);
        } catch (e) {
            if (e.name === 'QuotaExceededError') {
                console.error(`[LLM Cleaner] Caught QuotaExceededError, performing emergency cleanup immediately`);
                showNotify('⚠️ Storage full, performing emergency cleanup...', 'warning');
                
                // Execute emergency cleanup
                smartClean(true);
                
                // Retry after 100ms
                setTimeout(() => {
                    try {
                        originalSetItem.call(localStorage, key, value);
                        console.log(`[LLM Cleaner] ✓ Successfully wrote after cleanup: ${key}`);
                    } catch (retryError) {
                        console.error('[LLM Cleaner] ❌ Still unable to write after cleanup:', retryError);
                        console.warn('[LLM Cleaner] 🗑️ Executing final solution: Clear all storage');
                        showNotify('⚠️ Auto-clearing storage to restore normal operation...', 'warning');
                        
                        // Auto clear all (no confirmation dialog)
                        localStorage.clear();
                        console.log('[LLM Cleaner] ✓ Cleared all localStorage');
                        
                        // No auto-reload, only notify
                        showNotify('✓ Storage cleared. Please refresh manually if needed', 'success');
                    }
                }, 100);
            } else {
                throw e;
            }
        }
    };

    // ========== Startup ==========
    console.log('[LLM Cleaner v2.1] Started, enhanced monitoring active...');
    console.log('[LLM Cleaner] Configuration: Auto-clear mode | No auto-reload');
    showNotify('🛡️ Enhanced cleaner started', 'info');

    // Check immediately once
    checkAndClean();

    // Regular check
    setInterval(checkAndClean, CONFIG.checkInterval);

    // Check before page unload
    window.addEventListener('beforeunload', () => {
        const size = getStorageSize();
        if (size > CONFIG.maxStorageSize) {
            smartClean(true);
        }
    });

})();
