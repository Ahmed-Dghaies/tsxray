import { authenticate } from "./auth";
import { createInvoice } from "./billing";
import { sendNotification } from "./notifications";
import { buildReport } from "./reports";

export function onboardUser(userId: string): string {
  return authenticate(userId);
}

export function collectPayment(userId: string): string {
  return createInvoice(userId);
}

export function prepareExecutiveReport(userId: string): string {
  return buildReport(userId);
}

export class CommunicationsCoordinator {
  send(message: string): string {
    return sendNotification(message);
  }
}
