import PropTypes from "prop-types"
import { useState, useMemo, useRef, useContext, useEffect } from "react";
import _, { filter } from "lodash";
import { useIntl } from "react-intl";
import useAsync from "@/hooks/useAsync";
import { formatNumber, getColorFromPercentage, emiratesFlagMapping, checkRtl, validateInput, resolveTernary } from "@/utils/helper";
import { LocaleContext } from "@/globalContext/locale/localeProvider";
import { getTouristVisaEmirates, getTouristVisaNationalities, getTouristVisaStatus } from "@/services/visaVioloationService";
import useWorldGeoJSON from "@/hooks/useWorldGeoJson";
import {
  Row, Col, Avatar, Text, Title, theme, Skeleton, Empty,
  Progress, Table, PhosphorIcons, Tooltip, AntIcons
} from "re-usable-design-components";
import DashboardCard from "@/components/DashboardCard";
import ExpatriateGlobe from "@/svgr/ExpatriateGlobe";
import useResponsive from "@/hooks/useResponsive";
import MapWrap from '@/components/MapWrap';
import { TableFilterDropdown, InputWrap  } from "@/components/TableFilterWidgets";
import Tabs from "@/components/Tabs";
import Image from "next/image";
import Flags from 'country-flag-icons/react/1x1'
import ActiveTourist from "@/svgr/ActiveTourist";
import InActiveTourist from "@/svgr/InActiveTourist";
import ViolatedTourist from "@/svgr/ViolatedTourist";

const { GlobeHemisphereWest, Info } = PhosphorIcons
const { SearchOutlined } = AntIcons;

function AllNationality() {
  return <Image width={24} height={24} alt="flag" src={"/All_Nationality.png"} />
}

function StatCard({ label, value, icon, iconBgColor, bgColor }) {
  return (
    <Row
      wrap={false}
      style={{
        backgroundColor: bgColor,
        padding: "var(--paddingPx)",
        borderRadius: "var(--borderRadiusPx)",
        minHeight: "86px"
      }}
    >
      <Col flex="auto">
        <Row>
          <Col>
            <Text
              color="var(--colorTextLabel)"
            >
              {label}
            </Text>
          </Col>
          <Col>
            <Title>
              {value}
            </Title>
          </Col>
        </Row>
      </Col>
      <Col flex="none">
        {!!icon && (
          <Avatar
            backgroundColor={iconBgColor}
            icon={icon}
          />
        )}
      </Col>
    </Row>
  )
}

StatCard.propTypes = {
  label: PropTypes.any,
  value: PropTypes.any,
  icon: PropTypes.any,
  iconBgColor: PropTypes.any,
  bgColor: PropTypes.any
}

