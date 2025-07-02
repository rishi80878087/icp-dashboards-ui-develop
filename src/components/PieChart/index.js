import React from "react";
import dynamic from "next/dynamic";
import { plotOptionsConfig } from "@/utils/highchartsConfig";


const DynamicPieChart = dynamic(
  () => import("re-usable-highchart-components").then((mod) => mod.PieChart),
  { ssr: false }
);

const valueProps = {
  type: 'basicPie',
  title: "",
  plotOptions: {
    pie: {
      borderColor: 'var(--colorBgLayout)', // Set the border color to white
      borderWidth: 2,
    },
    ...plotOptionsConfig
  }
};

const PieChart = (props) => {
  console.log('rishi piechart ###', props)
  return (
    <DynamicPieChart {...{ ...valueProps, ...props }} />
  );
};

export default PieChart;
