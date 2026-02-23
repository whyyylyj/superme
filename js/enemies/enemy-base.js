/**
 * enemy-base.js
 *
 * EnemyBase - 强大的敌人基类，支持多种AI模式和行为
 *
 * AI模式:
 * - 'patrol': 巡逻模式，在指定范围内来回移动
 * - 'chase': 追踪模式，主动追踪玩家
 * - 'suicide': 自爆模式，接近玩家后自爆
 * - 'stationary': 固定模式，不移动但可攻击
 * - 'flying': 飞行模式，无视重力，空中移动
 *
 * @author SuperMe Development Team
 * @version 1.0
 */

class EnemyBase extends Entity {
    /**
     * 创建敌人实例
     * @param {number} x - 初始X坐标
     * @param {number} y - 初始Y坐标
     * @param {Object} config - 敌人配置
     * @param {string} config.aiType - AI类型 ('patrol', 'chase', 'suicide', 'stationary', 'flying')
     * @param {number} config.hp - 生命值
     * @param {number} config.width - 宽度
     * @param {number} config.height - 高度
     * @param {string} config.color - 颜色
     * @param {number} config.speed - 移动速度
     * @param {number} config.damage - 对玩家造成的伤害
     * @param {number} config.patrolDist - 巡逻距离（仅patrol模式）
     * @param {number} config.detectionRange - 检测玩家的范围
     * @param {number} config.score - 击杀得分
     */
    constructor(x, y, config = {}) {
        // 默认配置
        const defaultConfig = {
            aiType: 'patrol',
            hp: 2,
            width: 30,
            height: 30,
            color: '#ff3333',
            speed: 100,
            damage: 1,
            patrolDist: 150,
            detectionRange: 400,
            score: 100,
            gravity: 1500
        };

        // 合并配置
        const finalConfig = { ...defaultConfig, ...config };

        super(x, y, finalConfig.width, finalConfig.height, finalConfig.color);

        // 配置属性
        this.aiType = finalConfig.aiType;
        this.maxHp = finalConfig.hp;
        this.hp = this.maxHp;
        this.speed = finalConfig.speed;
        this.damage = finalConfig.damage;
        this.patrolDist = finalConfig.patrolDist;
        this.detectionRange = finalConfig.detectionRange;
        this.score = finalConfig.score;
        this.gravity = finalConfig.gravity;

        // 状态属性
        this.vx = 0;
        this.vy = 0;
        this.facing = 1; // 1 = 右, -1 = 左
        this.startX = x;
        this.startY = y;

        // AI状态
        this.state = 'idle'; // idle, patrol, chase, attack, hurt, dying
        this.stateTimer = 0;
        this.target = null;

        // 视觉效果
        this.flashTime = 0; // 受伤闪烁时间
        this.glowPower = 0;
        this.scale = 1;

        // 攻击相关
        this.attackCooldown = 0;
        this.attackInterval = 2; // 攻击间隔（秒）
    }

    /**
     * 更新敌人状态
     * @param {number} dt - 帧间隔时间（秒）
     * @param {Object} player - 玩家对象
     * @param {Array} platforms - 平台数组
     * @param {Array} bullets - 子弹数组（可选，用于发射子弹）
     */
    update(dt, player, platforms, bullets = null) {
        this.lastDt = dt; // 存储 dt 以供子系统使用
        // 更新状态计时器
        if (this.stateTimer > 0) {
            this.stateTimer -= dt;
        }

        // 更新受伤闪烁
        if (this.flashTime > 0) {
            this.flashTime -= dt;
        }

        // 更新攻击冷却
        if (this.attackCooldown > 0) {
            this.attackCooldown -= dt;
        }

        // AI行为逻辑
        this.updateAI(dt, player);

        // 应用物理
        this.applyPhysics(dt);

        // 碰撞检测
        this.handlePlatformCollision(platforms);

        // 边界检查
        this.checkBounds();
    }

    /**
     * AI行为更新
     */
    updateAI(dt, player) {
        const distToPlayer = this.getDistanceTo(player);

        switch (this.aiType) {
            case 'patrol':
                this.updatePatrolAI(dt, player, distToPlayer);
                break;
            case 'chase':
                this.updateChaseAI(dt, player, distToPlayer);
                break;
            case 'suicide':
                this.updateSuicideAI(dt, player, distToPlayer);
                break;
            case 'stationary':
                this.updateStationaryAI(dt, player, distToPlayer);
                break;
            case 'flying':
                this.updateFlyingAI(dt, player, distToPlayer);
                break;
        }
    }

