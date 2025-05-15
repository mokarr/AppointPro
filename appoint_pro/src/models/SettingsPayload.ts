export type SettingScope = 'ORGANIZATION' | 'LOCATION' | 'FACILITY';

export interface BaseSettingsData {
    isActive?: boolean;
    createdBy?: string;
  }

  export interface RegionalSettingsData {
    timezone: string;
    defaultLanguage: string;
  }
  
  export interface OrganizationSettingsData extends BaseSettingsData, RegionalSettingsData {
    supportEmail: string;
    branding: {
      primaryColor: string;
      logoUrl?: string;
    };
    allowUserRegistration: boolean;
  }
  
  export interface LocationSettingsData extends BaseSettingsData, RegionalSettingsData {
    openingHours: {
      day: string;
      open: string;
      close: string;
    }[];
    phone: string;
  }
  
  export interface FacilitySettingsData extends BaseSettingsData {
    maxBookingDurationMinutes: number;
    cleanupBufferMinutes: number;
    allowDoubleBookings: boolean;
    equipmentAvailable: string[];
  }
  

  export type SettingsRecord =
  | { type: 'ORGANIZATION'; data: OrganizationSettingsData }
  | { type: 'LOCATION'; data: LocationSettingsData }
  | { type: 'FACILITY'; data: FacilitySettingsData };

  