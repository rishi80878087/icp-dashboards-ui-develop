import PropTypes from "prop-types"
import React from "react";
import dynamic from "next/dynamic";
import useResponsive from "@/hooks/useResponsive";

const DynamicGauges = dynamic(
  () => import("re-usable-highchart-components").then((mod) => mod.Gauges),
  { ssr: false }
);


const min = 0;
const max = 100;

const plotBands = [{
  from: 0,
  to: 59,
  color: {
    linearGradient: { x1: 0, y1: 0, x2: 1, y2: 0 },
    stops: [
      [0, '#E50808'],
      [1, '#1BC00C'],
    ],
  },
  // color: '#55BF3B', // green
  thickness: 12
}, {
  from: 58,
  to: 100,
  color: {
    linearGradient: { x1: 0, y1: 0, x2: 1, y2: 0 },
    stops: [
      [0, '#1BC00C'], // Green
      [1, '#55BF3B'],
    ],
  },
  // color: '#DF5353', // red
  thickness: 12
}]


const Gauges = ({ min: _min, tickPositions, spacing, margin, plotBands: _plotBands, yAxisLabels, max: _max, ...props }) => {
  const getResponsive = useResponsive();

  const valueProps = {
    type: 'gaugeSeries',
    min,
    max,
    yAxis: {
      min: min,
      max: max,
      tickPositions: tickPositions || [0, 40, 70, 100], // Specify the tick positions here
      tickColor: 'var(--colorBgContainer)',
      tickLength: 20,
      tickWidth: 2,
      minorTickInterval: null,  
      labels: yAxisLabels || {
        formatter: function () {
          // Custom label formatter
          return "";
        }
      },
      plotBands: _plotBands || plotBands,
    },
    pane: {
      startAngle: -90,
      endAngle: 89.9,
      background: null,
      center: ['50%', '75%'],
      size: '95%'
    },
    legend: {
      floating: getResponsive({ default: "false", midTablet: "true", mobile: "false" }) === "true",
      verticalAlign: getResponsive({ default: "bottom", midTablet: "middle", mobile: "bottom" }),
      align: getResponsive({ default: "center", midTablet: "right", mobile: "center" }),
      layout: getResponsive({ default: "horizontal", midTablet: "vertical", mobile: "horizontal" }),
      margin: 0,
      useHTML: false,
      paddingBottom: 0,
      symbolHeight: 6,  // Customize the height of the legend symbol
      symbolWidth: 6,   // Customize the width of the legend symbol
      symbolPadding: 8,
      y: getResponsive({ default: 0, mobile: -20 }),
      itemStyle: {
        color: 'var(--colorText)', // Set the text color (red in this case)
        fontSize: '12px',  // Set the font size
        lineHeight: '12px',
        transform: "translateY(2px)",
        pointerEvents: 'none' // Disable interaction with legend items
      }
    },
    chart: {
      renderTo: 'container',
      type: 'gauge',
      alignTicks: false,
      backgroundColor: null,
      plotBackgroundColor: null,
      plotBackgroundImage: null,
      plotBorderWidth: 0,
      plotShadow: false,
      spacingTop: 0,
      spacingLeft: 0,
      spacingRight: 4,
      spacingBottom: 4,
      height: "100%",
      ...spacing && ({
        spacing
      }),
      ...margin && ({
        margin
      }),
      events: {
        render: function () {
          const chart = this;
          const ticks = chart.yAxis[0].ticks;

          Object.keys(ticks).forEach(function (key) {
            const tick = ticks[key];
            if (tick.label) {
              if (tick.pos === 0) {
                tick.label.attr({
                  x: tick.label.attr('x') + 20, // Adjust distance for the first tick
                });
              } else if (tick.pos === 100) {
                tick.label.attr({
                  x: tick.label.attr('x') - 20, // Adjust distance for the last tick
                });
              }
            }
          });
        },
      }
    },
    tooltip: {
      enabled: false
    },
    plotOptions: {
      gauge: {
        linecap: 'round',
        stickyTracking: false,
        rounded: true
      }
    },
  };

  const common = { ...valueProps, ...props };
  return (
    <DynamicGauges {...common} />
  );
};

Gauges.propTypes = {
  margin: PropTypes.any,
  max: PropTypes.any,
  min: PropTypes.any,
  plotBands: PropTypes.any,
  spacing: PropTypes.any,
  tickPositions: PropTypes.array,
  yAxisLabels: PropTypes.any
}

export default Gauges;
