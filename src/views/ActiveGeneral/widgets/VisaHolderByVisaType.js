import PropTypes from "prop-types"
import { Row, Col, PhosphorIcons, Card, Avatar, Text, Title, theme, Table, Progress, Tooltip } from "re-usable-design-components";
import DashboardCard from "@/components/DashboardCard";
import { useIntl } from "react-intl";
import { useMemo, useEffect } from "react";
import { formatNumber, getColorFromPercentage } from "@/utils/helper";
import { getVisaHolderByVisaType } from "@/services/activeGeneralService";
import useAsync from "@/hooks/useAsync";
import useResponsive from "@/hooks/useResponsive";

const { IdentificationCard, Info } = PhosphorIcons;

const { useToken } = theme;

function getTooltip(isRtl, intl) {
  return function () {
    return `
    <div style="font-family: var(--fontFamily); text-align: ${isRtl ? "right" : "left"}">
      ${intl?.formatMessage({ id: "Residency Type" })}: <span style="font-weight: bold;">${this?.key}</span>
    </div>
    <div style="font-family: var(--fontFamily); text-align: ${isRtl ? "right" : "left"}">
      ${intl?.formatMessage({ id: "Value" })}: <span style="font-weight: bold;">${_.isNumber(this?.point?.y) ? formatNumber(this?.point?.y) : '-'}</span>
    </div>
  `;
  }
}

function FormatText(v) {
  return <Text>{`${v}%`}</Text>
}

