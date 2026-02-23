import { defineConfig } from "@playwright/test";

export default defineConfig({
    testDir: "tests/e2e",                          // 测试文件目录
    retries: process.env.CI ? 2 : 0,               // CI 环境失败重试 2 次
    workers: 1,                                    // 单线程，避免游戏状态冲突
    timeout: 120000,                               // 单个测试超时 120 秒
    
    use: {
        baseURL: "http://localhost:8000",          // 游戏服务地址
        browserName: "chromium",                   // 使用 Chromium 浏览器
        headless: true,                            // 无头模式（调试时可改为 false）
        launchOptions: {
            args: [
                "--no-sandbox",
                "--disable-dev-shm-usage",
                "--use-gl=swiftshader"             // 软件 WebGL（无需 GPU）
            ]
        },
        viewport: { width: 800, height: 600 }      // 与游戏 Canvas 尺寸一致
    },

    expect: {
        toHaveScreenshot: {
            maxDiffPixelRatio: 0.05,               // 允许 5% 像素差异（游戏动画影响）
            threshold: 0.02                        // 像素差异超过 2% 视为不同
        }
    },

    webServer: {
        command: "python3 -m http.server 8000",    // 启动静态文件服务器
        url: "http://localhost:8000",
        reuseExistingServer: true,                 // 总是重用现有服务器
        timeout: 60000                             // 增加启动超时时间
    },

    // 报告配置
    reporter: [
        ["list"],
        ["html", { open: "never" }]
    ],

    // 输出目录
    outputDir: "tests/e2e/results",
    snapshotDir: "tests/e2e/snapshots"
});
