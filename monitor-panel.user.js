// ==UserScript==
// @name         localStorage Real-time Monitor Panel
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  Real-time display of localStorage usage
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
    
    console.log('🚀 Monitor panel script loaded');
    
    // Create panel after DOM is fully loaded
    function init() {
        if (!document.body) {
            console.log('⏳ Waiting for body to load...');
            setTimeout(init, 100);
            return;
        }
        
        console.log('✓ Body ready, creating panel');
        createMonitorPanel();
    }
    
    function createMonitorPanel() {
        // Check if already exists
        if (document.getElementById('storage-monitor-panel')) {
            console.log('⚠️ Panel already exists, skipping creation');
            return;
        }
        
        const panel = document.createElement('div');
        panel.id = 'storage-monitor-panel';
        panel.style.cssText = `
            position: fixed !important;
            bottom: 20px !important;
            right: 20px !important;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
            color: white !important;
            padding: 16px 20px !important;
            border-radius: 12px !important;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif !important;
            font-size: 13px !important;
            z-index: 2147483647 !important;
            box-shadow: 0 8px 24px rgba(0,0,0,0.4) !important;
            min-width: 240px !important;
            backdrop-filter: blur(10px) !important;
            border: 1px solid rgba(255,255,255,0.3) !important;
            cursor: pointer !important;
            user-select: none !important;
            transition: transform 0.1s ease !important;
        `;
        
        // Add to page
        document.body.appendChild(panel);
        console.log('✅ Panel added to DOM');
        
        // Update function
        function updatePanel() {
            try {
                let totalSize = 0;
                let itemCount = 0;
                
                for (let key in localStorage) {
                    if (localStorage.hasOwnProperty(key)) {
                        const value = localStorage[key];
                        totalSize += (value.length + key.length) * 2; // Unicode characters take 2 bytes
                        itemCount++;
                    }
                }
                
                const sizeMB = (totalSize / 1024 / 1024).toFixed(2);
                const maxMB = 5.00; // Most browsers limit
                const percent = Math.min(((totalSize / (maxMB * 1024 * 1024)) * 100), 100).toFixed(1);
                
                // Colors and icons
                let statusColor, statusIcon, statusBg;
                if (percent > 80) {
                    statusColor = '#ef4444';
                    statusIcon = '⚠️';
                    statusBg = 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)';
                } else if (percent > 60) {
                    statusColor = '#fbbf24';
                    statusIcon = '⚡';
                    statusBg = 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
                } else {
                    statusColor = '#4ade80';
                    statusIcon = '✓';
                    statusBg = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                }
                
                panel.style.background = statusBg;
                
                panel.innerHTML = `
                    <div style="display: flex; align-items: center; margin-bottom: 10px;">
                        <span style="font-size: 18px; margin-right: 8px;">💾</span>
                        <span style="font-weight: 600; font-size: 14px;">Storage Monitor</span>
                    </div>
                    <div style="margin-bottom: 8px;">
                        <div style="font-size: 11px; opacity: 0.8; margin-bottom: 3px;">Usage</div>
                        <div style="font-size: 16px; font-weight: 600;">
                            ${sizeMB} <span style="font-size: 12px; font-weight: 400; opacity: 0.9;">/ ${maxMB} MB</span>
                        </div>
                    </div>
                    <div style="margin-bottom: 8px;">
                        <div style="font-size: 11px; opacity: 0.8; margin-bottom: 3px;">Percentage</div>
                        <div style="display: flex; align-items: center;">
                            <div style="flex: 1; background: rgba(255,255,255,0.2); height: 6px; border-radius: 3px; overflow: hidden; margin-right: 8px;">
                                <div style="width: ${percent}%; height: 100%; background: ${statusColor}; transition: width 0.5s ease;"></div>
                            </div>
                            <span style="font-size: 13px; font-weight: 600;">
                                ${statusIcon} ${percent}%
                            </span>
                        </div>
                    </div>
                    <div style="font-size: 11px; opacity: 0.6; margin-top: 8px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.15);">
                        ${itemCount} items · ${new Date().toLocaleTimeString()}
                    </div>
                `;
                
                console.log(`📊 Updated: ${sizeMB} MB (${percent}%) - ${itemCount} items`);
            } catch (error) {
                console.error('❌ Failed to update panel:', error);
                panel.innerHTML = `
                    <div style="color: #ef4444;">
                        ❌ Update failed
                    </div>
                `;
            }
        }
        
        // Click to refresh
        panel.addEventListener('click', function() {
            panel.style.transform = 'scale(0.95)';
            setTimeout(() => {
                panel.style.transform = 'scale(1)';
            }, 100);
            updatePanel();
            console.log('🔄 Manual refresh');
        });
        
        // Update immediately
        updatePanel();
        
        // Auto update every 3 seconds
        setInterval(updatePanel, 3000);
        
        console.log('✅✅✅ Monitor panel created and running!');
    }
    
    // Startup
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        // Delay 1 second to ensure page stability
        setTimeout(init, 1000);
    }
    
})();
