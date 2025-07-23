// AgentMessage.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import IconAnt from 'react-native-vector-icons/dist/AntDesign';

const AgentMessage = ({ message }) => {
  const [expanded, setExpanded] = useState(false);
  
  if (!message) return null;
  
  // If message is short (less than 100 chars), don't add "See more"
  const isLongMessage = message.length > 100;
  
  // Display only first 2 lines if not expanded and message is long
  const displayText = isLongMessage && !expanded 
    ? message.substring(0, 100) + '...' 
    : message;
    
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mensaje del Agente</Text>
      </View>
      <View style={styles.messageContainer}>
        <Text style={styles.messageText}>
          {displayText}
        </Text>
        
        {isLongMessage && (
          <TouchableOpacity 
            style={styles.expandButton} 
            onPress={() => setExpanded(!expanded)}
          >
            <Text style={styles.expandButtonText}>
              {expanded ? 'Ver menos' : 'Ver más'}
            </Text>
            <IconAnt 
              name={expanded ? "up" : "down"} 
              size={14} 
              color="#007AFF" 
              style={styles.expandIcon} 
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginVertical: 12,
    overflow: 'hidden',
  },
  header: {
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827', // Color más oscuro
    textAlign: 'center',
  },
  messageContainer: {
    padding: 12,
  },
  messageText: {
    fontSize: 14,
    color: '#374151', // Color más oscuro
    lineHeight: 18,
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
  },
  expandButtonText: {
    color: '#007AFF',
    fontSize: 13,
    fontWeight: '500',
  },
  expandIcon: {
    marginLeft: 4,
  }
});

export default AgentMessage;