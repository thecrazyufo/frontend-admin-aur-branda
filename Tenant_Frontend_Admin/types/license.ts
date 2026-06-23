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
  siteId: string;
  activations?: LicenseActivation[];
}

export interface DesktopActivation {
  id: number;
  machineId: string;
  machineName: string;
  osName: string;
  ipAddress: string;
  activatedAt: string;
  lastCheckedAt: string;
}

export interface DesktopLicense {
  id: number;
  licenseKey: string;
  status: "ACTIVE" | "REVOKED" | "EXPIRED";
  licenseType: "STANDARD" | "BUSINESS" | "ENTERPRISE";
  expiresAt: string | null;
  maxActivations: number;
  createdAt: string;
  siteId: string;
  activations?: DesktopActivation[];
}

