# AppsFlyer Integration Documentation

## Overview

AppsFlyer SDK has been successfully integrated into the FotoFacturas React Native app to provide comprehensive mobile attribution and analytics alongside the existing Amplitude and Firebase systems.

## Configuration

### AppsFlyer Credentials
- **Dev Key**: `bETPLgmuc8ek4NDFhvWin7`
- **iOS App ID**: `appl_SjFjwBVBbOjasgVEXvVdDtACpVY`
- **Android App ID**: `goog_CvNNBMJJgEFGOAATpkSamzAGexf`

### Deep Linking Configuration
The app maintains its existing deep linking setup:
- **Custom URL Scheme**: `fotofacturas://`
- **Universal Links**: `https://fotofacturas.ai`

## Architecture

### Dual Tracking System
The integration implements a dual tracking approach:

1. **Amplitude** - Primary analytics and user behavior tracking
2. **AppsFlyer** - Mobile attribution and Facebook Ads tracking
3. **Firebase** - Google Analytics and crash reporting

### Services Structure

```
src/utils/
├── amplitude.js          # Amplitude service (existing)
├── appsflyer.js          # AppsFlyer service (new)
├── tracking.js           # Unified tracking service (new)
└── revenuecat.js         # RevenueCat service (existing)
```

## Key Features

### 1. Attribution Tracking
- **Install Attribution**: Tracks app installs from Facebook Ads and other sources
- **Deep Link Attribution**: Captures UTM parameters from deep links
- **Conversion Data**: Processes AppsFlyer conversion data for attribution

### 2. Dual Event Tracking
All events are sent to both Amplitude and AppsFlyer:
- Screen views
- User interactions
- Subscription events
- Ticket creation/upload
- Deep link opens

### 3. Facebook Ads Integration
- **Campaign Tracking**: Tracks Facebook campaign IDs and ad sets
- **Cost Data**: Captures cost per install and campaign costs
- **Attribution Confidence**: Measures attribution confidence levels

### 4. UTM Parameter Handling
AppsFlyer data is converted to UTM parameters for compatibility:
- `utm_source` ← `af_media_source`
- `utm_campaign` ← `af_campaign`
- `utm_medium` ← Derived from source type
- `utm_content` ← `af_ad`
- `utm_term` ← `af_keywords`

## Implementation Details

### Initialization

```javascript
// In App.js
import appsFlyerService from './utils/appsflyer';

// Initialize in useEffect
appsFlyerService.initAppsFlyer();
```

### Event Tracking

```javascript
// Unified tracking (recommended)
import unifiedTracking from './utils/tracking';

await unifiedTracking.trackEvent('Ticket_Created', {
  ticket_type: 'invoice',
  amount: 1500.00
});

// Individual tracking
await appsFlyerService.trackEvent('Ticket_Created', eventProperties);
```

### User Identification

```javascript
// Identify user with both services
await unifiedTracking.identifyUser(userId, {
  user_type: 'premium',
  subscription_status: 'active'
});
```

## Event Mapping

### Core Events
| Event Name | Description | Properties |
|------------|-------------|------------|
| `Screen_Viewed` | Screen navigation | `screen_name` |
| `Deep_Link_Opened` | Deep link activation | `deep_link_url`, UTM params |
| `Subscription_Status_Updated` | Subscription changes | `active_entitlements` |
| `Ticket_Created` | New ticket creation | `ticket_type`, `amount` |
| `Upload_Completed` | File upload success | `file_type`, `file_size` |

### Attribution Events
| Event Name | Description | Properties |
|------------|-------------|------------|
| `AppsFlyer_Attribution_Found` | Attribution detected | `af_media_source`, `af_campaign` |
| `AppsFlyer_Organic_Install` | Organic install | None |
| `AppsFlyer_Init_Failed` | Initialization error | `error`, `platform` |

## Data Storage

### AsyncStorage Keys
- `fotofacturas_appsflyer_attribution` - AppsFlyer attribution data
- `fotofacturas_appsflyer_utm_data` - UTM parameters from AppsFlyer
- `fotofacturas_utm_data` - Amplitude UTM data (existing)

