// ==UserScript==
// @name         LLM localStorage Auto Cleaner
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  Automatically clean localStorage to prevent QuotaExceededError
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
        // Check interval (milliseconds), 60000 = 1 minute
        checkInterval: 60000,
        
        // localStorage usage threshold (bytes), clean when exceeded
        maxStorageSize: 4 * 1024 * 1024, // 4MB
        
        // Show notifications
        showNotification: true,
        
        // Specific keys to clean (empty = clean all)
        specificKeys: ['RESUME_TOKEN_STORE_KEY', 'conversation_history', 'chat_cache'],
        
        // Clean mode: 'all' = clean all, 'specific' = clean specified keys only, 'smart' = intelligently clean old data
        cleanMode: 'smart'
    };

    // ========== Core Functions ==========
    
    // Calculate localStorage usage
    function getStorageSize() {
        let total = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                total += (localStorage[key].length + key.length) * 2; // Unicode characters take 2 bytes
            }
        }
        return total;
    }

    // Show notification
    function showNotify(message, type = 'info') {
        if (!CONFIG.showNotification) return;
        
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
            color: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 999999;
            font-family: Arial, sans-serif;
            font-size: 14px;
            max-width: 300px;
            animation: slideIn 0.3s ease-out;
        `;
        notification.textContent = message;
        
        // Add animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(400px); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        
        // Wait for DOM ready
        const addNotification = () => {
            if (document.head && document.body) {
                document.head.appendChild(style);
                document.body.appendChild(notification);
                
                setTimeout(() => {
                    notification.style.animation = 'slideIn 0.3s ease-out reverse';
                    setTimeout(() => notification.remove(), 300);
                }, 3000);
            } else {
                setTimeout(addNotification, 100);
            }
        };
        addNotification();
    }

    // Clean all
    function cleanAll() {
        const sizeBefore = getStorageSize();
        localStorage.clear();
        const sizeAfter = getStorageSize();
        const cleaned = ((sizeBefore - sizeAfter) / 1024 / 1024).toFixed(2);
        console.log(`[LLM Cleaner] Cleaned ${cleaned} MB of data`);
        showNotify(`✓ Cleaned ${cleaned} MB localStorage`, 'success');
    }

    // Clean specific keys
    function cleanSpecific() {
        let cleaned = 0;
        CONFIG.specificKeys.forEach(key => {
            const item = localStorage.getItem(key);
            if (item) {
                cleaned += (item.length + key.length) * 2;
                localStorage.removeItem(key);
            }
        });
        const cleanedMB = (cleaned / 1024 / 1024).toFixed(2);
        console.log(`[LLM Cleaner] Cleaned specified keys, freed ${cleanedMB} MB`);
        showNotify(`✓ Cleaned specified data ${cleanedMB} MB`, 'success');
    }

    // Smart clean (delete oldest data)
    function cleanSmart() {
        const items = [];
        
        // Collect all keys with timestamps
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                const value = localStorage[key];
                let timestamp = 0;
                
                // Try to extract timestamp from key name
                const match = key.match(/_(\d{13})$/);
                if (match) {
                    timestamp = parseInt(match[1]);
                } else {
                    // Try to parse JSON to get timestamp
                    try {
                        const parsed = JSON.parse(value);
                        timestamp = parsed.timestamp || parsed.createdAt || parsed.updatedAt || 0;
                    } catch (e) {
                        // Non-JSON data, use current time
                        timestamp = Date.now();
                    }
                }
                
                items.push({
                    key,
                    timestamp,
                    size: (value.length + key.length) * 2
                });
            }
        }
        
        // Sort by time (oldest first)
        items.sort((a, b) => a.timestamp - b.timestamp);
        
        // Delete oldest 30%
        const toDelete = Math.ceil(items.length * 0.3);
        let cleaned = 0;
        
        for (let i = 0; i < toDelete; i++) {
            localStorage.removeItem(items[i].key);
            cleaned += items[i].size;
        }
        
        const cleanedMB = (cleaned / 1024 / 1024).toFixed(2);
        console.log(`[LLM Cleaner] Smart cleaned ${toDelete} old items, freed ${cleanedMB} MB`);
        showNotify(`✓ Smart cleaned ${toDelete} old items`, 'success');
    }

    // Main check function
    function checkAndClean() {
        const currentSize = getStorageSize();
        const sizeMB = (currentSize / 1024 / 1024).toFixed(2);
        
        console.log(`[LLM Cleaner] Current usage: ${sizeMB} MB / ${(CONFIG.maxStorageSize / 1024 / 1024).toFixed(2)} MB`);
        
        if (currentSize > CONFIG.maxStorageSize) {
            console.warn(`[LLM Cleaner] Storage exceeded! Starting cleanup...`);
            
            switch (CONFIG.cleanMode) {
                case 'all':
                    cleanAll();
                    break;
                case 'specific':
                    cleanSpecific();
                    break;
                case 'smart':
                    cleanSmart();
                    break;
                default:
                    cleanSmart();
            }
        }
    }

    // Intercept localStorage.setItem, check before writing
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = function(key, value) {
        try {
            originalSetItem.call(localStorage, key, value);
        } catch (e) {
            if (e.name === 'QuotaExceededError') {
                console.error(`[LLM Cleaner] Caught QuotaExceededError, cleaning immediately`);
                showNotify('⚠️ Storage full, cleaning...', 'info');
                checkAndClean();
                
                // Retry writing
                try {
                    originalSetItem.call(localStorage, key, value);
                } catch (retryError) {
                    console.error('[LLM Cleaner] Still unable to write after cleaning:', retryError);
                    showNotify('❌ Unable to write after cleaning, please clean manually', 'error');
                }
            } else {
                throw e;
            }
        }
    };

    // ========== Startup ==========
    console.log('[LLM Cleaner] Started, monitoring...');
    showNotify('🛡️ localStorage Auto Cleaner started');
    
    // Check immediately once
    checkAndClean();
    
    // Regular check
    setInterval(checkAndClean, CONFIG.checkInterval);

})();
