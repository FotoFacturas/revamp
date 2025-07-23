// src/utils/appleSearchAdsTypes.ts

// Apple Search Ads API Configuration
export interface AppleSearchAdsConfig {
  clientId: string;
  teamId: string;
  keyId: string;
  appId: string;
  baseUrl: string;
  tokenUrl: string;
  scope: string;
  orgIds: {
    main: string;
    basic: string;
    advanced: string;
  };
  defaultOrgId: string;
  tokenExpiryBuffer: number;
}

// OAuth2 Token Response
export interface OAuth2TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

// Stored Token Data
export interface StoredTokenData {
  access_token: string;
  token_type: string;
}

// API Request Options
export interface CampaignReportOptions {
  startDate?: string;
  endDate?: string;
  granularity?: 'DAY' | 'WEEK' | 'MONTH';
  groupBy?: string[];
  limit?: number;
  offset?: number;
}

export interface SearchTermsReportOptions {
  startDate?: string;
  endDate?: string;
  campaignId?: string;
  limit?: number;
  offset?: number;
}

// Campaign Data Structure
export interface CampaignData {
  date: string;
  country: string;
  campaignId: string;
  campaignName: string;
  orgId: string;
  installs: number;
  impressions: number;
  taps: number;
  spend: number;
}

// Campaign Match Result
export interface CampaignMatch {
  campaignId: string;
  orgId: string;
  campaignName: string;
  score: number;
  data: CampaignData[];
}

// Attribution Data Structure
export interface AttributionData {
  // UTM Parameters
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_content: string;
  utm_term?: string;
  
  // Apple Search Ads Specific
  apple_campaign_id: string;
  apple_org_id: string;
  apple_campaign_name: string;
  apple_country: string;
  apple_install_date: string;
  apple_installs: number;
  apple_taps: number;
  apple_impressions: number;
  
  // Attribution Metadata
  attribution_source: string;
  attribution_confidence: number;
  attribution_timestamp: string;
  attribution_platform: string;
}

// User Data for Attribution
export interface UserAttributionData {
  userId: string;
  installDate?: string;
  country?: string;
  platform?: string;
  orgIds?: string[];
  defaultOrgId?: string;
}

// API Response Structures
export interface CampaignReportResponse {
  data: CampaignData[];
  pagination?: {
    limit: number;
    offset: number;
    total: number;
  };
  error?: {
    code: string;
    message: string;
  };
}

export interface SearchTermsReportResponse {
  data: Array<{
    searchTerm: string;
    campaignId: string;
    impressions: number;
    taps: number;
    installs: number;
    spend: number;
  }>;
  pagination?: {
    limit: number;
    offset: number;
    total: number;
  };
}

// Comprehensive Campaign Data Response
export interface ComprehensiveCampaignDataResponse {
  data: CampaignData[];
  totalOrgIds: number;
  successfulOrgIds: string[];
}

// Authentication Response
export interface AuthTestResult {
  success: boolean;
  token?: string;
  orgIds?: Record<string, string>;
  defaultOrgId?: string;
  error?: string;
}

// API Test Response
export interface APITestResult {
  success: boolean;
  data?: any;
  error?: string;
}

// Attribution Test Response
export interface AttributionTestResult {
  success: boolean;
  attribution?: AttributionData;
  error?: string;
}

// OrgId Test Results
export interface OrgIdTestResults {
  [key: string]: {
    success: boolean;
    orgId: string;
    data?: any;
    error?: string;
  };
}

// Error Types
export interface AppleSearchAdsError {
  code: string;
  message: string;
  details?: any;
}

// Cache Storage Keys
export interface CacheKeys {
  token: string;
  tokenType: string;
  tokenExpiry: string;
  campaignData: string;
  campaignDataExpiry: string;
  attributionData: string;
}

// Confidence Thresholds
export interface ConfidenceThresholds {
  HIGH: number;
  MEDIUM: number;
  LOW: number;
}

// Correlation Factors
export interface CorrelationFactors {
  dateCorrelation: number;
  geoCorrelation: number;
  volumeCorrelation: number;
  platformCorrelation: number;
}

// Amplitude Event Properties
export interface AmplitudeEventProperties {
  user_id?: string;
  apple_search_ads_attributed?: boolean;
  apple_campaign_id?: string;
  apple_org_id?: string;
  apple_campaign_name?: string;
  apple_country?: string;
  attribution_confidence?: number;
  attribution_source?: string;
  timestamp: string;
  platform: string;
  [key: string]: any;
}

