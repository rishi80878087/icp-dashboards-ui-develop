import PropTypes from "prop-types"
import { useState, useMemo, useRef, useContext, useEffect } from "react";
import _ from "lodash";
import { useIntl } from "react-intl";
import useAsync from "@/hooks/useAsync";
import { formatNumber, continentKeyFlagMapping, checkRtl, resolveTernary } from "@/utils/helper";

import { LocaleContext } from "@/globalContext/locale/localeProvider";
import { getBorderMovementsByNationality } from "@/services/borderMovementService";
import useWorldGeoJSON from "@/hooks/useWorldGeoJson";
import {
  Row, Col, Avatar, Text, Title, theme, Table, Progress,
  Tooltip, AntIcons,
} from "re-usable-design-components";
import { TableFilterDropdown, InputWrap  } from "@/components/TableFilterWidgets";
import DashboardCard from "@/components/DashboardCard";
import Globe from "@/svgr/ExpatsResidenceIcon";
import Image from "next/image";
import useResponsive from "@/hooks/useResponsive";
import Flags from 'country-flag-icons/react/1x1'


const { SearchOutlined } = AntIcons;

const getFormattedData = (
  isRtl = false,
  nationalitiesConfigValueObj = {},
  data = [],
  geoJsonObj = {},
) => {

  const finalData = [];
  let max = 0;

  data?.forEach((item) => {

    const _countryLabelObj = nationalitiesConfigValueObj[item?.code];
    const v = geoJsonObj[item?.code];
    finalData.push({
      "iso-a3": item?.code,
      "iso-a2": v?.properties?.["iso-a2"],
      label: resolveTernary(
        isRtl,
        _countryLabelObj?.country_ar || item?.code,
        _countryLabelObj?.country_en || item?.code,
      ),
      entries: resolveTernary(item?.entries, item?.entries, 0),
      exits: resolveTernary(item?.exits, item?.exits, 0),
      total: resolveTernary(item?.total, item?.total, 0),
    });


    max += item?.total;


  });

  return ({
    data: finalData,
    max
  })
};


