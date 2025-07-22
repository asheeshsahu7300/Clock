import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Line, Text, Defs, RadialGradient, Stop } from 'react-native-svg';

const SmallClock = ({ currentTime = new Date(), style, colorScheme = 'black' }) => {
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
  const size = style.width || 200; // Default size for larger clocks
  const isSmall = size <= 50; // For very small clocks (e.g., 40x40)
  const isMedium = size > 50 && size <= 100; // For medium clocks (e.g., 100x100)
  const center = size / 2;
  const radius = size / 2 - (isSmall ? 5 : isMedium ? 8 : 10); // Adjust border space
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
          fill={`url(#${faceGradientId})`}
          stroke={faceBorderColor}
          strokeWidth={isSmall ? 2 : isMedium ? 3 : 5} // Adjusted for size
        />

        {/* Hour markers (every 30°) - only for medium and larger clocks */}
        {!isSmall &&
          [...Array(12)].map((_, i) => {
            const angle = (i * 30 * Math.PI) / 180; // 30° per hour marker
            const length = isMedium ? 8 : 12; // Shorter for medium clocks
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
                strokeWidth={isMedium ? 2 : 3} // Thinner for medium clocks
              />
            );
          })}

        {/* Hour numbers (12, 3, 6, 9) - only for medium and larger clocks */}
        {!isSmall &&
          [
            { num: '12', angle: 0 },
            { num: '3', angle: 90 },
            { num: '6', angle: 180 },
            { num: '9', angle: 270 },
          ].map(({ num, angle }) => {
            const rad = (angle * Math.PI) / 180;
            const textRadius = radius - (isMedium ? 20 : 30); // Closer for medium clocks
            const x = center + textRadius * Math.sin(rad);
            const y = center - textRadius * Math.cos(rad);
            return (
              <Text
                key={num}
                x={x}
                y={y}
                fill={numberColor}
                fontSize={isMedium ? 12 : 18} // Smaller font for medium clocks
                fontWeight="bold"
                textAnchor="middle"
                dy={isMedium ? 4 : 6} // Adjusted for size
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
          strokeWidth={isSmall ? 4 : isMedium ? 6 : 8} // Adjusted for size
          strokeLinecap="round"
        />
        {/* Minute hand */}
        <Line
          x1={center}
          y1={center}
          x2={center + minuteHandLength * Math.sin(minuteRad)}
          y2={center - minuteHandLength * Math.cos(minuteRad)}
          stroke={handColor}
          strokeWidth={isSmall ? 3 : isMedium ? 4 : 6} // Adjusted for size
          strokeLinecap="round"
        />
        {/* Second hand - only for medium and larger clocks */}
        {!isSmall && (
          <Line
            x1={center}
            y1={center}
            x2={center + secondHandLength * Math.sin(secondRad)}
            y2={center - secondHandLength * Math.cos(secondRad)}
            stroke={handColor}
            strokeWidth={isMedium ? 1 : 2} // Thinner for medium clocks
            strokeLinecap="round"
          />
        )}
        {/* Center dot */}
        <Circle
          cx={center}
          cy={center}
          r={isSmall ? 3 : isMedium ? 4 : 6} // Adjusted for size
          fill={centerDotColor}
          stroke={centerDotBorderColor}
          strokeWidth={isSmall ? 1 : isMedium ? 1.5 : 2} // Adjusted for size
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

export default React.memo(SmallClock); // Memoize to prevent unnecessary re-renders