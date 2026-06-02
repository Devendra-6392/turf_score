import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, CheckCircle2, QrCode } from 'lucide-react-native';
import { Colors } from '../constants/Colors';
import { useAuth } from '../context/AuthContext';

const BACKEND_URL = 'http://10.185.142.203:5000/api';

export default function QRScannerScreen({ navigation }) {
  const { token } = useAuth();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(true);
  const [result, setResult] = useState(null);

  const handleBarcode = async ({ data }) => {
    if (!scanning) return;
    setScanning(false);
    try {
      const response = await fetch(`${BACKEND_URL}/check-ins/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ qrValue: data })
      });
      const payload = await response.json();
      setResult({ success: response.ok, message: payload.message || payload.error || 'Unable to check in' });
    } catch (error) {
      setResult({ success: false, message: error.message });
    }
  };

  if (!permission) return <View style={styles.center}><ActivityIndicator color={Colors.primary} /></View>;
  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.center}>
        <QrCode size={56} color={Colors.primary} />
        <Text style={styles.title}>Camera permission needed</Text>
        <Text style={styles.body}>Scan the QR displayed at the turf gate to check in your booking or your whole team.</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}><Text style={styles.buttonText}>Allow Camera</Text></TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView style={StyleSheet.absoluteFill} barcodeScannerSettings={{ barcodeTypes: ['qr'] }} onBarcodeScanned={scanning ? handleBarcode : undefined} />
      <SafeAreaView style={styles.overlay}>
        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}><ArrowLeft size={24} color="#fff" /></TouchableOpacity>
        <View style={styles.guide}>
          <Text style={styles.scanTitle}>Scan Turf Entry QR</Text>
          <Text style={styles.scanSubtitle}>Only one booked team player needs to scan</Text>
          <View style={styles.frame} />
        </View>
        {result && (
          <View style={styles.result}>
            {result.success && <CheckCircle2 size={32} color={Colors.primary} />}
            <Text style={styles.resultText}>{result.message}</Text>
            {!result.success ? (
              <TouchableOpacity style={styles.button} onPress={() => { setResult(null); setScanning(true); }}>
                <Text style={styles.buttonText}>Try Again</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Home')}>
                <Text style={styles.buttonText}>Done</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center', padding: 30 },
  title: { fontSize: 24, fontWeight: '800', marginTop: 16, color: Colors.onBackground },
  body: { color: Colors.onSurfaceVariant, textAlign: 'center', lineHeight: 22, marginVertical: 16 },
  button: { backgroundColor: Colors.primary, paddingVertical: 14, paddingHorizontal: 24, borderRadius: 14, marginTop: 14 },
  buttonText: { color: '#fff', fontWeight: '700' },
  overlay: { flex: 1, justifyContent: 'space-between', padding: 20 },
  back: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' },
  guide: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scanTitle: { color: '#fff', fontSize: 26, fontWeight: '800' },
  scanSubtitle: { color: '#fff', marginTop: 6 },
  frame: { height: 255, width: 255, borderWidth: 3, borderColor: Colors.primaryContainer, borderRadius: 28, marginTop: 28 },
  result: { backgroundColor: '#fff', borderRadius: 20, padding: 20, alignItems: 'center', marginBottom: 20 },
  resultText: { color: Colors.onBackground, fontWeight: '700', textAlign: 'center', marginTop: 10 }
});
