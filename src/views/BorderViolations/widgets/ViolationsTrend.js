import React, { useContext, useEffect } from "react";
import PropTypes from "prop-types";
import { Row, Col } from "re-usable-design-components";
import DashboardCard from "@/components/DashboardCard";
import useResponsive from "@/hooks/useResponsive";
import { checkRtl } from "@/utils/helper";
import { getVisaViolationTrend } from "@/services/borderViolationService";
import { LocaleContext } from "@/globalContext/locale/localeProvider";
import useAsync from "@/hooks/useAsync";
import PlotlyChart from "@/components/PlotlyChart";


function ViolationsTrend({
  icon, title = "",
  filter, dateRange
}) {
  const [localeStore] = useContext(LocaleContext);
  const isRtl = checkRtl(localeStore);
  const getResponsive = useResponsive()
  const {
    execute: invokeApi,
    status: apiStatus,
    value,
  } = useAsync({ asyncFunction: getVisaViolationTrend });

  const data = value?.data?.chart_data?.data;

  useEffect(() => {
    invokeApi({ filter: { ...filter, ...dateRange, language: isRtl ? "ar": "en" } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, dateRange]);

  const isLoading = ["pending", "idle"]?.includes(apiStatus)

  return (
    <DashboardCard
      bodyBackgroundColor="transparent"
      cardBodyHeight={"calc(100% - 67px)"}
      title={title}
      icon={icon}
      style={{
        height: "100%"
      }}
      isEmpty={!data?.length}
      cardBodyPadding={isLoading ? "var(--paddingPx)" : "0px"}
      loading={isLoading}
      titleItemsWrapProps={{
        wrap: getResponsive({ default: "false", mobile: "true" }) === "true",
        ...getResponsive({ default: false, mobile: true }) && {
          style: {
            maxWidth: "77%",
            whiteSpace: "pre-wrap"
          }
        }
      }}
    >
      <Row
        isFullHeight
      >
        <Col>
          <PlotlyChart
            data={data}
            layout={{
              showlegend: false, // This hides the legend
            }}
          />
        </Col>
      </Row>
    </ DashboardCard>
  )
}

ViolationsTrend.propTypes = {
  icon: PropTypes.any,
  title: PropTypes.any,
  filter: PropTypes.any,
  dateRange: PropTypes.any
}

export default ViolationsTrend;
