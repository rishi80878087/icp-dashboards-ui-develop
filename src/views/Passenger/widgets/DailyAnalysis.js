import PropTypes from "prop-types"
import SectionCard from '@/components/SectionCard';
import useAsync from '@/hooks/useAsync';
import useResponsive from '@/hooks/useResponsive';
import { getDailyAnalysis } from '@/services/passengerService';
import AreaChart from '@/components/AreaChart';
import { useIntl } from 'react-intl';
import { useEffect, useState, useMemo, useContext } from 'react';
import { theme, Row, Col } from "re-usable-design-components";
import moment from 'moment';
import { LocaleContext } from '@/globalContext/locale/localeProvider';
import { formatNumber, resolveTernary } from "@/utils/helper";
import ArrivalDepartureSegment from '@/components/ArrivalDepartureSegment';
import dayjs from 'dayjs';
import Empty from '@/components/Empty';
import { tooltipConfig } from '@/utils/highchartsConfig';


function sum(first, second) {
  if (first === null && second === null) {
    return null
  }

  if (first === null) {
    return second
  }

  if (second === null) {
    return first
  }
  return first + second
}
const { useToken } = theme;


function getToolTip (isRtl, intl, showBy) {
  function getTextAlign (isRtl) {
    if (isRtl) {
      return "right";
    }
    return "left";
  }
  
  function getDirection (isRtl) {
    if (isRtl) {
      return "rtl";
    }
    return "ltr";
  }
  
  return function() {
    return `
      <div style="font-family: var(--fontFamily); direction: ${getDirection(isRtl)}">
      <div style="font-family: var(--fontFamily); text-align: ${getTextAlign(isRtl)}"><span style="font-weight: bold;">${intl?.formatMessage({ id: "Passengers Forecast Analysis" })}</span></div>
        <div style="font-family: var(--fontFamily); text-align: ${getTextAlign(isRtl)}">${intl?.formatMessage({ id: dayjs(this.x)?.format("DD-MM-YYYY") === dayjs()?.format("DD-MM-YYYY") ? intl?.formatMessage({ id: "Today" }) : intl?.formatMessage({ id: "Date" }) })}: <span style="font-weight: bold;">${dayjs(this.x)?.format("DD/MM/YYYY")}</span></div>
        <div style="font-family: var(--fontFamily); text-align: ${getTextAlign(isRtl)}">${intl?.formatMessage({ id: "Previous Year" })}: <span style="font-weight: bold;">${formatNumber(showBy === "ALL" ? sum(this?.point?.previous_in, this?.point?.previous_out): resolveTernary(showBy === "incoming", this?.point?.previous_in, this?.point?.previous_out))}</span></div>
        <div style="font-family: var(--fontFamily); text-align: ${getTextAlign(isRtl)}">${intl?.formatMessage({ id: "Predicted" })}: <span style="font-weight: bold;">${formatNumber(showBy === "ALL" ? sum(this?.point?.predict_in, this?.point?.predict_out): resolveTernary(showBy === "incoming", this?.point?.predict_in, this?.point?.predict_out))}</span></div>
        <div style="font-family: var(--fontFamily); text-align: ${getTextAlign(isRtl)}">${intl?.formatMessage({ id: "Actual" })}: <span style="font-weight: bold;">${formatNumber(showBy === "ALL" ? sum(this?.point?.actual_in, this?.point?.actual_out): resolveTernary(showBy === "incoming", this?.point?.actual_in, this?.point?.actual_out))}</span></div>
      <div>`;
  }
}

function getXAxisTooltip() {
  return function () {
    return `<div style="text-align: center; white-space: break-spaces; line-height: 16px;">${dayjs(this?.value)?.format("DD MMM")}</div>`
  }
}

