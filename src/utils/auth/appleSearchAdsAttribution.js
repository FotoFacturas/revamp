import appleSearchAdsAPI from './appleSearchAdsAPI';

// Configuración de atribución
const ATTRIBUTION_CONFIG = {
  // Factores de confianza del algoritmo
  confidenceFactors: {
    date: 0.40,      // 40% - Proximidad de fecha
    geography: 0.30, // 30% - Coincidencia geográfica
    volume: 0.20,    // 20% - Volumen de instalaciones
    platform: 0.10   // 10% - Plataforma (iOS)
  },
  
  // Ventana de tiempo para atribución (días)
  attributionWindow: 7,
  
  // Umbral mínimo de confianza
  minConfidence: 0.6,
  
  // Configuración de geografía
  geographyMatch: {
    exact: 1.0,      // País exacto
    region: 0.8,     // Región similar
    global: 0.3      // Sin coincidencia geográfica
  }
};

// Calcular factor de confianza por fecha
const calculateDateConfidence = (userInstallDate, campaignDate) => {
  try {
    const userDate = new Date(userInstallDate);
    const campaignDateObj = new Date(campaignDate);
    
    const diffDays = Math.abs(userDate - campaignDateObj) / (1000 * 60 * 60 * 24);
    
    // Confianza máxima si es el mismo día
    if (diffDays === 0) return 1.0;
    
    // Confianza decrece exponencialmente con los días
    const confidence = Math.exp(-diffDays / 2);
    
    return Math.max(0, Math.min(1, confidence));
  } catch (error) {
    console.error('Error calculando confianza por fecha:', error);
    return 0;
  }
};

// Calcular factor de confianza por geografía
const calculateGeographyConfidence = (userCountry, campaignCountry) => {
  try {
    if (!userCountry || !campaignCountry) {
      return ATTRIBUTION_CONFIG.geographyMatch.global;
    }
    
    // Normalizar códigos de país
    const userCountryNorm = userCountry.toUpperCase().trim();
    const campaignCountryNorm = campaignCountry.toUpperCase().trim();
    
    // Coincidencia exacta
    if (userCountryNorm === campaignCountryNorm) {
      return ATTRIBUTION_CONFIG.geographyMatch.exact;
    }
    
    // Coincidencia por región (implementar lógica de regiones si es necesario)
    const regions = {
      'MX': ['MX', 'MEXICO'],
      'US': ['US', 'USA', 'UNITED STATES'],
      'ES': ['ES', 'SPAIN', 'ESPANA'],
      'AR': ['AR', 'ARGENTINA'],
      'CO': ['CO', 'COLOMBIA'],
      'PE': ['PE', 'PERU'],
      'CL': ['CL', 'CHILE']
    };
    
    for (const [regionCode, countries] of Object.entries(regions)) {
      if (countries.includes(userCountryNorm) && countries.includes(campaignCountryNorm)) {
        return ATTRIBUTION_CONFIG.geographyMatch.region;
      }
    }
    
    return ATTRIBUTION_CONFIG.geographyMatch.global;
  } catch (error) {
    console.error('Error calculando confianza por geografía:', error);
    return ATTRIBUTION_CONFIG.geographyMatch.global;
  }
};

// Calcular factor de confianza por volumen
const calculateVolumeConfidence = (campaignInstalls, totalInstalls) => {
  try {
    if (!totalInstalls || totalInstalls === 0) return 0;
    
    const installRatio = campaignInstalls / totalInstalls;
    
    // Confianza basada en el ratio de instalaciones
    // Mayor ratio = mayor confianza (hasta cierto punto)
    const confidence = Math.min(1, installRatio * 10); // Factor de escala
    
    return confidence;
  } catch (error) {
    console.error('Error calculando confianza por volumen:', error);
    return 0;
  }
};

// Calcular factor de confianza por plataforma
const calculatePlatformConfidence = (userPlatform) => {
  try {
    // Confianza máxima para iOS (plataforma de Apple Search Ads)
    if (userPlatform && userPlatform.toLowerCase().includes('ios')) {
      return 1.0;
    }
    
    // Confianza reducida para otras plataformas
    return 0.5;
  } catch (error) {
    console.error('Error calculando confianza por plataforma:', error);
    return 0.5;
  }
};

