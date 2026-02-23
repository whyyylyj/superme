/**
 * 关卡片段构建器
 * 负责将片段拼接成完整关卡
 *
 * 使用示例:
 * const builder = new SegmentBuilder();
 * builder.addSegment(SEGMENT_LIBRARY.forest.basic_ground)
 *        .addSegment(SEGMENT_LIBRARY.forest.low_jump);
 * const levelData = builder.build();
 */

class SegmentBuilder {
    constructor() {
        this.currentX = 0;
        this.platforms = [];
        this.enemies = [];
        this.powerups = [];
    }

    /**
     * 添加片段到关卡
     * @param {Object} segment - 片段对象
     * @param {number} segment.width - 片段宽度
     * @param {Array} segment.platforms - 平台数组
     * @param {Array} segment.enemies - 敌人数组（可选）
     * @param {Object} segment.powerup - 道具对象（可选）
     * @returns {SegmentBuilder} 返回自身，支持链式调用
     */
    addSegment(segment) {
        // 验证片段数据
        if (!segment || typeof segment.width !== 'number') {
            console.error('Invalid segment:', segment);
            return this;
        }

        // 添加平台
        if (segment.platforms && Array.isArray(segment.platforms)) {
            segment.platforms.forEach(plat => {
                this.platforms.push({
                    x: this.currentX + plat.x,
                    y: plat.y,
                    width: plat.width,
                    height: plat.height,
                    type: plat.type || 'ground',
                    color: this.getPlatformColor(plat.type),
                    hasSecret: plat.hasSecret || false
                });
            });
        }

        // 添加敌人
        if (segment.enemies && Array.isArray(segment.enemies)) {
            segment.enemies.forEach(enemy => {
                this.enemies.push({
                    x: this.currentX + enemy.x,
                    y: enemy.y,
                    type: enemy.type
                });
            });
        }

        // 添加道具
        if (segment.powerups && Array.isArray(segment.powerups)) {
            segment.powerups.forEach(pu => {
                this.powerups.push({
                    x: this.currentX + pu.x,
                    y: pu.y,
                    type: pu.type
                });
            });
        } else if (segment.powerup) {
            this.powerups.push({
                x: this.currentX + segment.powerup.x,
                y: segment.powerup.y,
                type: segment.powerup.type
            });
        }

        // 移动 X 坐标
        this.currentX += segment.width;

        return this;
    }

    /**
     * 批量添加片段
     * @param {Array} segments - 片段数组
     * @returns {SegmentBuilder} 返回自身，支持链式调用
     */
    addSegments(segments) {
        if (!Array.isArray(segments)) {
            console.error('addSegments requires an array');
            return this;
        }

        segments.forEach(segment => this.addSegment(segment));
        return this;
    }

    /**
     * 获取平台颜色
     * @param {string} type - 平台类型
     * @returns {string} 颜色值
     */
    getPlatformColor(type) {
        const colors = {
            ground: '#2d5a27',      // 深绿色地面
            platform: '#3d7a37',    // 浅绿色平台
            lava: '#8B0000',        // 岩浆（第二关用）
            ice: '#4169E1',         // 冰面（预留）
            sand: '#D2691E'         // 沙地（预留）
        };
        return colors[type] || '#2d5a27';
    }

    /**
     * 构建关卡数据
     * @returns {Object} 关卡数据对象
     */
    build() {
        return {
            platforms: [...this.platforms],
            enemies: [...this.enemies],
            powerups: [...this.powerups],
            width: this.currentX
        };
    }

    /**
     * 获取当前关卡宽度
     * @returns {number} 当前宽度
     */
    getCurrentWidth() {
        return this.currentX;
    }

    /**
     * 获取统计信息
     * @returns {Object} 统计信息
     */
    getStats() {
        return {
            width: this.currentX,
            platformCount: this.platforms.length,
            enemyCount: this.enemies.length,
            powerupCount: this.powerups.length
        };
    }

    /**
     * 重置构建器
     */
    reset() {
        this.currentX = 0;
        this.platforms = [];
        this.enemies = [];
        this.powerups = [];
    }

    /**
     * 打印当前构建进度（调试用）
     */
    debug() {
        console.log('=== SegmentBuilder Debug ===');
        console.log('Current X:', this.currentX);
        console.log('Platforms:', this.platforms.length);
        console.log('Enemies:', this.enemies.length);
        console.log('Powerups:', this.powerups.length);
        console.log('===========================');
    }
}

// 导出构建器类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SegmentBuilder;
}
