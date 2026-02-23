// player.js

class Player extends Entity {
    constructor(x, y) {
        super(x, y, CONFIG.PLAYER.WIDTH, CONFIG.PLAYER.HEIGHT, CONFIG.FORMS.NORMAL);

        // 🔧 P1修复：TransformSystem.init() 由 initGame() 统一调用，此处不重复初始化
        // 确保 TransformSystem 已经就绪
        if (!TransformSystem.currentForm) {
            TransformSystem.init();
        }

        this.speed = CONFIG.PLAYER.BASE_SPEED;
        this.jumpForce = CONFIG.PLAYER.JUMP_FORCE;
        this.gravity = CONFIG.PLAYER.GRAVITY;

        this.onGround = false;
        this.maxHp = CONFIG.PLAYER.MAX_HP;
        this.hp = this.maxHp;

        this.jumpCount = 0;
        this.maxJumps = CONFIG.PLAYER.MAX_JUMPS;
        this.jumpBtnWasPressed = false;

        this.weapon = 'normal';

        this.bambooMode = false;
        this.bambooTimer = 0;
        this.bambooMaxTime = CONFIG.POWERUPS.BAMBOO.DURATION;

        this.invincible = false;
        this.invincibleTimer = 0;
        this.invincibleMaxTime = CONFIG.POWERUPS.STAR.DURATION;

        this.shieldMode = false;

        this.speedMode = false;
        this.speedTimer = 0;
        this.speedMaxTime = CONFIG.POWERUPS.SPEED.DURATION;

        // Giant Mode
        this.isGiant = false;
        this.giantTimer = 0;
        this.giantMaxTime = CONFIG.POWERUPS.GIANT_MUSHROOM.DURATION;

        this.shootCooldown = 0;

        this.facing = 1;

        this.damageCooldown = 0;

        this.homingMode = false;
        this.homingBtnWasPressed = false;

        this.transformBtnWasPressed = false;

        this.score = 0;

        // 坐下回血
        this.sitMode = false;
        this.sitTimer = 0;
        this.sitWasPressed = false;

        // 梦话效果
        this.dreamTextTimer = 0;
        this.currentDreamText = '';
        this.dreamTextY = 0;

        // 🔧 FIX: 天花板碰撞标志，防止飞行模式穿透平台
        this.hitCeiling = false;
        this.ceilingPlatform = null;  // 记录撞到的平台
    }

