import PropTypes from "prop-types"
import { Row, Col, PhosphorIcons, Tooltip, Text, Table, Progress, Card, theme } from "re-usable-design-components";
import DashboardCard from "@/components/DashboardCard";
import { useIntl } from "react-intl";
import PieChart from "@/components/PieChart";
import ResidencyType from "@/svgr/ResidencyType";
import React, { useState, useEffect } from "react";
import { formatNumber, resolveTernary, getColorByIndex } from "@/utils/helper";
import { legendsConfig, tooltipConfig } from "@/utils/highchartsConfig";
import { getVisaHoldersByVisaType } from "@/services/activeResidenceService";
import useAsync from "@/hooks/useAsync";
import Segmented from "@/components/Segmented";
import useResponsive from "@/hooks/useResponsive";


const { ChartPie, ListBullets, Buildings, Briefcase, IdentificationCard, Info } = PhosphorIcons;

const { useToken } = theme;

function getTooltip(isRtl, intl) {
  return function () {
    return `
    <div style="font-family: var(--fontFamily); text-align: ${isRtl ? "right" : "left"}">
      ${intl?.formatMessage({ id: "Visa Type" })}: <span style="font-weight: bold;">${this?.key}</span>
    </div>
    <div style="font-family: var(--fontFamily); text-align: ${isRtl ? "right" : "left"}">
      ${intl?.formatMessage({ id: "Value" })}: <span style="font-weight: bold;">${_.isNumber(this?.point?.y) ? formatNumber(this?.point?.y) : '-'}</span>
    </div>
  `;
  }
}

function FormatText(v) {
  return v ? <Text>{`${v}`}</Text> : <Text>-</Text>
}

function getBorderColor(selectedOptions, item, themeVariables) {
  return selectedOptions?.visa_type_en === item?.visa_type_en
    ? themeVariables?.token?.colorPrimaryBase
    : themeVariables?.token?.colorBorderSecondary
}

