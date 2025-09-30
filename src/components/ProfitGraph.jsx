import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import * as scale from 'd3-scale';

const ProfitGraph = () => {

  const chartWidth = Dimensions.get('window').width; 
  return (
    <View style={styles.container}>
      <LineChart
        data={{
          labels: ['January', 'February', 'March','April'],
          datasets: [{ data: [0, 10000, 3000,2000] }],
        }}
        width={Dimensions.get('window').width*0.9}
        height={300}
        fromZero={true}
        yAxisLabel="$"
        chartConfig={{
          backgroundColor: '#ffffff',
          backgroundGradientFrom: 'white',
          backgroundGradientTo: 'white',
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(5, 93, 255, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          style: {
            borderRadius: 16,
            paddingLeft: 50,
          },
          propsForLabels: {
            dx: 5,
          },
          propsForBackgroundLines: {
            stroke: 'transparent',
          },
          propsForVerticalLabels: {
            fontWeight: 'bold',
          },
          propsForHorizontalLabels: {
            fontWeight: 'bold',
          },
        }}
        bezier
        style={{
          marginHorizontal: 0,
        }}
        xScale={scale.scaleBand().domain(['January', 'February', 'March']).range([0, chartWidth]).padding(1)} // Use chartWidth in xScale
        xLabelsOffset={5}
        segments={4}
     // Adjust the number of segments to control spacing
      />
    </View>
  );
};

export default ProfitGraph;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  chart: {
    borderRadius: 16,
  },
});