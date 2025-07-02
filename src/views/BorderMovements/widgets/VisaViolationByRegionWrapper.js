import PropTypes from "prop-types"
import { useState, useMemo, useRef, useContext, useEffect } from "react";
import _, { filter } from "lodash";
import { useIntl } from "react-intl";
import useAsync from "@/hooks/useAsync";
import { tooltipConfig } from "@/utils/highchartsConfig";
import dynamic from "next/dynamic";
import { formatNumber, checkRtl, resolveTernary, emiratesFlagMapping  } from "@/utils/helper";
import { TableFilterDropdown, InputWrap  } from "@/components/TableFilterWidgets";
import UAE_JSON from "@/components/Map/UAE_GEO.json";
import { LocaleContext } from "@/globalContext/locale/localeProvider";
import { getViolationsEmirates, getViolationsOffices } from "@/services/visaVioloationService";
import {
  Row, Col, Avatar, Text, Title, theme, Skeleton, Empty,
  Progress, Table, Tooltip, PhosphorIcons,
  AntIcons
} from "re-usable-design-components";
import DashboardCard from "@/components/DashboardCard";
import BuildingOffice from "@/svgr/BuildingOffice";
import useResponsive from "@/hooks/useResponsive";

const DynamicMap = dynamic(() => import("@/components/Map"), {
  ssr: false,
});
import Tabs from "@/components/Tabs";


const { Info } = PhosphorIcons;
const { SearchOutlined } = AntIcons;

function StatCard({ label, value, icon, iconBgColor, bgColor }) {
  return (
    <Row
      wrap={false}
      style={{
        backgroundColor: bgColor,
        padding: "var(--paddingPx)",
        borderRadius: "var(--borderRadiusPx)",
        minHeight: "86px"
      }}
    >
      <Col flex="auto">
        <Row>
          <Col>
            <Text
              color="var(--colorTextLabel)"
            >
              {label}
            </Text>
          </Col>
          <Col>
            <Title>
              {value}
            </Title>
          </Col>
        </Row>
      </Col>
      <Col flex="none">
        {!!icon && (
          <Avatar
            backgroundColor={iconBgColor}
            icon={icon}
          />
        )}
      </Col>
    </Row>
  )
}

StatCard.propTypes = {
  label: PropTypes.any,
  value: PropTypes.any,
  icon: PropTypes.any,
  iconBgColor: PropTypes.any,
  bgColor: PropTypes.any
}

