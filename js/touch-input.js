/**
 * touch-input.js
 * Handles virtual joystick and action buttons for mobile devices.
 * 
 * Features:
 * - Virtual joystick with deadzone
 * - Action buttons with haptic feedback
 * - Long-press joystick for SIT/rest mode
 * - Multi-touch support
 */

const TouchInput = {
    active: false,
    joystick: {
        active: false,
        touchId: null,
        startX: 0,
        startY: 0,
        currentX: 0,
        currentY: 0,
        maxRadius: 50,
        deadzone: 10
    },

    // 长按 SIT 模式
    sitMode: {
        enabled: true,        // 是否启用长按进入 SIT 模式
        longPressDuration: 800, // 长按时间阈值（毫秒）
        timer: null,
        isActive: false
    },

    init: function () {
        // Only initialize on actual mobile/touch devices
        if (!Input.isTouchDevice) {
            console.log('[TouchInput] Not a touch device, skipping initialization');
            return;
        }

        // Double-check: don't initialize if already active
        if (this.active) {
            console.log('[TouchInput] Already initialized');
            return;
        }

        this.active = true;

        const touchControls = document.getElementById('touch-controls');
        if (!touchControls) {
            console.warn('[TouchInput] touch-controls element not found');
            return;
        }

        console.log('[TouchInput] Initializing for touch device');
        
        // Ensure touch controls are visible if active (usually shown during initGame)
        if (typeof GameStateMachine !== 'undefined' && GameStateMachine.is('playing')) {
            touchControls.classList.remove('hidden');
        }

        this.setupJoystick();
        this.setupButtons();

        // Resume AudioContext on FIRST touch anywhere on document
        const resumeAudio = () => {
            if (typeof AudioManager !== 'undefined' && AudioManager.resume) {
                AudioManager.resume();
                console.log('[TouchInput] AudioManager resumed via first touch');
            }
            document.removeEventListener('touchstart', resumeAudio);
            document.removeEventListener('mousedown', resumeAudio);
        };
        document.addEventListener('touchstart', resumeAudio, { passive: true });
        document.addEventListener('mousedown', resumeAudio, { passive: true });

        // Prevent default touch behavior ONLY on specific control elements to allow 
        // normal clicks on other UI elements (like Start button)
        touchControls.addEventListener('touchstart', e => {
            // Check if touch is on an active control button or joystick
            if (e.target.closest('.action-btn, .pause-btn, .virtual-joystick')) {
                e.preventDefault();
            }
        }, { passive: false });
    },

    /**
     * Helper for haptic feedback
     * @param {number|number[]} pattern 
     */
    vibrate: function(pattern = 10) {
        if ('vibrate' in navigator && Input.isTouchDevice) {
            try {
                navigator.vibrate(pattern);
            } catch (e) {
                // Silently fail if vibration is blocked or not supported
            }
        }
    },

    setupJoystick: function () {
        const joystickArea = document.getElementById('virtual-joystick');
        const knob = document.getElementById('joystick-knob');
        if (!joystickArea || !knob) return;

        joystickArea.addEventListener('touchstart', (e) => {
            const touch = e.changedTouches[0];
            const rect = joystickArea.getBoundingClientRect();

            this.joystick.active = true;
            this.joystick.touchId = touch.identifier;
            this.joystick.startX = rect.left + rect.width / 2;
            this.joystick.startY = rect.top + rect.height / 2;

            // 启动长按计时器（用于 SIT 模式）
            this.startSitModeTimer();

            this.vibrate(10); // Small feedback on start
            this.moveJoystick(touch);
        });

        window.addEventListener('touchmove', (e) => {
            if (!this.joystick.active) return;

            for (let i = 0; i < e.changedTouches.length; i++) {
                if (e.changedTouches[i].identifier === this.joystick.touchId) {
                    // 如果移动距离超过阈值，取消 SIT 模式
                    const dx = e.changedTouches[i].clientX - this.joystick.startX;
                    const dy = e.changedTouches[i].clientY - this.joystick.startY;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance > this.joystick.maxRadius * 0.8) {
                        this.cancelSitMode();
                    }
                    
                    this.moveJoystick(e.changedTouches[i]);
                    break;
                }
            }
        });

        window.addEventListener('touchend', (e) => {
            if (!this.joystick.active) return;

            for (let i = 0; i < e.changedTouches.length; i++) {
                if (e.changedTouches[i].identifier === this.joystick.touchId) {
                    // 检查是否触发了 SIT 模式
                    if (this.sitMode.isActive) {
                        // SIT 模式已激活，保持下蹲状态
                        console.log('[TouchInput] SIT mode activated via long-press');
                    }
                    this.resetJoystick();
                    break;
                }
            }
        });

        window.addEventListener('touchcancel', (e) => {
            if (!this.joystick.active) return;
            this.cancelSitMode();
            this.resetJoystick();
        });
    },

    /**
     * 启动 SIT 模式计时器
     */
    startSitModeTimer: function() {
        if (!this.sitMode.enabled) return;
        
        this.cancelSitMode(); // 清除之前的计时器
        
        this.sitMode.timer = setTimeout(() => {
            this.sitMode.isActive = true;
            Input.virtualKeys.down = true;  // 保持下蹲
            Input.virtualKeys.sit = true;   // 触发 SIT 状态
            
            // 视觉反馈：摇杆变色或闪烁
            const joystickArea = document.getElementById('virtual-joystick');
            if (joystickArea) {
                joystickArea.classList.add('sit-active');
            }
            
            // 震动反馈
            this.vibrate([20, 50, 20]);
        }, this.sitMode.longPressDuration);
    },

    /**
     * 取消 SIT 模式
     */
    cancelSitMode: function() {
        if (this.sitMode.timer) {
            clearTimeout(this.sitMode.timer);
            this.sitMode.timer = null;
        }
        
        if (this.sitMode.isActive) {
            this.sitMode.isActive = false;
            Input.virtualKeys.sit = false;
            
            const joystickArea = document.getElementById('virtual-joystick');
            if (joystickArea) {
                joystickArea.classList.remove('sit-active');
            }
        }
    },

    moveJoystick: function (touch) {
        const dx = touch.clientX - this.joystick.startX;
        const dy = touch.clientY - this.joystick.startY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        const knob = document.getElementById('joystick-knob');
        const limitedDistance = Math.min(distance, this.joystick.maxRadius);
        const angle = Math.atan2(dy, dx);

        const moveX = Math.cos(angle) * limitedDistance;
        const moveY = Math.sin(angle) * limitedDistance;

        knob.style.transform = `translate(calc(-50% + ${moveX}px), calc(-50% + ${moveY}px))`;

        // Map to Input.virtualKeys
        Input.virtualKeys.left = dx < -this.joystick.deadzone;
        Input.virtualKeys.right = dx > this.joystick.deadzone;
        Input.virtualKeys.up = dy < -this.joystick.deadzone;
        Input.virtualKeys.down = dy > this.joystick.deadzone;
    },

    resetJoystick: function () {
        this.joystick.active = false;
        this.joystick.touchId = null;
        
        // 取消 SIT 模式
        this.cancelSitMode();

        const knob = document.getElementById('joystick-knob');
        knob.style.transform = 'translate(-50%, -50%)';

        Input.virtualKeys.left = false;
        Input.virtualKeys.right = false;
        Input.virtualKeys.up = false;
        Input.virtualKeys.down = false;
        Input.virtualKeys.sit = false;
    },

    setupButtons: function () {
        const buttons = document.querySelectorAll('.action-btn, .pause-btn, .sit-btn');
        buttons.forEach(btn => {
            const key = btn.dataset.key;
            if (!key) return;

            btn.addEventListener('touchstart', (e) => {
                Input.virtualKeys[key] = true;
                btn.classList.add('active');
                
                // Haptic feedback
                if (key === 'shoot') {
                    this.vibrate(10);
                } else if (key === 'jump') {
                    this.vibrate(15);
                } else if (key === 'pause') {
                    this.vibrate([10, 50, 10]);
                } else {
                    this.vibrate(5);
                }
                
                e.preventDefault();
            });

            btn.addEventListener('touchend', (e) => {
                Input.virtualKeys[key] = false;
                btn.classList.remove('active');
                e.preventDefault();
            });

            btn.addEventListener('touchcancel', (e) => {
                Input.virtualKeys[key] = false;
                btn.classList.remove('active');
            });
        });
    }
};
