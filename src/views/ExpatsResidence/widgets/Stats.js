import PropTypes from "prop-types"
import React, { useEffect } from "react";
import {
  PhosphorIcons,
  Row,
  Col,
  theme,
  Avatar,
  Text,
  Title,
} from "re-usable-design-components";
import { useIntl } from "react-intl";
import Card from "@/components/Card";
import { getEmirateStatistics } from "@/services/expatsResidenceService";
import useAsync from "@/hooks/useAsync";
import { formatNumber, resolveTernary } from "@/utils/helper";
import useResponsive from "@/hooks/useResponsive";


const { GenderMale, GenderFemale, UsersFour, IdentificationCard, Garage } =
  PhosphorIcons;
const { useToken } = theme;

const StatsCard = ({ statsInfo }) => {
  const themeVariables = useToken();
  const getResponsive = useResponsive();

  const labelWidth = getResponsive({
    default: '100%',
    mobile: '100%',
    midTablet: '100%',
    tablet: '100px',
    bigTablet: '100%',
    desktop: '100%',
  })

  return (
    <Row
      borderRadius={themeVariables?.token?.borderRadius}
      backgroundColor={statsInfo?.bgColor}
      isFlexGrow
    >
      <Col
        isFlex
        paddingBlock={themeVariables?.token?.padding}
        paddingInline={themeVariables?.token?.padding}
        gap={themeVariables?.token?.marginXXS}
      >
        <Row>
          <Col>
            <Avatar
              src={statsInfo?.icon}
              siz={"42px"}
              backgroundColor={statsInfo?.iconBgColor}
            />
          </Col>
        </Row>
        <Row style={{ flexGrow: 1 }} gutter={[0, themeVariables?.token?.marginXXS]}>
          <Col flex={labelWidth}>
            <Text color={themeVariables?.token?.colorTextLabel}>
              {statsInfo?.label}
            </Text>
          </Col>
          <Col style={{ display: "flex", alignItems: "flex-end" }}>
            <Title level={3}>{statsInfo?.value}</Title>
          </Col>
        </Row>
      </Col>
    </Row>
  );
};

StatsCard.propTypes = {
  statsInfo: PropTypes.any
}

const Stats = ({ filter }) => {
  const themeVariables = useToken();
  const intl = useIntl();
  const getResponsive = useResponsive();

  const {
    execute: invokeGetEmirateStatistics,
    status: emirateStatisticsStatus,
    value: emirateStatisticsValue,
  } = useAsync({ asyncFunction: getEmirateStatistics });

  const isAllGender = filter?.gender?.value === "all";
  const isMaleGender = filter?.gender?.value === "male";
  const isFemaleGender = filter?.gender?.value === "female";

  const statsInfo = [
    {
      icon: <UsersFour size={24} fill={themeVariables?.token?.["purple-6"]} />,
      label: intl?.formatMessage({ id: "Total Visa Holders" }),
      value: formatNumber(emirateStatisticsValue?.data?.total_visa_holders),
      bgColor: themeVariables?.token?.["purple-1"],
      iconBgColor: themeVariables?.token?.["purple-2"],
    },
    {
      icon: (
        <IdentificationCard
          size={24}
          fill={themeVariables?.token?.["brand-gold-6"]}
        />
      ),
      label: intl?.formatMessage({ id: "Golden Visa Holders" }),
      value: formatNumber(emirateStatisticsValue?.data?.golden_visa_holders),
      bgColor: themeVariables?.token?.["brand-gold-1"],
      iconBgColor: themeVariables?.token?.["brand-gold-2"],
    },
    {
      icon: <Garage size={24} fill={themeVariables?.token?.["green-6"]} />,
      label: intl?.formatMessage({ id: "Total Border Movements" }),
      value: formatNumber(emirateStatisticsValue?.data?.total_board_movements),
      bgColor: themeVariables?.token?.["green-1"],
      iconBgColor: themeVariables?.token?.["green-2"],
    },
    ...((isMaleGender || isAllGender)
      ? [
        {
          icon: (
            <GenderMale size={24} fill={themeVariables?.token?.["blue-6"]} />
          ),
          label: intl?.formatMessage({ id: "Male Expatriates" }),
          value: formatNumber(emirateStatisticsValue?.data?.male_residents),
          bgColor: themeVariables?.token?.["blue-1"],
          iconBgColor: themeVariables?.token?.["blue-2"],
        },
      ]
      : []),
    ...((isFemaleGender || isAllGender)
      ? [
        {
          icon: (
            <GenderFemale
              size={24}
              fill={themeVariables?.token?.["orange-6"]}
            />
          ),
          label: intl?.formatMessage({ id: "Female Expatriates" }),
          value: formatNumber(emirateStatisticsValue?.data?.female_residents),
          bgColor: themeVariables?.token?.["orange-1"],
          iconBgColor: themeVariables?.token?.["orange-2"],
        },
      ]
      : []),
  ];

  useEffect(() => {
    const nationalityParam = !filter?.nationality?.country_alpha3
      ? ""
      : `&nationality_code=${filter?.nationality?.country_alpha3}`;
    const emirateParam = !filter?.emirate?.emirate_code
      ? ""
      : `&emirate_code=${filter?.emirate?.emirate_code}`;
    const _params = `gender=${filter?.gender?.apiKey}${emirateParam}${nationalityParam}`;

    invokeGetEmirateStatistics({
      params: _params,
    });
  }, [
    filter?.gender,
    filter?.emirate,
    filter?.nationality,
    invokeGetEmirateStatistics,
  ]);

  const isLoading =
    emirateStatisticsStatus === "idle" || emirateStatisticsStatus === "pending";

  return (
    <Card
      bodyStyle={{
        padding: getResponsive({
          default: themeVariables?.token?.paddingLG,
          desktop: themeVariables?.token?.padding,
        }),
      }}
      loading={isLoading}
    >
      <Row
        gutter={[themeVariables?.token?.marginSM, themeVariables?.token?.marginSM]}
      >
        {statsInfo?.map((ele, idx) => (
          <Col
            key={ele?.label || idx}
            isFlex
            flex={getResponsive({
              default: isAllGender ? "20%" : "25%",
              midTablet: resolveTernary(isAllGender, (resolveTernary(idx === statsInfo?.length - 1, "100%", "50%")), "50%"),
              mobile: "100%",
            })}
          >
            <StatsCard statsInfo={ele} />
          </Col>
        ))}
      </Row>
    </Card>
  );
};

Stats.propTypes = {
  filter: PropTypes.any
}
export default Stats;
