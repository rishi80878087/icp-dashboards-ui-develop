import PropTypes from "prop-types"
import { Row, Col, PhosphorIcons, Tooltip } from "re-usable-design-components";
import DashboardCard from "@/components/DashboardCard";
import { useIntl } from "react-intl";
import { useState, useEffect } from "react";
import Gender from "@/svgr/Gender";
import PieChart from "@/components/PieChart";
import Tabs from "@/components/Tabs";
import TabItemSecondary from "@/components/Tabs/TabItemSecondary";
import { formatNumber, resolveTernary } from "@/utils/helper";
import { legendsConfig, tooltipConfig } from "@/utils/highchartsConfig";
import { getResidentsByGender } from "@/services/activeGeneralService";
import useAsync from "@/hooks/useAsync";
import GenderMale from "@/svgr/GenderMale"
import GenderFemale from "@/svgr/GenderFemale"
import useResponsive from "@/hooks/useResponsive";
import _ from "lodash";

const { Info } = PhosphorIcons;

function getTooltip(isRtl, intl) {
  return function() {
    return `
    <div style="font-family: var(--fontFamily); text-align: ${
  isRtl ? "right" : "left"
}">
      ${intl?.formatMessage({
    id: "Gender",
  })}: <span style="font-weight: bold;">${this?.key}</span>
    </div>
    <div style="font-family: var(--fontFamily); text-align: ${
  isRtl ? "right" : "left"
}">
      ${intl?.formatMessage({
    id: "Value",
  })}: <span style="font-weight: bold;">${
  _.isNumber(this?.point?.y) ? formatNumber(this?.point?.y) : "-"
}</span>
    </div>
  `;
  }
}

function ResidentsByGender({ filter, isRtl }) {
  const intl = useIntl();
  const getResponsive = useResponsive();
  const [showBy] = useState();
  const {
    execute: invokeGetResidentsByGender,
    status: residentsByGenderStatus,
    value: residentsByGenderValue,
  } = useAsync({ asyncFunction: getResidentsByGender });

  useEffect(() => {
    invokeGetResidentsByGender({
      filter: filter
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const isLoading = ["idle", "pending"]?.includes(residentsByGenderStatus);
  const isEmpty = !isLoading && !residentsByGenderValue?.data?.male_residents && !residentsByGenderValue?.data?.female_residents && !residentsByGenderValue?.data?.others_residents

  const isAllView = !filter?.gender?.length
  const isMaleView = filter?.gender === 'Male'
  const isFemaleView = filter?.gender === 'Female'
  // const isOthersView = filter?.gender === 'Others'

  const values = [
    {
      size: "100%",
      showInLegend: true,
      colorByPoint: true,
      data: [
        ...((isAllView || isMaleView) ? [
          {
            name: intl?.formatMessage({ id: "Male" }),
            y: residentsByGenderValue?.data?.male_residents || 0,
            color: "var(--blue-5)",
            dataLabels: {
              enabled: false,
            },
            showInLegend: true,
          },
        ] : []),
        ...(resolveTernary(isAllView, isAllView, isFemaleView) ? [
          {
            name: intl?.formatMessage({ id: "Female" }),
            y: resolveTernary(residentsByGenderValue?.data?.female_residents, residentsByGenderValue?.data?.female_residents, 0),
            color: "var(--purple-4)",
            dataLabels: {
              enabled: false,
            },
            showInLegend: true,
          }
        ] : []),
        // ...((isAllView || isOthersView) ? [
        //   {
        //     name: intl?.formatMessage({ id: "Others" }),
        //     y: residentsByGenderValue?.data?.others_residents || 0,
        //     color: "var(--others-color)",
        //     dataLabels: {
        //       enabled: false,
        //     },
        //     showInLegend: true,
        //   }
        // ] : []),
      ],
    },
  ];

  const props = {
    title: "",
    values,
    style: {},
    type: "basicPie",
    legend: {
      ...legendsConfig,
      rtl: isRtl,
    },
    tooltip: {
      formatter: getTooltip(isRtl, intl),
      ...tooltipConfig,
    },
  };

  return (
    <DashboardCard
      title={(
        <Row align="middle" gutter={4}>
          <Col flex="none">
            {intl.formatMessage({ id: "Population By Gender" })}
          </Col>
          <Col flex="none">
            <Tooltip
              title={intl?.formatMessage({ id: "UAE_Population_By_Gender_Tooltip" })}
            >
              <span>
                <Info style={{ marginBottom: "3px" }} color="var(--colorIcon)" size={14} weight="bold" />
              </span>
            </Tooltip>
          </Col>
        </Row>
      )}
      icon={<Gender />}
      loading={isLoading}
      isEmpty={isEmpty}
      cardBodyHeight={getResponsive({ default: undefined,mobile: "550px", })}
    >
      <Row isFullHeight>
        <Col>
          <Row
            isFullHeight
            gutter={[12, 12]}
            wrap={getResponsive({ default: false, mobile: true })}
          >
            <Col
              flex={getResponsive({ default: "auto", mobile: "0 0 100%" })}
              style={{
                ...(getResponsive({ default: false, mobile: true }) && {
                  height: "250px",
                }),
              }}
            >
              <PieChart {...props} />
            </Col>
            <Col
              flex={getResponsive({ default: "0 0 174px", mobile: "0 0 100%" })}
            >
              <Tabs
                isCustom
                customType={"secondary"}
                activeKey={showBy}
                tabStyle={{
                  cursor: "normal",
                }}
                onChange={(key) => {
                  // setShowBy(key)
                }}
                options={[
                  {
                    key: "male",
                    children: (
                      <TabItemSecondary
                        value={(isAllView || isMaleView) ? (
                          formatNumber(
                            resolveTernary(residentsByGenderValue?.data?.male_residents, residentsByGenderValue?.data?.male_residents, 0)
                          ) || "-") : "-"
                        }
                        icon={
                          <GenderMale
                            weight="duotone"
                            color="var(--blue-5)"
                            size={24}
                          />
                        }
                        label={intl?.formatMessage({ id: "Male Population" })}
                      />
                    ),
                  },
                  {
                    key: "female",
                    children: (
                      <TabItemSecondary
                        value={(isAllView || isFemaleView) ? (
                          formatNumber(
                            residentsByGenderValue?.data?.female_residents || 0
                          ) || "-") : '-'
                        }
                        icon={
                          <GenderFemale
                            weight="duotone"
                            color="var(--purple-4)"
                            size={24}
                          />
                        }
                        label={intl?.formatMessage({ id: "Female Population" })}
                      />
                    ),
                  },
                ]}
              />
            </Col>
          </Row>
        </Col>
      </Row>
    </DashboardCard>
  );
}

ResidentsByGender.propTypes = {
  filter: PropTypes.any,
  isRtl: PropTypes.any
}

export default ResidentsByGender;
