import React, { useState, useEffect } from "react";
import {
  Row,
  Col,
  PhosphorIcons,
  Text,
  Tooltip,
} from "re-usable-design-components";
import Gender from "@/svgr/Gender";
import _ from "lodash";

import Tabs from "@/components/Tabs"
import TabItemSecondary from "@/components/Tabs/TabItemSecondary"

import useResponsive from "@/hooks/useResponsive";
import useAsync from "@/hooks/useAsync";

import GenderMale from "@/svgr/GenderMale"
import GenderFemaleOrange from "@/svgr/GenderFemaleOrange"

import { useIntl } from "react-intl";
import { getResidentsByGender } from "@/services/activeResidenceService";
import DashboardCard from "@/components/DashboardCard";
import Segmented from "@/components/Segmented";
import PieChart from "@/components/PieChart";

import CountrySpecificGender from "./components/CountrySpecificGender";
import { legendsConfig, tooltipConfig } from "@/utils/highchartsConfig";
import { formatNumber } from "@/utils/helper";

const { UsersThree, ChartDonut, GlobeHemisphereWest, Info } = PhosphorIcons;

function getTooltip(isRtl, intl) {
  return function () {
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
  };
}

const NewResidentsByGender = ({ filters, isRtl }) => {
  const getResponsive = useResponsive();
  const intl = useIntl();

  const [showBy, setShowBy] = useState("overall");

  const { execute, status, value } = useAsync({
    asyncFunction: getResidentsByGender,
  }); // getting data to be shown in overall tab

  const data = value?.data?.summary || {};
  const countrySpecificData = value?.data?.nationalities || [];

  useEffect(() => {
    execute({ filters: { ...filters } });
  }, [filters]);
  useEffect(() => {
    console.log("#country_specific_data ", countrySpecificData);
    console.log('#gender_main_data ', data);
  }, [countrySpecificData, data]);

  const isLoading = ["idle", "pending"]?.includes(status);
  const isEmpty = !isLoading && !countrySpecificData?.length;

  const values = [
    {
      size: "100%",
      innerSize: "65%",
      showInLegend: true,
      colorByPoint: true,
      data: [
        {
          name: intl.formatMessage({ id: "Male" }),
          y: data?.males,
          color: "var(--male-color)",
          dataLabels: {
            enabled: false,
          },
          showInLegend: true,
        },
        {
          name: intl.formatMessage({ id: "Female" }),
          y: data?.females,
          color: "var(--female-color)",
          dataLabels: {
            enabled: false,
          },
          showInLegend: true,
        },
      ],
    },
  ];

  function getSubtitle() {
    return `
            <div style="text-align: center;">
              <div style="font-size: 20px; font-weight: 600; font-family: var(--fontFamily); color: var(--colorText)">${formatNumber(
                data?.total || 0
              )}</div>
              <div style="font-size: 12px; font-weight: 400; font-family: var(--fontFamily); color: var(--colorTextLabel)">${intl?.formatMessage(
                { id: "Total" }
              )}</div>
            </div>`;
  }

  const props = {
    title: "",
    values,
    style: {},
    type: "basicPie",
    legend: {
      ...legendsConfig,
      rtl: isRtl,
    },
    subtitle: {
      useHTML: true,
      text: getSubtitle(),
      floating: true,
      verticalAlign: "middle",
      y: 15,
    },
    tooltip: {
      formatter: getTooltip(isRtl, intl),
      ...tooltipConfig,
    },
  };

  return (
    <DashboardCard
      title={
        <Row gutter={4}>
          <Col flex="none">
            {intl?.formatMessage({ id: "Residents By Gender" })}
          </Col>
          <Col flex="none">
            <Tooltip
              title={intl?.formatMessage({
                id: "active_residence_residency_gender_tooltip",
              })}
            >
              <span>
                <Info
                  style={{ marginBottom: "3px" }}
                  color="var(--colorIcon)"
                  size={14}
                  weight="bold"
                />
              </span>
            </Tooltip>
          </Col>
        </Row>
      }
      icon={<Gender />}
      cardBodyHeight={getResponsive({
        default: "440px",
        desktop: "412px",
        mobile: showBy !== "overall" ? "412px" : "auto",
      })}
      loading={isLoading}
      isEmpty={isEmpty}
      action={
        !isEmpty && (
          <Segmented
            isSegmentedBold
            size="default"
            onChange={(e) => {
              setShowBy(e);
            }}
            block={getResponsive({
              default: false,
              mobile: true,
            })}
            value={showBy}
            options={[
              {
                icon: <ChartDonut style={{ marginBottom: "3px" }} size={16} />,
                label: <Text>{intl.formatMessage({ id: "Overall" })}</Text>,
                value: "overall",
              },
              {
                icon: (
                  <GlobeHemisphereWest
                    style={{ marginBottom: "3px" }}
                    size={16}
                  />
                ),
                label: (
                  <Text>{intl.formatMessage({ id: "Country Specific" })}</Text>
                ),
                value: "country_specific",
              },
            ]}
          />
        )
      }
    >
      <Row isFullHeight>
        <Col>
          {showBy === "overall" ? (
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

              <Col flex={getResponsive({ default:  "0 0 174px", mobile: "0 0 100%" })}>
                    <Tabs 
                      isCustom
                      customType={"secondary"}
                      tabStyle={{
                        cursor: "normal"
                      }}
                      options={[
                        {
                          key: "all",
                          children: (
                            <TabItemSecondary value={formatNumber(data?.total || 0) || "-"} icon={<UsersThree weight="duotone" size={24} color="var(--colorPrimaryBase)" />} label={intl?.formatMessage({ id: "Total Active Residents" })} />
                          )
                        },
                        {
                          key: "male",
                          children: (
                            <TabItemSecondary value={formatNumber(data?.males) || "-"} icon={<GenderMale weight="duotone" color="var(--male-color)" size={24} />} label={intl?.formatMessage({ id: "Male Residents" })} />
                          )
                        },
                        {
                          key: "female",
                          children: (
                            <TabItemSecondary value={formatNumber(data?.females) || "-"} icon={<GenderFemaleOrange weight="duotone" color="var(--female-color)" size={24} />} label={intl?.formatMessage({ id: "Female Residents" })} />
                          )
                        }
                      ]}
                    />  {/*Tabs for shwoing total, male and female residents parallel to piechart */}
                  </Col>
            </Row>
          ) : (
            <CountrySpecificGender
              filter={filters}
              data={countrySpecificData}
            />
          )}
        </Col>
      </Row>
    </DashboardCard>
  );
};

export default NewResidentsByGender;
