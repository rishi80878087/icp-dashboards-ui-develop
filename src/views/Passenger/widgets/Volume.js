import PropTypes from "prop-types"
import { Row, Col, Text, PhosphorIcons, theme, Divider, Title } from 're-usable-design-components';
import SectionCard from '@/components/SectionCard';
import CountUp from 'react-countup';
import { useIntl } from 'react-intl';
import Card from "@/components/Card"
import Empty from '@/components/Empty';
import Yoy from '@/components/Yoy';
import useResponsive from '@/hooks/useResponsive';
import { getTrafficVolume } from '@/services/passengerService';
import { useEffect, useState } from 'react';
import moment from 'moment';
import useAsync from '@/hooks/useAsync';
import ArrivalDepartureSegment from '@/components/ArrivalDepartureSegment';
import { resolveTernary } from "@/utils/helper";


const { AirplaneLanding, AirplaneTakeoff, Clock } = PhosphorIcons;
const { useToken } = theme;

function getRangeText(v, volRange, intl) {
  if (v?.bar < volRange?.low) {
    return intl?.formatMessage({ id: "Low" })
  }

  if (v?.bar < volRange?.medium) {
    return intl?.formatMessage({ id: "Medium" })
  }

  return intl?.formatMessage({ id: "High" });
}

function getRangeColor(v, volRange) {
  if (v?.bar < volRange?.low) {
    return "var(--colorSuccessBase)"
  }
  if (v?.bar < volRange?.medium) {
    return "var(--colorWarningBase)"
  }
  return "var(--colorErrorBase)"
}

