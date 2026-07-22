export interface LicenseActivation {
  id: string;
  hardwareFingerprint: string;
  deviceName: string;
  activatedAt: string;
  lastCheckIn: string;
}

export type LicenseStatus = "ACTIVE" | "REVOKED" | "EXPIRED";

export interface LicenseKey {
  id: string;
  activationKey: string;
  orderId: string;
  productId: string;
  pricingTierName: string;
  customerEmail: string;
  status: LicenseStatus;
  maxDevices: number;
  createdAt: string;
  expiresAt: string | null;
  activations?: LicenseActivation[];
}
