# Apple Search Ads UTM Integration for FotoFacturas

## Overview

This document describes the complete Apple Search Ads attribution integration with UTM tracking in the FotoFacturas React Native app. The integration automatically converts Apple Search Ads attribution data to UTM parameters and ensures they're included in all Amplitude analytics events.

## Navigation Flow

```
SplashScreen.js (checks updates)
    ↓
IntroScreen.js (onboarding + Apple Search Ads check)
    ↓
EmailSignupScreen.js / EmailLoginScreen.js
    ↓
MainScreen.js (main app + attribution application)
```

## Key Components

### 1. IntroScreen.js
- **Purpose**: Initial attribution check for new users
- **Function**: `checkAppleSearchAdsAttribution()`
- **Storage**: Stores attribution data in `apple_search_ads_attribution_data`
- **Flag**: Sets `apple_search_ads_checked` to prevent duplicate checks

### 2. MainScreen.js
- **Purpose**: Retrieves and applies stored attribution data
- **Function**: `checkAppleSearchAdsAttribution()`
- **Processing**: Converts attribution to UTM parameters
- **Cleanup**: Removes temporary attribution data after processing

### 3. Amplitude.js
- **Purpose**: Enhanced UTM tracking with Apple Search Ads support
- **Functions**: 
  - `handleAppleSearchAdsAttribution()` - Processes attribution data
  - `convertAttributionToUTM()` - Converts to UTM format
  - `trackEvent()` - Enhanced with automatic UTM inclusion

## Attribution Data Flow

### Step 1: IntroScreen Attribution Check
```javascript
// User installs app from Apple Search Ads
// App opens: SplashScreen → IntroScreen

const checkAppleSearchAdsAttribution = async () => {
  // 1. Check if already verified
  const alreadyChecked = await AsyncStorage.getItem('apple_search_ads_checked');
  if (alreadyChecked) return;
  
  // 2. Create user data
  const userData = {
    userId: 'anonymous_' + Date.now(),
    installDate: new Date().toISOString(),
    country: 'MX',
    platform: Platform.OS,
    orgIds: [3839590, 3839580, 3841110],
    defaultOrgId: 3839590
  };
  
  // 3. Get attribution
  const attribution = await amplitudeService.handleAppleSearchAdsAttribution(
    userData.userId, 
    userData
  );
  
  // 4. Store for later use
  if (attribution) {
    const attributionStorageData = {
      ...attribution,
      detected_on: 'intro_screen',
      detected_timestamp: new Date().toISOString(),
      user_data: userData
    };
    
    await AsyncStorage.setItem('apple_search_ads_attribution_data', 
      JSON.stringify(attributionStorageData));
  }
  
  // 5. Mark as checked
  await AsyncStorage.setItem('apple_search_ads_checked', 'true');
};
```

### Step 2: MainScreen Attribution Application
```javascript
// User completes signup/login
// App navigates to MainScreen

const checkAppleSearchAdsAttribution = async () => {
  // 1. Retrieve stored attribution data
  const storedAttributionData = await AsyncStorage.getItem('apple_search_ads_attribution_data');
  
  if (storedAttributionData) {
    const attributionData = JSON.parse(storedAttributionData);
    
    // 2. Apply to current user
    if (attributionData.apple_campaign_id) {
      const currentUserId = await AsyncStorage.getItem('userId') || 'anonymous';
      const currentUserData = {
        userId: currentUserId,
        installDate: attributionData.user_data?.installDate,
        country: attributionData.apple_country || 'MX',
        platform: Platform.OS,
        orgIds: attributionData.user_data?.orgIds,
        defaultOrgId: attributionData.apple_org_id || 3839590
      };
      
      // 3. Process attribution with UTM conversion
      const appliedAttribution = await amplitudeService.handleAppleSearchAdsAttribution(
        currentUserId,
        currentUserData
      );
    }
    
    // 4. Clean up temporary data
    await AsyncStorage.removeItem('apple_search_ads_attribution_data');
  }
};
```

