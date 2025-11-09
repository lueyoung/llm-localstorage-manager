// ==UserScript==
// @name         LLM localStorage Auto Cleaner - Enhanced Version
// @namespace    http://tampermonkey.net/
// @version      2.5
// @description  Automatically clean localStorage to prevent QuotaExceededError (Fixed Notifications)
// @author       lueyoung
// @match        https://chatgpt.com/*
// @match        https://chat.openai.com/*
// @match        https://claude.ai/*
// @match        https://gemini.google.com/*
// @match        https://qianwen.aliyun.com/*
// @match        https://chatglm.cn/*
// @match        https://yiyan.baidu.com/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    // ========== Configuration ==========
    const CONFIG = {
        checkInterval: 30000,
        maxStorageSize: 2 * 1024 * 1024,
        emergencyThreshold: 3 * 1024 * 1024,
        showNotification: true,
        maxNotifications: 3,
        problematicPrefixes: ['statsig', 'failed_logs', '__Secure', 'analytics', 'tracking', 'telemetry'],
        normalCleanRatio: 0.5,
        emergencyCleanRatio: 0.8,
        maxKeySize: 500 * 1024,
    };

    // ========== Notification System ==========
    let notificationContainer = null;
    const activeNotifications = [];
    let containerReady = false;

    function ensureContainer() {
        if (containerReady && notificationContainer) {
            return true;
        }

        if (!document.body) {
            console.warn('[LLM Cleaner] document.body not ready');
            return false;
        }

        if (!notificationContainer) {
            notificationContainer = document.createElement('div');
            notificationContainer.id = 'llm-notification-container';
            notificationContainer.style.cssText = `
                position: fixed !important;
                top: 20px !important;
                right: 20px !important;
                z-index: 2147483647 !important;
                display: flex !important;
                flex-direction: column !important;
                gap: 10px !important;
                pointer-events: none !important;
            `;

            const style = document.createElement('style');
            style.textContent = `
                @keyframes llmSlideIn {
                    from { transform: translateX(400px); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes llmSlideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(400px); opacity: 0; }
                }
                .llm-notification {
                    animation: llmSlideIn 0.3s ease-out !important;
                }
                .llm-notification.removing {
                    animation: llmSlideOut 0.3s ease-out !important;
                }
            `;
            
            document.head.appendChild(style);
            document.body.appendChild(notificationContainer);
            containerReady = true;
            console.log('[LLM Cleaner] ✅ Notification container created');
        }

        return true;
    }

    function removeNotification(notification) {
        const index = activeNotifications.indexOf(notification);
        if (index > -1) {
            activeNotifications.splice(index, 1);
        }
        notification.classList.add('removing');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }

    function showNotify(message, type = 'info') {
        if (!CONFIG.showNotification) return;

        if (!ensureContainer()) {
            console.warn('[LLM Cleaner] Container not ready, delaying notification');
            setTimeout(() => showNotify(message, type), 100);
            return;
        }

        const colors = {
            success: '#4CAF50',
            info: '#2196F3',
            warning: '#FF9800',
            error: '#F44336'
        };

        while (activeNotifications.length >= CONFIG.maxNotifications) {
            removeNotification(activeNotifications[0]);
        }

        const notification = document.createElement('div');
        notification.className = 'llm-notification';
        notification.style.cssText = `
            padding: 15px 20px !important;
            background: ${colors[type] || colors.info} !important;
            color: white !important;
            border-radius: 8px !important;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3) !important;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif !important;
            font-size: 14px !important;
            max-width: 320px !important;
            min-width: 200px !important;
            pointer-events: auto !important;
            cursor: pointer !important;
            word-wrap: break-word !important;
            line-height: 1.5 !important;
        `;
        notification.textContent = message;

        notification.addEventListener('click', () => {
            removeNotification(notification);
        });

        notificationContainer.appendChild(notification);
        activeNotifications.push(notification);

        setTimeout(() => {
            removeNotification(notification);
        }, 3000);
    }

    // ========== Core Functions ==========
    function getStorageSize() {
        let total = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                total += (localStorage[key].length + key.length) * 2;
            }
        }
        return total;
    }

    function isProblematicKey(key) {
        return CONFIG.problematicPrefixes.some(prefix => 
            key.toLowerCase().includes(prefix.toLowerCase())
        );
    }

    function smartClean(isEmergency = false) {
        const items = [];
        const problematicItems = [];
        const oversizedItems = [];

        console.log(`[LLM Cleaner] Starting ${isEmergency ? 'emergency' : 'regular'} cleanup...`);

        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                const value = localStorage[key];
                const size = (value.length + key.length) * 2;
                let timestamp = Date.now();

                const match = key.match(/_(\d{13})$/);
                if (match) {
                    timestamp = parseInt(match[1]);
                } else {
                    try {
                        const parsed = JSON.parse(value);
                        timestamp = parsed.timestamp || parsed.createdAt || parsed.updatedAt || Date.now();
                    } catch (e) {}
                }

                const item = { key, timestamp, size };

                if (size > CONFIG.maxKeySize) {
                    oversizedItems.push(item);
                    console.warn(`[LLM Cleaner] Oversized key: ${key} (${(size / 1024).toFixed(2)} KB)`);
                } else if (isProblematicKey(key)) {
                    problematicItems.push(item);
                } else {
                    items.push(item);
                }
            }
        }

        let cleaned = 0;
        let deletedCount = 0;

        oversizedItems.forEach(item => {
            localStorage.removeItem(item.key);
            cleaned += item.size;
            deletedCount++;
        });

        problematicItems.forEach(item => {
            localStorage.removeItem(item.key);
            cleaned += item.size;
            deletedCount++;
        });

        if (problematicItems.length > 0) {
            console.log(`[LLM Cleaner] Deleted ${problematicItems.length} problematic keys`);
        }

        items.sort((a, b) => a.timestamp - b.timestamp);
        const ratio = isEmergency ? CONFIG.emergencyCleanRatio : CONFIG.normalCleanRatio;
        const toDelete = Math.ceil(items.length * ratio);

        for (let i = 0; i < toDelete && i < items.length; i++) {
            localStorage.removeItem(items[i].key);
            cleaned += items[i].size;
            deletedCount++;
        }

        const cleanedMB = (cleaned / 1024 / 1024).toFixed(2);
        console.log(`[LLM Cleaner] Deleted ${deletedCount} items, freed ${cleanedMB} MB`);
        showNotify(`✓ Cleaned ${deletedCount} items (${cleanedMB} MB)`, 'success');

        return cleaned;
    }

    function checkAndClean() {
        const currentSize = getStorageSize();
        const sizeMB = (currentSize / 1024 / 1024).toFixed(2);
        const maxMB = (CONFIG.maxStorageSize / 1024 / 1024).toFixed(2);
        const emergencyMB = (CONFIG.emergencyThreshold / 1024 / 1024).toFixed(2);

        console.log(`[LLM Cleaner] Current usage: ${sizeMB} MB / ${maxMB} MB (Emergency line: ${emergencyMB} MB)`);

        if (currentSize > CONFIG.emergencyThreshold) {
            console.error(`[LLM Cleaner] 🚨 Emergency cleanup triggered!`);
            showNotify('🚨 Storage critically exceeded, emergency cleanup', 'warning');
            smartClean(true);
        } else if (currentSize > CONFIG.maxStorageSize) {
            console.warn(`[LLM Cleaner] ⚠️ Storage exceeded, starting cleanup`);
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
                console.error(`[LLM Cleaner] QuotaExceededError`);
                showNotify('⚠️ Storage full, cleaning...', 'warning');
                smartClean(true);
                
                setTimeout(() => {
                    try {
                        originalSetItem.call(localStorage, key, value);
                    } catch (retryError) {
                        console.error('[LLM Cleaner] Still unable to write after cleanup');
                        showNotify('⚠️ Auto-clearing all storage...', 'warning');
                        localStorage.clear();
                        showNotify('✓ Storage cleared', 'success');
                    }
                }, 100);
            } else {
                throw e;
            }
        }
    };

    // ========== Startup ==========
    function init() {
        console.log('[LLM Cleaner v2.5] Starting...');
        
        // Ensure container is created
        ensureContainer();
        
        // Delay startup notification to ensure container is fully ready
        setTimeout(() => {
            showNotify('🛡️ Cleaner started', 'info');
        }, 200);
        
        // Immediate check
        setTimeout(checkAndClean, 500);
        
        // Regular check
        setInterval(checkAndClean, CONFIG.checkInterval);
        
        // Check before page unload
        window.addEventListener('beforeunload', () => {
            const size = getStorageSize();
            if (size > CONFIG.maxStorageSize) {
                smartClean(true);
            }
        });
        
        console.log('[LLM Cleaner] ✅ Started');
    }

    // Wait for DOM to be fully ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        // Use requestAnimationFrame to ensure rendering is complete
        requestAnimationFrame(() => {
            setTimeout(init, 100);
        });
    }

})();
