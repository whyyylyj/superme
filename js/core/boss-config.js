/**
 * boss-config.js
 *
 * BossConfig - Boss 配置数据
 * 
 * 集中管理所有 Boss 的属性参数，便于平衡性调整
 * 无需修改 Boss 类代码，只需调整此配置文件
 *
 * 使用方法:
 *   const config = BossConfig.LEVEL1.TREANT_KING;
 *   const boss = new TreantKing(x, y, config);
 *
 * @author SuperMe Development Team
 * @version 1.0
 */

const BossConfig = {
    // ============================================
    // 第一关：树精王 (Treant King)
    // ============================================
    LEVEL1: {
        TREANT_KING: {
            // 基础属性
            name: 'Treant King',
            maxHp: 150,              // 生命值（已减半）
            width: 120,
            height: 140,
            color: '#2d5a27',        // 深绿色
            themeColor: '#4a7c43',   // 森林绿
            canFly: false,
            speed: 60,
            damage: 2,

            // 阶段配置
            phaseCount: 2,
            phase2Threshold: 0.5,    // 50% HP 进入阶段 2

            // 攻击冷却（秒）
            attackCooldown: {
                phase1: 1.2,
                phase2: 0.9,
            },

            // 弹幕配置
            bullets: {
                leafCircle: {
                    phase1Count: 8,
                    phase2Count: 12,
                    baseSpeed: 250,
                    speedVariance: 0.4,  // ±20%
                    color: '#4a7c43',
                },
                vineWhip: {
                    phase1Count: 5,
                    phase2Count: 7,
                    spreadAngle: Math.PI / 3,  // 60 度扇形
                    baseSpeed: 250,
                },
                seedScatter: {
                    phase1Count: 6,
                    phase2Count: 10,
                    baseSpeed: 250,
                    speedVariance: 0.6,  // ±30%
                    color: '#8b4513',
                },
                rootAttack: {
                    count: 3,
                    baseSpeed: 200,
                    speedBonus: 50,    // 变异加成
                    color: '#654321',
                },
            },

            // 召唤配置
            summon: {
                initialCooldown: 5,    // 初始召唤冷却（秒）
                type: 'seedling',
                maxMinions: 6,         // 场上最大小树人数量
            },

            // 特效配置
            effects: {
                mutationIntensityMax: 1.0,  // 最大变异强度
                leafRotationSpeed: Math.PI / 8,  // 叶子旋转速度
            },
        },
    },

    // ============================================
    // 第二关：烈焰魔龙 (Inferno Dragon)
    // ============================================
    LEVEL2: {
        INFERNO_DRAGON: {
            // 基础属性
            name: 'Inferno Dragon',
            maxHp: 300,              // 生命值（已减半）
            width: 140,
            height: 100,
            color: '#ff4500',        // 橙红色
            themeColor: '#ff6600',   // 火焰橙
            canFly: true,
            speed: 100,
            damage: 2,

            // 阶段配置
            phaseCount: 3,
            phase2Threshold: 0.66,   // 66% HP 进入阶段 2
            phase3Threshold: 0.33,   // 33% HP 进入阶段 3

            // 攻击冷却（秒）
            attackCooldown: {
                phase1: 1.5,
                phase2: 1.2,
                phase3: 0.9,
            },

            // 弹幕配置
            bullets: {
                fireballCircle: {
                    phase1Count: 8,
                    phase2Count: 12,
                    phase3Count: 16,
                    baseSpeed: 300,
                    color: '#ff4500',
                },
                flameStream: {
                    phase1Count: 7,
                    phase2Count: 10,
                    spreadAngle: Math.PI / 4,  // 45 度扇形
                },
                meteorShower: {
                    phase1Count: 5,
                    phase2Count: 8,
                    phase3Count: 12,
                    baseSpeed: 250,
                    speedVariance: 150,
                    color: '#ff0000',
                },
                homingFireball: {
                    phase1Count: 1,
                    phase2Count: 3,
                    phase3Count: 3,
                    baseSpeed: 280,
                    spreadAngle: 0.2,
                    color: '#ff6600',
                },
                crossPattern: {
                    arms: 4,
                    phase1BulletsPerArm: 5,
                    phase2BulletsPerArm: 8,
                    phase3BulletsPerArm: 8,
                    baseSpeed: 200,
                    speedIncrement: 30,
                    color: '#ff8c00',
                },
                spiralPattern: {
                    phase1Arms: 4,
                    phase2Arms: 6,
                    phase3Arms: 6,
                    rotationSpeed: 0.004,
                },
            },

            // 召唤配置
            summon: {
                type: 'fire_element',
                phase2Chance: 0.02,  // 2% 概率每帧
                phase3Chance: 0.03,  // 3% 概率每帧
                maxMinions: 8,
            },

            // 特殊技能配置
            skills: {
                meteorCooldown: 8,       // 陨石雨冷却（秒）
                fireBreathDuration: 3,   // 火焰喷射持续时间
                flightHeight: 200,       // 飞行高度
            },

            // 特效配置
            effects: {
                wingFlapCooldown: 0,
                explosionParticleCount: 15,
            },
        },
    },

    // ============================================
    // 第三关：天空暴君 (Sky Tyrant)
    // ============================================
    LEVEL3: {
        SKY_TYRANT: {
            // 基础属性
            name: 'Sky Tyrant',
            maxHp: 500,              // 生命值（已减半）
            width: 150,
            height: 150,
            color: '#8a2be2',        // 蓝紫色
            themeColor: '#9932cc',   // 暗紫色
            canFly: true,
            aiType: 'flying',
            speed: 120,
            damage: 3,

            // 阶段配置
            phaseCount: 4,
            phaseThresholds: [0.75, 0.50, 0.25],  // 各阶段转换阈值

            // 攻击冷却（秒）
            attackCooldown: {
                phase1: 1.8,
                phase2: 1.5,
                phase3: 1.2,
                phase4: 0.8,
            },

            // 弹幕配置
            bullets: {
                lightCircle: {
                    phase1Count: 10,
                    phase2Count: 14,
                    phase3Count: 18,
                    phase4Count: 24,
                    baseSpeed: 280,
                    color: '#e6e6fa',
                },
                voidFan: {
                    phase12Count: 8,
                    phase34Count: 12,
                    spreadAngle: Math.PI / 3,  // 60 度扇形
                },
                homingLight: {
                    phase12Count: 3,
                    phase34Count: 5,
                    baseSpeed: 300,
                    spreadAngle: 0.15,
                    color: '#dda0dd',
                },
                cosmicFlower: {
                    phase1Petals: 6,
                    phase2Petals: 8,
                    phase3Petals: 10,
                    phase4Petals: 12,
                    bulletsPerPetal: 5,
                    petalRotationSpeed: 0.003,
                    bulletSpread: 0.12,
                    baseSpeed: 200,
                    speedIncrement: 30,
                    color: '#ba55d3',
                },
                laser: {
                    minPhase: 3,
                    bulletCount: 20,
                    spread: 0.02,
                    baseSpeed: 500,
                    color: '#ff00ff',
                    cooldown: 6,
                },
                spiralPattern: {
                    phase1Arms: 4,
                    phase1Speed: 0.004,
                    phase2Arms: 6,
                    phase2Speed1: 0.005,
                    phase2Speed2: -0.003,
                    phase3Arms: 8,
                    phase3Speed1: 0.006,
                    phase3Speed2: -0.004,
                    phase3Speed3: 0.002,
                    phase4Arms: 10,
                    phase4SpeedBase: 0.008,
                    phase4SpeedIncrement: 0.002,
                },
            },

            // 召唤配置
            summon: {
                phase2Type: 'angel_orb',
                phase3Type: 'void_walker',
                phase4Type: 'light_orb',
                phase2Chance: 0.02,
                phase3Chance: 0.03,
                phase4Chance: 0.05,
                phase4Count: 3,
                phase4Interval: 300,  // ms
                maxMinions: 10,
            },

            // 特殊技能配置
            skills: {
                laserCooldown: 5,
                summonCooldown: 10,
                teleportInterval: 5,
            },

            // 特效配置
            effects: {
                fragmentCount: 8,
                fragmentRadius: 100,
                trailParticleLife: 1,
                shakeAmount: 40,
                glowPowerBase: 0,
                glowPowerPerPhase: 15,
            },

            // 外观配置
            appearance: {
                eyeOffsetX: 20,
                eyeOffsetY: -10,
                eyeRadius: 8,
                eyeGlowRadius: 3,
                mouthRadius: 15,
                gemRadius: 6,
                gemOffsetY: -35,
                ringCount: 4,
                ringRadius: 1.8,
                spikeCount: 8,
            },
        },
    },

    // ============================================
    // Boss 通用配置
    // ============================================
    GENERAL: {
        // 阶段转换特效
        phaseTransition: {
            shakeAmount: 20,
            flashIntensity: 1.0,
            shakeDuration: 0.5,
            flashDuration: 0.3,
            slowMotionFactor: 0.3,
            slowMotionDuration: 0.5,
            explosionParticleCount: 40,
        },

        // 入场动画
        entering: {
            duration: 2,           // 2 秒入场
            startScale: 0.5,
            endScale: 1.0,
        },

        // 死亡特效
        death: {
            waveCount: 5,
            waveInterval: 200,     // ms
            explosionPerWave: 15,
            finalExplosionDelay: 1200,  // ms
            finalExplosionColors: ['#ffffff', '#ff00ff'],
            finalExplosionParticleCount: [100, 80],
        },

        // 血条配置
        healthBar: {
            width: 400,
            height: 20,
            y: 30,
            backgroundColor: '#222222',
            borderColor: '#666666',
            borderWidth: 2,
        },

        // 行为状态
        behavior: {
            idleChance: 0.2,
            movingChance: 0.3,
            attackingChance: 0.2,
            patternChance: 0.3,
            idleDurationMin: 0.5,
            idleDurationMax: 1.0,
            movingDurationMin: 1.5,
            movingDurationMax: 2.5,
            attackingDurationMin: 2.0,
            attackingDurationMax: 3.0,
            patternDurationMin: 3.0,
            patternDurationMax: 5.0,
        },

        // 特效衰减
        effectsDecay: {
            flashDecayRate: 2.0,
            shakeDecayRate: 20.0,
        },

        // 受伤特效
        hitEffect: {
            shakeAmount: 5,
            flashIntensity: 0.3,
            particleCount: 5,
        },
    },
};
