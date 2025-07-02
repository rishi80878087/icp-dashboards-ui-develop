import PropTypes from "prop-types"
import {
  Row, Col, Avatar, Text, Title, theme, Table, Progress, Skeleton, Empty, AntIcons
} from "re-usable-design-components";
import DashboardCard from "@/components/DashboardCard";
import { TableFilterDropdown, InputWrap  } from "@/components/TableFilterWidgets";
import { useIntl } from "react-intl";
import { LocaleContext } from "@/globalContext/locale/localeProvider";
import Image from "next/image";
import useResponsive from "@/hooks/useResponsive";
import MapWrap from '@/components/MapWrap';
import Tabs from "@/components/Tabs";
import Flags from 'country-flag-icons/react/1x1';
import { useState, useMemo, useRef, useContext, useEffect } from "react";
import { formatNumber, getColorFromPercentage, checkRtl, resolveTernary, emiratesFlagMapping } from "@/utils/helper";
import _ from "lodash";


const { useToken } = theme;
const { SearchOutlined } = AntIcons;

function AllUAEImage() {
  return <Image width={24} height={24} alt="flag" src={emiratesFlagMapping[0]} />
}

const colorGradients = {
  minColor: "#A9A9A9",
  softCream: "#D9AFA5",
  midColor: "#FA7C7C",
  maxColor: "#F5222D"
}

