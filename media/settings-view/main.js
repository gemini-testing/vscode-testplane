// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.
(function () {
    // eslint-disable-next-line no-undef
    const vscode = acquireVsCodeApi();
    listenSettingsCheckbox();

    // eslint-disable-next-line no-undef
    window.addEventListener("message", event => {
        const { method, params } = event.data;

        if (method === "updateSettings") {
            for (const [key, value] of Object.entries(params.settings)) {
                // eslint-disable-next-line no-undef
                const input = document.querySelector(".section_type_settings input[settingName=" + key + "]");

                if (!input) {
                    continue;
                }

                if (typeof value === "boolean") {
                    input.checked = value;
                } else {
                    input.value = value;
                }
            }
        }
    });

    function listenSettingsCheckbox() {
        // eslint-disable-next-line no-undef
        for (const checkbox of document.querySelectorAll(".section_type_settings input[type=checkbox]")) {
            checkbox.addEventListener("change", function (event) {
                vscode.postMessage({
                    method: "toggleSettingsCheckbox",
                    params: {
                        settingName: event.target.getAttribute("settingName"),
                        value: this.checked,
                    },
                });
            });
        }
    }
})();
