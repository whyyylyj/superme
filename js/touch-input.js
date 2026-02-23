/**
 * touch-input.js
 * Handles virtual joystick and action buttons for mobile devices.
 *
 * Mobile-Only Optimizations:
 * - Auto-enable homing mode on touch devices (Task 1)
 * - Jump button triggers auto-shoot (Task 2)
 *
 * Desktop Behavior:
 * - TouchInput.init() skips all initialization
 * - No changes to desktop keyboard controls
 * - Homing mode remains opt-in via M key
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
        maxRadius: 60,
        deadzone: 15
    },

    // 连射模式
    autoFire: {
        enabled: true, // 默认开启连射模式
        interval: 150, // 连射间隔（毫秒）
        timer: null,
        isActive: false
    },

    // 长按 SIT 模式
    sitMode: {
        enabled: false,       // 禁用长按，现在使用按钮控制
        longPressDuration: 800,
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

        // Mobile optimization: Auto-enable homing mode on touch devices
        if (typeof player !== 'undefined' && player) {
            player.homingMode = true;
            console.log('[TouchInput] Auto-enabled homing mode for mobile');

            // Visual feedback: create green particles to indicate homing mode
            if (typeof ParticleSystem !== 'undefined') {
                setTimeout(() => {
                    const centerX = player.x + player.width / 2;
                    const centerY = player.y + player.height / 2;
                    ParticleSystem.createExplosion(centerX, centerY, '#00ff00', 10);
                }, 500);
            }
        }
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

            // 长按 SIT 模式已禁用，移除计时器
            // this.startSitModeTimer();

            this.vibrate(10); // Small feedback on start
            this.moveJoystick(touch);
        });

        window.addEventListener('touchmove', (e) => {
            if (!this.joystick.active) return;

            for (let i = 0; i < e.changedTouches.length; i++) {
                if (e.changedTouches[i].identifier === this.joystick.touchId) {
                    // 移除 SIT 模式相关逻辑
                    this.moveJoystick(e.changedTouches[i]);
                    break;
                }
            }
        });

        window.addEventListener('touchend', (e) => {
            if (!this.joystick.active) return;

            for (let i = 0; i < e.changedTouches.length; i++) {
                if (e.changedTouches[i].identifier === this.joystick.touchId) {
                    // 移除 SIT 模式相关逻辑
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
        // Get current scale to convert screen pixels to game pixels
        const scale = (typeof Responsive !== 'undefined') ? Responsive.getScale() : 1;
        
        const dx = (touch.clientX - this.joystick.startX) / scale;
        const dy = (touch.clientY - this.joystick.startY) / scale;
        const distance = Math.sqrt(dx * dx + dy * dy);

        const knob = document.getElementById('joystick-knob');
        const limitedDistance = Math.min(distance, this.joystick.maxRadius);
        const angle = Math.atan2(dy, dx);

        const moveX = Math.cos(angle) * limitedDistance;
        const moveY = Math.sin(angle) * limitedDistance;

        knob.style.transform = `translate(calc(-50% + ${moveX}px), calc(-50% + ${moveY}px))`;

        // Map to Input.virtualKeys
        // Note: deadzone is now in game pixels
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

    /**
     * 启动连射模式
     */
    startAutoFire: function() {
        if (this.autoFire.isActive) return;

        this.autoFire.isActive = true;
        Input.virtualKeys.autofire = true;

        const fireLoop = () => {
            if (!this.autoFire.isActive) return;

            // 触发射击
            Input.virtualKeys.shoot = true;
            this.vibrate(3);

            // 短暂释放后再按下，模拟连射
            setTimeout(() => {
                if (this.autoFire.isActive) {
                    Input.virtualKeys.shoot = false;
                }
            }, 50);

            this.autoFire.timer = setTimeout(fireLoop, this.autoFire.interval);
        };

        fireLoop();
        console.log('[TouchInput] Auto-fire started');
    },

    /**
     * 停止连射模式
     */
    stopAutoFire: function() {
        if (!this.autoFire.isActive) return;

        this.autoFire.isActive = false;
        Input.virtualKeys.autofire = false;
        Input.virtualKeys.shoot = false;

        if (this.autoFire.timer) {
            clearTimeout(this.autoFire.timer);
            this.autoFire.timer = null;
        }

        console.log('[TouchInput] Auto-fire stopped');
    },

    setupButtons: function () {
        const buttons = document.querySelectorAll('.action-btn, .aux-btn, .pause-btn');
        
        // 记录按钮按下状态，用于解决冲突
        const buttonState = {
            shoot: false,
            jump: false
        };

        buttons.forEach(btn => {
            const key = btn.dataset.key;
            if (!key) return;

            btn.addEventListener('touchstart', (e) => {
                // 特殊处理连射按钮：改为切换模式 (Toggle)
                if (key === 'autofire') {
                    if (this.autoFire.isActive) {
                        this.stopAutoFire();
                        btn.classList.remove('active');
                        this.vibrate(20);
                    } else {
                        this.startAutoFire();
                        btn.classList.add('active');
                        this.vibrate([10, 30, 10]);
                    }
                    e.preventDefault();
                    return;
                }

                // 记录状态
                if (key === 'shoot' || key === 'jump') {
                    buttonState[key] = true;
                }

                // 正常按钮处理
                Input.virtualKeys[key] = true;
                btn.classList.add('active');

                // Mobile optimization: Jump button triggers auto-shoot
                if (key === 'jump') {
                    Input.virtualKeys.shoot = true;
                    console.log('[TouchInput] Jump pressed - auto-shooting enabled');
                }

                // Haptic feedback
                if (key === 'shoot') {
                    this.vibrate(10);
                } else if (key === 'jump') {
                    this.vibrate(15);
                } else if (key === 'pause') {
                    this.vibrate([10, 50, 10]);
                    // 特殊处理暂停：立即释放，防止因为UI隐藏导致状态粘滞
                    setTimeout(() => {
                        Input.virtualKeys.pause = false;
                        btn.classList.remove('active');
                    }, 100);
                } else if (key === 'sit') {
                    this.vibrate([5, 10, 5]);
                } else {
                    this.vibrate(5);
                }

                e.preventDefault();
            });

            btn.addEventListener('touchend', (e) => {
                // 如果是暂停按钮，忽略 touchend，因为已经在 touchstart 中处理了脉冲
                if (key === 'pause') return;

                // 特殊处理连射按钮：连射按钮现在是切换模式，在 touchend 中不做处理
                if (key === 'autofire') {
                    e.preventDefault();
                    return;
                }

                // 记录状态
                if (key === 'shoot' || key === 'jump') {
                    buttonState[key] = false;
                }

                // 正常按钮处理
                Input.virtualKeys[key] = false;
                btn.classList.remove('active');

                // Mobile optimization: Stop auto-shoot when jump button released
                // 只有在射击键也没按下，且没有自动连发时才停止射击
                if (key === 'jump') {
                    if (!buttonState.shoot && !this.autoFire.isActive) {
                        Input.virtualKeys.shoot = false;
                        console.log('[TouchInput] Jump released - auto-shooting disabled');
                    } else {
                        console.log('[TouchInput] Jump released - keeping shoot active due to other source');
                    }
                }
                
                // 同样，如果松开的是射击键，但跳跃键还在按着，保持射击
                if (key === 'shoot') {
                    if (buttonState.jump || this.autoFire.isActive) {
                        Input.virtualKeys.shoot = true;
                    }
                }

                e.preventDefault();
            });

            btn.addEventListener('touchcancel', (e) => {
                // 连射按钮切换模式下，通常不因 touchcancel 而停止，除非用户滑出太远或系统中断
                if (key === 'autofire') return;

                if (key === 'shoot' || key === 'jump') {
                    buttonState[key] = false;
                }

                Input.virtualKeys[key] = false;
                btn.classList.remove('active');

                // Mobile optimization: Stop auto-shoot on touch cancel
                if (key === 'jump') {
                    if (!buttonState.shoot && !this.autoFire.isActive) {
                        Input.virtualKeys.shoot = false;
                        console.log('[TouchInput] Jump cancelled - auto-shooting disabled');
                    }
                }
            });
        });

        // 增加全局触摸释放监听，防止手指滑出按钮导致状态卡死
        window.addEventListener('touchend', (e) => {
            // 如果所有手指都离开了，且不是在处理摇杆，重置除自动连发外的所有虚拟键
            if (e.touches.length === 0) {
                Object.keys(Input.virtualKeys).forEach(k => {
                    if (k !== 'autofire' && !this.joystick.active) {
                        Input.virtualKeys[k] = false;
                    }
                });
                // 清除所有按钮的 active 类
                document.querySelectorAll('.action-btn, .aux-btn').forEach(b => b.classList.remove('active'));
            }
        });
    }
};
