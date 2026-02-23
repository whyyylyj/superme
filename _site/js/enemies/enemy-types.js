/**
 * enemy-types.js
 *
 * EnemyTypes - 杂兵类型工厂系统
 *
 * 提供各种敌人类型的创建方法，每个类型都有独特的AI、外观和行为
 *
 * 敌人类型分类:
 * - 森林敌人 (Forest): 史莱姆、哥布林、树精
 * - 地狱敌人 (Nether): 火元素、骷髅、恶魔蝙蝠
 * - 天空敌人 (Sky): 天使球、虚空行者、光球
 * - 通用敌人 (Common): 蝙蝠、自爆怪、炮台
 *
 * @author SuperMe Development Team
 * @version 1.0
 */

const EnemyTypes = {
    /**
     * 创建史莱姆（森林敌人）
     * 特点: 缓慢移动，高跳跃，低生命
     */
    createSlime(x, y) {
        return new EnemyBase(x, y, {
            aiType: 'patrol',
            hp: 1,
            width: 25,
            height: 20,
            color: '#32cd32', // 酸橙绿
            speed: 50,
            damage: 1,
            patrolDist: 100,
            detectionRange: 200,
            score: 50,
            gravity: 1200
        });
    },

    /**
     * 创建哥布林（森林敌人）
     * 特点: 快速移动，投掷攻击
     */
    createGoblin(x, y) {
        return new EnemyBase(x, y, {
            aiType: 'chase',
            hp: 2,
            width: 30,
            height: 35,
            color: '#556b2f', // 深橄榄绿
            speed: 120,
            damage: 1,
            patrolDist: 200,
            detectionRange: 350,
            score: 80,
            gravity: 1500
        });
    },

    /**
     * 创建小树人（森林敌人，可被Boss召唤）
     * 特点: 慢速但耐打，固定防御
     */
    createSeedling(x, y) {
        return new EnemyBase(x, y, {
            aiType: 'patrol',
            hp: 3,
            width: 20,
            height: 30,
            color: '#228b22', // 森林绿
            speed: 30,
            damage: 1,
            patrolDist: 50,
            detectionRange: 150,
            score: 60,
            gravity: 1500
        });
    },

    /**
     * 创建火元素（地狱敌人）
     * 特点: 飞行，快速追踪，近战攻击
     */
    createFireElement(x, y) {
        return new EnemyBase(x, y, {
            aiType: 'flying',
            hp: 2,
            width: 28,
            height: 28,
            color: '#ff4500', // 橙红色
            speed: 90,
            damage: 2,
            patrolDist: 150,
            detectionRange: 400,
            score: 100,
            gravity: 0
        });
    },

    /**
     * 创建骷髅（地狱敌人）
     * 特点: 耐打，移动速度中等，持剑攻击
     */
    createSkeleton(x, y) {
        return new EnemyBase(x, y, {
            aiType: 'chase',
            hp: 4,
            width: 32,
            height: 40,
            color: '#f5f5dc', // 米色（骨头色）
            speed: 80,
            damage: 2,
            patrolDist: 180,
            detectionRange: 300,
            score: 120,
            gravity: 1500
        });
    },

    /**
     * 创建恶魔蝙蝠（地狱敌人）
     * 特点: 飞行，成群出现，快速俯冲
     */
    createDemonBat(x, y) {
        return new EnemyBase(x, y, {
            aiType: 'flying',
            hp: 1,
            width: 25,
            height: 18,
            color: '#8b0000', // 深红色
            speed: 150,
            damage: 1,
            patrolDist: 200,
            detectionRange: 350,
            score: 70,
            gravity: 0
        });
    },

    /**
     * 创建地狱火（地狱敌人）
     * 特点: 自爆攻击，高伤害
     */
    createHellfire(x, y) {
        return new EnemyBase(x, y, {
            aiType: 'suicide',
            hp: 2,
            width: 30,
            height: 30,
            color: '#ff0000', // 纯红色
            speed: 100,
            damage: 3,
            patrolDist: 300,
            detectionRange: 500,
            score: 150,
            gravity: 1500
        });
    },

    /**
     * 创建天使球（天空敌人）
     * 特点: 飞行，缓慢追踪，发射弹幕
     */
    createAngelOrb(x, y) {
        return new EnemyBase(x, y, {
            aiType: 'flying',
            hp: 3,
            width: 35,
            height: 35,
            color: '#87ceeb', // 天蓝色
            speed: 60,
            damage: 1,
            patrolDist: 150,
            detectionRange: 400,
            score: 100,
            gravity: 0,
            attackInterval: 3
        });
    },

    /**
     * 创建虚空行者（天空敌人）
     * 特点: 瞬移移动，高生命
     */
    createVoidWalker(x, y) {
        return new EnemyBase(x, y, {
            aiType: 'chase',
            hp: 5,
            width: 40,
            height: 45,
            color: '#4b0082', // 靛青色
            speed: 70,
            damage: 2,
            patrolDist: 250,
            detectionRange: 500,
            score: 200,
            gravity: 1500
        });
    },

    /**
     * 创建光球（天空敌人）
     * 特点: 快速飞行，难以命中
     */
    createLightOrb(x, y) {
        return new EnemyBase(x, y, {
            aiType: 'flying',
            hp: 1,
            width: 20,
            height: 20,
            color: '#ffff00', // 纯黄色
            speed: 200,
            damage: 1,
            patrolDist: 300,
            detectionRange: 400,
            score: 80,
            gravity: 0
        });
    },

    /**
     * 创建蝙蝠（通用敌人）
     * 特点: 飞行，波浪形移动
     */
    createBat(x, y) {
        return new EnemyBase(x, y, {
            aiType: 'flying',
            hp: 1,
            width: 22,
            height: 16,
            color: '#2f4f4f', // 深灰蓝
            speed: 110,
            damage: 1,
            patrolDist: 200,
            detectionRange: 300,
            score: 50,
            gravity: 0
        });
    },

    /**
     * 创建自爆怪（通用敌人）
     * 特点: 快速冲向玩家并爆炸
     */
    createKamikaze(x, y) {
        return new EnemyBase(x, y, {
            aiType: 'suicide',
            hp: 2,
            width: 28,
            height: 28,
            color: '#ff6347', // 番茄红
            speed: 130,
            damage: 2,
            patrolDist: 400,
            detectionRange: 600,
            score: 100,
            gravity: 1500
        });
    },

    /**
     * 创建炮台（通用敌人）
     * 特点: 固定位置，发射弹幕
     */
    createTurret(x, y) {
        return new EnemyBase(x, y, {
            aiType: 'stationary',
            hp: 3,
            width: 35,
            height: 35,
            color: '#696969', // 暗灰色
            speed: 0,
            damage: 1,
            patrolDist: 0,
            detectionRange: 450,
            score: 150,
            gravity: 0,
            attackInterval: 2
        });
    },

    /**
     * 根据关卡ID创建敌人组
     * @param {number} level - 关卡编号 (1, 2, 3)
     * @param {string} type - 敌人类型标识
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     */
    createForLevel(level, type, x, y) {
        switch (level) {
            case 1: // 森林关卡
                return this.createForestEnemy(type, x, y);
            case 2: // 地狱关卡
                return this.createNetherEnemy(type, x, y);
            case 3: // 天空关卡
                return this.createSkyEnemy(type, x, y);
            default:
                return this.createCommonEnemy(type, x, y);
        }
    },

    /**
     * 创建森林关卡敌人
     */
    createForestEnemy(type, x, y) {
        switch (type) {
            case 'slime':
                return this.createSlime(x, y);
            case 'goblin':
                return this.createGoblin(x, y);
            case 'seedling':
                return this.createSeedling(x, y);
            case 'bat':
                return this.createBat(x, y);
            default:
                return this.createSlime(x, y);
        }
    },

    /**
     * 创建地狱关卡敌人
     */
    createNetherEnemy(type, x, y) {
        switch (type) {
            case 'fire_element':
                return this.createFireElement(x, y);
            case 'skeleton':
                return this.createSkeleton(x, y);
            case 'demon_bat':
                return this.createDemonBat(x, y);
            case 'hellfire':
                return this.createHellfire(x, y);
            case 'turret':
                return this.createTurret(x, y);
            default:
                return this.createFireElement(x, y);
        }
    },

    /**
     * 创建天空关卡敌人
     */
    createSkyEnemy(type, x, y) {
        switch (type) {
            case 'angel_orb':
                return this.createAngelOrb(x, y);
            case 'void_walker':
                return this.createVoidWalker(x, y);
            case 'light_orb':
                return this.createLightOrb(x, y);
            case 'kamikaze':
                return this.createKamikaze(x, y);
            default:
                return this.createAngelOrb(x, y);
        }
    },

    /**
     * 创建通用敌人
     */
    createCommonEnemy(type, x, y) {
        switch (type) {
            case 'bat':
                return this.createBat(x, y);
            case 'kamikaze':
                return this.createKamikaze(x, y);
            case 'turret':
                return this.createTurret(x, y);
            default:
                return this.createBat(x, y);
        }
    },

    /**
     * 生成随机敌人（根据关卡）
     * @param {number} level - 关卡编号
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     */
    createRandomForLevel(level, x, y) {
        const forestEnemies = ['slime', 'goblin', 'seedling', 'bat'];
        const netherEnemies = ['fire_element', 'skeleton', 'demon_bat', 'hellfire', 'turret'];
        const skyEnemies = ['angel_orb', 'void_walker', 'light_orb', 'kamikaze'];

        let enemyList;
        switch (level) {
            case 1:
                enemyList = forestEnemies;
                break;
            case 2:
                enemyList = netherEnemies;
                break;
            case 3:
                enemyList = skyEnemies;
                break;
            default:
                enemyList = forestEnemies;
        }

        const randomType = enemyList[Math.floor(Math.random() * enemyList.length)];
        return this.createForLevel(level, randomType, x, y);
    },

    /**
     * 获取关卡敌人类型列表（用于关卡设计）
     */
    getEnemyTypesForLevel(level) {
        switch (level) {
            case 1:
                return ['slime', 'goblin', 'seedling', 'bat'];
            case 2:
                return ['fire_element', 'skeleton', 'demon_bat', 'hellfire', 'turret'];
            case 3:
                return ['angel_orb', 'void_walker', 'light_orb', 'kamikaze'];
            default:
                return ['bat'];
        }
    }
};
