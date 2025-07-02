import React from "react";
import dynamic from "next/dynamic";
import { worldGeoJSON } from "re-usable-highchart-components";
import { plotOptionsConfig } from "@/utils/highchartsConfig";


const DynamicMap = dynamic(
  () => import("re-usable-highchart-components").then((mod) => mod.Map),
  { ssr: false }
);
  

const valueProps = {
  plotOptions: {
    ...plotOptionsConfig
  }
};

const AreaChart = (props) => {
  return (
    <DynamicMap {...{...valueProps, ...props}} />
  );
};

export function getWorldGeoJSON() {
  return worldGeoJSON;
}

export default AreaChart;
