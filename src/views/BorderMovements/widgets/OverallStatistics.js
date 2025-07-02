import PropTypes from "prop-types"
import { useContext, useEffect } from "react";
import _ from "lodash";
import {
  theme,
  PhosphorIcons,
  Row,
  Col,
  Text,
  Title,
  Divider,
  Tooltip,
} from "re-usable-design-components";
import Image from "next/image";
import useResponsive from "@/hooks/useResponsive";
import { useIntl } from "react-intl";
import { checkRtl, formatNumber } from "@/utils/helper";
import { LocaleContext } from "@/globalContext/locale/localeProvider";
import Card from "@/components/Card";
import useAsync from "@/hooks/useAsync";
import DashboardCard from "@/components/DashboardCard";
import { getOverallStatistics } from "@/services/borderMovementService";

const { useToken } = theme;
const { Swap, GlobeHemisphereWest, SignIn, SignOut, Info } = PhosphorIcons;

const StatsCard = ({ tooltip, isPreview, extra, name = "", icon = null, value = "", flex, isRtl, labelProps = {}, titleProps = {}, }) => {
  const themeVariables = useToken();
  const getResponsive = useResponsive();
  return (
    <Col
      flex={flex}
      style={{ maxWidth: flex }}
    >
      <Card
        isFullHeight
        cardBodyPadding={themeVariables?.token?.paddingSM}
        bodyStyle={{
          height: "100%",
          borderRadius: themeVariables.token?.borderRadius,
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <Row 
          gutter={[0, themeVariables?.token?.marginXXS]}
          style={{
            width: "100%"
          }}
        >
          <Col
            {
              ...(isPreview && extra) && ({
                span: 12
              })
            }
          >
            <Row
              gutter={[0, themeVariables?.token?.marginXXS]}
            >
              <Col>
                <Row
                  justify="space-between"
                  wrap={false}
                >
                  <Col flex="none">
                    <Row gutter={[8]} wrap={false} align="start">
                      <Col flex="none">
                        {icon}
                      </Col>
                      {
                        getResponsive({ default: "false", midTablet: "true" }) === "true" && (
                          <Col flex="none">
                            <Row gutter={[0, themeVariables?.token?.marginXXS]}>  
                              <Col>
                                <Row justify="space-between">
                                  <Col flex="none">
                                    <Text strong style={isRtl ? { display: 'flex' } : {}} {...labelProps}>{name}</Text>
                                  </Col>
                                </Row>
                              </Col>
                              <Col>
                                <Title level={3} {...titleProps}>
                                  {_.isNumber(value) ? formatNumber(value) : "-"}
                                </Title>
                              </Col>
                            </Row>
                          </Col>
                        )
                      }
                    </Row>
                  </Col>

                  {
                    !isPreview &&
                    <Col flex="none">
                      <Tooltip
                        title={tooltip}
                      >
                        <span>
                          <Info style={{ marginBottom: "3px" }} color="var(--colorIcon)" size={14} weight="bold" />
                        </span>
                      </Tooltip>
                    </Col>
                  }
                </Row>
              </Col>
              <Col>
                {
                  getResponsive({ default: "true", midTablet: "false" }) === "true" && (
                    <Row gutter={[0, themeVariables?.token?.marginXXS]}>  
                      <Col>
                        <Row justify="space-between">
                          <Col flex="none">
                            <Text strong style={isRtl ? { display: 'flex' } : {}} {...labelProps}>{name}</Text>
                          </Col>
                        </Row>
                      </Col>
                      <Col>
                        <Title level={3} {...titleProps}>
                          {_.isNumber(value) ? formatNumber(value) : "-"}
                        </Title>
                      </Col>
                    </Row>
                  )
                }
              </Col>
            </Row>
          </Col>
          {
            !!extra && (
              <Col
                {
                  ...isPreview && ({
                    span: 12
                  })
                }
              >
                {extra}
              </Col>
            )
          }
        </Row>
      </Card>
    </Col>
  );
};

StatsCard.propTypes = {
  flex: PropTypes.any,
  tooltip: PropTypes?.any,
  isPreview: PropTypes?.any,
  icon: PropTypes.any,
  isRtl: PropTypes.any,
  name: PropTypes.string,
  value: PropTypes.string,
  extra: PropTypes.any,
  titleProps: PropTypes.any,
  labelProps: PropTypes.any
}

function OverallStatistics({ filter, dateRange, isPreview }) {
  const intl = useIntl();
  const [localeStore] = useContext(LocaleContext);
  const themeVariables = useToken();
  const isRtl = checkRtl(localeStore);
  const getResponsive = useResponsive()
  const {
    execute: invokeOverallStatistics,
    value: overallStatisticsValue,
  } = useAsync({ asyncFunction: getOverallStatistics });

  useEffect(() => {
    invokeOverallStatistics({
      filter: { ...filter, ...dateRange }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, dateRange]);

  const data = overallStatisticsValue?.data || {};

  const statsOptionList = [
    {
      name: intl?.formatMessage({ id: "Total Border Movements" }),
      tooltip: intl?.formatMessage({ id: `Count of entry and exit movements across all borders` }),
      icon: <Swap size={32} fill={"var(--colorPrimaryBase"} weight="duotone" />,
      value: data?.totalBorderMovements,
      extraElement: (
        <Row gutter={isPreview ? 16 : undefined} wrap={!isPreview}>
          <Col
            paddingBlock={isPreview ? "0px" : "var(--paddingXSPx) var(--paddingPx)"}
            flex={isPreview ? "none": undefined}
          >
            <Divider style={isPreview ? { height: "100%" }: {}} type={isPreview ? "vertical" : "horizontal" } />
          </Col>
          <Col
            flex={isPreview ? "auto": undefined}
          >
            <Row gutter={[0, 8]}>
              <Col
                paddingInline="var(--paddingXSPx)"
                paddingBlock="var(--paddingXSPx)"
                style={{
                  backgroundColor: "var(--green-1)",
                  borderRadius: "6px"
                }}
              >
                {
                  isPreview
                    ? (
                      <Row wrap={false} gutter={[8]}>
                        <Col flex="none">
                          <SignIn weight="duotone" size={16} color="var(--green-6)" />
                        </Col>
                        <Col flex="auto">
                          <Row>
                            <Col>
                              {intl?.formatMessage({ id: "Entries" })}
                            </Col>
                            <Col>
                              <Text strong>
                                {_.isNumber(data?.entries) ? formatNumber(data?.entries) : "-"}
                              </Text>
                            </Col>
                          </Row>
                        </Col>
                      </Row>
                    )
                    : (
                      <Row wrap={false} gutter={[8]}>
                        <Col flex="none">
                          <SignIn weight="duotone" size={16} color="var(--green-6)" />
                        </Col>
                        <Col flex="auto">
                          {intl?.formatMessage({ id: "Entries" })}
                        </Col>
                        <Col flex="none">
                          <Text strong>
                            {_.isNumber(data?.entries) ? formatNumber(data?.entries) : "-"}
                          </Text>
                        </Col>
                      </Row>
                    )
                }
              </Col>
              <Col
                paddingInline="var(--paddingXSPx)"
                paddingBlock="var(--paddingXSPx)"
                style={{
                  backgroundColor: "var(--orange-1)",
                  borderRadius: "6px"
                }}
              >
                {
                  isPreview
                    ? (
                      <Row wrap={true} gutter={[8]}>
                        <Col flex="none">
                          <SignOut size={16} weight="duotone" color="var(--orange-6)" />
                        </Col>
                        <Col flex="auto">
                          <Row>
                            <Col>
                              {intl?.formatMessage({ id: "Exits" })}
                            </Col>
                        
                            <Col>
                              <Text strong>
                                {_.isNumber(data?.exits) ? formatNumber(data?.exits) : "-"}
                              </Text>
                            </Col>
                          </Row>
                        </Col>
                      </Row>
                    )
                    : (
                      <Row wrap={false} gutter={[8]}>
                        <Col flex="none">
                          <SignOut size={16} weight="duotone" color="var(--orange-6)" />
                        </Col>
                        <Col flex="auto">
                          {intl?.formatMessage({ id: "Exits" })}
                        </Col>
                        <Col flex="none">
                          <Text strong>
                            {_.isNumber(data?.exits) ? formatNumber(data?.exits) : "-"}
                          </Text>
                        </Col>
                      </Row>
                    )
                }
              </Col>
            </Row>
          </Col>
        </Row>
      ),
      titleProps: {
        level: getResponsive({ default: 3, tablet: 4 })
      }
    },
    {
      name: intl?.formatMessage({ id: "Male Travelers" }),
      tooltip: intl?.formatMessage({ id: `Gender breakdown of border movements` }),
      icon: <Image height={32} alt="Male" width={32} src="/GenderMale.png" style={{ marginBottom: "8px" }} />,
      value: data?.maleTravelers,
      labelProps: {
        // size: "sm",
        strong: false,
      },
      titleProps: {
        level: 5
      }
    },
    {
      name: intl?.formatMessage({ id: "Female Travelers" }),
      tooltip: intl?.formatMessage({ id: `Gender breakdown of border movements` }),
      icon: <Image alt="Female" width={32} height={32} src="/GenderFemale.png" style={{ marginBottom: "8px" }} />,
      value: data?.femaleTravelers,
      labelProps: {
        // size: "sm",
        strong: false
      },
      titleProps: {
        level: 5
      }
    }
  ];

  return (
    <DashboardCard
      bodyBackgroundColor="transparent"
      titleStyle={{
        flex: "auto"
      }}
      title={<Row wrap={false} gutter={[4]} align="middle">
        <Col flex="none">
          {intl?.formatMessage({ id: "Overall Statistics" })}
        </Col>
      </Row>}
      cardBodyHeight="auto"
      icon={<GlobeHemisphereWest size={32} />}
      headerBorder={false}
      cardBodyPadding={"0px"}
      bodyWrapStyle={{
        paddingTop: "0px"
      }}
    >
      <Row
        isFullHeight
        isFlex
        gutter={[0, themeVariables?.token?.marginSM]}
      >
        <Col
          isFlex
        >
          <Card
            isFullHeight
            cardBodyPadding={themeVariables?.token?.paddingXXS}
            bodyStyle={{
              backgroundColor: themeVariables?.token?.["brand-gold-2"],
              height: "100%",
              borderRadius: themeVariables.token?.borderRadiusLG,
            }}
          >
            <Row
              isFullHeight
              gutter={[
                themeVariables?.token?.marginXXS,
                themeVariables?.token?.marginXXS,
              ]}
            >
              {statsOptionList?.map((_item, _idx) => (
                <StatsCard
                  key={`${_item?.name}_${_idx}`}
                  flex={isPreview ? "33.3%" : "100%"}
                  name={_item?.name}
                  tooltip={_item?.tooltip}
                  icon={_item?.icon}
                  isPreview={isPreview}
                  labelProps={_item?.labelProps}
                  titleProps={_item?.titleProps}
                  value={_item?.value}
                  isRtl={isRtl}
                  extra={_item?.extraElement}
                />
              ))}
            </Row>
          </Card>
        </Col>
      </Row>
    </DashboardCard>
  );
}

OverallStatistics.propTypes = {
  filter: PropTypes.any,
  dateRange: PropTypes.any,
  isPreview: PropTypes.any
}

export default OverallStatistics;
