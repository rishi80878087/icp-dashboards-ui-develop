import PropTypes from "prop-types"
import { useContext, useEffect } from "react";
import _ from "lodash";
import {
  theme,
  PhosphorIcons,
  Row,
  Col,
  Text,
  AntIcons,
  Title,
  Tooltip
} from "re-usable-design-components";
import useResponsive from "@/hooks/useResponsive";
import { useIntl } from "react-intl";
import { checkRtl, formatNumber } from "@/utils/helper";
import { LocaleContext } from "@/globalContext/locale/localeProvider";
import Card from "@/components/Card";
import IdcardTwoTone from "@/svgr/IdCardTwoTone";
import useAsync from "@/hooks/useAsync";
import { getOverallStatistics } from "@/services/visaVioloationService";


const { useToken } = theme;
const { Buildings, Info } = PhosphorIcons;
const { SolutionOutlined } = AntIcons;


const StatsCard = ({ bgColor, tooltipLabel, iconBgColor, getResponsive, extra, name = "", icon = null, value = "", flex, isRtl, labelProps = {} }) => {
  const themeVariables = useToken();

  return (
    <Col
      span={getResponsive({ default: 8, tablet: 8, mobile: 24 })}
      style={{ maxWidth: flex }}
    >
      <Card
        isFullHeight
        cardBodyPadding={themeVariables?.token?.padding}
        bodyStyle={{
          height: "100%",
          borderRadius: themeVariables.token?.borderRadius,
          display: 'flex',
          alignItems: 'center',
          backgroundColor: bgColor
        }}
      >
        <Row 
          gutter={[0, themeVariables?.token?.marginXXS]}
          style={{
            width: "100%"
          }}
        >
          <Col>
            <Row
              justify="space-between"
            >
              <Col flex="none">
                <span
                  style={{
                    width: "42px",
                    height: "42px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: iconBgColor,
                    borderRadius: "50%"
                  }}
                >
                  {icon}
                </span>
              </Col>

              <Col flex="none">
                <Tooltip title={tooltipLabel}>
                  <Info style={{ marginBottom: "3px" }} color="var(--colorIcon)" size={14} weight="bold" />
                </Tooltip>
              </Col>
            </Row>
          </Col>
          <Col>
            <Row gutter={[0, themeVariables?.token?.marginXXS]}>
              <Col>
                <Row justify="space-between">
                  <Col flex="none">
                    <Text color="var(--colorTextDescription)" style={isRtl ? { display: 'flex' } : {}} {...labelProps}>{name}</Text>
                  </Col>
                </Row>
              </Col>
              <Col>
                <Title level={getResponsive({ default: 3, mobile: 4 })}>
                  {_.isNumber(value) ? formatNumber(value) : "-"}
                </Title>
              </Col>
            </Row>
          </Col>
          {
            !!extra && (
              <Col>
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
  icon: PropTypes.any,
  isRtl: PropTypes.any,
  name: PropTypes.string,
  value: PropTypes.string,
  extra: PropTypes.any,
  titleProps: PropTypes.any,
  bgColor: PropTypes.any,
  iconBgColor: PropTypes.any,
  getResponsive: PropTypes.any,
  labelProps: PropTypes.any,
  tooltipLabel: PropTypes.any
}

function OverallStatistics({ filter, dateRange }) {
  const intl = useIntl();
  const [localeStore] = useContext(LocaleContext);
  const getResponsive = useResponsive();
  const themeVariables = useToken();
  const isRtl = checkRtl(localeStore);


  const {
    execute: invokeOverallStatistics,
    // status: overallStatisticsStatus,
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
      name: intl?.formatMessage({ id: "Visa Applications" }),
      icon: <SolutionOutlined style={{ fontSize: "18px", color: "var(--orange-6)" }}  />,
      value: data?.totalVisaApplications,
      tooltipLabel: intl?.formatMessage({ id: "Number of visa service requests" }),
      bgColor: "var(--orange-1)",
      iconBgColor: "var(--orange-2)"
    },
    {
      name: intl?.formatMessage({ id: "Residence Visa Applications" }),
      icon: <Buildings size={24} fill={"var(--blue-6)"} weight="duotone" style={{  }} />,
      value: data?.residenceVisaApplications,
      tooltipLabel: intl?.formatMessage({ id: "Number of residence visa service requests" }),
      bgColor: "var(--blue-1)",
      iconBgColor: "var(--blue-2)"
    },
    {
      name: intl?.formatMessage({ id: "Passport Applications" }),
      icon: <IdcardTwoTone className="passportApplicationIcon" size={24} style={{ fontSize: "18px", color: "var(--purple-6)" }} />,
      value: data?.passportApplications,
      tooltipLabel: intl?.formatMessage({ id: "Number of passport service requests" }),
      bgColor: "var(--purple-1)",
      iconBgColor: "var(--purple-2)"
    }
  ];

  return (
    <Card>
      <Row
        isFullHeight
        isFlex
        gutter={[0, themeVariables?.token?.marginSM]}
      >
        <Col
          isFlex
        >
          <Row
            isFullHeight
            gutter={[
              themeVariables?.token?.marginSM,
              themeVariables?.token?.marginSM,
            ]}
          >
            {statsOptionList?.map((_item, _idx) => (
              <StatsCard
                getResponsive={getResponsive}
                key={`${_item?.name}_${_idx}`}
                flex="100%"
                name={_item?.name}
                tooltipLabel={_item?.tooltipLabel}
                icon={_item?.icon}
                iconBgColor={_item?.iconBgColor}
                bgColor={_item?.bgColor}
                value={_item?.value}
                isRtl={isRtl}
              />
            ))}
          </Row>
        </Col>
      </Row>
    </Card>
  );
}

OverallStatistics.propTypes = {
  filter: PropTypes.any,
  dateRange: PropTypes.any
}

export default OverallStatistics;
