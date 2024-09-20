it("success", () => {
    expect(1 + 1).toBe(2);
});

it("should switch to REPL mode", async ({ browser }) => {
    await browser.switchToRepl();
});
