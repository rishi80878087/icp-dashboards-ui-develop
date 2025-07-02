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
  Tooltip,
  Scrollbars,
  Spin,
  Modal
} from "re-usable-design-components";
import ActiveGeneralSvg from "@/svgr/ActiveGeneral";
import Globe from "@/svgr/Globe"
import Print, { usePrint } from "@/components/Print";
import { useIntl } from "react-intl";
import { useState, useEffect, useContext, useMemo, memo, useCallback } from "react";
import AppliedFilters from "@/views/ExpatsResidence/widgets/AppliedFilters";
import useResponsive from "@/hooks/useResponsive";
import ResidensByEmiratesWrapper from "@/views/ActiveGeneral/widgets/ResidensByEmiratesWrapper";
import VisaHolder from "@/views/ActiveGeneral/widgets/VisaHolder";
import ResidentsByRegionWrapper from "@/views/ActiveGeneral/widgets/ResidentsByRegionWrapper";
import ResidentsByGender from "@/views/ActiveGeneral/widgets/ResidentsByGender";
import PopulationByResidencyType from "@/views/ActiveGeneral/widgets/PopulationByResidencyType";
import VisaHolderByVisaType from "@/views/ActiveGeneral/widgets/VisaHolderByVisaType";
import ResidentsByAge from "@/views/ActiveGeneral/widgets/ResidentsByAge";
import { checkRtl, getEmirateData, cleanObject, resolveTernary } from "@/utils/helper";
import { LocaleContext } from "@/globalContext/locale/localeProvider";
import {
  getGenderOptions,
  getAgeOptions,
} from "@/views/ActiveGeneral/utils/helper";
import _ from "lodash";
import PageSectionsScrollWrap from "@/components/PageSectionsScrollWrap";


const { useToken } = theme;
const { Funnel, CheckSquareOffset, Info, ArrowSquareOut } = PhosphorIcons;

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
        if (val[1] - val[0] >= 5) {
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
  setIsPreviewOpen,
  filtersData,
  isRtl,
  showAppliedFilters,
  initialFilters,
  setApplyAt,
  setIsLoadingExport,
}) => {
  const [localFilters, setLocalFilters] = useState(filters);
  const [isDrawer, setIsDrawer] = useState(false)
  const isFiltersLoading = false;
  const [isDropOpen, setIsDropOpen] = useState(false)
  const isFilterDisabled = _.isEqual(filters, localFilters);
  const [isApplyDisabled, setIsApplyDisabled] = useState(false)

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

        setTimeout(() => {
          setApplyAt(new Date()?.getTime())
          setFilters(localFilters);
          setIsDropOpen(false)
          if (getResponsive({ mobile: "true" }) === "true") {
            setIsDrawer(false)
          }
        }, 200)
      }}
    >
      {intl?.formatMessage({ id: getResponsive({ default: "Apply", tablet: "Apply" }) })}
    </Button>
  )

  const nationalityEle = (
    <Select
      placeholder={getResponsive({
        default: intl.formatMessage({ id: "Country" }),
        midTablet: intl.formatMessage({ id: "Select" }),
      })}
      size="middle"
      value={localFilters?.nationality_code}
      allowClear
      showSearch
      mode="multiple"
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
          nationality_code: e,
        }));
      }}
      options={filtersData?.nationalities?.map((v) => ({
        value: v?.value,
        label: isRtl ? v?.ar : v?.en,
      }))}
    />
  );

  const emirateEle = (
    <Select
      placeholder={getResponsive({
        default: intl.formatMessage({ id: "Emirate" }),
        midTablet: intl.formatMessage({ id: "Select" }),
      })}
      mode="multiple"
      maxTagCount={4}
      size="middle"
      popupMatchSelectWidth={false}
      style={{
        minWidth: "148px",
        maxWidth: getResponsive({
          default: "100%",
        }),
      }}
      value={localFilters?.emirate_code}
      allowClear
      loading={isFiltersLoading}
      onChange={(e) => {
        setLocalFilters((v) => ({
          ...v,
          emirate_code: e,
        }));
      }}
      showSearch
      filterOption={(input, option) => {
        return option?.label
          ?.toLowerCase()
          ?.includes(input?.toLowerCase());
      }}
      options={filtersData?.emiratesTypes?.map((v) => ({
        value: v?.value,
        label: isRtl ? v?.ar : v?.en,
      }))}
    />
  );

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
          label: intl?.formatMessage({ id: "Country" }),
          comp: nationalityEle,
        },
        {
          label: intl?.formatMessage({ id: "Emirate" }),
          comp: emirateEle,
        },
      ]
      : [];

  const dropContent = (
    <Row
      style={{
        maxWidth: getResponsive({ default: "350px", mobile: "100%" }),
        minWidth: getResponsive({ default: "350px", mobile: "100%" })
      }}
    >
      <Col
        paddingInline={getResponsive({ default: "var(--paddingPx)", mobile: "0px" })}
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
            getResponsive({ default: "true", mobile: "false" }) &&
            <Col>
              <Text strong>
                {intl?.formatMessage({ id: "Filters" })}
              </Text>
            </Col>
          }
          <Col>
            <Row gutter={[0, 16]}>
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

              {
                getResponsive({ default: "true", tablet: "true" }) === "true" && (
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
                                <Text color="currentColor">{intl.formatMessage({ id: getResponsive({ default: "Filters", tablet: "Filters" }) })}</Text>
                              </Col>
                            }
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
                  </Dropdown>
                )}
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
          {/* {
            getResponsive({ default: "true", tablet: "false" }) === "true" && (
              <Col flex="none">
                {applyEle}
              </Col>
            )
          } */}
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
  setIsLoadingExport: PropTypes.any,
  filtersData: PropTypes.any,
  setApplyAt: PropTypes.any,
  getResponsive: PropTypes.func,
  initialFilters: PropTypes.any,
  intl: PropTypes.any,
  isRtl: PropTypes.any,
  setFilters: PropTypes.func,
  showAppliedFilters: PropTypes.any,
  setIsPreviewOpen: PropTypes.any
}

