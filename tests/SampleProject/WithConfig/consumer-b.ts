import { collectPayment } from "./hub";

export const runBilling = (): string => collectPayment("b");
