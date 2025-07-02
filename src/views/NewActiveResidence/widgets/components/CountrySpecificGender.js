import React, { useMemo, useContext, useEffect } from "react";
import { Row, Col, theme, Text, Empty } from "re-usable-design-components";

import { LocaleContext } from "@/globalContext/locale/localeProvider";
import { checkRtl, formatNumber } from "@/utils/helper";
import { useIntl } from "react-intl";
import DualBarChart from "@/components/DualBarChart";

const { useToken } = theme;
const LABEL_WIDTH = 70;
export default function NationalityByGender({ data = [], filter = {} }) {
  const { formatMessage } = useIntl();
  const { token } = useToken();
  const [localeStore] = useContext(LocaleContext);
  const isRtl = checkRtl(localeStore); // expect locale context to provide the RTL information

  const isAllGender = !filter?.gender_code;
  const isMaleGender = filter?.gender_code === "M";
  const isFemaleGender = filter?.gender_code === "F";

  // formatting data for chart

  const chartData = useMemo(() => {
    if (!data.length) return { xAxis: [], male: [], female: [] };

    return data.reduce(
      (acc, item) => ({
        xAxis: [...acc.xAxis, isRtl ? item.name_ar : item.name_en],
        male: [...acc.male, item.males],
        female: [...acc.female, item.females],
      }),
      { xAxis: [], male: [], female: [] }
    );
  }, [data, isRtl]);

  const getTooltip = (item) => (
    <Row>
      <Col>
        <Text size="sm" color={token?.Menu.colorText}>
          {formatMessage({ id: "Name" })}:{" "}
        </Text>
        <Text size="sm" color={token?.Menu.colorText} strong>
          {item.name}
          {console.log("#item_tooltip ", item)}
        </Text>
      </Col>
      <Col>
        <Text size="sm" color={token?.Menu.colorText}>
          {formatMessage({ id: "Value" })}:{" "}
        </Text>
        <Text size="sm" color={token?.Menu.colorText} strong>
          {item.value ? formatNumber(item.value) : "-"}
        </Text>
      </Col>
    </Row>
  );

  // Common chart props
  const baseChartProps = {
    categories: chartData.xAxis, // country name
    tooltip: { formatter: getTooltip },
  };

  useEffect(() => {
    console.log("#chartData ", chartData);
  }, [chartData]);

  const maleChartProps = {
    ...baseChartProps,
    width: isAllGender ? `calc(50% + ${LABEL_WIDTH / 2}px)` : "100%",
    values: [{ data: chartData.male, color: "var(--male-color)" }],
  };

  const femaleChartProps = {
    ...baseChartProps,
    width: isAllGender ? `calc(50% + ${LABEL_WIDTH / 2}px)` : "100%",
    values: [{ data: chartData.female, color: "var(--female-color)" }],
  };

  // need to render empty state if no data
  if (!chartData.xAxis.length) {
    return (
      <Row style={{ height: "100%" }}>
        <Col
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Empty />
        </Col>
      </Row>
    );
  }

  const legend = [
    { name: formatMessage({ id: "Male" }), color: "var(--male-color)" },
    { name: formatMessage({ id: "Female" }), color: "var(--female-color)" },
  ];

  return (
    <>
      <DualBarChart
        firstChartData={isRtl ? femaleChartProps : maleChartProps}
        secondChartData={isRtl ? maleChartProps : femaleChartProps}
        getTooltip={getTooltip}
        showBoth={isAllGender}
      />

      <Row
        justify="center"
        gutter={token.margin}
        style={{ marginTop: token.marginXS, direction: isRtl ? "rtl" : "ltr" }}
      >
        {legend.map(({ name, color }) => (
          <Col key={name} flex="none">
            <Row
              style={{ direction: isRtl ? "rtl" : "ltr" }}
              isFlex
              align="middle"
            >
              <Col
                isFlex
                flex="none"
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  backgroundColor: color,
                }}
              />
              <Col
                isFlex
                flex="none"
                paddingInline={`${token?.paddingXXS}px 0px`}
              >
                <Text size="sm">{name}</Text>
              </Col>
            </Row>
          </Col>
        ))}
      </Row>
    </>
  );
}
