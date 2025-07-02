import PropTypes from "prop-types"
import {
  Row, Col, Avatar, Text, Title, theme, Table, Progress, Skeleton, Empty,
  InputSearch
} from "re-usable-design-components";
import DashboardCard from "@/components/DashboardCard";
import { useIntl } from "react-intl";
import { LocaleContext } from "@/globalContext/locale/localeProvider";
import Globe from "@/svgr/Globe";
import Image from "next/image";
import useResponsive from "@/hooks/useResponsive";
import MapWrap from '@/components/MapWrap';
import Tabs from "@/components/Tabs";
import Flags from 'country-flag-icons/react/1x1'
import { useState, useMemo, useRef, useContext, useEffect } from "react";
import { formatNumber, continentKeyFlagMapping, continentKeyLabelMapping, getColorFromPercentage, checkRtl, validateInput, resolveTernary } from "@/utils/helper";
import _ from "lodash";
import All_Nationality from "./All_Nationality.png"


const { useToken } = theme;

function AllNationality() {
  return <Image width={24} height={24} alt="flag" src={All_Nationality} />
}

function InputWrap({ onChange, ...props }) {
  const [value, setValue] = useState('');
  return (
    <InputSearch
      value={value}
      onChange={(e) => {
        if (!e?.target?.value) {
          setValue("")
        } else if (validateInput(e?.target?.value)) {
          setValue(e?.target?.value)
        }
      }}
      {...props}
    />
  )
}

InputWrap.propTypes = {
  onChange: PropTypes.any
}

