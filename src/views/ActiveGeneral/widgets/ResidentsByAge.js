import PropTypes from "prop-types"
import { Row, Col, Tooltip, PhosphorIcons } from "re-usable-design-components";
import DashboardCard from "@/components/DashboardCard";
import { useIntl } from "react-intl";
import AgeRange from "@/svgr/AgeRange";
import BarChart from "@/components/BarChart";
import { useEffect } from "react";
import useAsync from "@/hooks/useAsync";
import { getResidentsByAge } from "@/services/activeGeneralService";
import { tooltipConfig } from "@/utils/highchartsConfig";
import { formatNumber } from "@/utils/helper";

const { Info } = PhosphorIcons;

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

function ResidentsByAge({ filter, isRtl }) {
  const intl = useIntl();
  const {
    execute: invokeGetResidentsByAge,
    status: residentsByAgeStatus,
    value: residentsByAgeValue,
  } = useAsync({ asyncFunction: getResidentsByAge });

  useEffect(() => {
    invokeGetResidentsByAge({
      filter: filter
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const data = residentsByAgeValue?.data || [];

  const sortedData = sortAgeRange(data);

  const isLoading = ["idle", "pending"]?.includes(residentsByAgeStatus);
  const isEmpty = !isLoading && !data?.length;

  const { values, categories } = (sortedData || []).reduce(
    (acc, val) => {
      acc.values?.[0]?.data?.push(val?.total_residents);
      acc.categories?.push(val?.age_range);
      return acc;
    },
    {
      values: [
        {
          data: [],
          showInLegend: false,
          color: "var(--violet-60)",
        },
      ],
      categories: [],
    }
  );

  const props = {
    categories: categories,
    values,
    xAxis: {
      title: {
        offset: 75,
        text: intl?.formatMessage({ id: "Age Range" }),
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
      title={(
        <Row align="middle" gutter={4}>
          <Col flex="none">
            {intl.formatMessage({ id: "Population By Age" })}
          </Col>
          <Col flex="none">
            <Tooltip
              title={intl?.formatMessage({ id: "UAE_Population_By_Age_Range_Tooltip" })}
            >
              <span>
                <Info style={{ marginBottom: "3px" }} color="var(--colorIcon)" size={14} weight="bold" />
              </span>
            </Tooltip>
          </Col>
        </Row>
      )}
      icon={<AgeRange />}
      loading={isLoading}
      isEmpty={isEmpty}
      cardBodyPadding={"0px"}
    >
      <Row isFullHeight>
        <Col>
          <BarChart {...props} />
        </Col>
      </Row>
    </DashboardCard>
  );
}

ResidentsByAge.propTypes = {
  filter: PropTypes.any,
  isRtl: PropTypes.any
}

export default ResidentsByAge;
