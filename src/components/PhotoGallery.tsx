import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, Image, Modal, TouchableOpacity } from 'react-native';
import { IconButton, Text } from 'react-native-paper';
import { FlatList, PanGestureHandler, State } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, runOnJS } from 'react-native-reanimated';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface PhotoGalleryProps {
  photos: string[];
  initialIndex?: number;
}

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({ photos, initialIndex = 0 }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [modalVisible, setModalVisible] = useState(false);
  const translateX = useSharedValue(0);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { scale: scale.value },
      ],
    };
  });

  const onGestureEvent = (event: any) => {
    translateX.value = event.nativeEvent.translationX;
    scale.value = withSpring(1 - Math.abs(event.nativeEvent.translationX) / screenWidth * 0.2);
  };

  const onHandlerStateChange = (event: any) => {
    if (event.nativeEvent.state === State.END) {
      const { translationX, velocityX } = event.nativeEvent;
      
      if (Math.abs(translationX) > screenWidth / 3 || Math.abs(velocityX) > 500) {
        const direction = translationX > 0 ? -1 : 1;
        const newIndex = currentIndex + direction;
        
        if (newIndex >= 0 && newIndex < photos.length) {
          runOnJS(setCurrentIndex)(newIndex);
        }
      }
      
      translateX.value = withSpring(0);
      scale.value = withSpring(1);
    }
  };

  const renderThumbnail = ({ item, index }: { item: string; index: number }) => (
    <TouchableOpacity
      style={[styles.thumbnail, index === currentIndex && styles.activeThumbnail]}
      onPress={() => {
        setCurrentIndex(index);
        setModalVisible(true);
      }}
    >
      <Image source={{ uri: item }} style={styles.thumbnailImage} />
    </TouchableOpacity>
  );

  const renderFullScreenImage = ({ item }: { item: string }) => (
    <PanGestureHandler
      onGestureEvent={onGestureEvent}
      onHandlerStateChange={onHandlerStateChange}
    >
      <Animated.View style={[styles.fullScreenImageContainer, animatedStyle]}>
        <Image source={{ uri: item }} style={styles.fullScreenImage} resizeMode="contain" />
      </Animated.View>
    </PanGestureHandler>
  );

  if (photos.length === 0) return null;

  return (
    <View style={styles.container}>
      <FlatList
        data={photos}
        renderItem={renderThumbnail}
        keyExtractor={(item, index) => index.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.thumbnailList}
      />

      <Modal
        visible={modalVisible}
        transparent={true}
        statusBarTranslucent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <IconButton
            icon="close"
            iconColor="white"
            size={30}
            style={styles.closeButton}
            onPress={() => setModalVisible(false)}
          />
          
          <FlatList
            data={photos}
            renderItem={renderFullScreenImage}
            keyExtractor={(item, index) => index.toString()}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            initialScrollIndex={currentIndex}
            getItemLayout={(data, index) => ({
              length: screenWidth,
              offset: screenWidth * index,
              index,
            })}
            onMomentumScrollEnd={(event) => {
              const newIndex = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
              setCurrentIndex(newIndex);
            }}
          />
          
          <View style={styles.pagination}>
            <Text style={styles.paginationText}>
              {currentIndex + 1} / {photos.length}
            </Text>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  thumbnailList: {
    paddingHorizontal: 16,
  },
  thumbnail: {
    width: 80,
    height: 80,
    marginRight: 8,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activeThumbnail: {
    borderColor: '#4CAF50',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 16,
    zIndex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  fullScreenImageContainer: {
    width: screenWidth,
    height: screenHeight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: screenWidth - 32,
    height: screenHeight - 200,
  },
  pagination: {
    position: 'absolute',
    bottom: 60,
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  paginationText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