    /**
     * 巡逻AI
     */
    updatePatrolAI(dt, player, distToPlayer) {
        // 如果玩家在检测范围内，切换到追踪状态
        if (distToPlayer < this.detectionRange) {
            this.state = 'chase';
        } else {
            this.state = 'patrol';
        }

        if (this.state === 'patrol') {
            // 左右巡逻
            if (this.x > this.startX + this.patrolDist) {
                this.vx = -this.speed;
                this.facing = -1;
            } else if (this.x < this.startX - this.patrolDist) {
                this.vx = this.speed;
                this.facing = 1;
            } else {
                this.vx = this.speed * this.facing;
            }
        } else if (this.state === 'chase') {
            // 追踪玩家
            if (player.x < this.x) {
                this.vx = -this.speed * 1.5;
                this.facing = -1;
            } else {
                this.vx = this.speed * 1.5;
                this.facing = 1;
            }
        }
    }

    /**
     * 追踪AI
     */
    updateChaseAI(dt, player, distToPlayer) {
        if (distToPlayer < this.detectionRange) {
            if (player.x < this.x) {
                this.vx = -this.speed;
                this.facing = -1;
            } else {
                this.vx = this.speed;
                this.facing = 1;
            }

            // 尝试跳跃去追玩家
            if (player.y < this.y - 50 && Math.abs(player.x - this.x) < 100) {
                if (this.isOnGround()) {
                    this.vy = -600; // 跳跃
                }
            }
        } else {
            this.vx = 0;
        }
    }

    /**
     * 自爆AI
     */
    updateSuicideAI(dt, player, distToPlayer) {
        // 持续追踪玩家
        if (player.x < this.x) {
            this.vx = -this.speed * 1.8;
            this.facing = -1;
        } else {
            this.vx = this.speed * 1.8;
            this.facing = 1;
        }

        // 接近玩家时加速
        if (distToPlayer < 100) {
            this.vx *= 1.5;
            this.glowPower = 20; // 闪烁警告
        }

        // 接触玩家时自爆
        if (distToPlayer < 30) {
            this.explode();
        }
    }

    /**
     * 固定AI
     */
    updateStationaryAI(dt, player, distToPlayer) {
        this.vx = 0;
        // 面向玩家
        this.facing = player.x < this.x ? -1 : 1;

        // 可以在这里添加攻击逻辑
        if (distToPlayer < this.detectionRange && this.attackCooldown <= 0) {
            this.attack(player);
            this.attackCooldown = this.attackInterval;
        }
    }

    /**
     * 飞行AI
     */
    updateFlyingAI(dt, player, distToPlayer) {
        // 飞行敌人无视重力，向玩家移动
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 0) {
            this.vx = (dx / dist) * this.speed;
            this.vy = (dy / dist) * this.speed;
        }

