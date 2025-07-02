import PropTypes from "prop-types"
import {
  Row,
  Col,
  theme,
  Title,
  Select,
  Text,
  Slider,
  RadioGroup,
  Button,
  Dropdown,
  PhosphorIcons,
  Drawer,
  Card,
  DateRangePicker,
  Scrollbars,
  Modal,
  Tooltip,
  Spin,
  AntIcons
} from "re-usable-design-components";
import moment from "moment";
import dayjs from "dayjs";
import { useIntl } from "react-intl";
import React, { useState, useEffect, useContext, useMemo, memo, useCallback } from "react";
import AppliedFilters from "@/components/AppliedFilters";
import useResponsive from "@/hooks/useResponsive";
import VisaResidenceSummary from "@/views/BorderMovements/widgets/VisaResidenceSummary";
import { checkRtl, cleanObject, resolveTernary } from "@/utils/helper";
import { LocaleContext } from "@/globalContext/locale/localeProvider";
import { Print, usePrint } from "@/components/Print";
import {
  getGenderOptions,
  getAgeOptions,
} from "@/views/BorderMovements/utils/helper";
import _ from "lodash";
import Segmented from "@/components/Segmented";
import { getVisaOffices } from "@/services/commonService";
import useAsync from "@/hooks/useAsync";
import VisaByRegionWrapper from "@/views/BorderMovements/widgets/VisaByRegionWrapper";
import VisaViolationByRegionWrapper from "@/views/BorderMovements/widgets/VisaViolationByRegionWrapper";
import PageSectionsScrollWrap from "@/components/PageSectionsScrollWrap";


const MemoModal = memo(Modal)

const { useToken } = theme;
const { Funnel, CheckSquareOffset, IdentificationCard, CalendarBlank, CalendarCheck, IdentificationBadge, ArrowSquareOut } = PhosphorIcons;
const { FundOutlined } = AntIcons;

function getLabel(data, value, isRtl) {
  if (Array.isArray(value)) {
    const names = (value || [])?.map((val) => data?.find((v) => v?.value === val)?.[isRtl ? "ar" : "en"]);
    return (
      <Tooltip
        title={names?.length > 4 ? names?.join(", ") : null}
      >
        {`${names?.slice(0, 4)?.join(", ")} ${names?.length - 4 > 0 ? ', +' + (names?.length - 4) : ''}`}
      </Tooltip>
    )
  }
  return data?.find((v) => v?.value === value)?.[isRtl ? "ar" : "en"];
}

function getOfficesLabel(data, value, isRtl) {
  const names = (value || [])?.map((val) => data?.find((v) => v?.code === val)?.[isRtl ? "name_ar" : "name_en"]);
  return (
    <Tooltip
      title={names?.length > 4 ? names?.join(", ") : null}
    >
      {`${names?.slice(0, 4)?.join(", ")} ${names?.length - 4 > 0 ? ', +' + (names?.length -  4) : ''}`}
    </Tooltip>
  )
}

