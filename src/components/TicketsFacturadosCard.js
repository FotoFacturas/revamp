import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AuthContext } from '../contexts/AuthContext';
import Icon from 'react-native-vector-icons/dist/Feather';

const TicketsFacturadosCard = ({ forceRefresh = false }) => {
  const [totalFacturas, setTotalFacturas] = useState(null);
  const [ivaFacturas, setIvaFacturas] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { session } = useContext(AuthContext);
  const token = session?.token;

  // Helper para formato compacto
  const formatAmount = (amount) => {
    const number = Number(amount);
    if (number >= 1000000) {
      return `$${(number / 1000000).toFixed(1)}M`;
    } else if (number >= 10000) {
      return `$${(number / 1000).toFixed(1)}K`;
    } else {
      return `$${number.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
  };

  useEffect(() => {
    const fetchTicketsAndSum = async () => {
      try {
        setIsLoading(true);
        if (!token) {
          console.log('❌ No token found in AuthContext session');
          setTotalFacturas(0);
          setIvaFacturas(0);
          setIsLoading(false);
          return;
        }
        
        const api = require('../lib/api');
        const response = await api.getTickets(token, 'all');
        
        if (response && response.tickets) {
          const now = new Date();
          const currentMonth = now.getMonth();
          const currentYear = now.getFullYear();
          
          const total = response.tickets
            .filter(t =>
              t.status === 'signed' &&
              t.ticket_total !== null &&
              new Date(t.created_at).getMonth() === currentMonth &&
              new Date(t.created_at).getFullYear() === currentYear
            )
            .reduce((sum, t) => sum + parseFloat(t.ticket_total), 0);
          
          setTotalFacturas(total);
          setIvaFacturas(total * 0.16);
        } else {
          setTotalFacturas(0);
          setIvaFacturas(0);
        }
      } catch (e) {
        console.error('Error fetching tickets:', e);
        setTotalFacturas('Error');
        setIvaFacturas('Error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTicketsAndSum();
  }, [token, forceRefresh]);

  if (isLoading) {
    return (
      <View style={styles.facturasCard}>
        <View style={styles.titleContainer}>
          <Icon name="credit-card" size={16} color="#6023D1" style={styles.titleIcon} />
          <Text style={styles.facturasTitle}>Resumen mensual</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.facturasCard}>
      <View style={styles.titleContainer}>
        <Icon name="credit-card" size={16} color="#6023D1" style={styles.titleIcon} />
        <Text style={styles.facturasTitle}>Resumen mensual</Text>
      </View>
      <View style={styles.facturasRow}>
        <View style={styles.facturasCol}>
          <Text style={styles.facturasLabel}>Total</Text>
          {totalFacturas !== null && totalFacturas !== 'Error' && (
            <Text style={styles.facturasTotalNegro}>
              {formatAmount(totalFacturas)}
            </Text>
          )}
          {totalFacturas === 'Error' && (
            <Text style={styles.errorText}>Error</Text>
          )}
        </View>
        <View style={styles.facturasCol}>
          <Text style={styles.facturasLabel}>IVA (16%)</Text>
          {ivaFacturas !== null && ivaFacturas !== 'Error' && (
            <Text style={styles.facturasTotalNegro}>
              {formatAmount(ivaFacturas)}
            </Text>
          )}
          {ivaFacturas === 'Error' && (
            <Text style={styles.errorText}>Error</Text>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  facturasCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleIcon: {
    marginRight: 8,
  },
  facturasTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  facturasRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  facturasCol: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  facturasLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  facturasTotalNegro: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
  },
  errorText: {
    textAlign: 'center',
    marginTop: 10,
    fontSize: 16,
    color: 'red',
  },
});

export default TicketsFacturadosCard; 