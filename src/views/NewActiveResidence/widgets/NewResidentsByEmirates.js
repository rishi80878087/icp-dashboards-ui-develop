import React, { useState, useContext, useEffect, useRef, useMemo } from "react";
import {
  Row,
  Col,
  theme,
  PhosphorIcons,
  Card,
  Text,
  Tooltip,
} from "re-usable-design-components";
import DashboardCard from "@/components/DashboardCard";
import { useIntl } from "react-intl";
import dynamic from "next/dynamic";
import { LocaleContext } from "@/globalContext/locale/localeProvider";
import { checkRtl, getEmirateData, formatNumber, getColorFromPercentage, resolveTernary } from "@/utils/helper";
import UAE_JSON from "@/components/Map/UAE_GEO.json";
import { tooltipConfig } from "@/utils/highchartsConfig";
import PieChart from "@/components/PieChart";
import _ from "lodash";
import useResponsive from "@/hooks/useResponsive";
import Segmented from "@/components/Segmented";
import EmirateMap from "@/svgr/EmirateMap";
import { getEmiratesStatistics } from "@/services/activeResidenceService";
import useAsync from "@/hooks/useAsync";

const { MapPinLine, ChartPie, Info } = PhosphorIcons;

const FILTER_SECTION_WIDTH = 193;

const DynamicMap = dynamic(() => import("@/components/Map"), {
  ssr: false,
});

const { useToken } = theme;

const getMapInActiveColor = (value = {}, options = []) => {
  if (!options?.length || options?.includes(value)) return '';
  return "var(--map-region-bg)";
};

const getMapBubbleInActiveColor = (value = {}, options = []) => {
  if (!options?.length || options?.includes(value)) return '';
  return "transparent";
};

function getTooltip(isRtl, intl) {
  return function () {
    return `
      <div style="font-family: var(--fontFamily); text-align: ${isRtl ? "right" : "left"
}">${intl?.formatMessage({
  id: "Emirate City",
})}: <span style="font-weight: bold;">${this?.key}</span></div>
<div style="font-family: var(--fontFamily); text-align: ${isRtl ? "right" : "left"
}">${intl?.formatMessage({
  id: "Value",
})}: <span style="font-weight: bold;">${_.isNumber(this?.point?.value) ? formatNumber(this?.point?.value) : "-"
}</span></div>
    `;
  }
}

function getGlobalFilterItem(globalFilterActiveEmirate, item) {
  if (globalFilterActiveEmirate?.length && globalFilterActiveEmirate?.includes(item?.code)) {
    if (_.isNumber(item?.value)) {
      return formatNumber(item?.value)
    }
    return "-"
  }
  return "-"
}

function getBorderColor(selectedOptions, item, themeVariables) {
  return selectedOptions?.includes(item?.name)
    ? themeVariables?.token?.colorPrimaryBase
    : themeVariables?.token?.colorBorderSecondary
}

const getFormattedData = (data = [], emirateMap = []) => {
  const resObj = {};
  (Object.keys(emirateMap))?.forEach((key) => {
    resObj[key] = data?.find(item => item?.code == emirateMap[key]?.emirate_code)?.total;
  });
  return resObj;
};

