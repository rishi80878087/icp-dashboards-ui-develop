import PropTypes from "prop-types"
import React, { useState, useContext, useEffect, useRef } from "react";
import {
  Row,
  Col,
  theme,
  PhosphorIcons,
  Card,
  Text,
} from "re-usable-design-components";
import DashboardCard from "@/components/DashboardCard";
import { useIntl } from "react-intl";
import dynamic from "next/dynamic";
import { LocaleContext } from "@/globalContext/locale/localeProvider";
import { checkRtl, getEmirateData, formatNumber } from "@/utils/helper";
import UAE_JSON from "@/components/Map/UAE_GEO.json";
import { tooltipConfig } from "@/utils/highchartsConfig";
import PieChart from "@/components/PieChart";
import _ from "lodash";
import useResponsive from "@/hooks/useResponsive";
import Segmented from "@/components/Segmented";

const { MapPinLine, ChartPie } = PhosphorIcons;

const FILTER_SECTION_WIDTH = 180;

const DynamicMap = dynamic(() => import("../Map"), {
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
  if (globalFilterActiveEmirate) {
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

function ResidentsByEmirate({
  filter = {},
  data = {},
  title = "",
  subtitle = "",
  icon = null,
  emiratesConfigValue = [],
  segmentProps,
  isLoading,
  ...props
}) {
  const intl = useIntl();
  const chartRef = useRef();
  const [localeStore] = useContext(LocaleContext);
  const isRtl = checkRtl(localeStore);
  const themeVariables = useToken();
  const getResponsive = useResponsive();
  const emirateMap = getEmirateData(themeVariables, emiratesConfigValue, isRtl);

  const viewOptions = [
    {
      label: intl?.formatMessage({ id: "Map" }),
      value: "map",
      icon: (
        <MapPinLine size={themeVariables?.token?.iconSizeXSM} weight="bold" />
      ),
    },
    {
      label: intl?.formatMessage({ id: "Chart" }),
      value: "chart",
      icon: (
        <ChartPie size={themeVariables?.token?.iconSizeXSM} weight="bold" />
      ),
    },
  ];

  const [viewBy, setViewBy] = useState(viewOptions?.[0]?.value);
  const [selectedOptions, setSelectedOptions] = useState([]);

  const transformedMapData = Object.keys(emirateMap)?.map((value) => {
    return {
      "hc-key": emirateMap[value]?.code,
      value: data[value],
      name: emirateMap[value]?.label,
      color:
        getMapInActiveColor(emirateMap[value]?.label, selectedOptions) ||
        emirateMap[value]?.color,
      bubbleColor:
        getMapBubbleInActiveColor(emirateMap[value]?.label, selectedOptions) ||
        undefined,
      legendColor: emirateMap[value]?.color,
      z: data[value],
      y: data[value],
    };
  });

  const filteredPieChartData = !filter?.emirate?.code ? transformedMapData : transformedMapData?.filter((v) => v?.["hc-key"] === filter?.emirate?.code);


  const mapProps = {
    chart: {
      margin: [0, 0, 3, 0],
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
    mapView: {
      padding: getResponsive({
        default: [0, 15, 0, 0],
        tablet: [0, 30, 0, 0],
      }),
    },
    values: [
      {
        data: transformedMapData,
        showInLegend: false,
        joinBy: "hc-key",
        name: "",
        dataLabels: {
          enabled: true,
          useHTML: true,
          format: "{point.name}",
          style: {
            color: 'black',  // Text color
            textShadow:
              `-1px -1px 0 white,  
                1px -1px 0 white,
                -1px 1px 0 white,
                1px 1px 0 white`,
            // fontFamily: 'var(--fontFamily)', // Ensure the font supports Arabic
            textOutline: '1px white',  // Outline color and width
          }
        },
      },
      {
        type: "mapbubble",
        data: transformedMapData?.map((value) => {
          return {
            ...value,
            color: value?.bubbleColor,
          };
        }),
        showInLegend: false,
        joinBy: "hc-key",
        name: "",
        minSize: 10,
        maxSize: 60,
      },
    ],
    tooltip: {
      formatter: getTooltip(isRtl, intl),
      outside: true,
      ...tooltipConfig,
    },
  };

  const pieProps = {
    title: "",
    values: [
      {
        size: "100%",
        colorByPoint: true,
        data: filteredPieChartData,
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
          // // Ensure that the point exists before refreshing the tooltip
          if (point) {
            chart.tooltip.refresh(point); // Show the tooltip for that point
            chart.hoverPoint = point; // Set the hovered point
          }
        }
      })
    }
  }

  useEffect(() => {
    if (filter?.emirate?.code) {
      setSelectedOptions([filter?.emirate?.label]);
      highlightTooltip(filter?.emirate)
    } else {
      setSelectedOptions([]);
    }
  }, [filter?.emirate]);

  return (
    <DashboardCard
      title={title}
      subtitle={subtitle}
      icon={icon}
      cardBodyHeight={getResponsive({
        default: undefined,
        mobile: "543px",
      })}
      isLoading={isLoading}
      action={
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
              {
                ...segmentProps
              }
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
            }),
          }}
        >
          {viewBy === "map" ? (
            <DynamicMap
              mapNavigation={{
                enabled: true,
                useHTML: true,
                buttonOptions: {
                  align: isRtl ? "right": "left",
                  verticalAlign: 'bottom',
                  y: -4, // Adjust to move buttons if necessary
                  theme: {
                    r: 6, // change border radius here
                  },
                  style: {
                    // Customize styles if needed
                    backgroundColor: 'var(--colorBgContainer)',
                    borderColor: 'var(--colorBorder)',
                    borderRadius: '5px', // Add border radius here
                    padding: '5px', // Optional: Adjust padding for better appearance
                    fontSize: '12px' // Optional: Adjust font size
                  }
                }
              }}
              {...mapProps}
            />
          ) : (
            <PieChart {...pieProps} />
          )}
        </Col>
        <Col
          flex={getResponsive({
            default: `${FILTER_SECTION_WIDTH}px`,
            mobile: "100%",
          })}
          isFlex
        >
          <Row gutter={[0, themeVariables?.token?.marginXS]}>
            {transformedMapData?.map((item) => {
              const globalFilterApplied = filter?.emirate?.label;
              const globalFilterActiveEmirate =
                filter?.emirate?.label === item?.name;

              return (
                <Col key={item?.name}>
                  <Card
                    // borderColor={
                    //   selectedOptions?.includes(item?.name)
                    //     ? themeVariables?.token?.colorPrimaryBase
                    //     : ""
                    // }
                    bodyStyle={{
                      padding: `${themeVariables.token?.paddingXXS}px ${themeVariables.token?.paddingXS}px`,
                      height: "32px",
                      display: "flex",
                      borderRadius: themeVariables?.token?.borderRadiusLG,
                      border: `1px solid ${getBorderColor(selectedOptions, item, getBorderColor)}`,
                      borderBottomWidth: selectedOptions?.includes(item?.name)
                        ? 2
                        : 1,
                    }}
                    {...(!filter?.emirate?.code && {
                      onCardClick: () => {
                        onEmirateClick(item, selectedOptions)

                        if (chartRef?.current) {
                          //why this is required
                          // const chart = chartRef.current;

                          highlightTooltip(item)
                        }
                      },
                    })}
                    {...(filter?.emirate?.code &&
                      filter?.emirate?.label !== item?.name && {
                      style: {
                        opacity: 0.6,
                      },
                    })}
                  >
                    <Row
                      align="middle"
                      justify="space-between"
                      style={{ width: "100%" }}
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
                              backgroundColor: item?.legendColor,
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
                            :&nbsp;
                            {getGlobalFilterItem(globalFilterActiveEmirate, item)}
                          </Text>
                        ) : (
                          <Text size="sm" strong>
                            :&nbsp;
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

ResidentsByEmirate.propTypes = {
  data: PropTypes.any,
  emiratesConfigValue: PropTypes.any,
  filter: PropTypes.any,
  icon: PropTypes.any,
  isLoading: PropTypes.any,
  segmentProps: PropTypes.any,
  subtitle: PropTypes.string,
  title: PropTypes.string
}

export default ResidentsByEmirate;
