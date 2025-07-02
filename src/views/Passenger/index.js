import PropTypes from "prop-types"
import { Row, Col, Text, Title, theme, Select, PhosphorIcons, DatePicker, Button } from 're-usable-design-components';
import { DailyAnalysis, ShiftOptimisation, StaffGateCount, Volume } from "./widgets"
import { useState, useContext } from 'react';
import { LocaleContext } from "@/globalContext/locale/localeProvider";
import dayjs from 'dayjs';
import { useIntl } from "react-intl";
import Segmented from '@/components/Segmented';
import useResponsive from '@/hooks/useResponsive';
import weekday from 'dayjs/plugin/weekday';
import localeData from 'dayjs/plugin/localeData'; // Import the localeData plugin
import localizedFormat from 'dayjs/plugin/localizedFormat'; // Optional for formatting
import customParseFormat from 'dayjs/plugin/customParseFormat';
import PageSectionsScrollWrap from '@/components/PageSectionsScrollWrap';
import { resolveTernary } from "@/utils/helper";

// Extend dayjs with the necessary plugins
dayjs.extend(localeData);
dayjs.extend(localizedFormat);
dayjs.extend(weekday);
dayjs.extend(customParseFormat);


const { useToken } = theme;
const { CalendarCheck, CalendarBlank } = PhosphorIcons;

const disabledDate = (current) => {
  // Can not select days before today and today
  return current?.isAfter(dayjs()?.add("2", "day").endOf('day'));
};



