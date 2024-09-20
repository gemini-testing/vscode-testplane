export default {
    gridUrl: "http://localhost:4444/wd/hub",
    baseUrl: "http://localhost",
    pageLoadTimeout: 0,
    httpTimeout: 60000,
    testTimeout: 90000,
    resetCursor: false,
    takeScreenshotOnFails: {
        testFail: false,
        assertViewFail: false,
    },
    sets: {
        desktop: {
            files: ["tests/**/*.testplane.ts"],
            browsers: ["chrome"],
        },
    },
    browsers: {
        chrome: {
            headless: true,
            desiredCapabilities: {
                browserName: "chrome",
            },
        },
    },
};
