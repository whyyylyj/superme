/**
 * touch-input.js
 * Handles virtual joystick and action buttons for mobile devices.
 *
 * Mobile-Only Optimizations:
 * - Auto-enable homing mode on touch devices (Task 1)
 * - Jump button triggers auto-shoot (Task 2)
 * - Full left screen joystick zone (invisible) (Task 3)
 *
 * Desktop Behavior:
 * - TouchInput.init() skips all initialization
 * - No changes to desktop keyboard controls
 * - Homing mode remains opt-in via M key
 *
 * Features:
 * - Virtual joystick with deadzone (invisible, full left screen)
 * - Action buttons with haptic feedback
 * - Multi-touch support
 * - Landscape orientation optimized
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
        maxRadius: 80,
        deadzone: 15
    },

    // 连射模式
    autoFire: {
        enabled: true, // 默认开启连射模式
        interval: 150, // 连射间隔（毫秒）
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

        console.log('[TouchInput] Initializing for touch device (full left screen joystick)');

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
            if (e.target.closest('.action-btn, .pause-btn, .virtual-joystick, .joystick-zone')) {
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

    /**
     * Setup invisible full left screen joystick zone
     * Uses dynamic first-touch positioning for better ergonomics
     */
    setupJoystick: function () {
        // Create invisible joystick zone covering entire left half of screen
        let joystickZone = document.getElementById('joystick-zone');
        
        if (!joystickZone) {
            joystickZone = document.createElement('div');
            joystickZone.id = 'joystick-zone';
            joystickZone.className = 'joystick-zone';
            // Insert at beginning of touch-controls
            const touchControls = document.getElementById('touch-controls');
            if (touchControls) {
                touchControls.insertBefore(joystickZone, touchControls.firstChild);
            }
        }

        // Track multiple touches for better landscape handling
        const activeTouches = new Map();

        joystickZone.addEventListener('touchstart', (e) => {
            e.preventDefault();
            
            for (let i = 0; i < e.changedTouches.length; i++) {
                const touch = e.changedTouches[i];
                
                // Only handle touches on left half of screen
                if (touch.clientX < window.innerWidth / 2) {
                    // First touch becomes the active joystick touch
                    if (!this.joystick.active) {
                        this.joystick.active = true;
                        this.joystick.touchId = touch.identifier;
                        // Use first touch position as the "center" for relative movement
                        this.joystick.startX = touch.clientX;
                        this.joystick.startY = touch.clientY;
                        activeTouches.set(touch.identifier, {
                            startX: touch.clientX,
                            startY: touch.clientY
                        });
                        
                        this.vibrate(10);
                        this.moveJoystick(touch);
                    } else {
                        // Store additional touches for potential handoff
                        activeTouches.set(touch.identifier, {
                            startX: touch.clientX,
                            startY: touch.clientY
                        });
                    }
                }
            }
        }, { passive: false });

        window.addEventListener('touchmove', (e) => {
            if (!this.joystick.active) return;

            for (let i = 0; i < e.changedTouches.length; i++) {
                const touch = e.changedTouches[i];
                
                // Handle active joystick touch
                if (touch.identifier === this.joystick.touchId) {
                    this.moveJoystick(touch);
                } 
                // Handle touch handoff if original touch ended but new touch is nearby
                else if (activeTouches.has(touch.identifier)) {
                    const stored = activeTouches.get(touch.identifier);
                    const dx = touch.clientX - stored.startX;
                    const dy = touch.clientY - stored.startY;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    // If new touch moved significantly, consider it for joystick
                    if (distance > 20 && !this.joystick.active) {
                        this.joystick.active = true;
                        this.joystick.touchId = touch.identifier;
                        this.joystick.startX = stored.startX;
                        this.joystick.startY = stored.startY;
                        this.moveJoystick(touch);
                    }
                }
            }
        }, { passive: false });

        window.addEventListener('touchend', (e) => {
            for (let i = 0; i < e.changedTouches.length; i++) {
                const touch = e.changedTouches[i];
                
                if (touch.identifier === this.joystick.touchId) {
                    this.resetJoystick();
                    activeTouches.delete(touch.identifier);
                    
                    // Try to handoff to another active touch
                    for (const [id, data] of activeTouches.entries()) {
                        if (data.startX < window.innerWidth / 2) {
                            this.joystick.active = true;
                            this.joystick.touchId = id;
                            this.joystick.startX = data.startX;
                            this.joystick.startY = data.startY;
                            break;
                        }
                    }
                } else {
                    activeTouches.delete(touch.identifier);
                }
            }
        });

        window.addEventListener('touchcancel', (e) => {
            for (let i = 0; i < e.changedTouches.length; i++) {
                const touch = e.changedTouches[i];
                if (touch.identifier === this.joystick.touchId) {
                    this.resetJoystick();
                }
                activeTouches.delete(touch.identifier);
            }
        });
    },

    /**
     * Move joystick based on touch position
     * Uses relative movement from first touch point
     */
    moveJoystick: function (touch) {
        // Get current scale to convert screen pixels to game pixels
        const scale = (typeof Responsive !== 'undefined') ? Responsive.getScale() : 1;

        // Calculate relative movement from start position
        const dx = (touch.clientX - this.joystick.startX) / scale;
        const dy = (touch.clientY - this.joystick.startY) / scale;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Update visual joystick knob (if visible for debugging)
        const knob = document.getElementById('joystick-knob');
        if (knob) {
            const limitedDistance = Math.min(distance, this.joystick.maxRadius);
            const angle = Math.atan2(dy, dx);
            const moveX = Math.cos(angle) * limitedDistance;
            const moveY = Math.sin(angle) * limitedDistance;
            knob.style.transform = `translate(calc(-50% + ${moveX}px), calc(-50% + ${moveY}px))`;
        }

        // Map to Input.virtualKeys with deadzone
        // Increased deadzone for more precise control
        const effectiveDeadzone = this.joystick.deadzone * 1.5;
        
        Input.virtualKeys.left = dx < -effectiveDeadzone;
        Input.virtualKeys.right = dx > effectiveDeadzone;
        Input.virtualKeys.up = dy < -effectiveDeadzone;
        Input.virtualKeys.down = dy > effectiveDeadzone;
    },

    /**
     * Reset joystick state
     */
    resetJoystick: function () {
        this.joystick.active = false;
        this.joystick.touchId = null;

        const knob = document.getElementById('joystick-knob');
        if (knob) {
            knob.style.transform = 'translate(-50%, -50%)';
        }

        Input.virtualKeys.left = false;
        Input.virtualKeys.right = false;
        Input.virtualKeys.up = false;
        Input.virtualKeys.down = false;
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
