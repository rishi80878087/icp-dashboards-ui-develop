import PropTypes from "prop-types"
import _ from 'lodash';
import { useMemo, useContext } from 'react';
import { LocaleContext } from '@/globalContext/locale/localeProvider';
import useResponsive from '@/hooks/useResponsive';
import { useIntl } from 'react-intl';
import { Row, Col, Text, Table, Avatar, theme, Card, PhosphorIcons, Progress, Button, Title } from "re-usable-design-components"
import MapWrap from './MapWrap';
import CFlag from '@/components/Flag';
import { continentFlagMapping, formatNumber, checkRtl, resolveTernary } from '@/utils/helper';


const { useToken } = theme;
const { Globe, Flag, MapTrifold, GlobeHemisphereWest, MapPinLine, X } = PhosphorIcons;

const mapStyle = {
  allAreas: false,
  showInLegend: false,
  borderColor: 'transparent', // Or use 'none'
  borderWidth: 0,
  states: {
    hover: {
      enabled: false // Disable hover state
    }
  }
}

const FormatTitle = (v) => <Title level={4}>{`${formatNumber(v)}%`}</Title>

const FormatTitleComp = ({ v }) => <Title level={4}>{`${formatNumber(v)}%`}</Title>

FormatTitleComp.propTypes = {
  v: PropTypes.any
}

function getTitle(val) {
  return function Comp() {
    return <FormatTitleComp v={val} />
  }
}