function VisaHoldersByVisaType({ filters, isRtl }) {
  const intl = useIntl();
  const getResponsive = useResponsive();
  const [showBy, setShowBy] = useState("chart");
  const [selectedOptions, setSelectedOptions] = useState(undefined);
  const themeVariables = useToken();
  const {
    execute,
    status,
    value,
  } = useAsync({ asyncFunction: getVisaHoldersByVisaType });

  useEffect(() => {
    execute({ filters: { ...filters } })
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
      data: data?.map((v, index) => ({
        name: getResponsive({ default: (isRtl ? v?.visa_type_ar : v?.visa_type_en), mobile: (isRtl ? v?.visa_type_ar : v?.visa_type_en) }),
        y: v?.total_movements,
        color: !selectedOptions || selectedOptions?.visa_type_en === v?.visa_type_en ? getColorByIndex(index) : "var(--geek-blue-2)",
        dataLabels: {
          enabled: false,
        },
        showInLegend: true,
      }))
    },
  ];


  const props = {
    title: "",
    values,
    style: {},
    type: "basicPie",
    legend: {
      enabled: false,
      ...(getResponsive({ default: legendsConfig, mobile: legendsConfig })),
      rtl: isRtl,
    },
    tooltip: {
      formatter: getTooltip(isRtl, intl),
      ...tooltipConfig,
    },
  };

  const totalCount = data?.reduce((acc, v) => {
    acc += (v?.total_movements || 0);
    return acc;
  }, 0);

  return (
    <DashboardCard
      title={(
        <Row align="middle" gutter={4}>
          <Col flex="none">
            {intl.formatMessage({ id: "Visa Holders by Visa Type" })}
          </Col>
          <Col flex="none">
            <Tooltip
              title={intl?.formatMessage({ id: "visa_holders_visa_type_tooltip" })}
            >
              <span>
                <Info style={{ marginBottom: "3px" }} color="var(--colorIcon)" size={14} weight="bold" />
              </span>
            </Tooltip>
          </Col>
        </Row>
      )}
      {
        ...showBy !== "chart" && {
          bodyBackgroundColor: "transparent",
          bodyWrapStyle: {
            padding: '0px'
          }
        }
      }
      icon={<ResidencyType />}
      loading={isLoading}
      cardBodyHeight={getResponsive({ default: "440px", desktop: "412px", mobile: "auto" })}
      isEmpty={isEmpty}
      action={(
        !isEmpty &&
        <Segmented
          isSegmentedBold
          size="default"
          block={getResponsive({
            default: false,
            mobile: true,
          })}
          onChange={(e) => {
            setShowBy(e);
          }}
          value={showBy}
          options={[
            {
              icon: <ChartPie style={{ marginBottom: "3px" }} size={16} />,
              label: <Text>{intl.formatMessage({ id: "Chart" })}</Text>,
              value: "chart"
            },
            {
              icon: <ListBullets style={{ marginBottom: "3px" }} size={16} />,
              label: <Text>{intl.formatMessage({ id: "List" })}</Text>,
              value: "list"
            }
          ]}
        />
      )}
    >
      {
        showBy == "chart"
          ? (
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
              <Col
                flex={getResponsive({ default: "0 0 174px", mobile: "0 0 100%" })}
                style={{
                  margin: "auto"
                }}
              >
                <Row gutter={[0, themeVariables?.token?.marginXS]}>
                  {data?.map((item, index) => {
                    const globalFilterApplied = false;
                    const globalFilterActiveEmirate = undefined;
                    return (
                      <Col key={item?.visa_type_en}>
                        <Card
                          bodyStyle={{
                            padding: `${themeVariables.token?.paddingXXS}px ${themeVariables.token?.paddingXS}px`,
                            height: "32px",
                            display: "flex",
                            borderRadius: themeVariables?.token?.borderRadiusLG,
                            border: `1px solid ${getBorderColor(selectedOptions, item, themeVariables)}`,
                            borderBottomWidth: selectedOptions && selectedOptions?.visa_type_ar === selectedOptions?.visa_type_en
                              ? 2
                              : 1,
                          }}
                          onCardClick={() => {
                            if (selectedOptions?.visa_type_en == item?.visa_type_en) {
                              setSelectedOptions(undefined)
                            } else {
                              setSelectedOptions(item)
                            }
                          }}
                        >
                          <Row
                            align="middle"
                            justify="space-between"
                            style={{ width: "100%" }}
                            wrap={false}
                          >
                            <Col flex="none">
                              <Row isFlex align="middle">
                                <Col
                                  isFlex
                                  flex="none"
                                  style={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: "50%",
                                    backgroundColor: getColorByIndex(index)
                                  }}
                                />
                                <Col
                                  isFlex
                                  flex="none"
                                  paddingInline={`${themeVariables?.token?.paddingXXS}px 0px`}
                                >
                                  <Text size="sm">{isRtl ? item?.visa_type_ar : item?.visa_type_en}</Text>
                                </Col>
                              </Row>
                            </Col>
                            <Col flex="none">
                              {globalFilterApplied ? (
                                <Text size="sm" strong>
                                  :&nbsp;
                                  {getGlobalFilterItem(globalFilterActiveEmirate, item)}
                                </Text>
                              ) : (
                                <Text
                                  ellipsis={{
                                    tooltip: _.isNumber(item?.total_movements)
                                      ? formatNumber(item?.total_movements)
                                      : "-"
                                  }}
                                  size="sm"
                                  strong
                                >
                                  :&nbsp;
                                  {_.isNumber(item?.total_movements)
                                    ? formatNumber(item?.total_movements)
                                    : "-"}
                                </Text>
                              )}
                            </Col>
                          </Row>
                        </Card>
                      </Col>
                    );
                  })}
                </Row>
              </Col>
            </Row>
          )
          : (
            <Row
              isFullHeight
              wrap={getResponsive({ default: false, mobile: true })}
            >
              <Col
                style={{
                  border: "1px solid var(--colorSplit)",
                  borderRadius: "6px"
                }}
              >
                <Table
                  columns={[
                    {
                      title: intl?.formatMessage({ id: "Visa Type" }),
                      width: "50%",
                      render: (v) => {
                        return isRtl ? v?.visa_type_ar : v?.visa_type_en
                      }
                    },
                    {
                      title: intl?.formatMessage({ id: "Visa Holders" }),
                      width: "50%",
                      render: (v) => {
                        const percent = Number(((v?.total_movements / totalCount) * 100)?.toFixed(1));
                        return (
                          <Row align="middle" gutter={getResponsive({ default: [12], tablet: [0, 0], midTablet: [12], mobile: [0, 0] })}>
                            <Col flex="auto">
                              <Tooltip
                                title={Number(percent) ? `${Number(percent)}%` : "-"}
                              >
                                <Progress
                                  strokeColor={"var(--colorPrimaryBase)"}
                                  percent={Number(percent)}
                                  showInfo={true}
                                  format={(val) => FormatText(v?.total_movements)}
                                />
                              </Tooltip>
                            </Col>
                          </Row>
                        )
                      },
                    }
                  ]}
                  scroll={{
                    y: getResponsive({ default: 330, tablet: 330, midTablet: 300, mobile: 330 }),
                  }}
                  pagination={false}
                  dataSource={data}
                />
              </Col>
            </Row>
          )
      }
    </DashboardCard>
  )
}

VisaHoldersByVisaType.propTypes = {
  allTypes: PropTypes.any,
  filters: PropTypes.any,
  isRtl: PropTypes.any,
}

export default VisaHoldersByVisaType;