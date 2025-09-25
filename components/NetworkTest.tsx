import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { authAPI } from '../services/api';
import { testApiConnectivity } from '../utils/networkUtils';

export const NetworkTest = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<string>('');

  const testConnection = async () => {
    setIsLoading(true);
    setTestResult('Testing connection...');
    
    try {
      // Test API connectivity with automatic detection
      const detectedUrl = await testApiConnectivity();
      
      if (detectedUrl) {
        setTestResult(`✅ Backend connection successful!\n📍 Server found at: ${detectedUrl}`);
        
        // Test auth endpoint
        try {
          await authAPI.getCurrentUser();
          setTestResult(prev => prev + '\n✅ Auth endpoint accessible!');
        } catch (authError) {
          setTestResult(prev => prev + '\n⚠️ Auth endpoint error (expected if not logged in)');
        }
      } else {
        setTestResult('❌ No backend server found on any network interface');
        Alert.alert(
          'Connection Test Failed',
          'The app cannot connect to the backend server. Please check:\n\n1. Backend server is running\n2. Both devices are on the same network\n3. Firewall settings allow connections on port 5000',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      setTestResult(`❌ Connection failed: ${error.message}`);
      Alert.alert(
        'Connection Test Failed',
        'The app cannot connect to the backend server. Please check:\n\n1. Backend server is running\n2. Both devices are on the same network\n3. Firewall settings allow connections on port 5000',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Network Test</Text>
      <TouchableOpacity 
        style={[styles.button, isLoading && styles.buttonDisabled]} 
        onPress={testConnection}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Testing...' : 'Test Connection'}
        </Text>
      </TouchableOpacity>
      {testResult ? (
        <Text style={styles.result}>{testResult}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f5f5f5',
    margin: 10,
    borderRadius: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  result: {
    marginTop: 10,
    fontSize: 14,
    fontFamily: 'monospace',
  },
});