function ResidentsByRegionWrapper({
  filter,
  icon,
  title,
  nationalitiesConfigValueObj,
  dateRange,
  isPreview,
  movementsByNationalityRef,
  space,
  isPrint,
  rows,
  callback,
  offset
}) {
  const { geoJsonObj } = useWorldGeoJSON();
  const intl = useIntl();
  const [localeStore] = useContext(LocaleContext);
  const isRtl = checkRtl(localeStore);

  const {
    execute: invokeBorderMovements,
    status: borderMovementsStatus,
    value: borderMovementsValue,
  } = useAsync({ asyncFunction: getBorderMovementsByNationality });

  useEffect(() => {
    invokeBorderMovements({
      filter: { ...filter, ...dateRange }
    });
  }, [
    filter,
    invokeBorderMovements,
    dateRange
  ]);

  const isLoading =
    borderMovementsStatus === "idle" ||
    borderMovementsStatus === "pending";

  const { data, max } = useMemo(() => {
    if (borderMovementsStatus !== "success") {
      return {}
    }
    return getFormattedData(
      isRtl,
      nationalitiesConfigValueObj,
      resolveTernary(borderMovementsValue?.data?.nationalities, borderMovementsValue?.data?.nationalities, []),
      resolveTernary(geoJsonObj, geoJsonObj, []),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [borderMovementsValue?.data])

  return (
    <ResidentsByRegion
      icon={icon}
      title={title}
      isPreview={isPreview}
      movementsByNationalityRef={movementsByNationalityRef}
      isLoading={isLoading}
      data={data}
      max={max}
      space={space}
      isPrint={isPrint}
      rows={rows}
      offset={offset}
      callback={callback}
      tableConfig={{
        title: {
          secondColumn: intl?.formatMessage({ id: "Total Movements" })
        }
      }}
    />
  );
}

ResidentsByRegionWrapper.propTypes = {
  filter: PropTypes.any,
  icon: PropTypes.any,
  nationalitiesConfigValueObj: PropTypes.any,
  title: PropTypes.any,
  dateRange: PropTypes.any,
  isPreview: PropTypes.any,
  movementsByNationalityRef: PropTypes.any,
  space: PropTypes.any,
  isPrint: PropTypes.any,
  rows: PropTypes.any,
  callback: PropTypes.any,
  offset: PropTypes.any
}

export default ResidentsByRegionWrapper;


const { useToken } = theme;

function AllNationality() {
  return <Image width={24} height={24} alt="flag" src={"/All_Nationality.png"} />
}

function RegionWrap({ keyLabel, label, value }) {
  const themeVariables = useToken();

  return (
    <Row wrap={false} gutter={themeVariables?.token?.marginSM}>
      <Col flex="none">
        <Avatar size={34} src={continentKeyFlagMapping[keyLabel]} />
      </Col>
      <Col flex="none">
        <Row gutter={[0, 4]}>
          <Col>
            <Text size="sm">
              {label}
            </Text>
          </Col>
          <Col>
            <Title level={5}>
              {value}
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
}

function handleMouseOver() {
  if (this?.options?.isHoverDisabled) {
    this.setState('normal');
  }
}

function FormatText(v, val) {
  return <Text>{`${[undefined, null]?.includes(val) ? '-' : formatNumber(val)}`}</Text>
}

function ResidentsByRegion({
  movementsByNationalityRef,
  isPreview,
  data: _data,
  title,
  icon,
  isLoading = false,
  max,
  offset = 0,
  tableConfig = {},
  space,
  isPrint,
  rows,
  callback,
}) {
  const hiddenContainerRef = useRef()
  const [printRows, setPrintRows] = useState(offset ? { from: offset, to: offset + 1 } : rows || { from: 0, to: 1 });
  const intl = useIntl();
  const [searchText, setSearchText] = useState(undefined);
  const [appliedSearchText, setAppliedSearchText] = useState(undefined)
  
  const data = useMemo(() => {
    if (!appliedSearchText?.length) {
      return _.cloneDeep(_data);
    }
    return _data?.filter((v) => {
      return appliedSearchText?.includes(v?.label)
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
              arKey="label"
              enKey="label"
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
    if (isPreview && !isPrint && !isLoading) {
      setTimeout(() => {
        if (hiddenContainerRef?.current?.offsetHeight) {
          const height = hiddenContainerRef.current.offsetHeight;
          if (height >= space && printRows?.to === 1) {
            callback({ info: { isNextPage: true, printRows: { from: printRows?.from, to: printRows?.to } }});
          } else if (height >= space) {
            callback({ info: { printRows: { from: printRows?.from, to: printRows?.to - 2 } } });
          } else if (printRows?.to >= data?.length) {
            callback({ info: { printRows: { from: printRows?.from, to: printRows?.to, isAllRendered: true } } });
          } else if (height < space) {
            const elementsCount = (Math?.floor((space - 40 - height) / 47) + 2) || 0;
            setPrintRows((v) => ({ ...v, from: printRows?.from, to: v?.to + elementsCount }))
          }
        }
      }, [200]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [printRows, isLoading])

  useEffect(() => {
    if (isLoading) {
      if (searchText) {
        setSearchText(undefined)
      }
      if (appliedSearchText) {
        setAppliedSearchText(undefined)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading])

  const getResponsive = useResponsive();
  const [localeStore] = useContext(LocaleContext);
  const themeVariables = useToken();

  useEffect(() => {
    const scrollDiv = document?.querySelector('#border-movement-nationality .ant-table-body');
    if (scrollDiv) {
      scrollDiv.addEventListener('scroll', (e) => {
        const scrollTop = e.target.scrollTop;
        movementsByNationalityRef.current.scrollTop = scrollTop;
        // You can position another element using scrollLeft/Top
      });
    }

    const scrollToDiv = document?.querySelector('#border-movement-nationality-preview .ant-table-body');

    if (scrollToDiv) {
      setTimeout(() => {
        scrollToDiv.scrollTop = movementsByNationalityRef?.current?.scrollTop || 0;
      }, 2000)
    }

    return () => {
      if (scrollDiv) {
        scrollDiv.removeEventListener('scroll', () => { });
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const isRtl = checkRtl(localeStore);

  const sumValues = max || 0;

  const ele = (printRows) => {
    return (
      <DashboardCard
        cardBodyHeight={isPreview ? "auto" : getResponsive({ default: "427px", desktop: "427px", midTablet: "420px", mobile: "440px"  })}
        title={title}
        icon={<Globe color={"var(--colorText)"} size={32} />}
        headerBorder={false}
        cardBodyPadding="0px"
        bodyBackgroundColor={"transparent"}
        bodyWrapStyle={{
          padding: "0px"
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
      >
        <Row
          isFullHeight
        >
          <Col isFlex>
            <Row isFlexGrow>
              <Col>
                <Row
                  gutter={getResponsive({ default: themeVariables?.token?.margin, desktop: themeVariables?.token?.marginSM, midTablet: [0, 16] })}
                  wrap={getResponsive({ default: false, midTablet: true })}
                  isFullHeight
                >
                  <Col
                    {
                      ...!isPreview ? ({
                        id: "border-movement-nationality"
                      })
                        : ({
                          id: "border-movement-nationality-preview"
                        })
                    }
                  >
                    <Table
                      loading={isLoading}
                      key={`${appliedSearchText}`}
                      borderRadiusOnSides={getResponsive({ default: "bottom" })}
                      columns={[
                        {
                          title: intl?.formatMessage({ id: "Nationality" }),
                          width: "30%",
                          sorter: {
                            compare: (a, b) => a?.label?.localeCompare(b?.label),
                          },
                          render: (v) => {
                            const Comp = Flags[v?.["iso-a2"]] || AllNationality;
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
                                          tooltip: v?.label
                                        }}
                                      >
                                        {v?.label}
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
                          title: intl?.formatMessage({ id: "Entries" }),
                          sorter: {
                            compare: (a, b) => (a.entries) - (b.entries),
                          },
                          render: (v) => {
                            return (
                              <Row align="middle" gutter={getResponsive({ default: [24], tablet: [0, 0], midTablet: [24], mobile: [0, 0] })}>
                                <Col flex={getResponsive({ default: "0 0 95px", tablet: "0 0 100%", midTablet: "0 0 95px", mobile: "0 0 100%" })}>
                                  <Text>
                                    {[undefined, null]?.includes(v?.entries) ? '-' : formatNumber(v?.entries)}
                                  </Text>
                                </Col>
                              </Row>
                            )
                          }
                        },
                        {
                          title: intl?.formatMessage({ id: "Exits" }),
                          sorter: {
                            compare: (a, b) => (a.exits) - (b.exits),
                          },
                          render: (v) => {
                            return (
                              <Row align="middle" gutter={getResponsive({ default: [24], tablet: [0, 0], midTablet: [24], mobile: [0, 0] })}>
                                <Col flex={getResponsive({ default: "0 0 95px", tablet: "0 0 100%", midTablet: "0 0 95px", mobile: "0 0 100%" })}>
                                  <Text>
                                    {[undefined, null]?.includes(v?.exits) ? '-' : formatNumber(v?.exits)}
                                  </Text>
                                </Col>
                              </Row>
                            )
                          }
                        },
                        {
                          title: tableConfig?.title?.secondColumn || intl?.formatMessage({ id: "Total Movements" }),
                          sorter: {
                            compare: (a, b) => (a.total) - (b.total),
                          },
                          render: (v) => {
                            const percent = ((v?.total / sumValues) * 100)?.toFixed(1);
                            return (
                              <Row align="middle" gutter={getResponsive({ default: [24], tablet: [0, 0], midTablet: [24], mobile: [0, 0] })}>
                                {/* <Col flex={getResponsive({ default: "0 0 95px", tablet: "0 0 100%", midTablet: "0 0 95px", mobile: "0 0 100%" })}>
                                  <Text>
                                    {[undefined, null]?.includes(v?.total) ? '-' : formatNumber(v?.total)}
                                  </Text>
                                </Col> */}

                                <Col flex="auto">
                                  <Tooltip
                                    title={`${percent}%`}
                                  >
                                    <Progress
                                      strokeColor={"var(--colorPrimaryBase)"}
                                      percent={Number(percent)}
                                      showInfo={true}
                                      format={(val) => FormatText(val, v?.total)}
                                    />
                                  </Tooltip>
                                </Col>
                              </Row>
                            )
                          },
                          width: "30%"
                        }
                      ]}
                      {
                        ...((data?.length > getResponsive({ default: 8, tablet: 4, midTablet: 6, mobile: 6 })) && !isPreview) && {
                          scroll: {
                            y: getResponsive({ default: 370, tablet: 370, mobile: 370  }),
                            x: getResponsive({ default: null, mobile: 500 })
                          }
                        }
                      }
                      pagination={false}
                      dataSource={isPreview ? data?.slice(printRows?.from, printRows?.to) : data}
                    />
                  </Col>
                </Row>
              </Col>
            </Row>
          </Col>
        </Row>
      </DashboardCard>
    )
  }
  return (
    (!isPreview || isPrint)
      ? ele(printRows)
      : (
        <div
          key={offset}
          ref={hiddenContainerRef}
          style={{
            position: 'absolute',
            visibility: 'hidden',
            top: 0,
            left: 0,
            width: '100%',
            height: 'auto',
            overflow: 'hidden',
            pointerEvents: 'none',
          }}
        >
          {ele(printRows)}
        </div>
      )
  )
}

ResidentsByRegion.propTypes = {
  data: PropTypes.any,
  icon: PropTypes.any,
  isLoading: PropTypes.bool,
  tableConfig: PropTypes.object,
  title: PropTypes.string,
  tooltipValueText: PropTypes.any,
  totalMapping: PropTypes.object,
  max: PropTypes.any,
  offset: PropTypes.any,
  space: PropTypes.any,
  isPrint: PropTypes.any,
  rows: PropTypes.any,
  callback: PropTypes.any,
  movementsByNationalityRef: PropTypes.any,
  isPreview: PropTypes.any
}
