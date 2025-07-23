import * as React from 'react';
import { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Platform,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';

// Component optimized: removed problematic lineHeight calculations that caused text invisibility
import { StandardLayout, CardLayout } from '../components/StandardLayout';
import { LineSeparator } from '../components/Separators';
import IconAnt from 'react-native-vector-icons/dist/AntDesign';
import IconFontisto from 'react-native-vector-icons/dist/Fontisto';
import Moment from 'react-moment';
import * as API from './../lib/api';
import { AuthContext } from './../contexts/AuthContext';
import prompt from 'react-native-prompt-android';
import { FasterImageView } from '@candlefinance/faster-image';

import { useHeaderHeight } from '@react-navigation/elements';
import { useQueryClient } from '@tanstack/react-query';
import DangerButton from './../components/DangerButton';
import ImageViewer from '@luu-truong/react-native-image-viewer';

import ActionSheet from 'react-native-actions-sheet';

import {
  StatusTitle,
  StatusContent,
  InfoCard,
  InfoButton,
  DeleteButton
} from '../components/StatusComponents';
import AgentMessage from '../components/AgentMessage';

const screenWidth = Math.round(Dimensions.get('window').width);
const screenHeight = Math.round(Dimensions.get('window').height);

// Helper function to truncate CFDI code to 15 characters with ellipsis
const getShortCFDI = (code) => {
  if (!code) return '';

  // If code is longer than 15 characters, truncate and add ellipsis
  if (code.length > 24) {
    return code.substring(0, 24) + '...';
  }

  // Otherwise return the original code
  return code;
};

// Helper function to get descriptive CFDI title
const getCFDIDescription = (code) => {
  // Map of codes to descriptions
  const cfdiDescriptions = {
    'G01': 'G01: Adquisición de mercancías',
    'G02': 'G02: Devoluciones o descuentos',
    'G03': 'G03: Gastos en general',
    'I01': 'I01: Construcciones',
    'I02': 'I02: Mobiliario y equipo',
    'I03': 'I03: Equipo de transporte',
    'I04': 'I04: Equipo de cómputo',
    'I05': 'I05: Dados, troqueles y herramental',
    'I06': 'I06: Comunicaciones telefónicas',
    'I07': 'I07: Comunicaciones satelitales',
    'I08': 'I08: Otra maquinaria y equipo',
    'D01': 'D01: Honorarios médicos',
    'D02': 'D02: Gastos médicos',
    'D03': 'D03: Gastos funerales',
    'D04': 'D04: Donativos',
    'D05': 'D05: Intereses hipotecarios',
    'D06': 'D06: Aportaciones al SAR',
    'D07': 'D07: Primas por seguros médicos',
    'D08': 'D08: Transporte escolar',
    'D09': 'D09: Depósitos de ahorro',
    'D10': 'D10: Colegiaturas',
    'S01': 'S01: Sin efectos fiscales',
    'CP01': 'CP01: Pagos',
    'CN01': 'CN01: Nómina'
  };

  // If the code is already prefixed with descriptive text, return it as is
  if (code && code.length > 4 && code.includes(':')) {
    return code;
  }

  // If we have an exact match for the code
  if (code && cfdiDescriptions[code]) {
    return cfdiDescriptions[code];
  }

  // If the code is embedded in a string like "Gastos en general (G03)"
  if (code) {
    const codeMatch = code.match(/([A-Z]\d{2})/);
    if (codeMatch && cfdiDescriptions[codeMatch[1]]) {
      return cfdiDescriptions[codeMatch[1]];
    }
  }

  // If all else fails, return the original or a default
  return code || 'G03: Gastos en general';
};

const ActionButton = props => {
  const buttonContainerStyle = {
    marginTop: 24,
    alignItems: 'center',
  };

  const buttonTextStyle = {
    color: 'rgb(0, 122, 255)',
    fontSize: 20,
    textAlign: 'center',
  };

  return (
    <>
      <View style={buttonContainerStyle}>
        <TouchableOpacity onPress={props.onPress}>
          <Text style={buttonTextStyle}>{props.value}</Text>
        </TouchableOpacity>
      </View>
    </>
  );
};

export default function InvoiceScreen(props) {
  const [invoice, setInvoice] = React.useState({});
  const [imageIsLoaded, setImageIsLoaded] = React.useState(false);
  const [showPreview, setShowPreview] = React.useState(false);
  const [isLastDaysOfTheMonth, setIsLastDaysOfTheMonth] = React.useState(false);
  const [commentExpanded, setCommentExpanded] = React.useState(false);
  const actionSheetRef = React.useRef(null);
  const mounted = React.useRef(false);

  const invoiceID = props.route.params.invoiceID;
  const invoiceStatus = props.route.params.status;
  const { session } = React.useContext(AuthContext);

  const queryClient = useQueryClient();

  React.useEffect(() => {
    mounted.current = true;

    props.navigation.setOptions({
      headerTitle: 'Ticket  #' + invoiceID,
    });

    return () => {
      mounted.current = false;
    };
  }, []);

  React.useEffect(() => {
    if (invoice === undefined) return;
    if (invoice.created_at === undefined) return;

    const ticketDate = new Date(invoice.created_at);
    const currentDate = new Date();

    // Get the last day of the current month
    const ticketLastDayOfMonth = new Date(
      ticketDate.getFullYear(),
      ticketDate.getMonth() + 1,
      0,
    ).getDate();

    // Check if the date is within the last two days of the month
    const isLastTwoDaysOfMonth =
      currentDate.getMonth() === ticketDate.getMonth() &&
      currentDate.getDate() >= ticketLastDayOfMonth - 1;

    if (isLastTwoDaysOfMonth) {
      setIsLastDaysOfTheMonth(isLastTwoDaysOfMonth);
    }

    /*
    console.log({
      created_at: invoice.created_at,
      currentDate,
      ticketDate,
      ticketDay: ticketDate.getDate(),
      lastCutOff: ticketLastDayOfMonth-1,
      ticketLastDayOfMonth,
      isLastTwoDaysOfMonth
    });
    */
  }, [invoice]);

  React.useEffect(() => {
    if (session.token === '') return;
    if (invoiceID === '') return;

    const ticketInitialData = props.route.params.invoice;
    setInvoice(ticketInitialData);

    loadInfo(invoiceID, session.token);
  }, [session, invoiceID]);

  const statusCopy = React.useMemo(() => {
    switch (invoice.status) {
      case 'waiting':
        return 'Procesando';
      case 'processing':
        return 'Procesando';
      case 'illegible':
        return 'Ilegible';
      case 'awaiting_merchant':
        return 'Solicitada al comercio';
      case 'awaiting':
        return 'Solicitada al comercio';
      case 'unsignable_merchant_unanswered':
        return 'Infacturable';
      case 'unsignable_merchant_systemless':
        return 'Infacturable';
      case 'unsignable_merchant_expired':
        return 'Infacturable';
      case 'unsignable_merchant_error':
        return 'Infacturable';
      case 'unsignable':
        return 'Infacturable';
      case 'signed':
        return 'Facturado';
      case 'signed_no_files':
        return 'Facturado (Sin archivos)';
      default:
        return 'Procesando';
    }
  }, [invoice]);

  const statusColor = React.useMemo(() => {
    const processingColor = 'rgb(115,125,125)';
    const unsignableColor = 'rgb(255,106,123)';
    const signedColor = 'rgb(36,198,112)';

    let _statusColor = processingColor;

    switch (invoice.status) {
      case 'waiting':
        _statusColor = processingColor;
        break;
      case 'processing':
        _statusColor = processingColor;
        break;
      case 'illegible':
        _statusColor = unsignableColor;
        break;
      case 'awaiting_merchant':
        _statusColor = '#DAA520';
        break;
      case 'awaiting':
        _statusColor = '#DAA520';
        break;
      case 'unsignable_merchant_unanswered':
        _statusColor = unsignableColor;
        break;
      case 'unsignable_merchant_systemless':
        _statusColor = unsignableColor;
        break;
      case 'unsignable_merchant_expired':
        _statusColor = unsignableColor;
        break;
      case 'unsignable_merchant_error':
        _statusColor = unsignableColor;
        break;
      case 'unsignable':
        _statusColor = unsignableColor;
        break;
      case 'signed':
        _statusColor = signedColor;
        break;
      case 'signed_no_files':
        _statusColor = signedColor;
        break;
    }

    return _statusColor;
  }, [invoice]);

  const isProcessing = React.useMemo(() => {
    let _isProcessing = true;

    switch (invoice.status) {
      case 'waiting':
        _isProcessing = true;
        break;
      case 'processing':
        _isProcessing = true;
        break;
      case 'illegible':
        _isProcessing = false;
        break;
      case 'awaiting_merchant':
        _isProcessing = false;
        break;
      case 'awaiting':
        _isProcessing = false;
        break;
      case 'unsignable_merchant_unanswered':
        _isProcessing = false;
        break;
      case 'unsignable_merchant_systemless':
        _isProcessing = false;
        break;
      case 'unsignable_merchant_expired':
        _isProcessing = false;
        break;
      case 'unsignable_merchant_error':
        _isProcessing = false;
        break;
      case 'unsignable':
        _isProcessing = false;
        break;
      case 'signed':
        _isProcessing = false;
        break;
      case 'signed_no_files':
        _isProcessing = false;
        break;
    }

    return _isProcessing;
  }, [invoice]);

  const loadInfo = async (_invoiceID, _token) => {
    try {
      var data = await API.getTicket({ ticketID: _invoiceID, token: _token });
    } catch (e) {
      data = {};
    }

    const ticket = _try(() => data.ticket, props.route.params.invoice || {});
    setInvoice(ticket);
  };

  const forwardInvoiceTo = async email => {
    const _token = session.token;
    const _invoiceID = invoiceID;

    try {
      const _ = await API.forwardEmail({
        token: _token,
        ticketID: _invoiceID,
        forward_email_address: email,
      });
      alert('Factura enviada por correo exitosamente');
    } catch (e) {
      console.log('ERROR_FORWARD_INVOICE: ' + e);
      alert(
        'Sucedio un error al enviar el correo. Favor de volver a intentar.',
      );
    }
  };

  const handleForwardInvoiceButton = () => {
    prompt(
      'Correo',
      'Ingresa el correo al cual enviar la factura',
      [
        {
          text: 'Cancelar',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        { text: 'OK', onPress: email => forwardInvoiceTo(email) },
      ],
      {
        cancelable: true,
        defaultValue: '',
        placeholder: 'destino@correo.com',
        keyboardType: 'email-address',
      },
    );
  };

  const handleDownloadInvoiceButton = async () => {
    const _token = session.token;
    const _invoiceID = invoiceID;

    try {
      const url = await API.generateURLForInvoiceZIP({
        token: _token,
        ticketID: _invoiceID,
      });
      Linking.openURL(url);
    } catch (e) {
      console.log('ERROR_INVOICE_ZIP_DOWNLOAD: ' + e);
      alert(
        'Sucedio un error al descagar tu factura. Favor de volver a intentar.',
      );
    }
  };

  const handleDeleteConfirm = async () => {
    const _token = session.token;
    const _invoiceID = invoiceID;

    try {
      const _ = await API.deleteTicket({ token: _token, ticketID: _invoiceID });
      const __ = await queryClient.invalidateQueries('invoicesQuery');

      // Inmediatly Invoked Function Expression
      // Invoke after half a second using setTimeout

      setTimeout(() => {
        (async () => {
          if (mounted.current) {
            Alert.alert(
              'Ticket',
              'Ticket eliminado exitosamente',
              [
                {
                  text: 'Continuar',
                  onPress: () => {
                    if (mounted.current) {
                      props.navigation.goBack();
                    } else {
                      console.log(
                        "Already back, can't goBack from InvoiceScreen",
                      );
                    }
                  },
                },
              ],
              { cancelable: false },
            );
          }
        })();
      }, 200);
    } catch (e) {
      console.log('ERROR_INVOICE_DELETE: ' + e);
      alert(
        'Sucedio un error al eliminar el ticket. Favor de volver a intentar.',
      );
    }
  };

  const handleInvoiceDeleteButton = () => {
    Alert.alert(
      'Confirmar',
      'Desea eliminar el ticket?',
      [
        {
          text: 'Eliminar',
          onPress: () => handleDeleteConfirm(),
        },
        {
          text: 'Cancelar',
          style: 'cancel',
        },
      ],
      { cancelable: false },
    );
  };

  const renderExpandableComment = (comment, defaultMessage) => {
    const displayComment = comment || defaultMessage;
    const isLongComment = displayComment.length > 80;
    
    if (!isLongComment) {
      return (
        <View style={[styles.sectionItem, styles.sectionItemLast, { alignItems: 'flex-start', paddingVertical: spacing[3] }]}>
          <View style={[styles.sectionItemLabelContainer, { marginTop: spacing[1] }]}>
            <Text style={styles.sectionItemLabel}>Comentario</Text>
          </View>
          <View style={[styles.sectionItemInputContainer, { alignItems: 'flex-start' }]}>
            <Text style={styles.sectionItemComment}>
              {displayComment}
            </Text>
          </View>
        </View>
      );
    }

    const shortText = commentExpanded ? displayComment : displayComment.substring(0, 80) + '...';

    return (
      <View style={[styles.sectionItem, styles.sectionItemLast, { alignItems: 'flex-start', paddingVertical: spacing[3] }]}>
        <View style={[styles.sectionItemLabelContainer, { marginTop: spacing[1] }]}>
          <Text style={styles.sectionItemLabel}>Comentario</Text>
        </View>
        <View style={[styles.sectionItemInputContainer, { alignItems: 'flex-start' }]}>
          <Text style={styles.sectionItemComment}>
            {shortText}
          </Text>
          <TouchableOpacity 
            style={{ marginTop: spacing[2] }}
            onPress={() => setCommentExpanded(!commentExpanded)}
          >
            <Text style={styles.expandButtonText}>
              {commentExpanded ? 'Ver menos ↑' : 'Ver más ↓'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const has_pdf_attached = !!invoice.invoice_pdf_url;

  const ticketImageHeight = Platform.OS === 'android' ? 250 : 300; // Reducido de 450 a 300
  const ticketImageTopOffset = Platform.OS === 'android' ? 0 : -100; // Reducido de -200 a -100
  const screenHeight = Dimensions.get('window').height;
  const ticketImageMarginBottom = 24;
  const headerHeight = useHeaderHeight();

  let spaceLeftAfterImage = Math.max(
    400, // Mínimo espacio garantizado para el contenido
    screenHeight -
    (ticketImageHeight +
      ticketImageTopOffset +
      ticketImageMarginBottom +
      headerHeight)
  );

  // const imageViewerHeaderComponent for ImageViewer with a back button and a title, the back button is a TouchableOpacity with a chevron left icon, the title is a Text with the invoiceID, the background is semi-transparent black and the height is the standard iOS header height
  const imageViewerHeaderComponent = () => {
    return (
      <View
        style={{
          position: 'relative',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <TouchableOpacity
          style={{
            position: 'absolute',
            left: 12,
            top: 0,
            bottom: 0,
            justifyContent: 'center',
          }}
          onPress={() => setShowPreview(false)}>
          <IconAnt name="left" size={20} color="white" />
        </TouchableOpacity>
        <Text
          style={{
            fontSize: 20,
            fontWeight: 'bold',
            fontFamily: 'System',
            color: 'white',
          }}>
          Ticket #{invoiceID}
        </Text>
      </View>
    );
  };

  // invoice?.ticket_public_comment
  const agent_comment = invoice?.notes_public;
  //const agent_comment = invoice?.notes;

  const ScreenLayout = props => {
    return (
      <View style={{}}>
        <ImageViewer
          renderHeaderComponent={imageViewerHeaderComponent}
          images={[
            {
              source: {
                uri: invoice.scan_url_medium
                  ? invoice.scan_url_medium
                  : invoice.scan_url,
              },
            },
          ]}
          visible={showPreview}
          onClose={() => setShowPreview(false)}
          imageProps={{
            initialWidth: screenWidth,
            initialHeight: (screenHeight / 11) * 8,
          }}
        />
        <ScrollView scrollIndicatorInsets={{ right: -3 }}>
          <TouchableOpacity
            activeOpacity={0.6}
            style={{
              backgroundColor: 'white',
              height: ticketImageHeight,
              marginTop: ticketImageTopOffset,
              zIndex: 1,
            }}
            onPress={() => setShowPreview(true)}>
            {invoice.scan_url && (
              <FasterImageView
                style={{
                  height: ticketImageHeight,
                  zIndex: 0,
                }}
                source={{
                  resizeMode: 'cover',
                  url: invoice.scan_url_medium
                    ? invoice.scan_url_medium
                    : invoice.scan_url,
                }}
                onLoad={() => setImageIsLoaded(true)}
              />
            )}

          </TouchableOpacity>
          {!imageIsLoaded && (
            <View
              style={{
                resizeMode: 'cover',
                height: ticketImageHeight + ticketImageTopOffset,
                width: '100%',
                position: 'absolute',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <ActivityIndicator size="large" />
            </View>
          )}
          <View
            style={{
              paddingTop: ticketImageMarginBottom,
              paddingBottom: 50, // Más padding inferior para evitar que se corte el contenido
              zIndex: 2,
              backgroundColor: colors.background.secondary,
              minHeight: spaceLeftAfterImage + 100, // Garantizar altura mínima
            }}>
            {props.children}
          </View>
        </ScrollView>
        <ActionSheet ref={actionSheetRef} useBottomSafeAreaPadding={true}>
          <View style={styles.actionSheetContainer}>
            {/* Header Section */}
            <View style={styles.actionSheetHeader}>
              <Text style={styles.actionSheetTitle}>
                Más información
              </Text>
              <Text style={styles.actionSheetSubtitle}>
                Contáctanos para aclaraciones en tu ticket
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionSheetContent}>
              <TouchableOpacity
                style={styles.actionSheetPrimaryButton}
                onPress={() =>
                  Linking.openURL(
                    `https://wa.me/+525522613142?text=Hola,%20tengo%20una%20duda%20sobre%20mi%20ticket%20%23${invoiceID}`,
                  )
                }>
                <View style={styles.actionSheetButtonIcon}>
                  <IconFontisto name="whatsapp" size={20} color={colors.success[600]} />
                </View>
                                 <View style={styles.actionSheetButtonContent}>
                   <Text style={styles.actionSheetButtonTitle}>WhatsApp</Text>
                 </View>
                <IconAnt name="right" size={16} color={colors.text.tertiary} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionSheetSecondaryButton}
                onPress={() =>
                  Linking.openURL(
                    `mailto:team@fotofacturas.app?subject=Soporte Ticket&body=Hola, el ticket '#${invoiceID}' no se pudo facturar.`,
                  )
                }>
                <View style={styles.actionSheetButtonIcon}>
                  <IconAnt name="mail" size={20} color={colors.primary[500]} />
                </View>
                                 <View style={styles.actionSheetButtonContent}>
                   <Text style={styles.actionSheetButtonTitle}>Correo electrónico</Text>
                 </View>
                <IconAnt name="right" size={16} color={colors.text.tertiary} />
              </TouchableOpacity>
            </View>

            {/* Cancel Button */}
            <TouchableOpacity
              style={styles.actionSheetCancelButton}
              onPress={() => actionSheetRef.current?.hide()}>
              <Text style={styles.actionSheetCancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </ActionSheet>
      </View>
    );
  };

  if (isProcessing) {
    const commentMessage = isLastDaysOfTheMonth 
      ? "Algunos comercios no alcanzan a facturar en fin de mes. Recuerda subir con anticipación tus tickets"
      : "Recibirás una notificación en 24 horas aproximadamente en cuanto tu factura esté lista";
      
    return (
      <ScreenLayout>
        <View style={{ minHeight: spaceLeftAfterImage }}>

          <View style={styles.scrollViewSection}>
            <View style={styles.sectionItem}>
              <View style={styles.sectionItemLabelContainer}>
                <Text style={styles.sectionItemLabel}>Emisor</Text>
              </View>
              <View style={styles.sectionItemInputContainer}>
                <Text style={styles.sectionItemInput}>
                  {invoice.ticket_merchant}
                </Text>
              </View>
            </View>
            <View style={styles.sectionItem}>
              <View style={styles.sectionItemLabelContainer}>
                <Text style={styles.sectionItemLabel}>Uso de CFDI</Text>
              </View>
              <View style={styles.sectionItemInputContainer}>
                <Text style={styles.sectionItemInput}>
                  {getShortCFDI(getCFDIDescription(invoice.ticket_category))}
                </Text>
              </View>
            </View>
            <View style={styles.sectionItem}>
              <View style={styles.sectionItemLabelContainer}>
                <Text style={styles.sectionItemLabel}>Fecha</Text>
              </View>
              <View style={styles.sectionItemInputContainer}>
                <Moment
                  utc
                  local
                  element={Text}
                  format="MMM D, YYYY"
                  style={styles.sectionItemInput}>
                  {invoice.created_at}
                </Moment>
              </View>
            </View>
            <View style={styles.sectionItem}>
              <View style={styles.sectionItemLabelContainer}>
                <Text style={styles.sectionItemLabel}>Total</Text>
              </View>
              <View style={styles.sectionItemInputContainer}>
                <Text style={[styles.sectionItemInput, { color: 'darkgreen' }]}>
                  ${invoice.ticket_total}
                </Text>
              </View>
            </View>
            <View style={styles.sectionItem}>
              <View style={styles.sectionItemLabelContainer}>
                <Text style={styles.sectionItemLabel}>Status</Text>
              </View>
              <View style={styles.sectionItemInputContainer}>
                <Text style={[styles.sectionItemInput, { color: statusColor }]}>
                  {statusCopy}
                </Text>
              </View>
            </View>
            {renderExpandableComment(null, commentMessage)}
          </View>

          <View style={styles.contentSection}>
            <View style={styles.sectionItem}>
              <TouchableOpacity
                style={styles.sectionItemActionContainer}
                onPress={handleInvoiceDeleteButton}>
                <Text style={styles.sectionItemActionDelete}>
                  Eliminar ticket sin procesar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScreenLayout>
    );
  }

  if (invoice.status === 'illegible') {
    return (
      <ScreenLayout>
        <View style={{ minHeight: spaceLeftAfterImage }}>

          <View style={styles.scrollViewSection}>
            <View style={styles.sectionItem}>
              <View style={styles.sectionItemLabelContainer}>
                <Text style={styles.sectionItemLabel}>Emisor</Text>
              </View>
              <View style={styles.sectionItemInputContainer}>
                <Text style={styles.sectionItemInput}>
                  {invoice.ticket_merchant}
                </Text>
              </View>
            </View>
            <View style={styles.sectionItem}>
              <View style={styles.sectionItemLabelContainer}>
                <Text style={styles.sectionItemLabel}>Uso de CFDI</Text>
              </View>
              <View style={styles.sectionItemInputContainer}>
                <Text style={styles.sectionItemInput}>
                  {getShortCFDI(getCFDIDescription(invoice.ticket_category))}
                </Text>
              </View>
            </View>
            <View style={styles.sectionItem}>
              <View style={styles.sectionItemLabelContainer}>
                <Text style={styles.sectionItemLabel}>Fecha</Text>
              </View>
              <View style={styles.sectionItemInputContainer}>
                <Moment
                  utc
                  local
                  element={Text}
                  format="MMM D, YYYY"
                  style={styles.sectionItemInput}>
                  {invoice.created_at}
                </Moment>
              </View>
            </View>
            <View style={styles.sectionItem}>
              <View style={styles.sectionItemLabelContainer}>
                <Text style={styles.sectionItemLabel}>Total</Text>
              </View>
              <View style={styles.sectionItemInputContainer}>
                <Text style={[styles.sectionItemInput, { color: 'darkgreen' }]}>
                  ${invoice.ticket_total}
                </Text>
              </View>
            </View>
            <View style={styles.sectionItem}>
              <View style={styles.sectionItemLabelContainer}>
                <Text style={styles.sectionItemLabel}>Status</Text>
              </View>
              <View style={styles.sectionItemInputContainer}>
                <Text style={[styles.sectionItemInput, { color: statusColor }]}>
                  {statusCopy}
                </Text>
              </View>
            </View>
            {(agent_comment || invoice.status === 'illegible') && 
              renderExpandableComment(agent_comment, 'Favor de subir nuevamente una foto donde salga el ticket completo con todos los datos legibles')
            }
          </View>

          <View style={styles.contentSection}>
            <View style={styles.sectionItem}>
              <TouchableOpacity
                style={styles.sectionItemActionContainer}
                onPress={() => actionSheetRef.current?.show()}>
                <Text style={styles.sectionItemActionBlack}>
                  Más información
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.sectionItem}>
              <TouchableOpacity
                style={styles.sectionItemActionContainer}
                onPress={handleInvoiceDeleteButton}>
                <Text style={styles.sectionItemActionDelete}>
                  Eliminar ticket
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScreenLayout>
    );
  }

  if (invoice.status === 'awaiting' || invoice.status === 'awaiting_merchant') {
    return (
      <ScreenLayout>
        <View style={{ minHeight: spaceLeftAfterImage }}>

          <View style={styles.scrollViewSection}>
            <View style={styles.sectionItem}>
              <View style={styles.sectionItemLabelContainer}>
                <Text style={styles.sectionItemLabel}>Emisor</Text>
              </View>
              <View style={styles.sectionItemInputContainer}>
                <Text style={styles.sectionItemInput}>
                  {invoice.ticket_merchant}
                </Text>
              </View>
            </View>
            <View style={styles.sectionItem}>
              <View style={styles.sectionItemLabelContainer}>
                <Text style={styles.sectionItemLabel}>Uso de CFDI</Text>
              </View>
              <View style={styles.sectionItemInputContainer}>
                <Text style={styles.sectionItemInput}>
                  {getShortCFDI(getCFDIDescription(invoice.ticket_category))}
                </Text>
              </View>
            </View>
            <View style={styles.sectionItem}>
              <View style={styles.sectionItemLabelContainer}>
                <Text style={styles.sectionItemLabel}>Fecha</Text>
              </View>
              <View style={styles.sectionItemInputContainer}>
                <Moment
                  utc
                  local
                  element={Text}
                  format="MMM D, YYYY"
                  style={styles.sectionItemInput}>
                  {invoice.created_at}
                </Moment>
              </View>
            </View>
            <View style={styles.sectionItem}>
              <View style={styles.sectionItemLabelContainer}>
                <Text style={styles.sectionItemLabel}>Total</Text>
              </View>
              <View style={styles.sectionItemInputContainer}>
                <Text style={[styles.sectionItemInput, { color: 'darkgreen' }]}>
                  ${invoice.ticket_total}
                </Text>
              </View>
            </View>
            <View style={styles.sectionItem}>
              <View style={styles.sectionItemLabelContainer}>
                <Text style={styles.sectionItemLabel}>Status</Text>
              </View>
              <View style={styles.sectionItemInputContainer}>
                <Text style={[styles.sectionItemInput, { color: statusColor }]}>
                  {statusCopy}
                </Text>
              </View>
            </View>
            {(agent_comment || invoice.status === 'awaiting' || invoice.status === 'awaiting_merchant') && 
              renderExpandableComment(agent_comment, 'Ya contactamos al comercio, estamos esperando respuesta')
            }
          </View>

          <View style={styles.contentSection}>
            <View style={styles.sectionItem}>
              <TouchableOpacity
                style={styles.sectionItemActionContainer}
                onPress={() => actionSheetRef.current?.show()}>
                <Text style={styles.sectionItemActionBlack}>
                  Más información
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.sectionItem}>
              <TouchableOpacity
                style={styles.sectionItemActionContainer}
                onPress={handleInvoiceDeleteButton}>
                <Text style={styles.sectionItemActionDelete}>
                  Eliminar ticket
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScreenLayout>
    );
  }

  if (invoice.status === 'unsignable' || 
    invoice.status === 'unsignable_merchant_unanswered' ||
    invoice.status === 'unsignable_merchant_systemless' ||
    invoice.status === 'unsignable_merchant_expired' ||
    invoice.status === 'unsignable_merchant_error') {
  return (
    <ScreenLayout>
      <View style={{ minHeight: spaceLeftAfterImage }}>

        <View style={styles.scrollViewSection}>
          <View style={styles.sectionItem}>
            <View style={styles.sectionItemLabelContainer}>
              <Text style={styles.sectionItemLabel}>Emisor</Text>
            </View>
            <View style={styles.sectionItemInputContainer}>
              <Text style={styles.sectionItemInput}>
                {invoice.ticket_merchant}
              </Text>
            </View>
          </View>
          <View style={styles.sectionItem}>
            <View style={styles.sectionItemLabelContainer}>
              <Text style={styles.sectionItemLabel}>Uso de CFDI</Text>
            </View>
            <View style={styles.sectionItemInputContainer}>
              <Text style={styles.sectionItemInput}>
                {getShortCFDI(getCFDIDescription(invoice.ticket_category))}
              </Text>
            </View>
          </View>
          <View style={styles.sectionItem}>
            <View style={styles.sectionItemLabelContainer}>
              <Text style={styles.sectionItemLabel}>Fecha</Text>
            </View>
            <View style={styles.sectionItemInputContainer}>
              <Moment
                utc
                local
                element={Text}
                format="MMM D, YYYY"
                style={styles.sectionItemInput}>
                {invoice.created_at}
              </Moment>
            </View>
          </View>
          <View style={styles.sectionItem}>
            <View style={styles.sectionItemLabelContainer}>
              <Text style={styles.sectionItemLabel}>Total</Text>
            </View>
            <View style={styles.sectionItemInputContainer}>
              <Text style={[styles.sectionItemInput, { color: 'darkgreen' }]}>
                ${invoice.ticket_total}
              </Text>
            </View>
          </View>
          <View style={styles.sectionItem}>
            <View style={styles.sectionItemLabelContainer}>
              <Text style={styles.sectionItemLabel}>Status</Text>
            </View>
            <View style={styles.sectionItemInputContainer}>
              <Text style={[styles.sectionItemInput, { color: statusColor }]}>
                {statusCopy}
              </Text>
            </View>
          </View>
          {(agent_comment || invoice.status === 'unsignable' || invoice.status === 'unsignable_merchant_unanswered' || invoice.status === 'unsignable_merchant_systemless' || invoice.status === 'unsignable_merchant_expired' || invoice.status === 'unsignable_merchant_error') && 
            renderExpandableComment(agent_comment, 'Lamentablemente no se pudo generar factura para este ticket')
          }
        </View>

        <View style={styles.contentSection}>
          <View style={styles.sectionItem}>
            <TouchableOpacity
              style={styles.sectionItemActionContainer}
              onPress={() => actionSheetRef.current?.show()}>
              <Text style={styles.sectionItemActionBlack}>
                Más información
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.sectionItem}>
            <TouchableOpacity
              style={styles.sectionItemActionContainer}
              onPress={handleInvoiceDeleteButton}>
              <Text style={styles.sectionItemActionDelete}>
                Eliminar ticket
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScreenLayout>
  );
}

  if (invoice.status === 'signed_no_files') {
    return (
      <ScreenLayout>
        <View style={styles.scrollViewSection}>
          <View style={styles.sectionItem}>
            <View style={styles.sectionItemLabelContainer}>
              <Text style={styles.sectionItemLabel}>Uso de CFDI</Text>
            </View>
            <View style={styles.sectionItemInputContainer}>
              <Text style={styles.sectionItemInput}>
                {getShortCFDI(getCFDIDescription(invoice.ticket_category))}
              </Text>
            </View>
          </View>
          <View style={styles.sectionItem}>
            <View style={styles.sectionItemLabelContainer}>
              <Text style={styles.sectionItemLabel}>
                Fecha
              </Text>
            </View>
            <View style={styles.sectionItemInputContainer}>
              <Moment
                utc
                local
                element={Text}
                format="MMM D, YYYY"
                style={styles.sectionItemInput}>
                {invoice.created_at}
              </Moment>
            </View>
          </View>
          <View style={styles.sectionItem}>
            <View style={styles.sectionItemLabelContainer}>
              <Text style={styles.sectionItemLabel}>Total</Text>
            </View>
            <View style={styles.sectionItemInputContainer}>
              <Text style={[styles.sectionItemInput, { color: 'darkgreen' }]}>
                ${invoice.ticket_total}
              </Text>
            </View>
          </View>
          <View style={[styles.sectionItem, styles.sectionItemLast]}>
            <View style={styles.sectionItemLabelContainer}>
              <Text style={styles.sectionItemLabel}>Status</Text>
            </View>
            <View style={styles.sectionItemInputContainer}>
              <Text style={[styles.sectionItemInput, { color: statusColor }]}>
                {statusCopy}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.contentSection}>
          <Text style={styles.signedAgentCommentHeadline}>Archivos</Text>
          {agent_comment ? (
            <Text style={styles.signedAgentCommentBody}>{agent_comment}</Text>
          ) : (
            <Text style={styles.signedAgentCommentBody}>
              El portal de facturación envió la factura directamente a tu correo
            </Text>
          )}
        </View>
        <View style={styles.contentSection}>
          <View style={styles.sectionItem}>
            <TouchableOpacity
              style={styles.sectionItemActionContainer}
              onPress={handleInvoiceDeleteButton}>
              <Text style={styles.sectionItemActionDelete}>Eliminar ticket</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScreenLayout >
    );
  }

  return (
    <ScreenLayout>
      <View style={styles.scrollViewSection}>
        <View style={styles.sectionItem}>
          <View style={styles.sectionItemLabelContainer}>
            <Text style={styles.sectionItemLabel}>Emisor</Text>
          </View>
          <View style={styles.sectionItemInputContainer}>
            <Text style={styles.sectionItemInput}>
              {invoice.ticket_merchant}
            </Text>
          </View>
        </View>
        <View style={styles.sectionItem}>
          <View style={styles.sectionItemLabelContainer}>
            <Text style={styles.sectionItemLabel}>Uso de CFDI</Text>
          </View>
          <View style={styles.sectionItemInputContainer}>
            <Text style={styles.sectionItemInput}>
              {getShortCFDI(getCFDIDescription(invoice.ticket_category))}
            </Text>
          </View>
        </View>
        <View style={styles.sectionItem}>
          <View style={styles.sectionItemLabelContainer}>
            <Text style={styles.sectionItemLabel}>Fecha</Text>
          </View>
          <View style={styles.sectionItemInputContainer}>
            <Moment
              utc
              local
              element={Text}
              format="MMM D, YYYY"
              style={styles.sectionItemInput}>
              {invoice.created_at}
            </Moment>
          </View>
        </View>
        <View style={styles.sectionItem}>
          <View style={styles.sectionItemLabelContainer}>
            <Text style={styles.sectionItemLabel}>Total</Text>
          </View>
          <View style={styles.sectionItemInputContainer}>
            <Text style={[styles.sectionItemInput, { color: 'darkgreen' }]}>
              ${invoice.ticket_total}
            </Text>
          </View>
        </View>
        <View style={[styles.sectionItem, styles.sectionItemLast]}>
          <View style={styles.sectionItemLabelContainer}>
            <Text style={styles.sectionItemLabel}>Status</Text>
          </View>
          <View style={styles.sectionItemInputContainer}>
            <Text style={[styles.sectionItemInput, { color: statusColor }]}>
              {statusCopy}
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.contentSection}>
        <View style={styles.sectionItem}>
          <TouchableOpacity
            disabled={!has_pdf_attached}
            style={styles.sectionItemActionContainer}
            onPress={handleDownloadInvoiceButton}>
            <Text
              style={[
                styles.sectionItemActionBlack,
                !has_pdf_attached ? styles.sectionItemActionDisabled : null,
              ]}>
              Descargar factura
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.sectionItem}>
          <TouchableOpacity
            disabled={!has_pdf_attached}
            style={styles.sectionItemActionContainer}
            onPress={() => Linking.openURL(invoice.invoice_pdf_url)}>
            <Text
              style={[
                styles.sectionItemActionBlack,
                !has_pdf_attached ? styles.sectionItemActionDisabled : null,
              ]}>
              Visualizar factura
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.sectionItem}>
          <TouchableOpacity
            disabled={!has_pdf_attached}
            style={styles.sectionItemActionContainer}
            onPress={handleForwardInvoiceButton}>
            <Text
              style={[
                styles.sectionItemActionBlack,
                !has_pdf_attached ? styles.sectionItemActionDisabled : null,
              ]}>
              Enviar por correo
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.contentSection}>
        <View style={styles.sectionItem}>
          <TouchableOpacity
            style={styles.sectionItemActionContainer}
            onPress={handleInvoiceDeleteButton}>
            <Text style={[styles.sectionItemActionDelete]}>Eliminar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  innerScreenView: {
    marginBottom: spacing[12], // 48px
    paddingTop: 0,
    paddingLeft: spacing[6], // 24px
    paddingRight: spacing[6], // 24px
    zIndex: 2,
    alignItems: 'center',
  },
  innerScreenHeadline: {
    fontSize: typography?.fontSize?.xl || 20,
    fontWeight: typography?.fontWeight?.semibold || '600',
    color: colors?.text?.primary || '#111827',
    marginBottom: spacing?.[6] || 24,
    // Optimizado: sin lineHeight problemático
  },
  innerScreenText: {
    fontSize: typography?.fontSize?.xl || 20,
    fontWeight: typography?.fontWeight?.normal || '400',
    color: colors?.text?.primary || '#111827',
    textAlign: 'center',
    // Optimizado: sin lineHeight problemático
  },
  agentCommentView: {
    padding: spacing[2], // 8px
    paddingHorizontal: spacing[4], // 16px
    paddingTop: spacing[3], // 12px
    backgroundColor: colors.background.secondary,
    borderColor: colors.border.dark,
    borderWidth: 1,
    width: '100%',
    borderRadius: borderRadius.base, // 6px
  },
  agentCommentHeadline: {
    fontSize: typography?.fontSize?.lg || 18,
    fontWeight: typography?.fontWeight?.semibold || '600',
    color: colors?.text?.primary || '#111827',
    textAlign: 'center',
    marginBottom: spacing?.[2] || 8,
    // Optimizado: sin lineHeight problemático
  },
  agentCommentBody: {
    fontSize: typography?.fontSize?.lg || 18,
    fontWeight: typography?.fontWeight?.normal || '400',
    color: colors?.text?.primary || '#111827',
    textAlign: 'justify',
    marginBottom: spacing?.[2] || 8,
    // Optimizado: sin lineHeight problemático
  },
  signedAgentCommentHeadline: {
    fontSize: typography?.fontSize?.lg || 18,
    color: colors?.text?.primary || '#111827',
    fontWeight: typography?.fontWeight?.semibold || '600',
    paddingTop: spacing?.[4] || 16,
    marginLeft: spacing?.[4] || 16,
    // Optimizado: sin lineHeight problemático
  },
  signedAgentCommentBody: {
    fontSize: typography?.fontSize?.base || 16,
    color: colors?.text?.secondary || '#374151',
    marginTop: spacing?.[4] || 16,
    paddingLeft: spacing?.[4] || 16,
    paddingRight: spacing?.[4] || 16,
    marginBottom: spacing?.[4] || 16,
    // Optimizado: sin lineHeight problemático
  },
  scrollViewSection: {
    backgroundColor: colors.background.primary,
    marginBottom: spacing[12], // 48px
    borderTopColor: colors.border.light,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border.light,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderRadius: borderRadius.lg, // 8px
    ...shadows.sm,
  },
  sectionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing[4], // 16px
    paddingBottom: spacing[4], // 16px
    paddingRight: spacing[4], // 16px
    marginLeft: spacing[4], // 16px
    borderBottomColor: colors.border.light,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  sectionItemLast: {
    borderBottomWidth: 0,
  },
  sectionItemActionContainer: {
    flex: 1,
  },
  sectionItemAction: {
    fontSize: typography?.fontSize?.lg || 18,
    color: colors?.primary?.[500] || '#5B22FA',
    fontWeight: typography?.fontWeight?.medium || '500',
    // Optimizado: sin lineHeight problemático
  },
  sectionItemActionBlack: {
    fontSize: typography?.fontSize?.base || 16,
    color: colors?.text?.primary || '#111827',
    fontWeight: typography?.fontWeight?.normal || '400',
    // Optimizado: sin lineHeight problemático
  },
  sectionItemActionDelete: {
    fontSize: typography?.fontSize?.base || 16,
    color: colors?.error?.[500] || '#EF4444',
    fontWeight: typography?.fontWeight?.medium || '500',
    // Optimizado: sin lineHeight problemático
  },
  sectionItemActionDisabled: {
    fontSize: typography?.fontSize?.lg || 18,
    color: colors?.text?.disabled || '#9CA3AF',
    fontWeight: typography?.fontWeight?.medium || '500',
    // Optimizado: sin lineHeight problemático
  },
  sectionItemLabelContainer: {
    flexBasis: 112,
    justifyContent: 'flex-start',
  },
  sectionItemLabel: {
    fontSize: typography?.fontSize?.base || 16,
    color: colors?.text?.primary || '#111827',
    fontWeight: typography?.fontWeight?.medium || '500',
    // Optimizado: sin lineHeight problemático
  },
  sectionItemInputContainer: {
    flex: 1,
    marginRight: spacing[3], // 12px
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  sectionItemInput: {
    fontSize: typography?.fontSize?.sm || 14,
    color: colors?.text?.secondary || '#374151',
    textAlign: 'right',
    // Optimizado: sin lineHeight problemático
  },
  sectionItemComment: {
    fontSize: typography?.fontSize?.sm || 14,
    color: colors?.text?.secondary || '#374151',
    textAlign: 'left',
    flex: 1,
    lineHeight: 18,
    // Optimizado: sin lineHeight problemático
  },
  expandButtonText: {
    color: colors?.primary?.[500] || '#5B22FA',
    fontSize: typography?.fontSize?.sm || 14,
    fontWeight: typography?.fontWeight?.medium || '500',
    // Optimizado: sin lineHeight problemático
  },
  agentCommentCard: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg, // 8px
    padding: spacing[4], // 16px
    marginHorizontal: spacing[4], // 16px
    marginBottom: spacing[4], // 16px
    ...shadows.sm,
  },
  agentCommentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[2], // 8px
  },
  agentCommentHeadline: {
    fontSize: typography?.fontSize?.base || 16,
    fontWeight: typography?.fontWeight?.semibold || '600',
    color: colors?.text?.primary || '#111827',
    // Optimizado: sin lineHeight problemático
  },
  agentCommentBody: {
    fontSize: typography?.fontSize?.sm || 14,
    color: colors?.text?.secondary || '#374151',
    // Optimizado: sin lineHeight problemático
  },
  infoCard: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg, // 8px
    padding: spacing[4], // 16px
    marginHorizontal: spacing[4], // 16px
    marginBottom: spacing[4], // 16px
    ...shadows.sm,
  },
  infoText: {
    fontSize: typography?.fontSize?.sm || 14,
    color: colors?.text?.secondary || '#374151',
    textAlign: 'center',
    // Optimizado: sin lineHeight problemático
  },
  actionsContainer: {
    marginTop: spacing[4], // 16px
    width: '100%',
    paddingHorizontal: spacing[4], // 16px
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[3], // 12px
    marginBottom: spacing[3], // 12px
    borderRadius: borderRadius.lg, // 8px
    backgroundColor: colors.background.secondary,
  },
  actionButtonText: {
    fontSize: typography?.fontSize?.base || 16,
    color: colors?.primary?.[500] || '#5B22FA',
    fontWeight: typography?.fontWeight?.medium || '500',
    // Optimizado: sin lineHeight problemático
  },
  
  // ActionSheet styles
  actionSheetContainer: {
    paddingBottom: spacing[4], // 16px
  },

  actionSheetHeader: {
    paddingHorizontal: spacing[6], // 24px
    paddingTop: spacing[6], // 24px
    paddingBottom: spacing[4], // 16px
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border.light,
  },
  
  actionSheetTitle: {
    textAlign: 'center',
    fontSize: typography?.fontSize?.xl || 20,
    fontWeight: typography?.fontWeight?.semibold || '600',
    color: colors?.text?.primary || '#111827',
    marginBottom: spacing?.[2] || 8,
  },
  
  actionSheetSubtitle: {
    textAlign: 'center',
    color: colors?.text?.secondary || '#374151',
    fontSize: typography?.fontSize?.sm || 14,
    fontWeight: typography?.fontWeight?.normal || '400',
  },

  actionSheetContent: {
    paddingHorizontal: spacing[4], // 16px
    paddingTop: spacing[4], // 16px
  },

  actionSheetPrimaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
    paddingVertical: spacing[4], // 16px
    paddingHorizontal: spacing[4], // 16px
    borderRadius: borderRadius.lg, // 8px
    marginBottom: spacing[3], // 12px
    borderWidth: 1,
    borderColor: colors.success[200],
    ...shadows.sm,
  },

  actionSheetSecondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
    paddingVertical: spacing[4], // 16px
    paddingHorizontal: spacing[4], // 16px
    borderRadius: borderRadius.lg, // 8px
    marginBottom: spacing[4], // 16px
    borderWidth: 1,
    borderColor: colors.border.medium,
    ...shadows.sm,
  },

  actionSheetButtonIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.gray[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3], // 12px
  },

  actionSheetButtonContent: {
    flex: 1,
  },

  actionSheetButtonTitle: {
    fontSize: typography?.fontSize?.base || 16,
    fontWeight: typography?.fontWeight?.medium || '500',
    color: colors?.text?.primary || '#111827',
  },

  actionSheetCancelButton: {
    marginHorizontal: spacing[4], // 16px
    marginTop: spacing[2], // 8px
    paddingVertical: spacing[4], // 16px
    paddingHorizontal: spacing[4], // 16px
    borderRadius: borderRadius.lg, // 8px
    backgroundColor: colors.gray[100],
    alignItems: 'center',
  },

  actionSheetCancelText: {
    fontSize: typography?.fontSize?.base || 16,
    fontWeight: typography?.fontWeight?.medium || '500',
    color: colors?.text?.secondary || '#374151',
  },
  
  // Content section style
  contentSection: {
    backgroundColor: colors.background.primary,
    marginBottom: spacing[8], // 32px
    borderRadius: borderRadius.lg, // 8px
    ...shadows.sm,
  },
  
  // Status overlay text
  statusOverlayText: {
    color: colors?.text?.inverse || '#FFFFFF',
    fontSize: typography?.fontSize?.lg || 18,
    fontWeight: typography?.fontWeight?.medium || '500',
  },
});