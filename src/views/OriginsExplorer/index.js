import useAsync from "@/hooks/useAsync";
import { useEffect, useRef, useState, useContext } from "react";
import { Row, Col, Text, Title, theme, Input, Button, AntIcons, Skeleton, RadioGroup } from "re-usable-design-components"
import { getRecentPredictions, getNamePridictions } from "@/services/namePredictionService";
import RecentSearch from './widgets/RecentSearch';
import { ThemeContext } from "@/globalContext/theme/themeProvider";
import useResponsive from "@/hooks/useResponsive";
import SearchResult from "./widgets/SearchResult";
import { useIntl } from "react-intl";
import dynamic from "next/dynamic";
import Empty from "@/components/Empty"
import { resolveTernary } from "@/utils/helper";


const { useToken } = theme;
const { UngroupOutlined } = AntIcons;

const DynamicMap = dynamic(
  () => import("../../components/Map"),
  { ssr: false }
);

function validateInput(input) {
  const regex = /^(?! )[^\s]+(?: [^\s]+)* ?$/u; // Regex to match any characters with space conditions
  return regex.test(input) || !input;
}


const loadFunction = async () => {
  const { getWorldGeoJSON } = await import('../../components/Map');
  return getWorldGeoJSON;
};

function OriginsExplorer() {
  const [geoJson, setGeoJson] = useState([]);
  const intl = useIntl();
  const searchRef = useRef()
  const [themeStore] = useContext(ThemeContext);
  const getResponsive = useResponsive();
  const themeVariables = useToken();
  const token = themeVariables?.token;
  const {
    execute: invokeGetRecentPredictions,
    status: recentPredictionsStatus,
    value: recentPredictionsValue,
  } = useAsync({ asyncFunction: getRecentPredictions, immediate: true });
  const [searchBy, setSearchBy] = useState("full_name");
  const [searchValue, setSearchValue] = useState({});
  const {
    execute: invokeGetNamePrediction,
    setState: setSearchedPredictions,
    status: predictionsStatus,
    value: predictionsValues,
  } = useAsync({ asyncFunction: getNamePridictions });

  const isDarkMode = themeStore?.selectedTheme === 'dark';
  const getGeoJson = async () => {
    const myFunction = await loadFunction();
    const geoJson = myFunction(); // Call the dynamically imported function
    setGeoJson(geoJson?.features);
  };

  useEffect(() => {
    getGeoJson();
  }, [])

  const isLoading = recentPredictionsStatus === "pending" || recentPredictionsStatus === "idle" || predictionsStatus === "pending";

  const isSearchDisabled = searchBy === "full_name" ? !searchValue?.full_name?.trim(): (!searchValue?.first_name?.trim() || !searchValue?.last_name?.trim());
  async function handleSearch() {
    if (searchBy === "full_name") {
      if (searchRef?.current?.full_name !== searchValue?.full_name) {
        searchRef.current = { full_name: searchValue?.full_name }
        invokeGetNamePrediction({ data: { full_name: searchValue?.full_name } })
      }
    } else if ((searchRef?.current?.first_name !== searchValue?.first_name) || (searchRef?.current?.last_name !== searchValue?.last_name)) {
      searchRef.current = { first_name: searchValue?.first_name, last_name: searchValue?.last_name }
      invokeGetNamePrediction({ data: { first_name: searchValue?.first_name, last_name: searchValue?.last_name } })
    }
  }

  return (
    <Row
      isFullHeight
    >
      <Col
        isFlex
      >
        
        <Row
          style={{
            marginBottom: getResponsive({ default: "var(--paddingSMPx)" })
          }}
        >
          <Col>
            <Title
              level={getResponsive({ default: 4, mobile: 5 })}
            >
              {intl?.formatMessage({ id: "Name Origin Explorer" })}
            </Title>
          </Col>
        </Row>

        <Row>
          <Col
            paddingInline={getResponsive({ default: "32px", midTablet: "var(--paddingPx)" })}
            paddingBlock={getResponsive({ default: "32px", midTablet: "var(--paddingPx)" })}
            style={{
              borderRadius: "var(--borderRadiusLGPx)",
              background: getResponsive({ default: isDarkMode ? `url(/header_bg_dark.svg)` : `url(/header_bg_light.svg)`, mobile: isDarkMode ? `url(/header_bg_dark_mobile.svg)` : `url(/header_bg_light_mobile.svg)` }),
              backgroundSize: "cover",
              backgroundPosition: "bottom"
            }}
          >
            <Row
              gutter={[0, token?.margin]}
              style={{
                flexDirection: "column"
              }}
            >
              <Col style={{ maxWidth: getResponsive({ default: "100%", mobile: "250px" }), margin: "auto", paddingInline: getResponsive({ default: "0px", mobile: "16px" }) }} textAlign="center">
                <Title
                  level={getResponsive({ default: 1, mobile: 3 })}
                  style={{
                    color: "var(--colorTextLightSolid)"
                  }}
                >
                  {intl.formatMessage({ id: "Origin of Names Exploration" })}
                </Title>
              </Col>
              
              <Col
                textAlign="center"
                style={{ maxWidth: getResponsive({ default: "100%", mobile: "290px" }), margin: "auto" }}
              >
                <Text
                  color="var(--colorTextLightSolid)"
                >
                  {intl.formatMessage({ id: "Enter first name and last name to predict its origin of the country" })}
                </Text>
              </Col>

              <Col>
                <Row
                >
                  <Col
                    style={{
                      background: "var(--colorBgContainer)",
                      borderRadius: "var(--borderRadiusLGPx)",
                      // boxShadow: "0px 2px 4px 0px rgba(255, 255, 255, 0.25)"
                    }}
                    paddingInline={getResponsive({ default: "var(--paddingLGPx)", desktop: "var(--paddingPx)" })}
                    paddingBlock={getResponsive({ default: "var(--paddingLGPx)", desktop: "var(--paddingPx)" })}
                  >
                    <Row
                      gutter={[0, token?.marginXS]}
                    >
                      <Col>
                        <Row style={{ height: getResponsive({ default: "32px", mobile: "auto" })}} align="middle" gutter={[token?.margin]}>
                          <Col style={{ height: getResponsive({ default: "auto", mobile: "30px" }) }} flex={getResponsive({ default: "none", mobile: "100%" })}>
                            <Text>
                              {intl?.formatMessage({ id: "Predict By:" })}
                            </Text>
                          </Col>
                          <Col flex="none">
                            <RadioGroup
                              value={searchBy}
                              onChange={(e) => {
                                setSearchBy(e?.target?.value)
                                setSearchValue({});
                              }}
                              style={
                                getResponsive({
                                  default: {},
                                  mobile: { display: "flex", flexDirection: "column", rowGap: "var(--marginXSPx)" }
                                })
                              }
                              options={[
                                { value: "full_name", label: intl?.formatMessage({ id: "Full Name" }) },
                                { value: "first_last_name", label: intl?.formatMessage({ id: "First Name & Last Name" }) },
                              ]}
                            />
                          </Col>
                        </Row>
                      </Col>

                      <Col>
                        <Row wrap={getResponsive({ mobile: true, default: false })} align="middle" gutter={[token?.marginSM]}>
                          {
                            searchBy === "full_name"
                              ? (
                                <Col flex={getResponsive({ default: "auto", mobile: "100%" })}>
                                  <Input
                                    placeholder={intl?.formatMessage({ id: "Enter Full Name" })}
                                    size="default"
                                    maxLength={100}
                                    allowClear
                                    value={searchValue?.full_name || ""}
                                    onKeyUp={(e) => {
                                      if (e?.key === "Enter" && !isSearchDisabled) {
                                        handleSearch();
                                      }
                                    }}
                                    onChange={(e) => {
                                      if (validateInput(e?.target?.value)) {
                                        setSearchValue({ full_name: e?.target?.value })
                                      }
                                    }}
                                  />
                                </Col>
                              )
                              : (
                                <>
                                  <Col
                                    flex={getResponsive({ default: "auto", mobile: "100%" })}
                                    style={
                                      getResponsive({
                                        default: {},
                                        mobile: {
                                          marginBottom: "var(--marginXSPx)"
                                        }
                                      })
                                    }
                                  >
                                    <Input
                                      placeholder={intl?.formatMessage({ id: "First Name" })}
                                      size="default"
                                      value={searchValue?.first_name || ""}
                                      onKeyUp={(e) => {
                                        if (e?.key === "Enter" && !isSearchDisabled) {
                                          handleSearch();
                                        }
                                      }}
                                      allowClear
                                      maxLength={50}
                                      onChange={(e) => {
                                        if (validateInput(e?.target?.value)) {
                                          setSearchValue(v => ({
                                            ...v,
                                            first_name: e?.target?.value
                                          }))
                                        }
                                      }}
                                    />
                                  </Col>
                                  <Col
                                    flex={getResponsive({ default: "auto", mobile: "100%" })}
                                  >
                                    <Input
                                      size="default"
                                      placeholder={intl?.formatMessage({ id: "Last Name" })}
                                      value={searchValue?.last_name || ""}
                                      maxLength={50}
                                      onKeyUp={(e) => {
                                        if (e?.key === "Enter" && !isSearchDisabled) {
                                          handleSearch();
                                        }
                                      }}
                                      allowClear
                                      onChange={(e) => {
                                        if (validateInput(e?.target?.value)) {
                                          setSearchValue(v => ({
                                            ...v,
                                            last_name: e?.target?.value
                                          }))
                                        }
                                      }}
                                    />
                                  </Col>
                                </>
                              )
                          }
                          <Col
                            flex={getResponsive({ default: "none", mobile: "auto" })}
                            paddingBlock={getResponsive({ default: "0px", mobile: "var(--paddingSMPx) 0px" })}
                          >
                            <Button
                              icon={<UngroupOutlined />}
                              disabled={isSearchDisabled}
                              onClick={handleSearch}
                              loading={predictionsStatus === "pending"}
                              style={{
                                width: getResponsive({ default: "auto", mobile: "100%" })
                              }}
                            >
                              {intl?.formatMessage({ id: "Predict Origin" })}
                            </Button>
                          </Col>
                        </Row>
                      </Col>
                    </Row>
                  </Col>
                </Row>
              </Col>
            </Row>
          </Col>
        </Row>
        
        
        {
          (!isLoading && !!recentPredictionsValue?.length && !predictionsValues?.first_name) && (
            <Row
              style={{
                marginTop: 'var(--paddingSMPx)'
              }}
            >
              <Col
                paddingInline={getResponsive({ default: "32px", midTablet: "var(--paddingPx)" })}
              >
                <Row>
                  <Col>
                    <Row align="middle" justify="space-between">
                      <Col flex="none">
                        <Text strong>
                          {intl?.formatMessage({ id: "Recent Search" })}
                        </Text>
                      </Col>

                      <Col flex="none">
                        <Text strong>
                          {intl?.formatMessage({ id: "Probability" })}
                        </Text>
                      </Col>
                    </Row>
                  </Col>
                  <Col>
                  </Col>
                </Row>
              </Col>
            </Row>
          )
        }
        
        <Row
          style={{
            marginTop: getResponsive({ default: 'var(--paddingSMPx)', midTablet: 'var(--paddingPx)', mobile: predictionsValues?.predictions?.length ? 'var(--paddingLGPx)' : 'var(--paddingPx)' }),
          }}
          isFlexGrow
        >
          <Col>
            {
              isLoading ? (
                <Skeleton style={{ marginTop: "var(--paddingPx)" }} paragraph={{ rows: 8 }} />
              )
                : resolveTernary((recentPredictionsValue?.length || predictionsValues?.predictions?.length)
                  ,(
                    resolveTernary(
                      predictionsValues?.first_name
                      , (
                        <SearchResult
                          onReset={() => {
                            setSearchedPredictions(null)
                            invokeGetRecentPredictions();
                            setSearchValue({});
                          }}
                          geoJson={geoJson}
                          predictionsValues={predictionsValues}
                        />
                      )
                      ,<RecentSearch recentPredictionsValue={recentPredictionsValue} geoJson={geoJson} />
                    )
                  )
                  ,(
                    <Row
                      isFullHeight
                    >
                      <Col
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          borderRadius: "var(--borderRadiusPx)",
                          background: "var(--colorBgElevated)",
                        }}
                        paddingInline="var(--paddingPx)"
                        paddingBlock="var(--paddingPx)"
                      >
                        <Empty description={intl?.formatMessage({ id: "Search for a profile name above to see the details appear here" })} type="primary" />
                      </Col>
                    </Row>
                  )
                )
            }
          </Col>
        </Row>
      </Col>
    </Row>
  )
}

export default OriginsExplorer;