// Calcular confianza total
const calculateTotalConfidence = (dateConfidence, geographyConfidence, volumeConfidence, platformConfidence) => {
  try {
    const { confidenceFactors } = ATTRIBUTION_CONFIG;
    
    const totalConfidence = 
      (dateConfidence * confidenceFactors.date) +
      (geographyConfidence * confidenceFactors.geography) +
      (volumeConfidence * confidenceFactors.volume) +
      (platformConfidence * confidenceFactors.platform);
    
    return Math.max(0, Math.min(1, totalConfidence));
  } catch (error) {
    console.error('Error calculando confianza total:', error);
    return 0;
  }
};

// Filtrar campañas relevantes
const filterRelevantCampaigns = (campaignsData, userData) => {
  try {
    if (!campaignsData || !campaignsData.data || !Array.isArray(campaignsData.data)) {
      return [];
    }
    
    const userInstallDate = new Date(userData.installDate);
    const startDate = new Date(userInstallDate);
    startDate.setDate(startDate.getDate() - ATTRIBUTION_CONFIG.attributionWindow);
    
    return campaignsData.data.filter(campaign => {
      try {
        // Verificar que tenga datos de instalaciones
        if (!campaign.metrics || !campaign.metrics.installs || campaign.metrics.installs === 0) {
          return false;
        }
        
        // Verificar fecha de campaña
        if (campaign.metadata && campaign.metadata.date) {
          const campaignDate = new Date(campaign.metadata.date);
          if (campaignDate < startDate || campaignDate > userInstallDate) {
            return false;
          }
        }
        
        // Verificar geografía si está disponible
        if (userData.country && campaign.metadata && campaign.metadata.countryOrRegion) {
          const userCountry = userData.country.toUpperCase();
          const campaignCountry = campaign.metadata.countryOrRegion.toUpperCase();
          
          // Permitir campañas globales o del mismo país
          if (campaignCountry !== 'GLOBAL' && campaignCountry !== userCountry) {
            return false;
          }
        }
        
        return true;
      } catch (error) {
        console.error('Error filtrando campaña:', error);
        return false;
      }
    });
  } catch (error) {
    console.error('Error filtrando campañas relevantes:', error);
    return [];
  }
};

// Obtener atribución para un usuario
const getAttributionForUser = async (userData) => {
  try {
    if (__DEV__) console.log('🎯 Calculando atribución para usuario:', userData.userId);
    
    // Validar datos del usuario
    if (!userData.userId || !userData.installDate) {
      throw new Error('Datos de usuario incompletos: userId y installDate son requeridos');
    }
    
    // Obtener datos de campañas
    const days = ATTRIBUTION_CONFIG.attributionWindow + 3; // Buffer adicional
    const campaignsData = await appleSearchAdsAPI.getInstallsData(
      days, 
      userData.country, 
      userData.orgIds
    );
    
    if (!campaignsData || !campaignsData.data || campaignsData.data.length === 0) {
      if (__DEV__) console.log('📊 No se encontraron datos de campañas para atribución');
      return null;
    }
    
    // Filtrar campañas relevantes
    const relevantCampaigns = filterRelevantCampaigns(campaignsData, userData);
    
    if (relevantCampaigns.length === 0) {
      if (__DEV__) console.log('📊 No se encontraron campañas relevantes para atribución');
      return null;
    }
    
          if (__DEV__) console.log(`📊 Analizando ${relevantCampaigns.length} campañas relevantes`);
    
    // Calcular confianza para cada campaña
    const campaignScores = relevantCampaigns.map(campaign => {
      try {
        const dateConfidence = calculateDateConfidence(
          userData.installDate, 
          campaign.metadata?.date
        );
        
        const geographyConfidence = calculateGeographyConfidence(
          userData.country, 
          campaign.metadata?.countryOrRegion
        );
        
        const volumeConfidence = calculateVolumeConfidence(
          campaign.metrics?.installs || 0,
          campaignsData.summary?.totalRecords || 1
        );
        
        const platformConfidence = calculatePlatformConfidence(userData.platform);
        
        const totalConfidence = calculateTotalConfidence(
          dateConfidence,
          geographyConfidence,
          volumeConfidence,
          platformConfidence
        );
        
        return {
          campaign,
          scores: {
            date: dateConfidence,
            geography: geographyConfidence,
            volume: volumeConfidence,
            platform: platformConfidence,
            total: totalConfidence
          }
        };
      } catch (error) {
        console.error('Error calculando scores para campaña:', error);
        return null;
      }
    }).filter(Boolean);
    
    // Ordenar por confianza total
    campaignScores.sort((a, b) => b.scores.total - a.scores.total);
    
    // Obtener la campaña con mayor confianza
    const bestMatch = campaignScores[0];
    
    if (!bestMatch || bestMatch.scores.total < ATTRIBUTION_CONFIG.minConfidence) {
      if (__DEV__) console.log('📊 No se encontró atribución con confianza suficiente');
      return null;
    }
    
    const { campaign, scores } = bestMatch;
    
    // Generar datos de atribución en el formato requerido
    const attributionData = {
      utm_source: 'apple_search_ads',
      utm_medium: 'app_store_search',
      utm_campaign: `${campaign.metadata?.campaignId || 'unknown'}_${campaign.metadata?.countryOrRegion || 'global'}`,
      apple_campaign_id: campaign.metadata?.campaignId || 'unknown',
      apple_org_id: campaign.orgId || 'unknown',
      apple_country: campaign.metadata?.countryOrRegion || 'global',
      attribution_confidence: Math.round(scores.total * 100) / 100,
      attribution_source: 'apple_search_ads_api',
      attribution_details: {
        date_confidence: Math.round(scores.date * 100) / 100,
        geography_confidence: Math.round(scores.geography * 100) / 100,
        volume_confidence: Math.round(scores.volume * 100) / 100,
        platform_confidence: Math.round(scores.platform * 100) / 100,
        campaign_name: campaign.metadata?.campaignName || 'unknown',
        installs: campaign.metrics?.installs || 0,
        impressions: campaign.metrics?.impressions || 0,
        taps: campaign.metrics?.taps || 0
      }
    };
    
    console.log('✅ Atribución calculada exitosamente:', {
      campaign_id: attributionData.apple_campaign_id,
      confidence: attributionData.attribution_confidence,
      country: attributionData.apple_country
    });
    
    return attributionData;
  } catch (error) {
    console.error('Error calculando atribución para usuario:', error);
    throw error;
  }
};

