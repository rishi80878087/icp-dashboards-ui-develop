import PropTypes from "prop-types"
import {
  Row, Col, theme, Title,
  Tooltip, Select, Drawer, Dropdown, Scrollbars, Button, PhosphorIcons,
  Text, Slider, RadioGroup, Card, Modal
} from "re-usable-design-components"
import { useIntl } from "react-intl";
import VisaHolderByGender from "./visaHolderWidgets/VisaHolderByGender";
import VisaHoldersByVisaType from "./visaHolderWidgets/VisaHoldersByVisaType";
import VisaHoldersByAge from "./visaHolderWidgets/VisaHoldersByAge";
import VisaHoldersByRegionWrapper from "./visaHolderWidgets/VisaHoldersByRegionWrapper"
import VisaHoldersByEmiratesWrapper from "./visaHolderWidgets/VisaHoldersByEmiratesWrapper";
import React, { useState, useEffect, useMemo, useContext, memo, useCallback } from "react";
import { LocaleContext } from "@/globalContext/locale/localeProvider";
import { checkRtl, cleanObject, resolveTernary } from "@/utils/helper";
import useResponsive from "@/hooks/useResponsive";
import Print, { usePrint } from "@/components/Print";
import AppliedFilters from "./widgets/AppliedFilters";
import _ from "lodash";
import PageSectionsScrollWrap from '@/components/PageSectionsScrollWrap';
import PrintModalWrap from "@/components/Print/PrintModalWrap";


const { Funnel, CheckCircle, ArrowSquareOut, Info, IdentificationCard } = PhosphorIcons;
const { useToken } = theme;
const MemoModal = memo(Modal)


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


function getDropdownContent(dropContent) {
  return () => (
    dropContent
  )
}

