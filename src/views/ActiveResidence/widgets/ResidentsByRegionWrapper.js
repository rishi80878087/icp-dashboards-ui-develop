import PropTypes from "prop-types"
import {
  Row, Col, Avatar, Text, Title, theme, Table, Progress, Skeleton, Empty,
  AntIcons, Tooltip, PhosphorIcons
} from "re-usable-design-components";
import DashboardCard from "@/components/DashboardCard";
import { useIntl } from "react-intl";
import useWorldGeoJSON from "@/hooks/useWorldGeoJson";
import { LocaleContext } from "@/globalContext/locale/localeProvider";
import { TableFilterDropdown, InputWrap  } from "@/components/TableFilterWidgets";
import Image from "next/image";
import useResponsive from "@/hooks/useResponsive";
import MapWrap from '@/components/MapWrap';
import Globe from "@/svgr/Globe";
import Tabs from "@/components/Tabs";
import Flags from 'country-flag-icons/react/1x1';
import { getEmiratesStatistics, getResidentsByRegion } from "@/services/activeResidenceService";
import useAsync from "@/hooks/useAsync";
import { useState, useMemo, useRef, useContext, useEffect } from "react";
import { formatNumber, getColorFromPercentage, checkRtl, resolveTernary, emiratesFlagMapping } from "@/utils/helper";
import _ from "lodash";


const { useToken } = theme;
const { SearchOutlined } = AntIcons;
const { Info } = PhosphorIcons;

function AllNationalityImage() {
  return <Image width={24} height={24} alt="flag" src={"/All_Nationality.png"} />
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
  return v ? <Text>{`${v}`}</Text> : <Text>-</Text>
}

