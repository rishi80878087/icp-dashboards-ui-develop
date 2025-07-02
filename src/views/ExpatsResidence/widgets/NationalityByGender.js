import PropTypes from "prop-types"
import React, { useContext, useEffect, useMemo, useState } from "react";
import {
  Row,
  Col,
  theme,
  Text,
  Empty,
} from "re-usable-design-components";
import DashboardCard from "@/components/DashboardCard";
import { useIntl } from "react-intl";
import Gender from "@/svgr/Gender";
import { tooltipConfig } from "@/utils/highchartsConfig";
import { LocaleContext } from "@/globalContext/locale/localeProvider";
import { checkRtl, formatNumber, resolveTernary } from "@/utils/helper";
import { getNationalityByGender } from "@/services/expatsResidenceService";
import useAsync from "@/hooks/useAsync";
import DualBarChart from "@/components/DualBarChart";
import useResponsive from "@/hooks/useResponsive";

const LABEL_WIDTH = 70;
const { useToken } = theme;


const getFormattedData = (isRtl, data = [], nationalitiesConfigValueObj = {}) => {
  const resObj = {
    xAxis: [],
    maleYaxis: [],
    femaleYaxis: [],
  };
  data?.forEach((value) => {
    const countryLabelObj = nationalitiesConfigValueObj[value?.country_alpha3]
  
    resObj.xAxis.push(
      isRtl ? countryLabelObj?.country_ar : countryLabelObj?.country_en
    );
    resObj.maleYaxis.push(value?.male_residents);
    resObj.femaleYaxis.push(value?.female_residents);
  });
  return resObj;
};