    update(dt, platforms, levelWidth) {
        TransformSystem.update(dt, this);

        if (this.bambooMode) {
            this.bambooTimer -= dt;
            if (this.bambooTimer <= 0) this.bambooMode = false;
        }

        if (this.invincible) {
            this.invincibleTimer -= dt;
            if (this.invincibleTimer <= 0) this.invincible = false;
        }

        if (this.speedMode) {
            this.speedTimer -= dt;
            if (this.speedTimer <= 0) {
                this.speedMode = false;
                this.speed = CONFIG.PLAYER.BASE_SPEED;
            } else {
                this.speed = CONFIG.POWERUPS.SPEED.BOOSTED_SPEED;
            }
        } else {
            this.speed = TransformSystem.getSpeed();
        }

        if (this.isGiant) {
            this.giantTimer -= dt;
            if (this.giantTimer <= 0) {
                this.isGiant = false;
            }
        }

        if (this.damageCooldown > 0) {
            this.damageCooldown -= dt;
        }

        if (this.shootCooldown > 0) {
            this.shootCooldown -= dt;
        }

        // 坐下回血逻辑
        if (Input.sit && this.onGround && !this.sitWasPressed) {
            this.sitMode = !this.sitMode;
            this.sitWasPressed = true;
            this.sitTimer = 0;
        }
        if (!Input.sit) {
            this.sitWasPressed = false;
        }

        // 坐下时不能移动或攻击
        if (this.sitMode) {
            this.vx = 0;
            this.vy = 0;
            this.sitTimer += dt;

            // 每 5 秒恢复 1 点 HP
            if (this.sitTimer >= CONFIG.PLAYER.SIT_HEAL_TIME) {
                // 🔧 防御性编程：确保 hp 和 maxHp 都是有效数字
                const currentHp = Number(this.hp) || 0;
                const maxHp = Number(this.maxHp) || CONFIG.PLAYER.MAX_HP;
                const healAmount = Number(CONFIG.PLAYER.SIT_HEAL_AMOUNT) || 1;

                if (currentHp < maxHp) {
                    this.hp = Math.min(maxHp, currentHp + healAmount);
                    ParticleSystem.createExplosion(this.x + this.width / 2, this.y + this.height / 2, '#00ff00', 10);

                    // 血满后自动退出休息状态
                    if (this.hp >= maxHp) {
                        this.sitMode = false;
                        this.sitTimer = 0;
                        this.currentDreamText = '';
                    }
                }
                this.sitTimer = 0;
            }

            // 梦话效果：每 2-4 秒显示一个随机梦话
            this.dreamTextTimer += dt;
            const dreamInterval = 2 + Math.random() * 2;
            if (this.dreamTextTimer >= dreamInterval && !this.currentDreamText) {
                this.currentDreamText = this.getRandomDreamText();
                this.dreamTextY = this.y - 60;
                this.dreamTextTimer = 0;
            }
            // 气泡向上飘动
            if (this.currentDreamText) {
                this.dreamTextY -= 20 * dt;
                // 3 秒后消失
                if (this.dreamTextY < this.y - 120) {
                    this.currentDreamText = '';
                }
            }
        } else {
            // 正常移动逻辑
            if (Input.left) {
                this.vx = -this.speed;
                this.facing = -1;
            } else if (Input.right) {
                this.vx = this.speed;
                this.facing = 1;
            } else {
                this.vx = 0;
            }
        }

        if (TransformSystem.canFly()) {
            // 🔧 FIX: 在飞行模式下，如果撞到天花板，检查玩家是否离开平台底部
            if (this.hitCeiling && this.ceilingPlatform) {
                // 检查玩家是否仍然在天花板平台底部附近
                const platformBottom = this.ceilingPlatform.y + this.ceilingPlatform.height;
                const playerTop = this.y;
                const tolerance = 5;  // 容差像素

                // 如果玩家已经向下离开平台底部，清除标志
                if (playerTop > platformBottom + tolerance) {
                    this.hitCeiling = false;
                    this.ceilingPlatform = null;
                }

                // 如果仍然在平台底部，限制向上移动
                if (this.hitCeiling) {
                    if (Input.down) {
                        // 按下键，清除标志
                        this.hitCeiling = false;
                        this.ceilingPlatform = null;
                        this.vy = this.speed;
                    } else if (!Input.up) {
                        // 松开上键，清除标志
                        this.hitCeiling = false;
                        this.ceilingPlatform = null;
                        this.vy = 0;
                    } else {
                        // 仍然按上键，保持 vy = 0，阻止穿透
                        this.vy = 0;
                    }
                } else {
                    // 已经离开平台底部，恢复正常飞行
                    if (Input.up) this.vy = -this.speed;
                    else if (Input.down) this.vy = this.speed;
                    else this.vy = 0;
                }
            } else {
                if (Input.up) this.vy = -this.speed;
                else if (Input.down) this.vy = this.speed;
                else this.vy = 0;
            }
        } else if (this.bambooMode) {
            if (Input.up) this.vy = -this.speed;
            else if (Input.down) this.vy = this.speed;
            else this.vy = 0;
        } else {
            this.vy += this.gravity * dt;
            if (this.vy > 800) this.vy = 800;

            if (Input.jump) {
                // 🔧 P2修复：此 else 分支已保证非飞行态，无需再判断 canFly()
                const maxJumps = this.bambooMode
                    ? this.maxJumps
                    : (TransformSystem.currentForm?.maxJumps || this.maxJumps);
                if (!this.jumpBtnWasPressed && this.jumpCount < maxJumps) {
                    this.vy = this.jumpForce;
                    this.onGround = false;
                    this.jumpCount++;
                    ParticleSystem.createExplosion(this.x + this.width / 2, this.y + this.height, '#aaaaaa', 5);
                }
                this.jumpBtnWasPressed = true;
            } else {
                this.jumpBtnWasPressed = false;
            }
        }

        this.x += this.vx * dt;
        if (!TransformSystem.canPassThrough()) {
            this.checkCollisions(platforms, 'x');
        }

        if (this.x < 0) this.x = 0;
        if (this.x + this.width > levelWidth) this.x = levelWidth - this.width;

        this.y += this.vy * dt;
        this.onGround = false;
        if (!TransformSystem.canPassThrough()) {
            this.checkCollisions(platforms, 'y');
        }

        if (this.y < 0) this.y = 0;

        // 🔧 FIX: 下边界处理
        // 如果是具有 voidLine 的关卡（如第三关），允许落入虚空触发死亡
        // 在普通关卡中，允许玩家掉入陷阱（死亡线 1200），但对于飞行模式，
        // 我们给一个合理的下限，防止其无限飞出视界，同时不影响掉入陷阱的逻辑。
        const currentLevel = (typeof LevelManager !== 'undefined') ? LevelManager.currentLevel : null;
        const voidLine = currentLevel ? currentLevel.voidLine : null;

        if (voidLine !== null && voidLine !== undefined) {
            // 虚空关卡：允许下落到虚空线，但超过一定深度后限制位置，防止坐标异常
            if (this.y > voidLine + 200) this.y = voidLine + 200;
        } else {
            // 普通关卡：允许玩家下落到全局死亡线 (1200)，但不允许超过它太远 (1500)
            if (this.y > 1500) this.y = 1500;
        }

        // 🔧 FIX: 每帧检查天花板平台是否仍然有效
        // 如果 ceilingPlatform 存在但玩家已经离开，清除标志
        if (this.ceilingPlatform) {
            const platformBottom = this.ceilingPlatform.y + this.ceilingPlatform.height;
            const playerTop = this.y;
            const tolerance = 10;  // 稍大的容差

            // 玩家已经向下离开平台
            if (playerTop > platformBottom + tolerance) {
                this.hitCeiling = false;
                this.ceilingPlatform = null;
            }
        }
    }