### Attribution Data Structure
```javascript
{
  // AppsFlyer attribution
  af_status: 'Non-organic',
  af_media_source: 'facebook',
  af_campaign: 'campaign_name',
  af_campaign_id: 'campaign_id',
  
  // Facebook Ads specific
  fb_campaign_id: 'fb_campaign_id',
  fb_adset_id: 'fb_adset_id',
  fb_ad_id: 'fb_ad_id',
  
  // UTM parameters
  utm_source: 'facebook',
  utm_medium: 'social',
  utm_campaign: 'campaign_name',
  
  // Metadata
  attribution_timestamp: '2024-01-01T00:00:00.000Z',
  attribution_source: 'appsflyer',
  platform: 'ios'
}
```

## Integration with Existing Systems

### Amplitude Compatibility
- All AppsFlyer events are also sent to Amplitude
- UTM parameters are shared between systems
- User properties are synchronized

### Apple Search Ads
- Existing Apple Search Ads integration remains intact
- AppsFlyer attribution runs alongside Apple Search Ads
- No conflicts between attribution sources

### Firebase Analytics
- Firebase continues to work independently
- No interference with existing Firebase events
- AppsFlyer attribution data available for Firebase

## Testing

### Development Testing
```javascript
// Enable debug mode
const appsFlyerOptions = {
  devKey: APPSFLYER_DEV_KEY,
  appId: APPSFLYER_APP_ID,
  isDebug: true, // Enable debug logs
  onInstallConversionDataListener: true,
  onDeepLinkListener: true,
  timeToWaitForATTUserAuthorization: 10,
};
```

### Attribution Testing
1. Install app from Facebook Ads link
2. Check console logs for attribution data
3. Verify events in AppsFlyer dashboard
4. Confirm UTM parameters in Amplitude

## Monitoring

### Console Logs
- `📊 AppsFlyer initialized successfully`
- `📊 AppsFlyer conversion data: {...}`
- `📊 AppsFlyer event tracked: {...}`
- `✅ AppsFlyer attribution processed and stored`

### Error Handling
- Graceful fallback to individual tracking
- Error events sent to Amplitude
- Detailed error logging for debugging

## Best Practices

### 1. Event Naming
- Use consistent event names across all platforms
- Include relevant properties for attribution
- Follow AppsFlyer event naming conventions

### 2. Attribution Data
- Store attribution data for user identification
- Convert AppsFlyer data to UTM parameters
- Share attribution data between services

### 3. Performance
- Async event tracking to avoid blocking UI
- Batch attribution data processing
- Efficient storage and retrieval

### 4. Privacy
- Respect user privacy settings
- Handle ATT (App Tracking Transparency) properly
- Comply with GDPR and privacy regulations

## Troubleshooting

### Common Issues

1. **AppsFlyer not initializing**
   - Check Dev Key and App ID
   - Verify network connectivity
   - Check console for error messages

2. **Events not appearing in dashboard**
   - Verify event names match AppsFlyer conventions
   - Check network connectivity
   - Review event properties format

3. **Attribution data missing**
   - Check conversion data listener
   - Verify deep link configuration
   - Review attribution response handling

### Debug Commands
```javascript
// Check initialization status
console.log('AppsFlyer initialized:', appsFlyerService.isInitialized());

// Get attribution data
const attribution = await appsFlyerService.getAttributionDataForUser();
console.log('Attribution data:', attribution);

// Check unified tracking
const hasAttribution = await unifiedTracking.hasAttribution();
console.log('Has attribution:', hasAttribution);
```

## Future Enhancements

### Planned Features
1. **Advanced Attribution Models**: Multi-touch attribution
2. **Custom Events**: Business-specific event tracking
3. **A/B Testing**: Integration with AppsFlyer A/B testing
4. **Fraud Prevention**: AppsFlyer fraud detection features

### Performance Optimizations
1. **Event Batching**: Batch events for better performance
2. **Offline Support**: Queue events when offline
3. **Data Compression**: Optimize data transmission

## Support

For technical support:
1. Check AppsFlyer documentation
2. Review console logs for errors
3. Test with AppsFlyer sandbox environment
4. Contact development team for integration issues

## Version History

- **v1.0.0** - Initial AppsFlyer integration
  - Basic attribution tracking
  - Dual event tracking with Amplitude
  - Facebook Ads integration
  - Deep link attribution 