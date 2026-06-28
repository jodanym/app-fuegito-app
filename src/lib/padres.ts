// Utilidades de la zona del padre. El PIN se guarda HASHEADO (no en texto plano).
import { createHash } from "crypto";

export const COOKIE_PIN = "fueguito_pin_ok";

export function hashPin(pin: string): string {
  return createHash("sha256").update("fueguito:" + pin).digest("hex");
}
