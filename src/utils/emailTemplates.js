// src/utils/emailTemplates.js

/**
 * Plantillas de email para flujos de retención
 */
const emailTemplates = {
    // Email de bienvenida - Día 1
    welcome: {
      subject: "¡Bienvenido a Fotofacturas! Comienza a facturar automáticamente",
      body: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              color: #333333;
              line-height: 1.5;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              max-width: 180px;
            }
            h1 {
              color: #6023D1;
              font-size: 24px;
              margin-bottom: 20px;
            }
            .step {
              background-color: #f8f9fa;
              padding: 20px;
              border-radius: 8px;
              margin-bottom: 20px;
            }
            .step-number {
              display: inline-block;
              width: 30px;
              height: 30px;
              background-color: #6023D1;
              color: white;
              border-radius: 50%;
              text-align: center;
              line-height: 30px;
              margin-right: 10px;
              font-weight: bold;
            }
            .step-title {
              font-weight: bold;
              font-size: 18px;
              margin-bottom: 10px;
            }
            .button {
              display: inline-block;
              background-color: #6023D1;
              color: white;
              text-decoration: none;
              padding: 12px 24px;
              border-radius: 6px;
              font-weight: bold;
              margin-top: 20px;
            }
            .footer {
              margin-top: 40px;
              text-align: center;
              font-size: 12px;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <img src="https://via.placeholder.com/180x60?text=Fotofacturas" alt="Fotofacturas Logo" class="logo">
            </div>
            
            <h1>¡Hola {{firstName}}!</h1>
            
            <p>Gracias por unirte a <strong>Fotofacturas</strong>. Estamos emocionados de ayudarte a simplificar el proceso de facturación de tus tickets y gastos.</p>
            
            <p>Para comenzar a usar Fotofacturas, sigue estos sencillos pasos:</p>
            
            <div class="step">
              <div class="step-title"><span class="step-number">1</span> Abre la app de Fotofacturas</div>
              <p>Accede desde tu teléfono a la aplicación que acabas de instalar.</p>
            </div>
            
            <div class="step">
              <div class="step-title"><span class="step-number">2</span> Toma una foto de cualquier ticket</div>
              <p>Usa el botón azul de la cámara para capturar un ticket de cualquier gasto que necesites facturar (restaurantes, gasolina, compras, etc.).</p>
            </div>
            
            <div class="step">
              <div class="step-title"><span class="step-number">3</span> ¡Nosotros nos encargamos del resto!</div>
              <p>Nuestro equipo procesará tu ticket y te enviaremos tu factura en formato XML y PDF directamente a tu correo.</p>
            </div>
            
            <p style="text-align: center;">
              <a href="https://fotofacturas.app" class="button">Abrir Fotofacturas</a>
            </p>
            
            <p>Durante tu periodo de prueba, puedes subir todos los tickets que necesites. Si tienes alguna pregunta, simplemente responde a este correo y estaremos encantados de ayudarte.</p>
            
            <p>¡Esperamos que disfrutes usando Fotofacturas!</p>
            
            <p>Saludos,<br>El equipo de Fotofacturas</p>
            
            <div class="footer">
              <p>© 2025 Fotofacturas. Todos los derechos reservados.</p>
              <p>Si no deseas recibir más correos, puedes <a href="#">darte de baja aquí</a>.</p>
            </div>
          </div>
        </body>
        </html>
      `
    },
    
    // Recordatorio día 3 - Sin ticket subido
    firstTicketReminder: {
      subject: "¿Ya probaste Fotofacturas?",
      body: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              color: #333333;
              line-height: 1.5;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              max-width: 180px;
            }
            h1 {
              color: #6023D1;
              font-size: 24px;
              margin-bottom: 20px;
            }
            .benefits {
              background-color: #f8f9fa;
              padding: 20px;
              border-radius: 8px;
              margin-bottom: 20px;
            }
            .benefit-item {
              display: flex;
              align-items: flex-start;
              margin-bottom: 15px;
            }
            .benefit-icon {
              color: #6023D1;
              margin-right: 10px;
              font-size: 18px;
            }
            .button {
              display: inline-block;
              background-color: #6023D1;
              color: white;
              text-decoration: none;
              padding: 12px 24px;
              border-radius: 6px;
              font-weight: bold;
              margin-top: 20px;
            }
            .footer {
              margin-top: 40px;
              text-align: center;
              font-size: 12px;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <img src="https://via.placeholder.com/180x60?text=Fotofacturas" alt="Fotofacturas Logo" class="logo">
            </div>
            
            <h1>¡Hola {{firstName}}!</h1>
            
            <p>Notamos que aún no has subido tu primer ticket en Fotofacturas. ¡Te estás perdiendo lo fácil que es facturar automáticamente!</p>
            
            <p>Con Fotofacturas puedes facturar cualquier ticket o gasto tomando una simple foto:</p>
            
            <div class="benefits">
              <div class="benefit-item">
                <span class="benefit-icon">✓</span>
                <div>
                  <strong>Restaurantes</strong> - Desayunos, comidas, cenas de negocios
                </div>
              </div>
              
              <div class="benefit-item">
                <span class="benefit-icon">✓</span>
                <div>
                  <strong>Gasolina</strong> - Combustible para tus traslados
                </div>
              </div>
              
              <div class="benefit-item">
                <span class="benefit-icon">✓</span>
                <div>
                  <strong>Compras</strong> - Papelería, equipo, materiales
                </div>
              </div>
              
              <div class="benefit-item">
                <span class="benefit-icon">✓</span>
                <div>
                  <strong>Hospedaje</strong> - Hoteles y alojamiento
                </div>
              </div>
              
              <div class="benefit-item">
                <span class="benefit-icon">✓</span>
                <div>
                  <strong>¡Y mucho más!</strong> - Prácticamente cualquier gasto deducible
                </div>
              </div>
            </div>
            
            <p style="text-align: center;">
              <a href="https://fotofacturas.app" class="button">Subir mi primer ticket</a>
            </p>
            
            <p>Abre la app ahora y prueba lo fácil que es facturar con solo tomar una foto. Todo tu periodo de prueba está disponible para que experimentes al máximo.</p>
            
            <p>¿Necesitas ayuda? Simplemente responde a este correo y te asistiremos con gusto.</p>
            
            <p>Saludos,<br>El equipo de Fotofacturas</p>
            
            <div class="footer">
              <p>© 2025 Fotofacturas. Todos los derechos reservados.</p>
              <p>Si no deseas recibir más correos, puedes <a href="#">darte de baja aquí</a>.</p>
            </div>
          </div>
        </body>
        </html>
      `
    },
    
    // Recordatorio día 5 - Fin de prueba próximo
    trialEnding: {
      subject: "Tu prueba gratuita de Fotofacturas está por terminar",
      body: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              color: #333333;
              line-height: 1.5;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              max-width: 180px;
            }
            h1 {
              color: #6023D1;
              font-size: 24px;
              margin-bottom: 20px;
            }
            .plan {
              border: 1px solid #e0e0e0;
              border-radius: 8px;
              padding: 20px;
              margin-bottom: 15px;
              transition: all 0.3s ease;
            }
            .plan:hover {
              box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            }
            .plan-title {
              font-size: 20px;
              font-weight: bold;
              color: #6023D1;
              margin-bottom: 10px;
            }
            .plan-price {
              font-size: 18px;
              margin-bottom: 10px;
            }
            .plan-feature {
              display: flex;
              align-items: flex-start;
              margin-bottom: 8px;
            }
            .plan-feature-icon {
              color: #6023D1;
              margin-right: 10px;
            }
            .button {
              display: inline-block;
              background-color: #6023D1;
              color: white;
              text-decoration: none;
              padding: 12px 24px;
              border-radius: 6px;
              font-weight: bold;
              margin-top: 20px;
            }
            .footer {
              margin-top: 40px;
              text-align: center;
              font-size: 12px;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <img src="https://via.placeholder.com/180x60?text=Fotofacturas" alt="Fotofacturas Logo" class="logo">
            </div>
            
            <h1>¡Hola {{firstName}}!</h1>
            
            <p>Tu prueba gratuita de Fotofacturas terminará pronto. Para seguir facturando tus gastos automáticamente, elige uno de nuestros planes:</p>
            
            <div class="plan">
              <div class="plan-title">Premium Ahorro</div>
              <div class="plan-price">$99 pesos/mes</div>
              <div class="plan-feature">
                <span class="plan-feature-icon">✓</span>
                <div>10 tickets mensuales</div>
              </div>
              <div class="plan-feature">
                <span class="plan-feature-icon">✓</span>
                <div>Facturación automática</div>
              </div>
              <div class="plan-feature">
                <span class="plan-feature-icon">✓</span>
                <div>Soporte por correo</div>
              </div>
            </div>
            
            <div class="plan">
              <div class="plan-title">Premium Estándar</div>
              <div class="plan-price">$250 pesos/mes</div>
              <div class="plan-feature">
                <span class="plan-feature-icon">✓</span>
                <div>30 tickets mensuales</div>
              </div>
              <div class="plan-feature">
                <span class="plan-feature-icon">✓</span>
                <div>Facturación automática</div>
              </div>
              <div class="plan-feature">
                <span class="plan-feature-icon">✓</span>
                <div>Soporte prioritario</div>
              </div>
            </div>
            
            <div class="plan">
              <div class="plan-title">Premium Individual</div>
              <div class="plan-price">$299 pesos/mes</div>
              <div class="plan-feature">
                <span class="plan-feature-icon">✓</span>
                <div>60 tickets mensuales</div>
              </div>
              <div class="plan-feature">
                <span class="plan-feature-icon">✓</span>
                <div>Facturación automática</div>
              </div>
              <div class="plan-feature">
                <span class="plan-feature-icon">✓</span>
                <div>Soporte VIP</div>
              </div>
            </div>
            
            <p style="text-align: center;">
              <a href="https://fotofacturas.app" class="button">Seleccionar un plan</a>
            </p>
            
            <p>Abre la app y selecciona el plan que mejor se ajuste a tus necesidades para continuar ahorrando tiempo en tus facturas.</p>
            
            <p>Si tienes alguna pregunta sobre nuestros planes, responde a este correo y te ayudaremos a elegir la mejor opción para ti.</p>
            
            <p>Saludos,<br>El equipo de Fotofacturas</p>
            
            <div class="footer">
              <p>© 2025 Fotofacturas. Todos los derechos reservados.</p>
              <p>Si no deseas recibir más correos, puedes <a href="#">darte de baja aquí</a>.</p>
            </div>
          </div>
        </body>
        </html>
      `
    },
    
    // Email de celebración por primer ticket
    firstTicketCongrats: {
      subject: "¡Felicidades por tu primer ticket en Fotofacturas!",
      body: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              color: #333333;
              line-height: 1.5;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              max-width: 180px;
            }
            .celebration {
              text-align: center;
              margin: 30px 0;
            }
            .celebration-icon {
              font-size: 64px;
              margin-bottom: 20px;
            }
            h1 {
              color: #6023D1;
              font-size: 24px;
              margin-bottom: 20px;
            }
            .info-box {
              background-color: #f8f9fa;
              padding: 20px;
              border-radius: 8px;
              margin-bottom: 20px;
            }
            .button {
              display: inline-block;
              background-color: #6023D1;
              color: white;
              text-decoration: none;
              padding: 12px 24px;
              border-radius: 6px;
              font-weight: bold;
              margin-top: 20px;
            }
            .footer {
              margin-top: 40px;
              text-align: center;
              font-size: 12px;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <img src="https://via.placeholder.com/180x60?text=Fotofacturas" alt="Fotofacturas Logo" class="logo">
            </div>
            
            <div class="celebration">
              <div class="celebration-icon">🎉</div>
              <h1>¡Felicidades, {{firstName}}!</h1>
              <p>Has subido tu primer ticket correctamente</p>
            </div>
            
            <p>Tu ticket ha sido recibido y está siendo procesado por nuestro equipo. Te notificaremos cuando tu factura esté lista para descargar.</p>
            
            <div class="info-box">
              <p><strong>¿Qué sigue?</strong></p>
              <p>1. Recibirás una notificación cuando tu factura esté lista</p>
              <p>2. Podrás ver y descargar tu factura desde la app</p>
              <p>3. También recibirás un correo con los archivos XML y PDF</p>
            </div>
            
            <p>¿Tienes más tickets por facturar? ¡Sube todos los que necesites durante tu periodo de prueba! Recuerda que puedes facturar prácticamente cualquier gasto deducible con Fotofacturas.</p>
            
            <p style="text-align: center;">
              <a href="https://fotofacturas.app" class="button">Subir más tickets</a>
            </p>
            
            <p>Si tienes alguna pregunta o necesitas ayuda, no dudes en responder a este correo.</p>
            
            <p>Saludos,<br>El equipo de Fotofacturas</p>
            
            <div class="footer">
              <p>© 2025 Fotofacturas. Todos los derechos reservados.</p>
              <p>Si no deseas recibir más correos, puedes <a href="#">darte de baja aquí</a>.</p>
            </div>
          </div>
        </body>
        </html>
      `
    },
    
    // Email de reactivación para usuarios inactivos
    reactivation: {
      subject: "¡Te extrañamos en Fotofacturas!",
      body: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              color: #333333;
              line-height: 1.5;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              max-width: 180px;
            }
            h1 {
              color: #6023D1;
              font-size: 24px;
              margin-bottom: 20px;
            }
            .info-box {
              background-color: #f8f9fa;
              padding: 20px;
              border-radius: 8px;
              margin-bottom: 20px;
            }
            .reason {
              display: flex;
              align-items: flex-start;
              margin-bottom: 15px;
            }
            .reason-icon {
              color: #6023D1;
              margin-right: 10px;
              font-size: 18px;
            }
            .button {
              display: inline-block;
              background-color: #6023D1;
              color: white;
              text-decoration: none;
              padding: 12px 24px;
              border-radius: 6px;
              font-weight: bold;
              margin-top: 20px;
            }
            .footer {
              margin-top: 40px;
              text-align: center;
              font-size: 12px;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <img src="https://via.placeholder.com/180x60?text=Fotofacturas" alt="Fotofacturas Logo" class="logo">
            </div>
            
            <h1>¡Hola {{firstName}}!</h1>
            
            <p>Hace tiempo que no te vemos por Fotofacturas. ¿Tienes tickets pendientes por facturar?</p>
            
            <div class="info-box">
              <p><strong>Motivos para volver a Fotofacturas:</strong></p>
              
              <div class="reason">
                <span class="reason-icon">⏱️</span>
                <div>
                  <strong>Ahorra tiempo valioso</strong> - Factura en segundos lo que antes te tomaba horas
                </div>
              </div>
              
              <div class="reason">
                <span class="reason-icon">📊</span>
                <div>
                  <strong>Mantén tus deducciones al día</strong> - No pierdas la oportunidad de deducir tus gastos
                </div>
              </div>
              
              <div class="reason">
                <span class="reason-icon">📱</span>
                <div>
                  <strong>Comodidad máxima</strong> - Factura desde cualquier lugar con solo tomar una foto
                </div>
              </div>
            </div>
            
            <p style="text-align: center;">
              <a href="https://fotofacturas.app" class="button">Volver a Fotofacturas</a>
            </p>
            
            <p>Si hay algo en lo que podamos ayudarte o tienes alguna sugerencia para mejorar nuestro servicio, responde a este correo. ¡Estamos aquí para ayudarte!</p>
            
            <p>Saludos,<br>El equipo de Fotofacturas</p>
            
            <div class="footer">
              <p>© 2025 Fotofacturas. Todos los derechos reservados.</p>
              <p>Si no deseas recibir más correos, puedes <a href="#">darte de baja aquí</a>.</p>
            </div>
          </div>
        </body>
        </html>
      `
    }
  };
  
  export default emailTemplates;