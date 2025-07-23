# Facebook Business Manager + AppsFlyer Implementation Checklist
## FotoFacturas - Checklist de Implementación Completa

### STATUS: ✅ SISTEMA FUNCIONANDO
- AppsFlyer SDK: ✅ Funcionando 100%
- Dev Key: ✅ `bETPLgmuc8ek4NDFhvWin7`
- Events Tracking: ✅ Screen_Viewed, conversion data
- Attribution Detection: ✅ Funcionando
- Dual Tracking: ✅ Con Amplitude integrado

---

## 📋 CHECKLIST DE IMPLEMENTACIÓN

### 🔧 1. CONFIGURACIÓN FACEBOOK BUSINESS MANAGER

#### 1.1 Crear Business Manager
- [ ] Ir a business.facebook.com
- [ ] Crear nuevo Business Manager: "FotoFacturas Business"
- [ ] Configurar información de contacto
- [ ] Verificar dominio: fotofacturas.ai
- [ ] Configurar métodos de pago
- [ ] Agregar usuarios del equipo

#### 1.2 Configurar Apps en Facebook
- [ ] Crear app iOS: com.fotofactura
- [ ] Configurar App Store ID: 1590322939
- [ ] Crear app Android: com.fotofactura
- [ ] Configurar Play Store ID: [Buscar]
- [ ] Verificar configuración de plataforma

#### 1.3 Configurar Pixel de Facebook
- [ ] Crear Pixel: "FotoFacturas_Pixel"
- [ ] Obtener Pixel ID
- [ ] Configurar eventos personalizados:
  - [ ] Ticket_Created (conversión principal)
  - [ ] rc_renewal_event (evento de renovación)
  - [ ] Subscription_Status_Updated
  - [ ] Purchase_Completed
- [ ] Verificar tracking de eventos

---

### 🔗 2. CONEXIÓN APPSFLYER + FACEBOOK

#### 2.1 Configuración en AppsFlyer Dashboard
- [ ] Ir a AppsFlyer Dashboard
- [ ] Seleccionar app: FotoFacturas
- [ ] Integrations > Facebook Ads
- [ ] Configurar Facebook App ID
- [ ] Configurar Facebook App Secret
- [ ] Enable Facebook Attribution: ✅
- [ ] Enable Facebook Cost Data: ✅
- [ ] Verificar conexión

#### 2.2 Configurar Eventos de Conversión
- [ ] Configurar Ticket_Created como evento principal
- [ ] Configurar rc_renewal_event como evento de revenue
- [ ] Configurar Purchase_Completed
- [ ] Configurar Subscription_Status_Updated
- [ ] Verificar mapeo de eventos

#### 2.3 Configurar Attribution Windows
- [ ] AppsFlyer View-through: 1 día
- [ ] AppsFlyer Click-through: 7 días
- [ ] AppsFlyer Install: 7 días
- [ ] Facebook 1-day click
- [ ] Facebook 7-day click
- [ ] Facebook 1-day view
- [ ] Facebook 7-day view

---

### 📱 3. CONFIGURACIÓN ONELINK

#### 3.1 Crear OneLink Principal
- [ ] Ir a AppsFlyer Dashboard > OneLink
- [ ] Crear OneLink: "FotoFacturas_Main"
- [ ] Configurar URL: fotofacturas.onelink.me
- [ ] Configurar deep links por plataforma
- [ ] Verificar redirecciones

#### 3.2 Configurar OneLink URLs por Campaña
- [ ] fotofacturas.onelink.me/fb-installs
- [ ] fotofacturas.onelink.me/fb-tickets
- [ ] fotofacturas.onelink.me/fb-subscription
- [ ] fotofacturas.onelink.me/fb-freelancers
- [ ] fotofacturas.onelink.me/fb-business
- [ ] Verificar UTM parameters

#### 3.3 Testing de OneLink
- [ ] Test OneLink en iOS
- [ ] Test OneLink en Android
- [ ] Test OneLink en Web
- [ ] Verificar attribution data
- [ ] Verificar deep link functionality

---

### 💻 4. IMPLEMENTACIÓN TÉCNICA

