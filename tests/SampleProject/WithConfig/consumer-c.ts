import { CommunicationsCoordinator } from "./hub";

export const runNotification = (): string => new CommunicationsCoordinator().send("ready");
