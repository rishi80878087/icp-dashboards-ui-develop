import PropTypes from "prop-types"
import SectionCard from '@/components/SectionCard';
import useAsync from '@/hooks/useAsync';
import { getAirportTimeSeries } from '@/services/passengerService';
import { Row, Col, PhosphorIcons, Text, Table, theme } from "re-usable-design-components";
import VolumeStatusTag from '@/components/VolumeStatusTag';
import useResponsive from '@/hooks/useResponsive';
import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import ArrivalDepartureSegment from '@/components/ArrivalDepartureSegment';
import Empty from '@/components/Empty';
import moment from 'moment';
import { formatNumber } from '@/utils/helper';


const { AirplaneLanding, AirplaneTakeoff } = PhosphorIcons;

const { useToken } = theme;


function Widget({ airport, date, isPastDate }) {
  const themeVariables = useToken();
  const { token } = themeVariables;
  const intl = useIntl()
  const [isLoading, setIsLoading] = useState(false)
  const getResponsive = useResponsive();
  
  const [showBy, setShowBy] = useState("ALL")
  const {
    execute: executeGetAirportTimeSeries,
    status: timeSeriesStatus,
    value: timeSeriesValue,
  } = useAsync({ asyncFunction: getAirportTimeSeries });
  
  useEffect(() => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
    }, 400)
  }, [showBy])

  const columns = [
    {
      title: intl?.formatMessage({ id: "Time" }),
      dataIndex: "time",
      width: "74px",
      render: (timeString) => moment(timeString, "HH:mm:ss").format("HH:mm")
    },
    {
      title: intl?.formatMessage({ id: "Manual Gate Passengers Volume" }),
      width: getResponsive({ default: "245px", mobile: "151px" }),
      render: (v) => {
        return (v?.number_of_staffed_gate_passengers !== null && v?.number_of_staffed_gate_passengers !== undefined) ? formatNumber(v?.number_of_staffed_gate_passengers) : "-"
      }
    },
    {
      title: intl?.formatMessage({ id: "Status" }),
      dataIndex: "airport_traffic_status",
      width: "111px",
      render: (text) => <VolumeStatusTag text={text} />
    },
    {
      title: intl?.formatMessage({ id: "Officers Required" }),
      dataIndex: "required_officers_count",
      width: "155px"
    }, 
  ]
  
  useEffect(() => {
    if (airport && date) {
      executeGetAirportTimeSeries({ airport_code: airport?.airport_code, date: moment(date)?.format("YYYY-MM-DD") })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [airport, date])
  
  return (
    <SectionCard
      loading={timeSeriesStatus === "idle" || timeSeriesStatus === "pending" || isLoading}
      title={<div style={{ whiteSpace: "normal" }}>{intl?.formatMessage({ id: isPastDate ? "Staffed Gate Passengers Count" : "Staffed Gate Expected Passengers Count" })}</div>}
      subtitle={intl?.formatMessage({ id: isPastDate ? "Passengers count by time windows" : "Expected passengers count by time windows" })}
      // cardBodyPadding="0px"
      action={<ArrivalDepartureSegment block={getResponsive({ default: false, midTablet: true })} value={showBy} setValue={setShowBy} />}
      content={
        
        !isLoading && (
          <Row gutter={[token?.margin, token?.margin]}>
            {
              (showBy === "ALL" || showBy === "incoming") &&
              <Col style={{ display: "flex", flexDirection: "column" }} span={`${showBy === "ALL" ? getResponsive({ default: 12, tablet: 24 }) : 24}`}>
                <Row>
                  <Col
                    paddingInline="2px"
                  >  
                    <Row
                      style={{
                        backgroundColor: "var(--brand-gold-1)",
                        padding: "var(--paddingSMPx) var(--paddingPx)",
                        borderRadius: "6px 6px 0 0"
                      }}
                      wrap={false}
                      gutter={token?.marginXS}
                      isFlexGrow
                    >
                      <Col flex="none">
                        <AirplaneLanding color={"var(--brand-gold-6)"} size={24} weight="duotone" />
                      </Col>
                      <Col flex="auto">
                        <Text strong>
                          {intl?.formatMessage({ id: isPastDate ? "Staffed Gate - Arrival" : "Staffed Gate - Expected Arrival" })}
                        </Text>
                      </Col>
                    </Row>
                  </Col>
                </Row>
                <Row style={{ minHeight: "200px" }} isFullHeight>
                  <Col>
                    {
                      !timeSeriesValue?.incoming?.length
                        ? (
                          <Row
                            isFullHeight
                          >
                            <Col
                              style={{
                                justifyContent: "center",
                                alignItems: "center",
                                display: "flex"
                              }}
                            >
                              <Empty
                                description={intl?.formatMessage({ id: "No passenger count for staffed gates." })}
                              />
                            </Col>
                          </Row>
                        )
                        : (
                          <Table
                            size="small"
                            tableRowHoverBg="colorBgContainer"
                            style={{ border: "1px solid var(--colorSplit)", borderRadius: "0px 0px 6px 6px" }}
                            loading={timeSeriesStatus === 'pending' || timeSeriesStatus === 'idle'}
                            dataSource={timeSeriesValue?.incoming}
                            columns={columns}
                            borderRadiusOnSides="bottom"
                            // isSplitHidden
                            scroll={{
                              y: 55 * 5,
                            }}
                            pagination={false} // Set pagination based on the number of items
                          />
                        )
                    }
                  </Col>
                </Row>
              </Col>
            }

            {
              (showBy === "ALL" || showBy === "outgoing") &&
              <Col style={{ display: "flex", flexDirection: "column" }} span={`${showBy === "ALL" ? getResponsive({ default: 12, tablet: 24 }) : 24}`}>
                <Row>
                  <Col
                    paddingInline="2px"
                  >
                    <Row
                      style={{
                        backgroundColor: "var(--brand-gold-1)",
                        padding: "var(--paddingSMPx) var(--paddingPx)",
                        borderRadius: "6px 6px 0 0"
                      }}
                      gutter={token?.marginXS}
                      isFlexGrow
                      wrap={false}
                    >
                      <Col flex="none">
                        <AirplaneTakeoff color={"var(--brand-gold-6)"} weight="duotone" size={24} />
                      </Col>
                      <Col flex="none">
                        <Text strong>
                          {intl?.formatMessage({ id: isPastDate ? "Staffed Gate - Departure" : "Staffed Gate - Expected Departure" })}
                        </Text>
                      </Col>
                    </Row>
                  </Col>
                </Row>

                <Row style={{ minHeight: "200px" }} isFullHeight>
                  <Col>
                    {
                      !timeSeriesValue?.outgoing?.length
                        ? (
                          <Row
                            isFullHeight
                          >
                            <Col
                              style={{
                                justifyContent: "center",
                                alignItems: "center",
                                display: "flex"
                              }}
                            >
                              <Empty description={intl?.formatMessage({ id: "No passenger count for staffed gates." })} />
                            </Col>
                          </Row>
                        )
                        : (
                          <Table
                            size="small"
                            tableRowHoverBg="colorBgContainer"
                            style={{ border: "1px solid var(--colorSplit)", borderRadius: "0px 0px 6px 6px" }}
                            loading={timeSeriesStatus === 'pending' || timeSeriesStatus === 'idle'}
                            dataSource={timeSeriesValue?.outgoing}
                            borderRadiusOnSides="bottom"
                            columns={columns}
                            // isSplitHidden
                            scroll={{
                              y: 55 * 5,
                            }}
                            pagination={false} // Set pagination based on the number of items
                          />
                        )
                    }
                  </Col>
                </Row>
              </Col>
            }
          </Row>
        )
        
      }
    />
  )
}

Widget.propTypes = {
  airport: PropTypes.any,
  date: PropTypes.any,
  isPastDate: PropTypes.any
}

export default Widget;