function RegionWrap({ keyLabel, label, value }) {
  const themeVariables = useToken();

  return (
    <Row wrap={false} gutter={themeVariables?.token?.marginSM}>
      <Col flex="none">
        <Avatar size={34} src={continentKeyFlagMapping[keyLabel]} />
      </Col>
      <Col flex="none">
        <Row gutter={[0, 4]}>
          <Col>
            <Text size="sm">
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
  return <Text>{`${v}%`}</Text>
}

function ResidentsByRegionAndNationality({ data: _data, mapTooltipTitle, tooltipValueText, geoJsonObj, showBy = "all", setShowBy = () => { }, title, icon, isLoading = false, totalMapping = {}, tableConfig = {} }) {
  const intl = useIntl();
  const [searchText, setSearchText] = useState('')
  const max = useMemo(() => {
    let _max = (_data || [])?.[0]?.value || 0;

    _data?.forEach((v) => {
      if (v?.value > _max) {
        _max = v?.value;
      }
    })

    return _max;
  }, [_data])

  const data = useMemo(() => {
    if (!searchText?.trim()) {
      return _.cloneDeep(_data);
    }
    return _data?.filter((v) => {
      return v?.label?.toLowerCase()?.includes((searchText)?.toLowerCase())
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText, _data]);

  useEffect(() => {
    if (isLoading) {
      setSearchText('')
    }
  }, [isLoading])

  const getResponsive = useResponsive();
  const [localeStore] = useContext(LocaleContext);
  const chartRef = useRef();
  const themeVariables = useToken();
  const mapStyle = {
    allAreas: false,
    showInLegend: false,
    borderColor: themeVariables?.token?.Map?.Border, // Or use 'none'
    borderWidth: 1,
    states: {
      hover: {
        enabled: true // Disable hover state
      }
    }
  }

  const isRtl = checkRtl(localeStore);

  const dataSource = useMemo(() => {
    if (data?.length) {
      const json = data?.map((v) => {
        const item = geoJsonObj[v["iso-a3"]];
        return ({
          "iso-a3": item?.properties?.["iso-a3"],
          "iso-a2": item?.properties?.["iso-a2"],
          color: getColorFromPercentage({
            percent: (v?.value / max) * 100,
            minColor: "#BAE0FF",
            softCream: "#639AD5",
            midColor: '#3160AC',
            maxColor: '#002C8C'
          }),
          label: v?.label,
          value: v?.value,
          ...item
        })
      });

      return json?.sort((a, b) => b?.value - a?.value)
    }
    return []
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  const regionLabel = continentKeyLabelMapping[showBy];
  const sumValues = totalMapping[resolveTernary(regionLabel === "all", "All", regionLabel)] || 0;

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
      <MapWrap
        valueText={tooltipValueText}
        mapTooltipTitle={mapTooltipTitle}
        onChartLoad={(chart) => {
          chartRef.current = chart;
        }}
        values={[{
          ...mapStyle,
          data: dataSource,
          point: {
            events: {
              mouseOver: handleMouseOver
            }
          },
        }]}
      />
    )
  }

  return (
    <DashboardCard
      cardBodyHeight={getResponsive({ default: "578px", desktop: "578px", midTablet: "auto" })}
      title={intl?.formatMessage({ id: resolveTernary(title, title, "Residents By Region & Nationality") })}
      icon={resolveTernary(icon, icon, <Globe />)}
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
                      customType={"primary"}
                      activeKey={showBy}
                      onChange={(key) => {
                        setShowBy(key)
                      }}
                      options={[
                        {
                          key: "all",
                          children: (
                            <RegionWrap keyLabel="all" label={intl?.formatMessage({ id: "All Nationalities" })} value={formatNumber(resolveTernary(totalMapping?.['All'], totalMapping?.['All'], 0))} />
                          )
                        },
                        {
                          key: "europe",
                          children: (
                            <RegionWrap keyLabel="europe" label={intl?.formatMessage({ id: "Europe" })} value={formatNumber(resolveTernary(totalMapping?.['Europe'], totalMapping?.['Europe'], 0))} />
                          )
                        },
                        {
                          key: "africa",
                          children: (
                            <RegionWrap keyLabel="africa" label={intl?.formatMessage({ id: "Africa" })} value={formatNumber(resolveTernary(totalMapping?.['Africa'], totalMapping?.['Africa'], 0))} />
                          )
                        },
                        {
                          key: "asia",
                          children: (
                            <RegionWrap keyLabel="asia" label={intl?.formatMessage({ id: "Asia" })} value={formatNumber(resolveTernary(totalMapping?.['Asia'], totalMapping?.['Asia'], 0))} />
                          )
                        },
                        {
                          key: "north_america",
                          children: (
                            <RegionWrap keyLabel="north_america" label={intl?.formatMessage({ id: "North America" })} value={formatNumber(resolveTernary(totalMapping?.['North America'], totalMapping?.['North America'], 0))} />
                          )
                        },
                        {
                          key: "south_america",
                          children: (
                            <RegionWrap keyLabel="south_america" label={intl?.formatMessage({ id: "South America" })} value={formatNumber(resolveTernary(totalMapping?.['South America'], totalMapping?.['South America'], 0))} />
                          )
                        },
                        {
                          key: "oceania",
                          children: (
                            <RegionWrap keyLabel="oceania" label={intl?.formatMessage({ id: "Oceania" })} value={formatNumber(resolveTernary(totalMapping?.['Oceania'], totalMapping?.['Oceania'], 0))} />
                          )
                        },
                        {
                          key: "seven_seas",
                          children: (
                            <RegionWrap keyLabel="seven_seas" label={intl?.formatMessage({ id: "Seven seas" })} value={formatNumber(resolveTernary(totalMapping?.['Seven seas (open ocean)'], totalMapping?.['Seven seas (open ocean)'], 0))} />
                          )
                        }
                      ]}
                    />
                  )
                )
              }
            </Col>
          </Row>
          <Row isFlexGrow>
            <Col>
              <Row
                gutter={getResponsive({ default: themeVariables?.token?.margin, desktop: themeVariables?.token?.marginSM, midTablet: [0, 16] })}
                wrap={getResponsive({ default: false, midTablet: true })}
                isFullHeight
              >
                <Col
                  flex={getResponsive({ default: "0 0 546px", desktop: "0 0 442px", tablet: "0 0 337px", midTablet: "0 0 100%" })}
                >
                  <DashboardCard
                    title={intl?.formatMessage({ id: "Country List" })}
                    bodyBackgroundColor="transparent"
                    cardBodyHeight={"auto"}
                    cardBodyPadding={isLoading ? "16px" : "0px"}
                    bordered
                    action={(
                      isLoading
                        ? null
                        : (
                          <InputWrap
                            style={{
                              width: getResponsive({ default: "226px", tablet: "100%", midTablet: "226px", mobile: "100%" })
                            }}
                            size="default"
                            key={isLoading}
                            allowClear
                            onChange={(e) => {
                              if (!e?.target?.value) {
                                setSearchText("")
                              }
                            }}
                            onPressEnter={(val) => {
                              setSearchText(val?.target?.value || '')
                            }}
                            onSearch={(val) => {
                              setSearchText(val || "")
                            }}
                            enterButton
                            placeholder={intl?.formatMessage({ id: "Search" })}
                          />
                        )
                    )}
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
                    loading={isLoading}
                    titleProps={{
                      wrap: getResponsive({ default: false, tablet: true }),
                      gutter: getResponsive({ default: [8], tablet: [0, 8], midTablet: [8], mobile: [0, 8] })
                    }}
                    actionProps={{
                      flex: getResponsive({ default: "none", tablet: "0 0 100%", midTablet: "none", mobile: "0 0 100%" })
                    }}
                  >
                    <Table
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
                              if (point) {
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
                            point?.options?.properties?.["iso-a3"] === record?.["iso-a3"]
                          );
                        }

                        function showTooltip(chart, point) {
                          if (point && !_.isEmpty(point.geometry)) {
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
                          title: intl?.formatMessage({ id: "Nationality" }),
                          width: getResponsive({ default: "265px", desktop: "164px", tablet: "148px", midTablet: "283px", mobile: "132px" }),
                          render: (v) => {
                            const Comp = Flags[v?.["iso-a2"]] || AllNationality;
                            return (
                              <Row>
                                <Col
                                  paddingInline={isRtl ? "0px 16px" : "0 16px"}
                                >
                                  <Row align="middle" wrap={false} gutter={8}>
                                    <Col flex="none">
                                      <Avatar
                                        size={16}
                                        style={{
                                          borderRadius: "4px"
                                        }}
                                        shape="square"
                                        src={<Comp />}
                                      />
                                    </Col>
                                    <Col flex="none">
                                      <Text
                                        ellipsis={{
                                          tooltip: v?.label
                                        }}
                                      >
                                        {v?.label}
                                      </Text>
                                    </Col>
                                  </Row>
                                </Col>
                              </Row>
                            )
                          }
                        },
                        {
                          title: tableConfig?.title?.secondColumn || intl?.formatMessage({ id: "Number of Residents" }),
                          render: (v) => {
                            const percent = (v?.value / sumValues * 100)?.toFixed(1);
                            return (
                              <Row align="middle" gutter={getResponsive({ default: [24], tablet: [0, 0], midTablet: [24], mobile: [0, 0] })}>
                                <Col flex={getResponsive({ default: "0 0 95px", tablet: "0 0 100%", midTablet: "0 0 95px", mobile: "0 0 100%" })}>
                                  <Text>
                                    {[undefined, null]?.includes(v?.value) ? '-' : formatNumber(v?.value)}
                                  </Text>
                                </Col>

                                <Col flex="auto">
                                  <Progress
                                    strokeColor={getColorFromPercentage({
                                      percent: (v?.value / max) * 100,
                                      minColor: "#BAE0FF",
                                      softCream: "#639AD5",
                                      midColor: '#3160AC',
                                      maxColor: '#002C8C'
                                    })}
                                    percent={Number(percent)}
                                    showInfo={true}
                                    format={FormatText}
                                  />
                                </Col>
                              </Row>
                            )
                          }
                        }
                      ]}
                      {
                        ...data?.length > getResponsive({ default: 8, tablet: 4, midTablet: 6, mobile: 4 }) && {
                          scroll: {
                            y: getResponsive({ default: 375, tablet: 344 }),
                          }
                        }
                      }
                      pagination={false}
                      dataSource={data}
                    />
                  </DashboardCard>
                </Col>

                <Col
                  flex={getResponsive({ default: "0 0 calc(100% - 546px)", desktop: "0 0 calc(100% - 442px)", tablet: "0 0 calc(100% - 337px)", midTablet: "0 0 100%" })}
                >
                  <Row isFullHeight>
                    <Col
                      style={{
                        borderRadius: "var(--borderRadiusPx)",
                        border: "1px solid var(--colorSplit)",
                        backgroundColor: "var(--colorBgLayout)",
                        ...getResponsive({ mobile: "true", default: "false" }) === "true" && ({
                          minHeight: "225px"
                        })
                      }}
                      paddingInline={getResponsive({ default: "var(--paddingLGPx)", desktop: "var(--paddingSMPx)" })}
                      paddingBlock={getResponsive({ default: "var(--paddingLGPx)", desktop: "var(--paddingSMPx)" })}
                    >
                      {
                        isLoading
                          ? <Skeleton paragraph={{ rows: 10 }} />
                          : (
                            getComponent()
                          )
                      }
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Col>
          </Row>
        </Col>
      </Row>
    </DashboardCard>
  )
}

ResidentsByRegionAndNationality.propTypes = {
  data: PropTypes.any,
  geoJsonObj: PropTypes.any,
  icon: PropTypes.any,
  isLoading: PropTypes.bool,
  mapTooltipTitle: PropTypes.any,
  setShowBy: PropTypes.func,
  showBy: PropTypes.string,
  tableConfig: PropTypes.object,
  title: PropTypes.string,
  tooltipValueText: PropTypes.any,
  totalMapping: PropTypes.object
}

export default ResidentsByRegionAndNationality;