function FiltersWrap({
  setApplyAt, showAppliedFilters,
  transformedEmirates, intl, isRtl, filters,
  transformedNationalities, filtersData, setFilters, getResponsive,
  setIsPreviewOpen,
  setIsLoadingExport,
}) {
  const nationalityOptions = useMemo(() => {
    return filtersData?.nationalities?.map((v) => ({ value: v?.value, label: isRtl ? v?.ar : v?.en }))?.sort((a, b) => a?.label.localeCompare(b?.label))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transformedNationalities]);
  const [isDrawer, setIsDrawer] = useState(false)
  const [isDropOpen, setIsDropOpen] = useState(false)
  const [isApplyDisabled, setIsApplyDisabled] = useState(false)
  const [localFilters, setLocalFilters] = useState({})


  useEffect(() => {
    if (!_.isEqual(filters, localFilters)) {
      setLocalFilters(filters)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  useEffect(() => {
    if (isApplyDisabled) {
      setIsApplyDisabled(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localFilters])

  const isFiltersLoading = false

  const isFilterDisabled = _.isEqual(filters, localFilters);

  const applyEle = (
    <Button
      disabled={isFilterDisabled || isApplyDisabled}
      type="primary"
      icon={<CheckCircle />}
      size="default"
      onClick={() => {
        setIsApplyDisabled(true)
        setTimeout(() => {
          setApplyAt(new Date().getTime())
          setIsDropOpen(false)
          setFilters(localFilters);
          if (getResponsive({ mobile: "true" }) === "true") {
            setIsDrawer(false)
          }
        }, 200)
      }}
    >
      {intl?.formatMessage({ id: getResponsive({ default: "Apply", mobile: "Apply" }) })}
    </Button>
  )

  function handleSliderChange(val) {
    setLocalFilters((v) => ({
      ...v,
      age_range: `${val?.[0] == 16 ? 18 : val?.[0]}-${val?.[1] === 65 ? 120 : resolveTernary(val?.[1] == 16, 18, val?.[1])}`,
    }));
  }

  const ageRangeEle = (
    <SliderWrap
      open
      step={null}
      range
      min={0}
      max={65}
      marks={{
        0: <div style={{ paddingTop: "var(--marginXXSPx)" }}>0</div>,
        16: <div style={{ paddingTop: "var(--marginXXSPx)" }}>18</div>,
        21: <div style={{ paddingTop: "var(--marginXXSPx)" }}>21</div>,
        29: <div style={{ paddingTop: "var(--marginXXSPx)" }}>29</div>,
        39: <div style={{ paddingTop: "var(--marginXXSPx)" }}>39</div>,
        49: <div style={{ paddingTop: "var(--marginXXSPx)" }}>49</div>,
        59: <div style={{ paddingTop: "var(--marginXXSPx)" }}>59</div>,
        65: <div style={{ paddingTop: "var(--marginXXSPx)" }}>60+</div>,
      }}
      value={localFilters?.age_range}
      defaultValue={[0, 65]}
      onChange={(v) => {
        handleSliderChange(v);
      }}
    />
  )

  const genderEle = (
    <MemoisedRadioGroup
      value={localFilters?.gender_code}
      onChange={(e) => {
        setTimeout(() => {
          setLocalFilters((v) => ({
            ...v,
            gender_code: e?.target?.value,
          }))
        }, 100)
      }}
      style={
        getResponsive({
          default: {},
        })
      }
      options={filtersData?.genders?.map((v) => ({ value: v?.value, label: isRtl ? v?.ar : v?.en }))}
    />
  )

  const nationalityEle = (
    <Select
      placeholder={getResponsive({ default: intl.formatMessage({ id: "Country" }), tablet: intl.formatMessage({ id: "Select" }) })}
      size="default"
      value={localFilters?.nationality_code}
      allowClear
      mode="multiple"
      maxTagCount={4}
      showSearch
      style={{
        minWidth: "148px",
        maxWidth: getResponsive({ default: "100%" })
      }}
      loading={isFiltersLoading}
      filterOption={(input, option) => {
        return option?.label
          ?.toLowerCase()
          ?.includes(input?.toLowerCase());
      }}
      popupMatchSelectWidth={true}
      onChange={(e) => {
        setTimeout(() => {
          setLocalFilters((v) => ({
            ...v,
            nationality_code: e,
          }))
        }, 100)
      }}
      options={nationalityOptions}
    />
  )
  const emirateOptions = useMemo(() => {
    return filtersData?.emiratesTypes?.map((v) => ({ value: v?.value, label: isRtl ? v?.ar : v?.en }))?.sort((a, b) => a?.label.localeCompare(b?.label))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transformedEmirates])

  const emirateEle = (
    <Select
      placeholder={getResponsive({ default: intl.formatMessage({ id: "Emirate" }), tablet: intl.formatMessage({ id: "Select" }) })}
      size="default"
      mode="multiple"
      maxTagCount={4}
      popupMatchSelectWidth={true}
      style={{
        minWidth: "148px",
        maxWidth: getResponsive({ default: "100%", })
      }}
      value={localFilters?.emirate_code}
      allowClear
      showSearch
      filterOption={(input, option) => {
        return option?.label
          ?.toLowerCase()
          ?.includes(input?.toLowerCase());
      }}
      loading={isFiltersLoading}
      onChange={(e) => {
        setTimeout(() => {
          setLocalFilters((v) => ({
            ...v,
            emirate_code: e,
          }))
        }, 100)
      }}
      options={emirateOptions}
    />
  )

  const filterItems = (getResponsive({ default: "true", tablet: "true" }) === "true")
    ? [
      {
        label: intl?.formatMessage({ id: "Country" }),
        comp: nationalityEle
      },
      {
        label: intl?.formatMessage({ id: "Emirate" }),
        comp: emirateEle
      },
    ]
    : []

  const Wrap = (getResponsive({ default: "true", mobile: "false" }) === "true") ? Scrollbars : React.Fragment;

  const dropContent = (
    <Row
      style={{
        maxWidth: getResponsive({ default: "350px", mobile: "100%" }),
        minWidth: getResponsive({ default: "350px", mobile: "100%" })
      }}
    >
      <Col
        paddingInline={getResponsive({ default: "0px", mobile: "0px" })}
        paddingBlock={getResponsive({ default: "var(--paddingPx)", mobile: "0px" })}
        style={
          getResponsive({
            default: {
              borderRadius: "8px",
              backgroundColor: "var(--colorBgElevated)",
              boxShadow: getResponsive({ default: "var(--boxShadowSecondary)" }),
            },
            mobile: {}
          })
        }
      >

        <Row gutter={[0, 8]}>
          {
            getResponsive({ default: "true", mobile: "false" }) === "true" && (
              <Col
                paddingInline={getResponsive({ default: "var(--paddingPx)", mobile: "0px" })}
              >
                <Text strong>{intl?.formatMessage({ id: "Filters" })}</Text>
              </Col>
            )
          }
          <Col>
            <Wrap
              style={{
                height: "300px",
              }}
            >
              <Row gutter={[0, 16]}>
                {
                  filterItems?.map((val) => (
                    <Col
                      key={val?.label}
                      paddingInline={getResponsive({ default: "var(--paddingPx)", mobile: "0px" })}
                    >
                      <Row gutter={[0, 8]}>
                        <Col>
                          <Text>
                            {val?.label}
                          </Text>
                        </Col>
                        <Col>
                          {val?.comp}
                        </Col>
                      </Row>
                    </Col>
                  ))
                }
                <Col
                  paddingInline={getResponsive({ default: "var(--paddingPx)", mobile: "0px" })}
                >
                  <Row gutter={[0, 0]}>
                    <Col>
                      <Text>
                        {intl?.formatMessage({ id: "Age Range" })}
                      </Text>
                    </Col>
                    <Col>
                      {ageRangeEle}
                    </Col>
                  </Row>
                </Col>
                {
                  !!filtersData?.genders?.length &&
                  <Col
                    paddingInline={getResponsive({ default: "var(--paddingPx)", mobile: "0px" })}
                  >
                    <Row gutter={[0, 8]}>
                      <Col>
                        <Text>
                          {intl?.formatMessage({ id: "Gender" })}
                        </Text>
                      </Col>
                      <Col>
                        {genderEle}
                      </Col>
                    </Row>
                  </Col>
                }
              </Row>
            </Wrap>
            {
              getResponsive({ default: "true", tablet: "true" }) === "true" && (
                <Row>
                  <Col
                    paddingInline={getResponsive({ default: "var(--paddingPx)", mobile: "0px" })}
                    paddingBlock={"var(--paddingPx) 0px"}
                  >
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
                              if (getResponsive({ default: "true" }) === "true") {
                                setLocalFilters({});
                                setFilters({});
                                setIsDrawer(false)
                              }
                            }, 200)
                          }}
                        >
                          {intl?.formatMessage({ id: getResponsive({ default: "Reset" }) })}
                        </Button>
                      </Col>
                    </Row>
                  </Col>
                </Row>
              )
            }
          </Col>
        </Row>
      </Col>
    </Row>
  )
  return (
    <>
      <Col flex="none">
        <Row align="middle" gutter={12}>
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
                      backgroundColor: "var(--colorBgContainer)"
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
                          style={{
                            ...getResponsive({ default: "false", tablet: "true" }) === "true" && {
                              paddingInline: "var(--paddingXSPx)"
                            }

                          }}
                          {
                            ...getResponsive({ default: "false", midTablet: "true" }) === "true" && {
                              onClick: () => {
                                setIsDropOpen((v) => !v)
                              }
                            }
                          }
                        >
                          <Row align="middle" gutter={8}>
                            {
                              getResponsive({ default: "true", mobile: "false" }) === "true" &&
                              <Col flex="none">
                                <Text color="currentColor">{intl.formatMessage({ id: getResponsive({ default: "Filters", tablet: "Filters" }) })}</Text>
                              </Col>
                            }
                            <Col flex="none">
                              <Funnel color="currentColor" weight="bold" size={16} />
                            </Col>
                          </Row>
                        </Button>
                      </Col>
                    </Row>
                  </Dropdown>
                )
            }
          </Col>
          <Col flex="none">
            <Button
              size={"default"}
              type="default"
              icon={<ArrowSquareOut size={16} weight="bold" />}
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

FiltersWrap.propTypes = {
  filters: PropTypes.any,
  setApplyAt: PropTypes.any,
  filtersData: PropTypes.any,
  getResponsive: PropTypes.func,
  intl: PropTypes.any,
  isRtl: PropTypes.any,
  setFilters: PropTypes.func,
  showAppliedFilters: PropTypes.any,
  transformedEmirates: PropTypes.any,
  transformedNationalities: PropTypes.any,
  setIsPreviewOpen: PropTypes.any,
  setIsLoadingExport: PropTypes.any,
}
function VisaHolders({ nationalitiesConfigValueObj, emiratesConfigValue, residencyTypeValues }) {
  const themeVariables = useToken();

  const [localeStore] = useContext(LocaleContext);
  const [filters, setFilters] = useState({})
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [applyAt, setApplyAt] = useState(true)
  const [isLoadingExport, setIsLoadingExport] = useState(true);
  const {
    isCreatingPdf,
    printDocument,
    printDocumentCanvas
  } = usePrint();

  useEffect(() => {
    if (applyAt) {
      setTimeout(() => {
        setApplyAt(false);
      }, 200);
    }
  }, [applyAt]);

  const intl = useIntl();
  const getResponsive = useResponsive();

  const cleanedObject = cleanObject(filters);

  const isRtl = checkRtl(localeStore);

  const filtersData = {}
  filtersData.genders = [
    { value: 'M', en: 'Male', ar: 'ذكر' },
    { value: 'F', en: 'Female', ar: 'أنثى' },
  ];

  const transformedResidentsType = useMemo(() => {
    if (residencyTypeValues?.data?.length) {
      return residencyTypeValues?.data?.map((val) => {
        return {
          value: val?.resident_type_code,
          en: val?.resident_type_en,
          ar: val?.resident_type_ar,
        }
      })
    }
    return []
  }, [residencyTypeValues]);

  const transformedNationalities = useMemo(() => {
    if (Object?.keys(nationalitiesConfigValueObj)?.length) {
      return Object?.keys(nationalitiesConfigValueObj)?.map((key) => {
        const val = nationalitiesConfigValueObj[key];
        return {
          value: val?.country_alpha3,
          en: val?.country_en,
          ar: val?.country_ar,
        }
      })
    }
    return []
  }, [nationalitiesConfigValueObj]);

  const transformedEmirates = useMemo(() => {
    if (emiratesConfigValue?.data?.length) {
      return emiratesConfigValue?.data?.map((val) => {
        return {
          value: val?.emirate_code,
          en: val?.emirate_name_en,
          ar: val?.emirate_name_ar,
        }
      })
    }
    return []
  }, [emiratesConfigValue]);

  filtersData.nationalities = transformedNationalities
  filtersData.emiratesTypes = transformedEmirates;
  filtersData.emiratesConfigValue = emiratesConfigValue?.data;
  filtersData.residencyTypes = transformedResidentsType;
  filtersData.genders = [
    { value: 'M', en: 'Male', ar: 'ذكر' },
    { value: 'F', en: 'Female', ar: 'أنثى' },
  ]

  const showAppliedFilters = !_.isEmpty(cleanedObject)

  const firstRowEle = () => (
    <Row gutter={[getResponsive({ default: themeVariables?.token?.marginLG, desktop: themeVariables?.token?.marginSM }), themeVariables?.token?.marginSM]}>
      <Col span={getResponsive({ default: 12, tablet: 24 })}>
        <VisaHolderByGender isRtl={isRtl} filters={filters} />
      </Col>

      <Col span={getResponsive({ default: 12, tablet: 24 })}>
        <VisaHoldersByVisaType allTypes={filtersData?.residencyTypes} isRtl={isRtl} filters={filters} />
      </Col>
    </Row>
  )

  const secondRowEle = () => (
    <Row gutter={[getResponsive({ default: themeVariables?.token?.marginLG, desktop: themeVariables?.token?.marginSM }), themeVariables?.token?.marginSM]}>
      <Col span={getResponsive({ default: 12, tablet: 24 })}>
        <VisaHoldersByAge isRtl={isRtl} filters={filters} />
      </Col>

      <Col span={getResponsive({ default: 12, tablet: 24 })}>
        <VisaHoldersByEmiratesWrapper emiratesConfigValue={filtersData?.emiratesConfigValue} filters={filters} isRtl={isRtl} />
      </Col>
    </Row>
  )

  const thirdRowEle = () => (
    <Row>
      <Col>
        <VisaHoldersByRegionWrapper
          filter={filters}
        />
      </Col>
    </Row>
  )

  const scrollableElements = (
    <>
      <Col>
        {firstRowEle()}
      </Col>

      <Col>
        {secondRowEle()}
      </Col>

      <Col>
        {thirdRowEle()}
      </Col>
    </>
  )

  const titleEle = (
    <Row gutter={12} align="middle">
      <Col flex="none" style={{ color: "var(--colorText)" }}>
        <IdentificationCard size={getResponsive({ default: 32, tablet: 24 })} />
      </Col>
      <Col flex="none">
        
        <Row align="middle" gutter={4}>
          <Col flex="none">
            <Title level={getResponsive({ default: 4, mobile: 5 })}>
              {intl?.formatMessage({ id: "Visa Holders Dashboard" })}
            </Title>
          </Col>
          <Col flex="none">
            <Tooltip
              title={intl?.formatMessage({ id: "Visa_Holders_Dashboard_Title_Tooltip" })}
            >
              <span>
                <Info color="var(--colorIcon)" size={14} weight="bold" />
              </span>
            </Tooltip>
          </Col>
        </Row>
      </Col>
    </Row>
  )

  const mainContentEle = (
    <Col
      isFlex
    >

      <Row gutter={[0, getResponsive({ default: themeVariables?.token?.marginLG, desktop: themeVariables?.token?.marginSM })]}>
        <Col>
          <Row wrap={false} align="middle" justify="space-between">
            <Col flex="none">
              {titleEle}
            </Col>

            <FiltersWrap
              transformedNationalities={transformedNationalities}
              filters={filters}
              setApplyAt={setApplyAt}
              setFilters={setFilters}
              getResponsive={getResponsive}
              filtersData={filtersData}
              isRtl={isRtl}
              intl={intl}
              transformedEmirates={transformedEmirates}
              showAppliedFilters={showAppliedFilters}
              setIsLoadingExport={setIsLoadingExport}
              setIsPreviewOpen={setIsPreviewOpen}
            />

          </Row>
        </Col>

        {showAppliedFilters && (
          <Col>
            <AppliedFilters
              data={[
                ...(cleanedObject?.nationality_code
                  ? [
                    {
                      label: intl?.formatMessage({ id: "Country" }),
                      value: getLabel(filtersData?.nationalities, cleanedObject?.nationality_code, isRtl),
                      key: "nationality_code",
                      closable: true,
                    },
                  ]
                  : []),
                ...(cleanedObject?.emirate_code
                  ? [
                    {
                      label: intl?.formatMessage({ id: "Emirate" }),
                      value: getLabel(filtersData?.emiratesTypes, cleanedObject?.emirate_code, isRtl),
                      key: "emirate_code",
                      closable: true,
                    },
                  ]
                  : []),
                ...(cleanedObject.age_range
                  ? [
                    {
                      label: intl?.formatMessage({ id: "Age Range" }),
                      value: cleanedObject.age_range?.split("-")?.map((v, index) => (index === 1 && v == 120) ? "60+" : v)?.join("-"),
                      key: "age_range",
                      closable: true,
                    },
                  ]
                  : []),
                ...(cleanedObject.gender_code
                  ? [
                    {
                      label: intl?.formatMessage({ id: "Gender" }),
                      value: getLabel(filtersData?.genders, cleanedObject?.gender_code, isRtl),
                      key: "gender_code",
                      closable: true,
                    },
                  ]
                  : []),
              ]}
              onTagCross={(value) => {
                setFilters((f) => {
                  delete f?.[value.key]
                  return { ...f }
                })
              }}
              onClear={() => {
                setApplyAt(new Date()?.getTime())
                setFilters({});
              }}
            />
          </Col>
        )}
      </Row>

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
          : resolveTernary(
            getResponsive({ default: "true", tablet: "false" }) === "true",
            (
              <PageSectionsScrollWrap isRtl={isRtl} getResponsive={getResponsive} themeVariables={themeVariables}>
                {scrollableElements}
              </PageSectionsScrollWrap>
            ),
            (
              <Row
                style={{
                  marginTop: getResponsive({ default: themeVariables?.token?.marginLG, desktop: themeVariables?.token?.marginSM })
                }}
                gutter={[0, getResponsive({ default: themeVariables?.token?.marginLG, desktop: themeVariables?.token?.marginSM })]}
              >
                {scrollableElements}
              </Row>
            )
          )
      }
    </Col>
  )
  const handleExportLoading = useCallback((v) => {
    setIsLoadingExport(v)
  }, [])

  const printingElements = [
    titleEle,
    firstRowEle(),
    secondRowEle(),
    thirdRowEle()
  ];

  return (
    <Row
      isFullHeight
    >
      <PrintModalWrap
        open={isPreviewOpen}
        isLoadingExport={isLoadingExport}
        isPreviewOpen={isPreviewOpen}
        isCreatingPdf={isCreatingPdf}
        setIsPreviewOpen={setIsPreviewOpen}
        printDocument={printDocument}
        printDocumentCanvas={printDocumentCanvas}
        setIsLoadingExport={setIsLoadingExport}
      >
        <Print
          printElements={printingElements}
          setIsLoading={handleExportLoading}
        />
      </PrintModalWrap>
      {mainContentEle}
    </Row>
  )
}

VisaHolders.propTypes = {
  emiratesConfigValue: PropTypes.any,
  nationalitiesConfigValueObj: PropTypes.any,
  residencyTypeValues: PropTypes.any
}

export default VisaHolders;