#### 4.1 Código de Tracking Mejorado
- [ ] Crear src/utils/facebookTracking.js
- [ ] Implementar FacebookTrackingService
- [ ] Configurar métodos de tracking
- [ ] Integrar con AppsFlyer existente
- [ ] Integrar con Amplitude existente
- [ ] Verificar funcionamiento

#### 4.2 Integración en App.js
- [ ] Importar facebookTracking
- [ ] Inicializar Facebook tracking
- [ ] Configurar OneLink handlers
- [ ] Configurar deep link listeners
- [ ] Verificar inicialización

#### 4.3 Integración en RevenueCat
- [ ] Importar facebookTracking en revenuecat.js
- [ ] Configurar tracking de renovaciones
- [ ] Configurar tracking de compras
- [ ] Verificar eventos de suscripción

#### 4.4 Integración en InvoiceUploadScreen
- [ ] Importar facebookTracking
- [ ] Configurar tracking de Ticket_Created
- [ ] Configurar tracking de Upload_Completed
- [ ] Verificar eventos de conversión

---

### 📊 5. ESTRUCTURA DE CAMPAÑAS FACEBOOK ADS

#### 5.1 Campaña Principal: App Installs
- [ ] Crear campaña: "FotoFacturas_App_Installs"
- [ ] Configurar objetivo: App Installs
- [ ] Configurar presupuesto: $50/día
- [ ] Configurar optimización: Cost per Install
- [ ] Configurar OneLink: fotofacturas.onelink.me/fb-installs

#### 5.2 Ad Sets por Audiencia
- [ ] Ad Set 1: "Freelancers_Mexico"
  - [ ] Audiencia: Freelancers en México
  - [ ] Edad: 25-45
  - [ ] Intereses: Freelancing, Invoicing, Business
  - [ ] Presupuesto: $20/día
  - [ ] OneLink: fotofacturas.onelink.me/fb-freelancers

- [ ] Ad Set 2: "Small_Business_Mexico"
  - [ ] Audiencia: Pequeñas empresas
  - [ ] Edad: 30-50
  - [ ] Intereses: Small Business, Accounting, Taxes
  - [ ] Presupuesto: $20/día
  - [ ] OneLink: fotofacturas.onelink.me/fb-business

- [ ] Ad Set 3: "Lookalike_Existing_Users"
  - [ ] Audiencia: Lookalike 1% de usuarios existentes
  - [ ] Presupuesto: $10/día
  - [ ] OneLink: fotofacturas.onelink.me/fb-installs

#### 5.3 Campaña de Conversión: Ticket Creation
- [ ] Crear campaña: "FotoFacturas_Ticket_Conversion"
- [ ] Configurar objetivo: Conversions
- [ ] Configurar evento: Ticket_Created
- [ ] Configurar presupuesto: $30/día
- [ ] Configurar optimización: Cost per Action

#### 5.4 Campaña de Retención: Subscription Renewal
- [ ] Crear campaña: "FotoFacturas_Retention"
- [ ] Configurar objetivo: Conversions
- [ ] Configurar evento: rc_renewal_event
- [ ] Configurar audiencia: Usuarios con suscripción
- [ ] Configurar presupuesto: $20/día

---

### 🎯 6. CONFIGURACIÓN DE EVENTOS

#### 6.1 Eventos de Conversión
- [ ] Ticket_Created
  - [ ] Configurar en AppsFlyer
  - [ ] Configurar en Facebook
  - [ ] Configurar value: $0
  - [ ] Configurar content_type: product
  - [ ] Configurar content_category: invoice_automation

- [ ] rc_renewal_event
  - [ ] Configurar en AppsFlyer
  - [ ] Configurar en Facebook
  - [ ] Configurar value: subscription_price
  - [ ] Configurar content_type: subscription
  - [ ] Configurar content_category: renewal

- [ ] Purchase_Completed
  - [ ] Configurar en AppsFlyer
  - [ ] Configurar en Facebook
  - [ ] Configurar value: price
  - [ ] Configurar content_type: subscription
  - [ ] Configurar content_category: initial_purchase