function Passenger({ configValue }) {
  const themeVariables = useToken();
  const { token } = themeVariables;
  const [store] = useContext(LocaleContext);
  const getResponsive = useResponsive();
  const [state, setState] = useState({ airport: configValue?.airports?.[0], date: dayjs()?.format("YYYY-MM-DD") })
  const intl = useIntl();
  const isPastDate = dayjs(state?.date)?.isBefore(dayjs(), 'day');

  const isRtl = store?.projectTranslation === "ar";

  const scrollableElements = (
    <>
      <Col>
        <ShiftOptimisation isPastDate={isPastDate} volRange={configValue?.volRange} airport={state?.airport} date={state?.date} />
      </Col>

      <Col>
        <Volume airport={state?.airport} date={state?.date} isPastDate={isPastDate} volRange={configValue?.volRange} />
      </Col>

      <Col>
        <DailyAnalysis airport={state?.airport} date={state?.date} />
      </Col>

      <Col>
        <StaffGateCount isPastDate={isPastDate} airport={state?.airport} date={state?.date} />
      </Col>
    </>
  )

  return (
    <Row
      isFullHeight
    >
      <Col
        isFlex
      >

        <Row
          gutter={[token?.marginSM, token?.marginSM]}
        >
          <Col>
            <Row align="middle" justify="space-between" gutter={[token?.marginSM, token?.marginSM]}>
              <Col
                flex={getResponsive({ default: "none", midTablet: "1 1 auto" })}
                {
                  ...getResponsive({ default: false, midTablet: true }) && {
                    style: {
                      width: "100%"
                    }
                  }
                }
              >
                <Title level={getResponsive({ default: 4, mobile: 5 })}>{intl.formatMessage({ id: "Passenger Forecasting for Shift Optimisation" })}</Title>
              </Col>

              <Col
                flex={getResponsive({ default: "none", midTablet: "1 1 auto" })}
                {
                  ...getResponsive({ default: false, midTablet: true }) && {
                    style: {
                      width: "100%"
                    }
                  }
                }
              >
                <Row style={{ position: "relative" }} align="middle" gutter={getResponsive({ default: themeVariables?.token?.marginSM, midTablet: themeVariables?.token?.marginXS })}>
                  <Col flex="none">
                    <Select
                      size="middle"
                      placeholder={intl?.formatMessage({ id: "Select" })}
                      value={state?.airport?.airport_code}
                      onChange={(v) => {
                        const _airport = configValue?.airports?.find((airport) => airport?.airport_code === v)
                        setState((val) => ({
                          ...val,
                          airport: _airport
                        }))
                      }}
                      options={configValue?.airports?.map((v) => ({ value: v?.airport_code, label: v?.airport_code }))}
                    />
                  </Col>

                  <Col
                    flex="none"
                    {...(getResponsive({ default: "false", tablet: "true", midTablet: "false" }) === "true") && ({
                      style: {
                        ...isRtl ? {
                          marginLeft: "46px"
                        }
                          : {
                            marginRight: "46px"
                          }
                      }
                    })}
                  >
                    {
                      !getResponsive({ default: false, tablet: true })
                        ? (
                          <Segmented
                            isSelectedBold
                            size="default"
                            onChange={(v) => {
                              setState((val) => ({
                                ...val,
                                date: v
                              }))
                            }}
                            value={state?.date}
                            options={[
                              {
                                label: <Text>{intl?.formatMessage({ id: "Today" })}</Text>,
                                value: dayjs()?.format("YYYY-MM-DD"),
                                icon: resolveTernary(state?.date === dayjs()?.format("YYYY-MM-DD"), <CalendarCheck weight="bold" />, <CalendarBlank weight="bold" />)
                              },
                              {
                                label: <Text>{dayjs()?.add("1", "day")?.format("DD MMM")}</Text>,
                                value: dayjs()?.add("1", "day")?.format("YYYY-MM-DD"),
                                icon: resolveTernary(state?.date === dayjs()?.add("1", "day")?.format("YYYY-MM-DD"), <CalendarCheck weight="bold" />, <CalendarBlank weight="bold" />)
                              },
                              {
                                label: <Text>{dayjs()?.add("2", "day")?.format("DD MMM")}</Text>,
                                value: dayjs()?.add("2", "day")?.format("YYYY-MM-DD"),
                                icon: resolveTernary(state?.date === dayjs()?.add("2", "day")?.format("YYYY-MM-DD"), <CalendarCheck weight="bold" />, <CalendarBlank weight="bold" />)
                              }
                            ]}
                          />
                        )
                        : (
                          <Select
                            size="middle"
                            placeholder={intl?.formatMessage({ id: "Select" })}
                            value={isPastDate ? undefined : state?.date}
                            onChange={(v) => {
                              setState((val) => ({
                                ...val,
                                date: v
                              }))
                            }}
                            options={[
                              {
                                label: <Row gutter={4} align="middle">
                                  <Col style={{ display: "flex" }} flex="none">
                                    {state?.date === dayjs()?.format("YYYY-MM-DD") ? <CalendarCheck /> : <CalendarBlank />}
                                  </Col>
                                  <Col flex="none">{intl?.formatMessage({ id: "Today" })}</Col>
                                </Row>,
                                value: dayjs()?.format("YYYY-MM-DD"),
                              },
                              {
                                label: <Row gutter={4} align="middle">
                                  <Col style={{ display: "flex" }} flex="none">
                                    {state?.date === dayjs()?.add("1", "day")?.format("YYYY-MM-DD") ? <CalendarCheck /> : <CalendarBlank />}
                                  </Col>
                                  <Col flex="none">{dayjs()?.add("1", "day")?.format("DD MMM")}</Col>
                                </Row>,
                                value: dayjs()?.add("1", "day")?.format("YYYY-MM-DD"),
                              },
                              {
                                label: <Row gutter={4} align="middle">
                                  <Col style={{ display: "flex" }} flex="none">{state?.date === dayjs()?.add("2", "day")?.format("YYYY-MM-DD") ? <CalendarCheck /> : <CalendarBlank />}</Col>
                                  <Col flex="none">
                                    {dayjs()?.add("2", "day")?.format("DD MMM")}
                                  </Col>
                                </Row>,
                                value: dayjs()?.add("2", "day")?.format("YYYY-MM-DD"),
                              }
                            ]}
                          />
                        )
                    }
                  </Col>

                  {
                    !getResponsive({ default: false, tablet: true }) &&
                    <Col flex="none">
                      <DatePicker
                        inputReadOnly
                        format="DD/MM/YYYY"
                        value={dayjs(state?.date)}
                        allowClear={false}
                        disabledDate={disabledDate}
                        onChange={((v, v1) => {
                          setState((v) => ({
                            ...v,
                            date: dayjs(v1, "DD/MM/YYYY")?.format("YYYY-MM-DD"),
                          }))
                        })}
                      />
                    </Col>
                  }

                  {
                    getResponsive({ default: false, tablet: true }) &&
                    <>
                      <div style={{ position: 'absolute', ...isRtl ? { left: 8 } : { right: 8 } }}>
                        <Button
                          type="primary"
                          icon={<CalendarBlank />}
                        />
                      </div>

                      <div style={{ position: 'absolute', ...isRtl ? { left: 8 } : { right: 8 } }}>
                        <DatePicker
                          inputReadOnly
                          format="DD/MM/YYYY"
                          style={{
                            width: "32px",
                            opacity: 0
                          }}
                          value={dayjs(state?.date)}
                          allowClear={false}
                          disabledDate={disabledDate}
                          onChange={((v, v1) => {
                            setState((v) => ({
                              ...v,
                              date: dayjs(v1, "DD/MM/YYYY")?.format("YYYY-MM-DD"),
                            }))
                          })}
                        />
                      </div>
                    </>
                  }
                </Row>
              </Col>
            </Row>
          </Col>
        </Row>
        
        {
          resolveTernary(
            getResponsive({ default: "true", tablet: "false" }) === "true",
            (
              <PageSectionsScrollWrap
                rowGutter={token?.marginSM}
                isRtl={isRtl}
                getResponsive={getResponsive}
                themeVariables={themeVariables}
              >
                {scrollableElements}
              </PageSectionsScrollWrap>
            ),
            (
              <Row
                style={{
                  marginTop: token?.marginSM
                }}
                gutter={[token?.marginSM, token?.marginSM]}
              >
                {scrollableElements}
              </Row>
            )
          )
        }

      </Col>
    </Row>
  )
}

Passenger.propTypes = {
  configValue: PropTypes.any
}

export default Passenger;
