/**
 * pattern-weaver.js
 *
 * 弹幕编织器
 * 将多个基础弹幕模式组合成复杂弹幕
 *
 * 特性:
 * - 并行组合：同时发射多种弹幕
 * - 顺序组合：按时间顺序切换弹幕
 * - 交替组合：交替发射不同弹幕
 * - 螺旋融合：弹幕以不同速度旋转融合
 * - 预设组合库：常用弹幕组合预设
 *
 * @author SuperMe Development Team
 * @version 1.0
 */

class PatternWeaver {
    constructor(emitter) {
        this.emitter = emitter;
        this.activeWeaves = new Map(); // 当前活跃的编织弹幕
        this.weaveIdCounter = 0;
    }

    /**
     * 组合两种弹幕模式
     * @param {string} pattern1 - 第一种模式名称
     * @param {Object} params1 - 第一种模式参数
     * @param {string} pattern2 - 第二种模式名称
     * @param {Object} params2 - 第二种模式参数
     * @param {string} blendMode - 混合模式（'sequential'/'parallel'/'interleave'/'spiral_merge'）
     * @param {number} duration - 持续时间（秒）
     * @returns {Object} 组合弹幕配置
     */
    combine(pattern1, params1, pattern2, params2, blendMode = 'parallel', duration = 5) {
        const combinedPattern = {
            type: 'combined',
            mode: blendMode,
            patterns: [
                { name: pattern1, params: params1 },
                { name: pattern2, params: params2 }
            ],
            timer: 0,
            duration: duration,
            weaveId: ++this.weaveIdCounter
        };

        return combinedPattern;
    }

    /**
     * 组合三种弹幕模式（高级组合）
     */
    combineTriple(pattern1, params1, pattern2, params2, pattern3, params3, blendMode = 'parallel', duration = 6) {
        const combinedPattern = {
            type: 'combined',
            mode: blendMode,
            patterns: [
                { name: pattern1, params: params1 },
                { name: pattern2, params: params2 },
                { name: pattern3, params: params3 }
            ],
            timer: 0,
            duration: duration,
            weaveId: ++this.weaveIdCounter
        };

        return combinedPattern;
    }

    /**
     * 执行组合弹幕
     * @param {Object} combinedPattern - 组合弹幕配置
     * @param {number} dt - 时间增量
     * @returns {boolean} 是否仍在活跃状态
     */
    execute(combinedPattern, dt) {
        combinedPattern.timer += dt;

        if (combinedPattern.timer > combinedPattern.duration) {
            return false; // 结束
        }

        switch (combinedPattern.mode) {
            case 'parallel':
                this.executeParallel(combinedPattern);
                break;

            case 'sequential':
                this.executeSequential(combinedPattern);
                break;

            case 'interleave':
                this.executeInterleave(combinedPattern);
                break;

            case 'spiral_merge':
                this.executeSpiralMerge(combinedPattern);
                break;

            case 'cascade':
                this.executeCascade(combinedPattern);
                break;

            case 'random':
                this.executeRandom(combinedPattern);
                break;
        }

        return true;
    }

    /**
     * 并行模式：同时发射所有弹幕
     */
    executeParallel(combinedPattern) {
        combinedPattern.patterns.forEach(patternDef => {
            this.executePattern(patternDef);
        });
    }

    /**
     * 顺序模式：按时间顺序切换弹幕
     */
    executeSequential(combinedPattern) {
        const patternCount = combinedPattern.patterns.length;
        const timePerPattern = combinedPattern.duration / patternCount;
        const currentIndex = Math.floor(combinedPattern.timer / timePerPattern);

        if (currentIndex < patternCount) {
            this.executePattern(combinedPattern.patterns[currentIndex]);
        }
    }

    /**
     * 交替模式：交替发射不同弹幕（每0.5秒切换）
     */
    executeInterleave(combinedPattern) {
        const switchInterval = 0.5; // 切换间隔（秒）
        const phase = Math.floor(combinedPattern.timer / switchInterval) % combinedPattern.patterns.length;

        this.executePattern(combinedPattern.patterns[phase]);
    }