function ResidentsByRegionWrapper({
  filter,
  icon,
  title,
  isPreview,
  nationalitiesConfigValueObj,
  dateRange,
  isPrint,
  rows,
  callback,
  offset,
  space,
}) {
  const intl = useIntl();

  const [showBy, setShowBy] = useState(null);

  useEffect(() => {
    if (showBy !== visaEmiratesValue?.data?.emirates?.[0]?.code) {
      setShowBy(visaEmiratesValue?.data?.emirates?.[0]?.code)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter])


  const {
    execute: invokeGetVisaEmirates,
    status: visaEmiratesStatus,
    value: visaEmiratesValue,
  } = useAsync({ asyncFunction: getViolationsEmirates });

  useEffect(() => {
    invokeGetVisaEmirates({
      filter: { ...filter, ...dateRange },
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filter,
    invokeGetVisaEmirates,
  ]);

  const isLoading =
    visaEmiratesStatus === "idle" ||
    visaEmiratesStatus === "pending";


  const data = useMemo(() => {
    if (visaEmiratesStatus !== "success") {
      return []
    }
    setShowBy(visaEmiratesValue?.data?.emirates?.[0]?.code)
    return visaEmiratesValue?.data?.emirates;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visaEmiratesValue?.data])
  
  return (
    <VisaByRegionAndNationality
      icon={icon}
      title={title}
      showBy={showBy}
      setShowBy={setShowBy}
      dateRange={dateRange}
      isLoading={isLoading}
      isPreview={isPreview}
      mapTooltipTitle={intl?.formatMessage({ id: "Total Population" })}
      data={data}
      filter={filter}
      space={space}
      isPrint={isPrint}
      rows={rows}
      offset={offset}
      callback={callback}
      nationalitiesConfigValueObj={nationalitiesConfigValueObj}
      // totalMapping={totalData}
      tableConfig={{
        title: {
          secondColumn: intl?.formatMessage({ id: "Visa Violations" })
        }
      }}
    />
  );
}

ResidentsByRegionWrapper.propTypes = {
  filter: PropTypes.any,
  icon: PropTypes.any,
  nationalitiesConfigValueObj: PropTypes.any,
  title: PropTypes.any,
  dateRange: PropTypes.any,
  isPrint: PropTypes.any,
  rows: PropTypes.any,
  callback: PropTypes.any,
  offset: PropTypes.any,
  space: PropTypes.any,
  isPreview: PropTypes.any
}

export default ResidentsByRegionWrapper;

const { useToken } = theme;


function RegionWrap({ keyLabel, label, value }) {
  const themeVariables = useToken();

  return (
    <Row wrap={false} gutter={themeVariables?.token?.marginSM}>
      <Col flex="none">
        <Avatar size={34} src={emiratesFlagMapping[keyLabel]} />
      </Col>
      <Col flex="none">
        <Row gutter={[0, 4]}>
          <Col>
            <Text color='var(--colorTextLabel)' size="sm">
              {label}
            </Text>
          </Col>
          <Col>
            <Title level={5}>
              {value}
            </Title>
          </Col>
        </Row>
      </Col>
    </Row>
  )
}

RegionWrap.propTypes = {
  keyLabel: PropTypes.any,
  label: PropTypes.any,
  value: PropTypes.any
}

function handleMouseOver() {
  if (this?.options?.isHoverDisabled) {
    this.setState('normal');
  }
}

function FormatText(v) {
  return <Text>{`${v}`}</Text>
}

function getTooltip(isRtl, intl) {
  return function () {
    return `
      <div style="font-family: var(--fontFamily); text-align: ${isRtl ? "right" : "left"
}"><span style="font-weight: bold;">${this?.point?.name}</span></div>
<div style="font-family: var(--fontFamily); text-align: ${isRtl ? "right" : "left"
}">${intl?.formatMessage({
  id: "Violations",
})}: <span style="font-weight: bold;">${_.isNumber(this?.point?.violations) ? formatNumber(this?.point?.violations) : "-"
}</span></div>
    `;

  }
}

function VisaByRegionAndNationality({
  data: emiratesData,
  filter,
  dateRange,
  showBy,
  setShowBy = () => { },
  icon,
  isLoading : _isLoading = false,
  tableConfig = {},
  space,
  isPreview,
  isPrint,
  rows,
  offset,
  callback,
  isTableHidden,
  isMapHidden
}) {
  const intl = useIntl();
  const [searchText, setSearchText] = useState(undefined);
  const [tourismSearchText, setTourismSearchText] = useState(undefined);
  const [appliedSearchText, setAppliedSearchText] = useState(undefined)
  const [appliedTourismSearchText, setAppliedTourismSearchText] = useState(undefined)

  const [localeStore] = useContext(LocaleContext);
  const isRtl = checkRtl(localeStore);
  const [printRows, setPrintRows] = useState(offset ? { from: offset, to: offset + 1 } : rows || { from: 0, to: 1 });

  const {
    execute: invokeNationalities,
    status: nationalitiesStatus,
    value: nationalitiesValue,
  } = useAsync({ asyncFunction: getViolationsOffices });

  const isLoading = _isLoading;

  const hiddenContainerRef = useRef()


  useEffect(() => {
    if (![undefined, null]?.includes(showBy)) {
      invokeNationalities({ filter: { ...filter, emirates: showBy, ...dateRange } })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showBy, filter])

  const _data = nationalitiesValue?.data?.offices || [];

  useEffect(() => {
    setAppliedTourismSearchText(undefined)
    setTourismSearchText(undefined)
  }, [appliedSearchText]);

  const data = useMemo(() => {
    if (!appliedSearchText?.length && !appliedTourismSearchText?.length) {
      return _.cloneDeep(_data);
    }
    return _data?.filter((v) => {
      let isFiltered = true;
      if (appliedSearchText?.length) {
        isFiltered = appliedSearchText?.includes(v?.[isRtl ? "name_ar" : "name_en"]);
      }
      if (appliedTourismSearchText?.length && isFiltered) {
        isFiltered = appliedTourismSearchText?.includes(v?.[isRtl ? "tourism_office_ar" : "tourism_office_en"])
      }
      return isFiltered;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appliedSearchText, _data]);

  const getColumnSearchProps = () => ({
    filterDropdown: (
      <TableFilterDropdown
        setAppliedSearchText={setAppliedSearchText}
        appliedSearchText={appliedSearchText}
        setSearchText={setSearchText}
        searchText={searchText}
        data={_data}
      >
        {
          (d) => (
            <InputWrap
              data={d}
              arKey="name_ar"
              enKey="name_en"
              searchText={searchText}
              onChange={(v) => {
                setSearchText(v)
                if (!v) {
                  setAppliedSearchText(v)
                }
              }}
            />
          )
        }
      </TableFilterDropdown>
    ),
    filterIcon: <SearchOutlined style={{ color: appliedSearchText ? 'var(--colorPrimaryBase)' : undefined }} />,
  });

  const getTourismColumnSearchProps = () => ({
    filterDropdown: (
      <TableFilterDropdown
        setAppliedSearchText={setAppliedTourismSearchText}
        appliedSearchText={appliedTourismSearchText}
        setSearchText={setTourismSearchText}
        searchText={tourismSearchText}
        data={_.uniqBy(_data, isRtl ? "tourism_office_ar": "tourism_office_en")}
      >
        {
          (d) => (
            <InputWrap
              data={d}
              arKey="tourism_office_ar"
              enKey="tourism_office_en"
              searchText={tourismSearchText}
              onChange={(v) => {
                setTourismSearchText(v)
                if (!v) {
                  setAppliedTourismSearchText(v)
                }
              }}
            />
          )
        }
      </TableFilterDropdown>
    ),
    filterIcon: <SearchOutlined style={{ color: appliedTourismSearchText ? 'var(--colorPrimaryBase)' : undefined }} />,
  });

  useEffect(() => {
    if (isPreview && !isPrint && !["idle", "pending"]?.includes(nationalitiesStatus) && !isTableHidden) {
      setTimeout(() => {
        if (hiddenContainerRef?.current?.getBoundingClientRect) {
          const height = hiddenContainerRef.current.getBoundingClientRect().height;
          if (height >= space && printRows?.to === 1) {
            callback({ info: { isNextPage: true, printRows: { from: printRows?.from, to: printRows?.to } }});
          } else if (printRows?.to >= data?.length) {
            callback({ info: { printRows: { from: printRows?.from, to: printRows?.to, isAllRendered: true } } });
          } else if (height < space) {
            const elementsCount = (Math?.floor((space - height) / 47) + 2) || 0;
            setPrintRows((v) => ({ ...v, from: printRows?.from, to: v?.to + elementsCount }))
          } else if (height >= space) {
            callback({ info: { printRows: { from: printRows?.from, to: printRows?.to - 2 } } });
          }
        }
      }, [200]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [printRows, nationalitiesStatus])

  const sumTotalViolations = useMemo(() => {
    let sum = 0;
    _data?.forEach((v) => sum += v?.violations)
    return sum;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  useEffect(() => {
    if (searchText) {
      setSearchText(undefined)
    }
    if (appliedSearchText) {
      setAppliedSearchText(undefined)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter])
  
  const getResponsive = useResponsive();
  const chartRef = useRef();
  const themeVariables = useToken();
  
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
        data: [],
        nullColor: 'var(--map-region-bg)',
        showInLegend: false,
        joinBy: "hc-key",
        name: "",
        dataLabels: {
          enabled: true,
          useHTML: true,
          format: isRtl ? "{point.name_ar}" : "{point.name}",
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
        data: data?.map((value, index) => {
          return {
            ...value,
            name: isRtl ? value?.name_ar : value?.name_en,
            lat: Number(value?.latitude),
            lon: Number(value?.longitude),
            z: 1,
          };
        }),
        showInLegend: false,
        color: 'rgba(255, 163, 163, 1)', // Inner fill color (orange)
        // lineColor: 'rgba(255, 0, 0, 0.5)', // Outer stroke color with transparency
        // lineWidth: 5,
        name: "",
        minSize: 10,
        maxSize: 60,
      },
      {
        // Dot (center point)
        type: 'mappoint',
        name: 'Center Dot',
        marker: {
          symbol: 'circle',
          radius: 5,
          fillColor: '#ff4d4f',
          lineWidth: 0
        },
        showInLegend: false,
        lineWidth: 0,
        lineColor: 'transparent',
        data: data?.map((value, index) => {
          return {
            ...value,
            lat: Number(value?.latitude),
            lon: Number(value?.longitude),
            z: 2,
          };
        }),
        tooltip: { enabled: false }
      }
    ],
    tooltip: {
      formatter: getTooltip(isRtl, intl),
      outside: true,
      ...tooltipConfig,
    },
  };

  function getComponent() {
    if (_.isEmpty(data)) {
      return (
        <Row isFullHeight>
          <Col
            textAlign="center"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <Empty />
          </Col>
        </Row>
      )
    }
    return (
      <DynamicMap
        mapNavigation={{
          enabled: true,
          useHTML: true,
          buttonOptions: {
            align: 'left',
            verticalAlign: 'bottom',
            y: -4, // Adjust to move buttons if necessary
            theme: {
              r: 6, // change border radius here
            },
            style: {
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
    )
  }

  const isLoadingTable = (nationalitiesStatus === "idle" || nationalitiesStatus === "pending")

  const tableEle = (
    <DashboardCard
      title={intl?.formatMessage({ id: "By Department & Tourism Office" })}
      bodyBackgroundColor="transparent"
      cardBodyHeight={"auto"}
      cardBodyPadding={isLoading || isLoadingTable ? "16px" : "0px"}
      bordered
      bodyWrapStyle={{
        padding: "0px",
      }}
      style={{
        height: getResponsive({ default: "100%", tablet: "100%", midTablet: "449px", mobile: data?.length ? "480px" : "365px" }),
      }}
      headStyle={{
        backgroundColor: "var(--brand-gold-1)",
        padding: "var(--paddingSMPx) var(--paddingPx)",
      }}
      loading={isLoading || isLoadingTable}
      titleProps={{
        wrap: getResponsive({ default: false, tablet: true }),
        gutter: getResponsive({ default: [8], tablet: [0, 8], midTablet: [8], mobile: [0, 8] })
      }}
      actionProps={{
        flex: getResponsive({ default: "none", tablet: "0 0 100%", midTablet: "none", mobile: "0 0 100%" })
      }}
    >
      <Table
        key={`${appliedSearchText}_${appliedTourismSearchText}`}
        borderRadiusOnSides={getResponsive({ default: data?.length > 6 ? "all" : "top", midTablet: data?.length > 6 ? "all" : "top", mobile: data?.length > 4 ? "all" : "top" })}
        onRow={(record) => {
          function handleRowClick(record) {
            if (chartRef?.current) {
              const chart = chartRef.current;
              refreshChartTooltip(chart, record);
            }
          }

          function refreshChartTooltip(chart, record) {
            chart.series?.forEach((series) => {
              if (hasData(series)) {
                const point = findPoint(series, record);
                if (point && point.colorIndex == undefined ) {
                  showTooltip(chart, point);
                }
              }
            });
          }

          function hasData(series) {
            return series?.data?.length > 0;
          }

          function findPoint(series, record) {
            return series.data.find((point) =>
              point?.["code"] == record?.["code"]
            );
          }

          function showTooltip(chart, point) {
            if (point) {
              chart.tooltip.refresh(point); // Show the tooltip for that point
              chart.hoverPoint = point; // Set the hovered point
              chart.zoomOut();
            }
          }
          return {
            style: {
              cursor: "pointer"
            },
            onClick: () => handleRowClick(record)
          };
        }}
        columns={[
          {
            title: intl?.formatMessage({ id: "Department" }),
            ellipsis: true,
            width: getResponsive({ default: "40%", tablet: "230px", mobile: "230px" }),
            ...!isPreview && ({
              sorter: {
                compare: (a, b) => a?.[isRtl ? "name_ar": "name_en"]?.localeCompare(b?.[isRtl ? "name_ar": "name_en"]),
              }
            }),
            render: (v) => {
              return (
                <Row>
                  <Col
                    style={{
                      flex: "0 0 100%"
                    }}
                    paddingInline={isRtl ? "0px 16px" : "0 16px"}
                  >
                    <Row align="middle" wrap={false} gutter={8}>
                      <Col flex="none">
                        <Avatar
                          size={24}
                          shape="circle"
                          backgroundColor="var(--brand-gold-2)"
                          src={<BuildingOffice color="var(--colorPrimaryBase)" size={14} />}
                        />
                      </Col>
                      <Col flex="none">
                        <Text
                          ellipsis={{
                            tooltip: isRtl ? v?.name_ar : v?.name_en
                          }}
                        >
                          {isRtl ? v?.name_ar : v?.name_en}
                        </Text>
                      </Col>
                    </Row>
                  </Col>
                </Row>
              )
            },
            ...getColumnSearchProps()
          },
          {
            title: intl?.formatMessage({ id: "Tourism Office" }),
            ellipsis: true,
            width: getResponsive({ default: "30%", tablet: "170px", mobile: "230px" }),
            ...!isPreview && ({
              sorter: {
                compare: (a, b) => a?.[isRtl ? "name_ar": "name_en"]?.localeCompare(b?.[isRtl ? "name_ar": "name_en"]),
              }
            }),
            render: (v) => {
              return (
                <Row>
                  <Col
                    style={{
                      flex: "0 0 100%"
                    }}
                    paddingInline={isRtl ? "0px 16px" : "0 16px"}
                  >
                    <Row align="middle" wrap={false} gutter={8}>
                      <Col flex="none">
                        <Text
                          ellipsis={{
                            tooltip: isRtl ? v?.tourism_office_ar : v?.tourism_office_en
                          }}
                        >
                          {isRtl ? v?.tourism_office_ar : v?.tourism_office_en}
                        </Text>
                      </Col>
                    </Row>
                  </Col>
                </Row>
              )
            },
            ...getTourismColumnSearchProps()
          },
          {
            title: tableConfig?.title?.secondColumn || intl?.formatMessage({ id: "Visa Violations" }),
            ...!isPreview && ({
              sorter: {
                compare: (a, b) => a.violations - b.violations,
              },
            }),
            width: getResponsive({ default: "30%", tablet: "160px", mobile: "230px" }),
            render: (v) => {
              const percent = ((v?.violations / sumTotalViolations) * 100)?.toFixed(1);
              return (
                <Row align="middle" gutter={getResponsive({ default: [24], tablet: [0, 0], midTablet: [24], mobile: [0, 0] })}>
                  <Col flex="auto">
                    <Progress
                      strokeColor={"var(--brand-gold-5)"}
                      percent={Number(percent)}
                      showInfo={true}
                      format={() => FormatText([undefined, null]?.includes(v?.violations) ? '-' : formatNumber(v?.violations))}
                    />
                  </Col>
                </Row>
              )
            }
          }
        ]}
        {
          ...data?.length > getResponsive({ default: 8, tablet: 4, midTablet: 6, mobile: 4 }) && {
            scroll: isPreview ? undefined: {
              y: getResponsive({ default: 355, tablet: 344, mobile: 365 }),
            }
          }
        }
        pagination={false}
        dataSource={isPreview ? data?.slice(printRows?.from, printRows?.to) : data}
      />
    </DashboardCard>
  )
  const ele = (printRows) => (
    <DashboardCard
      cardBodyHeight={isPreview ? "auto" : getResponsive({ default: "578px", desktop: "578px", midTablet: "auto" })}
      title={
        <Row gutter={4} align="middle" wrap={false}>
          <Col flex="none">
            {intl?.formatMessage({ id: "Tourist Violations" })}
          </Col>
          <Col flex="none">
            <Tooltip title={intl?.formatMessage({ id: "Details of tourist visa violations organized by Emirate and issuing tourism Department" })}>
              <Info style={{ marginBottom: "3px" }} color="var(--colorIcon)" size={14} weight="bold" />
            </Tooltip>
          </Col>
        </Row>
      }
      icon={resolveTernary(icon, icon, <BuildingOffice />)}
      headerBorder={false}
      cardBodyPadding="0px"
      bodyBackgroundColor={"transparent"}
      bodyWrapStyle={{
        paddingTop: "0px"
      }}
      titleItemsWrapProps={{
        wrap: getResponsive({ default: "false", mobile: "true" }) === "true",
        ...getResponsive({ default: false, mobile: true }) && {
          style: {
            maxWidth: "77%",
            whiteSpace: "pre-wrap"
          }
        }
      }}
    >
      <Row
        isFullHeight
      >
        <Col isFlex>
          {
            !printRows?.from &&
            <Row gutter={[0, themeVariables?.token?.margin]}>
              <Col>
                {
                  resolveTernary(
                    isLoading,
                    (
                      <Skeleton paragraph={{ rows: 1 }} />
                    ),
                    (
                      <Tabs
                        isCustom
                        isPreview={isPreview}
                        carouselButtonStyle={{
                          position: "absolute",
                          top: "-42px",
                          zIndex: 1,
                          ...(
                            resolveTernary(
                              isRtl,
                              {
                                left: 0
                              },
                              {
                                right: 0
                              }
                            ))
                        }}
                        customCardWidth={isRtl ? 205 : undefined}
                        customType={"primary"}
                        activeKey={showBy}
                        onChange={(key) => {
                          setShowBy(key)
                        }}
                        options={
                          (emiratesData || [])?.map((v) => ({
                            key: v?.code,
                            disabled: isPreview || (filter?.emirates?.length && v?.code !== 0 && !filter?.emirates?.includes(v?.code)),
                            children: (
                              <RegionWrap
                                keyLabel={v?.code}
                                label={intl?.formatMessage({ id: isRtl ? v?.["name_ar"] || v?.["nameAr"] : v?.["name_en"] || v?.["nameEn"] })}
                                value={formatNumber(resolveTernary(![undefined, null]?.includes(v?.total), v?.total, "-"))}
                              />
                            )
                          }))
                        }
                      />
                    )
                  )
                }
              </Col>
            </Row>
          }
          <Row isFlexGrow>
            <Col>
              <Row
                gutter={isPreview ? [16, 16] : getResponsive({ default: themeVariables?.token?.margin, desktop: themeVariables?.token?.marginSM, midTablet: [0, 16] })}
                wrap={isPreview ? true : getResponsive({ default: false, midTablet: true })}
                isFullHeight
              >
                {
                  !isPreview &&
                  <Col
                    flex={getResponsive({ default: "0 0 624px", desktop: "0 0 624px", tablet: "0 0 50%", midTablet: "0 0 100%" })}
                  >
                    {tableEle} 
                  </Col>
                }
                {
                  !printRows?.from && !isMapHidden &&
                  <Col
                    flex={isPreview ? "0 0 100%": getResponsive({ default: "0 0 calc(100% - 624px)", desktop: "0 0 calc(100% - 624px)", tablet: "0 0 50%", midTablet: "0 0 100%" })}
                  >
                    <Row isFullHeight>
                      <Col
                        style={{
                          borderRadius: "var(--borderRadiusPx)",
                          border: "1px solid var(--colorSplit)",
                          backgroundColor: "var(--colorBgLayout)",
                          ...getResponsive({ mobile: "true", default: "false" }) === "true" && ({
                            minHeight: "285px"
                          })
                        }}
                        paddingInline={getResponsive({ default: "var(--paddingLGPx)", desktop: "var(--paddingSMPx)" })}
                        paddingBlock={getResponsive({ default: "var(--paddingLGPx)", desktop: "var(--paddingSMPx)" })}
                      >
                        {
                          (isLoading || isLoadingTable)
                            ? <Skeleton paragraph={{ rows: 10 }} />
                            : (
                              getComponent()
                            )
                        }
                      </Col>
                    </Row>
                  </Col>
                }
                {
                  isPreview && !isTableHidden &&
                  <Col>
                    {tableEle} 
                  </Col>
                }
              </Row>
            </Col>
          </Row>
        </Col>
      </Row>
    </DashboardCard>
  );

  return (
    (!isPreview || isPrint || isTableHidden)
      ? ele(printRows)
      : <div
        ref={hiddenContainerRef}
        key={offset}
        style={{
          position: 'absolute',
          visibility: 'hidden',
          top: 0,
          left: 0,
          width: '100%',
          height: 'auto',
          overflow: 'hidden',
          pointerEvents: 'none',
        }}
      >
        {ele(printRows)}
      </div>
  )
}

VisaByRegionAndNationality.propTypes = {
  data: PropTypes.any,
  dateRange: PropTypes?.any,
  isPreview: PropTypes.any,
  space: PropTypes?.any,
  filter: PropTypes.any,
  geoJsonObj: PropTypes.any,
  icon: PropTypes.any,
  isLoading: PropTypes.bool,
  mapTooltipTitle: PropTypes.any,
  setShowBy: PropTypes.func,
  showBy: PropTypes.string,
  tableConfig: PropTypes.object,
  title: PropTypes.string,
  tooltipValueText: PropTypes.any,
  totalMapping: PropTypes.object,
  isPrint: PropTypes.any,
  rows: PropTypes.any,
  offset: PropTypes.any,
  callback: PropTypes.any,
  isTableHidden: PropTypes.any,
  isMapHidden: PropTypes.any,
}
