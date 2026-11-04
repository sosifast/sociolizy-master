/**
 * Utility untuk memeriksa status transaksi Cryptomus yang terkunci (tidak dapat diedit).
 * Status cancel, error, selesai, finish (termasuk paid / paid_over / fail / expired)
 * dianggap final sehingga aksi edit dinonaktifkan.
 */

export const LOCKED_CRYPTOMUS_STATUSES = [
  "cancel",
  "canceled",
  "cancelled",
  "error",
  "fail",
  "failed",
  "system_fail",
  "expired",
  "selesai",
  "finish",
  "finished",
  "paid",
  "paid_over",
  "success",
  "completed",
] as const;

export function isCryptomusEditDisabled(status?: string | null): boolean {
  if (!status) return false;
  const normalized = status.toLowerCase().trim();
  return LOCKED_CRYPTOMUS_STATUSES.includes(
    normalized as (typeof LOCKED_CRYPTOMUS_STATUSES)[number]
  );
}

