import PropTypes from "prop-types"
import { Row, Col, Tooltip, PhosphorIcons } from "re-usable-design-components";
import DashboardCard from "@/components/DashboardCard";
import { useIntl } from "react-intl";
import AgeRange from "@/svgr/AgeRange"
import BarChart from "@/components/BarChart";
import { useEffect } from "react";
import useAsync from "@/hooks/useAsync";
import { getResidentsByAgeRange } from "@/services/activeResidenceService";
import { tooltipConfig } from "@/utils/highchartsConfig";
import { formatNumber } from "@/utils/helper";


const { Info } = PhosphorIcons;

function getTooltip(isRtl, intl) {
  return function () {
    return `
    <div style="font-family: var(--fontFamily); text-align: ${isRtl ? "right" : "left"}; direction: ${isRtl ? "rtl" : "ltr"}">
      ${intl?.formatMessage({ id: "Age Range" })}: <span style="font-weight: bold;">${this?.key}</span>
    </div>
    <div style="font-family: var(--fontFamily); text-align: ${isRtl ? "right" : "left"}">
      ${intl?.formatMessage({ id: "Value" })}: <span style="font-weight: bold;">${_.isNumber(this?.point?.y) ? formatNumber(this?.point?.y) : '-'}</span>
    </div>
  `;
  }
}

const sortAgeRange = (data) => {
  let _data = data?.sort((a, b) => {
    const aAge = a?.age_range;
    const bAge = b?.age_range;
    return Number(bAge?.split("-")?.[0]) - Number(aAge?.split("-")?.[0]);
  });

  const plusValues = _data?.filter(value => value?.age_range?.includes('+'))
  _data = _data?.filter(value => !value?.age_range?.includes('+'))

  return [...plusValues, ..._data];
};

function ResidentsByAge({ filters, isRtl }) {
  const intl = useIntl();
  const {
    execute,
    status,
    value,
  } = useAsync({ asyncFunction: getResidentsByAgeRange });

  useEffect(() => {
    execute({ filters: { ...filters } })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const data = value?.data || [];

  const sortedData = sortAgeRange(data);

  const isLoading = ["idle", "pending"]?.includes(status);
  const isEmpty = !isLoading && !data?.length;

  const { values, categories } = (sortedData || []).reduce((acc, val) => {
    acc.values?.[0]?.data?.push(val?.count);
    acc.categories?.push(val?.age_range);
    return acc;
  }, {
    values: [{
      data: [],
      showInLegend: false,
      color: "var(--violet-60)"
    }],
    categories: []
  });

  console.log('### ResidentsByAge sorteddata', sortedData, "##data", data, "##categories ", categories, "##values ", values);

  const props = {
    categories: categories,
    values,
    xAxis: {
      title: {
        text: intl?.formatMessage({ id: "Age Range" }),
        offset: 75,
        style: {
          color: 'var(--colorText)', // Set the title color to red
          fontSize: 'var(--fontSizePx)', // Set the font size
        }
      }
    },
    tooltip: {
      formatter: getTooltip(isRtl, intl),
      ...tooltipConfig,
    },
  };
  
  return (
    <DashboardCard
      bodyBackgroundColor="transparent"
      title={
        <Row align="middle" gutter={4}>
          <Col flex="none">
            {intl?.formatMessage({ id: "Residents By Age" })}
          </Col>
          <Col flex="none">
            <Tooltip
              title={intl?.formatMessage({ id: "active_residence_residency_age_tooltip" })}
            >
              <span>
                <Info style={{ marginBottom: "3px" }} color="var(--colorIcon)" size={14} weight="bold" />
              </span>
            </Tooltip>
          </Col>
        </Row>
      }
      
      icon={<AgeRange />}
      loading={isLoading}
      bodyWrapStyle={{
        padding: '0px'
      }}
      isEmpty={isEmpty}
    >
      <Row isFullHeight>
        <Col>
          <BarChart {...props} />
        </Col>
      </Row>
    </DashboardCard>
  )
}

ResidentsByAge.propTypes = {
  filters: PropTypes.any,
  isRtl: PropTypes.any,
}

export default ResidentsByAge;