function ActiveGeneral({ emiratesConfigValue, nationalitiesConfigValue, nationalitiesConfigValueObj }) {
  const themeVariables = useToken();
  const [isLoadingExport, setIsLoadingExport] = useState(true);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const {
    isCreatingPdf,
    printDocument,
    printDocumentCanvas
  } = usePrint({ name: "UAE-Population.pdf" });
  const getResponsive = useResponsive();
  const intl = useIntl();
  const [applyAt, setApplyAt] = useState(true);
  const [localeStore] = useContext(LocaleContext);
  const isRtl = checkRtl(localeStore);

  const initialFilters = {};

  const [filters, setFilters] = useState(initialFilters);

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
      genders: getGenderOptions(intl),
      ageRanges: getAgeOptions(),
      emiratesTypes: emiratesConfigValue?.data?.map((item) => {
        return {
          ar: item?.emirate_name_ar,
          en: item?.emirate_name_en,
          value: item?.emirate_code,
        };
      }),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleExportLoading = useCallback((v) => {
    setIsLoadingExport(v)
  }, [])

  const cleanedObject = cleanObject(filters);

  const showAppliedFilters = !_.isEmpty(cleanedObject);

  const CHART_WIDTH = {
    first: {
      flex: getResponsive({ default: "0 0 576px", desktop: "0 0 458px", tablet: "0 0 353px", midTablet: "0 0 100%" })
    },
    second: {
      flex: getResponsive({ default: "0 0 calc(100% - 576px)", desktop: "0 0 calc(100% - 458px)", tablet: "0 0 calc(100% - 353px)", midTablet: "0 0 100%" })
    },
  };

  const emirateMap = getEmirateData(
    themeVariables,
    emiratesConfigValue?.data,
    isRtl,
    true
  );

  const titleEle = (
    <Row gutter={12} align="middle">
      <Col flex="none" style={{ color: "var(--colorText)" }}>
        <ActiveGeneralSvg
          color={themeVariables?.token?.Typography?.colorText}
          size={getResponsive({
            default: themeVariables?.token?.iconSizeXXMD,
            tablet: themeVariables?.token?.iconSize,
          })}
        />
      </Col>
      <Col flex="none">
        <Title level={4}>
          {intl?.formatMessage({
            id: "UAE Population",
          })}
        </Title>
      </Col>
    </Row>
  )
  const appliedFiltersEle = (
    <>
      {
        showAppliedFilters && (
          <Row>
            <Col>
              <AppliedFilters
                data={[
                  ...(cleanedObject?.nationality_code
                    ? [
                      {
                        label: intl?.formatMessage({ id: "Country" }),
                        value: getLabel(
                          filtersData?.nationalities,
                          cleanedObject?.nationality_code,
                          isRtl
                        ),
                        key: "nationality_code",
                        closable: true,
                      },
                    ]
                    : []),
                  ...(cleanedObject?.emirate_code
                    ? [
                      {
                        label: intl?.formatMessage({ id: "Emirate" }),
                        value: getLabel(
                          filtersData?.emiratesTypes,
                          cleanedObject?.emirate_code,
                          isRtl
                        ),
                        key: "emirate_code",
                        closable: true,
                      },
                    ]
                    : []),
                  ...(cleanedObject.age_range
                    ? [
                      {
                        label: intl?.formatMessage({ id: "Age Range" }),
                        value: cleanedObject.age_range
                          ?.split("-")
                          ?.map((v, index) =>
                            index === 1 && v == 120 ? "60+" : v
                          )
                          ?.join("-"),
                        key: "age_range",
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
                ]}
                onTagCross={(value) => {
                  setFilters((f) => {
                    delete f?.[value.key];
                    return { ...f };
                  });
                }}
                onClear={() => {
                  setFilters({});
                }}
              />
            </Col>
          </Row>
        )
      }
    </>
  )

  const visaHolderEle = (val = {}) => (
    <VisaHolder filter={filters} {...val} />
  );

  const residentsByEmirateEle = (val = {}) => (
    <ResidensByEmiratesWrapper
      filter={
        filters?.emirate_code
          ? {
            emirate: emirateMap[filters?.emirate_code],
            ...filters,
          }
          : filters
      }
      emiratesConfigValue={emiratesConfigValue?.data || []}
      {...val}
    />
  );

  const populationByResidencyEle = (val = {}) => (
    <PopulationByResidencyType isRtl={isRtl} filter={filters} {...val} />
  )

  const visaHolderByVisaTypeEle = (val = {}) => (
    <VisaHolderByVisaType isRtl={isRtl} filter={filters} {...val} />
  )

  const residentsByRegionEle = (val = {}) => (
    <ResidentsByRegionWrapper
      icon={<Globe />}
      title={(
        <Row align="middle" gutter={4}>
          <Col flex="none">
            {intl.formatMessage({ id: "Population By Region & Country" })}
          </Col>
          <Col flex="none">
            <Tooltip
              title={intl?.formatMessage({ id: "UAE_Population_By_Region_&_Nationality_Tooltip" })}
            >
              <span>
                <Info style={{ marginBottom: "3px" }} color="var(--colorIcon)" size={14} weight="bold" />
              </span>
            </Tooltip>
          </Col>
        </Row>
      )}
      filter={filters}
      nationalitiesConfigValueObj={nationalitiesConfigValueObj || {}}
      {...val}
    />
  )

  const residentsByGenderEle = (val = {}) => (
    <ResidentsByGender isRtl={isRtl} filter={filters} {...val} />
  )

  const residentsByAgeEle = (val = {}) => (
    <ResidentsByAge isRtl={isRtl} filter={filters} {...val} />
  )

  let printingElements = [];
  if (isPreviewOpen) {
    printingElements = [
      titleEle,
      appliedFiltersEle,
      <Row
        key="visa-holder"
        gutter={getResponsive({
          default: themeVariables?.token?.marginSM,
        })}
        wrap={getResponsive({
          default: false,
        })}
      >
        <Col flex={CHART_WIDTH?.first?.flex}>
          {visaHolderEle({ isPreview: isPreviewOpen })}
        </Col>
        <Col flex={CHART_WIDTH?.second?.flex}>
          {residentsByEmirateEle({ isPreview: isPreviewOpen })}
        </Col>
      </Row>,
      populationByResidencyEle({ isPreview: isPreviewOpen }),
      visaHolderByVisaTypeEle({ isPreview: isPreviewOpen }),
      residentsByRegionEle({ isPreview: isPreviewOpen, isTableHidden: true }),
      ({ space, isPrint, rows, callback, offset }) => residentsByRegionEle({ isMapHidden: true, isPreview: isPreviewOpen, space, offset, isPrint, rows, callback }),
      residentsByGenderEle({ isPreview: isPreviewOpen }),
      residentsByAgeEle({ isPreview: isPreviewOpen })
    ]
  }

  const scrollableElements = (
    <>
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
              {visaHolderEle()}
            </Col>
            <Col flex={CHART_WIDTH?.second?.flex}>
              {residentsByEmirateEle()}
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
              tablet: [0, themeVariables?.token?.marginSM],
            })}
          >
            <Col span={getResponsive({ default: 12, tablet: 24 })}>
              {populationByResidencyEle()}
            </Col>
            <Col span={getResponsive({ default: 12, tablet: 24 })}>
              {visaHolderByVisaTypeEle()}
            </Col>
          </Row>
        </Col>
      </Row>

      <Row>
        <Col>
          {residentsByRegionEle()}
        </Col>
      </Row>

      <Row>
        <Col>
          <Row
            gutter={getResponsive({
              default: themeVariables?.token?.marginLG,
              desktop: themeVariables?.token?.marginSM,
              tablet: [0, themeVariables?.token?.marginSM],
            })}
          >
            <Col span={getResponsive({ default: 12, tablet: 24 })}>
              {residentsByGenderEle()}
            </Col>
            <Col span={getResponsive({ default: 12, tablet: 24 })}>
              {residentsByAgeEle()}
            </Col>
          </Row>
        </Col>
      </Row>
    </>
  );

  const mainEle = (
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
        <Row>
          <Col>
            <Row align="middle" justify="space-between">
              <Col flex="none">
                {titleEle}
              </Col>

              <FilterWrap
                filters={filters}
                setFilters={setFilters}
                setIsPreviewOpen={setIsPreviewOpen}
                setIsLoadingExport={setIsLoadingExport}
                intl={intl}
                setApplyAt={setApplyAt}
                initialFilters={initialFilters}
                getResponsive={getResponsive}
                filtersData={filtersData}
                isRtl={isRtl}
                showAppliedFilters={showAppliedFilters}
              />
            </Row>
          </Col>
        </Row>

        {appliedFiltersEle}

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
            : resolveTernary(getResponsive({ default: "true", tablet: "false" }) === "true", (
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
            ), (
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
                  // maxWidth: "1240px",
                  // width: "100%",
                  // margin: "auto"
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
                    <Col>
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
                  setIsLoadingExport(true)
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
                  getResponsive({ default: "true", bigTablet: "false" }) === "true" ? printDocumentCanvas() : printDocument()
                }}
              >
                {intl?.formatMessage({ id: "Download" })}
              </Button>
            </div>
          </Col>
        </Row>
      </MemoModal>
      <Col>
        {mainEle}
      </Col>
    </Row>
  );
}

ActiveGeneral.propTypes = {
  emiratesConfigValue: PropTypes.any,
  nationalitiesConfigValue: PropTypes.any,
  nationalitiesConfigValueObj: PropTypes.object
}

export default ActiveGeneral;