// UTM Query Parameters
export interface UTMQueryParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  apple_campaign_id?: string;
  apple_org_id?: string;
  apple_country?: string;
  attribution_confidence?: number;
}

// Module Exports
export interface AppleSearchAdsAuth {
  getValidToken(): Promise<string>;
  getRequestHeaders(orgId?: string): Promise<Record<string, string>>;
  clearStoredToken(): Promise<void>;
  testAuthentication(): Promise<AuthTestResult>;
  testAuthenticationWithOrgId(orgId: string): Promise<{ success: boolean; orgId: string; error?: string }>;
  testAllOrgIds(): Promise<{ success: boolean; results: OrgIdTestResults; error?: string }>;
  config: AppleSearchAdsConfig;
}

export interface AppleSearchAdsAPI {
  getCampaigns(options?: CampaignReportOptions, orgId?: string): Promise<CampaignReportResponse>;
  getCampaignReports(options: CampaignReportOptions, orgId?: string): Promise<CampaignReportResponse>;
  getSearchTermsReport(options: SearchTermsReportOptions, orgId?: string): Promise<SearchTermsReportResponse>;
  getCampaignDataWithCache(options: CampaignReportOptions, orgId?: string): Promise<CampaignReportResponse>;
  getPerformanceData(startDate: string, endDate: string, country?: string, orgId?: string): Promise<CampaignReportResponse>;
  getInstallsData(dateRange?: number, country?: string, orgIds?: string[]): Promise<CampaignData[]>;
  getComprehensiveCampaignData(options?: CampaignReportOptions): Promise<ComprehensiveCampaignDataResponse>;
  clearCache(): Promise<void>;
  testAPIConnection(): Promise<APITestResult>;
  testAllOrgIdsConnection(): Promise<{ success: boolean; results: OrgIdTestResults; error?: string }>;
}

export interface AppleSearchAdsAttribution {
  getAttributionForUser(userData: UserAttributionData): Promise<AttributionData | null>;
  getStoredAttributionData(userId: string): Promise<AttributionData | null>;
  clearAttributionData(userId: string): Promise<void>;
  testAttribution(): Promise<AttributionTestResult>;
  testAttributionWithOrgId(orgId: string): Promise<{ success: boolean; orgId: string; attribution?: AttributionData; error?: string }>;
  testAttributionWithAllOrgIds(): Promise<{ success: boolean; results: Record<string, any>; error?: string }>;
}

// Enhanced Amplitude Service Interface
export interface EnhancedAmplitudeService {
  // Original methods
  trackEvent(eventName: string, eventProperties?: AmplitudeEventProperties): Promise<void>;
  identifyUser(userId: string, userProperties?: Record<string, any>): Promise<void>;
  
  // Enhanced methods with attribution
  trackEventWithAttribution(eventName: string, eventProperties?: AmplitudeEventProperties, userId?: string): Promise<void>;
  identifyUserWithAttribution(userId: string, userProperties?: Record<string, any>): Promise<void>;
  
  // Apple Search Ads specific methods
  handleAppleSearchAdsAttribution(userId: string, userData: UserAttributionData): Promise<AttributionData | null>;
  createUTMQuery(attributionData: AttributionData): string;
  
  // Other existing methods...
  [key: string]: any;
}

// Constants
export const CONFIDENCE_THRESHOLDS: ConfidenceThresholds = {
  HIGH: 0.8,
  MEDIUM: 0.6,
  LOW: 0.4
};

export const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
export const TOKEN_EXPIRY_BUFFER = 30 * 1000; // 30 seconds

// Platform types
export type Platform = 'ios' | 'android';

// Country codes (ISO 3166-1 alpha-2)
export type CountryCode = 'MX' | 'US' | 'CA' | 'ES' | string;

// Granularity types
export type Granularity = 'DAY' | 'WEEK' | 'MONTH';

// Organization types
export type OrgType = 'main' | 'basic' | 'advanced';

// Error codes
export enum ErrorCodes {
  AUTHENTICATION_FAILED = 'AUTHENTICATION_FAILED',
  API_REQUEST_FAILED = 'API_REQUEST_FAILED',
  INVALID_RESPONSE = 'INVALID_RESPONSE',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  ATTRIBUTION_FAILED = 'ATTRIBUTION_FAILED',
  INVALID_USER_DATA = 'INVALID_USER_DATA',
  ORG_ID_NOT_FOUND = 'ORG_ID_NOT_FOUND'
} 