function NationalityByGender({ filter: _filter, nationalitiesConfigValueObj }) {
  const intl = useIntl();
  const [filter, setFilter] = useState(_filter);
  const themeVariables = useToken();
  const [localeStore] = useContext(LocaleContext);
  const getResponsive = useResponsive()
  const isRtl = checkRtl(localeStore);

  const {
    execute: invokeGetNationalityByGender,
    status: nationalityByGenderStatus,
    value: nationalityByGenderValue,
  } = useAsync({ asyncFunction: getNationalityByGender });

  const isAllGender = filter?.gender?.value === "all";
  const isMalelGender = filter?.gender?.value === "male";
  const isFemalelGender = filter?.gender?.value === "female";

  function getTooltip(item) {
    return (
      <Row>
        <Col>
          <Row>
            <Col flex="none">
              <Text size="sm" color={themeVariables?.token?.Menu.colorText}>
                {intl?.formatMessage({
                  id: "Name",
                })}
                :
              </Text>
            </Col>
            <Col flex="none">
              <Text
                size="sm"
                strong
                color={themeVariables?.token?.Menu.colorText}
              >
                &nbsp;{item?.name}
              </Text>
            </Col>
          </Row>
        </Col>
        <Col>
          <Row>
            <Col flex="none">
              <Text size="sm" color={themeVariables?.token?.Menu.colorText}>
                {intl?.formatMessage({
                  id: "Value",
                })}
                :
              </Text>
            </Col>
            <Col flex="none">
              <Text
                size="sm"
                strong
                color={themeVariables?.token?.Menu.colorText}
              >
                &nbsp;{item?.value ? formatNumber(item?.value) : "-"}
              </Text>
            </Col>
          </Row>
        </Col>
      </Row>
    );
  }

  useEffect(() => {
    setFilter(_filter)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [_filter])

  const data = useMemo(() => {
    if (nationalityByGenderStatus !== "success") {
      return {}
    }
    
    return getFormattedData(
      isRtl,
      nationalityByGenderValue?.data || [],
      nationalitiesConfigValueObj || {},
    );  
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nationalityByGenderValue?.data, nationalitiesConfigValueObj])
  
  const maleBarProps = {
    categories: resolveTernary(data?.xAxis, data?.xAxis, []),
    width: isAllGender ? `calc(50% + ${LABEL_WIDTH / 2}px)` : "100%",
    values: [
      {
        data: resolveTernary(data?.maleYaxis, data?.maleYaxis, []),
        showInLegend: false,
        color: "var(--male-color)",
      },
    ],
    yAxis: {
      reversed: !isMalelGender,
      lineWidth: 1,
    },
    xAxis: {
      reversed: true,
      opposite: !isMalelGender,
      labels: {
        align: "center",
        reserveSpace: true,
        useHTML: true,
        style: {
          minWidth: `${LABEL_WIDTH}px`,
          textAlign: "center",
          color: "var(--colorText)",
        },
      },
    },
    tooltip: {
      formatter: getTooltip,
      ...tooltipConfig,
    },
  };

  const femaleBarProps = {
    ...maleBarProps,
    width: resolveTernary(isAllGender, `calc(50% - ${LABEL_WIDTH / 2}px)`, "100%"),
    values: [
      {
        data: resolveTernary(data?.femaleYaxis, data?.femaleYaxis, []),
        showInLegend: false,
        color: "var(--female-color)",
      },
    ],
    xAxis: {
      visible: !isMalelGender && !isAllGender,
    },
    yAxis: {
      lineWidth: 1,
    },
  };

  const legendMapping = [
    {
      name: intl?.formatMessage({ id: "Male" }),
      color: "var(--male-color)",
    },
    {
      name: intl?.formatMessage({ id: "Female" }),
      color: "var(--female-color)",
    },
  ];
  
  useEffect(() => {
    const nationalityParam = !filter?.nationality?.country_alpha3
      ? ""
      : `&nationality_code=${filter?.nationality?.country_alpha3}`;
    const emirateParam = !filter?.emirate?.emirate_code
      ? ""
      : `&emirate_code=${filter?.emirate?.emirate_code}`;
    const _params = `gender=${filter?.gender?.apiKey}${emirateParam}${nationalityParam}`;

    invokeGetNationalityByGender({
      params: _params,
    });  
    
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filter?.gender,
    filter?.emirate,
    filter?.nationality,
  ]);

  const isLoading =
    nationalityByGenderStatus === "idle" ||
    nationalityByGenderStatus === "pending";

  return (
    <DashboardCard
      cardBodyHeight={getResponsive({ default: "440px", desktop: "412px", tablet: "454px" })}
      title={intl?.formatMessage({ id: "Nationality By Gender Dashboard 1" })}
      subtitle={intl?.formatMessage({
        id: "Breakdown of nationalities by male and female",
      })}
      icon={<Gender />}
      bodyBackgroundColor="none"
      bodyWrapStyle={{
        padding: 0,
        direction: "ltr",
        height: '100%'
      }}
      loading={isLoading}
    >
      {
        resolveTernary(
          data?.xAxis?.length,
          (
            <>
              <DualBarChart
                firstChartData={isRtl ? femaleBarProps : maleBarProps}
                secondChartData={isRtl ? maleBarProps : femaleBarProps}
                getTooltip={getTooltip}
                showfirstSeries={isRtl ? isFemalelGender: isMalelGender}
                showSecondSeries={isRtl ? isMalelGender: isFemalelGender}
                showBoth={isAllGender}
              />
              <Row
                align="middle"
                gutter={themeVariables?.token?.margin}
                style={{ marginTop: themeVariables.token?.marginXS, display: 'flex', justifyContent: "center", direction: isRtl ? "rtl" : "ltr" }}
              >
                {legendMapping?.map((item) => {
                  return (
                    <Col key={item?.name} flex="none">
                      <Row style={{ direction: isRtl ? "rtl" : "ltr" }} isFlex align="middle">
                        <Col
                          isFlex
                          flex="none"
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            backgroundColor: item?.color
                          }}
                        />
                        <Col
                          isFlex
                          flex="none"
                          paddingInline={`${themeVariables?.token?.paddingXXS}px 0px`}
                        >
                          <Text size="sm">{item?.name}</Text>
                        </Col>
                      </Row>
                    </Col>
                  );
                })}
              </Row>
            </>
          ),
          (
            <Row isFullHeight>
              <Col alignItems="center" justifyContent="center" isFlex>
                <Empty />
              </Col>
            </Row>
          )
        )}
    </DashboardCard>
  );
}

NationalityByGender.propTypes = {
  filter: PropTypes.any,
  nationalitiesConfigValueObj: PropTypes.any
}


export default NationalityByGender;