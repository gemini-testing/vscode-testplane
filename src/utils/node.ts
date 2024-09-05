import which from "which";
import { logger } from ".";

export const findNodePath = async (): Promise<string> => {
    const nodePath = await which("node").catch(() => undefined);

    if (!nodePath) {
        const msg =
            "Unable to find 'node' executable.\nMake sure to have Node.js installed and available in your PATH.";
        logger.error(msg);
        throw new Error(msg);
    }

    return nodePath;
};
