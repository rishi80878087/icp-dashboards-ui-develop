import PropTypes from "prop-types"
import { Row, Col, Tooltip, PhosphorIcons } from "re-usable-design-components";
import DashboardCard from "@/components/DashboardCard";
import { useIntl } from "react-intl";
import AgeRange from "@/svgr/AgeRange";
import useResponsive from "@/hooks/useResponsive";
import { useEffect } from "react";
import useAsync from "@/hooks/useAsync";
import { getBorderMovementsByAge } from "@/services/borderMovementService";
import PlotlyChart from "@/components/PlotlyChart";
import { formatNumber } from "@/utils/helper";

const { Info } = PhosphorIcons;

function getTooltip(isRtl, intl) {
  return function () {
    return `
      <div style="font-family: var(--fontFamily); text-align: ${
  isRtl ? "right" : "left"
}">
        ${intl?.formatMessage({
    id: "Age Range",
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

function ResidentsByAge({ filter, isRtl, dateRange, isPreview }) {
  const intl = useIntl();
  const {
    execute: invokeGetBorderMovementsByAge,
    status: borderMovementsByAgeStatus,
    value: borderMovementsByAgeValue,
  } = useAsync({ asyncFunction: getBorderMovementsByAge });

  useEffect(() => {
    invokeGetBorderMovementsByAge({
      filter: { ...filter, ...dateRange }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, dateRange]);

  const data = borderMovementsByAgeValue?.data?.chart?.data || [];
  
  const isLoading = ["idle", "pending"]?.includes(borderMovementsByAgeStatus);
  const isEmpty = !isLoading && !data?.length;
  const getResponsive = useResponsive();

  return (
    <DashboardCard
      bodyBackgroundColor="transparent"
      cardBodyHeight={getResponsive({ default: "426px", desktop: "426px", midTablet: "420px" })}
      title={
        <Row wrap={false} gutter={[4]} align="middle">
          <Col flex="none">
            {intl?.formatMessage({ id: "Border Movements by Age" })}
          </Col>
          {
            !isPreview &&
            <Col flex="none">
              <Tooltip
                title={intl?.formatMessage({ id: `Explore border movement trends segmented by age groups` })}
              >
                <span>
                  <Info style={{ marginBottom: "3px" }} color="var(--colorIcon)" size={14} weight="bold" />
                </span>
              </Tooltip>
            </Col>
          }
        </Row>
      }
      icon={<AgeRange />}
      loading={isLoading}
      isEmpty={isEmpty}
      cardBodyPadding={"0px"}
    >
      <Row isFullHeight>
        <Col>
          <PlotlyChart
            data={data?.length
              ? [{
                ...data?.[0],
                hovertemplate: `
                  ${intl?.formatMessage({ id: "Age Range" })}</b>: <b>%{y}</b>&nbsp;&nbsp;<br>
                  ${intl?.formatMessage({ id: "Value" })}: <b>%{x}</b>&nbsp;&nbsp;<extra></extra>
                `,
              }]
              : []}
            layout={{
              showlegend: false, // This hides the legend
            }}
            yAxisTitle={intl?.formatMessage({ id: "Age Range" })}
          />
        </Col>
      </Row>
    </DashboardCard>
  );
}

ResidentsByAge.propTypes = {
  filter: PropTypes.any,
  isRtl: PropTypes.any,
  dateRange: PropTypes.any,
  isPreview: PropTypes.any
}

export default ResidentsByAge;
