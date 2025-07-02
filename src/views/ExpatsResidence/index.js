import PropTypes from "prop-types"
import { useState, useContext, useMemo, useEffect } from "react";
import {
  Row,
  Col,
  theme,
  Card,
} from "re-usable-design-components";
import { LocaleContext } from "@/globalContext/locale/localeProvider";
import IntersectionObserverComponent from "@/components/IntersectionObserver";
import useResponsive from "@/hooks/useResponsive";
import { useIntl } from "react-intl";
import { getGenderOptions } from "@/views/ExpatsResidence/utils/helper";
import AppliedFilters from "@/views/ExpatsResidence/widgets/AppliedFilters";
import Header from "@/views/ExpatsResidence/widgets/Header";
import Stats from "@/views/ExpatsResidence/widgets/Stats";
import ResidensByEmiratesWrapper from "@/views/ExpatsResidence/widgets/ResidensByEmiratesWrapper";
import NationalityByGender from "@/views/ExpatsResidence/widgets/NationalityByGender";
import PopulationByYear from "@/views/ExpatsResidence/widgets/PopulationByYear";
import ResidentsByRegionWrapper from "@/views/ExpatsResidence/widgets/ResidentsByRegionWrapper";
import PageSectionsScrollWrap from "@/components/PageSectionsScrollWrap";
import ExpatriateGlobe from "@/svgr/ExpatriateGlobe";
import { checkRtl } from "@/utils/helper";


const { useToken } = theme;


const getInitialFilters = (genderOptions) => ({
  gender: genderOptions?.[0],
  emirate: undefined,
  nationality: undefined,
});

function ExpatsResidence({ emiratesConfigValue, nationalitiesConfigValue, nationalitiesConfigValueObj }) {
  const intl = useIntl();
  const [applyAt, setApplyAt] = useState(true)
  const themeVariables = useToken();
  const genderOptions = getGenderOptions(intl, themeVariables);
  const initialFilters = getInitialFilters(genderOptions);
  const [localeStore] = useContext(LocaleContext)
  const getResponsive = useResponsive();
  const [isActiveResidenceLoading, setIsActiveResidenceLoading] = useState(true);

  const [filter, setFilter] = useState(initialFilters);
  
  const isAllGender = filter?.gender?.value === "all";
  const showAppliedFilters =
    !isAllGender || filter?.emirate?.label || filter?.nationality?.label;

  useEffect(() => {
    if (!!applyAt) {
      setTimeout(() => {
        setApplyAt(false)
      }, 200)
    }
  }, [applyAt])

  const isRtl = checkRtl(localeStore);

  const scrollableElements = (
    <>
      <Row>
        <Col>
          <ResidentsByRegionWrapper
            icon={<ExpatriateGlobe />}
            applyAt={applyAt}
            setIsActiveResidenceLoading={setIsActiveResidenceLoading}
            title={intl?.formatMessage({
              id: "Expatriate by Region & Country",
            })}
            filter={filter}
            nationalitiesConfigValueObj={nationalitiesConfigValueObj || {}}
          />
        </Col>
      </Row>
      <Row>
        <Col>
          <Stats filter={filter} />
        </Col>
      </Row>
      <IntersectionObserverComponent>
        <Row>
          <Col>
            <Row
              gutter={getResponsive({
                default: themeVariables?.token?.marginLG,
                desktop: themeVariables?.token?.marginSM,
                midTablet: [0, themeVariables?.token?.marginSM],
              })}
            >
              <Col span={getResponsive({ default: 12, midTablet: 24 })}>
                
                <NationalityByGender
                  filter={filter}
                  nationalitiesConfigValueObj={nationalitiesConfigValueObj || {}}
                />
                
              </Col>
              <Col span={getResponsive({ default: 12, midTablet: 24 })}>
                <ResidensByEmiratesWrapper
                  filter={filter}
                  emiratesConfigValue={emiratesConfigValue?.data || []}
                />
              </Col>
            </Row>
            <Row
              style={{
                marginTop: getResponsive({
                  default: themeVariables?.token?.marginLG,
                  desktop: themeVariables?.token?.marginSM,
                  midTablet: [0, themeVariables?.token?.marginSM],
                })
              }}
            >
              <Col>
                <PopulationByYear filter={filter} />
              </Col>
            </Row>
          </Col>
        </Row>
      </IntersectionObserverComponent>
    </>
  )

  const appliedFilterData = useMemo(() => {
    if (!showAppliedFilters) {
      return []
    }
    return [
      ...(!isAllGender
        ? [
          {
            label: intl?.formatMessage({ id: "Gender" }),
            value: filter?.gender?.label,
            key: "gender",
            closable: true,
          },
        ]
        : []),
      ...(filter?.emirate?.label
        ? [
          {
            label: intl?.formatMessage({ id: "Emirate City" }),
            value: filter?.emirate?.label,
            key: "emirate",
            closable: true,
          },
        ]
        : []),
      ...(filter?.nationality?.label
        ? [
          {
            label: intl?.formatMessage({ id: "Nationality" }),
            value: filter?.nationality?.label,
            key: "nationality",
            closable: true,
          },
        ]
        : []),
    ]
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAllGender, filter, showAppliedFilters])

  return (
    <Row isFullHeight>
      <Col isFlex gap={getResponsive({ default: themeVariables?.token?.marginLG, desktop: themeVariables?.token?.marginSM })}>
        <Row>
          <Col>
            <Header
              setFilter={setFilter}
              setApplyAt={setApplyAt}
              filter={filter}
              isLoading={isActiveResidenceLoading}
              showAppliedFilters={showAppliedFilters}
              emiratesConfigValue={emiratesConfigValue?.data || []}
              nationalitiesConfigValue={nationalitiesConfigValue?.data || []}
              initialFilters={initialFilters}
            />
          </Col>
        </Row>
        {showAppliedFilters && (
          <Row>
            <Col>
              <AppliedFilters
                data={appliedFilterData}
                onTagCross={(value) => {
                  if (value?.key === "gender") {
                    setFilter({
                      ...filter,
                      [value?.key]: genderOptions?.[0],
                    });
                  } else {
                    setFilter({
                      ...filter,
                      [value?.key]: undefined,
                    });
                  }
                }}
                onClear={() => {
                  setApplyAt(new Date()?.getTime())
                  setFilter(initialFilters);
                }}
              />
            </Col>
          </Row>
        )}

        {
          !!applyAt
            ? (
              <Card
                loading={!!applyAt}
                style={{
                  height: "350px"
                }}
              />
            )
            : getResponsive({ default: "true", tablet: "false" }) === "true"
              ? (
                <PageSectionsScrollWrap rowGutter={0} themeVariables={themeVariables} getResponsive={getResponsive} isRtl={isRtl}>
                  <Col isFlex gap={getResponsive({ default: themeVariables?.token?.marginLG, desktop: themeVariables?.token?.marginSM })}>
                    {scrollableElements}
                  </Col>
                </PageSectionsScrollWrap>
              )
              : (
                <>
                  {scrollableElements}
                </>
              )
        }
      </Col>
    </Row>
  );
}

ExpatsResidence.propTypes = {
  emiratesConfigValue: PropTypes.any,
  nationalitiesConfigValue: PropTypes.any,
  nationalitiesConfigValueObj: PropTypes.object
}

export default ExpatsResidence;