    checkCollisions(platforms, axis) {
        for (let plat of platforms) {
            if (Physics.checkCollision(this, plat)) {
                if (axis === 'x') {
                    if (this.vx > 0) {
                        this.x = plat.x - this.width;
                    } else if (this.vx < 0) {
                        this.x = plat.x + plat.width;
                    } else {
                        // 🔧 FIX: 静止重叠处理（例如变身后尺寸变化）
                        // 使用 getIntersection 来找到最小重叠并推出
                        const intersect = Physics.getIntersection(this, plat);
                        if (intersect && intersect.axis === 'x') {
                            this.x += intersect.depth * intersect.dir;
                        }
                    }
                    this.vx = 0;
                } else if (axis === 'y') {
                    if (this.vy > 0) {
                        this.y = plat.y - this.height;
                        this.onGround = true;
                        this.jumpCount = 0;
                        this.ceilingPlatform = null;  // 落到地面，清除天花板记录
                    } else if (this.vy < 0) {
                        // 🔧 FIX: 撞到平台底部时，把玩家推到平台下方
                        this.y = plat.y + plat.height;
                        this.hitCeiling = true;
                        this.ceilingPlatform = plat;  // 记录撞到的平台
                    } else {
                        // 🔧 FIX: 静止重叠处理
                        const intersect = Physics.getIntersection(this, plat);
                        if (intersect && intersect.axis === 'y') {
                            this.y += intersect.depth * intersect.dir;
                            // 如果是向上推，视为在地面上
                            if (intersect.dir < 0) {
                                this.onGround = true;
                                this.jumpCount = 0;
                            }
                        }
                    }
                    this.vy = 0;
                }
            }
        }
    }

    shoot(bullets) {
        // 坐下时不能射击
        if (this.sitMode) return;
        if (this.shootCooldown > 0) return;
        TransformSystem.shoot(this, bullets);
    }

    getRandomDreamText() {
        const dreamTexts = [
            // 经典打呼
            'Zzz...', 'ZzZ...', '💤', '😴', '呼噜～',
            // 困倦类
            '好困...', '想睡觉...', '眼皮好重...', '撑不住了...',
            // 休息类
            '休息中...', '回血中...', '充电 50%...', '挂机中...',
            // 撒娇类
            '别吵...', '让我睡会...', '再睡 5 分钟...', '好累...',
            // 游戏梗
            'Boss 在哪？', '这关好难...', '我要变强...', '像素世界...',
            // 英文
            'Good night...', 'Sweet dreams...', 'So tired...', 'Need coffee...',
            // 可爱
            '呼噜呼噜...', '做个好梦...', '数羊中...', '晚安～',
        ];
        return dreamTexts[Math.floor(Math.random() * dreamTexts.length)];
    }

    addScore(amount) {
        this.score += amount;
        // 触发得分视觉效果（可选，以后添加）
    }

    takeDamage(damage = 1) {
        const dmgMult = TransformSystem.getDamageMultiplier();
        if (dmgMult === 0) return;

        if (this.invincible || this.damageCooldown > 0) return;

        if (this.shieldMode) {
            this.shieldMode = false;
            this.damageCooldown = CONFIG.PLAYER.DAMAGE_COOLDOWN;
            ParticleSystem.createExplosion(this.x + this.width / 2, this.y + this.height / 2, '#0000ff', 20);
            return;
        }

        // 🔧 防御性编程：确保 hp 和 damage 都是有效数字
        const currentHp = Number(this.hp) || 0;
        const actualDamage = Number(damage) || 1;
        this.hp = currentHp - actualDamage * dmgMult;
        this.damageCooldown = CONFIG.PLAYER.DAMAGE_COOLDOWN;

        // Visual Feedback
        ScreenEffects.shake(10, 0.2);
        ScreenEffects.flash('rgba(255, 0, 0, 0.3)', 0.1);

        // Haptic Feedback for mobile
        if (typeof TouchInput !== 'undefined' && TouchInput.vibrate) {
            TouchInput.vibrate([40, 60, 40]);
        }

        ParticleSystem.createExplosion(this.x + this.width / 2, this.y + this.height / 2, '#ff0000', 15);
        if (this.hp <= 0) {
            this.markedForDeletion = true;
        }
    }

