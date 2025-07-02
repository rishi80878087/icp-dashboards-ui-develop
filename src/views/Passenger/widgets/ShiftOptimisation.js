import PropTypes from "prop-types"
import { Row, Col, Text, Title, theme, PhosphorIcons, Tooltip } from 're-usable-design-components';
import Card from '@/components/Card';
import Stats from '@/components/Stats';
import { useIntl } from "react-intl";
import useResponsive from '@/hooks/useResponsive';
import CountUp from 'react-countup';
import YOy from '@/components/Yoy';
import moment from 'moment';
import useAsync from '@/hooks/useAsync';
import Gauges from '@/components/Gauge';
import { getSummary } from '@/services/passengerService';
import { useEffect, useContext } from 'react';
import { LocaleContext } from '@/globalContext/locale/localeProvider';
import Empty from '@/components/Empty';
import { resolveTernary } from "@/utils/helper";


const { AirplaneInFlight, Suitcase, UserRectangle, Barricade, AirplaneLanding, AirplaneTakeoff, Path, Info } = PhosphorIcons;


const { useToken } = theme;

const getPrimaryStats = ({ getResponsive, intl, isPastDate, isRtl }) => [
  // {
  //   icon: <AirplaneInFlight weight="duotone" size={24} color="var(--orange-6)" />,
  //   iconBackground: "var(--orange-2)",
  //   key: "",
  //   tooltip: intl?.formatMessage({ id: "Total number of Aircraft arriving and departing from the Airport" }),
  //   label: intl?.formatMessage({ id: "Aircraft Activity" }),
  //   backgroundColor: "var(--orange-1)",
  //   getValue: (v) => {
  //     return (
  //       <Row>
  //         <Col>
  //           <Title level={4}>
  //             {
  //               [undefined, null]?.includes(v?.data?.active_aircraft_count)
  //                 ? "-"
  //                 : (
  //                   <CountUp
  //                     end={v?.data?.active_aircraft_count}
  //                   />
  //                 )
  //             }
  //           </Title>
  //         </Col>
  //       </Row>
  //     )
  //   }
  // },
  {
    icon: <Suitcase weight="duotone" size={24} color="var(--blue-6)" />,
    iconBackground: "var(--blue-2)",
    tooltip: intl?.formatMessage({ id: "Expected passengers volume" }),
    key: "",
    label: getResponsive({ default: intl?.formatMessage({ id: isPastDate ? "Passengers Traffic" : "Expected Passengers Traffic" }), bigTablet: intl?.formatMessage({ id: isPastDate ? "Passengers Traffic" : "Expected Passengers" }) }),
    backgroundColor: "var(--blue-1)",
    getValue: (v) => {
      return (
        <Row wrap={false} align="middle" gutter={8}>
          <Col flex="none">
            <Title level={4}>
              {
                [undefined, null]?.includes(v?.data?.total_passengers_volume)
                  ? "-"
                  : (
                    <CountUp
                      end={v?.data?.total_passengers_volume}
                    />
                  )
              }
            </Title>
          </Col>
          {
            ![undefined, null]?.includes(v?.data.total_volume_yoy) &&
            <Col flex="none">
              <YOy value={v?.data.total_volume_yoy} />
            </Col>
          }
        </Row>
      )
    }
  },
  {
    icon: <UserRectangle weight="duotone" size={24} color="var(--brand-gold-6)" />,
    iconBackground: "var(--brand-gold-2)",
    tooltip: intl?.formatMessage({ id: "Passengers expected to pass through the staffed gate from Total expected passengers" }),
    overlayInnerStyle: {
      width: getResponsive({ default: "316px", midTablet: "auto" })
    },
    key: "",
    label: intl?.formatMessage({ id: "Staffed Gate Passengers" }),
    backgroundColor: "var(--brand-gold-1)",
    getValue: (v) => {
      return (
        <Row wrap={false} align="middle" gutter={8}>
          <Col flex="none">
            <Title level={4}>
              {
                [undefined, null]?.includes(v?.data?.number_of_staffed_gate_passengers)
                  ? "-"
                  : (
                    <CountUp
                      end={v?.data?.number_of_staffed_gate_passengers}
                    />
                  )
              }
            </Title>
          </Col>
          {
            ![undefined, null]?.includes(v?.data.staffed_volume_yoy) &&
            <Col flex="none">
              <YOy value={v?.data.staffed_volume_yoy} />
            </Col>
          }
        </Row>
      )
    }
  },
  {
    icon: <Barricade weight="duotone" size={24} color="var(--purple-6)" />,
    iconBackground: "var(--purple-2)",
    tooltip: intl?.formatMessage({ id: "Passengers expected to pass through the E-Gate from total expected passengers" }),
    overlayInnerStyle: {
      width: getResponsive({ default: "316px", midTablet: "auto" })
    },
    tooltipPlacement: getResponsive({ default: isRtl ? "right": "left", midTablet: "top" }),
    key: "",
    label: intl?.formatMessage({ id: "E-Gate Passengers" }),
    backgroundColor: "var(--purple-1)",
    getValue: (v) => {
      return (
        <Row wrap={false} align="middle" gutter={8}>
          <Col flex="none">
            <Title level={4}>
              {
                [undefined, null]?.includes(v?.data.number_of_e_gate_passengers)
                  ? "-"
                  : (
                    <CountUp
                      end={v?.data?.number_of_e_gate_passengers}
                    />
                  )
              }
            </Title>
          </Col>
          {
            [undefined, null]?.includes(v?.data.e_gate_volume_yoy)
              ? null
              : (
                <Col flex="none">
                  <YOy value={v?.data.e_gate_volume_yoy} />
                </Col>
              )
          }
        </Row>
      )
    }
  },
]

