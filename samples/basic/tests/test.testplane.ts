describe("suite", () => {
    it("success", async () => {
        expect(1 + 1).toBe(2);
    });

    it("fail", async () => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        expect(1 + 1).toBe(3);
    });

    testplane.skip.in(/.+/, "because");
    it("skipped", () => {
        expect(100 + 500).toBe(600);
    });
});

it("test without suite", () => {
    expect(100500).toBe(100500);
});