### Step 3: UTM Conversion and Storage
```javascript
// In amplitude.js - handleAppleSearchAdsAttribution()

const handleAppleSearchAdsAttribution = async (userId, userData) => {
  // 1. Get attribution data
  const attributionData = await appleSearchAdsAttribution.getAttributionForUser(userData);
  
  if (attributionData) {
    // 2. Convert to UTM parameters
    const utmData = convertAttributionToUTM(attributionData);
    
    // 3. Store comprehensive data
    const attributionStorageData = {
      // UTM parameters
      utm_source: utmData.utm_source,           // "apple_search_ads"
      utm_medium: utmData.utm_medium,           // "app_store_search"
      utm_campaign: utmData.utm_campaign,       // "campaign_[id]_[country]"
      utm_content: utmData.utm_content,         // "installs_[count]"
      
      // Apple Search Ads specific
      apple_campaign_id: attributionData.apple_campaign_id,
      apple_org_id: attributionData.apple_org_id,
      apple_country: attributionData.apple_country,
      attribution_confidence: attributionData.attribution_confidence,
      attribution_source: attributionData.attribution_source,
      attribution_timestamp: new Date().toISOString(),
      
      // Additional metadata
      attribution_details: attributionData.attribution_details,
      user_data: userData
    };
    
    // 4. Store in AsyncStorage
    await AsyncStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(attributionStorageData));
    
    // 5. Set user properties in Amplitude
    const identify = new Identify();
    Object.keys(attributionStorageData).forEach(key => {
      if (key !== 'user_data' && key !== 'attribution_details') {
        identify.set(`first_${key}`, attributionStorageData[key]);
        identify.set(`last_${key}`, attributionStorageData[key]);
      }
    });
    
    amplitude.identify(identify);
  }
};
```

### Step 4: Automatic UTM Inclusion in Events
```javascript
// In amplitude.js - trackEvent()

const trackEvent = async (eventName, eventProperties = {}) => {
  // 1. Get stored UTM data
  const storedUTMData = await AsyncStorage.getItem(UTM_STORAGE_KEY);
  let utmData = {};
  
  if (storedUTMData) {
    utmData = JSON.parse(storedUTMData);
  }
  
  // 2. Merge with event properties
  const enhancedProperties = {
    ...eventProperties,
    ...utmData
  };
  
  // 3. Add Apple Search Ads specific properties
  if (utmData.apple_campaign_id) {
    enhancedProperties.apple_search_ads_attributed = true;
    enhancedProperties.apple_campaign_id = utmData.apple_campaign_id;
    enhancedProperties.apple_org_id = utmData.apple_org_id;
    enhancedProperties.apple_country = utmData.apple_country;
    enhancedProperties.attribution_confidence = utmData.attribution_confidence;
    enhancedProperties.attribution_source = utmData.attribution_source;
  }
  
  // 4. Track event with enhanced properties
  amplitude.track(eventName, enhancedProperties);
};
```

## UTM Parameter Mapping

| Apple Search Ads Field | UTM Parameter | Example Value |
|----------------------|---------------|---------------|
| Source | `utm_source` | `"apple_search_ads"` |
| Medium | `utm_medium` | `"app_store_search"` |
| Campaign ID + Country | `utm_campaign` | `"campaign_123456_MX"` |
| Install Count | `utm_content` | `"installs_150"` |

## Storage Keys

| Key | Purpose | Lifecycle |
|-----|---------|-----------|
| `apple_search_ads_checked` | Prevent duplicate checks | Permanent |
| `apple_search_ads_attribution_data` | Temporary attribution storage | IntroScreen → MainScreen |
| `fotofacturas_utm_data` | Permanent UTM storage | Permanent |
| `apple_search_ads_attribution_error` | Error logging | Debug only |

## Error Handling