function SearchResult({ predictionsValues, geoJson, onReset = () => { } }) {
  const themeVariables = useToken();
  const getResponsive = useResponsive();
  const { token } = themeVariables;
  const intl = useIntl();
  const [localeStore] = useContext(LocaleContext)
  const topPrediction = predictionsValues?.predictions?.[0];
  const alternativeCountry = predictionsValues?.predictions?.[1];
  const isRtl = checkRtl(localeStore);

  const country = geoJson?.find((v) => v?.properties?.["iso-a3"] === topPrediction?.alpha_3_code);
  const alternativeMapCountry = geoJson?.find((v) => v?.properties?.["iso-a3"] === alternativeCountry?.alpha_3_code);

  const continent = country?.properties?.continent;

  const continentsData = geoJson?.filter((v) => {
    return v?.properties?.continent === continent
  })

  const subregionData = useMemo(() => {
    return geoJson?.filter((v) => {
      return v?.properties?.subregion === country?.properties?.subregion
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geoJson]);

  const otherCountries = predictionsValues?.predictions?.slice(2);

  const countryColumns = [
    {
      title: <Row><Col paddingInline="var(--paddingXSPx)">{intl?.formatMessage({ id: "Country" })}</Col></Row>,
      render: (val) => (
        <Row>
          <Col
            paddingInline="var(--paddingXSPx)"
          >
            <Row
              align="middle"
              gutter={token?.marginXS}
              wrap={false}
            >
              <Col flex="none">
                <CFlag
                  countryCode={val?.alpha_2_code}
                />
              </Col>
              <Col flex="auto">
                <Text ellipses={{
                  tooltip: isRtl ? val?.country_name_ar : val?.country_name_en
                }}>{isRtl ? val?.country_name_ar : val?.country_name_en}</Text>
              </Col>
            </Row>
          </Col>
        </Row>
      )
    },
    {
      title: intl?.formatMessage({ id: "Probability" }),
      width: getResponsive({ default: "107px", tablet: "107px" }),
      render: (val) => [undefined, null]?.includes(val?.probability) ? "-" : `${formatNumber(val?.probability * 100)}%`
    },
  ]

  const regionColumns = [
    {
      title: <Row><Col paddingInline="var(--paddingXSPx)">{intl?.formatMessage({ id: "Region" })}</Col></Row>,
      render: (val) => (
        <Row>
          <Col
            paddingInline="var(--paddingXSPx)"
          >
            <Row
              align="middle"
              gutter={token?.marginXS}
              wrap={false}
            >
              <Col flex="none">
                <Avatar
                  src={continentFlagMapping?.[val?.region]}
                  size={34}
                />
              </Col>
              <Col flex="none">
                <Text>{intl?.formatMessage({ id: val?.region })}</Text>
              </Col>
            </Row>
          </Col>
        </Row>
      )
    },
    {
      title: intl?.formatMessage({ id: "Probability" }),
      width: getResponsive({ default: "107px", tablet: "107px" }),
      render: (val) => resolveTernary([undefined, null]?.includes(val?.probability), "-", `${formatNumber(val?.probability * 100)}%`)
    },
  ]

  otherCountries?.forEach(v => {
    const finded = geoJson?.find((val) => val?.properties?.["iso-a3"] === v?.alpha_3_code)
    if (finded) {
      v.region = finded?.properties?.continent
    }
  })

  const regions = _.groupBy(otherCountries, v => v?.region);

  const regionData = Object?.keys(regions)?.map((region) => {
    const val = regions[region];
    const sorted = val?.sort((a, b) => b?.probability - a?.probability)
    return ({
      region,
      ...sorted?.[0]
    })
  });
  return (
    <Row
      isFullHeight
      style={{
        paddingBottom: getResponsive({default: "var(--paddingLGPx)", tablet: '0px', desktop: "var(--paddingLGPx)" }),
      }}
    >
      <Col
        style={{
          background: "var(--colorBgContainer)",
          borderRadius: "var(--borderRadiusPx)"
        }}
        isFlex
        paddingInline="var(--paddingPx)"
        paddingBlock="var(--paddingPx)"
      >
        <Row gutter={[0, getResponsive({ default: token?.margin, tablet: token?.margin })]}>
          <Col>
            <Row wrap={false} gutter={16} align={getResponsive({ default: "middle", mobile: "flex-start" })} justify="space-between">
              <Col flex="auto">
                {
                  resolveTernary(
                    getResponsive({ default: "true", mobile: "true" }) === "true",
                    (
                      <Text strong>
                        {`${predictionsValues?.first_name} ${predictionsValues?.last_name} ${intl?.formatMessage({ id: "Originated From" })}`}
                      </Text>
                    ),
                    (
                      <Row>
                        <Col>
                          <Text strong>
                            {`${predictionsValues?.first_name} ${predictionsValues?.last_name}`}
                          </Text>
                        </Col>
                        <Col>
                          <Text strong>
                            {`${intl?.formatMessage({ id: "Originated From" })}`}
                          </Text>
                        </Col>
                      </Row>
                    )
                  )
                }
              </Col>
              {
                resolveTernary(
                  getResponsive({ mobile: "false", default: "true" }) !== "true",
                  (
                    <Col flex="none">
                      <Button
                        type="text"
                        size="default"
                        icon={<X size={16} />}
                        color="var(--colorError)"
                        onClick={onReset}
                      >
                        {intl?.formatMessage({ id: "Reset" })}
                      </Button>
                    </Col>
                  ),
                  (
                    <Col
                      style={{ cursor: "pointer" }}
                      flex="none"
                      onClick={onReset}
                    >
                      <Row align="middle" gutter={8}>
                        <Col flex="none">
                          <X
                            size={16}
                            color="var(--colorError)"
                          />
                        </Col>
                        <Col flex="none">
                          <Text
                            color="var(--colorError)"
                          >
                            {intl?.formatMessage({ id: "Reset" })}
                          </Text>
                        </Col>
                      </Row>
                    </Col>
                  )
                )
              }
            </Row>
          </Col>

          <Col>
            <Row
              wrap={getResponsive({ default: false, tablet: true })}
              align={getResponsive({ default: "stretch", tablet: "flex-start" })}
              gutter={[
                getResponsive({ default: token?.margin, tablet: "0px" }),
                getResponsive({ default: "0px", tablet: 16 })]
              }>
              <Col
                style={{ display: "flex" }}
                {
                  ...getResponsive({ default: "true", tablet: "false" }) === "true"
                    ? { flex: "0 0 33.3%" }
                    : { span: 24 }
                }

              >
                <Card
                  cardBodyPadding={"0px"}
                  cardBodyMinHeight={getResponsive({ default: "251px", mobile: "422px" })}
                  style={{
                    width: "100%"
                  }}
                >
                  <Row
                    isFullHeight
                  >
                    <Col
                      isFlex
                    >
                      <Row
                        style={{
                          backgroundColor: "var(--brand-gold-1)",
                          padding: "var(--paddingSMPx) var(--paddingPx)",
                          borderRadius: "6px 6px 0 0"
                        }}
                      >
                        <Col>
                          <Row gutter={token?.marginXS}>
                            <Col flex="none">
                              <Globe color={"var(--brand-gold-6)"} size={24} weight="duotone" />
                            </Col>
                            <Col flex="auto">
                              <Title level={5}>
                                {intl?.formatMessage({ id: "Region" })}
                              </Title>
                            </Col>
                          </Row>
                        </Col>
                      </Row>

                      <Row
                        isFlexGrow
                      >
                        <Col
                          paddingInline="var(--paddingPx)"
                          paddingBlock="var(--paddingLGPx)"
                        >
                          <Row
                            isFullHeight
                            gutter={getResponsive({ default: [token?.margin], mobile: [0, 40] })}
                            wrap={getResponsive({ default: false, mobile: true })}
                          >
                            <Col
                              {
                                ...getResponsive({ default: "true", mobile: "false" }) === "true"
                                  ? { flex: "0 0 50%" }
                                  : { span: 24 }
                              }
                            >
                              <Row gutter={[0, token?.marginLG]}>
                                <Col
                                  style={{
                                    height: "109px"
                                  }}
                                >
                                  <MapWrap
                                    values={[{
                                      data: continentsData?.map((v) => ({
                                        ...v,
                                        color: country?.properties?.["iso-a2"] === v?.properties?.["iso-a2"] ? 'var(--gold-5)' : 'var(--geek-blue-2)'
                                      })),
                                      ...mapStyle
                                    }]}
                                  />
                                </Col>
                                <Col
                                  textAlign="center"
                                >
                                  <Row>
                                    <Col>
                                      <Text color="var(--colorTextLabel">
                                        {intl?.formatMessage({ id: "Region:" })}
                                      </Text>
                                    </Col>
                                    <Col>
                                      <Text strong>{intl?.formatMessage({ id: country?.properties?.continent })}</Text>
                                    </Col>
                                  </Row>
                                </Col>
                              </Row>
                            </Col>
                            <Col
                              {
                                ...getResponsive({ default: "true", mobile: "false" }) === "true"
                                  ? { flex: "0 0 50%" }
                                  : { span: 24 }
                              }
                            >
                              <Row
                                gutter={[0, token?.marginLG]}
                              >
                                <Col
                                  style={{
                                    height: "109px"
                                  }}
                                >
                                  <MapWrap
                                    values={[{
                                      data: subregionData?.map((v) => {
                                        return ({
                                          ...v,
                                          color: country?.properties?.["iso-a2"] === v?.properties?.["iso-a2"] ? 'var(--gold-5)' : 'var(--geek-blue-2)'
                                        })
                                      }),
                                      ...mapStyle
                                    }]}
                                  />
                                </Col>
                                <Col
                                  textAlign="center"
                                >
                                  <Row>
                                    <Col>
                                      <Text color="var(--colorTextLabel">
                                        {intl?.formatMessage({ id: "Sub Region:" })}
                                      </Text>
                                    </Col>
                                    <Col>
                                      <Text strong>{intl?.formatMessage({ id: country?.properties?.subregion })}</Text>
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
                </Card>
              </Col>
              <Col
                style={{ display: "flex" }}
                {
                  ...getResponsive({ default: "true", tablet: "false" }) === "true"
                    ? { flex: "0 0 33.3%" }
                    : { span: 24 }
                }
              >
                <Card
                  cardBodyPadding={"0px"}
                  cardBodyMinHeight={getResponsive({ default: "251px", mobile: "422px" })}
                  style={{
                    width: "100%"
                  }}
                >
                  <Row
                    isFullHeight
                  >
                    <Col
                      isFlex
                    >
                      <Row
                        style={{
                          backgroundColor: "var(--brand-gold-1)",
                          padding: "var(--paddingSMPx) var(--paddingPx)",
                          borderRadius: "6px 6px 0 0"
                        }}
                      >
                        <Col>
                          <Row
                            gutter={token?.marginXS}
                          >
                            <Col flex="none">
                              <Flag color={"var(--brand-gold-6)"} size={24} weight="duotone" />
                            </Col>
                            <Col flex="auto">
                              <Title level={5}>
                                {intl?.formatMessage({ id: "Country" })}
                              </Title>
                            </Col>
                          </Row>
                        </Col>
                      </Row>

                      <Row
                        isFlexGrow
                      >
                        <Col
                          paddingInline="var(--paddingPx)"
                          paddingBlock="var(--paddingLGPx)"
                        >
                          <Row
                            isFullHeight
                            gutter={getResponsive({ default: [token?.margin], mobile: [0, 40] })}
                            wrap={getResponsive({ default: false, mobile: true })}
                          >
                            <Col
                              {
                                ...getResponsive({ default: "true", mobile: "false" }) === "true"
                                  ? { flex: "0 0 50%" }
                                  : { span: 24 }
                              }
                            >
                              <Row
                                gutter={[0, token?.marginLG]}
                              >
                                <Col
                                  style={{
                                    height: "109px"
                                  }}
                                >
                                  <MapWrap
                                    values={[{
                                      data: country ? [{ ...country, color: "var(--gold-5)" }] : [],
                                      ...mapStyle
                                    }]}
                                  />
                                </Col>

                                <Col
                                  textAlign="center"
                                >
                                  <Text strong>{isRtl ? topPrediction?.country_name_ar : topPrediction?.country_name_en}</Text>
                                </Col>
                              </Row>
                            </Col>
                            <Col
                              {
                                ...getResponsive({ default: "true", mobile: "false" }) === "true"
                                  ? { flex: "0 0 50%" }
                                  : { span: 24 }
                              }
                            >
                              <Row gutter={[0, token?.marginLG]}>
                                <Col
                                  style={{
                                    height: "109px",
                                    position: "relative"
                                  }}
                                  textAlign="center"
                                >
                                  <Progress
                                    type="dashboard"
                                    percent={topPrediction?.probability * 100}
                                    strokeLinecap="square"
                                    strokeColor="var(--blue-6)"
                                    strokeWidth={15}
                                    gapDegree={180}
                                    size={getResponsive({ default: ["160px", "80px"], desktop: ["140px", "60px"], tablet: ["160px", "80px"] })}
                                    format={FormatTitle}
                                  />
                                  <div style={{ position: "absolute", left: "0px", right: "0px", margin: "auto", bottom: "-8px", width: getResponsive({ default: "160px", desktop: "140px", tablet: "160px" }), display: "flex", justifyContent: "space-between" }}>
                                    <Text color="var(--colorTextLabel" size="sm">
                                      {intl?.formatMessage({ id: "Low" })}
                                    </Text>

                                    <Text color="var(--colorTextLabel" size="sm">
                                      {intl?.formatMessage({ id: "High" })}
                                    </Text>
                                  </div>
                                </Col>

                                <Col textAlign="center">
                                  <Text strong>
                                    {intl?.formatMessage({ id: "Probability" })}
                                  </Text>
                                </Col>
                              </Row>
                            </Col>
                          </Row>
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                </Card>
              </Col>
              <Col
                style={{ display: "flex" }}
                {
                  ...getResponsive({ default: "true", tablet: "false" }) === "true"
                    ? { flex: "0 0 33.3%" }
                    : { span: 24 }
                }
              >
                <Card
                  cardBodyPadding={"0px"}
                  cardBodyMinHeight={getResponsive({ default: "251px", mobile: "422px" })}
                  style={{
                    width: "100%"
                  }}
                >
                  <Row
                    isFullHeight
                  >
                    <Col
                      isFlex
                    >
                      <Row
                        style={{
                          backgroundColor: "var(--brand-gold-1)",
                          padding: "var(--paddingSMPx) var(--paddingPx)",
                          borderRadius: "6px 6px 0 0"
                        }}
                      >
                        <Col>
                          <Row
                            gutter={token?.marginXS}
                          >
                            <Col flex="none">
                              <MapTrifold color={"var(--brand-gold-6)"} size={24} weight="duotone" />
                            </Col>
                            <Col flex="auto">
                              <Title level={5}>
                                {intl?.formatMessage({ id: "Alternative Country" })}
                              </Title>
                            </Col>
                          </Row>
                        </Col>
                      </Row>

                      <Row
                        isFlexGrow
                      >
                        <Col
                          paddingInline="var(--paddingPx)"
                          paddingBlock="var(--paddingLGPx)"
                        >
                          <Row
                            isFullHeight
                            gutter={getResponsive({ default: [token?.margin], mobile: [0, 40] })}
                            wrap={getResponsive({ default: false, mobile: true })}
                          >
                            <Col
                              {
                                ...getResponsive({ default: "true", mobile: "false" }) === "true"
                                  ? { flex: "0 0 50%" }
                                  : { span: 24 }
                              }
                            >
                              <Row
                                gutter={[0, token?.marginLG]}
                              >
                                <Col
                                  style={{
                                    height: "109px"
                                  }}
                                >
                                  <MapWrap
                                    values={[{
                                      data: alternativeMapCountry ? [{ ...alternativeMapCountry, color: "var(--gold-5)" }] : [],
                                      ...mapStyle
                                    }]}
                                  />
                                </Col>

                                <Col
                                  textAlign="center"
                                >
                                  <Text strong>{isRtl ? alternativeCountry?.country_name_ar : alternativeCountry?.country_name_en}</Text>
                                </Col>
                              </Row>
                            </Col>
                            <Col
                              {
                                ...getResponsive({ default: "true", mobile: "false" }) === "true"
                                  ? { flex: "0 0 50%" }
                                  : { span: 24 }
                              }
                            >
                              <Row gutter={[0, token?.marginLG]}>
                                <Col
                                  style={{
                                    height: "109px",
                                    position: "relative"
                                  }}
                                  textAlign="center"
                                >
                                  <Progress
                                    type="dashboard"
                                    percent={(topPrediction?.probability * 100)}
                                    success={{
                                      percent: alternativeCountry?.probability * 100,
                                      strokeColor: "var(--blue-6)"
                                    }}
                                    strokeLinecap="square"
                                    strokeColor="transparent"
                                    strokeWidth={15}
                                    gapDegree={180}
                                    size={getResponsive({ default: ["160px", "80px"], desktop: ["140px", "60px"], tablet: ["160px", "80px"] })}
                                    format={getTitle(alternativeCountry?.probability * 100)}
                                  />
                                  <div style={{ position: "absolute", left: "0px", right: "0px", margin: "auto", bottom: "-8px", width: getResponsive({ default: "160px", desktop: "140px", tablet: "160px" }), display: "flex", justifyContent: "space-between" }}>
                                    <Text color="var(--colorTextLabel" size="sm">
                                      {intl?.formatMessage({ id: "Low" })}
                                    </Text>

                                    <Text color="var(--colorTextLabel" size="sm">
                                      {intl?.formatMessage({ id: "High" })}
                                    </Text>
                                  </div>
                                </Col>

                                <Col textAlign="center">
                                  <Text strong>
                                    {intl?.formatMessage({ id: "Probability" })}
                                  </Text>
                                </Col>
                              </Row>
                            </Col>
                          </Row>
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                </Card>
              </Col>
            </Row>
          </Col>

          <Col>
            <Row align="middle" gutter={getResponsive({ default: token?.margin, midTablet: [0, token?.margin] })}>
              <Col
                {
                  ...getResponsive({ default: "true", midTablet: "false" }) === "true"
                    ? { flex: "0 0 50%" }
                    : { span: 24 }
                }
              >
                <Card
                  cardBodyPadding={"0px"}
                  cardBodyMinHeight="322px"
                >
                  <Row>
                    <Col>
                      <Row
                        style={{
                          backgroundColor: "var(--brand-gold-1)",
                          padding: "var(--paddingSMPx) var(--paddingPx)",
                          borderRadius: "6px 6px 0 0"
                        }}
                        isFlexGrow
                      >
                        <Col>
                          <Row
                            gutter={token?.marginXS}
                          >
                            <Col flex="none">
                              <GlobeHemisphereWest color={"var(--brand-gold-6)"} size={24} weight="duotone" />
                            </Col>
                            <Col flex="auto">
                              <Title level={5}>
                                {intl?.formatMessage({ id: "Other Top Countries Of Origin" })}
                              </Title>
                            </Col>
                          </Row>
                        </Col>
                      </Row>

                      <Row>
                        <Col>
                          <Table
                            tableRowHoverBg="colorBgContainer"
                            size="middle"
                            loading={false}
                            dataSource={otherCountries}
                            columns={countryColumns}
                            pagination={false}
                          />
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                </Card>
              </Col>
              <Col
                {
                  ...getResponsive({ default: "true", midTablet: "false" }) === "true"
                    ? { flex: "0 0 50%" }
                    : { span: 24 }
                }
              >
                <Card
                  cardBodyPadding={"0px"}
                  cardBodyHeight="322px"
                >
                  <Row>
                    <Col>
                      <Row
                        style={{
                          backgroundColor: "var(--brand-gold-1)",
                          padding: "var(--paddingSMPx) var(--paddingPx)",
                          borderRadius: "6px 6px 0 0"
                        }}
                        isFlexGrow
                      >
                        <Col>
                          <Row
                            gutter={token?.marginXS}
                          >
                            <Col flex="none">
                              <MapPinLine color={"var(--brand-gold-6)"} size={24} weight="duotone" />
                            </Col>
                            <Col flex="auto">
                              <Title level={5}>
                                {intl?.formatMessage({ id: "Other Top Region Of Origin" })}
                              </Title>
                            </Col>
                          </Row>
                        </Col>
                      </Row>

                      <Row>
                        <Col>
                          <Table
                            size="middle"
                            tableRowHoverBg="colorBgContainer"
                            loading={false}
                            dataSource={regionData}
                            columns={regionColumns}
                            pagination={false}
                          />
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                </Card>
              </Col>
            </Row>
          </Col>
        </Row>
      </Col>
      <Col>
      </Col>
    </Row>
  )
}

SearchResult.propTypes = {
  geoJson: PropTypes.any,
  onReset: PropTypes.func,
  predictionsValues: PropTypes.any
}

export default SearchResult;
