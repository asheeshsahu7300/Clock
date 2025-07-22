import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Line, Text, Defs, RadialGradient, Stop } from 'react-native-svg';

const AnalogClock = ({ currentTime, style, colorScheme = 'black' }) => {
  // Extract hours, minutes, seconds from currentTime
  const hours = currentTime.getHours() % 12; // Convert to 12-hour format
  const minutes = currentTime.getMinutes();
  const seconds = currentTime.getSeconds();

  // Calculate angles for clock hands
  const hourAngle = (hours + minutes / 60) * 30; // 360° / 12 hours = 30° per hour
  const minuteAngle = (minutes + seconds / 60) * 6; // 360° / 60 minutes = 6° per minute
  const secondAngle = seconds * 6; // 360° / 60 seconds = 6° per second

  // Convert angles to radians for SVG rotation
  const hourRad = (hourAngle * Math.PI) / 180;
  const minuteRad = (minuteAngle * Math.PI) / 180;
  const secondRad = (secondAngle * Math.PI) / 180;

  // Clock dimensions
  const size = style.width || 200; // Default size
  const center = size / 2;
  const radius = size / 2 - 10; // Space for border
  const hourHandLength = radius * 0.5;
  const minuteHandLength = radius * 0.75;
  const secondHandLength = radius * 0.85;

  // Define colors based on the colorScheme prop
  const isBlackScheme = colorScheme === 'black';
  const faceGradientId = isBlackScheme ? 'blackGrad' : 'whiteGrad';
  const faceBorderColor = isBlackScheme ? '#333' : '#ccc';
  const markerColor = isBlackScheme ? '#fff' : '#333';
  const numberColor = isBlackScheme ? '#fff' : '#333';
  const handColor = isBlackScheme ? '#fff' : '#333';
  const centerDotColor = isBlackScheme ? '#fff' : '#333';
  const centerDotBorderColor = isBlackScheme ? '#333' : '#ccc';

  return (
    <View style={[styles.container, style]}>
      <Svg width={size} height={size}>
        {/* Define the radial gradient for the shiny effect */}
        <Defs>
          {/* Gradient for black scheme */}
          <RadialGradient
            id="blackGrad"
            cx="40%"
            cy="40%"
            r="60%"
            fx="40%"
            fy="40%"
          >
            <Stop offset="0%" stopColor="#444" stopOpacity="1" />
            <Stop offset="70%" stopColor="#1a1a1a" stopOpacity="1" />
            <Stop offset="100%" stopColor="#000" stopOpacity="1" />
          </RadialGradient>
          {/* Gradient for white scheme */}
          <RadialGradient
            id="whiteGrad"
            cx="40%"
            cy="40%"
            r="60%"
            fx="40%"
            fy="40%"
          >
            <Stop offset="0%" stopColor="#fff" stopOpacity="1" />
            <Stop offset="70%" stopColor="#f5f5f5" stopOpacity="1" />
            <Stop offset="100%" stopColor="#ddd" stopOpacity="1" />
          </RadialGradient>
        </Defs>

        {/* Clock face with shiny effect */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          fill={`url(#${faceGradientId})`} // Apply the appropriate gradient
          stroke={faceBorderColor}
          strokeWidth={5}
        />

        {/* Minute markers (every 6°) */}
        {[...Array(60)].map((_, i) => {
          const angle = (i * 6 * Math.PI) / 180; // 6° per minute marker
          const isHourMarker = i % 5 === 0; // Every 5th marker is an hour marker
          const length = isHourMarker ? 12 : 6; // Longer for hour markers
          const x1 = center + (radius - length) * Math.sin(angle);
          const y1 = center - (radius - length) * Math.cos(angle);
          const x2 = center + radius * Math.sin(angle);
          const y2 = center - radius * Math.cos(angle);
          return (
            <Line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={markerColor}
              strokeWidth={isHourMarker ? 3 : 1} // Thicker for hour markers
            />
          );
        })}

        {/* Hour numbers (12, 3, 6, 9) */}
        {[
          { num: '12', angle: 0 },
          { num: '3', angle: 90 },
          { num: '6', angle: 180 },
          { num: '9', angle: 270 },
        ].map(({ num, angle }) => {
          const rad = (angle * Math.PI) / 180;
          const textRadius = radius - 30; // Position numbers inside the markers
          const x = center + textRadius * Math.sin(rad);
          const y = center - textRadius * Math.cos(rad);
          return (
            <Text
              key={num}
              x={x}
              y={y}
              fill={numberColor}
              fontSize={18}
              fontWeight="bold"
              textAnchor="middle"
              dy={6} // Adjust vertical alignment
            >
              {num}
            </Text>
          );
        })}

        {/* Hour hand */}
        <Line
          x1={center}
          y1={center}
          x2={center + hourHandLength * Math.sin(hourRad)}
          y2={center - hourHandLength * Math.cos(hourRad)}
          stroke={handColor}
          strokeWidth={8}
          strokeLinecap="round"
        />
        {/* Minute hand */}
        <Line
          x1={center}
          y1={center}
          x2={center + minuteHandLength * Math.sin(minuteRad)}
          y2={center - minuteHandLength * Math.cos(minuteRad)}
          stroke={handColor}
          strokeWidth={6}
          strokeLinecap="round"
        />
        {/* Second hand */}
        <Line
          x1={center}
          y1={center}
          x2={center + secondHandLength * Math.sin(secondRad)}
          y2={center - secondHandLength * Math.cos(secondRad)}
          stroke={handColor}
          strokeWidth={2}
          strokeLinecap="round"
        />
        {/* Center dot */}
        <Circle
          cx={center}
          cy={center}
          r={6}
          fill={centerDotColor}
          stroke={centerDotBorderColor}
          strokeWidth={2}
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default AnalogClock;