const getSecondaryStats = ({ intl }) => [
  {
    icon: <AirplaneLanding weight="duotone" color="var(--brand-gold-6)" size={24} />,
    key: "",
    label: intl?.formatMessage({ id: "Staffed Gate - Arrival" }),
    tooltip: intl?.formatMessage({ id: "Staffed_Gate_Arrival_Tooltip" }),
    getValue: (v) => {
      return (
        <Row wrap={false} align="middle" gutter={8}>
          <Col flex="none">
            <Title level={4}>
              {
                [undefined, null]?.includes(v?.data?.incoming?.number_of_staffed_gate_passengers)
                  ? "-"
                  : (
                    <CountUp
                      end={v?.data?.incoming?.number_of_staffed_gate_passengers}
                    />
                  )
              }
            </Title>
          </Col>
          {
            ![undefined, null]?.includes(v?.data?.incoming?.staffed_volume_yoy) &&
            <Col flex="none">
              <YOy value={v?.data?.incoming?.staffed_volume_yoy} />
            </Col>
          }
        </Row>
      )
    }
  },
  {
    icon: <AirplaneTakeoff weight="duotone" color="var(--brand-gold-6)" size={24} />,
    key: "",
    label: intl?.formatMessage({ id: "Staffed Gate - Departure" }),
    tooltip: intl?.formatMessage({ id: "Staffed_Gate_Departure_Tooltip" }),
    getValue: (v) => {
      return (
        <Row wrap={false} align="middle" gutter={8}>
          <Col flex="none">
            <Title level={4}>
              {
                [undefined, null]?.includes(v?.data?.outgoing?.number_of_staffed_gate_passengers)
                  ? "-"
                  : (
                    <CountUp
                      end={v?.data?.outgoing?.number_of_staffed_gate_passengers}
                    />
                  )
              }
            </Title>
          </Col>
          {
            ![undefined, null]?.includes(v?.data?.outgoing?.staffed_volume_yoy) &&
            <Col flex="none">
              <YOy value={v?.data?.outgoing?.staffed_volume_yoy} />
            </Col>
          }
        </Row>
      )
    }
  },
  // {
  //   icon: <Path weight="duotone" color="var(--brand-gold-6)" size={24} />,
  //   key: "",
  //   label: intl?.formatMessage({ id: "% of Passengers in Transit" }),
  //   tooltip: intl?.formatMessage({ id: "%_of_Passengers_in_Transit_Tooltip" }),
  //   getValue: (v) => {
  //     return (
  //       <Row wrap={false} align="middle" gutter={8}>
  //         <Col flex="none">
  //           <Title level={4}>

  //             {v?.data?.transit_passenger_percentage === undefined || v?.data?.transit_passenger_percentage === null
  //               ? "-"
  //               : `${v?.data?.transit_passenger_percentage}%`
  //             }
  //           </Title>
  //         </Col>
  //       </Row>
  //     )
  //   }
  // },
]


