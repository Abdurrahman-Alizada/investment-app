import React from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import Svg, { G, Path } from 'react-native-svg';
import Animated, {
  useAnimatedProps,
  withTiming,
  useSharedValue,
  withSequence,
  withDelay,
  useAnimatedStyle,
  interpolate,
} from 'react-native-reanimated';
import { TouchableOpacity } from 'react-native';
import * as d3Shape from 'd3-shape';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');
const CHART_SIZE = width - 64;
const CHART_PADDING = 32;
const AnimatedPath = Animated.createAnimatedComponent(Path);

const AnimatedPieChart = ({ data }) => {
  const progress = useSharedValue(0);
  const selectedSlice = useSharedValue(-1);

  React.useEffect(() => {
    progress.value = withSequence(
      withTiming(1, { duration: 1000 }),
      withDelay(500, withTiming(0.95, { duration: 300 })),
      withTiming(1, { duration: 200 })
    );
  }, []);

  const pie = d3Shape.pie()
    .value(d => d.percentage)
    .sort(null);

  const arc = d3Shape.arc()
    .innerRadius(CHART_SIZE * 0.25)
    .outerRadius(CHART_SIZE * 0.4)
    .cornerRadius(4)
    .padAngle(0.02);

  const arcs = pie(data); // Calculate arcs outside the worklet

  const createAnimatedProps = (index, pathData) => {
    'worklet';
    const scale = selectedSlice.value === index ? 1.1 : 1;
    const translation = selectedSlice.value === index ? -10 : 0;

    return {
      d: pathData,
      transform: [
        { translateX: translation },
        { translateY: translation },
        { scale },
      ],
    };
  };

  const renderSlices = () => {
    return arcs.map((slice, index) => {
      const pathData = arc(slice); // Calculate pathData outside the worklet
      const animatedProps = useAnimatedProps(() =>
        createAnimatedProps(index, pathData)
      );

      const containerStyle = useAnimatedStyle(() => {
        const opacity = interpolate(
          progress.value,
          [0, 1],
          [0, 1]
        );
        return { opacity };
      });

      return (
        <Animated.View key={index} style={containerStyle}>
          <TouchableOpacity
            onPress={() => {
              selectedSlice.value = selectedSlice.value === index ? -1 : index;
            }}>
            <Svg width={CHART_SIZE} height={CHART_SIZE}>
              <G transform={`translate(${CHART_SIZE / 2}, ${CHART_SIZE / 2})`}>
                <AnimatedPath
                  animatedProps={animatedProps}
                  fill={data[index].color}
                />
              </G>
            </Svg>
          </TouchableOpacity>
        </Animated.View>
      );
    });
  };

  const renderLegend = () => {
    return data.map((item, index) => (
      <TouchableOpacity
        key={index}
        style={styles.legendItem}
        onPress={() => {
          selectedSlice.value = selectedSlice.value === index ? -1 : index;
        }}>
        <View style={[styles.legendColor, { backgroundColor: item.color }]} />
        <View style={styles.legendTextContainer}>
          <Text style={styles.legendTitle}>{item.name}</Text>
          <Text style={styles.legendPercentage}>{item.percentage}%</Text>
        </View>
        <Icon name={item.icon} size={24} color={item.color} />
      </TouchableOpacity>
    ));
  };

  return (
    <View style={styles.container}>
      <View style={styles.chartContainer}>
        <View style={styles.chart}>
          <Svg width={CHART_SIZE} height={CHART_SIZE}>
            <G transform={`translate(${CHART_SIZE / 2}, ${CHART_SIZE / 2})`}>
              {renderSlices()}
            </G>
          </Svg>
          <View style={styles.centerContent}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>
              LKR {data.reduce((sum, item) => sum + item.invested, 0).toLocaleString()}
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.legend}>
        {renderLegend()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: CHART_PADDING,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  chartContainer: {
    width: CHART_SIZE,
    height: CHART_SIZE,
    position: 'relative',
  },
  chart: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  centerContent: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -CHART_SIZE * 0.15 }, { translateY: -CHART_SIZE * 0.1 }],
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  legend: {
    width: '100%',
    marginTop: 24,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#F8F9FA',
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  legendTextContainer: {
    flex: 1,
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  legendPercentage: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
});

export default AnimatedPieChart;