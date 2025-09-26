import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Image,
  Text,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

interface ProgressiveImageProps {
  source: { uri: string };
  thumbnailSource?: { uri: string };
  style?: any;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
  onLoadStart?: () => void;
  onLoadEnd?: () => void;
  onError?: () => void;
  placeholderColor?: string;
  borderRadius?: number;
}

export const ProgressiveImage: React.FC<ProgressiveImageProps> = ({
  source,
  thumbnailSource,
  style,
  resizeMode = 'cover',
  onLoadStart,
  onLoadEnd,
  onError,
  placeholderColor = '#E2E8F0',
  borderRadius = 0,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [thumbnailLoaded, setThumbnailLoaded] = useState(false);
  const [error, setError] = useState(false);
  const imageOpacity = useRef(new Animated.Value(0)).current;
  const thumbnailOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (thumbnailLoaded) {
      Animated.timing(thumbnailOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [thumbnailLoaded]);

  useEffect(() => {
    if (imageLoaded) {
      Animated.timing(imageOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [imageLoaded]);

  const handleImageLoad = () => {
    setImageLoaded(true);
    onLoadEnd && onLoadEnd();
  };

  const handleImageError = () => {
    setError(true);
    onError && onError();
  };

  const handleThumbnailLoad = () => {
    setThumbnailLoaded(true);
  };

  if (error) {
    return (
      <View style={[styles.placeholder, style, { borderRadius }]}>
        <Text style={styles.errorText}>Failed to load image</Text>
      </View>
    );
  }

  return (
    <View style={[style, { borderRadius }]}>
      {/* Placeholder */}
      <View style={[styles.placeholder, { backgroundColor: placeholderColor, borderRadius }]} />
      
      {/* Thumbnail */}
      {thumbnailSource && (
        <Animated.Image
          source={thumbnailSource}
          style={[
            styles.image,
            style,
            { opacity: thumbnailOpacity, borderRadius },
          ]}
          resizeMode={resizeMode}
          onLoad={handleThumbnailLoad}
          blurRadius={1}
        />
      )}
      
      {/* Full Image */}
      <Animated.Image
        source={source}
        style={[
          styles.image,
          style,
          { opacity: imageOpacity, borderRadius },
        ]}
        resizeMode={resizeMode}
        onLoadStart={onLoadStart}
        onLoad={handleImageLoad}
        onError={handleImageError}
      />
      
      {/* Loading indicator */}
      {!imageLoaded && (
        <View style={[styles.loadingContainer, { borderRadius }]}>
          <ActivityIndicator size="small" color="#3182CE" />
        </View>
      )}
    </View>
  );
};

interface LazyLoadProps {
  children: React.ReactNode;
  height?: number;
  threshold?: number;
  placeholder?: React.ReactNode;
}

export const LazyLoad: React.FC<LazyLoadProps> = ({
  children,
  height = 200,
  threshold = 100,
  placeholder,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const viewRef = useRef<View>(null);

  useEffect(() => {
    const checkVisibility = () => {
      if (viewRef.current) {
        viewRef.current.measureInWindow((x, y, width, height) => {
          const screenHeight = Dimensions.get('window').height;
          const isInViewport = y < screenHeight + threshold && y + height > -threshold;
          
          if (isInViewport && !hasLoaded) {
            setIsVisible(true);
            setHasLoaded(true);
          }
        });
      }
    };

    checkVisibility();
    
    // Set up intersection observer alternative for React Native
    const interval = setInterval(checkVisibility, 100);
    
    return () => clearInterval(interval);
  }, [hasLoaded, threshold]);

  const defaultPlaceholder = (
    <View style={[styles.lazyPlaceholder, { height }]}>
      <ActivityIndicator size="small" color="#CBD5E0" />
    </View>
  );

  return (
    <View ref={viewRef} style={{ height }}>
      {isVisible ? children : (placeholder || defaultPlaceholder)}
    </View>
  );
};

interface OptimisticUpdateState<T> {
  data: T;
  isOptimistic: boolean;
  error?: string;
}

export class OptimisticUpdateManager<T> {
  private listeners: Set<(state: OptimisticUpdateState<T>) => void> = new Set();
  private currentState: OptimisticUpdateState<T>;

  constructor(initialData: T) {
    this.currentState = {
      data: initialData,
      isOptimistic: false,
    };
  }

  // Subscribe to state changes
  subscribe(listener: (state: OptimisticUpdateState<T>) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // Get current state
  getState(): OptimisticUpdateState<T> {
    return this.currentState;
  }

  // Perform optimistic update
  async optimisticUpdate(
    optimisticData: T,
    asyncOperation: () => Promise<T>
  ): Promise<T> {
    // Apply optimistic update immediately
    this.setState({
      data: optimisticData,
      isOptimistic: true,
    });

    try {
      // Perform actual operation
      const result = await asyncOperation();
      
      // Update with real result
      this.setState({
        data: result,
        isOptimistic: false,
      });
      
      return result;
    } catch (error) {
      // Revert optimistic update on error
      this.setState({
        data: this.currentState.data,
        isOptimistic: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      
      throw error;
    }
  }

  // Update state directly
  setState(newState: Partial<OptimisticUpdateState<T>>): void {
    this.currentState = { ...this.currentState, ...newState };
    this.listeners.forEach(listener => listener(this.currentState));
  }
}

// Hook for using optimistic updates
export function useOptimisticUpdate<T>(initialData: T) {
  const [state, setState] = useState<OptimisticUpdateState<T>>({
    data: initialData,
    isOptimistic: false,
  });
  
  const managerRef = useRef<OptimisticUpdateManager<T>>(
    new OptimisticUpdateManager(initialData)
  );

  useEffect(() => {
    const unsubscribe = managerRef.current.subscribe(setState);
    return unsubscribe;
  }, []);

  const performOptimisticUpdate = async (
    optimisticData: T,
    asyncOperation: () => Promise<T>
  ) => {
    return managerRef.current.optimisticUpdate(optimisticData, asyncOperation);
  };

  return {
    ...state,
    performOptimisticUpdate,
    updateData: (data: T) => managerRef.current.setState({ data, isOptimistic: false }),
  };
}

// Batch update component for efficient re-renders
interface BatchUpdateProps {
  children: React.ReactNode;
  batchSize?: number;
  delay?: number;
}

export const BatchUpdate: React.FC<BatchUpdateProps> = ({
  children,
  batchSize = 10,
  delay = 16, // One frame at 60fps
}) => {
  const [shouldUpdate, setShouldUpdate] = useState(true);
  const updateCountRef = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const requestUpdate = () => {
    updateCountRef.current++;
    
    if (updateCountRef.current >= batchSize) {
      updateCountRef.current = 0;
      setShouldUpdate(prev => !prev);
    } else {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        updateCountRef.current = 0;
        setShouldUpdate(prev => !prev);
      }, delay);
    }
  };

  return <>{children}</>;
};

// Performance monitoring component
interface PerformanceMonitorProps {
  name: string;
  children: React.ReactNode;
  onPerformanceData?: (data: {
    name: string;
    renderTime: number;
    mountTime: number;
  }) => void;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  name,
  children,
  onPerformanceData,
}) => {
  const mountTimeRef = useRef(Date.now());
  const renderStartTimeRef = useRef(Date.now());

  useEffect(() => {
    const mountTime = Date.now() - mountTimeRef.current;
    console.log(`[${name}] Mount time: ${mountTime}ms`);
    
    return () => {
      console.log(`[${name}] Component unmounted`);
    };
  }, [name]);

  useEffect(() => {
    const renderTime = Date.now() - renderStartTimeRef.current;
    console.log(`[${name}] Render time: ${renderTime}ms`);
    
    if (onPerformanceData) {
      onPerformanceData({
        name,
        renderTime,
        mountTime: Date.now() - mountTimeRef.current,
      });
    }
  });

  renderStartTimeRef.current = Date.now();

  return <>{children}</>;
};

const styles = StyleSheet.create({
  placeholder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  errorText: {
    fontSize: 12,
    color: '#E53E3E',
    textAlign: 'center',
    fontFamily: 'Inter-Medium',
  },
  lazyPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7FAFC',
  },
});