#### 6.2 Eventos de Engagement
- [ ] Screen_Viewed
- [ ] Upload_Completed
- [ ] First_Ticket_Uploaded
- [ ] User_Engagement
- [ ] OneLink_Opened

---

### 📈 7. MONITORING Y REPORTING

#### 7.1 Dashboards de Monitoreo
- [ ] AppsFlyer Dashboard
  - [ ] Install Attribution Report
  - [ ] In-App Events Report
  - [ ] Revenue Report
  - [ ] Cohort Analysis

- [ ] Facebook Ads Manager
  - [ ] Campaign Performance
  - [ ] Ad Set Performance
  - [ ] Ad Performance
  - [ ] Attribution Insights

- [ ] Amplitude Dashboard
  - [ ] User Behavior Analysis
  - [ ] Conversion Tracking
  - [ ] Retention Analysis
  - [ ] Revenue Tracking

#### 7.2 Alertas y Notificaciones
- [ ] Configurar alerta: CPI > $3.00
- [ ] Configurar alerta: ROAS < 2.0
- [ ] Configurar alerta: Attribution rate < 70%
- [ ] Configurar alerta: Conversion rate < 5%
- [ ] Configurar alerta: Budget spent > 80% daily

---

### 🧪 8. TESTING Y VALIDACIÓN

#### 8.1 Testing de Attribution
- [ ] Instalar app desde Facebook ad
- [ ] Verificar attribution data en AppsFlyer
- [ ] Verificar Facebook attribution
- [ ] Verificar conversion events
- [ ] Verificar revenue attribution

#### 8.2 Testing de Conversiones
- [ ] Crear test ticket
- [ ] Verificar Ticket_Created event
- [ ] Verificar Facebook conversion tracking
- [ ] Verificar revenue attribution
- [ ] Verificar subscription events

#### 8.3 Testing de OneLink
- [ ] Test OneLink en iOS
- [ ] Test OneLink en Android
- [ ] Test OneLink en Web
- [ ] Verificar UTM parameters
- [ ] Verificar deep link functionality

---

### ⚙️ 9. OPTIMIZACIÓN

#### 9.1 Facebook Ads Optimization
- [ ] Configurar bid strategy
- [ ] Configurar audience optimization
- [ ] Configurar creative optimization
- [ ] Configurar budget optimization
- [ ] Configurar placement optimization

#### 9.2 AppsFlyer Optimization
- [ ] Configurar attribution optimization
- [ ] Configurar revenue optimization
- [ ] Configurar fraud prevention
- [ ] Configurar data quality
- [ ] Configurar performance optimization

---

### 📋 10. DOCUMENTACIÓN

#### 10.1 Documentación Técnica
- [ ] Documentar configuración de Facebook Business Manager
- [ ] Documentar configuración de AppsFlyer
- [ ] Documentar configuración de OneLink
- [ ] Documentar implementación técnica
- [ ] Documentar troubleshooting

#### 10.2 Documentación de Negocio
- [ ] Documentar estructura de campañas
- [ ] Documentar KPIs y métricas
- [ ] Documentar estrategia de attribution
- [ ] Documentar proceso de optimización
- [ ] Documentar reporting

---

## 🎯 OBJETIVOS Y KPIs

### Objetivos Facebook Ads
- [ ] **CPI Target**: < $2.50
- [ ] **Ticket Conversion**: < $5.00
- [ ] **ROAS Target**: > 3.0
- [ ] **Monthly Conversions**: 2,640 tickets
- [ ] **Monthly Revenue**: 30 renovaciones

### Métricas de Attribution
- [ ] **Attribution Rate**: > 80%
- [ ] **Facebook Attribution Share**: > 60%
- [ ] **Cross-Platform Attribution**: < 20%
- [ ] **Organic vs Paid Split**: 40/60

### Métricas de OneLink
- [ ] **Attribution Rate**: > 90%
- [ ] **Conversion Rate**: > 5%
- [ ] **Install Rate**: > 15%
- [ ] **Revenue Attribution**: > 80%

---

## 🔧 CONFIGURACIÓN TÉCNICA

