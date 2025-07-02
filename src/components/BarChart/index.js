import PropTypes from "prop-types"
import React, { useContext } from "react";
import dynamic from "next/dynamic";
import { plotOptionsConfig } from "@/utils/highchartsConfig";
import { LocaleContext } from "@/globalContext/locale/localeProvider";
import { checkRtl } from "@/utils/helper";
  

const DynamicBarChart = dynamic(
  () => import("re-usable-highchart-components").then((mod) => mod.BarChart),
  { ssr: false }
);          // Loads just the BarChart component from the module dynamically


const valueProps = {
  type: 'basicBar',
  isXAxisGridLine: false,
  isYAxisGridLine: true,
  plotOptions: {
    ...plotOptionsConfig
  }
};

const BarChart = ({ xAxis: _xAxis, yAxis: _yAxis, ...props }) => {
  const [localeStore] = useContext(LocaleContext);
  const isRtl = checkRtl(localeStore)

  const xAxis = {
    opposite: isRtl,
    ..._xAxis
  }

  const yAxis = {
    reversed: isRtl,
    ..._yAxis
  }
  return (
    <DynamicBarChart {...{...valueProps, xAxis, yAxis, ...props}} />
  );
};

BarChart.propTypes = {
  xAxis: PropTypes.any,
  yAxis: PropTypes.any
}

export default BarChart;