    draw(ctx, cameraX, cameraY) {
        if (this.damageCooldown > 0) {
            if (Math.floor(Date.now() / 100) % 2 === 0) return;
        }

        ctx.save();

        // 坐下状态：绘制坐下的视觉效果（变矮的矩形）
        if (this.sitMode) {
            const sitHeight = this.height * 0.6;
            const sitY = this.y + (this.height - sitHeight);

            ctx.fillStyle = TransformSystem.currentForm?.color || CONFIG.FORMS.NORMAL;
            ctx.shadowBlur = 15;
            ctx.shadowColor = ctx.fillStyle;
            ctx.fillRect(this.x - cameraX, sitY - cameraY, this.width, sitHeight);

            // ZzZ 标识 - 动态飘动效果
            const time = Date.now() / 1000;
            const zOffset1 = Math.sin(time * 3) * 3;
            const zOffset2 = Math.sin(time * 3 + 2) * 3;

            ctx.font = 'bold 16px "Press Start 2P", monospace';
            ctx.fillStyle = '#88ccff';
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#88ccff';

            // 绘制三个 Z，位置逐渐升高
            ctx.fillText('Z', this.x - cameraX + this.width + 5, sitY - cameraY - 10 + zOffset1);
            ctx.font = 'bold 14px "Press Start 2P", monospace';
            ctx.fillText('z', this.x - cameraX + this.width + 18, sitY - cameraY - 20 + zOffset2);
            ctx.font = 'bold 12px "Press Start 2P", monospace';
            ctx.fillText('z', this.x - cameraX + this.width + 28, sitY - cameraY - 28 + zOffset1);

            // 气泡效果 - 梦话
            if (this.currentDreamText) {
                const bubbleX = this.x - cameraX + this.width / 2;
                const bubbleY = this.dreamTextY - cameraY;

                // 动态计算气泡大小
                ctx.font = '10px "Press Start 2P", monospace';
                const textWidth = ctx.measureText(this.currentDreamText).width;
                const radiusX = Math.max(40, textWidth / 2 + 15);
                const radiusY = 18;

                // 气泡主体（半透明圆形）
                ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
                ctx.shadowBlur = 5;
                ctx.shadowColor = '#ffffff';
                ctx.beginPath();
                ctx.ellipse(bubbleX, bubbleY, radiusX, radiusY, 0, 0, Math.PI * 2);
                ctx.fill();

                // 气泡边框
                ctx.strokeStyle = 'rgba(200, 200, 200, 0.8)';
                ctx.lineWidth = 2;
                ctx.stroke();

                // 气泡尾巴（指向玩家）
                ctx.beginPath();
                ctx.moveTo(bubbleX - 10, bubbleY + radiusY - 3);
                ctx.lineTo(bubbleX, bubbleY + radiusY + 10);
                ctx.lineTo(bubbleX + 10, bubbleY + radiusY - 3);
                ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
                ctx.fill();
                ctx.stroke();

                // 梦话文本
                ctx.fillStyle = '#333333';
                ctx.shadowBlur = 0;
                ctx.textAlign = 'center';
                ctx.fillText(this.currentDreamText, bubbleX, bubbleY + 4);
                ctx.textAlign = 'left';
            }

            // 回血进度提示（绿色小圆点，带脉冲效果）
            const progress = this.sitTimer / CONFIG.PLAYER.SIT_HEAL_TIME;
            const pulseSize = 4 + Math.sin(time * 5) * 2 + progress * 3;
            ctx.fillStyle = `rgba(0, 255, 100, ${0.6 + progress * 0.4})`;
            ctx.beginPath();
            ctx.arc(this.x - cameraX + this.width / 2, sitY - cameraY - 8, pulseSize, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.invincible) {
            const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
            ctx.fillStyle = colors[Math.floor(Date.now() / 50) % colors.length];
            ctx.shadowBlur = 20;
            ctx.shadowColor = ctx.fillStyle;
            ctx.fillRect(this.x - cameraX, this.y - cameraY, this.width, this.height);
        } else {
            TransformSystem.draw(ctx, this, cameraX, cameraY);
        }

        if (this.shieldMode) {
            ctx.strokeStyle = 'rgba(0, 100, 255, 0.8)';
            ctx.lineWidth = 4;
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#0000ff';
            ctx.strokeRect(this.x - cameraX - 4, this.y - cameraY - 4, this.width + 8, this.height + 8);
        }

        ctx.restore();
    }
}
