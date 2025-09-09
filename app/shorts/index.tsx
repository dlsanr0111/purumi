import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { Header } from '../../components/Header';
import { VideoTile } from '../../components/VideoTile';
import { Colors } from '../../constants/Colors';
import { Layout } from '../../constants/Layout';
import { mockVideos, Video } from '../../lib/mock';

const { height: screenHeight } = Dimensions.get('window');

export default function ShortsScreen() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    // 컴포넌트 마운트 시 자동으로 데이터 로드
    loadVideos();
  }, []);

  const loadVideos = async () => {
    try {
      // 실제로는 API 호출이지만 여기서는 mock 데이터 사용
      setVideos(mockVideos);
    } catch (error) {
      console.error('비디오 데이터 로드 실패:', error);
    }
  };

  const handleViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const renderVideo = ({ item, index }: { item: Video; index: number }) => (
    <VideoTile
      video={item}
      isActive={index === currentIndex}
      onPress={() => console.log('비디오 클릭:', item.id)}
    />
  );

  return (
    <View style={styles.container}>
      <Header
        title="PurumiTV"
        showBack
        onBackPress={() => router.back()}
        rightComponent={
          <View style={styles.headerRight}>
            <Text style={styles.videoCounter}>
              {currentIndex + 1} / {videos.length}
            </Text>
          </View>
        }
      />
      
      <FlatList
        ref={flatListRef}
        data={videos}
        keyExtractor={(item) => item.id}
        renderItem={renderVideo}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={screenHeight - Layout.headerHeight}
        snapToAlignment="start"
        decelerationRate="fast"
        onViewableItemsChanged={handleViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={(data, index) => ({
          length: screenHeight - Layout.headerHeight,
          offset: (screenHeight - Layout.headerHeight) * index,
          index,
        })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  videoCounter: {
    fontSize: Layout.fontSize.sm,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
});