### AppsFlyer Configuration
- [ ] **Dev Key**: bETPLgmuc8ek4NDFhvWin7
- [ ] **iOS App ID**: appl_SjFjwBVBbOjasgVEXvVdDtACpVY
- [ ] **Android App ID**: goog_CvNNBMJJgEFGOAATpkSamzAGexf
- [ ] **OneLink Domain**: fotofacturas.onelink.me
- [ ] **Deep Link Scheme**: fotofacturas://

### Facebook Configuration
- [ ] **Business Manager ID**: [Configurar]
- [ ] **Ad Account ID**: [Configurar]
- [ ] **Pixel ID**: [Configurar]
- [ ] **App ID**: [Configurar]
- [ ] **App Secret**: [Configurar]

### RevenueCat Configuration
- [ ] **iOS API Key**: appl_SjFjwBVBbOjasgVEXvVdDtACpVY
- [ ] **Android API Key**: goog_CvNNBMJJgEFGOAATpkSamzAGexf
- [ ] **Events**: rc_renewal_event, Purchase_Completed
- [ ] **Integration**: Facebook tracking

---

## 📊 REPORTING Y ANALYTICS

### Daily Monitoring
- [ ] Revisar CPI por campaña
- [ ] Revisar conversion rate
- [ ] Revisar attribution data
- [ ] Revisar budget spent
- [ ] Revisar OneLink performance

### Weekly Analysis
- [ ] Analizar performance por audiencia
- [ ] Analizar creative performance
- [ ] Analizar attribution trends
- [ ] Analizar revenue attribution
- [ ] Analizar user behavior

### Monthly Reporting
- [ ] Generar reporte de ROAS
- [ ] Generar reporte de LTV
- [ ] Generar reporte de attribution
- [ ] Generar reporte de OneLink performance
- [ ] Generar reporte de optimization

---

## 🚀 PRÓXIMOS PASOS

### Implementación Inmediata
- [ ] ✅ Configurar Facebook Business Manager
- [ ] ✅ Conectar AppsFlyer con Facebook
- [ ] ✅ Implementar código de tracking mejorado
- [ ] ✅ Configurar OneLink URLs
- [ ] ✅ Crear campañas de prueba

### Optimización Continua
- [ ] Monitor performance diariamente
- [ ] Ajustar bids y budgets
- [ ] Optimizar audiencias
- [ ] Testear nuevos creativos
- [ ] Expandir a nuevas audiencias

---

## 📞 CONTACTOS Y SOPORTE

### Facebook Business Manager
- [ ] Business Manager ID: [Configurar]
- [ ] Ad Account ID: [Configurar]
- [ ] Pixel ID: [Configurar]
- [ ] App ID: [Configurar]

### AppsFlyer Support
- [ ] Dev Key: bETPLgmuc8ek4NDFhvWin7
- [ ] App ID iOS: appl_SjFjwBVBbOjasgVEXvVdDtACpVY
- [ ] App ID Android: goog_CvNNBMJJgEFGOAATpkSamzAGexf
- [ ] Support: support@appsflyer.com

### RevenueCat Integration
- [ ] iOS API Key: appl_SjFjwBVBbOjasgVEXvVdDtACpVY
- [ ] Android API Key: goog_CvNNBMJJgEFGOAATpkSamzAGexf
- [ ] Events: rc_renewal_event, Purchase_Completed

---

## ✅ RESUMEN DE IMPLEMENTACIÓN

### Sistema Actual Funcionando
- ✅ AppsFlyer SDK integrado y funcionando
- ✅ Events tracking: Screen_Viewed, Ticket_Created
- ✅ Attribution detection activo
- ✅ Dual tracking con Amplitude

### Implementación Facebook Ads
- ✅ Facebook Business Manager + AppsFlyer connection
- ✅ Campaign structure y ad sets
- ✅ Attribution windows optimization
- ✅ Conversion events configuration
- ✅ OneLink setup para campaigns
- ✅ Attribution measurement strategy

### Estado Final
**🎯 LISTO PARA IMPLEMENTACIÓN COMPLETA DE FACEBOOK ADS + APPSFLYER ATTRIBUTION**

**Próximo paso**: Ejecutar checklist de implementación paso a paso 