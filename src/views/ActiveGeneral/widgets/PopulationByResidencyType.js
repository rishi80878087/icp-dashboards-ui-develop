import PropTypes from "prop-types"
import { Row, Col, PhosphorIcons, Tooltip } from "re-usable-design-components";
import DashboardCard from "@/components/DashboardCard";
import { useIntl } from "react-intl";
import PieChart from "@/components/PieChart";
import Tabs from "@/components/Tabs";
import TabItemSecondary from "@/components/Tabs/TabItemSecondary";
import ExpatriateGlobe from "@/svgr/ExpatriateGlobe";
import { useState, useEffect } from "react";
import { formatNumber } from "@/utils/helper";
import { legendsConfig, tooltipConfig } from "@/utils/highchartsConfig";
import { getResidentsByResidencyType } from "@/services/activeGeneralService";
import useAsync from "@/hooks/useAsync";
import useResponsive from "@/hooks/useResponsive";

const { Buildings, Briefcase, HouseLine, Info } = PhosphorIcons;

const colors = {
  "3": "var(--service-color)",
  "1": "var(--blue-6)",
  "2": "var(--cyan-6)",
}


function getTooltip(isRtl, intl) {
  return function() {
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

function ResidentsByResidencyType({ filters, isRtl }) {
  const intl = useIntl();
  const getResponsive = useResponsive();
  const [showBy] = useState();
  const {
    execute,
    status,
    value,
  } = useAsync({ asyncFunction: getResidentsByResidencyType });

  useEffect(() => {
    execute({ filters })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const isLoading = ["idle", "pending"]?.includes(status);
  const data = value?.data || [];
  const isEmpty = !isLoading && !data?.length;

  const values = [
    {
      size: '100%',
      showInLegend: true, 
      colorByPoint: true,          
      data: data?.map((v) => ({
        name: getResponsive({ default: (isRtl ? v?.resident_type_ar : v?.resident_type_en), mobile: (isRtl ? v?.resident_type_ar : v?.resident_type_en)?.split(" ")?.[0] }),
        y: v?.count,
        dataLabels: {
          enabled: false,
        },
        showInLegend: true,
        color: colors?.[v?.resident_type_code]
      }))
    },
  ];
  
  
  const props = {
    title: "",
    values,
    style: {},
    type: "basicPie",
    legend: {
      ...(getResponsive({ default: legendsConfig, mobile: legendsConfig })),
      rtl: isRtl,
    },
    tooltip: {
      formatter: getTooltip(isRtl, intl),
      ...tooltipConfig,
    },
  };
  
  const totalCount = data?.reduce((acc, v) => {
    acc += (v?.count || 0);
    return acc;
  }, 0);


  return (
    <DashboardCard
      title={(
        <Row align="middle" gutter={4}>
          <Col flex="none">
            {intl.formatMessage({ id: "Population By Residency Type" })}
          </Col>
          <Col flex="none">
            <Tooltip
              title={intl?.formatMessage({ id: "UAE_Population_By_Residence_Type_Tooltip" })}
            >
              <span>
                <Info style={{ marginBottom: "3px" }} color="var(--colorIcon)" size={14} weight="bold" />
              </span>
            </Tooltip>
          </Col>
        </Row>
      )}
      icon={<ExpatriateGlobe />}
      loading={isLoading}
      cardBodyHeight={getResponsive({ default: "440px", desktop: "412px", mobile: "auto" })}
      isEmpty={isEmpty}
    >
      <Row
        isFullHeight
        gutter={[12, 12]}
        wrap={getResponsive({ default: false, mobile: true })}
      >
        <Col
          flex={getResponsive({ default: "auto", mobile: "0 0 100%" })}
          style={{
            ...getResponsive({ default: false, mobile: true }) && {
              height: "250px"
            }
          }}
        >
          <PieChart {...props} />
        </Col>
        <Col flex={getResponsive({ default:  "0 0 174px", mobile: "0 0 100%" })}>
          <Tabs
            isCustom
            customType={"secondary"}
            activeKey={showBy}
            tabStyle={{
              cursor: "normal"
            }}
            onChange={(key) => {
              // setShowBy(key)
            }}
            options={[
              {
                key: "1",
                children: (
                  <TabItemSecondary rawValue={data?.find((v) => v?.resident_type_code == 1)?.count || 0} totalValue={totalCount} value={formatNumber(data?.find((v) => v?.resident_type_code == 1)?.count) || "-"} icon={<Briefcase weight="duotone" color="var(--blue-6)" size={24} />} label={data?.find((v) => v?.resident_type_code == 1)?.[isRtl ? "resident_type_ar" : "resident_type_en"]} />
                )
              },
              {
                key: "3",
                children: (
                  <TabItemSecondary rawValue={data?.find((v) => v?.resident_type_code == 3)?.count || 0} totalValue={totalCount} value={formatNumber(data?.find((v) => v?.resident_type_code == 3)?.count) || "-"} icon={<Buildings weight="duotone" size={24} color="var(--service-color)" />} label={data?.find((v) => v?.resident_type_code == 3)?.[isRtl ? "resident_type_ar" : "resident_type_en"]} />
                )
              },
              {
                key: "2",
                children: (
                  <TabItemSecondary rawValue={data?.find((v) => v?.resident_type_code == 2)?.count || 0} totalValue={totalCount} value={formatNumber(data?.find((v) => v?.resident_type_code == 2)?.count) || "-"} icon={<HouseLine weight="duotone" color="var(--cyan-6)" size={24} />} label={data?.find((v) => v?.resident_type_code == 2)?.[isRtl ? "resident_type_ar" : "resident_type_en"]} />
                )
              }
            ]}
          />
        </Col>
      </Row>
    </DashboardCard>
  )
}

ResidentsByResidencyType.propTypes = {
  allTypes: PropTypes.any,
  filters: PropTypes.any,
  isRtl: PropTypes.any
}

export default ResidentsByResidencyType;