### IntroScreen Errors
```javascript
// Errors are logged and stored for debugging
await AsyncStorage.setItem('apple_search_ads_attribution_error', JSON.stringify({
  error: error.message,
  timestamp: new Date().toISOString(),
  detected_on: 'intro_screen'
}));
```

### MainScreen Errors
```javascript
// Errors are logged and stored for debugging
await AsyncStorage.setItem('apple_search_ads_attribution_error_main', JSON.stringify({
  error: error.message,
  timestamp: new Date().toISOString(),
  detected_on: 'main_screen'
}));
```

## Testing

Use the integration test suite to verify functionality:

```javascript
import AppleSearchAdsIntegrationTest from './src/utils/appleSearchAdsIntegrationTest';

const testSuite = new AppleSearchAdsIntegrationTest();
await testSuite.runAllTests();
await testSuite.cleanup();
```

## Configuration

### Organization IDs
```javascript
orgIds: {
  main: '3839580',      // Softwerk, S.A.P.I. de C.V.
  basic: '3839590',     // Search Ads Basic (default)
  advanced: '3841110'   // Softwerk Advance
}
```

### Platform Support
- **iOS**: Full Apple Search Ads attribution
- **Android**: No attribution (Apple Search Ads is iOS-only)

## Monitoring and Analytics

### Key Events to Monitor
1. `Apple_Search_Ads_Attribution_Found` - Attribution detected
2. `Apple_Search_Ads_Attribution_Applied` - Attribution applied to user
3. `Apple_Search_Ads_Attribution_Error` - Attribution errors
4. `Apple_Search_Ads_Attribution_Found_New_User` - New user attribution

### User Properties
- `first_apple_campaign_id` / `last_apple_campaign_id`
- `first_apple_org_id` / `last_apple_org_id`
- `first_apple_country` / `last_apple_country`
- `first_attribution_confidence` / `last_attribution_confidence`
- `first_utm_source` / `last_utm_source`
- `first_utm_campaign` / `last_utm_campaign`

## Best Practices

1. **Always check Platform.OS** before running attribution
2. **Use proper error handling** with try-catch blocks
3. **Log with emojis** for easy debugging (🍎 for Apple Search Ads)
4. **Store attribution data** for cross-screen usage
5. **Clean up temporary data** after processing
6. **Test thoroughly** with the integration test suite

## Troubleshooting

### Common Issues

1. **Attribution not found**
   - Check if user actually came from Apple Search Ads
   - Verify orgIds are correct
   - Check API credentials

2. **UTM data not appearing in events**
   - Verify attribution data is stored in `fotofacturas_utm_data`
   - Check `trackEvent` function is being called
   - Ensure AsyncStorage is working

3. **Cross-screen attribution not working**
   - Verify data is stored in IntroScreen
   - Check MainScreen retrieval logic
   - Ensure proper cleanup

### Debug Commands

```javascript
// Check stored attribution data
const attributionData = await AsyncStorage.getItem('apple_search_ads_attribution_data');
console.log('Attribution data:', JSON.parse(attributionData));

// Check UTM data
const utmData = await AsyncStorage.getItem('fotofacturas_utm_data');
console.log('UTM data:', JSON.parse(utmData));

// Check error logs
const errorData = await AsyncStorage.getItem('apple_search_ads_attribution_error');
console.log('Error data:', JSON.parse(errorData));
```

## Future Enhancements

1. **Geolocation-based attribution** - Use device location for better country detection
2. **Real-time attribution** - Check attribution on every app open
3. **Advanced UTM parameters** - Include more detailed campaign information
4. **Attribution analytics** - Track attribution effectiveness over time
5. **Multi-touch attribution** - Track multiple attribution sources

## Support

For issues or questions about the Apple Search Ads UTM integration:
1. Check the console logs for 🍎 emoji messages
2. Run the integration test suite
3. Review the error logs in AsyncStorage
4. Verify the attribution flow in the navigation sequence 