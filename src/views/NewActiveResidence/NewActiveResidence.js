import React, { useState, useEffect, useContext, useMemo } from "react";
import { useIntl } from "react-intl";
import { LocaleContext } from "@/globalContext/locale/localeProvider";
import {
  Row,
  Col,
  theme,
  Title,
  Tooltip,
  Select,
  Drawer,
  Dropdown,
  Scrollbars,
  Button,
  PhosphorIcons,
  Text,
  Slider,
  RadioGroup,
  Card,
  Modal,
  Space,
  Switch,
} from "re-usable-design-components";
import ActiveResidenceSvg from "@/svgr/ActiveResidence";
import { checkRtl, cleanObject, resolveTernary } from "@/utils/helper";
import useResponsive from "@/hooks/useResponsive";
import NewResidentsByGender from "./widgets/NewResidentsByGender";
import NewResidentsByResidencyType from "./widgets/NewResidentsByResidencyType";
import NewResidentsByAge from "./widgets/NewResidentsByAge";
import NewResidentsByEmirates from "./widgets/NewResidentsByEmirates";
import NewResidentsByRegionAndNationaity from "./widgets/NewResidentsByRegionAndNationaity";

import NewResidentsByProfession from "./widgets/NewResidentsByProfession";
import NewResidentsBySponser from "./widgets/NewResidentsBySponser";
import PageSectionsScrollWrap from "@/components/PageSectionsScrollWrap";
import _ from "lodash";
import AppliedFilters from "./widgets/components/AppliedFilters";

// import { Button, Modal, Select, Slider, Switch, Typography, Space } from 'antd/lib';


const { Funnel, CheckCircle, ArrowSquareOut, Info } = PhosphorIcons;
const { useToken } = theme;

function getLabel(data, value, isRtl) {
  if (Array.isArray(value)) {
    const names = (value || [])?.map(
      (val) => data?.find((v) => v?.value === val)?.[isRtl ? "ar" : "en"]
    );
    return (
      <Tooltip title={names?.length > 4 ? names?.join(", ") : null}>
        {`${names?.slice(0, 4)?.join(", ")} ${
          names?.length - 4 > 0 ? ", +" + (names?.length - 4) : ""
        }`}
      </Tooltip>
    );
  }
  return data?.find((v) => v?.value === value)?.[isRtl ? "ar" : "en"];
}