    /**
     * 螺旋融合模式：弹幕以不同速度旋转融合
     */
    executeSpiralMerge(combinedPattern) {
        combinedPattern.patterns.forEach((patternDef, index) => {
            const rotationSpeed = 2 + index; // 不同模式不同旋转速度
            const angle = combinedPattern.timer * rotationSpeed + (index * Math.PI / 2);

            const params = { ...patternDef.params, angleOffset: angle };
            this.executePattern({ name: patternDef.name, params: params });
        });
    }

    /**
     * 级联模式：弹幕依次激活并保持活跃
     */
    executeCascade(combinedPattern) {
        const patternCount = combinedPattern.patterns.length;
        const cascadeDelay = combinedPattern.duration / (patternCount + 1);

        combinedPattern.patterns.forEach((patternDef, index) => {
            const activateTime = cascadeDelay * index;
            if (combinedPattern.timer >= activateTime) {
                this.executePattern(patternDef);
            }
        });
    }

    /**
     * 随机模式：每帧随机选择一种弹幕发射
     */
    executeRandom(combinedPattern) {
        const randomIndex = Math.floor(Math.random() * combinedPattern.patterns.length);
        this.executePattern(combinedPattern.patterns[randomIndex]);
    }

    /**
     * 执行单个弹幕模式
     */
    executePattern(patternDef) {
        if (!DanmakuPatterns) {
            console.warn('DanmakuPatterns not found');
            return;
        }

        const patternFunc = DanmakuPatterns[patternDef.name];
        if (patternFunc) {
            // 获取发射器位置
            const originX = this.emitter.x !== undefined ? this.emitter.x : this.emitter.originX || 0;
            const originY = this.emitter.y !== undefined ? this.emitter.y : this.emitter.originY || 0;

            // 调用弹幕模式并获取子弹配置
            const bulletConfigs = patternFunc(originX, originY, patternDef.params);
            
            // 🔧 P0修复：使用 DanmakuEngine 将子弹发射到游戏中
            if (bulletConfigs && bulletConfigs.length > 0 && typeof DanmakuEngine !== 'undefined') {
                // 我们需要一个目标子弹数组。由于 PatternWeaver 是由 Boss 持有的，
                // 而 Boss.update 接收 bullets 数组，我们可以让 Boss 将其传给 weaver
                if (this.emitter.currentBulletsArray) {
                    DanmakuEngine.fireBullets(bulletConfigs, this.emitter.currentBulletsArray);
                }
            }
        }
    }

    /**
     * 启动一个编织弹幕
     */
    startWeave(name, combinedPattern) {
        this.activeWeaves.set(name, combinedPattern);
    }

    /**
     * 停止一个编织弹幕
     */
    stopWeave(name) {
        this.activeWeaves.delete(name);
    }

    /**
     * 更新所有活跃的编织弹幕
     */
    update(dt) {
        for (const [name, weave] of this.activeWeaves) {
            const active = this.execute(weave, dt);
            if (!active) {
                this.activeWeaves.delete(name);
            }
        }
    }

    /**
     * 清除所有编织弹幕
     */
    clear() {
        this.activeWeaves.clear();
    }
}

/**
 * 预设弹幕组合库
 * 包含常用的弹幕组合预设
 */