function Widget({ airport }) {
  const intl = useIntl();
  const getResponsive = useResponsive();
  const [store] = useContext(LocaleContext);
  const [showBy, setShowBy] = useState("ALL")
  const {
    execute: executeGetDailyAnalysis,
    status: dailyAnalysisStatus,
    value: dailyAnalysisValue,
  } = useAsync({ asyncFunction: getDailyAnalysis });

  useEffect(() => {
    if (airport) {
      executeGetDailyAnalysis({ airport_code: airport?.airport_code, traffic_direction: "ALL" })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [airport])

  const data = useMemo(() => {
    return dailyAnalysisValue?.data?.reduce((acc, val) => {
      acc.categories.push(val?.current_date);
      acc.actual.push({ y: showBy === "ALL" ? sum(val?.actual_in, val?.actual_out): resolveTernary(showBy === "incoming", val?.actual_in, val?.actual_out), ...val });
      acc.predicted.push({ y: showBy === "ALL" ? sum(val?.predict_in, val?.predict_out): resolveTernary(showBy === "incoming", val?.predict_in, val?.predict_out), ...val });
      acc.previous.push({ y: showBy === "ALL" ? sum(val?.previous_in, val?.previous_out) : resolveTernary(showBy === "incoming", val?.previous_in, val?.previous_out), ...val });
      return acc;
    }, {
      categories: [],
      actual: [],
      predicted: [],
      previous: []
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dailyAnalysisValue?.data, showBy])

  const isRtl = store?.projectTranslation === "ar"

  return (
    <SectionCard
      loading={dailyAnalysisStatus === "idle" || dailyAnalysisStatus === "pending"}
      title={intl?.formatMessage({ id: "Daily Staffed Passengers Forecast Analysis" })}
      subtitle={<Row style={{ whiteSpace: "normal" }}><Col>{intl?.formatMessage({ id: "Analysis of expected, actual, and last year's passenger volumes" })}</Col></Row>}
      action={<ArrivalDepartureSegment block={getResponsive({ default: false, midTablet: true })} value={showBy} setValue={setShowBy} />}
      cardBodyHeight={"515px"}
      content={
        data?.categories?.length ?
          <AreaChart
            categories={data?.categories}
            yAxis={{
              min: 0,
              labels: {
                style: {
                  fontFamily: "var(--fontFamily)",
                  color: 'var(--colorText)',
                  fontSize: '12px', // You can also set font size
                }
              },
              opposite: isRtl,
              title: {
                text: intl?.formatMessage({ id: 'Number of Passengers' }),
                margin: 16,
                style: {
                  color: 'var(--colorText)',
                  fontFamily: "var(--fontFamily)",
                }
              }
            }}
            xAxis={{
              plotLines: [{
                color: 'var(--colorBorder)', // Color of the line
                width: 2,
                value: data?.categories?.findIndex(v => v === moment()?.format("YYYY-MM-DD")),
                dashStyle: "ShortDash",
                zIndex: 5,
              }],
              reversed: isRtl,
              labels: {
                style: {
                  fontFamily: "var(--fontFamily)",
                  color: 'var(--colorText)',
                  fontSize: '12px', // You can also set font size
                },
                formatter: getXAxisTooltip()
              },
              title: {
                // text: 'Academic Term',
                y: 8,
                style: {
                  color: 'var(--colorText)',
                }
              }
            }}
            values={[{
              name: intl?.formatMessage({ id: 'Previous Year' }),
              color: 'var(--red-4)',
              type: 'line',
              lineWidth: 2, // Increase the line width
              // fillColor: {
              //   linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
              //   stops: [
              //     [0, 'rgba(0, 36, 156, 0.5)'],
              //     [1, 'rgba(255, 255, 255, 0)']
              //   ]
              // },
              showInLegend: true,
              data: data?.previous
            },
            {
              type: 'line',
              name: intl?.formatMessage({ id: 'Predicted' }),
              color: 'var(--blue-6)',
              lineWidth: 2, // Increase the line width
              // fillColor: {
              //   linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
              //   stops: [
              //     [0, 'rgba(0, 36, 156, 0.5)'],
              //     [1, 'rgba(255, 255, 255, 0)']
              //   ]
              // },
              dashStyle: 'Dash',
              data: data?.predicted,
              showInLegend: true,
              marker: {
                symbol: 'circle'
              }
            },
            {
              name: intl?.formatMessage({ id: 'Actual' }),
              color: 'var(--colorPrimaryBase)',
              type: 'area',
              lineWidth: 2, // Increase the line width
              fillColor: {
                linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                stops: [
                  [0, 'rgba(182, 138, 53, 0.2)'],
                  [1, 'rgba(182, 138, 53, 0.04)']
                ]
              },
              // dashStyle: 'Dash',
              data: data?.actual,
              showInLegend: true,
              marker: {
                symbol: 'circle'
              }
            },
            {
              name: intl?.formatMessage({ id: 'Current Date' }),
              color: 'var(--colorBorder)',
              type: 'line',
              dashStyle: 'Dash',
              // data: data?.actual,
              showInLegend: true,
              marker: {
                symbol: 'circle'
              }
            }
            ]}
            tooltip={{
              formatter: getToolTip(isRtl, intl, showBy),
              ...tooltipConfig
            }}
          />
          : <Row isFullHeight><Col style={{ display: "flex" }} alignItems="center" justifyContent="center"><Empty description={intl?.formatMessage({ id: "No daily forecast analysis available" })} /></Col></Row>
      }
    />
  )
}

Widget.propTypes = {
  airport: PropTypes.any
}

export default Widget;
