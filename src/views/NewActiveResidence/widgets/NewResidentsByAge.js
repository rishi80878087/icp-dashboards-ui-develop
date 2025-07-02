import React, { useEffect } from "react";
import { useIntl } from "react-intl";
import useAsync from "@/hooks/useAsync";
import { getResidentsByAgeRange } from "@/services/activeResidenceService";
import DashboardCard from "@/components/DashboardCard";
import { Row, Col, Tooltip, PhosphorIcons } from "re-usable-design-components";
import AgeRange from "@/svgr/AgeRange"
import BarChart from "@/components/BarChart";
import { tooltipConfig } from "@/utils/highchartsConfig";
import { formatNumber } from "@/utils/helper";

const { Info } = PhosphorIcons;

const sortAgeRange= (data)=>{
  let _data = data?.sort((a, b) => {
    const aAge = a?.age_range;
    const bAge = b?.age_range;
    return Number(bAge?.split("-")?.[0]) - Number(aAge?.split("-")?.[0]);
  });  // sort all the data with having x-y

  const plusValues = _data?.filter(value => value?.age_range?.includes('+'))
  _data = _data?.filter(value => !value?.age_range?.includes('+'))   // extracting (60+ and concatenate it to top)

  return [...plusValues, ..._data];
}

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
function NewResidentsByAge({ filters, isRtl }) {
  const intl = useIntl();

  const { execute, status, value } = useAsync({
    asyncFunction: getResidentsByAgeRange,
  });

  useEffect(() => {
    console.log("NewResidentsByAge filters ", filters);
    console.log("NewResidentsByAge isRtl ", isRtl);
  }, [filters, isRtl]);

  useEffect(() => {
    execute({ filters: { ...filters } })
  }, [filters]);


  const isLoading = ["idle", "pending"]?.includes(status);

  const data = value?.data || [];

  const isEmpty = !isLoading && !data?.length;


  // data
//   [
//     {
//         "age_range": "50-59",
//         "count": 45586
//     },
//     {
//         "age_range": "40-49",
//         "count": 47335
//     },
//     {
//         "age_range": "30-39",
//         "count": 44846
//     },
//     {
//         "age_range": "22-29",
//         "count": 23991
//     },
//     {
//         "age_range": "19-21",
//         "count": 24246
//     },
//     {
//         "age_range": "0-18",
//         "count": 93531
//     },
//     {
//         "age_range": "60+",
//         "count": 159627
//     }
// ]

const sortedData= sortAgeRange(data);

  // sorted data
//   [
//     {
//         "age_range": "60+",
//         "count": 159627
//     },
//     {
//         "age_range": "50-59",
//         "count": 45586
//     },
//     {
//         "age_range": "40-49",
//         "count": 47335
//     },
//     {
//         "age_range": "30-39",
//         "count": 44846
//     },
//     {
//         "age_range": "22-29",
//         "count": 23991
//     },
//     {
//         "age_range": "19-21",
//         "count": 24246
//     },
//     {
//         "age_range": "0-18",
//         "count": 93531
//     }
// ]
useEffect(()=>{
  console.log("NewResidentsByAge sortedData ", sortedData);
})

const { age_range, residentCount } = (sortedData || []).reduce((acc, val) => {
  acc.age_range.push(val?.age_range ?? "-");
  acc.residentCount[0].data.push(val?.count ?? 0);
  return acc;
}, {
  age_range: [],
  residentCount: [{
    data: [],
    color: "var(--violet-60)",
    showInLegend: false,
  }],
});  // seaparating age_range and residentCount from sored data for y-axis and x-axis

  const props = {
    categories: age_range,
    values: residentCount,
      xAxis: {
        title: {
          text: intl?.formatMessage({ id: "Age Range" }),
          offset: 75,
          style: {
            color: 'var(--colorText)',
            fontSize: 'var(--fontSizePx)',
          }
        }
      },
      tooltip: {
        formatter: getTooltip(isRtl, intl),
              ...tooltipConfig,
      },
    };

  return (
    <div>
      <DashboardCard
       bodyBackgroundColor="transparent"
        title={
          <Row align="middle" gutter={4}>
            <Col flex="none">
              {intl?.formatMessage({ id: "Residents By Age" })}
            </Col>
            <Col flex="none">
              <Tooltip
                title={intl?.formatMessage({
                  id: "active_residence_residency_age_tooltip",
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
        icon={<AgeRange />}
        loading={isLoading}
        isEmpty={isEmpty}
      >
        <Row isFullHeight>
                <Col>
                  <BarChart {...props} />
                </Col>
              </Row>
      </DashboardCard>
    </div>
  );
}

export default NewResidentsByAge;