function RegionWrap({ keyLabel, label, value }) {
  const themeVariables = useToken();

  return (
    <Row wrap={false} gutter={themeVariables?.token?.marginSM}>
      <Col flex="none">
        <Avatar size={34} src={emiratesFlagMapping[keyLabel]} />
      </Col>
      <Col flex="auto">
        <Row gutter={[0, 4]}>
          <Col>
            <Text size="sm" ellipsis={{ tooltip: label }} >
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

function RisksByNationality({
  data: _data, emiratesList = [], mapTooltipTitle, tooltipValueText, geoJsonObj, showBy = 0, setShowBy = () => { }, title, icon, isLoading = false, isLoadingTabs = false, totalCount = 0, tableConfig = {},
  isPreview,
  space,
  isPrint,
  rows,
  offset,
  callback,
  isTableHidden,
  isMapHidden,
  scrollY
}) {
  const intl = useIntl();
  const [searchText, setSearchText] = useState(undefined);
  const [appliedSearchText, setAppliedSearchText] = useState(undefined)
  
  const [printRows, setPrintRows] = useState(offset ? { from: offset, to: offset + 1 } : rows || { from: 0, to: 1 });
  const hiddenContainerRef = useRef()

  const data = useMemo(() => {
    if (!appliedSearchText?.length) {
      return _.cloneDeep(_data);
    }
    return _data?.filter((v) => {
      return appliedSearchText?.includes(v?.label)
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
              arKey="label"
              enKey="label"
              searchText={searchText}
              size="default"
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
    )
    ,
    filterIcon: <SearchOutlined style={{ color: appliedSearchText ? 'var(--colorPrimaryBase)' : undefined }} />,
  });


  const minMaxValues = useMemo(() => {
    let min = 0;
    let max = 0;
    if (data?.length) {
      min = data?.[0]?.value;
      max = data?.[0]?.value;
      data?.forEach((v) => {
        if (v?.value < min) {
          min = v?.value;
        }

        if (v?.value > max) {
          max = v?.value;
        }
      })
    }
    return { min, max };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [_data]);

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

  useEffect(() => {
    if (isPreview && !isPrint && !isLoading && !isTableHidden) {
      setTimeout(() => {
        if (hiddenContainerRef?.current?.offsetHeight) {
          const height = hiddenContainerRef.current.offsetHeight;
          if (height >= space && printRows?.to === 1) {
            callback({ info: { isNextPage: true, printRows: { from: printRows?.from, to: printRows?.to } } });
          } else if (printRows?.to >= data?.length) {
            callback({ info: { printRows: { from: printRows?.from, to: printRows?.to, isAllRendered: true } } });
          } else if (height < space) {
            const elementsCount = (Math?.floor(((space - 47) - height) / 47) + 2) || 0;
            setPrintRows((v) => ({ ...v, from: printRows?.from, to: v?.to + elementsCount }))
          } else if (height >= space) {
            callback({ info: { printRows: { from: printRows?.from, to: printRows?.to - 2 } } });
          }
        }
      }, [800]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [printRows, isLoading])

  const dataSource = useMemo(() => {
    if (data?.length) {
      const json = data?.map((v) => {
        const item = geoJsonObj[v["iso-a3"]];
        return ({
          "iso-a3": item?.properties?.["iso-a3"],
          "iso-a2": item?.properties?.["iso-a2"],
          color: getColorFromPercentage({ percent: ((v?.value / minMaxValues.max) * 100), ...colorGradients }),
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

  const tableEle = (
    <Col
      flex={isPreview ? "0 0 100%" : getResponsive({ default: "0 0 50%", desktop: "0 0 500px", tablet: "0 0 500px", midTablet: "0 0 100%" })}
    >
      <DashboardCard
        title={intl?.formatMessage({ id: "By Nationality" })}
        bodyBackgroundColor="transparent"
        cardBodyHeight={"auto"}
        cardBodyPadding={isLoading ? "16px" : "0px"}
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
          key={appliedSearchText}
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
              width: getResponsive({ default: "50%", mobile: "155px" }),
              ...!isPreview && ({
                sorter: {
                  compare: (a, b) => (a?.label)?.localeCompare(b?.label),
                }
              }),
              render: (v) => {
                const Comp = Flags[v?.["iso-a2"]] || AllUAEImage;
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
              },
              ...getColumnSearchProps()
            },
            {
              title: tableConfig?.title?.secondColumn || intl?.formatMessage({ id: "Total Risks" }),
              width: getResponsive({ default: "50%" }),
              ...!isPreview && ({
                sorter: {
                  compare: (a, b) => (a?.value) - (b?.value),
                }
              }),
              render: (v) => {
                const percent = Number((v?.value / totalCount * 100)?.toFixed(1));
                const percentOutOfMaxValue = ((v?.value / minMaxValues.max) * 100);
                return (
                  <Row align="middle" gutter={getResponsive({ default: [24], tablet: [0, 0], midTablet: [24], mobile: [0, 0] })}>
                    <Col flex={getResponsive({ default: "0 0 80px", mobile: "0 0 60px" })}>
                      <Text
                        ellipsis={{
                          tooltip: v?.value ? formatNumber(v?.value) : '-'
                        }}
                      >
                        {v?.value ? formatNumber(v?.value) : '-'}
                      </Text>
                    </Col>

                    <Col flex="auto">
                      <Progress
                        strokeColor={getColorFromPercentage({ percent: percentOutOfMaxValue, ...colorGradients })}
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
              scroll: isPreview ? undefined : {
                y: scrollY || getResponsive({ default: 375, tablet: 344 }),
                x: getResponsive({ default: null, mobile: 400 })
              }
            }
          }
          pagination={false}
          dataSource={isPreview ? data?.slice(printRows?.from, printRows?.to) : data}
        />
      </DashboardCard>
    </Col>
  )

  const mapEle = (
    <Col
      flex={isPreview ? "0 0 100%" : getResponsive({
        default: "0 0 50%",
        desktop: "0 0 calc(100% - 500px)", tablet: "0 0 calc(100% - 500px)", midTablet: "0 0 100%"
      })}
      style={{
        marginBottom: isPreview ? "16px" : "0px"
      }}
    >
      <Row isFullHeight>
        <Col
          style={{
            borderRadius: "var(--borderRadiusPx)",
            border: "1px solid var(--colorSplit)",
            backgroundColor: "var(--colorBgLayout)",
            ...getResponsive({ mobile: "true", default: "false" }) === "true" && ({
              minHeight: "225px",
              height: '340px'
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
          {
            (data?.length || 0) > 0 &&
            <div
              style={{
                position: "absolute",
                right: 16,
                bottom: 26,
                width: getResponsive({ default: "365px", mobile: "250px" }),
                height: "7px",
                display: "flex",
                justifyContent: "space-between",
                paddingTop: "4px",
                direction: "ltr",
                background: 'linear-gradient(90deg, #F5F5F5 0%, #F5222D 100%)'
              }}
            >
              <span>
                <Text size="sm" strong>
                  {intl?.formatMessage({ id: "Low Risks" })}
                </Text>
              </span>

              <span>
                <Text size="sm" strong>
                  {intl?.formatMessage({ id: "High Risks" })}
                </Text>
              </span>
            </div>
          }
        </Col>
      </Row>
    </Col>
  );

  const ele = (printRows) => {
    return (
      <DashboardCard
        cardBodyHeight={isPreview ? "auto" : getResponsive({ default: "578px", desktop: "578px", midTablet: "auto" })}
        title={title}
        icon={icon}
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
              !printRows?.from && isTableHidden &&
              <Row gutter={[0, themeVariables?.token?.margin]}>
                <Col>
                  {
                    resolveTernary(
                      isLoadingTabs,
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
                          options={emiratesList.map((emirate) => ({
                            key: emirate?.code,
                            children: <RegionWrap
                              key={emirate?.code}
                              keyLabel={emirate?.code}
                              label={isRtl ? emirate?.name_ar : emirate?.name_en}
                              value={emirate?.total > 0 ? formatNumber(emirate?.total) : '-'}
                            />,
                            disabled: emirate?.total <= 0
                          }))}
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
                  gutter={getResponsive({ default: themeVariables?.token?.margin, desktop: themeVariables?.token?.marginSM, midTablet: [0, 16] })}
                  wrap={isPreview ? true: getResponsive({ default: false, midTablet: true })}
                  isFullHeight
                >
                  {
                    isPreview
                      ? <>
                        {
                          !printRows?.from && !isMapHidden &&
                          mapEle
                        }
                        {
                          !isTableHidden &&
                          tableEle
                        }
                      </>
                      : <>
                        {tableEle}
                        {mapEle}
                      </>
                  }
                </Row>
              </Col>
            </Row>
          </Col>
        </Row>
      </DashboardCard>
    )
  }

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

RisksByNationality.propTypes = {
  data: PropTypes.any,
  geoJsonObj: PropTypes.any,
  icon: PropTypes.any,
  isLoading: PropTypes.bool,
  mapTooltipTitle: PropTypes.any,
  setShowBy: PropTypes.func,
  showBy: PropTypes.number,
  tableConfig: PropTypes.object,
  title: PropTypes.object,
  tooltipValueText: PropTypes.any,
  totalMapping: PropTypes.object,

  emiratesList: PropTypes.any,
  isPreview: PropTypes.any,
  space: PropTypes.any,
  isPrint: PropTypes.any,
  rows: PropTypes.any,
  offset: PropTypes.any,
  callback: PropTypes.any,
  isTableHidden: PropTypes.any,
  isMapHidden: PropTypes.any,
  scrollY: PropTypes.any,
  isLoadingTabs: PropTypes.any,
  totalCount: PropTypes.any
}

export default RisksByNationality;