import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, TextInput, Image, TouchableOpacity } from 'react-native';
import { Camera } from 'expo-camera';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

//comentario

export default function CameraScreen() {
  const [hasPermission, setHasPermission] = useState(null);
  const [camera, setCamera] = useState(null);
  const [type, setType] = useState(Camera.Constants.Type.back);
  const [imageUri, setImageUri] = useState(null);
  const [text, setText] = useState('');
  const [location, setLocation] = useState(null);
  const [locationName, setLocationName] = useState('');

  
  const GOOGLE_API_KEY = 'AIzaSyB3Wh-apbtTuF08gn_cgq67G9HeE6fZTMs';

  // Función para obtener el nombre de la ubicación con Google Geocoding API
const getLocationName = async (latitude, longitude) => {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_API_KEY}`
    );
    const data = await response.json();

    if (data && data.results && data.results.length > 0) {
      // Filtrar los componentes de la dirección para obtener una descripción más completa
      const addressComponents = data.results[0].address_components;
      let address = '';

      // Priorizar los tipos de componentes que dan una dirección más detallada
      const componentTypes = ['street_number', 'route', 'sublocality', 'neighborhood', 'locality', 'administrative_area_level_1', 'country'];

      addressComponents.forEach(component => {
        if (component.types.some(type => componentTypes.includes(type))) {
          // Imprimir cada componente en la consola
          console.log(`${component.types[0]}: ${component.long_name}`);
          address += `${component.long_name}, `;
        }
      });

      // Quitar la coma y el espacio al final
      address = address.trim().replace(/,$/, '');

      return address || data.results[0].formatted_address; // Si no se encuentra una dirección detallada, usar el formatted_address
    }
    return 'Ubicación desconocida';
  } catch (error) {
    console.error('Error al obtener el nombre de la ubicación:', error);
    return 'Error al obtener la ubicación';
  }
};




  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestPermissionsAsync();
      setHasPermission(status === 'granted');

      let { status: locStatus } = await Location.requestForegroundPermissionsAsync();
      if (locStatus !== 'granted') {
        alert('Permisos de ubicación no concedidos');
        return;
      }

      try {
        // Obtener la ubicación con mayor precisión posible
        let location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Highest,
          timeInterval: 5000,
          distanceInterval: 0,
        });
        setLocation(location);

        // Usa la API de Google para obtener el nombre de la ubicación
        const locationName = await getLocationName(location.coords.latitude, location.coords.longitude);
        setLocationName(locationName);
        console.log('Nombre de la ubicación:', locationName);
        console.log('Latitud y longitud:', location.coords.latitude, '' , location.coords.longitude);
// Imprimir la dirección en la consola
        
      } catch (error) {
        console.error('Error al obtener la ubicación: ', error);
        setLocationName('Error al obtener la ubicación');
      }
    })();
  }, []);

  const takePicture = async () => {
    if (camera) {
      const data = await camera.takePictureAsync();
      setImageUri(data.uri);
    }
  };

  const saveData = async () => {
    const memory = {
      imageUri,
      text,
      locationName, // Guardamos el nombre de la ubicación
    };
    const savedMemories = await AsyncStorage.getItem('memories');
    let memories = JSON.parse(savedMemories) || [];
    memories.push(memory);
    await AsyncStorage.setItem('memories', JSON.stringify(memories));
    alert('Guardada con éxito!');
    setImageUri(null); // Limpiar la imagen
    setText(''); // Limpiar la descripción
  };

  const isSaveDisabled = !imageUri || !text.trim();

  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      <Camera style={styles.camera} type={type} ref={(ref) => setCamera(ref)}>
        <View style={styles.buttonContainer}>
          <Button
            title="Flip Camera"
            onPress={() => {
              setType(
                type === Camera.Constants.Type.back
                  ? Camera.Constants.Type.front
                  : Camera.Constants.Type.back
              );
            }}
          />
        </View>
      </Camera>
      <Button title="TOMAR FOTO" onPress={takePicture} />
      {imageUri && <Image source={{ uri: imageUri }} style={styles.preview} />}
      <TextInput
        placeholder="Agregar descripción"
        style={styles.textInput}
        onChangeText={setText}
        value={text}
      />

      <TouchableOpacity disabled={isSaveDisabled} onPress={saveData} style={[styles.saveButton, isSaveDisabled && styles.saveButtonDisabled]}>
        <Text style={styles.saveButtonText}>GUARDAR</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  camera: { flex: 0.7 },
  buttonContainer: { flexDirection: 'row', justifyContent: 'center', margin: 20 },
  preview: { flex: 0.3, width: '100%' },
  textInput: { height: 40, borderColor: 'gray', borderWidth: 1, margin: 10, padding: 10 },
  saveButton: { padding: 15, backgroundColor: '#2196F3', borderRadius: 10, alignItems: 'center', margin: 20 },
  saveButtonDisabled: { backgroundColor: '#B0BEC5' },
  saveButtonText: { color: 'white', fontWeight: 'bold' },
});
