// ==UserScript==
// @name         localStorage Monitor Panel (Draggable Fixed Version)
// @namespace    http://tampermonkey.net/
// @version      2.1
// @description  Real-time display of localStorage usage - Dragging fixed
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
    
    console.log('🚀 Draggable monitor panel script loaded (Fixed version)');
    
    function init() {
        if (!document.body) {
            setTimeout(init, 100);
            return;
        }
        createMonitorPanel();
    }
    
    function createMonitorPanel() {
        if (document.getElementById('storage-monitor-panel')) {
            console.log('⚠️ Panel already exists');
            return;
        }
        
        // Read last saved position from localStorage
        const savedPos = localStorage.getItem('monitor-panel-position');
        let initialTop = 'auto', initialLeft = 'auto', initialBottom = '20px', initialRight = '20px';
        
        if (savedPos) {
            try {
                const pos = JSON.parse(savedPos);
                initialTop = pos.top;
                initialLeft = pos.left;
                initialBottom = pos.bottom;
                initialRight = pos.right;
            } catch (e) {
                console.log('Unable to parse saved position, using default position');
            }
        }
        
        const panel = document.createElement('div');
        panel.id = 'storage-monitor-panel';
        panel.style.cssText = `
            position: fixed !important;
            top: ${initialTop} !important;
            left: ${initialLeft} !important;
            bottom: ${initialBottom} !important;
            right: ${initialRight} !important;
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
            cursor: move !important;
            user-select: none !important;
            transition: box-shadow 0.2s ease, transform 0.1s ease !important;
        `;
        
        document.body.appendChild(panel);
        console.log('✅ Draggable panel created');
        
        // ========== Dragging functionality (Simplified version) ==========
        let isDragging = false;
        let startX, startY;
        let panelStartLeft, panelStartTop;
        
        panel.addEventListener('mousedown', function(e) {
            isDragging = true;
            
            // Record mouse starting position
            startX = e.clientX;
            startY = e.clientY;
            
            // Get panel current position
            const rect = panel.getBoundingClientRect();
            panelStartLeft = rect.left;
            panelStartTop = rect.top;
            
            // Switch to absolute positioning
            panel.style.left = panelStartLeft + 'px';
            panel.style.top = panelStartTop + 'px';
            panel.style.right = 'auto';
            panel.style.bottom = 'auto';
            
            // Visual feedback
            panel.style.cursor = 'grabbing';
            panel.style.boxShadow = '0 12px 32px rgba(0,0,0,0.6)';
            
            e.preventDefault(); // Prevent text selection
            console.log('🖱️ Started dragging');
        });
        
        document.addEventListener('mousemove', function(e) {
            if (!isDragging) return;
            
            // Calculate mouse movement distance
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;
            
            // Calculate new position
            let newLeft = panelStartLeft + deltaX;
            let newTop = panelStartTop + deltaY;
            
            // Limit within window bounds
            const rect = panel.getBoundingClientRect();
            const maxX = window.innerWidth - rect.width;
            const maxY = window.innerHeight - rect.height;
            
            newLeft = Math.max(0, Math.min(newLeft, maxX));
            newTop = Math.max(0, Math.min(newTop, maxY));
            
            // Apply new position
            panel.style.left = newLeft + 'px';
            panel.style.top = newTop + 'px';
        });
        
        document.addEventListener('mouseup', function(e) {
            if (!isDragging) return;
            
            isDragging = false;
            
            // Restore visual effects
            panel.style.cursor = 'move';
            panel.style.boxShadow = '0 8px 24px rgba(0,0,0,0.4)';
            
            // Save position
            const rect = panel.getBoundingClientRect();
            const savedPosition = {
                top: rect.top + 'px',
                left: rect.left + 'px',
                bottom: 'auto',
                right: 'auto'
            };
            
            localStorage.setItem('monitor-panel-position', JSON.stringify(savedPosition));
            console.log('💾 Position saved:', savedPosition);
        });
        
        // ========== Double-click to reset position ==========
        panel.addEventListener('dblclick', function(e) {
            e.stopPropagation();
            
            panel.style.top = 'auto';
            panel.style.left = 'auto';
            panel.style.bottom = '20px';
            panel.style.right = '20px';
            
            const defaultPosition = {
                top: 'auto',
                left: 'auto',
                bottom: '20px',
                right: '20px'
            };
            localStorage.setItem('monitor-panel-position', JSON.stringify(defaultPosition));
            
            // Visual feedback
            panel.style.transform = 'scale(0.95)';
            setTimeout(() => {
                panel.style.transform = 'scale(1)';
            }, 100);
            
            console.log('🔄 Position reset to bottom-right corner');
            showTooltip('Position reset');
        });
        
        // ========== Show tooltip ==========
        function showTooltip(text) {
            const tooltip = document.createElement('div');
            tooltip.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(0, 0, 0, 0.9);
                color: white;
                padding: 12px 20px;
                border-radius: 8px;
                font-size: 14px;
                z-index: 2147483648;
                pointer-events: none;
                animation: fadeInOut 1.5s ease;
            `;
            tooltip.textContent = text;
            
            const style = document.createElement('style');
            style.textContent = `
                @keyframes fadeInOut {
                    0%, 100% { opacity: 0; }
                    20%, 80% { opacity: 1; }
                }
            `;
            if (!document.querySelector('style[data-monitor-animations]')) {
                style.setAttribute('data-monitor-animations', 'true');
                document.head.appendChild(style);
            }
            document.body.appendChild(tooltip);
            
            setTimeout(() => tooltip.remove(), 1500);
        }
        
        // ========== Update panel content ==========
        function updatePanel() {
            try {
                let totalSize = 0;
                let itemCount = 0;
                
                for (let key in localStorage) {
                    if (localStorage.hasOwnProperty(key)) {
                        const value = localStorage[key];
                        totalSize += (value.length + key.length) * 2;
                        itemCount++;
                    }
                }
                
                const sizeMB = (totalSize / 1024 / 1024).toFixed(2);
                const maxMB = 5.00;
                const percent = Math.min(((totalSize / (maxMB * 1024 * 1024)) * 100), 100).toFixed(1);
                
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
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
                        <div style="display: flex; align-items: center;">
                            <span style="font-size: 18px; margin-right: 8px;">💾</span>
                            <span style="font-weight: 600; font-size: 14px;">Storage Monitor</span>
                        </div>
                        <span style="font-size: 10px; opacity: 0.6; cursor: help;" title="Double-click to reset position">🔄</span>
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
                    <div style="font-size: 10px; opacity: 0.5; margin-top: 4px; text-align: center;">
                        Drag to move · Double-click to reset
                    </div>
                `;
                
            } catch (error) {
                console.error('❌ Update failed:', error);
            }
        }
        
        // Update immediately
        updatePanel();
        
        // Update every 3 seconds
        setInterval(updatePanel, 3000);
        
        console.log('✅✅✅ Draggable monitor panel completed!');
    }
    
    // Startup
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 1000);
    }
    
})();
