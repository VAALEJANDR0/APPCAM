import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, StyleSheet, Button, TextInput, Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

export default function ListScreen() {
  const [memories, setMemories] = useState([]);
  const [isEditing, setIsEditing] = useState(null); // Para rastrear cuál memoria se está editando
  const [newDescription, setNewDescription] = useState(''); // Para almacenar la nueva descripción temporal

  // Función para obtener las memorias guardadas
  const fetchMemories = async () => {
    const savedMemories = await AsyncStorage.getItem('memories');
    if (savedMemories) {
      setMemories(JSON.parse(savedMemories));
    }
  };

  // Usar useFocusEffect para ejecutar fetchMemories cuando la pantalla esté en foco
  useFocusEffect(
    React.useCallback(() => {
      fetchMemories();
    }, [])
  );

  // Función para eliminar una memoria por su índice
  const deleteMemory = (indexToRemove) => {
    if (Platform.OS === 'web') {
      if (window.confirm('¿Estás seguro de que deseas eliminar esta memoria?')) {
        handleDelete(indexToRemove);
      }
    } else {
      Alert.alert(
        'Eliminar memoria',
        '¿Estás seguro de que deseas eliminar esta memoria?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Eliminar', onPress: () => handleDelete(indexToRemove) },
        ],
        { cancelable: true }
      );
    }
  };

  // Función para manejar la eliminación
  const handleDelete = async (indexToRemove) => {
    try {
      const updatedMemories = memories.filter((_, index) => index !== indexToRemove);
      setMemories(updatedMemories); // Actualiza el estado

      await AsyncStorage.setItem('memories', JSON.stringify(updatedMemories));

      alert('Memoria eliminada');
    } catch (error) {
      console.error('Error al eliminar la memoria:', error);
    }
  };

  // Función para manejar la edición de la descripción
  const handleEdit = async (index) => {
    if (newDescription.trim() === '') {
      alert('La descripción no puede estar vacía');
      return;
    }
    const updatedMemories = memories.map((memory, i) => {
      if (i === index) {
        return { ...memory, text: newDescription };
      }
      return memory;
    });
    setMemories(updatedMemories);
    await AsyncStorage.setItem('memories', JSON.stringify(updatedMemories));
    setIsEditing(null); // Finalizar edición
    setNewDescription(''); // Limpiar el campo de texto
    alert('Descripción actualizada');
  };

const renderItem = ({ item, index }) => (
  <View style={styles.itemContainer}>
    <Image source={{ uri: item.imageUri }} style={styles.image} />
    {/* Mostrar el nombre de la ubicación en lugar de las coordenadas */}
    <Text>Ubicación: {item.locationName}</Text> 

    {isEditing === index ? (
      <View>
        <TextInput
          style={styles.textInput}
          placeholder="Editar descripción"
          value={newDescription}
          onChangeText={setNewDescription}
        />
        <Button title="Guardar" onPress={() => handleEdit(index)} />
        <Button title="Cancelar" color="red" onPress={() => setIsEditing(null)} />
      </View>
    ) : (
      <View>
        <Text>{item.text}</Text>
        <Button title="Editar descripción" onPress={() => setIsEditing(index)} />
      </View>
    )}

    <Button title="Eliminar" color="red" onPress={() => deleteMemory(index)} />
  </View>
);


  return (
    <View style={styles.container}>
      <FlatList
        data={memories}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  itemContainer: { marginBottom: 20 },
  image: { width: '100%', height: 200, marginBottom: 10 },
  textInput: { height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 10, padding: 10 },
});
