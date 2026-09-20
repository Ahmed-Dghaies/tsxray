// disable god-module
import { authenticate } from "./auth";
import { createInvoice } from "./billing";
import { sendNotification } from "./notifications";
import { buildReport } from "./reports";

export function disabledOnboarding(userId: string): string {
  return authenticate(userId);
}

export function disabledBilling(userId: string): string {
  return createInvoice(userId);
}

export function disabledReporting(userId: string): string {
  return buildReport(userId);
}

export class DisabledCommunications {
  send(message: string): string {
    return sendNotification(message);
  }
}