function ShiftOptimisation({ airport, date, volRange, isPastDate }) {
  const themeVariables = useToken();
  const intl = useIntl();
  const getResponsive = useResponsive();
  const { token } = themeVariables;
  const secondaryStats = getSecondaryStats({ intl });
  const [store] = useContext(LocaleContext);
  const isRtl = store?.projectTranslation === "ar";
  const primaryStats = getPrimaryStats({ getResponsive, intl, isPastDate, isRtl });
  const {
    execute: executeGetSummary,
    status: summaryStatus,
    value: summaryValue,
  } = useAsync({ asyncFunction: getSummary });
  useEffect(() => {
    if (airport && date) {
      executeGetSummary({ airport_code: airport?.airport_code, date: moment(date)?.format("YYYY-MM-DD") })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [airport, date])

  const secondaryStatsEle = (
    <Col
      style={{
        backgroundColor: "var(--brand-gold-2)",
        paddingInline: "var(--paddingXXSPx)",
        paddingBlock: "var(--paddingXXSPx)",
        borderRadius: "var(--borderRadiusPx)"
      }}
    >
      <Row gutter={[token?.marginXXS, token?.marginXXS]}>
        {
          secondaryStats?.map((v) => (
            <Col flex={getResponsive({ default: "0 0 50%", mobile: "0 0 100%" })} key={v?.label}>
              <Stats labelSize="sm" labelTextStyle={{ color: "var(--colorTextLabel)" }} labelStyle={getResponsive({ default: {}, midTablet: { minHeight: "44px" }, mobile: {} })} cardBodyPadding="var(--paddingSMPx)" {...v} value={v?.getValue(summaryValue)} />
            </Col>
          ))
        }
      </Row>
    </Col>
  )

  const statsEle = (
    <Col flex={getResponsive({ default: "auto", midTablet:  "0 0 100%" })}>
      <Card
        loading={summaryStatus === "pending" || summaryStatus === "idle"}
        cardBodyMinHeight="292px"
        cardBodyPadding={getResponsive({ default: "var(--paddingPx)", mobile: "var(--paddingSMPx)" })}
      >
        <Row>
          <Col>
            <Row gutter={[0, token?.marginSM]}>
              <Col>
                <Row gutter={[token?.marginSM, token?.margin]}>
                  {
                    primaryStats?.map((v, index) => (
                      <Col flex={getResponsive({ default: "0 0 33.3%", tablet: index === primaryStats?.length - 1 ? "0 0 100%" : "0 0 50%", midTablet: index === primaryStats?.length - 1 ? "0 0 100%" : "0 0 50%", mobile: "0 0 100%" })} key={v?.label}>
                        <Stats {...v} labelTextStyle={{ color: "var(--colorTextLabel)" }} labelSize={isRtl ? "sm" : "normal"} value={v?.getValue(summaryValue)} />
                      </Col>
                    ))
                  }
                </Row>
              </Col>
              {
                getResponsive({ default: "true", tablet: "false", midTablet: "true" }) === "true" &&
                secondaryStatsEle
              }
            </Row>
          </Col>
        </Row>
      </Card>
    </Col>
  )
  return (
    <>
      <Row wrap={getResponsive({ default: false, midTablet: true })} gutter={[getResponsive({ default: token?.margin, midTablet: 0 }), getResponsive({ default: token?.margin })]}>
        <Col flex={getResponsive({ default: "0 0 308px", midTablet: "auto" })}>
          <Card
            loading={summaryStatus === "pending" || summaryStatus === "idle"}
            title={(
              <Row style={{ zIndex: 1, position: "relative" }} justify="space-between" align="middle">
                <Col flex="none">
                  <Text strong>
                    {intl?.formatMessage({ id: isPastDate ? "Passengers Volume" : "Expected Passengers Volume" })}
                  </Text>
                </Col>

                <Col flex="none">
                  <Tooltip
                    title={intl?.formatMessage({ id: "Estimation of passenger count against the capacity of the Airport" })}
                  >
                    <span>
                      <Info style={{ marginBottom: "3px" }} color="var(--colorIcon)" size={14} weight="bold" />
                    </span>
                  </Tooltip>
                </Col>
              </Row>
            )}
            headerPadding={getResponsive({ default: "var(--paddingPx)", mobile: "var(--paddingSMPx)" })}
            size="small"
            cardBodyHeight={getResponsive({ default: "238px", tablet: "258px", mobile: "201px", midTablet: "212px", })}
          >
            <Row isFullHeight>
              <Col>
                {
                  (![undefined, null]?.includes(summaryValue?.data?.guage) && (summaryValue?.data?.guage >= 0 && summaryValue?.data?.guage <= 100))
                    ?
                    <>
                      <div
                        style={{
                          position: "absolute",
                          height: "100%",
                          left: 0,
                          right: 0,
                          margin: "auto",
                          top: getResponsive({ default: "-50px", tablet: "-35px", midTablet: "-40px", mobile: "-50px" }),
                          width: getResponsive({ default: "246px", midTablet: "246px", mobile: "246px" }),
                          display: 'flex',
                          justifyContent: getResponsive({ default: 'center', midTablet: "space-between", mobile: "center" }),
                          alignItems: "center"
                        }}
                        id="shift-optimisation-guage"
                      >
                        <div
                          style={{
                            width: getResponsive({ default: "246px" }),
                            height: "100%",
                            display: "flex"
                          }}
                        >
                          <Gauges
                            min={0}
                            max={100}
                            tickPositions={[0, volRange?.low, volRange?.medium, volRange?.high]}
                            plotBands={[
                              {
                                from: 0,
                                to: volRange?.low,
                                thickness: 20,
                                color: "var(--colorSuccessBase)"
                              },
                              {
                                from: volRange?.low,
                                to: volRange?.medium,
                                thickness: 20,
                                color: "var(--colorWarningBase)"
                              },
                              {
                                from: volRange?.medium,
                                to: volRange?.high,
                                thickness: 20,
                                color: "var(--colorErrorBase)"
                              }
                            ]}
                            values={[
                              {
                                name: 'Score',
                                data: [summaryValue?.data?.guage],
                                dial: {
                                  radius: '80%',
                                  backgroundColor: 'var(--colorText)',
                                  baseWidth: 8,
                                  baseLength: '0%',
                                  rearLength: '0%',
                                  pivot: {
                                    backgroundColor: "var(--colorText)",
                                    radius: 4
                                  }
                                },
                                dataLabels: {
                                  // enabled: false, // Disable data labels
                                  borderColor: null,
                                  useHTML: true,
                                  formatter: function () {
                                    let val = `${summaryValue?.data?.guage}`;
                                    return `<span style="font-weight: 600; font-family: var(--fontFamily); color:var(--colorText); font-size: var(--fontSizePx)"> ${resolveTernary(isRtl, val + '% ', '')}${intl?.formatMessage({ id: "Passengers Volume:" })} ${!isRtl ? ' ' + val + '%' : ''}</span><br/>`
                                  },
                                },
                              },
                              {
                                name: intl?.formatMessage({ id: 'Low' }),
                                color: 'var(--colorSuccessBase)',
                                showInLegend: getResponsive({ default: "true", midTablet: "false", mobile: "true" }) === "true",
                                enableMouseTracking: false,
                                // data: [0], // Dummy data
                                marker: {
                                  enabled: false
                                },
                              }, {
                                name: intl?.formatMessage({ id: 'Medium' }),
                                color: 'var(--colorWarningBase)',
                                showInLegend: getResponsive({ default: "true", midTablet: "false", mobile: "true" }) === "true",
                                enableMouseTracking: false,
                                // data: [0], // Dummy data
                                marker: {
                                  enabled: false
                                },
                              }, {
                                name: intl?.formatMessage({ id: 'High' }),
                                color: 'var(--colorErrorBase)',
                                showInLegend: getResponsive({ default: "true", midTablet: "false", mobile: "true" }) === "true",
                                enableMouseTracking: false,
                                // data: [0], // Dummy data
                                marker: {
                                  enabled: false
                                },
                              }
                            ]}
                          />
                        </div>
                      </div>

                      {
                        getResponsive({ default: "false", midTablet: "true", mobile: "false" }) === "true" &&
                        <div
                          style={{
                            display: "flex",
                            margin: "auto",
                            position: "absolute",
                            ...!isRtl ?
                              {
                                right: 72,
                              }
                              : {
                                left: 72
                              },
                            top: 0,
                            bottom: 0,
                            flexDirection: "column",
                            rowGap: "12px",
                            alignSelf: "flex-end"
                          }}
                        >
                          {
                            ['Low', 'Medium', 'High']?.map((key) => (
                              <Row gutter={token?.marginXS} key={key} align="middle">
                                <Col flex="none">
                                  <div
                                    style={{
                                      width: "6px",
                                      minWidth: "6px",
                                      height: "6px",
                                      minHeight: "6px",
                                      borderRadius: "50%",
                                      backgroundColor: resolveTernary(key?.toLowerCase() === "low", "var(--colorSuccessBase)", resolveTernary(key?.toLowerCase() === "medium", "var(--colorWarningBase)", "var(--colorErrorBase)"))
                                    }}
                                  />
                                </Col>
                                <Col flex="none">
                                  <Text size="sm">
                                    {intl?.formatMessage({ id: key })}
                                  </Text>
                                </Col>
                              </Row>
                            ))
                          }
                        </div>
                      }
                    </>
                    : (
                      <Row isFullHeight>
                        <Col style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                          <Empty description={intl?.formatMessage({ id: isPastDate ? "No data available for passenger volume" : "No forecast data available for passenger volume" })} />
                        </Col>
                      </Row>
                    )
                }
              </Col>
            </Row>
          </Card>
        </Col>
        {
          statsEle
        }
      </Row>
      {
        getResponsive({ default: "false", tablet: "true", midTablet: "false" }) === "true" &&
        <Row
          style={{
            marginTop: "var(--marginSMPx)"
          }}
        >
          <Col>
            <Card
              loading={summaryStatus === "pending" || summaryStatus === "idle"}
              cardBodyPadding={getResponsive({ default: "var(--paddingPx)", mobile: "var(--paddingSMPx)" })}
            >
              {secondaryStatsEle}
            </Card>
          </Col>
        </Row>
      }
    </>
  )
}

ShiftOptimisation.propTypes = {
  airport: PropTypes.any,
  date: PropTypes.any,
  isPastDate: PropTypes.any,
  volRange: PropTypes.any
}

export default ShiftOptimisation;
