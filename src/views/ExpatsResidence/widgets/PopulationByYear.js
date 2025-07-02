import PropTypes from "prop-types"
import React, { useContext, useEffect, useMemo } from "react";
import DashboardCard from "@/components/DashboardCard";
import { useIntl } from "react-intl";
import { Row, Col, Empty } from "re-usable-design-components";
import AreaChart from "@/components/AreaChart";
import { LocaleContext } from "@/globalContext/locale/localeProvider";
import WorldPopulation from "@/svgr/WorldPopulation";
import { tooltipConfig } from "@/utils/highchartsConfig";
import { getPopulationByYear } from "@/services/expatsResidenceService";
import useAsync from "@/hooks/useAsync";
import { formatNumber } from "@/utils/helper";
import _ from "lodash";


function getToolTip(isRtl, intl) {
  return function() {
    return `
    <div style="font-family: var(--fontFamily); direction: ${
  isRtl ? "rtl" : "ltr"
}">
    <div style="font-family: var(--fontFamily); text-align: ${
  isRtl ? "right" : "left"
}"><span style="font-weight: bold;">${intl?.formatMessage({
  id: "Total Residents",
})}</span></div>
      <div style="font-family: var(--fontFamily); text-align: ${
  isRtl ? "right" : "left"
}">${intl?.formatMessage({
  id: "Year",
})}: <span style="font-weight: bold;">${this?.x}</span></div>
      <div style="font-family: var(--fontFamily); text-align: ${
  isRtl ? "right" : "left"
}">${intl?.formatMessage({
  id: "Count",
})}: <span style="font-weight: bold;">${
  _.isNumber(this?.point?.options?.total_residents)
    ? formatNumber(this?.point?.options?.total_residents)
    : "-"
}</span></div>
      <div style="font-family: var(--fontFamily); text-align: ${
  isRtl ? "right" : "left"
}">${intl?.formatMessage({
  id: "Male",
})}: <span style="font-weight: bold;">${
  _.isNumber(this?.point?.options?.male_residents)
    ? formatNumber(this?.point?.options?.male_residents)
    : "-"
}</span></div>
      <div style="font-family: var(--fontFamily); text-align: ${
  isRtl ? "right" : "left"
}">${intl?.formatMessage({
  id: "Female",
})}: <span style="font-weight: bold;">${
  _.isNumber(this?.point?.options?.female_residents)
    ? formatNumber(this?.point?.options?.female_residents)
    : "-"
}</span></div>
    <div>`;
  }
}

function getXAxisLabel() {
  return function () {
    return `<div style="text-align: center; white-space: break-spaces; line-height: 16px;">${this?.value}</div>`;
  }
}

const getFormattedData = (data = []) => {
  const resObj = {
    xAxis: [],
    yAxis: [],
  };
  data?.forEach((value) => {
    resObj.xAxis.push(value?.year);
    resObj.yAxis.push({
      y: value?.total_residents,
      ...value,
    });
  });
  return resObj;
};

function PopulationByYear({ filter }) {
  const intl = useIntl();
  const [store] = useContext(LocaleContext);
  const isRtl = store?.projectTranslation === "ar";

  const {
    execute: invokeGetPopulationByYear,
    status: populationByYearStatus,
    value: populationByYearValue,
  } = useAsync({ asyncFunction: getPopulationByYear });

  useEffect(() => {
    const nationalityParam = !filter?.nationality?.country_alpha3
      ? ""
      : `&nationality_code=${filter?.nationality?.country_alpha3}`;
    const emirateParam = !filter?.emirate?.emirate_code
      ? ""
      : `&emirate_code=${filter?.emirate?.emirate_code}`;
    const _params = `gender=${filter?.gender?.apiKey}${emirateParam}${nationalityParam}`;

    invokeGetPopulationByYear({
      params: _params,
    });
  }, [
    filter?.gender,
    filter?.emirate,
    filter?.nationality,
    invokeGetPopulationByYear,
  ]);

  const isLoading =
    populationByYearStatus === "idle" || populationByYearStatus === "pending";

  const data = useMemo(() => {
    if (populationByYearStatus !== "success") {
      return {}
    }
    return getFormattedData(populationByYearValue?.data || []);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [populationByYearValue?.data])
    

  return (
    <DashboardCard
      title={intl?.formatMessage({ id: "Total Residents By Year" })}
      subtitle={intl?.formatMessage({
        id: "Annual residents statistics and growth trends.",
      })}
      bodyWrapStyle={{
        padding: "0px"
      }}
      icon={<WorldPopulation />}
      bodyBackgroundColor="none"
      loading={isLoading}
    >
      {data?.xAxis?.length ? (
        <Row isFullHeight>
          <Col>
            <AreaChart
              categories={data?.xAxis}
              yAxis={{
                min: 0,
                labels: {
                  style: {
                    fontFamily: "var(--fontFamily)",
                    color: "var(--colorText)",
                    fontSize: "12px", // You can also set font size
                  },
                },
                opposite: isRtl,
                title: {
                  text: intl?.formatMessage({ id: "Total Residents" }),
                  margin: 16,
                  style: {
                    color: "var(--colorText)",
                    fontFamily: "var(--fontFamily)",
                  },
                },
              }}
              xAxis={{
                gridLineDashStyle: 'longdash',
                reversed: isRtl,
                plotLines: [
                  {
                    color: "var(--colorBorder)", // Color of the line
                    width: 2,
                    dashStyle: "ShortDash",
                    zIndex: 5,
                  },
                ],
                labels: {
                  style: {
                    fontFamily: "var(--fontFamily)",
                    color: "var(--colorText)",
                    fontSize: "12px", // You can also set font size
                  },
                  formatter: getXAxisLabel(),
                },
                title: {
                  // text: 'Academic Term',
                  y: 8,
                  style: {
                    color: "var(--colorText)",
                  },
                },
              }}
              values={[
                {
                  name: intl?.formatMessage({ id: "Actual" }),
                  color: "var(--colorWarningBase)",
                  type: "area",
                  lineWidth: 2, // Increase the line width
                  fillOpacity: 0.2,
                  // fillColor: {
                  //   linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                  //   stops: [
                  //     [0, "rgba(182, 138, 53, 0.2)"],
                  //     [1, "rgba(182, 138, 53, 0.04)"],
                  //   ],
                  // },
                  // dashStyle: 'Dash',
                  data: data?.yAxis,
                  showInLegend: false,
                  marker: {
                    symbol: "circle",
                  },
                },
              ]}
              tooltip={{
                formatter: getToolTip(isRtl, intl),
                ...tooltipConfig,
              }}
            />
          </Col>
        </Row>
      ) : (
        <Row isFullHeight>
          <Col alignItems="center" justifyContent="center" isFlex>
            <Empty />
          </Col>
        </Row>
      )}
    </DashboardCard>
  );
}

PopulationByYear.propTypes = {
  filter: PropTypes.any
}

export default PopulationByYear;
