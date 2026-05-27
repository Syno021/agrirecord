import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';

export function WeatherCard() {
  return (
    <LinearGradient
      colors={[Colors.primary, Colors.secondary]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      <View style={styles.top}>
        <View>
          <Text style={styles.temp}>24°</Text>
          <Text style={styles.condition}>Partly cloudy</Text>
        </View>
        <Ionicons name="partly-sunny" size={48} color="#fff" />
      </View>
      <View style={styles.metrics}>
        <Text style={styles.metric}>Humidity 68%</Text>
        <Text style={styles.dot}>·</Text>
        <Text style={styles.metric}>Wind 12 km/h</Text>
        <Text style={styles.dot}>·</Text>
        <Text style={styles.metric}>UV 6</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
  },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  temp: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 36,
    color: '#fff',
  },
  condition: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 14,
    color: Colors.accentLight,
    marginTop: 4,
  },
  metrics: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  metric: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  dot: {
    color: 'rgba(255,255,255,0.5)',
    marginHorizontal: 8,
  },
});