const PRESET_WEAVES = {
    /**
     * 螺旋雨（spiral + rain）
     * 经典组合：螺旋弹幕 + 弹幕雨
     */
    spiralRain: {
        patterns: ['spiral', 'rain'],
        params: [
            { arms: 5, speed: 250, color: '#4a7c43', offset: 0 },
            { count: 6, speed: 200, color: '#90ee90', spreadX: 0.2 }
        ],
        blendMode: 'parallel',
        duration: 5
    },

    /**
     * 十字圆环（circle + cross）
     * 基础组合：圆形弹幕 + 十字弹幕
     */
    circleCross: {
        patterns: ['circle', 'cross'],
        params: [
            { count: 16, speed: 200, color: '#32cd32' },
            { count: 4, speed: 350, color: '#00ff00', spacing: 20 }
        ],
        blendMode: 'parallel',
        duration: 4
    },

    /**
     * 扇形风暴（fan + fan，交替方向）
     * 交替组合：左右交替的扇形弹幕
     */
    fanStorm: {
        patterns: ['fan', 'fan'],
        params: [
            { count: 7, spreadAngle: Math.PI / 3, speed: 300, color: '#4a7c43' },
            { count: 7, spreadAngle: Math.PI / 3, speed: 300, color: '#98fb98' }
        ],
        blendMode: 'interleave',
        duration: 6
    },

    /**
     * 花园绽放（circle + flower，时间分层）
     * 顺序组合：先圆形后花朵
     */
    gardenBloom: {
        patterns: ['circle', 'flower'],
        params: [
            { count: 12, speed: 250, color: '#00ff7f' },
            { petals: 6, bulletsPerPetal: 5, speed: 200, color1: '#ff69b4', color2: '#ffccee' }
        ],
        blendMode: 'sequential',
        duration: 5
    },

    /**
     * 螺旋花园（spiral + flower，螺旋融合）
     * 螺旋融合：两种弹幕旋转融合
     */
    spiralGarden: {
        patterns: ['spiral', 'flower'],
        params: [
            { arms: 3, speed: 200, color: '#00ff00' },
            { petals: 5, bulletsPerPetal: 4, speed: 180, color1: '#4a7c43', color2: '#90ee90' }
        ],
        blendMode: 'spiral_merge',
        duration: 6
    },

    /**
     * 混乱风暴（circle + scatter + rain）
     * 三重组合：圆形 + 散射 + 弹幕雨
     */
    chaosStorm: {
        patterns: ['circle', 'scatter', 'rain'],
        params: [
            { count: 8, speed: 220, color: '#32cd32' },
            { count: 10, speed: 400, spread: 0.8, color: '#ff69b4' },
            { count: 5, speed: 180, color: '#98fb98' }
        ],
        blendMode: 'cascade',
        duration: 7
    },

    /**
     * 十字螺旋（cross + spiral，交替）
     * 交替组合：十字和螺旋交替
     */
    crossSpiral: {
        patterns: ['cross', 'spiral'],
        params: [
            { count: 5, speed: 300, color: '#00ff00', spacing: 15 },
            { arms: 4, speed: 250, color: '#4a7c43' }
        ],
        blendMode: 'interleave',
        duration: 5
    },

    /**
     * 满天花语（flower + circle + rain）
     * 三重并行：花朵 + 圆形 + 弹幕雨
     */
    flowerRain: {
        patterns: ['flower', 'circle', 'rain'],
        params: [
            { petals: 6, bulletsPerPetal: 6, speed: 200, color1: '#ff69b4', color2: '#ffccee' },
            { count: 12, speed: 180, color: '#90ee90' },
            { count: 8, speed: 220, color: '#00ff7f' }
        ],
        blendMode: 'parallel',
        duration: 6
    }
};

/**
 * 从预设创建编织弹幕的辅助函数
 * @param {string} presetName - 预设名称
 * @param {PatternWeaver} weaver - 编织器实例
 * @returns {Object} 组合弹幕配置
 */
function createPresetWeave(presetName, weaver) {
    const preset = PRESET_WEAVES[presetName];
    if (!preset) {
        console.warn(`Preset weave '${presetName}' not found`);
        return null;
    }

    if (preset.patterns.length === 2) {
        return weaver.combine(
            preset.patterns[0], preset.params[0],
            preset.patterns[1], preset.params[1],
            preset.blendMode,
            preset.duration
        );
    } else if (preset.patterns.length === 3) {
        return weaver.combineTriple(
            preset.patterns[0], preset.params[0],
            preset.patterns[1], preset.params[1],
            preset.patterns[2], preset.params[2],
            preset.blendMode,
            preset.duration
        );
    }

    return null;
}

// 导出到全局作用域
if (typeof window !== 'undefined') {
    window.PatternWeaver = PatternWeaver;
    window.PRESET_WEAVES = PRESET_WEAVES;
    window.createPresetWeave = createPresetWeave;
}

// Node.js 环境
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PatternWeaver, PRESET_WEAVES, createPresetWeave };
}