function ResidentsByEmirate({
  filters,
  emiratesConfigValue = [],
  data: propData,
  title: propTitle,
  subtitle,
  icon,
  segmentProps,
  isLoading: propIsLoading,
  totalValue: propTotalValue,
  ...props
}) {
  const intl = useIntl();
  const chartRef = useRef();
  const [localeStore] = useContext(LocaleContext);
  const isRtl = checkRtl(localeStore);
  const themeVariables = useToken();
  const getResponsive = useResponsive();

  const {
    execute: invokeGetEmiratesResidents,
    status: emiratesResidentsStatus,
    value: emiratesResidentsValue,
  } = useAsync({ asyncFunction: getEmiratesStatistics });

  useEffect(() => {
    const _filters = _.cloneDeep(filters);
    delete _filters?.emirate_code;
    invokeGetEmiratesResidents({
      filters: { ..._filters },
    });
  }, [filters]);

  const emirateMap = useMemo(() => {
    if (emiratesResidentsStatus !== "success") {
      return {}
    }
    return getEmirateData(themeVariables, emiratesConfigValue, isRtl);
  }, [emiratesConfigValue, emiratesResidentsStatus]);

  const isLoading =
    propIsLoading ||
    emiratesResidentsStatus === "idle" ||
    emiratesResidentsStatus === "pending" ||
    !Object?.keys(emirateMap)?.length;

  const data = useMemo(() => {
    if (emiratesResidentsStatus !== "success") {
      return propData || [];
    }
    return getFormattedData(emiratesResidentsValue?.data || [], emirateMap);
  }, [emiratesResidentsValue?.data, emirateMap, propData]);

  const totalValue = propTotalValue || emiratesResidentsValue?.data?.find((v) => v?.code == 0)?.total;

  useEffect(() => {
    console.log('real_resident_by_emirates_emiratesconfigvalue', emiratesConfigValue, propTitle, icon);
  }, [emiratesConfigValue, propTitle, icon]);

  const viewOptions = [
    {
      label: intl?.formatMessage({ id: "Map" }),
      value: "map",
      icon: (
        <MapPinLine style={{ marginBottom: "3px" }} size={themeVariables?.token?.iconSizeXSM} weight="bold" />
      ),
    },
    {
      label: intl?.formatMessage({ id: "Chart" }),
      value: "chart",
      icon: (
        <ChartPie style={{ marginBottom: "3px" }} size={themeVariables?.token?.iconSizeXSM} weight="bold" />
      ),
    },
  ];

  const [viewBy, setViewBy] = useState(viewOptions?.[0]?.value);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const transformedMapData = Object.keys(emirateMap)?.map((value) => {
    const color = resolveTernary(viewBy === "map",
      data[value]
        ? getColorFromPercentage({
          percent: ((data[value] / totalValue) * 100),
        })
        : "var(--geek-blue-2)"
      , emirateMap[value]?.color)
    
    return {
      "hc-key": emirateMap[value]?.code,
      value: data[value],
      name: emirateMap[value]?.label,
      color: !selectedOptions?.length || selectedOptions?.includes(emirateMap[value]?.label) ? color : "var(--geek-blue-2)",
      legendColor: emirateMap[value]?.color,
      z: data[value],
      y: data[value],
      code: emirateMap[value]?.emirate_code
    };
  });

  const filteredPieChartData = !filters?.emirate_code ? transformedMapData : transformedMapData?.filter((v) => filters?.emirate_code?.includes(v?.code));

  const mapProps = {
    chart: {
      margin: [0, 0, 30, 0],
      map: UAE_JSON,
      events: {
        load: async function () {
          const chart = this;
          if (chart) {
            chartRef.current = chart;
          }
        }
      },
    },
    values: [
      {
        data: filteredPieChartData,
        showInLegend: false,
        joinBy: "hc-key",
        name: "",
        nullColor: "var(--geek-blue-2)",
        dataLabels: {
          enabled: false,
          useHTML: true,
          format: "{point.name}",
          style: {
            color: 'black',
            textShadow:
              `-1px -1px 0 white,  
                1px -1px 0 white,
                -1px 1px 0 white,
                1px 1px 0 white`,
            textOutline: '1px white',
          }
        },
      },
    ],
    tooltip: {
      formatter: getTooltip(isRtl, intl),
      outside: false,
      ...tooltipConfig,
    },
  };

  const pieProps = {
    title: "",
    values: [
      {
        size: "100%",
        colorByPoint: true,
        data: filteredPieChartData?.map((v) => ({ ...v, color: !selectedOptions?.length || selectedOptions?.includes(v?.name) ? v?.color : "var(--geek-blue-2)" })),
        dataLabels: {
          enabled: false,
        },
      },
    ],
    style: {},
    type: "basicPie",
    legend: {
      enabled: false,
    },
    tooltip: {
      formatter: getTooltip(isRtl, intl),
      ...tooltipConfig,
    },
  };

  const onEmirateClick = (value = {}, options = []) => {
    let _filterData = [];
    if (options?.includes(value?.name)) {
      _filterData = [];
    } else {
      _filterData = [value?.name];
    }
    setSelectedOptions(_filterData);
  };

  const highlightTooltip = (item) => {
    if (chartRef?.current) {
      const chart = chartRef.current;
      chart?.series?.forEach((s) => {
        if (s?.data?.length) {
          const point = _.cloneDeep(s?.data)?.find((v) => {
            return v?.options?.["hc-key"] === (item?.["hc-key"] || item?.["code"])
          })
          if (point) {
            setTimeout(() => {
              chart?.tooltip?.refresh(point);
            }, 200);
          }
        }
      })
    }
  }

  useEffect(() => {
    if (filters?.emirate?.code) {
      setSelectedOptions([filters?.emirate?.label]);
      highlightTooltip(filters?.emirate)
    } else {
      setSelectedOptions([]);
    }
  }, [filters?.emirate]);

  const isEmpty = !isLoading && !totalValue;

  useEffect(() => {
    console.log('totalvalue islo')
  }, [totalValue, isLoading]);

  const title = (
    <Row align="middle" gutter={4}>
      <Col flex="none">
        {intl?.formatMessage({ id: "Residents By Emirate" })}
      </Col>
      <Col flex="none">
        <Tooltip
          title={intl?.formatMessage({ id: "active_residence_residency_emirate_tooltip" })}
        >
          <span>
            <Info style={{ marginBottom: "3px" }} color="var(--colorIcon)" size={14} weight="bold" />
          </span>
        </Tooltip>
      </Col>
    </Row>
  );

  return (
    <DashboardCard
      title={propTitle || title}
      subtitle={subtitle}
      icon={icon || <EmirateMap />}
      cardBodyHeight={getResponsive({
        default: undefined,
        mobile: "543px",
      })}
      isLoading={isLoading}
      isEmpty={isEmpty}
      action={
        !isEmpty &&
        <Row>
          <Col>
            <Segmented
              options={viewOptions}
              size="middle"
              value={viewBy}
              onChange={(value) => {
                setViewBy(value);
              }}
              block={getResponsive({
                default: false,
                mobile: true,
              })}
              {...segmentProps}
            />
          </Col>
        </Row>
      }
      {...props}
    >
      <Row
        isFullHeight
        wrap={getResponsive({
          default: false,
          mobile: true,
        })}
        gutter={getResponsive({
          default: themeVariables?.token?.marginXS,
          mobile: [0, themeVariables?.token?.marginXS],
        })}
      >
        <Col
          isFlex
          flex={getResponsive({
            default: "auto",
            mobile: "100%",
          })}
          style={{
            height: getResponsive({
              default: undefined,
              mobile: "185px",
              position: "relative"
            }),
          }}
        >
          {viewBy === "map" ? (
            <>
              <div
                style={{
                  height: "100%"
                }}
              >
                <DynamicMap
                  mapNavigation={{
                    enabled: true,
                    useHTML: true,
                    buttonOptions: {
                      align: isRtl ? "right": "left",
                      verticalAlign: 'bottom',
                      y: -4,
                      x: isRtl ? -1 : 1,
                      theme: {
                        r: 6,
                      },
                      style: {
                        backgroundColor: 'var(--colorBgContainer)',
                        borderColor: 'var(--colorBorder)',
                        borderRadius: '5px',
                        padding: '5px',
                        fontSize: '12px'
                      }
                    }
                  }}
                  {...mapProps}
                />
              </div>
              {
                (filteredPieChartData?.length || 0) > 0 &&
                <div
                  style={{
                    position: "absolute",
                    right: getResponsive({ default: 60, mobile: 3 }),
                    left: getResponsive({ default: 60, mobile: 3 }),
                    margin: "auto",
                    bottom: 12,
                    width: getResponsive({ default: "auto" }),
                    height: "7px",
                    display: "flex",
                    justifyContent: "space-between",
                    paddingTop: "4px",
                    direction: "ltr",
                    background: 'linear-gradient(90deg, #EDE3CF 0%, #684F1E 100%)'
                  }}
                >
                  <span>
                    <Text size="sm" strong>
                      {intl?.formatMessage({ id: "Fewer Residence" })}
                    </Text>
                  </span>
                  <span>
                    <Text size="sm" strong>
                      {intl?.formatMessage({ id: "More Residence" })}
                    </Text>
                  </span>
                </div>
              }
            </>
          ) : (
            <PieChart {...pieProps} />
          )}
        </Col>
        <Col
          flex={getResponsive({
            default: `${FILTER_SECTION_WIDTH}px`,
            mobile: "100%",
          })}
          style={{
            margin: "auto",
            ...getResponsive({ mobile: "true" }) === "true" && {
              marginTop: "12px"
            }
          }}
          isFlex
        >
          <Row gutter={[0, themeVariables?.token?.marginXS]}>
            {transformedMapData?.map((item) => {
              const globalFilterApplied = !!filters?.emirate_code?.length;
              const globalFilterActiveEmirate = filters?.emirate_code;

              return (
                <Col key={item?.name}>
                  <Card
                    bodyStyle={{
                      padding: `${themeVariables.token?.paddingXXS}px ${themeVariables.token?.paddingXS}px`,
                      height: "32px",
                      display: "flex",
                      borderRadius: themeVariables?.token?.borderRadiusLG,
                      border: `1px solid ${getBorderColor(selectedOptions, item, themeVariables)}`,
                      borderBottomWidth: selectedOptions?.includes(item?.name)
                        ? 2
                        : 1,
                    }}
                    {...((!filters?.emirate_code?.length || filters?.emirate_code?.includes(item?.code)) && {
                      onCardClick: () => {
                        onEmirateClick(item, selectedOptions)
                        if (chartRef?.current) {
                          highlightTooltip(item)
                        }
                      },
                    })}
                    {...(filters?.emirate_code?.length &&
                      !filters?.emirate_code?.includes(item?.code) && {
                      style: {
                        opacity: 0.6,
                      },
                    })}
                  >
                    <Row
                      align="middle"
                      justify="space-between"
                      style={{ width: "100%" }}
                      wrap={false}
                    >
                      <Col flex="none">
                        <Row isFlex align="middle">
                          <Col
                            isFlex
                            flex="none"
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              backgroundColor: viewBy === "map"
                                ? getColorFromPercentage({
                                  percent: ((item?.value / totalValue) * 100),
                                })
                                : item?.legendColor,
                            }}
                          />
                          <Col
                            isFlex
                            flex="none"
                            paddingInline={`${themeVariables?.token?.paddingXXS}px 0px`}
                          >
                            <Text size="sm">{item?.name}</Text>
                          </Col>
                        </Row>
                      </Col>
                      <Col flex="none">
                        {globalFilterApplied ? (
                          <Text size="sm" strong>
                            : 
                            {getGlobalFilterItem(globalFilterActiveEmirate, item)}
                          </Text>
                        ) : (
                          <Text
                            ellipsis={{
                              tooltip: _.isNumber(item?.value)
                                ? formatNumber(item?.value)
                                : "-"
                            }}
                            size="sm"
                            strong
                          >
                            : 
                            {_.isNumber(item?.value)
                              ? formatNumber(item?.value)
                              : "-"}
                          </Text>
                        )}
                      </Col>
                    </Row>
                  </Card>
                </Col>
              );
            })}
          </Row>
        </Col>
      </Row>
    </DashboardCard>
  );
}


export default ResidentsByEmirate;