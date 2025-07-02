import React, { useContext, useEffect, useMemo, useState, useRef } from "react";
import PropTypes from "prop-types"
import { useIntl } from "react-intl";
import { Row, Col, theme, Table, Tooltip, Progress, Text, AntIcons } from "re-usable-design-components";
import DashboardCard from "@/components/DashboardCard";
import useResponsive from "@/hooks/useResponsive";
import { TableFilterDropdown, InputWrap  } from "@/components/TableFilterWidgets";
import { checkRtl, getColorFromPercentage, formatNumber } from "@/utils/helper";
import { LocaleContext } from "@/globalContext/locale/localeProvider";
import useAsync from "@/hooks/useAsync";
import { getRiskByTypes } from "@/services/riskDashboardService";


const { useToken } = theme;
const { SearchOutlined } = AntIcons;

const colorGradients = {
  minColor: "#A9A9A9",
  softCream: "#D9AFA5",
  midColor: "#FA7C7C",
  maxColor: "#F5222D"
}

function FormatText(v) {
  return <Text>{`${v}%`}</Text>
}

function RisksByType({
  icon,
  title,
  filter,
  dateRange,
  isPreview,
  space,
  isPrint,
  rows,
  offset,
  callback
}) {
  const intl = useIntl();
  const [localeStore] = useContext(LocaleContext);
  const [printRows, setPrintRows] = useState(offset ? { from: offset, to: offset + 1 } : rows || { from: 0, to: 1 });
  const hiddenContainerRef = useRef()
  const [searchText, setSearchText] = useState(undefined);
  const [appliedSearchText, setAppliedSearchText] = useState(undefined)
  
  const themeVariables = useToken();
  const isRtl = checkRtl(localeStore);
  const getResponsive = useResponsive()
  const {
    execute: invokeApi,
    status: apiStatus,
    value,
  } = useAsync({ asyncFunction: getRiskByTypes });

  const _data = value?.data?.risk_types;

  const data = useMemo(() => {
    if (!appliedSearchText?.length) {
      return _.cloneDeep(_data);
    }
    return _data?.filter((v) => {
      return appliedSearchText?.includes(v?.[isRtl ? "risk_type_ar" : "risk_type_en"])
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appliedSearchText, _data]);

  useEffect(() => {
    if (searchText) {
      setSearchText(undefined)
    }
    if (appliedSearchText) {
      setAppliedSearchText(undefined)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter])
  
  useEffect(() => {
    invokeApi({ filter: { ...filter, ...dateRange} });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, dateRange]);
  const sumTotal = value?.data?.total_count || 0;

  const minMaxValues = useMemo(() => {
    let min = 0;
    let max = 0;
    if (value?.data?.total_count > 0 && Array.isArray(value?.data?.risk_types)) {
      min = value.data.risk_types[0].count;
      max = value.data.risk_types[0].count;
      for (const v of value.data.risk_types){
        if (v?.count < min) {
          min = v?.count;
        }
    
        if (v?.count > max) {
          max = v?.count;
        }
      };
    }
    return { min, max };
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value?.data?.risk_types]);

  const isLoading = ["pending", "idle"]?.includes(apiStatus);

  useEffect(() => {
    if (isPreview && !isPrint && !isLoading) {
      setTimeout(() => {
        if (hiddenContainerRef?.current?.offsetHeight) {
          const height = hiddenContainerRef.current.offsetHeight;
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
  }, [printRows, isLoading])

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
              arKey="risk_type_en"
              enKey="risk_type_en"
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
    ),
    filterIcon: <SearchOutlined style={{ color: appliedSearchText ? 'var(--colorPrimaryBase)' : undefined }} />,
  });

  const ele = (printRows) => {
    return (
      <DashboardCard
        bodyBackgroundColor="transparent"
        cardBodyHeight={"calc(100% - 67px)"}
        title={title}
        icon={icon}
        style={{
          height: "auto",
          width: "100%"
        }}
        cardBodyPadding={isLoading ? "var(--paddingPx)" : "0px"}
        loading={isLoading}
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
          gutter={isPreview ? [0, 12] : getResponsive({
            default: themeVariables?.token?.marginLG,
            desktop: themeVariables?.token?.marginSM,
            tablet: [0, themeVariables?.token?.marginSM],
          })}
        >
          <Col span={getResponsive({ default: 24, tablet: 24 })}>
            <DashboardCard
              bodyBackgroundColor="transparent"
              cardBodyHeight={"auto"}
              cardBodyPadding={"0px"}
              bordered
              style={{
                height: "100%"
              }}
              headStyle={{
                display: "none"
              }}
              bodyWrapStyle={{
                padding: "0px"
              }}
            >
              <Table
                key={`${appliedSearchText}`}
                borderRadiusOnSides={getResponsive({ default: data?.length > 6 ? "all" : "top", midTablet: data?.length > 6 ? "all" : "top", mobile: data?.length > 4 ? "all" : "top" })}
                columns={[
                  {
                    title: intl?.formatMessage({ id: "Risk Type" }),
                    width: getResponsive({ default: "50%", mobile: "274px" }),
                    ...!isPreview && ({
                      sorter: {
                        compare: (a, b) => a?.[isRtl ? "risk_type_ar" : "risk_type_en"].localeCompare(b?.[isRtl ? "risk_type_ar" : "risk_type_en"]),
                      }
                    }),
                    render: (v) => {
                      return (
                        <Row>
                          <Col
                            paddingInline={isRtl ? "0px 16px" : "0 16px"}
                          >
                            <Row align="middle" wrap={false} gutter={8}>
                              <Col flex="none">
                                <Text
                                  ellipsis={{
                                    tooltip: isRtl ? v?.risk_type_ar : v?.risk_type_en
                                  }}
                                >
                                  {isRtl ? v?.risk_type_ar : v?.risk_type_en}
                                </Text>
                              </Col>
                            </Row>
                          </Col>
                        </Row>
                      )
                    },
                    ...getColumnSearchProps(),
                    footer: intl?.formatMessage({ id: "Total" })

                  },
                  {
                    title: intl?.formatMessage({ id: "Total Number of Risks Percent" }),
                    width: getResponsive({ default: "50%", mobile: "274px" }),
                    ...!isPreview && ({
                      sorter: {
                        compare: (a, b) => a?.count - b?.count,
                      }
                    }),
                    render: (v) => {
                      const percent = Number(((v?.count / sumTotal ) * 100 )?.toFixed(1)) || 0;
                      const percentOutOfMaxValue = v?.count / minMaxValues.max * 100;
                      return (
                        <Row align="middle" gutter={getResponsive({ default: [24], tablet: [0, 0], midTablet: [24], mobile: [0, 0] })}>
                          <Col flex={getResponsive({ default: "0 0 80px",
                          })}>
                            <Text
                              ellipsis={{
                                tooltip: v?.count
                              }}
                            >
                              {formatNumber(v.count)}
                            </Text>
                          </Col>
                          <Col flex={getResponsive({ default: "0 0 283px", tablet: "0 0 180px", midTablet: "0 0 180px", mobile: "0 0 180px" })}>
                            <Tooltip
                              title={`${percent}%`}
                            >
                              <Progress
                                strokeColor={getColorFromPercentage({ percent:
                                percentOutOfMaxValue, ...colorGradients })}
                                percent={percent}
                                showInfo={true}
                                format={() => FormatText([undefined, null]?.includes(v?.count) ? '-' : percent)}
                              />
                            </Tooltip>
                          </Col>
                        </Row>
                      )
                    },
                    footer: sumTotal ? formatNumber(sumTotal): 0
                  }
                ]}
                {
                  ...data?.length > getResponsive({ default: 8, tablet: 4, midTablet: 6, mobile: 4 }) && {
                    scroll: isPreview ? undefined : {
                      y: getResponsive({ default: 368 }),
                      x: getResponsive({ default: null, mobile: 688 })
                    }
                  }
                }
                pagination={false}
                dataSource={isPreview ? data?.slice(printRows?.from, printRows?.to) : data}
                footer={() => (
                  <Row
                    gutter={getResponsive({ default: 0, tablet: 0, midTablet: 0, mobile: 0 })}
                  >
                    <Col flex="0 0 50%">
                      <Text
                        style={{
                          fontSize: "var(--fontSizeSM)",
                          fontWeight: 600,
                          color: "var(--colorTextPrimary)",
                        }}
                      >
                        {intl?.formatMessage({ id: "Total" })}
                      </Text>
                    </Col>
                    <Col flex="0 0 50%"
                      style={{
                        paddingLeft: getResponsive({ default: isRtl?null:"11px" }),
                        paddingRight: getResponsive({ default: isRtl?"10px":null }),
                        textAlign: getResponsive({ default: isRtl?"right":"left", mobile: isRtl?"left":"right"})
                      }}>
                      <Text
                        style={{
                          fontSize: "var(--fontSizeSM)",
                          fontWeight: 600,
                          color: "var(--colorTextPrimary)",
                        }}
                      >
                        {formatNumber(sumTotal)}
                      </Text>
                    </Col>
                  </Row>
                )}
              />
            </DashboardCard>
          </Col>
        </Row>
      </DashboardCard>
    )
  }

  return (
    (!isPreview || isPrint)
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

RisksByType.propTypes = {
  filter: PropTypes.any,
  icon: PropTypes.any,
  title: PropTypes.any,
  dateRange: PropTypes.any,
  isPreview: PropTypes.any,
  space: PropTypes.any,
  isPrint: PropTypes.any,
  rows: PropTypes.any,
  offset: PropTypes.any,
  callback: PropTypes.any,
}

export default RisksByType;
