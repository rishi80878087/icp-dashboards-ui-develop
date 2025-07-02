import { useState, useEffect, useCallback } from "react";
import {
  Row,
  Col,
  PhosphorIcons,
  Text,
  Tooltip,
  Table,
  Progress,
  AntIcons,
} from "re-usable-design-components";
import PieChart from "@/components/PieChart";
import Tabs from "@/components/Tabs";
import TabItemSecondary from "@/components/Tabs/TabItemSecondary";
import useResponsive from "@/hooks/useResponsive";
import useAsync from "@/hooks/useAsync";
import Segmented from "@/components/Segmented";
import { formatNumber } from "@/utils/helper";
import { useIntl } from "react-intl";
import { getResidentsByResidencyType } from "@/services/activeResidenceService";
import DashboardCard from "@/components/DashboardCard";
import { legendsConfig, tooltipConfig } from "@/utils/highchartsConfig";
import ResidencyType from "@/svgr/ResidencyType";
import PlusIconOutlined from "@/svgr/PlusIconOutlined";

const {
  Buildings,
  Briefcase,
  IdentificationCard,
  Info,
  SquaresFour,
  ChartPie,
} = PhosphorIcons;
const { MinusSquareOutlined } = AntIcons;

const COLORS = {
  1: "var(--blue-6)",
  2: "var(--cyan-6)",
  3: "var(--service-color)",
};

