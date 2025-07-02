import PropTypes from "prop-types"
import { useContext, memo, useState, useCallback, useMemo, useEffect } from "react";
import _ from "lodash";
import {
  Row,
  Col,
  Title,
  theme,
  PhosphorIcons,
  Select,
  Dropdown,
  Text,
  Button,
  Drawer
} from "re-usable-design-components";
import useResponsive from "@/hooks/useResponsive";
import { useIntl } from "react-intl";
import ExpatsResidenceIcon from "@/svgr/ExpatsResidenceIcon";
import { getGenderOptions } from "@/views/ExpatsResidence/utils/helper";
import { getEmirateData, checkRtl } from "@/utils/helper";
import { LocaleContext } from "@/globalContext/locale/localeProvider";
import Segmented from "@/components/Segmented";


const { useToken } = theme;
const { Funnel, CheckSquareOffset } = PhosphorIcons;

function SegmentedWrap({ value, onChange, ...props }) {
  const [filterVal, setFilterVal] = useState("all");

  useEffect(() => {
    if (!_.isEqual(value, filterVal)) {
      setFilterVal(value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <Segmented
      value={filterVal}
      onChange={(val) => {
        setFilterVal(val);
        setTimeout(() => {
          onChange(val);
        }, 400);
      }}
      {...props}
    />
  )
}

SegmentedWrap.propTypes = {
  onChange: PropTypes.func,
  value: PropTypes.any
}

const MemoisedSegmentedWrap = memo(SegmentedWrap, (prev, next) => {
  return _.isEqual(prev, next)
})

function getDropDownContent(dropContent) {
  return () => (
    dropContent
  )
}
function Header({
  setFilter: setPropFilter,
  filter: propFilter,
  emiratesConfigValue,
  nationalitiesConfigValue,
  showAppliedFilters,
  initialFilters,
  setApplyAt,
  isLoading
}) {
  const [filter, setFilter] = useState(propFilter);
  const [isDrawer, setIsDrawer] = useState(false)
  const [isDropOpen, setIsDropOpen] = useState(false)
  const intl = useIntl();
  const [isApplyDisabled, setIsApplyDisabled] = useState(false)
  const [localeStore] = useContext(LocaleContext);
  const isRtl = checkRtl(localeStore);
  const getResponsive = useResponsive();
  const themeVariables = useToken();

  useEffect(() => {
    if (isApplyDisabled) {
      setIsApplyDisabled(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter])

  useEffect(() => {
    if (!_.isEqual(filter, propFilter)) {
      setFilter(propFilter)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propFilter])

  const emirateMap = useMemo(() => {
    return getEmirateData(themeVariables, emiratesConfigValue, isRtl);
  }, [themeVariables, emiratesConfigValue, isRtl])

  const genderOptions = useMemo(() => {
    return getGenderOptions(intl, themeVariables, getResponsive({ default: "false", mobile: "true" }) === 'true');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getResponsive({ default: "false", mobile: "true" })])

  const emirateFilterEle = (
    <Select
      allowClear
      size="middle"
      disabled={isLoading}
      placeholder={getResponsive({ default: intl.formatMessage({ id: "Emirate" }), mobile: intl.formatMessage({ id: "Select" }) })}
      options={Object.keys(emirateMap)?.map((item) => {
        return {
          label: emirateMap[item]?.label,
          value: item,
        };
      })}
      value={filter?.emirate?.label}
      onChange={(value) => {
        setFilter({
          ...filter,
          emirate: emirateMap[value],
        });
      }}
      style={{
        width: getResponsive({ default: 150, tablet: "100%" }),
      }}
      showSearch
      filterOption={(input, option) => {
        return option?.label?.toLowerCase()?.includes(input?.toLowerCase());
      }}
    />
  );

  const nationalityOptions = useMemo(() => {
    if (!nationalitiesConfigValue?.length) {
      return []
    }
    return nationalitiesConfigValue?.map((item) => {
      return {
        label: isRtl ? item?.country_ar : item?.country_en,
        value: item?.country_alpha3,
        ...item,
      };
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nationalitiesConfigValue])

  const nationalityFilterEle = (
    <Select
      allowClear
      size="middle"
      placeholder={getResponsive({ default: intl.formatMessage({ id: "Nationality" }), mobile: intl.formatMessage({ id: "Select" }) })}
      options={nationalityOptions}
      disabled={isLoading}
      value={filter?.nationality?.label}
      onChange={(_, value) => {
        setFilter({
          ...filter,
          nationality: value,
        });
      }}
      style={{
        width: getResponsive({ default: 150, tablet: "100%" }),
      }}
      showSearch
      filterOption={(input, option) => {
        return option?.label?.toLowerCase()?.includes(input?.toLowerCase());
      }}
    />
  );

  const isFilterDisabled = _.isEqual(filter, propFilter);

  const applyEle = (
    <Button
      disabled={isFilterDisabled || isApplyDisabled}
      type="primary"
      icon={<CheckSquareOffset />}
      size="default"
      onClick={(e) => {
        e?.stopPropagation();
        e.preventDefault();
        setIsApplyDisabled(true)
        setTimeout(() => {
          setApplyAt(new Date().getTime());
          setPropFilter(filter);
          setIsDropOpen(false)
          if (getResponsive({ mobile: "true" }) === "true") {
            setIsDrawer(false)
          }
        }, 200)
      }}
    >
      {intl?.formatMessage({ id: getResponsive({ default: "Apply All", tablet: "Apply" }) })}
    </Button>
  )

  const handleGenderChange = useCallback((value) => {
    const _selectedValue = genderOptions?.find(
      (item) => item?.value === value
    );
    setFilter((f) => ({
      ...f,
      gender: _selectedValue,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const dropContent = (
    <Row
      style={{
        maxWidth: getResponsive({ default: "325px", mobile: "100%" })
      }}
    >
      <Col
        paddingInline={getResponsive({ default: "var(--paddingPx)", mobile: "0px" })}
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
              <Col>
                <Text strong>
                  {intl?.formatMessage({ id: "Filters" })}
                </Text>
              </Col>
            )
          }
          <Col>
            <Row gutter={[0, 16]}>
              <Col>
                <MemoisedSegmentedWrap
                  options={genderOptions}
                  size="middle"
                  value={filter?.gender?.value}
                  disabled={isLoading}
                  onChange={handleGenderChange}
                  block={getResponsive({ default: false, mobile: true })}
                />
              </Col>
              <Col>
                <Row gutter={[0, 8]}>
                  <Col>
                    <Text>
                      {intl?.formatMessage({ id: "Emirate" })}
                    </Text>
                  </Col>
                  <Col>{emirateFilterEle}</Col>
                </Row>
              </Col>
              <Col>
                <Row gutter={[0, 8]}>
                  <Col>
                    <Text>
                      {intl?.formatMessage({ id: "Nationality" })}
                    </Text>
                  </Col>
                  <Col>{nationalityFilterEle}</Col>
                </Row>
              </Col>
              <Col>
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
                      onClick={(e) => {
                        e?.stopPropagation()
                        setTimeout(() => {
                          setIsDropOpen(false)
                          setFilter(initialFilters);
                          setPropFilter(initialFilters);
                          setIsDrawer(false)
                        });
                      }}
                    >
                      {intl?.formatMessage({ id: getResponsive({ default: "Reset" }) })}
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
    <Row
      justify="space-between"
      align="middle"
      wrap={false}
      gutter={getResponsive({
        default: [
          themeVariables?.token?.marginSM,
          themeVariables?.token?.marginSM,
        ]
      })}
    >
      <Col flex={getResponsive({ default: "auto" })}>
        <Row wrap={false} align="middle" gutter={themeVariables?.token?.marginXS}>
          <Col flex="none">
            <ExpatsResidenceIcon
              color={themeVariables?.token?.Typography?.colorText}
              size={getResponsive({
                default: themeVariables?.token?.iconSizeXXMD,
                tablet: themeVariables?.token?.iconSize,
              })}
            />
          </Col>
          <Col flex="none">
            <Title level={4}>
              {intl?.formatMessage({ id: "Expats Residency" })}
            </Title>
          </Col>
        </Row>
      </Col>
      <Col flex={getResponsive({ default: "none" })}>
        <Row
          align="middle"
          gutter={getResponsive({
            default: themeVariables?.token?.margin,
            desktop: themeVariables?.token?.marginSM,
          })}
        >
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
          {
            getResponsive({ default: "true", tablet: "false" }) === "true"
              ? (
                <>
                  <Col flex={getResponsive({ default: "none", mobile: "auto" })}>
                    <MemoisedSegmentedWrap
                      options={genderOptions}
                      size="middle"
                      disabled={isLoading}
                      value={filter?.gender?.value}
                      onChange={handleGenderChange}
                      block={getResponsive({ default: false, mobile: true })}
                    />
                  </Col>
                  <Col flex={getResponsive({ default: "none", mobile: "100%" })}>
                    <Row
                      gutter={getResponsive({
                        default: themeVariables?.token?.margin,
                        desktop: themeVariables?.token?.marginSM,
                      })}
                    >
                      <Col flex={getResponsive({ default: "none", mobile: "50%" })}>
                        {emirateFilterEle}
                      </Col>
                      <Col flex={getResponsive({ default: "none", mobile: "50%" })}>
                        {nationalityFilterEle}
                      </Col>
                      <Col flex={getResponsive({ default: "none" })}>
                        {applyEle}
                      </Col>
                    </Row>
                  </Col>
                </>
              )
              : (
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
                          dropdownRender={getDropDownContent(dropContent)}
                        >
                          <Row>
                            <Col>
                              <Button
                                size={"default"}
                                type="default"
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
                                    />
                                  </Col>
                                </Row>
                              </Button>
                            </Col>
                          </Row>
                        </Dropdown>
                      )
                  }
                </Col>
              )
          }
        </Row>
      </Col>
    </Row>
  );
}

Header.propTypes = {
  emiratesConfigValue: PropTypes.any,
  filter: PropTypes.any,
  initialFilters: PropTypes.any,
  nationalitiesConfigValue: PropTypes.any,
  setFilter: PropTypes.func,
  showAppliedFilters: PropTypes.any
}

export default Header;
