import { Alert, Platform, ToastAndroid } from 'react-native';

type ToastAction = {
  text: string;
  onPress: () => void;
};

export function showToast(message: string, actions?: ToastAction[]) {
  if (actions && actions.length > 0) {
    Alert.alert('', message, actions.map(a => ({ text: a.text, onPress: a.onPress })));
    return;
  }

  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.SHORT);
    return;
  }

  Alert.alert('', message);
}





