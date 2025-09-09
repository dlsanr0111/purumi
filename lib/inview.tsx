import { useRef, useEffect, useState } from 'react';
import { ViewToken } from 'react-native';

export interface UseInViewOptions {
  threshold?: number;
  rootMargin?: string;
}

export function useInView(options: UseInViewOptions = {}) {
  const [isInView, setIsInView] = useState(false);
  const ref = useRef<any>(null);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0) {
        const isVisible = viewableItems.some(item => item.isViewable);
        setIsInView(isVisible);
      }
    }
  ).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: options.threshold || 50,
  }).current;

  return {
    ref,
    isInView,
    onViewableItemsChanged,
    viewabilityConfig,
  };
}


