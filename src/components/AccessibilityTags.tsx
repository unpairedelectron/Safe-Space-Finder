import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Chip, Text } from 'react-native-paper';

interface AccessibilityTag {
  id: string;
  label: string;
  icon: string;
  color: string;
  category: 'accessibility' | 'identity' | 'family' | 'general';
}

const ACCESSIBILITY_TAGS: AccessibilityTag[] = [
  // Accessibility
  { id: 'wheelchair', label: 'Wheelchair Accessible', icon: '♿', color: '#2196F3', category: 'accessibility' },
  { id: 'hearing', label: 'Hearing Accessible', icon: '🦻', color: '#9C27B0', category: 'accessibility' },
  { id: 'visual', label: 'Visually Accessible', icon: '👁️', color: '#FF9800', category: 'accessibility' },
  { id: 'service-animals', label: 'Service Animals Welcome', icon: '🐕‍🦺', color: '#795548', category: 'accessibility' },
  
  // Identity & Inclusion
  { id: 'lgbtq', label: 'LGBTQ+ Friendly', icon: '🏳️‍🌈', color: '#E91E63', category: 'identity' },
  { id: 'trans-friendly', label: 'Trans Friendly', icon: '🏳️‍⚧️', color: '#00BCD4', category: 'identity' },
  { id: 'poc-owned', label: 'POC Owned', icon: '✊🏾', color: '#8BC34A', category: 'identity' },
  { id: 'women-owned', label: 'Women Owned', icon: '👩‍💼', color: '#FF5722', category: 'identity' },
  { id: 'neurodivergent', label: 'Neurodivergent Friendly', icon: '🧠', color: '#673AB7', category: 'identity' },
  
  // Family & Social
  { id: 'family-friendly', label: 'Family Friendly', icon: '👨‍👩‍👧‍👦', color: '#4CAF50', category: 'family' },
  { id: 'child-friendly', label: 'Child Friendly', icon: '🧒', color: '#CDDC39', category: 'family' },
  { id: 'pet-friendly', label: 'Pet Friendly', icon: '🐕', color: '#FFC107', category: 'family' },
  { id: 'quiet-space', label: 'Quiet Space', icon: '🤫', color: '#607D8B', category: 'general' },
  
  // Safety & Comfort
  { id: 'safe-space', label: 'Certified Safe Space', icon: '🛡️', color: '#4CAF50', category: 'general' },
  { id: 'single-parent', label: 'Single Parent Friendly', icon: '👨‍👧', color: '#009688', category: 'family' },
  { id: 'senior-friendly', label: 'Senior Friendly', icon: '👴', color: '#9E9E9E', category: 'accessibility' },
];

interface AccessibilityTagsProps {
  selectedTags: string[];
  onTagPress?: (tagId: string) => void;
  interactive?: boolean;
  compact?: boolean;
  maxVisible?: number;
}

export const AccessibilityTags: React.FC<AccessibilityTagsProps> = ({
  selectedTags,
  onTagPress,
  interactive = false,
  compact = false,
  maxVisible,
}) => {
  const visibleTags = ACCESSIBILITY_TAGS.filter(tag => selectedTags.includes(tag.id));
  const displayTags = maxVisible ? visibleTags.slice(0, maxVisible) : visibleTags;
  const remainingCount = visibleTags.length - displayTags.length;

  if (visibleTags.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.tagsWrapper}>
        {displayTags.map((tag) => (
          <Chip
            key={tag.id}
            selected={selectedTags.includes(tag.id)}
            onPress={() => interactive && onTagPress?.(tag.id)}
            style={[
              styles.tag,
              { backgroundColor: `${tag.color}20` },
              selectedTags.includes(tag.id) && { backgroundColor: `${tag.color}40` },
            ]}
            textStyle={[
              styles.tagText,
              { color: tag.color },
              compact && styles.compactText,
            ]}
            compact={compact}
            icon={() => <Text style={styles.icon}>{tag.icon}</Text>}
          >
            {tag.label}
          </Chip>
        ))}
        {remainingCount > 0 && (
          <Chip
            style={styles.moreTag}
            textStyle={styles.moreTagText}
            compact={compact}
          >
            +{remainingCount} more
          </Chip>
        )}
      </View>
    </View>
  );
};

interface TagSelectorProps {
  selectedTags: string[];
  onSelectionChange: (tags: string[]) => void;
  categories?: AccessibilityTag['category'][];
}

export const TagSelector: React.FC<TagSelectorProps> = ({
  selectedTags,
  onSelectionChange,
  categories = ['accessibility', 'identity', 'family', 'general'],
}) => {
  const toggleTag = (tagId: string) => {
    const newSelection = selectedTags.includes(tagId)
      ? selectedTags.filter(id => id !== tagId)
      : [...selectedTags, tagId];
    onSelectionChange(newSelection);
  };

  const renderCategory = (category: AccessibilityTag['category']) => {
    const categoryTags = ACCESSIBILITY_TAGS.filter(tag => tag.category === category);
    
    if (categoryTags.length === 0) return null;

    const categoryTitles = {
      accessibility: 'Accessibility Features',
      identity: 'Identity & Inclusion',
      family: 'Family & Social',
      general: 'General Features',
    };

    return (
      <View key={category} style={styles.categoryContainer}>
        <Text style={styles.categoryTitle}>{categoryTitles[category]}</Text>
        <View style={styles.categoryTags}>
          {categoryTags.map((tag) => (
            <Chip
              key={tag.id}
              selected={selectedTags.includes(tag.id)}
              onPress={() => toggleTag(tag.id)}
              style={[
                styles.selectorTag,
                { backgroundColor: `${tag.color}15` },
                selectedTags.includes(tag.id) && { backgroundColor: `${tag.color}30` },
              ]}
              textStyle={[
                styles.selectorTagText,
                { color: tag.color },
                selectedTags.includes(tag.id) && styles.selectedTagText,
              ]}
              icon={() => <Text style={styles.selectorIcon}>{tag.icon}</Text>}
            >
              {tag.label}
            </Chip>
          ))}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.selectorContainer}>
      {categories.map(renderCategory)}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  tagsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    marginRight: 6,
    marginBottom: 6,
    elevation: 1,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
  },
  compactText: {
    fontSize: 11,
  },
  icon: {
    fontSize: 14,
    marginRight: 4,
  },
  moreTag: {
    backgroundColor: '#F5F5F5',
  },
  moreTagText: {
    color: '#666',
    fontSize: 12,
  },
  selectorContainer: {
    paddingVertical: 16,
  },
  categoryContainer: {
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  categoryTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectorTag: {
    marginRight: 8,
    marginBottom: 8,
    elevation: 2,
  },
  selectorTagText: {
    fontSize: 13,
    fontWeight: '500',
  },
  selectedTagText: {
    fontWeight: 'bold',
  },
  selectorIcon: {
    fontSize: 16,
    marginRight: 6,
  },
});

export { ACCESSIBILITY_TAGS };
export type { AccessibilityTag };