function VisaHolderByVisaType({
  filter, isRtl,
}) {
  const intl = useIntl();
  const themeVariables = useToken();
  const getResponsive = useResponsive();
  const {
    execute,
    status,
    value,
  } = useAsync({ asyncFunction: getVisaHolderByVisaType });

  useEffect(() => {
    execute({ filter })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const isLoading = ["idle", "pending"]?.includes(status);
  const { data = {} } = value || {};
  const isEmpty = !isLoading && !data?.visa_categories?.length;

  const minMaxValues = useMemo(() => {
    let min = 0;
    let max = 0;
    let total = 0;

    if (data?.visa_categories?.length) {
      min = data?.visa_categories?.[0]?.holders_count;
      max = data?.visa_categories?.[0]?.holders_count;
      (data?.visa_categories || [])?.forEach((v) => {
        total += v?.holders_count;

        if (v?.holders_count < min) {
          min = v?.holders_count;
        }

        if (v?.holders_count > max) {
          max = v?.holders_count;
        }
      })
    }
    return { min, max, total };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);


  return (
    <DashboardCard
      bodyBackgroundColor="transparent"
      title={(
        <Row align="middle" gutter={4}>
          <Col flex="none">
            {intl.formatMessage({ id: "Visa Holders by Visa Type" })}
          </Col>
          <Col flex="none">
            <Tooltip
              title={intl?.formatMessage({ id: "UAE_Population_Visa_Holders_by_Visa_Type_Tooltip" })}
            >
              <span>
                <Info style={{ marginBottom: "3px" }} color="var(--colorIcon)" size={14} weight="bold" />
              </span>
            </Tooltip>
          </Col>
        </Row>
      )}
      icon={<IdentificationCard size={32} weight="light" />}
      loading={isLoading}
      cardBodyPadding={"0px"}
      cardBodyHeight={getResponsive({ default: "440px", desktop: "412px", mobile: "auto" })}
      isEmpty={isEmpty}
    >
      <Row
        isFullHeight
        gutter={[12, 12]}
        wrap={getResponsive({ default: false, mobile: true })}
      >
        <Col>
          <Row>
            <Col>
              <Card
                isFullHeight
                bodyStyle={{
                  backgroundColor: themeVariables?.token?.["blue-1"],
                  height: "100%",
                  padding: "var(--paddingPx)",
                  borderRadius: themeVariables.token?.borderRadiusLG,
                }}
              >
                <Row gutter={[0, themeVariables?.token?.marginXXS]}>
                  <Col>

                    <Row justify="space-between">
                      <Col flex="none">
                        <Avatar
                          src={
                            <IdentificationCard
                              size={24}
                              fill={themeVariables?.token?.["blue-6"]}
                            />
                          }
                          siz={"42px"}
                          backgroundColor={themeVariables?.token?.["blue-2"]}
                        />
                      </Col>
                      <Col flex="none">
                        <Row align="middle" gutter={4}>
                          <Col flex="none">
                            <Tooltip
                              title={intl?.formatMessage({ id: "UAE_Population_Total_Visa_Holders_Tooltip" })}
                            >
                              <span>
                                <Info style={{ marginBottom: "3px" }} color="var(--colorIcon)" size={14} weight="bold" />
                              </span>
                            </Tooltip>
                          </Col>
                        </Row>
                      </Col>
                    </Row>
                  </Col>
                  <Col>
                    <Text color="var(--colorTextDescription)">
                      {intl?.formatMessage({
                        id: "Total Visa Holders",
                      })}
                    </Text>
                  </Col>
                  <Col>
                    <Title level={3}>
                      {_.isNumber(data?.total_visa_holders)
                        ? formatNumber(data?.total_visa_holders)
                        : "-"}
                    </Title>
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>
          <Row
            style={{
              height: "calc(100% - 134px)"
            }}
          >
            <Col
              paddingBlock="var(--paddingPx) 0px"
            >
              <DashboardCard
                bodyBackgroundColor="transparent"
                cardBodyHeight={"100%"}
                cardBodyPadding={"0px"}
                bordered
                style={{
                  height: "100%",
                }}
                headStyle={{
                  display: "none"
                }}
                bodyWrapStyle={{
                  padding: "0px",
                }}
              >
                <Table
                  borderRadiusOnSides={getResponsive({ default: data?.length > 4 ? "all" : "top", midTablet: data?.length > 4 ? "all" : "top", mobile: data?.length > 4 ? "all" : "top" })}
                  columns={[
                    {
                      title: intl?.formatMessage({ id: "Visa Type" }),
                      width: getResponsive({ default: "50%", mobile: "155px" }),
                      sorter: {
                        compare: (a, b) => a?.[isRtl ? "visa_category_ar" : "visa_category_en"].localeCompare(b?.[isRtl ? "visa_category_ar" : "visa_category_en"]),
                      },
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
                                      tooltip: isRtl ? v?.visa_category_ar : v?.visa_category_en
                                    }}
                                  >
                                    {isRtl ? v?.visa_category_ar : v?.visa_category_en}
                                  </Text>
                                </Col>
                              </Row>
                            </Col>
                          </Row>
                        )
                      }
                    },
                    {
                      title: intl?.formatMessage({ id: "Number of Holders" }),
                      width: getResponsive({ default: "50%" }),
                      sorter: {
                        compare: (a, b) => a?.holders_count - b?.holders_count,
                      },
                      render: (v) => {
                        const percent = Number(((v?.holders_count / minMaxValues.total) * 100)?.toFixed(1));
                        const percentOutOfMaxValue = ((v?.holders_count / minMaxValues.max) * 100);
                        return (
                          <Row align="middle" gutter={getResponsive({ default: [12], tablet: [0, 0], midTablet: [12], mobile: [0, 0] })}>
                            <Col flex={getResponsive({ default: "0 0 80px", mobile: "0 0 60px" })}>
                              <Text
                                ellipsis={{
                                  tooltip: v?.holders_count ? formatNumber(v?.holders_count) : '-'
                                }}
                              >
                                {v?.holders_count ? formatNumber(v?.holders_count) : '-'}
                              </Text>
                            </Col>

                            <Col flex="auto">
                              <Progress
                                strokeColor={getColorFromPercentage({
                                  percent: percentOutOfMaxValue,
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
                    ...data?.visa_categories?.length > getResponsive({ default: 4, tablet: 4, midTablet: 4, mobile: 4 }) && {
                      scroll: {
                        y: getResponsive({ default: 180, tablet: 180 }),
                        x: getResponsive({ default: null, mobile: 400 })
                      }
                    }
                  }
                  pagination={false}
                  dataSource={data?.visa_categories}
                />
              </DashboardCard>
            </Col>
          </Row>
        </Col>
      </Row>
    </DashboardCard>
  )
}

VisaHolderByVisaType.propTypes = {
  filter: PropTypes.any,
  isRtl: PropTypes.any
}

export default VisaHolderByVisaType;