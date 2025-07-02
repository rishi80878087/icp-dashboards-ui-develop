import React from "react";
import dynamic from "next/dynamic";

const DynamicAreaChart = dynamic(
  () => import("re-usable-highchart-components").then((mod) => mod.AreaChart),
  { ssr: false }
);


const valueProps = {
  chart: {
    type: 'area',
  },
  plotOptions: {
    series: {
      marker: {
        enabled: false
      }
    },
    area: {
      pointPlacement: 'on',
      shadow: {
        color: 'var(--colorPrimaryBase)', // Default shadow color
        width: 15, // Width of the shadow
        opacity: 1, // Opacity of the shadow
        offsetX: 0, // Horizontal offset of the shadow
        offsetY: 3, // Vertical offset of the shadow
      },
    }
  },
  isXAxisGridLine: true,
  isYAxisGridLine: true,
  legend: {
    floating: false,
    verticalAlign: 'bottom',
    margin: 0,
    paddingBottom: 0,
    symbolHeight: 10,  // Customize the height of the legend symbol
    symbolWidth: 10,   // Customize the width of the legend symbol
    symbolPadding: 8,
    y: 16,
    itemStyle: {
      fontFamily: "var(--fontFamily)",
      color: 'var(--colorText)', // Set the text color (red in this case)
      fontSize: '14px',  // Set the font size
      lineHeight: '20px',
      pointerEvents: 'none' // Disable interaction with legend items
    }
  },
};

const AreaChart = (props) => {
  return (
    <DynamicAreaChart {...{...valueProps, ...props}} />
  );
};

export default AreaChart;
