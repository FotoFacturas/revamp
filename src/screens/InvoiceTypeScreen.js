import * as React from 'react';
import {
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  StyleSheet,
  ScrollView,
  Modal,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { AuthContext } from './../contexts/AuthContext';
import IconFA from 'react-native-vector-icons/dist/FontAwesome5';
import IconFO from 'react-native-vector-icons/dist/Fontisto';
import Dialog from 'react-native-dialog';
import * as API from './../lib/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const screenWidth = Math.round(Dimensions.get('window').width);
const screenHeight = Math.round(Dimensions.get('window').height);

// CFDI options data
const allCFDIOptions = [
  { id: 'G01', title: 'G01: Adquisición de mercancías' },
  { id: 'G02', title: 'G02: Devoluciones, descuentos o bonificaciones' },
  { id: 'G03', title: 'G03: Gastos en general' },
  { id: 'I01', title: 'I01: Construcciones' },
  { id: 'I02', title: 'I02: Mobiliario y equipo de oficina por inversiones' },
  { id: 'I03', title: 'I03: Equipo de transporte' },
  { id: 'I04', title: 'I04: Equipo de cómputo y accesorios' },
  { id: 'I05', title: 'I05: Dados, troqueles, moldes, matrices y herramental' },
  { id: 'I06', title: 'I06: Comunicaciones telefónicas' },
  { id: 'I07', title: 'I07: Comunicaciones satelitales' },
  { id: 'I08', title: 'I08: Otra maquinaria y equipo' },
  { id: 'D01', title: 'D01: Honorarios médicos, dentales y gastos hospitalarios' },
  { id: 'D02', title: 'D02: Gastos médicos por incapacidad o discapacidad' },
  { id: 'D03', title: 'D03: Gastos funerales' },
  { id: 'D04', title: 'D04: Donativos' },
  { id: 'D05', title: 'D05: Intereses reales pagados por créditos hipotecarios' },
  { id: 'D06', title: 'D06: Aportaciones voluntarias al SAR' },
  { id: 'D07', title: 'D07: Primas por seguros de gastos médicos' },
  { id: 'D08', title: 'D08: Gastos de transportación escolar obligatoria' },
  { id: 'D09', title: 'D09: Depósitos en cuentas para el ahorro, primas para planes de pensiones' },
  { id: 'D10', title: 'D10: Pagos por servicios educativos (colegiaturas)' },
  { id: 'S01', title: 'S01: Sin efectos fiscales' },
  { id: 'CP01', title: 'CP01: Pagos' },
  { id: 'CN01', title: 'CN01: Nómina' }
];

// Map of tax regimes to allowed CFDI usages
const regimeToCFDIMap = {
  // Based on the information from the Tabla de Usos de CFDI por Régimen Fiscal
  '601': ['G01', 'G02', 'G03', 'I01', 'I02', 'I03', 'I04', 'I05', 'I06', 'I07', 'I08', 'S01', 'CP01'],
  '603': ['G01', 'G02', 'G03', 'I01', 'I02', 'I03', 'I04', 'I05', 'I06', 'I07', 'I08', 'S01', 'CP01'],
  '605': ['D01', 'D02', 'D03', 'D04', 'D05', 'D06', 'D07', 'D08', 'D09', 'D10', 'S01', 'CP01', 'CN01'],
  '606': ['G01', 'G02', 'G03', 'I01', 'I02', 'I03', 'I04', 'I05', 'I06', 'I07', 'I08', 'D01', 'D02', 'D03', 'D04', 'D05', 'D06', 'D07', 'D08', 'D09', 'D10', 'S01', 'CP01'],
  '607': ['D01', 'D02', 'D03', 'D04', 'D05', 'D06', 'D07', 'D08', 'D09', 'D10', 'S01', 'CP01'],
  '608': ['D01', 'D02', 'D03', 'D04', 'D05', 'D06', 'D07', 'D08', 'D09', 'D10', 'S01', 'CP01'],
  '610': ['S01', 'CP01'],
  '611': ['D01', 'D02', 'D03', 'D04', 'D05', 'D06', 'D07', 'D08', 'D09', 'D10', 'S01', 'CP01'],
  '612': ['G01', 'G02', 'G03', 'I01', 'I02', 'I03', 'I04', 'I05', 'I06', 'I07', 'I08', 'D01', 'D02', 'D03', 'D04', 'D05', 'D06', 'D07', 'D08', 'D09', 'D10', 'S01', 'CP01'],
  '614': ['D01', 'D02', 'D03', 'D04', 'D05', 'D06', 'D07', 'D08', 'D09', 'D10', 'S01', 'CP01'],
  '615': ['D01', 'D02', 'D03', 'D04', 'D05', 'D06', 'D07', 'D08', 'D09', 'D10', 'S01', 'CP01'],
  '616': ['S01', 'CP01'],
  '620': ['G01', 'G02', 'G03', 'I01', 'I02', 'I03', 'I04', 'I05', 'I06', 'I07', 'I08', 'S01', 'CP01'],
  '621': ['G01', 'G02', 'G03', 'I01', 'I02', 'I03', 'I04', 'I05', 'I06', 'I07', 'I08', 'S01', 'CP01'],
  '622': ['G01', 'G02', 'G03', 'I01', 'I02', 'I03', 'I04', 'I05', 'I06', 'I07', 'I08', 'S01', 'CP01'],
  '623': ['G01', 'G02', 'G03', 'I01', 'I02', 'I03', 'I04', 'I05', 'I06', 'I07', 'I08', 'S01', 'CP01'],
  '624': ['G01', 'G02', 'G03', 'I01', 'I02', 'I03', 'I04', 'I05', 'I06', 'I07', 'I08', 'S01', 'CP01'],
  '625': ['G01', 'G02', 'G03', 'I01', 'I02', 'I03', 'I04', 'I05', 'I06', 'I07', 'I08', 'D01', 'D02', 'D03', 'D04', 'D05', 'D06', 'D07', 'D08', 'D09', 'D10', 'S01', 'CP01'],
  '626': ['G01', 'G02', 'G03', 'I01', 'I02', 'I03', 'I04', 'I05', 'I06', 'I07', 'I08', 'S01', 'CP01']
};

// CSF document code mapping
const csfCodeMapping = {
  '6741': '601', // General de Ley Personas Morales
  '6742': '603', // Personas Morales con Fines no Lucrativos
  '6743': '605', // Sueldos y Salarios
  '6744': '606', // Arrendamiento
  '6745': '608', // Demás ingresos
  '6746': '609', // Consolidación
  '6747': '610', // Residentes en el Extranjero sin Establecimiento Permanente
  '6748': '611', // Ingresos por Dividendos
  '6749': '612', // Personas Físicas con Actividades Empresariales
  '6750': '614', // Ingresos por intereses
  '6751': '616', // Sin obligaciones fiscales
  '6752': '620', // Sociedades Cooperativas de Producción
  '6753': '621', // Incorporación Fiscal
  '6754': '622', // Actividades Agrícolas, Ganaderas, Silvícolas y Pesqueras
  '6755': '623', // Opcional para Grupos de Sociedades
  '6756': '624', // Coordinados
  '6757': '626', // Régimen Simplificado de Confianza
};

// Extract the tax regime code from the taxpayer_entity field
const extractRegimeCode = (taxpayerEntity) => {
  if (!taxpayerEntity) return null;

  // Handle the CSF_PDF_TAXPAYER_TYPE_XXXX format from uploaded CSF documents
  if (taxpayerEntity.includes('CSF_PDF_TAXPAYER_TYPE_')) {
    // Format is CSF_PDF_TAXPAYER_TYPE_XXXX where XXXX contains the regime code
    const code = taxpayerEntity.split('_').pop();
    return csfCodeMapping[code] || '626';
  }

  // If it's already a standard regime code (3 digits)
  if (/^\d{3}$/.test(taxpayerEntity)) {
    return taxpayerEntity;
  }

  // For full text descriptions like "Régimen Simplificado de Confianza"
  if (taxpayerEntity.includes('Simplificado de Confianza')) {
    return '626';
  }
  if (taxpayerEntity.includes('Personas Físicas con Actividad')) {
    return '612';
  }
  if (taxpayerEntity.includes('Opcional para Grupos de Sociedades')) {
    return '623';
  }

  // Default to RESICO if we can't determine the format
  return '626';
};

// PaymentOption component
const PaymentOption = ({ title, isSelected, onSelect, value = null }) => {
  return (
    <TouchableOpacity
      onPress={onSelect}
      style={styles.paymentOptionContainer}>
      <View style={styles.paymentOptionRow}>
        <View style={styles.checkmarkContainer}>
          {isSelected && (
            <IconFA name="check" size={15} color="#2979FF" />
          )}
        </View>
        <Text style={styles.paymentOptionText}>{title}</Text>
        {value && <Text style={styles.paymentOptionValue}>{value}</Text>}
      </View>
    </TouchableOpacity>
  );
};

// CFDIOption component
const CFDIOption = ({ title, isSelected, onSelect }) => {
  return (
    <TouchableOpacity
      onPress={onSelect}
      style={styles.cfdiOptionContainer}>
      <View style={styles.cfdiOptionRow}>
        <View style={styles.checkmarkContainer}>
          {isSelected && (
            <IconFA name="check" size={15} color="#2979FF" />
          )}
        </View>
        <Text style={styles.cfdiOptionText}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default function InvoiceTypeScreen(props) {
  const { session, setSplashScreenBG } = React.useContext(AuthContext);

  const [selectedPayment, setSelectedPayment] = React.useState('cash');
  const [ticketCategory, setTicketCategory] = React.useState('');
  const [isDialogVisible, setIsDialogVisible] = React.useState(false);
  const [isCFDIModalVisible, setIsCFDIModalVisible] = React.useState(false);
  const [last4Digits, setLast4Digits] = React.useState('');
  const [isHandlingConfirmation, setIsHandlingConfirmation] = React.useState(false);
  const [userTaxpayerEntity, setUserTaxpayerEntity] = React.useState(null);

  const ticketID = props.route?.params?.ticketID || 0;

  const userRegimeCode = React.useMemo(() =>
    extractRegimeCode(userTaxpayerEntity),
    [userTaxpayerEntity]
  );

  // Filter CFDI options based on the user's tax regime
  const cfdiOptions = React.useMemo(() => {
    const allowedCodes = userRegimeCode ? regimeToCFDIMap[userRegimeCode] || [] : [];

    // If no specific allowed codes for this regime, return all options
    if (!allowedCodes || allowedCodes.length === 0) {
      return allCFDIOptions;
    }

    // Filter the options to only include allowed ones
    return allCFDIOptions.filter(option => allowedCodes.includes(option.id));
  }, [userRegimeCode]);

  // Using cfdiOptions directly now that we've removed the additional options
  const allOptions = cfdiOptions;

  React.useEffect(() => {
    setSplashScreenBG && setSplashScreenBG('white');

    async function recoverLast4Digits() {
      let last_4_digits;
      try {
        const _last_4_digits = await AsyncStorage.getItem('LAST_4_DIGITS');
        last_4_digits = JSON.parse(_last_4_digits);
      } catch (e) {
        last_4_digits = '';
      }
      setLast4Digits(last_4_digits || '');
    }

    // Fetch the user's information to get taxpayer_entity
    async function fetchUserInfo() {
      try {
        // Get the user data from the session or fetch it from API
        const userData = await API.getUserData({
          token: session.token,
        });

        // Set the user's tax regime from the taxpayer_entity field
        if (userData && userData.taxpayer_entity) {
          setUserTaxpayerEntity(userData.taxpayer_entity);
        } else {
          // Default to a common regime if not found
          setUserTaxpayerEntity('626'); // Régimen Simplificado de Confianza
        }
      } catch (e) {
        console.warn('Error fetching user data:', e);
        setUserTaxpayerEntity('626'); // Default to a common regime on error
      }
    }

    recoverLast4Digits();
    fetchUserInfo();
  }, []);

  // Set default CFDI option when options or user regime changes
  React.useEffect(() => {
    if (cfdiOptions.length > 0 && !ticketCategory) {
      // Check if "Gastos en general" (G03) is available
      const hasG03 = cfdiOptions.some(option => option.id === 'G03');

      // If G03 is available, use it as default, otherwise use the first option
      if (hasG03) {
        setTicketCategory('G03');
      } else {
        setTicketCategory(cfdiOptions[0].id);
      }
    }
  }, [cfdiOptions, ticketCategory]);

  React.useEffect(() => {
    if (selectedPayment === 'cash' || selectedPayment === 'transfer') return;
    setIsDialogVisible(true);
  }, [selectedPayment]);

  const handleCancelDialog = () => {
    setSelectedPayment('cash');
    setIsDialogVisible(false);
  };

  const handleAcceptDialog = async () => {
    // If payment is cash or transfer, set last4Digits to 'N/A'
    if (selectedPayment === 'cash' || selectedPayment === 'transfer') {
      setLast4Digits('N/A');
    } else {
      if (last4Digits.length < 4) {
        setLast4Digits('');
        setSelectedPayment('cash');
        alert('4 digitos necesarios');
        setIsDialogVisible(false);
        return;
      }
      if (last4Digits.length > 4) {
        setLast4Digits('');
        setSelectedPayment('cash');
        alert('Únicamente 4 digitos');
        setIsDialogVisible(false);
        return;
      }
    }

    setIsDialogVisible(false);
    try {
      await AsyncStorage.setItem('LAST_4_DIGITS', JSON.stringify(last4Digits));
    } catch (e) {
      console.warn('saving digits error: ', e);
    }
  };

  const handleConfirmation = async () => {
    setIsHandlingConfirmation(true);
    try {
      const updatedTicket = await API.updateTicket({
        token: session.token,
        ticketID: ticketID,
        updateJSON: {
          ticket_payment_method: selectedPayment,
          ticket_payment_method_details:
            ['cash', 'transfer'].includes(selectedPayment) ? 'N/A' : last4Digits,
          ticket_category: ticketCategory,
          confirmed_by_user: true,
        },
      });

      props.navigation?.pop?.(2);
    } catch (e) {
      alert('Unexpected error please try again');
      console.log({ e });
    } finally {
      setIsHandlingConfirmation(false);
    }
  };
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <Dialog.Container visible={isDialogVisible}>
        <Dialog.Title style={styles.dialogTitle}>Últimos 4 Dígitos</Dialog.Title>
        <Dialog.Description>
          Escribe los últimos 4 dígitos de la tarjeta con la que pagaste este ticket.
        </Dialog.Description>
        <Dialog.Input
          value={last4Digits}
          onChangeText={text => setLast4Digits(text)}
          keyboardType="number-pad"
          placeholder="XXXX"
        />
        <Dialog.Button label="Cancelar" onPress={handleCancelDialog} />
        <Dialog.Button
          label="Aceptar"
          bold={true}
          onPress={handleAcceptDialog}
        />
      </Dialog.Container>

      {/* CFDI Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isCFDIModalVisible}
        onRequestClose={() => setIsCFDIModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seleccionar CFDI</Text>
              <TouchableOpacity onPress={() => setIsCFDIModalVisible(false)}>
                <Text style={styles.modalCloseButton}>Cerrar</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScrollView}>
              {allOptions.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.modalOption,
                    ticketCategory === option.id && styles.modalOptionSelected
                  ]}
                  onPress={() => {
                    setTicketCategory(option.id);
                    setIsCFDIModalVisible(false);
                  }}>
                  <Text
                    style={[
                      styles.modalOptionText,
                      ticketCategory === option.id && styles.modalOptionTextSelected
                    ]}>
                    {option.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>


      {/* Title */}
      <View style={styles.titleContainer}>
        <Text style={styles.pageTitle}>Confirmar datos</Text>
      </View>

      <ScrollView style={styles.container}>
        {/* Payment Method Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeader}>FORMA DE PAGO</Text>

          <PaymentOption
            title="Efectivo"
            isSelected={selectedPayment === 'cash'}
            onSelect={() => setSelectedPayment('cash')}
          />

          <PaymentOption
            title="Transferencia"
            isSelected={selectedPayment === 'transfer'}
            onSelect={() => setSelectedPayment('transfer')}
          />

          <PaymentOption
            title="Tarjeta de débito"
            isSelected={selectedPayment === 'debit'}
            onSelect={() => setSelectedPayment('debit')}
            value={selectedPayment === 'debit' && last4Digits ? last4Digits : null}
          />

          <PaymentOption
            title="Tarjeta de crédito"
            isSelected={selectedPayment === 'credit'}
            onSelect={() => setSelectedPayment('credit')}
            value={selectedPayment === 'credit' && last4Digits ? last4Digits : null}
          />
        </View>

        {/* CFDI Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeader}>USO DE CFDI</Text>

          {/* Fixed CFDI options list - G03, G01, G02 (with checkmark on the selected one) */}
          <TouchableOpacity
            style={styles.cfdiOptionContainer}
            onPress={() => setTicketCategory('G03')}>
            <View style={styles.cfdiOptionRow}>
              <View style={styles.checkmarkContainer}>
                {ticketCategory === 'G03' && (
                  <IconFA name="check" size={15} color="#2979FF" />
                )}
              </View>
              <Text style={styles.cfdiOptionText}>
                G03: Gastos en general
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cfdiOptionContainer}
            onPress={() => setTicketCategory('G01')}>
            <View style={styles.cfdiOptionRow}>
              <View style={styles.checkmarkContainer}>
                {ticketCategory === 'G01' && (
                  <IconFA name="check" size={15} color="#2979FF" />
                )}
              </View>
              <Text style={styles.cfdiOptionText}>
                G01: Adquisición de mercancías
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cfdiOptionContainer}
            onPress={() => setTicketCategory('G02')}>
            <View style={styles.cfdiOptionRow}>
              <View style={styles.checkmarkContainer}>
                {ticketCategory === 'G02' && (
                  <IconFA name="check" size={15} color="#2979FF" />
                )}
              </View>
              <Text style={styles.cfdiOptionText}>
                G02: Devoluciones, descuentos o bonificaciones
              </Text>
            </View>
          </TouchableOpacity>

          {/* Display any other selected option if not one of the default three */}
          {ticketCategory !== 'G01' && ticketCategory !== 'G02' && ticketCategory !== 'G03' && (
            <TouchableOpacity
              style={styles.cfdiOptionContainer}
              onPress={() => { }}>
              <View style={styles.cfdiOptionRow}>
                <View style={styles.checkmarkContainer}>
                  <IconFA name="check" size={15} color="#2979FF" />
                </View>
                <Text style={styles.cfdiOptionText}>
                  {allOptions.find(option => option.id === ticketCategory)?.title || 'Seleccionar'}
                </Text>
              </View>
            </TouchableOpacity>
          )}

          {/* Keep "Seleccionar otro..." button to see all options */}
          <TouchableOpacity
            style={styles.selectAnotherButton}
            onPress={() => setIsCFDIModalVisible(true)}>
            <Text style={styles.selectAnotherText}>Seleccionar otro...</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          disabled={isHandlingConfirmation}
          onPress={handleConfirmation}
          style={styles.confirmButton}>
          <Text style={styles.confirmButtonText}>Confirmar</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// All styles in one StyleSheet
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'white',
  },
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  headerAction: {
    fontSize: 16,
    color: '#2979FF',
    fontWeight: '600',
  },
  sectionContainer: {
    marginBottom: 20,
    backgroundColor: 'white',
  },
  sectionHeader: {
    fontSize: 13,
    color: '#888888',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: '#F2F2F7',
  },
  paymentOptionContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  paymentOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  paymentOptionText: {
    flex: 1,
    fontSize: 16,
  },
  paymentOptionValue: {
    fontSize: 16,
    color: '#888888',
  },
  checkmarkContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  cfdiOptionContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  cfdiOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  cfdiOptionText: {
    fontSize: 16,
  },
  cfdiSelectedOption: {
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  cfdiSelectedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  cfdiSelectedText: {
    fontSize: 16,
  },
  selectAnotherButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  selectAnotherText: {
    fontSize: 16,
    color: '#2979FF',
  },
  footer: {
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  confirmButton: {
    backgroundColor: '#5E29EF',
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalCloseButton: {
    fontSize: 16,
    color: '#2979FF',
  },
  modalScrollView: {
    maxHeight: 400,
  },
  modalOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalOptionSelected: {
    backgroundColor: '#F5F5F5',
  },
  modalOptionText: {
    fontSize: 16,
  },
  modalOptionTextSelected: {
    fontWeight: 'bold',
  },
  dialogTitle: {
    fontWeight: 'bold',
  },
  // Add these new styles to the end of your StyleSheet
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F8F8F8',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  navButtonLeft: {
    fontSize: 16,
    color: '#007AFF',
  },
  navButtonRight: {
    fontSize: 16,
    color: '#007AFF',
  },
  navTitle: {
    fontSize: 17,
    fontWeight: 'bold',
  },
  titleContainer: {
    paddingHorizontal: 20,
    paddingTop: 26,
    paddingBottom: 16,
    backgroundColor: '#F2F2F7',
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: 'bold',
  },
});