function RisksByNationality({
  mapTooltipTitle,
  filter,
  tooltipValueText,
  isPreview,
  space,
  isPrint,
  rows,
  offset,
  callback,
  isTableHidden,
  isMapHidden,
}) {
  const { geoJsonObj } = useWorldGeoJSON();
  const intl = useIntl();
  const [showBy, setShowBy] = useState(0)
  const [searchText, setSearchText] = useState(undefined);
  const [appliedSearchText, setAppliedSearchText] = useState(undefined)
  const [localeStore] = useContext(LocaleContext);
  const isRtl = checkRtl(localeStore);
  const [printRows, setPrintRows] = useState(offset ? { from: offset, to: offset + 1 } : rows || { from: 0, to: 1 });
  const hiddenContainerRef = useRef()

  const {
    execute: invokeGetEmirates,
    status: emiratesStatus,
    value: emiratesValue,
  } = useAsync({ asyncFunction: getEmiratesStatistics });

  const {
    execute: invokeGetNationalities,
    status: nationalitiesStatus,
    value: nationalitiesValue,
  } = useAsync({ asyncFunction: getResidentsByRegion });

  const isLoadingTabs = ["idle", "pending"]?.includes(emiratesStatus);
  const isLoading = isLoadingTabs || ["idle", "pending"]?.includes(nationalitiesStatus);

  useEffect(() => {
    invokeGetEmirates({ filters: { ...filter } })

    if (searchText) {
      setSearchText(undefined);
    }
    if (appliedSearchText) {
      setAppliedSearchText(undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  useEffect(() => {
    invokeGetNationalities({ filter: { ...filter, emirate_code: showBy } })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showBy, filter])

  const emiratesList = emiratesValue?.data || [];
  
  const _data = nationalitiesValue?.data;

  const data = useMemo(() => {
    if (!appliedSearchText?.length) {
      return _.cloneDeep(_data);
    }

    return _data?.filter((v) => {
      return appliedSearchText?.includes(v?.[isRtl ? "nationality_ar" : "nationality_en"])
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appliedSearchText, _data]);


  useEffect(()=>{
    console.log('###emiratesValue', emiratesValue);
    console.log('###nationalitiesValue', nationalitiesValue);
    console.log('#printrows', data, _data);
   },[emiratesValue,nationalitiesValue, data, _data])

  useEffect(() => {
    if (isPreview && !isPrint && !["idle", "pending"]?.includes(nationalitiesStatus) && !isTableHidden) {
      setTimeout(() => {
        if (hiddenContainerRef?.current?.offsetHeight) {
          const height = hiddenContainerRef.current.offsetHeight;
          if (height >= space && printRows?.to === 1) {
            callback({ info: { isNextPage: true, printRows: { from: printRows?.from, to: printRows?.to } }});
          } else if (height >= space) {
            callback({ info: { printRows: { from: printRows?.from, to: printRows?.to - 2 } } });
          } else if (printRows?.to >= data?.length) {
            callback({ info: { printRows: { from: printRows?.from, to: printRows?.to, isAllRendered: true } } });
          } else if (height < space) {
            const elementsCount = (Math?.floor((space - 40 - height) / 47) + 2) || 0;
            setPrintRows((v) => ({ ...v, from: printRows?.from, to: v?.to + elementsCount }))
          }
        }
      }, [200]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [printRows, nationalitiesStatus])

  const minMaxValues = useMemo(() => {
    let min = 0;
    let max = 0;
    let count = 0;
    let totalEntries = 0;
    let totalExits = 0
    if (_data?.length) {
      min = _data?.[0]?.count;
      max = _data?.[0]?.count;
      _data?.forEach((v) => {
        count += v?.count;
        totalEntries += v?.entries;
        totalExits += v?.exits;

        if (v?.count < min) {
          min = v?.count;
        }

        if (v?.count > max) {
          max = v?.count;
        }
      })
    }
    return { min, max, count, totalEntries, totalExits };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [_data]);

  const getResponsive = useResponsive();
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


  const dataSource = useMemo(() => {
    if (data?.length) {
      const json = data?.map((v) => {
        const item = geoJsonObj[v["nationality_code"]];
        return ({
          "iso-a3": item?.properties?.["iso-a3"],
          "iso-a2": item?.properties?.["iso-a2"],
          color: getColorFromPercentage({
            percent: ((v?.count / minMaxValues.max) * 100),
          }),
          label: isRtl ? v?.nationality_ar : v?.nationality_en,
          value: v?.count,
          entries: v?.entries,
          exits: v?.exits,
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
              arKey="nationality_ar"
              enKey="nationality_en"
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


  const tableEle = (
    <Col
      flex={isPreview ? "0 0 100%" : getResponsive({ default: "0 0 50%", desktop: "0 0 50%", tablet: "0 0 50%", midTablet: "0 0 100%" })}
    >
      <DashboardCard
        title={intl?.formatMessage({ id: "Country List" })}
        bodyBackgroundColor="transparent"
        cardBodyHeight={"100%"}
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
        isEmpty={!_data?.length}
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
          key={`${appliedSearchText}`}
          className="table-with-total"
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
              title: intl?.formatMessage({ id: "Country" }),
              width: getResponsive({ default: "30%", mobile: "180px" }),
              sorter: {
                compare: (a, b) => a?.label.localeCompare(b?.label),
              },
              render: (v) => {
                const Comp = Flags[v?.["iso-a2"]] || AllNationalityImage;
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
              // ...getColumnSearchProps(),
            },
            {
              title: intl?.formatMessage({ id: "Entries" }),
              width: getResponsive({ default: "18%", mobile: "110px" }),
              sorter: {
                compare: (a, b) => a?.entries - b?.entries,
              },
              render: (v) => (
                <Text
                  ellipsis={{
                    tooltip: formatNumber(v?.entries) || "-"
                  }}
                >
                  {formatNumber(v?.entries) || "-"}
                </Text>
              ),
            },
            {
              title: intl?.formatMessage({ id: "Exits" }),
              width: getResponsive({ default: "18%", mobile: "110px" }),
              sorter: {
                compare: (a, b) => a?.exits - b?.exits,
              },
              render: (v) => (
                <Text
                  ellipsis={{
                    tooltip: formatNumber(v?.exits) || "-"
                  }}
                >
                  {formatNumber(v?.exits) || "-"}
                </Text>
              ),
            },
            {
              title: intl?.formatMessage({ id: "Residents" }),
              width: getResponsive({ default: "34%" }),
              sorter: {
                compare: (a, b) => a?.value - b?.value,
              },
              render: (v) => {
                const percent = Number(((v?.value / minMaxValues.count) * 100)?.toFixed(1));
                const percentOutOfMaxValue = ((v?.value / minMaxValues.max) * 100);
                return (
                  <Row align="middle" gutter={getResponsive({ default: [12], tablet: [0, 0], midTablet: [12], mobile: [0, 0] })}>
                    <Col flex="auto">
                      <Tooltip
                        title={Number(percent) ? `${Number(percent)}%` : "-"}
                      >
                        <Progress
                          strokeColor={getColorFromPercentage({
                            percent: percentOutOfMaxValue,
                          })}
                          percent={Number(percent)}
                          showInfo={true}
                          format={(val) => FormatText(v?.value)}
                        />
                      </Tooltip>
                    </Col>
                  </Row>
                )
              },
            }
          ]}
          scroll={isPreview ? undefined : {
            y: getResponsive({ default: 330, tablet: 330, midTablet: 300, mobile: 330 }),
            x: getResponsive({ default: null, tablet: 600, mobile: 600 })
          }}
          pagination={false}
          dataSource={isPreview ? dataSource?.slice(printRows?.from, printRows?.to) : dataSource}
          footer={() => (
            <Table
              className="table-for-footer"
              isSplitHidden={true}
              scroll={isPreview ? undefined : {
                x: getResponsive({ default: null, mobile: 600 })
              }}
              columns={[
                {
                  width: getResponsive({ default: "30%", mobile: "180px" }),
                  title: intl?.formatMessage({ id: "Total" }),
                },
                {
                  width: getResponsive({ default: "18%", mobile: "110px" }),
                  title: formatNumber(minMaxValues?.totalEntries) || "-"
                },
                {
                  width: getResponsive({ default: "18%", mobile: "110px" }),
                  title: formatNumber(minMaxValues?.totalExits) || "-"
                },
                {
                  width: getResponsive({ default: "34%" }),
                  title: formatNumber(minMaxValues?.count) || "-",
                }
              ]}
            />
            
          )}
        />
      </DashboardCard>
    </Col>
  )
  const mapEle = (
    <Col
      flex={getResponsive({ default: "0 0 50%", desktop: "0 0 50%", tablet: "0 0 50%", midTablet: "0 0 100%" })}
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
                !printRows?.from &&
                getComponent()
              )
          }
          {
            (data?.length || 0) > 0 &&
            <div
              style={{
               
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
        </Col>
      </Row>
    </Col>
  )
  const ele = (printRows) => {
    return (
      <DashboardCard
        cardBodyHeight={getResponsive({ default: "578px", desktop: "578px", midTablet: "auto" })}
        title={
          <Row align="middle" gutter={4}>
            <Col flex="none">
              {intl?.formatMessage({ id: "Residents by Region & Country" })}
            </Col>
            <Col flex="none">
              <Tooltip
                title={intl?.formatMessage({ id: "active_residence_residency_nationality_tooltip" })}
              >
                <span>
                  <Info style={{ marginBottom: "3px" }} color="var(--colorIcon)" size={14} weight="bold" />
                </span>
              </Tooltip>
            </Col>
          </Row>
        }
        icon={<Globe />}
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
                          options={(emiratesList || [])?.map((emirate) => ({
                            key: emirate?.code,
                            disabled: emirate?.code != 0 && filter?.emirate_code?.length ? !(filter?.emirate_code || [])?.includes(emirate?.code) : false,
                            children: <RegionWrap
                              key={emirate?.code}
                              keyLabel={emirate?.code}
                              label={isRtl ? emirate?.name_ar : emirate?.name_en}
                              value={formatNumber(emirate?.total)}
                            />
                          }))}
                        />
                      )
                    )
                  }
                </Col>
              </Row>
            }
            <Row >
              <Col>
                <Row
              
                >
                  {
                    <>
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
    ele(printRows)
     
  )
}

RisksByNationality.propTypes = {
  mapTooltipTitle: PropTypes.any,
  tooltipValueText: PropTypes.any,
  filter: PropTypes.any,
  isPreview: PropTypes.any,
  space: PropTypes.any,
  isPrint: PropTypes.any,
  rows: PropTypes.any,
  offset: PropTypes.any,
  callback: PropTypes.any,
  isTableHidden: PropTypes.any,
  isMapHidden: PropTypes.any,
}

export default RisksByNationality;