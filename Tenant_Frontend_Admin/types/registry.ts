export interface SourceFormat {
  id: string;
  key: string;
  name: string;
  description: string;
  icon?: string;
  siteId: string;
  supportsMultipleAccounts?: boolean;
}

export interface TargetFormat {
  id: string;
  key: string;
  name: string;
  description: string;
  icon?: string;
  siteId: string;
  supportsMultipleAccounts?: boolean;
}

export interface SupportedClient {
  id: string;
  key: string;
  name: string;
  description: string;
  icon?: string;
  siteId: string;
}

export interface KeyFeature {
  id: string;
  key: string;
  name: string;
  description: string;
  siteId: string;
}