function ResidentsByRegionWrapper({
  filter,
  icon,
  nationalitiesConfigValueObj,
  dateRange,
  isPreview,
  isPrint,
  rows,
  callback,
  offset,
  space,
  isMapHidden,
  isTableHidden
}) {
  const { geoJsonObj } = useWorldGeoJSON();
  const intl = useIntl();
  
  const [showBy, setShowBy] = useState(null);
  const [status, setStatus] = useState('active');

  useEffect(() => {
    if (showBy !== visaEmiratesValue?.data?.emirates?.[0]?.code) {
      setShowBy(visaEmiratesValue?.data?.emirates?.[0]?.code)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter])


  const {
    execute: invokeGetVisaEmirates,
    status: visaEmiratesStatus,
    value: visaEmiratesValue,
  } = useAsync({ asyncFunction: getTouristVisaEmirates });

  const {
    execute: invokeGetVisaStatus,
    // status: visaStatus,
    value: visaStatusValues,
  } = useAsync({ asyncFunction: getTouristVisaStatus });

  useEffect(() => {
    invokeGetVisaStatus({
      filter: { ...filter, ...dateRange }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filter
  ]);

  useEffect(() => {
    invokeGetVisaEmirates({
      filter: { ...filter, ...dateRange, status }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filter,
    status,
  ]);

  const isLoading =
    visaEmiratesStatus === "idle" ||
    visaEmiratesStatus === "pending";


  const data = useMemo(() => {
    if (visaEmiratesStatus !== "success") {
      return []
    }
    setShowBy(visaEmiratesValue?.data?.emirates?.[0]?.code)
    return visaEmiratesValue?.data?.emirates;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visaEmiratesValue?.data])
  
  return (
    <VisaByRegionAndNationality
      icon={icon}
      geoJsonObj={geoJsonObj}
      showBy={showBy}
      setShowBy={setShowBy}
      status={status}
      setStatus={setStatus}
      isLoading={isLoading}
      mapTooltipTitle={intl?.formatMessage({ id: "Total Population" })}
      data={data}
      dateRange={dateRange}
      visaStatusValues={visaStatusValues?.data}
      filter={filter}
      nationalitiesConfigValueObj={nationalitiesConfigValueObj}
      space={space}
      isPreview={isPreview}
      isPrint={isPrint}
      rows={rows}
      offset={offset}
      callback={callback}
      isTableHidden={isTableHidden}
      isMapHidden={isMapHidden}
    />
  );
}

function _getTooltip (intl, isRtl, title) {
  return function tooltip() {
    return `
      <div style="font-family: var(--fontFamily);">
          ${isRtl ? this?.point?.name_ar : this?.point?.name_en}
      </div>
      <div>
        <span>${intl?.formatMessage({ id: title })}:</span>
        <span style="font-weight: 600;">${[undefined, null]?.includes(this?.point?.total) ? '-': formatNumber(this?.point?.total)}</span>
      </div>
      `;
  }
}

ResidentsByRegionWrapper.propTypes = {
  filter: PropTypes.any,
  icon: PropTypes.any,
  nationalitiesConfigValueObj: PropTypes.any,
  dateRange: PropTypes.any,
  isPrint: PropTypes.any,
  rows: PropTypes.any,
  callback: PropTypes.any,
  offset: PropTypes.any,
  space: PropTypes.any,
  isPreview: PropTypes.any,
  isMapHidden: PropTypes.any,
  isTableHidden: PropTypes.any
}

export default ResidentsByRegionWrapper;

const { useToken } = theme;


function RegionWrap({ keyLabel, icon, label, value }) {
  const themeVariables = useToken();

  return (
    <Row wrap={false} gutter={themeVariables?.token?.marginSM}>
      <Col flex="none">
        {
          resolveTernary(icon,
            icon,
            <Avatar size={34} src={emiratesFlagMapping[keyLabel]} />
          )
        }
      </Col>
      <Col flex="none">
        <Row gutter={[0, 4]}>
          <Col>
            <Text color="var(--colorTextLabel)" size="sm">
              {label}
            </Text>
          </Col>
          <Col>
            <Title level={5}>
              {![undefined, null]?.includes(value) ? formatNumber(value) : "-"}
            </Title>
          </Col>
        </Row>
      </Col>
    </Row>
  )
}

RegionWrap.propTypes = {
  keyLabel: PropTypes.any,
  label: PropTypes.any,
  value: PropTypes.any,
  icon: PropTypes.any
}

function handleMouseOver() {
  if (this?.options?.isHoverDisabled) {
    this.setState('normal');
  }
}

function FormatText(v) {
  return <Text>{`${v}`}</Text>
}

const statusHeadingMap = {
  "active": {
    title: "Active Tourist Visas by Emirate & Nationality",
    columnTitle: "Active Visas",
    "legend_text_1": "Fewer Visas",
    "legend_text_2": "More Visas"

  },
  "inactive": {
    title: "Inactive Tourist Visas by Emirate & Nationality",
    columnTitle: "Inactive Visas",
    "legend_text_1": "Fewer Visas",
    "legend_text_2": "More Visas"
  },
  "violator": {
    title: "Tourist Visa Violations by Emirate & Nationality",
    columnTitle: "Visa Violations",
    "legend_text_1": "Fewer Violations",
    "legend_text_2": "More Violations"
  }
}

function VisaByRegionAndNationality({
  status, setStatus,
  visaStatusValues, data: emiratesData,
  filter, dateRange, mapTooltipTitle,
  tooltipValueText, geoJsonObj, showBy,
  setShowBy = () => { }, icon, isLoading : _isLoading = false,
  tableConfig = {},
  space, isPreview, isPrint,
  rows, offset, callback,
  isTableHidden, isMapHidden
}) {
  const intl = useIntl();
  const [searchText, setSearchText] = useState(undefined);
  const [appliedSearchText, setAppliedSearchText] = useState(undefined)
  const [localeStore] = useContext(LocaleContext);
  const isRtl = checkRtl(localeStore);
  const [printRows, setPrintRows] = useState(offset ? { from: offset, to: offset + 1 } : rows || { from: 0, to: 1 });
  const hiddenContainerRef = useRef()
  const {
    execute: invokeNationalities,
    status: nationalitiesStatus,
    value: nationalitiesValue,
  } = useAsync({ asyncFunction: getTouristVisaNationalities });

  const isLoading = _isLoading;
  useEffect(() => {
    if (![undefined, null]?.includes(showBy)) {
      invokeNationalities({ filter: { ...filter, status, emirates: showBy, ...dateRange } })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showBy, status, filter])

  const _data = nationalitiesValue?.data?.nationalities;

  const data = useMemo(() => {
    if (!appliedSearchText?.length) {
      return _.cloneDeep(_data);
    }
    return _data?.filter((v) => {
      return appliedSearchText?.includes(v?.[isRtl ? "name_ar" : "name_en"])
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appliedSearchText, _data]);

  const getColumnSearchProps = () => ({
    filterDropdown: (
      <TableFilterDropdown
        setAppliedSearchText={setAppliedSearchText}
        appliedSearchText={appliedSearchText}
        setSearchText={setSearchText}
        searchText={searchText}
        data={_data}
      >
        {
          (d) => (
            <InputWrap
              data={d}
              arKey="name_ar"
              enKey="name_en"
              searchText={searchText}
              onChange={(v) => {
                setSearchText(v)
                if (!v) {
                  setAppliedSearchText(v)
                }
              }}
            />
          )
        }
      </TableFilterDropdown>
    ),
    filterIcon: <SearchOutlined style={{ color: appliedSearchText ? 'var(--colorPrimaryBase)' : undefined }} />,
  });

  useEffect(() => {
    if (isPreview && !isPrint && !["idle", "pending"]?.includes(nationalitiesStatus) && isMapHidden) {
      setTimeout(() => {
        if (hiddenContainerRef?.current?.offsetHeight) {
          const height = hiddenContainerRef.current.offsetHeight;
          if (height >= space && printRows?.to === 1) {
            callback({ info: { isNextPage: true, printRows: { from: printRows?.from, to: printRows?.to } }});
          } else if (printRows?.to >= data?.length) {
            callback({ info: { printRows: { from: printRows?.from, to: printRows?.to, isAllRendered: true } } });
          } else if (height < space) {
            const elementsCount = (Math?.floor(((space - 47) - height) / 47) + 2) || 0;
            setPrintRows((v) => ({ ...v, from: printRows?.from, to: v?.to + elementsCount }))
          } else if (height >= space) {
            callback({ info: { printRows: { from: printRows?.from, to: printRows?.to - 2 } } });
          }
        }
      }, [200]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [printRows, nationalitiesStatus])

  const getResponsive = useResponsive();
  
  useEffect(() => {
    if (searchText) {
      setSearchText(undefined)
    }
    if (appliedSearchText) {
      setAppliedSearchText(undefined)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter])
  
  const chartRef = useRef();
  const themeVariables = useToken();
  const mapStyle = {
    allAreas: false,
    showInLegend: false,
    borderColor: themeVariables?.token?.Map?.Border, // Or use 'none'
    borderWidth: 1,
    states: {
      hover: {
        enabled: true // Disable hover state
      }
    }
  }

  let sumTotalTourists = useMemo(() => {
    let sum = 0;
    let min = 0;
    let max = 0;
    if (_data?.length) {
      min = _data?.[0]?.total;
      max = _data?.[0]?.total;
      _data?.forEach((v) => {
        sum += (v?.total || 0)
        if (v?.total < min) {
          min = v?.total;
        }

        if (v?.total > max) {
          max = v?.total;
        }
      })

      return { sum, min, max  };
    };
  }, [_data])

  const dataSource = useMemo(() => {
    if (data?.length) {
      const json = data?.map((v) => {
        const item = geoJsonObj[v["code"]];
        return ({
          "iso-a3": item?.properties?.["iso-a3"],
          "iso-a2": item?.properties?.["iso-a2"],
          color: !item ? themeVariables?.token?.Map?.Default : getColorFromPercentage({ percent: (v?.total / sumTotalTourists?.max) * 100 }),
          label: v?.label,
          value: v?.total,
          ...item,
          ...v,
        })
      });

      return json?.sort((a, b) => b?.value - a?.value)
    }
    return []
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  function getComponent() {
    if (_.isEmpty(data)) {
      return (
        <Row isFullHeight>
          <Col
            textAlign="center"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <Empty />
          </Col>
        </Row>
      )
    }
    return (
      <MapWrap
        valueText={tooltipValueText}
        mapTooltipTitle={mapTooltipTitle}
        onChartLoad={(chart) => {
          chartRef.current = chart;
        }}
        isRtl={isRtl}
        _getTooltip={(intl, isRtl) => _getTooltip(intl, isRtl, statusHeadingMap[status]?.columnTitle)}
        values={[{
          ...mapStyle,
          data: dataSource,
          point: {
            events: {
              mouseOver: handleMouseOver
            }
          },
        }]}
      />
    )
  }
  const isLoadingTable = nationalitiesStatus === "idle" || nationalitiesStatus === "pending";
  const tableEle = (
    <DashboardCard
      title={intl?.formatMessage({ id: "By Nationalities" })}
      bodyBackgroundColor="transparent"
      cardBodyHeight={isPreview ? "auto" : getResponsive({ default: "409px", tablet: "auto"})}
      cardBodyPadding={isLoading || isLoadingTable ? "16px" : "0px"}
      bordered
      bodyWrapStyle={{
        padding: "0px",
      }}
      style={{
        height: isPreview ? "100%": getResponsive({ default: "calc(100%)", tablet: "calc(100%)", midTablet: "449px", mobile: data?.length ? "480px" : "365px" }),
      }}
      headStyle={{
        backgroundColor: "var(--brand-gold-1)",
        padding: "var(--paddingSMPx) var(--paddingPx)",
      }}
      loading={isLoading || isLoadingTable}
      titleProps={{
        wrap: getResponsive({ default: false, tablet: true }),
        gutter: getResponsive({ default: [8], tablet: [0, 8], midTablet: [8], mobile: [0, 8] })
      }}
      actionProps={{
        flex: getResponsive({ default: "none", tablet: "0 0 100%", midTablet: "none", mobile: "0 0 100%" })
      }}
    >
      <Table
        key={`${appliedSearchText}`}
        borderRadiusOnSides={getResponsive({ default: data?.length > 6 ? "all" : "top", midTablet: data?.length > 6 ? "all" : "top", mobile: data?.length > 4 ? "all" : "top" })}
        onRow={(record) => {
          function handleRowClick(record) {
            if (chartRef?.current) {
              const chart = chartRef.current;
              refreshChartTooltip(chart, record);
            }
          }

          function refreshChartTooltip(chart, record) {
            chart.series?.forEach((series) => {
              if (hasData(series)) {
                const point = findPoint(series, record);
                if (point) {
                  showTooltip(chart, point);
                }
              }
            });
          }

          function hasData(series) {
            return series?.data?.length > 0;
          }

          function findPoint(series, record) {
            return series.data.find((point) =>
              point?.options?.properties?.["iso-a3"] === record?.["code"]
            );
          }

          function showTooltip(chart, point) {
            if (point && !_.isEmpty(point.geometry)) {
              chart.tooltip.refresh(point); // Show the tooltip for that point
              chart.hoverPoint = point; // Set the hovered point
              chart.zoomOut();
            }
          }
          return {
            style: {
              cursor: "pointer"
            },
            onClick: () => handleRowClick(record)
          };
        }}
        columns={[
          {
            title: intl?.formatMessage({ id: "Nationality" }),
            width: getResponsive({ default: "50%", mobile: "210px" }),
            // width: getResponsive({ default: "265px", desktop: "164px", tablet: "148px", midTablet: "283px", mobile: "132px" }),
            ...!isPreview && ({
              sorter: {
                compare: (a, b) => a?.[isRtl ? "name_ar": "name_en"].localeCompare(b?.[isRtl ? "name_ar": "name_en"]),
              }
            }),
            render: (v) => {
              const country = geoJsonObj[v?.code];

              const Comp = Flags[country?.properties?.["iso-a2"]] || AllNationality;
              return (
                <Row>
                  <Col
                    paddingInline={isRtl ? "0px 16px" : "0 16px"}
                  >
                    <Row align="middle" wrap={false} gutter={8}>
                      <Col flex="none">
                        <Avatar
                          size={16}
                          style={{
                            borderRadius: "4px"
                          }}
                          shape="square"
                          src={<Comp />}
                        />
                      </Col>
                      <Col flex="none">
                        <Text
                          ellipsis={{
                            tooltip: isRtl ? v?.name_ar : v?.name_en
                          }}
                        >
                          {isRtl ? v?.name_ar : v?.name_en}
                        </Text>
                      </Col>
                    </Row>
                  </Col>
                </Row>
              )
            },
            ...getColumnSearchProps()
          },
          {
            title: tableConfig?.title?.secondColumn || intl?.formatMessage({ id: statusHeadingMap[status]?.columnTitle }),
            width: getResponsive({ default: "50%", mobile: "230px" }),
            ...!isPreview && ({
              sorter: {
                compare: (a, b) => a?.total - b?.total,
              }
            }),
            render: (v) => {
              const percent = ((v?.total / sumTotalTourists?.sum) * 100)?.toFixed(1);
              return (
                <Row align="middle" gutter={getResponsive({ default: [24], tablet: [0, 0], midTablet: [24], mobile: [0, 0] })}>
                  <Col flex="auto">
                    <Tooltip
                      title={`${((v?.total / sumTotalTourists?.sum) * 100)?.toFixed(1)}%`}
                    >
                      <Progress
                        strokeColor={getColorFromPercentage({ percent: (v?.total / sumTotalTourists?.max) * 100 })}
                        percent={Number(percent)}
                        showInfo={true}
                        format={() => FormatText([undefined, null]?.includes(v?.total) ? '-' : formatNumber(v?.total))}
                      />
                    </Tooltip>
                  </Col>
                </Row>
              )
            }
          }
        ]}
        {
          ...data?.length > getResponsive({ default: 8, tablet: 4, midTablet: 6, mobile: 4 }) && {
            scroll: isPreview ? undefined : {
              y: getResponsive({ default: 360, desktop: 355, tablet: 344, mobile: 365 }),
            }
          }
        }
        pagination={false}
        dataSource={isPreview ? data?.slice(printRows?.from, printRows?.to) : data}
      />
    </DashboardCard>
  )
  const ele = (printRows) => {
    return (
      <DashboardCard
        cardBodyHeight={isPreview ? "auto": getResponsive({ default: "auto", desktop: "auto", midTablet: "auto" })}
        headerBorder={false}
        headStyle={{
          display: "none"
        }}
        cardBodyPadding="0px"
        bodyBackgroundColor={"transparent"}
        bodyWrapStyle={{
          padding: "0px"
        }}
      >
        {
          !printRows?.from && !isMapHidden &&
          <DashboardCard
            cardBodyHeight={getResponsive({ default: "fit-content" })}
            title={<Row gutter={4} align={getResponsive({ default: "middle", mobile: "start" })} wrap={false}>
              <Col flex="none" style={{ whiteSpace: "wrap" }}>
                {intl?.formatMessage({ id: "Cross-Emirate Tourist Insights by Nationality" })}
                &nbsp;
                <Tooltip title={intl?.formatMessage({ id: "Combined stats for active, inactive tourist visas and tourist Visa violations categorised by Emirate and nationality" })}>
                  <Info style={{ marginBottom: "3px" }} color="var(--colorIcon)" size={14} weight="bold" />
                </Tooltip>
              </Col>
            </Row>}
            titleStyle={getResponsive({ default: { flex: "0 0 100%" }, mobile: { flex: "0 0 70%", whiteSpace: "normal" } })}
            icon={resolveTernary(icon, icon, <GlobeHemisphereWest size={32} />)}
            headerBorder={false}
            cardBodyPadding="0px"
            bodyBackgroundColor={"transparent"}
            bodyWrapStyle={{
              padding: "0px"
            }}
          >
            <Row gutter={[0, themeVariables?.token?.margin]}>
              <Col
                paddingInline={getResponsive({ default: "var(--paddingPx)", mobile: "var(--paddingPx)" })}
              >
                <Tabs
                  isCustom
                  hideSelectedMarker
                  carouselButtonStyle={{
                    position: "absolute",
                    top: "-42px",
                    zIndex: 1,
                    ...(
                      resolveTernary(
                        isRtl,
                        {
                          left: 0
                        },
                        {
                          right: 0
                        }
                      ))
                  }}
                  isPreview={isPreview}
                  customType={"primary"}
                  activeKey={status}
                  onChange={(key) => {
                    setStatus(key)
                  }}
                  customCardWidth={getResponsive({ default: 322, tablet: isRtl ? 280: 250 })}
                  options={[
                    {
                      key: "active",
                      disabled: isPreview,
                      activePaddingBlock: "var(--paddingPx) var(--paddingSMPx)",
                      paddingBlock: "var(--paddingPx)",
                      children: (
                        <RegionWrap
                          keyLabel={"active_tourists"}
                          icon={<ActiveTourist />}
                          label={intl?.formatMessage({ id: "Total Active Tourist Visas" })}
                          tooltipLabel={intl?.formatMessage({ id: "Total Active Tourist Visas" })}
                          value={visaStatusValues?.active}
                        />
                      )
                    },
                    {
                      key: "inactive",
                      disabled: isPreview,
                      activePaddingBlock: "var(--paddingPx) var(--paddingSMPx)",
                      paddingBlock: "var(--paddingPx)",
                      children: (
                        <RegionWrap
                          keyLabel={"inactive_tourists"}
                          icon={<InActiveTourist />}
                          label={intl?.formatMessage({ id: "Total Inactive Tourist Visas" })}
                          value={visaStatusValues?.inactive}
                        />
                      )
                    },
                    {
                      key: "violator",
                      activePaddingBlock: "var(--paddingPx) var(--paddingSMPx)",
                      paddingBlock: "var(--paddingPx)",
                      disabled: isPreview,
                      children: (
                        <RegionWrap
                          icon={<ViolatedTourist />}
                          keyLabel={"violation_tourists"}
                          label={intl?.formatMessage({ id: "Total Tourist Visa Violations" })}
                          value={visaStatusValues?.violator}
                        />
                      )
                    }
                  ]
                  }
                />
              </Col>
            </Row>
          </DashboardCard>
        }
        <DashboardCard
          cardBodyHeight={getResponsive({ default: "auto", desktop: "auto", midTablet: "auto" })}
          title={
            <Row gutter={4} align={getResponsive({ default: "middle", mobile: "start" })} wrap={false}>
              <Col flex="none">
                {intl?.formatMessage({ id: statusHeadingMap[status]?.title })}
                &nbsp;
                <Tooltip title={intl?.formatMessage({ id: "Filtered view of travelers statistics based on nationality and Emirates" })}>
                  <Info style={{ marginBottom: "3px" }} color="var(--colorIcon)" size={14} weight="bold" />
                </Tooltip>
              </Col>
            </Row>
          }
          icon={resolveTernary(icon, icon, <ExpatriateGlobe />)}
          headerBorder={false}
          cardBodyPadding="0px"
          bodyBackgroundColor={"transparent"}
          bodyWrapStyle={{
            paddingTop: "0px"
          }}
          titleItemsWrapProps={{
            wrap: getResponsive({ default: "false", mobile: "true" }) === "true",
            ...getResponsive({ default: false, mobile: true }) && {
              style: {
                maxWidth: "77%",
                whiteSpace: "pre-wrap"
              }
            }
          }}
          headStyle={{
            paddingTop: "4px"
          }}
        >
          <Row
            isFullHeight
          >
            <Col isFlex>
              {
                !printRows?.from && !isMapHidden &&
                <Row gutter={[0, themeVariables?.token?.margin]}>
                  <Col>
                    {
                      isLoading  
                        ? <Skeleton paragraph={{ rows: 1 }} />
                        : <Tabs
                          isCustom
                          customCardWidth={isRtl ? 205 : undefined}
                          carouselButtonStyle={{
                            position: "absolute",
                            top: "-42px",
                            zIndex: 1,
                            ...(
                              resolveTernary(
                                isRtl,
                                {
                                  left: 0
                                },
                                {
                                  right: 0
                                }
                              ))
                          }}
                          isPreview={isPreview}
                          customType={"primary"}
                          activeKey={showBy}
                          onChange={(key) => {
                            setShowBy(key)
                          }}
                          options={
                            (emiratesData || [])?.map((v) => ({
                              key: v?.code,
                              disabled: isPreview || (filter?.emirates?.length && v?.code !== 0 && !filter?.emirates?.includes(v?.code)),
                              children: (
                                <RegionWrap
                                  keyLabel={v?.code}
                                  label={intl?.formatMessage({ id: isRtl ? v?.["name_ar"] : v?.["name_en"] })}
                                  value={formatNumber(resolveTernary(![undefined, null]?.includes(v?.total), v?.total, "-"))}
                                />
                              )
                            }))
                          }
                        />
                    }
                  </Col>
                </Row>
              }
              <Row isFlexGrow>
                <Col>
                  <Row
                    gutter={isPreview ? [16, 16] : getResponsive({ default: themeVariables?.token?.margin, desktop: themeVariables?.token?.marginSM, midTablet: [0, 16] })}
                    wrap={isPreview ? true: getResponsive({ default: false, midTablet: true })}
                    isFullHeight
                  >
                    {
                      !isPreview &&
                      <Col
                        flex={getResponsive({ default: "0 0 624px", desktop: "0 0 624px", tablet: "0 0 50%", midTablet: "0 0 100%" })}
                      >
                        {tableEle}
                      </Col>
                    }
                    {
                      !printRows?.from && !isMapHidden &&
                      <Col
                        flex={isPreview ? "0 0 100%" : getResponsive({ default: "0 0 calc(100% - 624px)", desktop: "0 0 calc(100% - 624px)", tablet: "0 0 50%", midTablet: "0 0 100%" })}
                      >
                        <Row isFullHeight>
                          <Col
                            style={{
                              borderRadius: "var(--borderRadiusPx)",
                              border: "1px solid var(--colorSplit)",
                              backgroundColor: "var(--colorBgLayout)",
                              ...getResponsive({ mobile: "true", default: "false" }) === "true" && ({
                                minHeight: "285px"
                              })
                            }}
                            paddingInline={getResponsive({ default: "var(--paddingLGPx)", desktop: "var(--paddingSMPx)" })}
                            paddingBlock={getResponsive({ default: "var(--paddingLGPx)", desktop: "var(--paddingSMPx)" })}
                          >
                            {
                              (isLoading || isLoadingTable)
                                ? <Skeleton paragraph={{ rows: 10 }} />
                                : (
                                  <>
                                    {getComponent()}
                                    {
                                      !!data?.length &&
                                      <div
                                        style={{
                                          position: "absolute",
                                          right: 16,
                                          bottom: 26,
                                          width: getResponsive({ default: "365px", mobile: "250px" }),
                                          height: "7px",
                                          display: "flex",
                                          justifyContent: "space-between",
                                          paddingTop: "4px",
                                          direction: "ltr",
                                          background: 'linear-gradient(90deg, #F5F5F5 0%, #816226 100%)'
                                        }}
                                      >
                                        <span>
                                          <Text size="sm" strong>
                                            {intl?.formatMessage({ id: statusHeadingMap[status]?.legend_text_1 })}
                                          </Text>
                                        </span>

                                        <span>
                                          <Text size="sm" strong>
                                            {intl?.formatMessage({ id: statusHeadingMap[status]?.legend_text_2 })}
                                          </Text>
                                        </span>
                                      </div>
                                    }
                                  </>
                                )
                            }
                          </Col>
                        </Row>
                      </Col>
                    }

                    {
                      isPreview && !isTableHidden &&
                      <Col>
                        {tableEle}
                      </Col>
                    }
                  </Row>
                </Col>
              </Row>
            </Col>
          </Row>
        </DashboardCard>
      </DashboardCard>
    )
  }
  return (
    (!isPreview || isPrint || isTableHidden)
      ? ele(printRows)
      : <div
        ref={hiddenContainerRef}
        key={offset}
        style={{
          position: 'absolute',
          visibility: 'hidden',
          top: 0,
          left: 0,
          width: '100%',
          minWidth: "1240px",
          maxWidth: "1240px",
          height: 'auto',
          overflow: 'hidden',
          pointerEvents: 'none',
        }}
      >
        {ele(printRows)}
      </div>
  )
}

VisaByRegionAndNationality.propTypes = {
  data: PropTypes.any,
  geoJsonObj: PropTypes.any,
  icon: PropTypes.any,
  isLoading: PropTypes.bool,
  mapTooltipTitle: PropTypes.any,
  setShowBy: PropTypes.func,
  showBy: PropTypes.string,
  tableConfig: PropTypes.object,
  title: PropTypes.string,
  tooltipValueText: PropTypes.any,
  filter: PropTypes.any,
  dateRange: PropTypes.any,
  isPrint: PropTypes.any,
  rows: PropTypes.any,
  offset: PropTypes.any,
  callback: PropTypes.any,
  status: PropTypes.any,
  setStatus: PropTypes.any,
  visaStatusValues: PropTypes.any,
  space: PropTypes.any,
  isPreview: PropTypes.any,
  isTableHidden: PropTypes.any,
  isMapHidden: PropTypes.any
}