// Filter component for desktop view using Dropdown
const FilterComponent = ({
  isRtl,
  filters,
  setFilters,
  filterData,
  setApplyAt,
  intl,
  getResponsive,
}) => {
  const [isDropOpen, setIsDropOpen] = useState(false);
  const [tempFilters, setTempFilters] = useState(filters);
  const [isApplyDisabled, setIsApplyDisabled] = useState(false);

  // Sync tempFilters with filters when filters change
  useEffect(() => {
    if (!_.isEqual(filters, tempFilters)) {
      setTempFilters(filters);
    }
  }, [filters]);

  // Reset apply button state when tempFilters change
  useEffect(() => {
    if (isApplyDisabled) {
      setIsApplyDisabled(false);
    }
  }, [tempFilters]);

  // Check if apply button should be disabled (no changes in filters)
  const isFilterDisabled = _.isEqual(filters, tempFilters);

  // Apply button for filters
  const applyEle = (
    <Button
      disabled={isFilterDisabled || isApplyDisabled}
      type="primary"
      icon={<CheckCircle />}
      size="default"
      onClick={() => {
        setIsApplyDisabled(true);
        setTimeout(() => {
          setApplyAt(new Date().getTime()); // Trigger loading state
          setIsDropOpen(false);
          setFilters(tempFilters); // Apply temp filters
        }, 200);
      }}
    >
      {intl.formatMessage({ id: "Apply" })}
    </Button>
  );

  // Handle age range slider changes with custom formatting
  const handleSliderChange = (val) => {
    setTempFilters((v) => ({
      ...v,
      age_range: `${val?.[0] == 16 ? 18 : val?.[0]}-${
        val?.[1] === 65 ? 120 : resolveTernary(val?.[1] == 16, 18, val?.[1])
      }`,
    }));
  };

  // Filter elements
  const dashboardCategoryEle = (
    <Switch
      checked={tempFilters?.residenceCategory !== "WITHOUT_GCC"}
      onChange={(e) =>
        setTempFilters((v) => ({
          ...v,
          residenceCategory: e ? "WITH_GCC" : "WITHOUT_GCC",
        }))
      }
    />
  );

  const genderEle = (
    <RadioGroup
      value={tempFilters?.gender_code}
      onChange={(e) =>
        setTempFilters((v) => ({ ...v, gender_code: e?.target?.value }))
      }
      options={filterData?.genders?.map((v) => ({
        value: v?.value,
        label: isRtl ? v?.ar : v?.en,
      }))}
    />
  );

  const nationalityEle = (
    <Select
      placeholder={intl.formatMessage({ id: "Country" })}
      size="default"
      value={tempFilters?.nationality_code}
      allowClear
      mode="multiple"
      maxTagCount={4}
      showSearch
      style={{ minWidth: "148px", maxWidth: "100%" }}
      filterOption={(input, option) =>
        option?.label?.toLowerCase()?.includes(input?.toLowerCase())
      }
      onChange={(e) => setTempFilters((v) => ({ ...v, nationality_code: e }))}
      options={filterData?.nationalities?.map((v) => ({
        value: v?.value,
        label: isRtl ? v?.ar : v?.en,
      }))}
    />
  );

  const emirateEle = (
    <Select
      placeholder={intl.formatMessage({ id: "Emirate" })}
      size="default"
      mode="multiple"
      maxTagCount={4}
      popupMatchSelectWidth={true}
      style={{ minWidth: "148px", maxWidth: "100%" }}
      value={tempFilters?.emirate_code}
      allowClear
      showSearch
      filterOption={(input, option) =>
        option?.label?.toLowerCase()?.includes(input?.toLowerCase())
      }
      onChange={(e) => setTempFilters((v) => ({ ...v, emirate_code: e }))}
      options={filterData?.emiratesTypes?.map((v) => ({
        value: v?.value,
        label: isRtl ? v?.ar : v?.en,
      }))}
    />
  );

  const residencyEle = (
    <Select
      placeholder={intl.formatMessage({ id: "Residency Type" })}
      size="large"
      value={tempFilters?.resident_type_code}
      allowClear
      showSearch
      filterOption={(input, option) =>
        option?.label?.toLowerCase()?.includes(input?.toLowerCase())
      }
      popupMatchSelectWidth={false}
      style={{ minWidth: "148px", maxWidth: "100%" }}
      onChange={(e) => setTempFilters((v) => ({ ...v, resident_type_code: e }))}
      options={filterData?.residencyTypes?.map((v) => ({
        value: v?.value,
        label: isRtl ? v?.ar : v?.en,
      }))}
    />
  );

  const ageRangeEle = (
    <Slider
      range
      min={0}
      max={65}
      step={null}
      value={
        tempFilters?.age_range
          ? tempFilters.age_range.split("-").map(Number)
          : [0, 65]
      }
      onChange={handleSliderChange}
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
      tooltipVisible={false}
    />
  );

  // Dropdown content for desktop view
  const dropContent = (
    <Row style={{ maxWidth: "350px", minWidth: "350px" }}>
      <Col
        paddingBlock="var(--paddingPx)"
        style={{
          borderRadius: "8px",
          backgroundColor: "var(--colorBgElevated)",
          boxShadow: "var(--boxShadowSecondary)",
        }}
      >
        <Row gutter={[0, 8]}>
          <Col paddingInline="var(--paddingPx)">
            <Text strong>{intl.formatMessage({ id: "Filters" })}</Text>
          </Col>
          <Col>
            <Scrollbars style={{ height: "300px" }}>
              <Row gutter={[0, 16]}>
                {[
                  {
                    label: intl.formatMessage({ id: "Include GCC Residents" }),
                    comp: dashboardCategoryEle,
                  },
                  {
                    label: intl.formatMessage({ id: "Country" }),
                    comp: nationalityEle,
                  },
                  {
                    label: intl.formatMessage({ id: "Emirate" }),
                    comp: emirateEle,
                  },
                  {
                    label: intl.formatMessage({ id: "Residency Type" }),
                    comp: residencyEle,
                  },
                ].map((val) => (
                  <Col key={val.label} paddingInline="var(--paddingPx)">
                    <Row gutter={[0, 8]}>
                      <Col>
                        <Text>{val.label}</Text>
                      </Col>
                      <Col>{val.comp}</Col>
                    </Row>
                  </Col>
                ))}
                <Col paddingInline="var(--paddingPx)">
                  <Row gutter={[0, 8]}>
                    <Col>
                      <Text>{intl.formatMessage({ id: "Age Range" })}</Text>
                    </Col>
                    <Col>{ageRangeEle}</Col>
                  </Row>
                </Col>
                {!!filterData?.genders?.length && (
                  <Col paddingInline="var(--paddingPx)">
                    <Row gutter={[0, 8]}>
                      <Col>
                        <Text>{intl.formatMessage({ id: "Gender" })}</Text>
                      </Col>
                      <Col>{genderEle}</Col>
                    </Row>
                  </Col>
                )}
              </Row>
            </Scrollbars>
            <Row>
              <Col
                paddingInline="var(--paddingPx)"
                paddingBlock="var(--paddingPx) 0px"
              >
                <Row gutter={[12]}>
                  <Col flex="none">{applyEle}</Col>
                  <Col flex="none">
                    <Button
                      disabled={!cleanObject(filters)}
                      type="default"
                      size="default"
                      danger
                      onClick={() => {
                        setIsApplyDisabled(true);
                        setTimeout(() => {
                          setIsDropOpen(false);
                          setTempFilters({});
                          setFilters({});
                        }, 200);
                      }}
                    >
                      {intl.formatMessage({ id: "Reset" })}
                    </Button>
                  </Col>
                </Row>
              </Col>
            </Row>
          </Col>
        </Row>
      </Col>
    </Row>
  );

  return (
    <Col flex="none">
      <Row align="middle" gutter={12}>
        <Col flex="none">
          <Dropdown
            style={{ backgroundColor: "var(--colorBgContainer)" }}
            onOpenChange={setIsDropOpen}
            open={isDropOpen}
            dropdownRender={() => dropContent}
          >
            <Row>
              <Col>
                <Button size="default" type="default">
                  <Row align="middle" gutter={8}>
                    <Col flex="none">
                      <Text color="currentColor">
                        {intl.formatMessage({ id: "Filters" })}
                      </Text>
                    </Col>
                    <Col flex="none">
                      <Funnel color="currentColor" weight="bold" size={16} />
                    </Col>
                  </Row>
                </Button>
              </Col>
            </Row>
          </Dropdown>
        </Col>
      </Row>
    </Col>
  );
};