function SliderWrap({ value, onChange, ...props }) {
  const [ageRange, setAgeRange] = useState([0, 65]);

  useEffect(() => {
    if (!value) {
      setAgeRange([0, 65]);
    }
  }, [value]);

  const debouncedOnChange = useMemo(() => {
    return _.debounce(onChange, 1000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Slider
      value={ageRange}
      onChange={(val) => {
        if (val[1] - val[0] >= 1) {
          setAgeRange(val);
          debouncedOnChange(val);
        }
      }}
      tooltipVisible={false} // Hides the tooltip
      {...props}
    />
  );
}

SliderWrap.propTypes = {
  onChange: PropTypes.any,
  value: PropTypes.any
}

function RadioGroupWrap({ value, onChange, ...props }) {
  const [state, setState] = useState(value);

  useEffect(() => {
    if (value !== state) {
      setState(value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <RadioGroup
      value={state}
      onChange={(e) => {
        setState(e?.target?.value)
        setTimeout(() => {
          onChange(e)
        }, 100)
      }}
      {...props}
    />
  )
}

RadioGroupWrap.propTypes = {
  onChange: PropTypes.func,
  value: PropTypes.any
}

const MemoisedRadioGroup = memo(RadioGroupWrap, (prev, next) => {
  return _.isEqual(prev, next)
})


function getDropdownContent(dropContent) {
  return () => (
    dropContent
  )
}

const FilterWrap = ({
  filters,
  setFilters,
  intl,
  getResponsive,
  filtersData,
  isRtl,
  showAppliedFilters,
  initialFilters,
  setApplyAt,
  borderTypeConfigValueData,
  setIsLoadingExport,
  isPreviewOpen,
  setIsPreviewOpen,
  setVisaOfficeValues
}) => {
  const [isDrawer, setIsDrawer] = useState(false)
  const isFiltersLoading = false;
  const [isDropOpen, setIsDropOpen] = useState(false)
  const [isApplyDisabled, setIsApplyDisabled] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters);
  const isFilterDisabled = _.isEqual(filters, localFilters);
  const {
    execute: invokeGetVisaOffices,
    status: visaOfficeStatus,
    value: visaOfficeValues,
  } = useAsync({ asyncFunction: getVisaOffices });
  
  useEffect(() => {
    invokeGetVisaOffices({ emirates: localFilters?.emirates })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localFilters?.emirates])
  
  useEffect(() => {
    if (isApplyDisabled) {
      setIsApplyDisabled(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localFilters])

  useEffect(() => {
    if (!_.isEqual(filters, localFilters)) {
      setLocalFilters(filters)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  const applyEle = (
    <Button
      disabled={isFilterDisabled}
      type="primary"
      icon={<CheckSquareOffset />}
      size="default"
      onClick={() => {
        setIsApplyDisabled(true)
        setApplyAt(new Date()?.getTime())
        setVisaOfficeValues(visaOfficeValues)
        setFilters(localFilters);
        setIsDropOpen(false)
        setIsDrawer(false)
      }}
    >
      {intl?.formatMessage({ id: getResponsive({ default: "Apply All", tablet: "Apply" }) })}
    </Button>
  )

  const nationalityEle = (
    <Select
      placeholder={getResponsive({
        default: intl.formatMessage({ id: "Nationality" }),
        midTablet: intl.formatMessage({ id: "Select" }),
      })}
      value={localFilters?.nationality}
      allowClear
      showSearch
      mode="multiple"
      size="middle"
      maxTagCount={4}
      style={{
        minWidth: "148px",
        maxWidth: getResponsive({
          default: "100%",
        }),
      }}
      loading={isFiltersLoading}
      filterOption={(input, option) => {
        return option?.label?.toLowerCase()?.includes(input?.toLowerCase());
      }}
      popupMatchSelectWidth={true}
      onChange={(e) => {
        setLocalFilters((v) => ({
          ...v,
          nationality: e,
        }));
      }}
      options={filtersData?.nationalities?.map((v) => ({
        value: v?.value,
        label: isRtl ? v?.ar : v?.en,
      }))}
    />
  );

  const visaOfficesEle = (
    <Select
      placeholder={getResponsive({
        default: intl.formatMessage({ id: "Tourism Department" }),
        midTablet: intl.formatMessage({ id: "Select" }),
      })}
      value={localFilters?.visa_offices}
      allowClear
      showSearch
      mode="multiple"
      size="middle"
      maxTagCount={4}
      style={{
        minWidth: "148px",
        maxWidth: getResponsive({
          default: "100%",
        }),
      }}
      loading={isFiltersLoading || ["idle", "pending"]?.includes(visaOfficeStatus)}
      filterOption={(input, option) => {
        return option?.label?.toLowerCase()?.includes(input?.toLowerCase());
      }}
      popupMatchSelectWidth={true}
      onChange={(e) => {
        setLocalFilters((v) => ({
          ...v,
          visa_offices: e,
        }));
      }}
      options={(visaOfficeValues?.data || [])?.map((v) => ({
        value: v?.code,
        label: isRtl ? v?.name_ar : v?.name_en,
      }))}
    />
  );


  function handleSliderChange(val) {
    setLocalFilters((v) => ({
      ...v,
      age_group: `${val?.[0] == 16 ? 18 : val?.[0]}-${val?.[1] === 65 ? 120 : val?.[1] == 16 ? 18 : val?.[1]}`,
    }));
  }

  const disableFutureDates = (current) => {
    // Disable dates greater than today
    return current && current > moment().endOf('day');
  };

  const segmentedEle = (
    <Segmented
      // isSelectedBold
      block={getResponsive({ default: false, tablet: true })}
      size={getResponsive({ default: "default" })}
      value={localFilters?.selectedMonthTab || null}
      onChange={(e) => {
        setLocalFilters(v => ({
          ...v,
          date_range: null,
          selectedMonthTab: e
        }))
      }}
      options={[
        {
          icon: resolveTernary((getResponsive({ default: "true", tablet: "true" }) === "true"), localFilters?.selectedMonthTab === "this_month" ? <CalendarCheck style={{ marginBottom: '2px' }} size={16} weight="bold" /> : <CalendarBlank style={{ marginBottom: '2px' }} size={16} />, null),
          label: intl?.formatMessage({ id: "This Month" }),
          value: "this_month"
        },
        {
          icon: resolveTernary((getResponsive({ default: "true", tablet: "true" }) === "true"), localFilters?.selectedMonthTab === "3_months" ? <CalendarCheck style={{ marginBottom: '2px' }} size={16} weight="bold" /> : <CalendarBlank style={{ marginBottom: '2px' }} size={16} />, null),
          label: intl?.formatMessage({ id: getResponsive({ default: "Last 3 Months", tablet: "3 Months" }) }),
          value: "3_months"
        },
        {
          icon: resolveTernary((getResponsive({ default: "true", tablet: "true" }) === "true"), localFilters?.selectedMonthTab === "6_months" ? <CalendarCheck style={{ marginBottom: '2px' }} size={16} weight="bold" /> : <CalendarBlank style={{ marginBottom: '2px' }} size={16} />, null),
          label: intl?.formatMessage({ id: getResponsive({ default: "Last 6 Months", tablet: "6 Months" }) }),
          value: "6_months"
        }
      ]}
    />
  );

  const dateRangeEle = (
    <DateRangePicker
      value={localFilters?.date_range?.map((v) => dayjs(v))}
      disabledDate={disableFutureDates}
      block={getResponsive({ default: false, tablet: true })}
      onChange={(val, val1) => {
        setLocalFilters((v) => ({
          ...v,
          date_range: val1?.[0] ? val1 : null,
          selectedMonthTab: null
        }))
      }}
    />
  );

  const emiratesEle = (
    <Select
      placeholder={getResponsive({
        default: intl.formatMessage({ id: "Emirates" }),
        midTablet: intl.formatMessage({ id: "Select" }),
      })}
      mode="multiple"
      size="middle"
      value={localFilters?.emirates}
      allowClear
      maxTagCount={4}
      showSearch
      style={{
        minWidth: "148px",
        maxWidth: getResponsive({
          default: "100%",
        }),
      }}
      loading={isFiltersLoading}
      filterOption={(input, option) => {
        return option?.label?.toLowerCase()?.includes(input?.toLowerCase());
      }}
      popupMatchSelectWidth={true}
      onChange={(e) => {
        setLocalFilters((v) => ({
          ...v,
          emirates: e,
          visa_offices: undefined,
        }));
      }}
      options={filtersData?.emirates?.map((v) => ({
        value: v?.value,
        label: isRtl ? v?.ar : v?.en,
      }))}
    />
  );

  const ageRangeEle = (
    <SliderWrap
      open
      step={null}
      range
      min={0}
      max={65}
      marks={{
        0: <div style={{ paddingTop: "var(--marginXXSPx)" }}>0</div>,
        // 5: <div style={{ paddingTop: "var(--marginXXSPx)" }}>5</div>,
        // 10: <div style={{ paddingTop: "var(--marginXXSPx)" }}>10</div>,
        16: <div style={{ paddingTop: "var(--marginXXSPx)" }}>18</div>,
        // 20: <div style={{ paddingTop: "var(--marginXXSPx)" }}>20</div>,
        21: <div style={{ paddingTop: "var(--marginXXSPx)" }}>21</div>,
        // 25: <div style={{ paddingTop: "var(--marginXXSPx)" }}>25</div>,
        // 30: <div style={{ paddingTop: "var(--marginXXSPx)" }}>30</div>,
        29: <div style={{ paddingTop: "var(--marginXXSPx)" }}>29</div>,
        // 35: <div style={{ paddingTop: "var(--marginXXSPx)" }}>35</div>,
        // 40: <div style={{ paddingTop: "var(--marginXXSPx)" }}>40</div>,
        39: <div style={{ paddingTop: "var(--marginXXSPx)" }}>39</div>,
        49: <div style={{ paddingTop: "var(--marginXXSPx)" }}>49</div>,
        // 45: <div style={{ paddingTop: "var(--marginXXSPx)" }}>45</div>,
        // 50: <div style={{ paddingTop: "var(--marginXXSPx)" }}>50</div>,
        59: <div style={{ paddingTop: "var(--marginXXSPx)" }}>59</div>,
        // 55: <div style={{ paddingTop: "var(--marginXXSPx)" }}>55</div>,
        // 60: <div style={{ paddingTop: "var(--marginXXSPx)" }}>60</div>,
        65: <div style={{ paddingTop: "var(--marginXXSPx)" }}>60+</div>,
      }}
      value={localFilters?.age_group}
      defaultValue={[0, 65]}
      onChange={(v) => {
        handleSliderChange(v);
      }}
    />
  );

  const genderEle = (
    <MemoisedRadioGroup
      value={localFilters?.gender}
      onChange={(e) => {
        setLocalFilters((v) => ({
          ...v,
          gender: e?.target?.value,
        }));
      }}
      style={getResponsive({
        default: {},
      })}
      options={filtersData?.genders?.map((v) => ({
        value: v?.value,
        label: v?.label,
      }))}
    />
  );

  const filterItems =
    getResponsive({ default: "true", tablet: "true" }) === "true"
      ? [
        {
          label: intl?.formatMessage({ id: "Nationality" }),
          comp: nationalityEle,
        },
        {
          label: intl?.formatMessage({ id: "Emirates" }),
          comp: emiratesEle
        }
      ]
      : [];
  
  const Wrap = (getResponsive({ default: "true", mobile: "false" }) === "true") ? Scrollbars : React.Fragment;

  const dropContent = (
    <Row
      style={{
        maxWidth: getResponsive({ default: "350px", tablet: "400px", mobile: "100%" }),
        minWidth: getResponsive({ default: "350px", tablet: "400px", mobile: "100%" })
      }}
    >
      <Col
        paddingBlock={getResponsive({ default: "var(--paddingPx)", mobile: "0px" })}
        style={getResponsive({
          default: {
            borderRadius: "8px",
            backgroundColor: "var(--colorBgElevated)",
            boxShadow: getResponsive({ default: "var(--boxShadowSecondary)" }),
          },
          mobile: {}
        })}
      >
        <Row gutter={[0, 8]}>
          {
            getResponsive({ default: "true", mobile: "false" }) === "true" &&
            <Col
              paddingInline={getResponsive({ default: "var(--paddingPx)", mobile: "0px" })}
            >
              <Text strong>
                {intl?.formatMessage({ id: "Filters" })}
              </Text>
            </Col>
          }
          <Col>
            <Wrap
              style={{
                height: "300px",
              }}
            >
              <Row
                gutter={[0, 16]}
                style={{
                  paddingInline: getResponsive({ default: "var(--paddingPx)", mobile: "0px" })
                }}
              >
                {
                  getResponsive({
                    default: "false",
                    tablet: "true",
                  }) === "true" && (
                    <Col key={"segmented_date"}>
                      <Row gutter={[0, 8]}>
                        <Col>
                          {segmentedEle}
                        </Col>
                      </Row>
                    </Col>
                  )
                }
                {
                  getResponsive({
                    default: "false",
                    tablet: "true",
                  }) === "true" && (
                    <Col key={"date_range"}>
                      <Row gutter={[0, 8]}>
                        <Col>
                          <Text>{intl?.formatMessage({ id: "Date Range" })}</Text>
                        </Col>
                        <Col>
                          {dateRangeEle}
                        </Col>
                      </Row>
                    </Col>
                  )
                }

                {filterItems?.map((val) => (
                  <Col key={val?.label}>
                    <Row gutter={[0, 8]}>
                      <Col>
                        <Text>{val?.label}</Text>
                      </Col>
                      <Col>{val?.comp}</Col>
                    </Row>
                  </Col>
                ))}

                <Col>
                  <Row gutter={[0, 8]}>
                    <Col>
                      <Text>
                        {intl?.formatMessage({
                          id: "Tourism Department",
                        })}
                      </Text>
                    </Col>
                    <Col>{visaOfficesEle}</Col>
                  </Row>
                </Col>
                <Col>
                  <Row gutter={[0, 8]}>
                    <Col>
                      <Text>
                        {intl?.formatMessage({
                          id: "Gender",
                        })}
                      </Text>
                    </Col>
                    <Col>{genderEle}</Col>
                  </Row>
                </Col>

                <Col>
                  <Row gutter={[0, 0]}>
                    <Col>
                      <Text>
                        {intl?.formatMessage({
                          id: "Age Range",
                        })}
                      </Text>
                    </Col>
                    <Col>{ageRangeEle}</Col>
                  </Row>
                </Col>

                {
                  getResponsive({ default: "false", tablet: "true" }) === "true" && (
                    <Row gutter={[12]}>
                      <Col
                        flex="none"
                      >
                        {applyEle}
                      </Col>
                      <Col
                        flex="none"
                      >
                        <Button
                          disabled={!showAppliedFilters}
                          type="default"
                          size="default"
                          danger
                          onClick={() => {
                            setIsApplyDisabled(true)
                            setTimeout(() => {
                              setIsDropOpen(false)
                              if (getResponsive({ tablet: "true" }) === "true") {
                                setLocalFilters(initialFilters);
                                setFilters(initialFilters);
                                setIsDrawer(false)
                              }
                            }, 200)
                          }}
                        >
                          {intl?.formatMessage({ id: getResponsive({ default: "Reset" }) })}
                        </Button>
                      </Col>
                    </Row>
                  )
                }
              </Row>
            </Wrap>
          </Col>
        </Row>
      </Col>
    </Row>
  )

  return (
    <>
      <Col flex={getResponsive({ default: "none", desktop: "auto", mobile: "none" })} style={{ display: "flex", justifyContent: isRtl ? "left" : "right" }}>
        <Row align="middle" gutter={12}>
          {getResponsive({
            default: "true",
            tablet: "false",
          }) === "true" && (
            <>
              <Col flex="none">
                {segmentedEle}
              </Col>

              <Col flex="none">
                {dateRangeEle}
              </Col>
            </>
          )}

          <Col flex="none">
            {
              getResponsive({ mobile: "true", default: "false" }) === "true"
                ? (
                  <Row>
                    <Col>
                      <Button
                        size={"default"}
                        type="default"
                        onClick={() => {
                          setIsDrawer((v) => !v)
                        }}
                        style={{
                          ...(getResponsive({
                            default: "false",
                            tablet: "true",
                          }) === "true" && {
                            paddingInline: "var(--paddingXSPx)",
                          }),
                        }}
                      >
                        <Row align="middle" gutter={8}>
                          <Col flex="none">
                            <Funnel
                              color="currentColor"
                              weight="bold"
                              size={16}
                            />
                          </Col>
                        </Row>
                      </Button>
                    </Col>
                  </Row>
                )
                : (
                  <Dropdown
                    style={{
                      backgroundColor: "var(--colorBgContainer)",
                    }}
                    onOpenChange={(v) => {
                      setIsDropOpen(v)
                    }}
                    open={isDropOpen}
                    {
                      ...getResponsive({ default: "false", midTablet: "true" }) === "true" && {
                        trigger: ["click"],
                      }
                    }
                    dropdownRender={getDropdownContent(dropContent)}
                  >
                    <Row>
                      <Col>
                        <Button
                          size={"default"}
                          type="default"
                          {
                            ...getResponsive({ default: "false", midTablet: "true" }) === "true" && {
                              onClick: () => {
                                setIsDropOpen((v) => !v)
                              }
                            }
                          }
                          style={{
                            ...(getResponsive({
                              default: "false",
                              tablet: "true",
                            }) === "true" && {
                              paddingInline: "var(--paddingXSPx)",
                            }),
                          }}
                        >
                          <Row align="middle" gutter={8}>
                            {
                              getResponsive({ default: "true", mobile: "false" }) === "true" &&
                              <Col flex="none">
                                <Text color="currentColor">{intl.formatMessage({ id: getResponsive({ default: "Other Filters", tablet: "Filters" }) })}</Text>
                              </Col>
                            }
                            <Col flex="none">
                              <Funnel
                                color="currentColor"
                                weight="bold"
                                size={16}
                                style={{
                                  marginBottom: "2px"
                                }}
                              />
                            </Col>
                          </Row>
                        </Button>
                      </Col>
                    </Row>
                  </Dropdown>
                )}
          </Col>
          <Col flex="none">
            <Button
              size={"default"}
              type="default"
              icon={<ArrowSquareOut weight="bold" size={16} />}
              onClick={() => {
                setIsLoadingExport(true)
                setIsPreviewOpen(true)
              }}
              style={{
                ...(getResponsive({
                  default: "false",
                  tablet: "true",
                }) === "true" && {
                  paddingInline: "var(--paddingXSPx)",
                }),
              }}
            >
              <Row align="middle" gutter={8}>
                {
                  getResponsive({ default: "true", mobile: "false" }) === "true" &&
                  <Col flex="none">
                    <Text color="currentColor">{intl.formatMessage({ id: getResponsive({ default: "Export" }) })}</Text>
                  </Col>
                }
              </Row>
            </Button>
          </Col>
          {
            getResponsive({ default: "true", tablet: "false" }) === "true" && (
              <Col flex="none">
                {applyEle}
              </Col>
            )
          }
        </Row>
      </Col>

      <Drawer
        open={isDrawer}
        onClose={() => {
          setIsDrawer(false)
        }}
        title={intl.formatMessage({ id: "Filter By" })}
        width={"100%"}
      >
        {dropContent}
      </Drawer>
    </>
  )
}

FilterWrap.propTypes = {
  filters: PropTypes.any,
  filtersData: PropTypes.any,
  getResponsive: PropTypes.func,
  initialFilters: PropTypes.any,
  intl: PropTypes.any,
  isRtl: PropTypes.any,
  setFilters: PropTypes.func,
  showAppliedFilters: PropTypes.any,
  borderTypeConfigValueData: PropTypes.any,
  setIsLoadingExport: PropTypes.any,
  setApplyAt: PropTypes.any,
  isPreviewOpen: PropTypes.any,
  setIsPreviewOpen: PropTypes.any,
  setVisaOfficeValues: PropTypes.func,
}

function getDateRange(values = {}) {
  if (values?.date_range?.length) {
    return {
      start_date: values?.date_range?.[0],
      end_date: values?.date_range?.[1],
    }
  }

  const map = {
    this_month: {
      start_date: moment().startOf('month').format('YYYY-MM-DD'),
      end_date: moment().format('YYYY-MM-DD'),
    },
    "3_months": {
      start_date: moment().subtract(3, 'months').format('YYYY-MM-DD'),
      end_date: moment().format('YYYY-MM-DD'),
    },
    "6_months": {
      start_date: moment().subtract(6, 'months').format('YYYY-MM-DD'),
      end_date: moment().format('YYYY-MM-DD'),
    }
  }
  if (values?.selectedMonthTab) {
    return map[values?.selectedMonthTab]
  }
  return null
}

function VisaResidency({
  nationalitiesConfigValue,
  nationalitiesConfigValueObj,
  borderTypeConfigValue,
  emiratesConfigValue
}) {
  const themeVariables = useToken();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isLoadingExport, setIsLoadingExport] = useState(true);
  const getResponsive = useResponsive();
  const intl = useIntl();
  const [applyAt, setApplyAt] = useState(true);
  const [localeStore] = useContext(LocaleContext);
  const isRtl = checkRtl(localeStore);
  const {
    printDocument,
    printDocumentCanvas,
    isCreatingPdf
  } = usePrint();

  const initialFilters = {};

  const [filters, setFilters] = useState(initialFilters);
  const [visaOfficeValues, setVisaOfficeValues] = useState([]);


  const dateRange = getDateRange(filters);
  const borderTypeConfigValueData = borderTypeConfigValue?.data || [];

  useEffect(() => {
    if (applyAt) {
      setTimeout(() => {
        setApplyAt(false)
      }, 200)
    }
  }, [applyAt])

  const filtersData = useMemo(() => {

    return {
      nationalities: nationalitiesConfigValue?.data?.map((item) => {
        return {
          ar: item?.country_ar,
          en: item?.country_en,
          value: item?.country_alpha3,
        };
      }),
      emirates: emiratesConfigValue?.data?.map((item) => {
        return {
          ar: item?.emirate_name_ar,
          en: item?.emirate_name_en,
          value: item?.emirate_code,
        };
      }),
      genders: getGenderOptions(intl),
      ageRanges: getAgeOptions(),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const cleanedObject = cleanObject(filters);

  const showAppliedFilters = !_.isEmpty(cleanedObject);

  const CHART_WIDTH = {
    first: {
      flex: getResponsive({ default: "0 0 100%" })
    },
    second: {
      flex: getResponsive({ default: "0 0 calc(100% - 388px)", desktop: "0 0 calc(100% - 320px)", tablet: "0 0 calc(100% - 258px)", midTablet: "0 0 100%" })
    },
  };

  const visaResidencyEle = ({ isPreviewOpen }) => {
    return (
      <VisaResidenceSummary isPreviewOpen={isPreviewOpen} filter={filters} dateRange={dateRange} />
    )
  }

  const visaRegionWrapperEle = ({ isPreviewOpen, space, offset, isPrint, rows, callback, isMapHidden, isTableHidden }) => {
    return (
      <VisaByRegionWrapper
        icon={null}
        dateRange={dateRange}
        space={space}
        offset={offset}
        isPrint={isPrint}
        rows={rows}
        callback={callback}
        isPreview={isPreviewOpen}
        filter={filters}
        nationalitiesConfigValueObj={nationalitiesConfigValueObj || {}}
        isTableHidden={isTableHidden}
        isMapHidden={isMapHidden}
      />
    )
  }
  const visaViolationByRegion = ({ isPreviewOpen, space, offset, isPrint, rows, callback }) => {
    return (
      <VisaViolationByRegionWrapper
        icon={null}
        dateRange={dateRange}
        space={space}
        offset={offset}
        isPrint={isPrint}
        rows={rows}
        callback={callback}
        isPreview={isPreviewOpen}
        title={intl?.formatMessage({ id: "Tourist Visa Violations by Emirate & Tourism Office" })}
        filter={filters}
        nationalitiesConfigValueObj={nationalitiesConfigValueObj || {}}
      />
    )
  }
  const scrollableElements = (
    <>
      <Row>
        <Col>
          <Row align="middle" gutter={8}>
            <Col flex="none">
              <FundOutlined style={{ fontSize: getResponsive({ default: "32px", tablet: "28px" }) }} />
            </Col>
            <Col flex="auto">
              <Title level={5}>
                {intl?.formatMessage({ id: "Applications Overview" })}
              </Title>
            </Col>
          </Row>
        </Col>
      </Row>
      <Row>
        <Col>
          <Row
            gutter={getResponsive({
              default: themeVariables?.token?.marginLG,
              desktop: themeVariables?.token?.marginSM,
              midTablet: [0, themeVariables?.token?.marginSM],
            })}
            wrap={getResponsive({
              default: false,
              midTablet: true,
            })}
          >
            <Col flex={CHART_WIDTH?.first?.flex}>
              {visaResidencyEle({})}
            </Col>
          </Row>
        </Col>
      </Row>
      
      <Row>
        <Col>
          <Row align="middle" gutter={8}>
            <Col flex="none">
              <IdentificationCard size={32} />
            </Col>
            <Col flex="auto">
              <Title level={5}>
                {intl?.formatMessage({ id: "Tourist Visas" })}
              </Title>
            </Col>
          </Row>
        </Col>
      </Row>

      <Row>
        <Col>
          <Row
            gutter={[
              getResponsive({
                default: themeVariables?.token?.marginLG,
                desktop: themeVariables?.token?.marginSM,
                tablet: [0, themeVariables?.token?.marginSM],
              }),
              getResponsive({
                default: themeVariables?.token?.marginLG,
                desktop: themeVariables?.token?.marginSM,
                tablet: [0, themeVariables?.token?.marginSM],
              })
            ]}
          >
            <Col span={getResponsive({ default: 24 })}>
              {visaRegionWrapperEle({})}
            </Col>

            <Col span={getResponsive({ default: 24 })}>
              {visaViolationByRegion({})}
            </Col>
          </Row>
        </Col>
      </Row>
    </>
  );

  const titleEle = ({ isPreviewOpen }) => (
    <Row>
      <Col>
        <Row
          align="middle"
          style={{
            flexWrap: getResponsive({ default: "wrap", mobile: "nowrap" })
          }}
          justify="space-between"
          gutter={[12, 12]}
        >
          <Col flex={getResponsive({ default: "none", mobile: "auto" })} style={{ maxWidth: getResponsive({ default: "80%", mobile: "100%" }) }}>
            <Row gutter={12} wrap={false} align="flex-start">
              <Col flex="none" style={{ color: "var(--colorText)" }}>
                <IdentificationBadge
                  color={themeVariables?.token?.Typography?.colorText}
                  size={getResponsive({
                    default: themeVariables?.token?.iconSizeXXMD,
                    tablet: themeVariables?.token?.iconSizeXXMD,
                  })}
                />
              </Col>
              <Col flex="auto" style={getResponsive({ default: "true", mobile: "false" }) === "true" && { maxWidth: "355px" }}>
                <Row
                  gutter={[0, 0]}
                  wrap={true}
                >
                  <Col
                    style={{
                      display: "flex",
                    }}
                  >
                    <Row
                      gutter={16}
                      wrap={false}
                      style={{ flexGrow: 1, alignItems: "flex-start" }}
                    >
                      <Col flex="auto">
                        <Row>
                          <Col>
                            <Title level={getResponsive({ default: 4, mobile: 5 })}>
                              {intl?.formatMessage({
                                id: "Visas & Residency Overview",
                              })}
                            </Title>
                          </Col>

                          {
                            getResponsive({ default: "false", mobile: "true" }) === "true" && (
                              <Col
                                style={{
                                  display: "flex",
                                }}
                              >
                                <Text size="sm" color="var(--colorTextDescription)">
                                  {intl?.formatMessage({
                                    id: "Key Statistics on Visa, Residency, and Passport Processing",
                                  })}
                                </Text>
                              </Col>
                            )
                          }
                        </Row>
                      </Col>
                      {
                        (getResponsive({ default: "false", mobile: "true" }) === "true" && !isPreviewOpen) &&
                        <FilterWrap
                          isPreviewOpen={isPreviewOpen}
                          setIsPreviewOpen={setIsPreviewOpen}
                          setIsLoadingExport={setIsLoadingExport}
                          filters={filters}
                          setFilters={setFilters}
                          intl={intl}
                          borderTypeConfigValueData={borderTypeConfigValueData}
                          setApplyAt={setApplyAt}
                          initialFilters={initialFilters}
                          getResponsive={getResponsive}
                          filtersData={filtersData}
                          isRtl={isRtl}
                          showAppliedFilters={showAppliedFilters}
                          setVisaOfficeValues={setVisaOfficeValues}
                        />
                      }
                    </Row>
                  </Col>
                  {
                    getResponsive({ default: "true", mobile: "false" }) === "true" && (
                      <Col
                        style={{
                          display: "flex",
                        }}
                      >
                        <Text size="sm" color="var(--colorTextDescription)">
                          {intl?.formatMessage({
                            id: "Key Statistics on Visa, Residency, and Passport Processing",
                          })}
                        </Text>
                      </Col>
                    )
                  }
                </Row>
              </Col>
            </Row>
          </Col>
          {
            (getResponsive({ default: "true", mobile: "false" }) === "true" && !isPreviewOpen) &&
            <FilterWrap
              isPreviewOpen={isPreviewOpen}
              setIsLoadingExport={setIsLoadingExport}
              setIsPreviewOpen={setIsPreviewOpen}
              filters={filters}
              setFilters={setFilters}
              intl={intl}
              borderTypeConfigValueData={borderTypeConfigValueData}
              setApplyAt={setApplyAt}
              initialFilters={initialFilters}
              getResponsive={getResponsive}
              filtersData={filtersData}
              isRtl={isRtl}
              showAppliedFilters={showAppliedFilters}
              setVisaOfficeValues={setVisaOfficeValues}
            />
          }
        </Row>
      </Col>
    </Row>
  )

  const appliedFiltersEle = ({ isPreviewOpen }) => (
    <>
      {showAppliedFilters && (
        <Row>
          <Col>
            <AppliedFilters
              data={[
                ...(dateRange?.start_date
                  ? [
                    {
                      label: intl?.formatMessage({ id: "Date Range" }),
                      value: `${dateRange?.start_date} - ${dateRange?.end_date}`,
                      key: "start_date",
                      closable: true,
                    },
                  ]
                  : []),
                // ...(cleanedObject?.port_type
                //   ? [
                //     {
                //       label: intl?.formatMessage({ id: "Border Type" }),
                //       value: `${cleanedObject?.port_type}`,
                //       key: "port_type",
                //       closable: true,
                //     },
                //   ]
                //   : []),
                ...(!_.isEmpty(cleanedObject?.nationality)
                  ? [
                    {
                      label: intl?.formatMessage({ id: "Nationalities" }),
                      value: getLabel(
                        filtersData?.nationalities,
                        cleanedObject?.nationality,
                        isRtl
                      ),
                      key: "nationality",
                      closable: true,
                    },
                  ]
                  : []),
                ...(!_.isEmpty(cleanedObject?.emirates)
                  ? [
                    {
                      label: intl?.formatMessage({ id: "Emirates" }),
                      value: getLabel(
                        filtersData?.emirates,
                        cleanedObject?.emirates,
                        isRtl
                      ),
                      key: "emirates",
                      closable: true,
                    },
                  ]
                  : []),
                ...(!_.isEmpty(cleanedObject?.visa_offices)
                  ? [
                    {
                      label: intl?.formatMessage({ id: "Tourism Department" }),
                      value: getOfficesLabel(
                        visaOfficeValues?.data,
                        cleanedObject?.visa_offices,
                        isRtl
                      ),
                      key: "visa_offices",
                      closable: true,
                    },
                  ]
                  : []),
                ...(cleanedObject.age_group
                  ? [
                    {
                      label: intl?.formatMessage({ id: "Age Range" }),
                      value: cleanedObject.age_group
                        ?.split("-")
                        ?.map((v, index) =>
                          index === 1 && v == 120 ? "60+" : v
                        )
                        ?.join("-"),
                      key: "age_group",
                      closable: true,
                    },
                  ]
                  : []),
                ...(cleanedObject.gender
                  ? [
                    {
                      label: intl?.formatMessage({ id: "Gender" }),
                      value: filtersData?.genders?.find(
                        (item) => item?.value === cleanedObject?.gender
                      )?.label,
                      key: "gender",
                      closable: true,
                    },
                  ]
                  : []),
                // ...(cleanedObject?.status
                //   ? [
                //     {
                //       label: intl?.formatMessage({ id: "Status" }),
                //       value: intl?.formatMessage({ id: cleanedObject?.status }),
                //       key: "status",
                //       closable: true,
                //     },
                //   ]
                //   : []),
              ]}
              onTagCross={(value) => {
                setFilters((f) => {
                  if (value?.key === "start_date") {
                    delete f?.selectedMonthTab;
                    delete f?.date_range;
                  } else {
                    delete f?.[value.key];
                  }
                  return { ...f };
                });
              }}
              onClear={() => {
                setFilters({});
              }}
            />
          </Col>
        </Row>
      )}
    </>
  )
  let printingElements = [];
  if (isPreviewOpen) {
    printingElements = [
      <div key="first-element">
        <div style={{ marginBottom: "20px" }}>
          {titleEle({ isPreviewOpen })}
        </div>
        <div style={{ marginBottom: "20px" }}>
          {appliedFiltersEle({ isPreviewOpen })}
        </div>
        <div>
          {visaResidencyEle({})}
        </div>
      </div>,
      visaRegionWrapperEle({ isPreviewOpen, isTableHidden: true }),
      ({ space, isPrint, rows, callback, offset }) => visaRegionWrapperEle({ isMapHidden: true, isPreviewOpen, space, isPrint, rows, callback, offset }),
      visaViolationByRegion({ isPreviewOpen, isTableHidden: true, }),
      ({ space, isPrint, rows, callback, offset }) => visaViolationByRegion({ isMapHidden: true, isPreviewOpen, space, offset, isPrint, rows, callback }),
    ]
  }

  const handleExportLoading = useCallback((v) => {
    setIsLoadingExport(v)
  }, [])
  
  const mainContentEle = (
    <Row
      isFullHeight
    >
      <Col
        isFlex
        gap={getResponsive({
          default: themeVariables?.token?.marginLG,
          desktop: themeVariables?.token?.marginSM,
        })}
      >
        {titleEle({ })}

        {appliedFiltersEle({ })}

        {
          applyAt
            ? (
              <Card
                loading={!!applyAt}
                style={{
                  height: "350px"
                }}
              />
            )
            : resolveTernary(getResponsive({ default: "true", tablet: "false" }) === "true",
              (
                <PageSectionsScrollWrap
                  rowGutter={0}
                  themeVariables={themeVariables}
                  getResponsive={getResponsive}
                  isRtl={isRtl}
                >
                  <Col
                    isFlex
                    gap={getResponsive({
                      default: themeVariables?.token?.marginLG,
                      desktop: themeVariables?.token?.marginSM,
                    })}
                  >
                    {scrollableElements}
                  </Col>
                </PageSectionsScrollWrap>
              ),
              (
                <>{scrollableElements}</>
              ))}
      </Col>
    </Row>
  )

  return (
    <Row isFullHeight>
      <MemoModal
        open={isPreviewOpen}
        destroyOnClose={true}
        closable={false}
        width={"95%"}
        className="export-modal"
        centered
        style={{
          maxWidth: "1920px",
        }}
        isContentPaddingNone
        styles={{
          body: {
            height: '90dvh',
          }
        }}
        footer={[]}
        onCancel={() => {
          setIsPreviewOpen(false)
          setIsLoadingExport(true)
        }}
      >
        <Row
          isFullHeight
        >
          <Col
            paddingBlock="16px 0px"
            style={{
              position: "relative"
            }}
          >
            {
              !!isLoadingExport &&
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  bottom: 61,
                  left: 0,
                  right: 0,
                  margin: "auto",
                  backgroundColor: "var(--colorBgContainer)",
                  zIndex: 9,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center"
                }}
              >
                <Spin />
              </div>
            }
            <Scrollbars>
              <Row
                style={{
                }}
              >
                <Col
                  paddingInline="var(--paddingPx)"
                  paddingBlock="0px 76px"
                >
                  <Row
                    style={{
                    }}
                  >
                    <Col
                      style={{
                      }}
                    >
                      {
                        <Print
                          printElements={printingElements}
                          setIsLoading={handleExportLoading}
                        />
                      }
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Scrollbars>
          </Col>
        </Row>
        <Row
          style={{
            background: "var(--colorBgContainer)",
            boxShadow: `0px 2px 4px 0px #00000005, 0px 1px 6px -1px #00000005, 0px 1px 2px 0px #00000008`,
            position: 'absolute',
            bottom: "0px",
            left: "0px",
            right: "0px",
            zIndex: 2,
            borderTop: "1px solid var(--colorBorder)"
          }}
        >
          <Col
            style={{
              paddingInline: "14px",
              paddingBlock: "14px",
            }}
          >
            <div
              style={{
                display: "flex",
                columnGap: "8px",
                justifyContent: "flex-end"
              }}
            >
              <Button
                size="default"
                type="default"
                disabled={isCreatingPdf}
                onClick={() => {
                  setIsPreviewOpen(false)
                }}
              >
                {intl?.formatMessage({ id: "Cancel" })}
              </Button>
              
              <Button
                type="primary"
                size="default"
                loading={isCreatingPdf}
                disabled={isLoadingExport}
                onClick={() => {
                  getResponsive({ default: "true", bigTablet: "false" }) === "true" ? printDocumentCanvas() : printDocument()                }}
              >
                {intl?.formatMessage({ id: "Download" })}
              </Button>
            </div>
          </Col>
        </Row>
      </MemoModal>
      <Col>
        {mainContentEle}
      </Col>
    </Row>
  );
}

VisaResidency.propTypes = {
  nationalitiesConfigValue: PropTypes.any,
  nationalitiesConfigValueObj: PropTypes.object,
  borderTypeConfigValue: PropTypes.any,
  emiratesConfigValue: PropTypes.any
}

export default VisaResidency;