// Obtener atribución con datos de prueba
const getAttributionWithTestData = async (userData) => {
  try {
    console.log('🧪 Calculando atribución con datos de prueba...');
    
    // Datos de prueba para campañas
    const testCampaignsData = {
      data: [
        {
          metadata: {
            date: userData.installDate,
            countryOrRegion: userData.country || 'MX',
            campaignId: 'test_campaign_001',
            campaignName: 'Test Campaign Mexico'
          },
          metrics: {
            installs: 150,
            impressions: 5000,
            taps: 300
          },
          orgId: '3839590',
          source: 'apple_search_ads_api'
        },
        {
          metadata: {
            date: new Date(new Date(userData.installDate).getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            countryOrRegion: 'GLOBAL',
            campaignId: 'test_campaign_002',
            campaignName: 'Test Global Campaign'
          },
          metrics: {
            installs: 500,
            impressions: 15000,
            taps: 800
          },
          orgId: '3839580',
          source: 'apple_search_ads_api'
        }
      ],
      summary: {
        totalRecords: 2,
        orgIdsProcessed: 2,
        orgIdsWithErrors: 0,
        dateRange: {
          start: new Date(new Date(userData.installDate).getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          end: userData.installDate
        },
        country: userData.country || 'all'
      }
    };
    
    // Simular el proceso de atribución con datos de prueba
    const relevantCampaigns = filterRelevantCampaigns(testCampaignsData, userData);
    
    if (relevantCampaigns.length === 0) {
      return null;
    }
    
    const campaignScores = relevantCampaigns.map(campaign => {
      const dateConfidence = calculateDateConfidence(userData.installDate, campaign.metadata?.date);
      const geographyConfidence = calculateGeographyConfidence(userData.country, campaign.metadata?.countryOrRegion);
      const volumeConfidence = calculateVolumeConfidence(campaign.metrics?.installs || 0, 2);
      const platformConfidence = calculatePlatformConfidence(userData.platform);
      const totalConfidence = calculateTotalConfidence(dateConfidence, geographyConfidence, volumeConfidence, platformConfidence);
      
      return { campaign, scores: { date: dateConfidence, geography: geographyConfidence, volume: volumeConfidence, platform: platformConfidence, total: totalConfidence } };
    });
    
    campaignScores.sort((a, b) => b.scores.total - a.scores.total);
    const bestMatch = campaignScores[0];
    
    if (!bestMatch || bestMatch.scores.total < ATTRIBUTION_CONFIG.minConfidence) {
      return null;
    }
    
    const { campaign, scores } = bestMatch;
    
    return {
      utm_source: 'apple_search_ads',
      utm_medium: 'app_store_search',
      utm_campaign: `${campaign.metadata?.campaignId}_${campaign.metadata?.countryOrRegion}`,
      apple_campaign_id: campaign.metadata?.campaignId,
      apple_org_id: campaign.orgId,
      apple_country: campaign.metadata?.countryOrRegion,
      attribution_confidence: Math.round(scores.total * 100) / 100,
      attribution_source: 'apple_search_ads_api_test',
      attribution_details: {
        date_confidence: Math.round(scores.date * 100) / 100,
        geography_confidence: Math.round(scores.geography * 100) / 100,
        volume_confidence: Math.round(scores.volume * 100) / 100,
        platform_confidence: Math.round(scores.platform * 100) / 100,
        campaign_name: campaign.metadata?.campaignName,
        installs: campaign.metrics?.installs,
        impressions: campaign.metrics?.impressions,
        taps: campaign.metrics?.taps
      }
    };
  } catch (error) {
    console.error('Error en atribución con datos de prueba:', error);
    return null;
  }
};

// Test de atribución
const testAttribution = async () => {
  try {
    console.log('🧪 Probando sistema de atribución...');
    
    const testUserData = {
      userId: 'test_user_001',
      installDate: new Date().toISOString(),
      country: 'MX',
      platform: 'iOS',
      orgIds: ['3839590', '3839580']
    };
    
    // Test con datos reales
    console.log('  - Probando con datos reales...');
    const realAttribution = await getAttributionForUser(testUserData);
    
    // Test con datos de prueba
    console.log('  - Probando con datos de prueba...');
    const testAttribution = await getAttributionWithTestData(testUserData);
    
    const results = {
      realData: realAttribution,
      testData: testAttribution,
      config: ATTRIBUTION_CONFIG,
      summary: {
        realDataSuccess: !!realAttribution,
        testDataSuccess: !!testAttribution,
        confidenceFactors: ATTRIBUTION_CONFIG.confidenceFactors
      }
    };
    
    console.log('✅ Test de atribución completado');
    return results;
  } catch (error) {
    console.error('Error en test de atribución:', error);
    return { error: error.message };
  }
};

// Test de algoritmos de confianza
const testConfidenceAlgorithms = () => {
  try {
    console.log('🧪 Probando algoritmos de confianza...');
    
    const testCases = [
      {
        name: 'Coincidencia perfecta',
        userData: { installDate: '2024-01-15T10:00:00Z', country: 'MX', platform: 'iOS' },
        campaignData: { date: '2024-01-15T10:00:00Z', country: 'MX', installs: 100 }
      },
      {
        name: 'Coincidencia parcial',
        userData: { installDate: '2024-01-15T10:00:00Z', country: 'MX', platform: 'iOS' },
        campaignData: { date: '2024-01-13T10:00:00Z', country: 'GLOBAL', installs: 50 }
      },
      {
        name: 'Sin coincidencia',
        userData: { installDate: '2024-01-15T10:00:00Z', country: 'MX', platform: 'iOS' },
        campaignData: { date: '2024-01-10T10:00:00Z', country: 'US', installs: 10 }
      }
    ];
    
    const results = testCases.map(testCase => {
      const dateConfidence = calculateDateConfidence(testCase.userData.installDate, testCase.campaignData.date);
      const geographyConfidence = calculateGeographyConfidence(testCase.userData.country, testCase.campaignData.country);
      const volumeConfidence = calculateVolumeConfidence(testCase.campaignData.installs, 100);
      const platformConfidence = calculatePlatformConfidence(testCase.userData.platform);
      const totalConfidence = calculateTotalConfidence(dateConfidence, geographyConfidence, volumeConfidence, platformConfidence);
      
      return {
        testCase: testCase.name,
        scores: {
          date: Math.round(dateConfidence * 100) / 100,
          geography: Math.round(geographyConfidence * 100) / 100,
          volume: Math.round(volumeConfidence * 100) / 100,
          platform: Math.round(platformConfidence * 100) / 100,
          total: Math.round(totalConfidence * 100) / 100
        }
      };
    });
    
    console.log('✅ Test de algoritmos de confianza completado');
    return { success: true, results };
  } catch (error) {
    console.error('Error en test de algoritmos de confianza:', error);
    return { success: false, error: error.message };
  }
};

export default {
  getAttributionForUser,
  getAttributionWithTestData,
  testAttribution,
  testConfidenceAlgorithms,
  config: ATTRIBUTION_CONFIG
}; 