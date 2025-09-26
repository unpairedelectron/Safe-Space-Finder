import React, { useState } from 'react';
import { View, StyleSheet, Alert, Image, ScrollView } from 'react-native';
import { TextInput, Button, Card, Title, Appbar, Divider } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { StarRating } from '../components/StarRating';
import { TagSelector } from '../components/AccessibilityTags';
import axios from 'axios';

const API_BASE = 'http://localhost:3000/api';

export default function ReviewScreen({ route, navigation }: { route: any; navigation: any }) {
  const { businessId } = route.params;
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const pickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera roll permissions are required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: 5,
      allowsEditing: false,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      const newImages = result.assets.map(asset => asset.uri);
      setImages(prev => [...prev, ...newImages].slice(0, 5)); // Max 5 images
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const submitReview = async () => {
    if (rating === 0) {
      Alert.alert('Error', 'Please provide a rating');
      return;
    }
    if (!comment.trim()) {
      Alert.alert('Error', 'Please write a comment');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('businessId', businessId);
      formData.append('rating', rating.toString());
      formData.append('comment', comment);
      formData.append('tags', JSON.stringify(selectedTags));
      
      images.forEach((image, index) => {
        const filename = image.split('/').pop();
        const match = /\.(\w+)$/.exec(filename || '');
        const type = match ? `image/${match[1]}` : 'image';
        formData.append(`photo_${index}`, {
          uri: image,
          name: filename,
          type,
        } as any);
      });

      await axios.post(`${API_BASE}/reviews`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      Alert.alert('Success', 'Review submitted successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to submit review');
    }
    setLoading(false);
  };

  return (
    <ScrollView style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Add Review" />
      </Appbar.Header>

      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Rate Your Experience</Title>
          <View style={styles.ratingContainer}>
            <StarRating
              rating={rating}
              onRatingChange={setRating}
              size={40}
              interactive={true}
              showLabel={true}
            />
          </View>

          <Divider style={styles.divider} />

          <Title style={styles.sectionTitle}>Write Your Review</Title>
          <TextInput
            label="Share your experience..."
            value={comment}
            onChangeText={setComment}
            mode="outlined"
            multiline
            numberOfLines={5}
            style={styles.textInput}
            placeholder="Tell others about your experience at this business. Was it welcoming? Accessible? What made it special?"
          />

          <Divider style={styles.divider} />

          <Title style={styles.sectionTitle}>Add Photos (Optional)</Title>
          <Button
            mode="outlined"
            onPress={pickImages}
            style={styles.photoButton}
            icon="camera"
          >
            {images.length === 0 ? 'Add Photos' : `Add More Photos (${images.length}/5)`}
          </Button>

          {images.length > 0 && (
            <View style={styles.imagePreview}>
              {images.map((image, index) => (
                <View key={index} style={styles.imageContainer}>
                  <Image source={{ uri: image }} style={styles.previewImage} />
                  <Button
                    mode="contained"
                    compact
                    onPress={() => removeImage(index)}
                    style={styles.removeButton}
                    buttonColor="#FF5722"
                  >
                    ×
                  </Button>
                </View>
              ))}
            </View>
          )}

          <Divider style={styles.divider} />

          <Title style={styles.sectionTitle}>Accessibility Features (Optional)</Title>
          <TagSelector
            selectedTags={selectedTags}
            onSelectionChange={setSelectedTags}
            categories={['accessibility', 'identity']}
          />

          <Button
            mode="contained"
            onPress={submitReview}
            loading={loading}
            style={styles.submitButton}
            contentStyle={styles.submitButtonContent}
          >
            Submit Review
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  card: {
    margin: 16,
    elevation: 3,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  ratingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  divider: {
    marginVertical: 24,
  },
  textInput: {
    marginBottom: 16,
  },
  photoButton: {
    marginBottom: 16,
  },
  imagePreview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  imageContainer: {
    position: 'relative',
  },
  previewImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    minWidth: 24,
  },
  submitButton: {
    marginTop: 24,
    elevation: 4,
  },
  submitButtonContent: {
    paddingVertical: 12,
  },
});