const NewResidentsByResidencyType = ({ filters, isRtl }) => {
  const getResponsive = useResponsive();
  const intl = useIntl();
  const [showBy, setShowBy] = useState("overview");
  const [expandedRowKey, setExpandedRowKey] = useState(undefined);

  const { execute, status, value } = useAsync({
    asyncFunction: getResidentsByResidencyType,
  });

  useEffect(() => {
    execute({ filters: { ...filters } });
  }, [execute, filters]);

  useEffect(() => {
    console.log("##residentsByResidencyTypeData_real_Data_for_widget ", value);
  }, [value]);

  const isLoading = ["pending", "idle"].includes(status);
  const data = value?.data || [];
  const isEmpty = !isLoading && data.length === 0;

  // Validate and trim data to handle whitespace
  const validatedData = data.map((item) => ({
    ...item,
    type_en: item.type_en?.trim() || "Unknown",
    type_ar: item.type_ar?.trim() || "Unknown",
    count: item.count || 0,
    type_code: item.type_code?.toString(),
    sub_types: item.sub_types || [], // Default to empty array if sub_types is absent
  }));

  function getTooltip(isRtl, intl) {
    return function () {
      return `
        <div style="font-family: var(--fontFamily); text-align: ${
          isRtl ? "right" : "left"
        }>
          ${intl.formatMessage({
            id: "Residency Type",
          })}: <span style="font-weight: bold;">${this?.key}</span>
        </div>
        <div style="font-family: var(--fontFamily); text-align: ${
          isRtl ? "right" : "left"
        }>
          ${intl.formatMessage({
            id: "Value",
          })}: <span style="font-weight: bold;">${
        this.point.y ? formatNumber(this.point.y) : "-"
      }</span>
        </div>
      `;
    };
  }

  function FormatText(v) {
    return <Text>{`${v}%`}</Text>;
  }

  const totalCount = validatedData.reduce((acc, v) => acc + (v.count || 0), 0);

  const pieChartData = [
    {
      size: "100%",
      showInLegend: true,
      colorByPoint: true,
      data: validatedData.map((item) => ({
        name: getResponsive({
          default: isRtl ? item.type_ar : item.type_en,
          mobile: (isRtl ? item.type_ar : item.type_en)?.split(" ")?.[0],
        }),
        y: item.count,
        dataLabels: { enabled: false },
        showInLegend: true,
        color: COLORS[item.type_code],
      })),
    },
  ];

  const pieChartProps = {
    title: "",
    values: pieChartData,
    style: {},
    type: "basicPie",
    legend: {
      ...getResponsive({ default: legendsConfig, mobile: legendsConfig }),
      rtl: isRtl,
    },
    tooltip: {
      formatter: getTooltip(isRtl, intl),
      ...tooltipConfig,
    },
  };

  const tableColumns = [
    {
      title: intl.formatMessage({ id: "Residency Type" }),
      width: "50%",
      render: (v) => {
        return isRtl ? v.type_ar : v.type_en;
      },
    },
    {
      title: intl.formatMessage({ id: "Number of Residents" }),
      width: "50%",
      render: (v) => {
        const percent = Number(((v.count / totalCount) * 100).toFixed(1));
        return (
          <Row
            align="middle"
            gutter={getResponsive({
              default: [12],
              tablet: [0, 0],
              midTablet: [12],
              mobile: [0, 0],
            })}
          >
            <Col
              flex={getResponsive({ default: "0 0 80px", mobile: "0 0 60px" })}
            >
              <Text
                ellipsis={{ tooltip: v.count ? formatNumber(v.count) : "-" }}
              >
                {v.count ? formatNumber(v.count) : "-"}
              </Text>
            </Col>
            <Col flex="auto">
              <Progress
                strokeColor="var(--colorPrimaryBase)"
                percent={Number(percent)}
                showInfo={true}
                format={FormatText}
              />
            </Col>
          </Row>
        );
      },
    },
  ];

  const expandedRowRender = useCallback(
    (record) => {
      const subTypes = record.sub_types || [];
      if (!subTypes.length) return null;

      return subTypes.map((v) => {
        const percent = Number(((v.count / totalCount) * 100).toFixed(1));
        return (
          <Row key={v.code + record.type_code}>
            <Col flex="0 0 48px"></Col>
            <Col flex="auto">
              <Row>
                <Col span={12}>
                  <Col style={{ paddingInline: "12px" }}>
                    <Text>
                      {isRtl
                        ? v.name_ar?.trim() || "Unknown"
                        : v.name_en?.trim() || "Unknown"}
                    </Text>
                  </Col>
                </Col>
                <Col span={12} style={{ paddingInline: "12px" }}>
                  <Row
                    align="middle"
                    gutter={getResponsive({
                      default: [12],
                      tablet: [0, 0],
                      midTablet: [12],
                      mobile: [0, 0],
                    })}
                  >
                    <Col
                      flex={getResponsive({
                        default: "0 0 80px",
                        mobile: "0 0 60px",
                      })}
                    >
                      <Text
                        ellipsis={{
                          tooltip: v.count ? formatNumber(v.count) : "-",
                        }}
                      >
                        {v.count ? formatNumber(v.count) : "-"}
                      </Text>
                    </Col>
                    <Col flex="auto">
                      <Progress
                        strokeColor="var(--colorPrimaryBase)"
                        percent={Number(percent)}
                        showInfo={true}
                        format={FormatText}
                      />
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Col>
          </Row>
        );
      });
    },
    [isRtl, totalCount, getResponsive]
  );

  return (
    <DashboardCard
      title={
        <Row align="middle" gutter={4}>
          <Col flex="none">
            {intl.formatMessage({ id: "Residents By Residency Type" })}
          </Col>
          <Col flex="none">
            <Tooltip
              title={intl.formatMessage({
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
      loading={isLoading}
      isEmpty={isEmpty}
      icon={<ResidencyType />}
      cardBodyHeight={getResponsive({
        default: "440px",
        desktop: "412px",
        mobile: "auto",
      })}
      action={
        !isEmpty && (
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
                icon: <SquaresFour style={{ marginBottom: "3px" }} size={16} />,
                label: <Text>{intl.formatMessage({ id: "Overview" })}</Text>,
                value: "overview",
              },
              {
                icon: <ChartPie style={{ marginBottom: "3px" }} size={16} />,
                label: (
                  <Text>{intl.formatMessage({ id: "Sub-Categories" })}</Text>
                ),
                value: "sub-categories",
              },
            ]}
          />
        )
      }
    >
      {showBy === "overview" ? (
        <Row
          isFullHeight
          gutter={[12, 12]}
          wrap={getResponsive({ default: false, mobile: true })}
        >
          <Col flex={getResponsive({ default: "auto", mobile: "0 0 100%" })}>
            <PieChart {...pieChartProps} />
          </Col>
          <Col
            flex={getResponsive({ default: "0 0 174px", mobile: "0 0 100%" })}
          >
            <Tabs
              isCustom
              customType="secondary"
              tabStyle={{ cursor: "normal" }}
              options={[
                {
                  key: "1",
                  children: (
                    <TabItemSecondary
                      rawValue={
                        validatedData.find((v) => v.type_code === "1")?.count ||
                        0
                      }
                      totalValue={totalCount}
                      value={
                        formatNumber(
                          validatedData.find((v) => v.type_code === "1")?.count
                        ) || "-"
                      }
                      icon={
                        <Briefcase
                          weight="duotone"
                          color="var(--blue-6)"
                          size={24}
                        />
                      }
                      label={
                        validatedData.find((v) => v.type_code === "1")?.[
                          isRtl ? "type_ar" : "type_en"
                        ]
                      }
                    />
                  ),
                },
                {
                  key: "3",
                  children: (
                    <TabItemSecondary
                      rawValue={
                        validatedData.find((v) => v.type_code === "3")?.count ||
                        0
                      }
                      totalValue={totalCount}
                      value={
                        formatNumber(
                          validatedData.find((v) => v.type_code === "3")?.count
                        ) || "-"
                      }
                      icon={
                        <Buildings
                          weight="duotone"
                          size={24}
                          color="var(--service-color)"
                        />
                      }
                      label={
                        validatedData.find((v) => v.type_code === "3")?.[
                          isRtl ? "type_ar" : "type_en"
                        ]
                      }
                    />
                  ),
                },
                {
                  key: "2",
                  children: (
                    <TabItemSecondary
                      rawValue={
                        validatedData.find((v) => v.type_code === "2")?.count ||
                        0
                      }
                      totalValue={totalCount}
                      value={
                        formatNumber(
                          validatedData.find((v) => v.type_code === "2")?.count
                        ) || "-"
                      }
                      icon={
                        <IdentificationCard
                          weight="duotone"
                          color="var(--cyan-6)"
                          size={24}
                        />
                      }
                      label={
                        validatedData.find((v) => v.type_code === "2")?.[
                          isRtl ? "type_ar" : "type_en"
                        ]
                      }
                    />
                  ),
                },
              ]}
            />
          </Col>
        </Row>
      ) : (
        <Row
          isFullHeight
          wrap={getResponsive({ default: false, mobile: true })}
        >
          <Col
            style={{
              border: "1px solid var(--colorSplit)",
              borderRadius: "6px",
            }}
          >
            <Table
              className="expanded-table"
              columns={tableColumns}
              dataSource={validatedData.map((item) => ({
                ...item,
                key: item.type_code,
              }))}
              scroll={{
                y: getResponsive({
                  default: 330,
                  tablet: 330,
                  midTablet: 300,
                  mobile: 330,
                }),
              }}
              pagination={false}
              rowClassName={(record) =>
                record.key === expandedRowKey ? "expanded-row" : ""
              }
              expandable={{
                expandedRowRender,
                rowExpandable: (record) => !!record.sub_types?.length,
                expandRowByClick: true,
                expandedRowKeys: expandedRowKey ? [expandedRowKey] : [],
                onExpand: (_, record) =>
                  setExpandedRowKey(
                    expandedRowKey === record.key ? null : record.key
                  ),
                expandIcon: ({ expanded, onExpand, record }) =>
                  expanded ? (
                    <MinusSquareOutlined
                      style={{ color: "var(--colorPrimaryBase)" }}
                      onClick={(e) => onExpand(record, e)}
                    />
                  ) : (
                    <PlusIconOutlined
                      style={{ cursor: "pointer" }}
                      onClick={(e) => onExpand(record, e)}
                    />
                  ),
              }}
            />
          </Col>
        </Row>
      )}
    </DashboardCard>
  );
};

export default NewResidentsByResidencyType;
