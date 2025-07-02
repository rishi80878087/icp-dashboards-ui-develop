import PropTypes from "prop-types"
import React, { useContext } from "react";
import {
  Row,
  Col,
  theme,
  Text,
  Tooltip,
  Scrollbars
} from "re-usable-design-components";
import _ from "lodash";
import { formatNumberSuffixes, checkRtl, resolveTernary } from "@/utils/helper";
import useResponsive from "@/hooks/useResponsive";
import { LocaleContext } from "@/globalContext/locale/localeProvider";


const { useToken } = theme;

function getRtlonIsRtl(isRtl) {
  if (isRtl) {
    return "rtl"
  }
  return "ltr"
}
const DualBarChart = ({
  firstChartData,
  secondChartData,
  getTooltip,
  showfirstSeries,
  showSecondSeries,
  showBoth,
}) => {
  const themeVariables = useToken();
  const [localeStore] = useContext(LocaleContext);
  const isRtl = checkRtl(localeStore)

  const getResponsive = useResponsive();
  const categories =
    firstChartData?.categories || secondChartData?.categories || [];

  const firstChartYaxisData = firstChartData?.values?.[0] || [];
  const secondChartYaxisData = secondChartData?.values?.[0] || [];

  const firstChartMax = _.max(resolveTernary(firstChartYaxisData?.data, firstChartYaxisData?.data, []));
  const secondChartMax = _.max(resolveTernary(secondChartYaxisData?.data, secondChartYaxisData?.data, []));

  const LABEL_WIDTH = resolveTernary(showBoth, 100, 70);
  const XAXIS_TICKS = getResponsive({
    default: 6,
    mobile: 3,
  });
  const BAR_HEIGHT = 17;
  const LEGEND_HEIGHT = 20;

  const firstChartWidth = resolveTernary(
    showfirstSeries,
    `calc(100% - ${LABEL_WIDTH}px)`,
    `calc(50% - ${LABEL_WIDTH / 2}px)`
  );
  const secondChartWidth = resolveTernary(
    showSecondSeries,
    `calc(100% - ${LABEL_WIDTH}px)`,
    `calc(50% - ${LABEL_WIDTH / 2}px)`
  );

  const secondChartGridline = resolveTernary(
    showSecondSeries
    , resolveTernary(isRtl, `calc(0% + ${LABEL_WIDTH}px)`, `calc(0% + ${LABEL_WIDTH}px)`)
    , `calc(50% + ${LABEL_WIDTH / 2}px)`
  );


  const bodyPadding = resolveTernary(
    showBoth,
    `0px ${themeVariables?.token?.paddingXS}px`,
    isRtl ? `0px 0px 0px ${themeVariables?.token?.paddingXS}px` : `0px ${themeVariables?.token?.paddingXS}px 0px 0px`
  )
  return (
    <Row
      isFullHeight
      style={{
        // direction: resolveTernary(showBoth, "ltr", resolveTernary(showSecondSeries, getRtlonIsRtl(isRtl), resolveTernary(showfirstSeries, resolveTernary(isRtl, "ltr", 'rtl'), 'ltr'))),
        direction: resolveTernary(isRtl, "rtl", "ltr"),
        padding: bodyPadding, height: `calc(100% - ${LEGEND_HEIGHT}px)`
      }}>
      <Col isFlex style={{ height: '100%' }}>
        {/* Show gridline */}
        <Row
        >
          <Col
            flex="none"
            style={{
              width: firstChartWidth,
              direction: isRtl ? "ltr" : "rtl",
              paddingLeft: showBoth ? "6px" : "0px",
              height: "100%",
              position: "absolute",
              top: 0,
              ...(showfirstSeries && !isRtl) && {
                left: "70px"
              },
              ...(showfirstSeries && isRtl) && {
                right: "70px"
              },
              ...(showBoth) && {
                left: "0px"
              },
              display: resolveTernary(
                resolveTernary(showBoth, showBoth, showfirstSeries),
                "flex",
                "none"
              ),
            }}
          >
            <Col
              style={{
                height: `calc(100% - ${BAR_HEIGHT}px)`,
              }}
            >
              {
                <Row align="space-between" isFullHeight style={{ direction: (resolveTernary(showfirstSeries, showfirstSeries, showSecondSeries)) ? getRtlonIsRtl(isRtl) : 'rtl' }}>
                  {[...Array(XAXIS_TICKS + 1)]?.map((_, _idx) => (
                    <Col
                      key={_idx}
                      flex="none"
                      style={{
                        borderRight: `1px ${_idx === 0 ? 'solid' : 'dashed'} ${themeVariables?.token?.colorBorderSecondary}`,
                        width: "1px",
                        height: "100%",
                      }}
                    ></Col>
                  ))}
                </Row>
              }
            </Col>
          </Col>
          <Col
            flex="none"
            style={{ width: LABEL_WIDTH, textAlign: "center" }}
          ></Col>
          <Col
            flex="none"
            id="secondChart"
            style={{
              width: secondChartWidth,
              height: "100%",
              paddingRight: showBoth ? "6px" : "0px",
              position: "absolute",
              direction: showBoth ? isRtl ? "ltr": "ltr" : isRtl ? "rtl" : "ltr",
              top: 0,
              ...(isRtl && showSecondSeries)
                && { right: (secondChartGridline) },
              ...(!isRtl && showSecondSeries)
                && { left: (secondChartGridline) }
              ,
              ...(showBoth) && {
                right: "0px"
              },
              display: resolveTernary(
                resolveTernary(showBoth, showBoth, showSecondSeries),
                "flex",
                "none"
              ),
            }}
          >
            <Col
              style={{
                height: `calc(100% - ${BAR_HEIGHT}px)`,
              }}
            >
              {
                <Row align="space-between" isFullHeight>
                  {[...Array(XAXIS_TICKS + 1)]?.map((_, _idx) => (
                    <Col
                      key={_}
                      flex="none"
                      style={{
                        borderRight: `1px ${_idx === 0 ? 'solid' : 'dashed'} ${themeVariables?.token?.colorBorderSecondary}`,
                        width: "1px",
                        height: "100%",
                      }}
                    ></Col>
                  ))}
                </Row>
              }
            </Col>
          </Col>
        </Row>
        {/* Show chart */}
        <Row
          isFlexGrow
          style={{
            height: '100%',
          }}
        >
          <Scrollbars autoHide>
            <Col
              isFlex
              style={{
                marginLeft: getResponsive({ default: "0px", tablet: (showBoth && isRtl) ? "6px": "0px" })
              }}
            >
              {categories?.map((_category, _idx) => {
                return (
                  <Row
                    key={_category}
                    style={{
                      direction: showSecondSeries ? isRtl ? "rtl": "ltr" : showfirstSeries ? isRtl ? "ltr" : "rtl" : isRtl ? "ltr" : "ltr"
                    }}
                  >
                    <Col style>
                      {/* Code for filled space */}
                      <Row style={{ height: `${BAR_HEIGHT}px` }}>
                        <Col
                          flex="none"
                          style={{
                            width: firstChartWidth,
                            paddingLeft: showBoth ? "6px" : "0px",
                            direction: resolveTernary(showfirstSeries, getRtlonIsRtl(isRtl), resolveTernary(showSecondSeries, getRtlonIsRtl(isRtl), "rtl")),
                            height: "100%",
                            display:
                              resolveTernary(resolveTernary(showBoth, showBoth, showfirstSeries), "flex", "none"),
                          }}
                        >
                          <Tooltip
                            getPopupContainer={(triggerNode) => triggerNode.parentNode}
                            title={getTooltip({
                              name: _category,
                              value: firstChartYaxisData?.data[_idx],
                            })}
                          >
                            <Col
                              style={{
                                height: "100%",
                                backgroundColor: firstChartYaxisData?.color,
                                maxWidth: resolveTernary(
                                  firstChartMax,
                                  `${
                                    (firstChartYaxisData?.data[_idx] /
                                        firstChartMax) *
                                      100
                                  }%`,
                                  "0%"
                                ),
                                borderTopRightRadius:
                                  (isRtl && !showBoth) ? themeVariables?.token?.borderRadiusXS: "0px",
                                borderBottomRightRadius:
                                (isRtl && !showBoth) ? themeVariables?.token?.borderRadiusXS : "0px",
                                borderTopLeftRadius:
                                  (isRtl && !showBoth) ? "0px": themeVariables?.token?.borderRadiusXS,
                                borderBottomLeftRadius:
                                (isRtl && !showBoth) ? "0px" : themeVariables?.token?.borderRadiusXS,
                                transform: showfirstSeries ? 'rotate(180deg)' : ''
                              }}
                            ></Col>
                          </Tooltip>
                        </Col>
                        <Col
                          flex="none"
                          style={{
                            width: LABEL_WIDTH,
                            textAlign: "center",
                            height: "100%",
                            flexDirection: "row",
                            direction: resolveTernary(resolveTernary(showfirstSeries, showfirstSeries, showSecondSeries), getRtlonIsRtl(isRtl), "ltr")
                          }}
                          paddingInline={themeVariables?.token?.paddingXS}
                          alignItems={resolveTernary(showBoth, "center", (resolveTernary(showSecondSeries, "end", "start")))}
                          justifyContent={resolveTernary(showBoth, "center", "end")}
                          isFlex
                        >
                          <Text size="sm" ellipsis={{ rows: 1, tooltip: true }}>
                            {resolveTernary(_category, _category, "-")}
                          </Text>
                        </Col>
                        <Col
                          flex="none"
                          style={{
                            width: secondChartWidth,
                            height: "100%",
                            paddingRight: showBoth ? "6px" : "0px",
                            display: resolveTernary(
                              resolveTernary(showBoth, showBoth, showSecondSeries),
                              "flex",
                              "none"
                            ),
                          }}
                        >
                          <Tooltip
                            getPopupContainer={(triggerNode) => triggerNode.parentNode}
                            title={getTooltip({
                              name: _category,
                              value: secondChartYaxisData?.data[_idx],
                            })}
                          >
                            <Col
                              style={{
                                height: "100%",
                                backgroundColor: secondChartYaxisData?.color,
                                maxWidth: secondChartMax
                                  ? `${
                                    (secondChartYaxisData?.data[_idx] /
                                        secondChartMax) *
                                      100
                                  }%`
                                  : "0%",
                                borderTopLeftRadius:
                                (isRtl && !showBoth) ? themeVariables?.token?.borderRadiusXS: "0px",
                                borderBottomLeftRadius:
                                (isRtl && !showBoth) ? themeVariables?.token?.borderRadiusXS: "0px",
                                borderTopRightRadius:
                                (isRtl && !showBoth) ? "0px": themeVariables?.token?.borderRadiusXS,
                                borderBottomRightRadius:
                                (isRtl && !showBoth) ? "0px": themeVariables?.token?.borderRadiusXS,
                              }}
                            ></Col>
                          </Tooltip>
                        </Col>
                      </Row>
                      {/* Code for blank space */}
                      {(_idx + 1) !== categories?.length && <Row style={{ height: `${BAR_HEIGHT}px` }}>
                        <Col
                          flex="none"
                          style={{
                            width: firstChartWidth,
                            height: "100%",
                            display:
                              showBoth || showfirstSeries ? "flex" : "none",
                          }}
                        ></Col>
                        <Col
                          flex="none"
                          style={{ width: LABEL_WIDTH, height: "100%" }}
                        ></Col>
                        <Col
                          flex="none"
                          style={{
                            width: secondChartWidth,
                            height: "100%",
                            display:
                              showBoth || showSecondSeries ? "flex" : "none",
                          }}
                        ></Col>
                      </Row>}
                    </Col>
                  </Row>
                );
              })}
            </Col>
          </Scrollbars>
        </Row>
        {/* Show xAxis labels */}
        <Row
          style={{
            height: `${BAR_HEIGHT}px`,
            direction: showSecondSeries ? isRtl ? "rtl": "ltr" : showfirstSeries ? isRtl ? "ltr": "rtl" : isRtl ? "ltr": "ltr",
          }}
        >
          <Col
            flex="none"
            style={{
              width: firstChartWidth,
              direction: (showfirstSeries) ? getRtlonIsRtl(isRtl) : "rtl",
              height: "100%",
              paddingLeft: showBoth ? "6px" : "0px",
              display: showBoth || showfirstSeries ? "flex" : "none",
            }}
          >
            <Col
              style={{
                height: "100%",
              }}
            >
              {
                <Row
                  align="space-between"
                  style={{
                    height: "100%",
                    borderTop: `1px solid ${themeVariables?.token?.colorBorderSecondary}`,
                  }}
                >
                  {[...Array(XAXIS_TICKS + 1)]?.map((_, _idx) => (
                    <Col
                      key={_}
                      flex="none"
                      style={{ transform: _idx !== 0 && showfirstSeries ? isRtl ? "translate(-50%, 0)" : "translate(50%, 0)" : "translate(-50%, 0)" }}
                    >
                      <Text size="sm">
                        {formatNumberSuffixes(
                          Math.round(firstChartMax / XAXIS_TICKS) * _idx
                        )}
                      </Text>
                    </Col>
                  ))}
                </Row>
              }
            </Col>
          </Col>
          <Col
            flex="none"
            style={{ width: LABEL_WIDTH, textAlign: "center" }}
          ></Col>
          <Col
            flex="none"
            style={{
              width: secondChartWidth,
              paddingRight: showBoth ? "6px" : "0px",
              direction: showBoth ? "ltr" : resolveTernary(showSecondSeries, resolveTernary(!isRtl, "ltr", "rtl"), "rtl"),
              display: showBoth || showSecondSeries ? "flex" : "none",
            }}
          >
            <Col
              style={{
                height: "100%",
              }}
            >
              {
                <Row
                  align="space-between"
                  style={{
                    borderTop: `1px solid ${themeVariables?.token?.colorBorderSecondary}`,
                  }}
                >
                  {[...Array(XAXIS_TICKS + 1)]?.map((_, _idx) => (
                    <Col
                      key={_}
                      flex="none"
                      style={{ transform: _idx !== 0 && isRtl ? showBoth ? "translate(50%, 0)" : "translate(-50%, 0)" : "translate(50%, 0)" }}
                    >
                      <Text size="sm">
                        {formatNumberSuffixes(
                          Math.round(secondChartMax / XAXIS_TICKS) * _idx
                        )}
                      </Text>
                    </Col>
                  ))}
                </Row>
              }
            </Col>
          </Col>
        </Row>
      </Col>
    </Row>
  );
};

DualBarChart.propTypes = {
  firstChartData: PropTypes.any,
  getTooltip: PropTypes.func,
  secondChartData: PropTypes.any,
  showBoth: PropTypes.any,
  showSecondSeries: PropTypes.any,
  showfirstSeries: PropTypes.any
}

export default DualBarChart;