function Widget({ airport, date, volRange, isPastDate }) {
  const themeVariables = useToken();
  const getResponsive = useResponsive();
  const intl = useIntl();
  const [showBy, setShowBy] = useState("ALL")
  const {
    execute: executeTrafficVolume,
    status: volumeStatus,
    value: volumeValue,
  } = useAsync({ asyncFunction: getTrafficVolume });
  
  const shiftArrayArrival = (volumeValue?.incoming || [])?.map((v) => {
    return {
      name: v?.shift_name,
      number: v?.shift_number,
      duration: `${moment(v?.shift_starting_time, "HH:mm:ss").format("HH:mm")} - ${moment(v?.shift_ending_time, "HH:mm:ss").format("HH:mm")}`,
      officersRequired: v?.required_officers_count,
      "predictedPassengersVolume": v?.number_of_staffed_gate_passengers,
      "predictedYOY": v?.staffed_yoy,
      bar: v?.staffed_guage
    }
  });


  const shiftArrayDeparture = (volumeValue?.outgoing || [])?.map((v) => {
    return {
      name: v?.shift_name,
      number: v?.shift_number,
      duration: `${moment(v?.shift_starting_time, "HH:mm:ss").format("HH:mm")} - ${moment(v?.shift_ending_time, "HH:mm:ss").format("HH:mm")}`,
      officersRequired: v?.required_officers_count,
      "predictedPassengersVolume": v?.number_of_staffed_gate_passengers,
      "predictedYOY": v?.staffed_yoy,
      bar: v?.staffed_guage
    }
  });

  useEffect(() => {
    if (airport && date) {
      executeTrafficVolume({ airport_code: airport?.airport_code, date: moment(date)?.format("YYYY-MM-DD") })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [airport, date])

  const getShiftItem = (v, index) => {
    return (
      <Row
        gutter={[themeVariables?.token?.paddingXS, themeVariables?.token?.paddingXS]}
      >
        <Col>
          <Row align="middle" gutter={themeVariables?.token?.marginXS}>
            <Col style={{ display: "flex" }} flex="none">
              <Clock weight="bold" size={18} color="var(--brand-gold-6)" />
            </Col>
            <Col flex="none">
              <Text strong>{`${intl?.formatMessage({ id: "Shift" })} ${v?.number}`}</Text>
            </Col>
            <Col flex="none">
              <Divider type="vertical" />
            </Col>
            <Col flex="none">
              <Text size="sm" color="var(--colorTextDescription)" >{v?.duration}</Text>
            </Col>
          </Row>
        </Col>

        <Col>
          <Row>
            <Col>
              <Text color="var(--colorTextDescription)">
                {intl?.formatMessage({ id: "Officers Required" })}
              </Text>
            </Col>
            <Col>
              <Title level={getResponsive({ default: 4, bigTablet: 5, tablet: 4 })}>
                {v?.officersRequired}
              </Title>
            </Col>
          </Row>
        </Col>

        <Col>
          <Divider />
        </Col>

        <Col>
          <Row>
            <Col>
              <Text
                size="sm"
                color="var(--colorTextDescription)"
              >
                {intl?.formatMessage({ id: resolveTernary(isPastDate, "Passengers Volume", "Predicted Passengers Volume") })}
              </Text>
            </Col>
            <Col>
              <Row
                align="middle"
                gutter={4}
              >
                <Col
                  flex="none"
                >
                  <Title
                    level={getResponsive({ default: 4, bigTablet: 5, tablet: 4 })}
                  >
                    <CountUp
                      end={v?.predictedPassengersVolume}
                    />
                  </Title>
                </Col>
                <Col
                  flex="none"
                >
                  <Yoy value={v?.predictedYOY} />
                </Col>
              </Row>
            </Col>
          </Row>
        </Col>

        <Col>
          <Divider />
        </Col>

        <Col>
          <Row
            gutter={[0, 8]}
          >
            <Col textAlign="center">
              {
                getRangeText(v, volRange, intl)
              }
            </Col>

            <Col
              isFlex
              style={{
                height: getResponsive({ default: "188px", tablet: "133px" }),
                backgroundColor: "var(--colorSplit)",
                borderRadius: "6px 6px 0 0",
                justifyContent: "flex-end"
              }}
            >
              <div
                style={{
                  height: `${v?.bar}%`,
                  borderRadius: "6px 6px 0 0",
                  background: "url(/chart_bg.png)",
                  backgroundRepeat: "repeat",
                  backgroundSize: "cover",
                  backgroundColor: getRangeColor(v, volRange),
                }}
              />
            </Col>
          </Row>
        </Col>
      </Row>
    )
  }

  return (
    <SectionCard
      loading={volumeStatus === "pending" || volumeStatus === "idle"}
      title={intl?.formatMessage({ id: resolveTernary(isPastDate, "Passengers Volume", "Expected Passengers Volume") })}
      subtitle={<div style={{ whiteSpace: "normal" }}>{intl?.formatMessage({ id: "Shift wise volume of expected passengers to pass through staffed gate" })}</div>}
      action={<ArrivalDepartureSegment block={getResponsive({ default: false, midTablet: true })} setValue={setShowBy} value={showBy} />}
      content={(
        <Row gutter={[getResponsive({ default: themeVariables?.token?.margin, tablet: 0 }), themeVariables?.token?.margin]}>
          {
            (showBy === "ALL" || showBy === "incoming") &&
            <Col flex={getResponsive({ default: `0 0 ${resolveTernary(showBy === "ALL", "50%", "100%")}`, tablet: "0 0 100%" })}> 
              <Card
                bordered={true}
                headStyle={{
                  backgroundColor: "var(--brand-gold-1)",
                  padding: "var(--paddingSMPx) var(--paddingPx)",
                  minHeight: "48px"
                }}
                cardBodyPadding={getResponsive({ default: "var(--paddingPx)", tablet: "var(--paddingSMPx)" })}
                cardBodyMinHeight={getResponsive({ default: "413px", tablet: "0px" })}
                title={(
                  <Row style={{ whiteSpace: "normal" }} wrap={false} gutter={themeVariables?.token?.marginXS}>
                    <Col flex="none">
                      <AirplaneLanding weight="duotone" size={24} color="var(--brand-gold-6)" />
                    </Col>
                    <Col flex="auto">
                      <Title level={5}>
                        {intl?.formatMessage({ id: isPastDate ? "Staffed Gate - Arrival" : "Staffed Gate - Expected Arrival" })}
                      </Title>
                    </Col>
                  </Row>
                )}
              >
                <Row wrap={getResponsive({ default: false, mobile: true })} gutter={[getResponsive({ default:themeVariables?.token?.margin, tablet: themeVariables?.token?.marginLG, mobile: 0 }), themeVariables?.token?.margin]}>
                  {
                    !shiftArrayArrival?.length
                      ? (
                        <Col style={{ height: "calc(413px - 32px)", display: "flex", alignItems: 'center', justifyContent: "center" }}><Empty description={intl?.formatMessage({ id: isPastDate ? "Arrival data unavailable" : "Expected arrival data unavailable" })} /></Col>
                      )
                      : (
                        shiftArrayArrival?.map((v, index) => (
                          <Col key={v?.number} style={{ borderLeft: index > 0 ? getResponsive({ default: "none", mobile: "none", tablet: "1px solid var(--colorSplit)" }) : "none", borderBottom: index < shiftArrayArrival?.length - 1 ? getResponsive({ default: "none", tablet: "1px solid var(--colorSplit)" }) : "none", paddingBlock: getResponsive({ default: "0px", mobile: index < shiftArrayArrival?.length - 1 ? "var(--paddingSMPx) var(--paddingLGPx)": "var(--paddingSMPx) var(--paddingSMPx)" }) }} flex={getResponsive({ default: `0 0 ${(100 / shiftArrayArrival?.length)}%`, mobile: "0 0 100%" })}>
                            {getShiftItem(v, index)}
                          </Col>
                        ))
                      )
                  }
                </Row>
              </Card>
            </Col>
          }
          {
            (showBy === "ALL" || showBy === "outgoing") &&
            <Col flex={getResponsive({ default: `0 0 ${showBy === "ALL" ? "50%" : "100%"}`, tablet: "0 0 100%" })}> 
              <Card
                bordered={true}
                headStyle={{
                  backgroundColor: "var(--brand-gold-1)",
                  padding: getResponsive({ default: "var(--paddingSMPx) var(--paddingPx)", mobile: "var(--paddingSMPx)" }),
                  minHeight: "48px",
                  whiteSpace: "prewrap"
                }}        
                title={(
                  <Row style={{ whiteSpace: "normal" }} wrap={false} gutter={themeVariables?.token?.marginXS}>
                    <Col flex="none">
                      <AirplaneTakeoff weight="duotone" size={24} color="var(--brand-gold-6)" />
                    </Col>
                    <Col flex="auto">
                      <Title level={5}>
                        {intl?.formatMessage({ id: isPastDate ? "Staffed Gate - Departure" : "Staffed Gate - Expected Departure" })}
                      </Title>
                    </Col>
                  </Row>
                )}
                cardBodyMinHeight={getResponsive({ default: "413px", tablet: "0px" })}
              >
                <Row wrap={getResponsive({ default: false, mobile: true })} gutter={[getResponsive({ default: themeVariables?.token?.margin, tablet: themeVariables?.token?.marginLG, mobile: 0 }), themeVariables?.token?.margin]}>
                  {
                    resolveTernary(
                      !shiftArrayDeparture?.length,
                      <Col style={{ height: "calc(413px - 32px)", display: "flex", alignItems: 'center', justifyContent: "center" }}><Empty description={intl?.formatMessage({ id: isPastDate ? "Departure data unavailable" : "Expected departure data unavailable" })} /></Col>,
                      (
                        shiftArrayDeparture?.map((v, index) => (
                          <Col key={v?.number} style={{  borderLeft: index > 0 ? getResponsive({ mobile: "none", default: "none", tablet: "1px solid var(--colorSplit)" }) : "none", borderBottom: index < shiftArrayDeparture?.length - 1 ? getResponsive({ default: "none", tablet: "1px solid var(--colorSplit)" }) : "none", paddingBlock: getResponsive({ default: "0px", mobile: index < shiftArrayDeparture?.length - 1 ? "var(--paddingSMPx) var(--paddingLGPx)": "var(--paddingSMPx) var(--paddingSMPx)" }) }} flex={getResponsive({ default: `0 0 ${(100 / shiftArrayDeparture?.length)}%`, mobile: "0 0 100%" })}>
                            {getShiftItem(v, index)}
                          </Col>
                        ))
                      )
                    )
                  }
                </Row>
              </Card>
            </Col>
          }
        </Row>
      )}
    />
  )
}

Widget.propTypes = {
  airport: PropTypes.any,
  date: PropTypes.any,
  isPastDate: PropTypes.any,
  volRange: PropTypes.any
}

export default Widget;
