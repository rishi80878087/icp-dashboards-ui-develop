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
  Avatar,
  Tooltip,
} from "re-usable-design-components";
import useResponsive from "@/hooks/useResponsive";
import { useIntl } from "react-intl";
import { checkRtl, formatNumber } from "@/utils/helper";
import { LocaleContext } from "@/globalContext/locale/localeProvider";
import Card from "@/components/Card";
import ExpatsSvg from "@/svgr/Expats";
import VisaSvg from "@/svgr/Visa";
import PinOnMapSvg from "@/svgr/PinOnMap";
import MapLocationSvg from "@/svgr/MapLocation";
import useAsync from "@/hooks/useAsync";
import { getGeneralResidentsSummary } from "@/services/activeGeneralService";

const { useToken } = theme;
const { UsersFour, Info } = PhosphorIcons;

const StatsCard = ({ tooltip, name = "", icon = null, value = "", flex, isRtl }) => {
  const themeVariables = useToken();
  const intl = useIntl();

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
        <Row style={{ width: '100%' }} gutter={[0, themeVariables?.token?.marginXXS]}>
          <Col>
            <Row justify="space-between">
              <Col flex="none">
                {icon}
              </Col>
              <Col flex="none">
                <Row align="middle" gutter={4}>
                  <Col flex="none">
                    <Tooltip
                      title={intl?.formatMessage({ id: tooltip })}
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
            <Row gutter={[0, themeVariables?.token?.marginXXS]}>
              <Col>
                <Text size="sm" color="var(--colorTextLabel)">{name}</Text>
              </Col>
              <Col>
                <Title level={4}>
                  {_.isNumber(value) ? formatNumber(value) : "-"}
                </Title>
              </Col>
            </Row>
          </Col>
        </Row>
      </Card>
    </Col>
  );
};

StatsCard.propTypes = {
  flex: PropTypes.any,
  icon: PropTypes.any,
  isRtl: PropTypes.any,
  name: PropTypes.string,
  value: PropTypes.string,
  tooltip: PropTypes.any
}

function VisaHolder({ filter }) {
  const intl = useIntl();
  const [localeStore] = useContext(LocaleContext);
  const getResponsive = useResponsive();
  const themeVariables = useToken();
  const isRtl = checkRtl(localeStore);

  const {
    execute: invokeGetGeneralResidentsSummary,
    status: generalResidentsSummaryStatus,
    value: generalResidentsSummaryValue,
  } = useAsync({ asyncFunction: getGeneralResidentsSummary });

  const CARD_STATS_HEIGHT = 136;
  const CARD_STATS_WRAPPER_HEIGHT = 232;

  const CARD_GAP = themeVariables?.token?.marginSM;

  useEffect(() => {
    invokeGetGeneralResidentsSummary({
      filter: filter
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const isLoading = ["idle", "pending"]?.includes(
    generalResidentsSummaryStatus
  );
  const data = generalResidentsSummaryValue?.data || {};

  const statsOptionList = [
    {
      name: intl?.formatMessage({ id: "Locals" }),
      icon: <PinOnMapSvg size={24} fill={themeVariables?.token?.['Icons-Dashboard-3']?.colorPrimaryBgHover} />,
      value: data?.total_locals,
      tooltip: "UAE_Population_Locals_ToolTip"
    },
    {
      name: intl?.formatMessage({ id: "GCC" }),
      icon: <VisaSvg size={24} fill={themeVariables?.token?.['Icons-Dashboard-3']?.colorPrimaryBgHover} />,
      value: data?.total_gcc,
      tooltip: "UAE_Population_GCC_ToolTip"
    },
    {
      name: intl?.formatMessage({ id: "Residence" }),
      icon: <ExpatsSvg size={24} fill={themeVariables?.token?.['Icons-Dashboard-3']?.colorPrimaryBgHover} />,
      value: data?.total_expats,
      tooltip: "UAE_Population_Residence_ToolTip"
    },
    {
      name: intl?.formatMessage({ id: "Visa" }),
      icon: <MapLocationSvg size={24} fill={themeVariables?.token?.['Icons-Dashboard-3']?.colorPrimaryBgHover} />,
      value: data?.total_visa,
      tooltip: "UAE_Population_Visa_ToolTip"
    },
  ];

  const chartConfig = getResponsive({
    default: {
      first: {},
      second: {},
    },

    midTablet: {
      visaCardWrapper: {
        display: 'flex',
        alignItems: 'center'
      },
      cardWrapper: {
        cardBodyHeight: isRtl ? "344px" : "256px",
      },
      wrapper: {
        gutter: themeVariables?.token?.marginSM,
      },
      first: {
        flex: `${260}px`,
        style: {
          height: "100%",
        },
      },
      second: {
        flex: `calc(100% - ${260}px)`,
        style: {
          height: "100%",
        },
      },
    },

    mobile: {
      first: {
        flex: `100%`,
        style: {
          height: `${CARD_STATS_HEIGHT}px`,
        },
      },
      second: {
        flex: `100%`,
        style: {
          height: isRtl ? `${CARD_STATS_WRAPPER_HEIGHT}px` : "224px",
        },
      },
    },
  });

  return (
    <Card
      headerPadding="none"
      cardBodyHeight={getResponsive({ default: "430px", desktop: "412px" })}
      cardBodyPadding={getResponsive({ default: "var(--paddingLGPx)", desktop: "var(--paddingPx)" })}
      loading={isLoading}
      {...chartConfig?.cardWrapper}
    >
      <Row
        isFullHeight
        isFlex
        gutter={[0, themeVariables?.token?.marginSM]}
        {...chartConfig?.wrapper}
      >
        <Col
          isFlex
          style={{ height: `${CARD_STATS_HEIGHT}px` }}
          {...chartConfig?.first}
        >
          <Card
            isFullHeight
            bodyStyle={{
              backgroundColor: themeVariables?.token?.["orange-1"],
              height: "100%",
              borderRadius: themeVariables.token?.borderRadiusLG,
              ...chartConfig?.visaCardWrapper
            }}
          >
            <Row gutter={[0, themeVariables?.token?.marginXXS]}>
              <Col>
                <Row justify="space-between">
                  <Col flex="none">
                    <Avatar
                      src={
                        <UsersFour
                          size={24}
                          fill={themeVariables?.token?.["orange-6"]}
                        />
                      }
                      siz={"42px"}
                      backgroundColor={themeVariables?.token?.["orange-2"]}
                    />
                  </Col>
                  <Col flex="none">
                    <Row align="middle" gutter={4}>
                      <Col flex="none">
                        <Tooltip
                          title={intl?.formatMessage({ id: "UAE_Population_Total_Population_ToolTip" })}
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
                    id: "Total Population",
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
        <Col
          isFlex
          style={{ height: isRtl ? CARD_STATS_WRAPPER_HEIGHT : `calc(100% - ${CARD_STATS_HEIGHT + CARD_GAP}px)` }}
          {...chartConfig?.second}
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
                  flex="50%"
                  tooltip={_item?.tooltip}
                  name={_item?.name}
                  icon={_item?.icon}
                  value={_item?.value}
                  isRtl={isRtl}
                />
              ))}
            </Row>
          </Card>
        </Col>
      </Row>
    </Card>
  );
}

VisaHolder.propTypes = {
  filter: PropTypes.any
}

export default VisaHolder;