        this.facing = this.vx >= 0 ? 1 : -1;
    }

    /**
     * 应用物理
     */
    applyPhysics(dt) {
        // 飞行类型不应用重力
        if (this.aiType !== 'flying') {
            this.vy += this.gravity * dt;
        }

        // 限制最大下落速度
        if (this.vy > 1000) {
            this.vy = 1000;
        }

        this.x += this.vx * dt;
        this.y += this.vy * dt;
    }

    /**
     * 处理平台碰撞
     */
    handlePlatformCollision(platforms) {
        let onGround = false;
        // 🔧 P1修复：使用存储的 dt 以支持变帧率物理
        const physicsDt = this.lastDt || 0.016;

        for (let plat of platforms) {
            if (Physics.checkCollision(this, plat)) {
                // Y轴碰撞（落地）
                // 🔧 P1修复：更稳健的落地判定
                if (this.vy >= 0 && this.y + this.height - this.vy * physicsDt <= plat.y + 5) {
                    this.y = plat.y - this.height;
                    this.vy = 0;
                    onGround = true;
                }
                // X轴碰撞
                else if (Math.abs(this.vx) > 0) {
                    if (this.vx > 0) {
                        this.x = plat.x - this.width;
                    } else {
                        this.x = plat.x + plat.width;
                    }
                    this.vx *= -1;
                    this.facing *= -1;
                }
            }
        }

        // 边缘检测（避免掉下平台）
        if (onGround && this.aiType === 'patrol') {
            const checkX = this.facing === 1 ? this.x + this.width + 5 : this.x - 5;
            let edge = true;

            for (let plat of platforms) {
                if (checkX >= plat.x && checkX <= plat.x + plat.width &&
                    this.y + this.height + 5 >= plat.y) {
                    edge = false;
                    break;
                }
            }

            if (edge) {
                this.vx *= -1;
                this.facing *= -1;
            }
        }
    }

    /**
     * 边界检查
     */
    checkBounds() {
        // 如果掉出关卡，标记删除
        if (this.y > 1000) {
            this.markedForDeletion = true;
        }
    }

    /**
     * 检查是否在地面上
     */
    isOnGround() {
        return this.vy === 0;
    }

    /**
     * 计算到玩家的距离
     */
    getDistanceTo(player) {
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * 攻击（子类可覆盖）
     */
    attack(player) {
        // 基础攻击：发射子弹（如果有子弹系统）
        // 子类可以覆盖实现不同的攻击方式
    }

    /**
     * 自爆
     */
    explode() {
        this.markedForDeletion = true;
        ParticleSystem.createExplosion(
            this.x + this.width / 2,
            this.y + this.height / 2,
            this.color,
            40
        );
        // 这里应该对玩家造成伤害，需要通过事件系统或直接调用
    }

    /**
     * 受到伤害
     */
    takeDamage(damage) {
        this.hp -= damage;
        this.flashTime = 0.1; // 受伤闪烁

        // 受伤特效
        ParticleSystem.createExplosion(
            this.x + this.width / 2,
            this.y + this.height / 2,
            '#ffffff',
            5
        );

        if (this.hp <= 0) {
            this.die();
        }
    }

    /**
     * 死亡
     */
    die() {
        this.markedForDeletion = true;
        this.scale = 1.5; // 死亡放大效果

        // 死亡爆炸特效
        ParticleSystem.createExplosion(
            this.x + this.width / 2,
            this.y + this.height / 2,
            this.color,
            25
        );
        ParticleSystem.createExplosion(
            this.x + this.width / 2,
            this.y + this.height / 2,
            '#ffffff',
            10
        );
    }

    /**
     * 绘制敌人
     */
    draw(ctx, cameraX, cameraY) {
        ctx.save();

        // 受伤闪烁效果
        if (this.flashTime > 0) {
            ctx.fillStyle = '#ffffff';
        } else {
            ctx.fillStyle = this.color;
        }

        // 发光效果
        ctx.shadowBlur = 10 + this.glowPower;
        ctx.shadowColor = this.color;

        // 绘制主体
        const drawX = this.x - cameraX + this.width / 2;
        const drawY = this.y - cameraY + this.height / 2;
        const drawW = this.width * this.scale;
        const drawH = this.height * this.scale;

        ctx.fillRect(drawX - drawW / 2, drawY - drawH / 2, drawW, drawH);

        // 绘制眼睛
        ctx.fillStyle = '#000000';
        ctx.shadowBlur = 0;
        const eyeOffsetX = this.facing === 1 ? drawW / 4 : -drawW / 4;

        // 左眼
        ctx.beginPath();
        ctx.arc(drawX + eyeOffsetX - 5, drawY - drawH / 6, 3, 0, Math.PI * 2);
        ctx.fill();

        // 右眼
        ctx.beginPath();
        ctx.arc(drawX + eyeOffsetX + 5, drawY - drawH / 6, 3, 0, Math.PI * 2);
        ctx.fill();

        // 绘制血条（如果受伤）
        if (this.hp < this.maxHp) {
            this.drawHealthBar(ctx, cameraX, cameraY);
        }

        ctx.restore();
    }

    /**
     * 绘制血条
     */
    drawHealthBar(ctx, cameraX, cameraY) {
        const barWidth = this.width;
        const barHeight = 4;
        const barX = this.x - cameraX;
        const barY = this.y - cameraY - 10;

        // 背景
        ctx.fillStyle = '#333333';
        ctx.fillRect(barX, barY, barWidth, barHeight);

        // 血量
        const healthPercent = this.hp / this.maxHp;
        ctx.fillStyle = healthPercent > 0.3 ? '#00ff00' : '#ff0000';
        ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);
    }
}