function NewDashboard({
  nationalitiesConfigValueObj,
  emiratesConfigValue,
  residencyTypeValues,
}) {
  const [filters, setFilters] = useState({});

  const [applyAt, setApplyAt] = useState(false);

  const getResponsive = useResponsive();
  const themeVariables = useToken();
  const [localeStore] = useContext(LocaleContext);
  const isRtl = checkRtl(localeStore);
  const intl = useIntl();

  useEffect(() => {
    console.log(
      "nationalconfigvalueobj_newDashboard_for_filter_nationalities ",
      nationalitiesConfigValueObj
    );
    console.log(
      "residencyTypeConfigValue_for_filter_newDashboard_filter_residencytype ",
      residencyTypeValues
    );
    console.log(
      "emiratesConfigValue_for_filter_newDashboard_filter_emirates ",
      emiratesConfigValue
    );
  }, [nationalitiesConfigValueObj, residencyTypeValues, emiratesConfigValue]);

  // Reset applyAt after triggering to show loading state briefly
  useEffect(() => {
    if (applyAt) {
      setTimeout(() => setApplyAt(null), 200);
    }
  }, [applyAt]);

  const filterData = {
    genders: [
      { value: "M", en: "Male", ar: "ذكر" },
      { value: "F", en: "Female", ar: "أنثى" },
    ],
    // nationalities: [
    //   { value: "UAE", label: "United Arab Emirates" },
    //   { value: "IND", label: "India" },
    //   { value: "PAK", label: "Pakistan" },
    // ],
    // emirates: [
    //   { value: "DXB", label: "Dubai" },
    //   { value: "AUH", label: "Abu Dhabi" },
    //   { value: "SHJ", label: "Sharjah" },
    // ],
    // residencyTypes: [
    //   { value: "PR", label: "Permanent Resident" },
    //   { value: "TR", label: "Temporary Resident" },
    // ],
  };

  // Check if there are applied filters to show
  const showAppliedFilters = !_.isEmpty(cleanObject(filters));

  const transformedResidentsType = useMemo(() => {
    if (residencyTypeValues?.data?.length) {
      return residencyTypeValues?.data?.map((val) => {
        return {
          value: val?.resident_type_code,
          en: val?.resident_type_en,
          ar: val?.resident_type_ar,
        };
      });
    }
    return [];
  }, [residencyTypeValues]);

  const transformedNationalities = useMemo(() => {
    if (Object?.keys(nationalitiesConfigValueObj)?.length) {
      return Object?.keys(nationalitiesConfigValueObj)?.map((key) => {
        const val = nationalitiesConfigValueObj[key];
        return {
          value: val?.country_alpha3,
          // label: val?.country_en, // ✅ Add this line
          // // If you want to keep `en` too, optionally add it
          en: val?.country_en,
          ar: val?.country_ar,
        };
      });
    }
    return [];
  }, [nationalitiesConfigValueObj]);

  const transformedEmirates = useMemo(() => {
    if (emiratesConfigValue?.data?.length) {
      return emiratesConfigValue?.data?.map((val) => {
        return {
          value: val?.emirate_code,
          en: val?.emirate_name_en,
          ar: val?.emirate_name_ar,
        };
      });
    }
    return [];
  }, [emiratesConfigValue]);

  filterData.nationalities = transformedNationalities;
  filterData.emiratesTypes = transformedEmirates;
  filterData.emiratesConfigValue = emiratesConfigValue?.data;
  filterData.residencyTypes = transformedResidentsType;

  const firstRow = () => (
    <Row
      gutter={[
        getResponsive({
          default: themeVariables?.token?.marginLG,
          desktop: themeVariables?.token?.marginSM,
        }),
        themeVariables?.token?.marginSM,
      ]}
    >
      <Col span={getResponsive({ default: 12, tablet: 24 })}>
        <NewResidentsByGender filters={filters} isRtl={isRtl} />
      </Col>
      <Col span={getResponsive({ default: 12, tablet: 24 })}>
        <NewResidentsByResidencyType filters={filters} isRtl={isRtl} />
      </Col>
    </Row>
  );

  const secondRow = () => (
    <Row
      gutter={[
        getResponsive({
          default: themeVariables?.token?.marginLG,
          desktop: themeVariables?.token?.marginSM,
        }),
        themeVariables?.token?.marginSM,
      ]}
    >
      <Col span={getResponsive({ default: 12, tablet: 24 })}>
        <NewResidentsByAge filters={filters} isRtl={isRtl} />
      </Col>
      <Col span={getResponsive({ default: 12, tablet: 24 })}>
        <NewResidentsByEmirates
          emiratesConfigValue={filterData?.emiratesConfigValue}
          filters={filters}
          isRtl={isRtl}
        />
      </Col>
    </Row>
  );

  const thirdRow = () => (
    <Row>
      <Col>
        <NewResidentsByRegionAndNationaity filter={filters} />
      </Col>
    </Row>
  );

  const fourthRow = () => (
    <Row
      gutter={[
        getResponsive({
          default: themeVariables?.token?.marginLG,
          desktop: themeVariables?.token?.marginSM,
        }),
        themeVariables?.token?.marginSM,
      ]}
    >
      <Col span={getResponsive({ default: 12, tablet: 12, midTablet: 24 })}>
        <NewResidentsByProfession isRtl={isRtl} filters={filters} />
      </Col>

      <Col span={getResponsive({ default: 12, tablet: 12, midTablet: 24 })}>
        <NewResidentsBySponser isRtl={isRtl} filters={filters} />
      </Col>
    </Row>
  );

  const allRows = [firstRow, secondRow, thirdRow, fourthRow];

  const scrollableElements = (
    <>
      {allRows.map((row) => (
        <Col>{row()}</Col>
      ))}
    </>
  );

  const titleEle = (
      <Row  gutter={8} align="middle">
        <Col flex="none" style={{ color: "var(--colorText)" }}>
          <ActiveResidenceSvg size={getResponsive({ default: 32, tablet: 24 })} />
        </Col>
        <Col flex="none">
          
          <Row
            wrap={false}
            align={window?.innerWidth < 420 ? "start" : "middle"}
            gutter={4}
          >
            <Col
              flex="none"
              style={{
                ...window?.innerWidth < 420 && {
                  width: "144px"
                }
              }}
            >
              <Title level={getResponsive({ default: 4, mobile: 5 })}>
                {intl?.formatMessage({ id: "Active Residents/ Expatriates" })}
              </Title>
            </Col>
            <Col
              flex="none"
              style={{
                ...window?.innerWidth < 420 && {
                  paddingTop: "4px"
                }
              }}
            >
              <Tooltip
                title={intl?.formatMessage({ id: "Active_Residence_Title_Tooltip" })}
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

  return (
    <Row>
      <Col>
        <Row gutter="0">
          <Col>
            <Row align="middle" justify="space-between">
              <Col flex="none">{titleEle}</Col>

              <FilterComponent
                isRtl={isRtl}
                filters={filters}
                setFilters={setFilters}
                filterData={filterData}
                setApplyAt={setApplyAt}
                intl={intl}
                getResponsive={getResponsive}
              />
            </Row>
          </Col>

          {showAppliedFilters && (
            <Col>
              <AppliedFilters
                data={[
                  ...(![undefined, null]?.includes(
                    cleanObject(filters)?.residenceCategory
                  )
                    ? [
                        {
                          label: intl.formatMessage({
                            id: "Include GCC Residents",
                          }),
                          value:
                            cleanObject(filters)?.residenceCategory ===
                            "WITHOUT_GCC"
                              ? intl.formatMessage({ id: "No" })
                              : intl.formatMessage({ id: "Yes" }),
                          key: "residenceCategory",
                          closable: true,
                        },
                      ]
                    : []),
                  ...(cleanObject(filters)?.nationality_code
                    ? [
                        {
                          label: intl.formatMessage({ id: "Country" }),
                          value: getLabel(
                            filterData?.nationalities,
                            cleanObject(filters)?.nationality_code,
                            isRtl
                          ),
                          key: "nationality_code",
                          closable: true,
                        },
                      ]
                    : []),
                  ...(cleanObject(filters)?.emirate_code
                    ? [
                        {
                          label: intl.formatMessage({ id: "Emirate" }),
                          value: getLabel(
                            filterData?.emiratesTypes,
                            cleanObject(filters)?.emirate_code,
                            isRtl
                          ),
                          key: "emirate_code",
                          closable: true,
                        },
                      ]
                    : []),
                  ...(cleanObject(filters)?.resident_type_code
                    ? [
                        {
                          label: intl.formatMessage({ id: "Residency Type" }),
                          value: getLabel(
                            filterData?.residencyTypes,
                            cleanObject(filters)?.resident_type_code,
                            isRtl
                          ),
                          key: "resident_type_code",
                          closable: true,
                        },
                      ]
                    : []),
                  ...(cleanObject(filters)?.age_range
                    ? [
                        {
                          label: intl.formatMessage({ id: "Age Range" }),
                          value: cleanObject(filters)
                            ?.age_range?.split("-")
                            ?.map((v, index) =>
                              index === 1 && v == 120 ? "60+" : v
                            )
                            ?.join("-"),
                          key: "age_range",
                          closable: true,
                        },
                      ]
                    : []),
                  ...(cleanObject(filters)?.gender_code
                    ? [
                        {
                          label: intl.formatMessage({ id: "Gender" }),
                          value: getLabel(
                            filterData?.genders,
                            cleanObject(filters)?.gender_code,
                            isRtl
                          ),
                          key: "gender_code",
                          closable: true,
                        },
                      ]
                    : []),
                ]}
                onTagCross={(value) => {
                  setFilters((f) => {
                    const newFilters = { ...f };
                    delete newFilters[value.key];
                    return newFilters;
                  });
                }}
                onClear={() => {
                  setApplyAt(new Date()?.getTime());
                  setFilters({});
                }}
              />
            </Col>
          )}
        </Row>
        {applyAt ? (
          <Card
            loading={!!applyAt}
            style={{
              height: "350px",
            }}
          />
        ) : (
          //    resolveternary (3 parameters -> condition , truthy, falsy)

          // get responsive will resolve to true only if user screen resolution is greater than tablet since its fallback never get (tablet:false) and alwasy resolve to default fallback

          (resolveTernary(
            getResponsive({ default: "true", tablet: "false" }) === "true"
          ),
          (
            <PageSectionsScrollWrap
              isRtl={false}
              getResponsive={getResponsive}
              themeVariables={themeVariables}
            >
              {scrollableElements}
            </PageSectionsScrollWrap>
          ),
          (
            <Row
              style={{
                marginTop: getResponsive({
                  default: themeVariables?.token?.marginLG,
                  desktop: themeVariables?.token?.marginSM,
                }),
              }}
              gutter={[
                0,
                getResponsive({
                  default: themeVariables?.token?.marginLG,
                  desktop: themeVariables?.token?.marginSM,
                }),
              ]}
            >
              {scrollableElements}
            </Row>
          ))
        )}
      </Col>
    </Row>
  );
}

export default NewDashboard;
