import PropTypes from "prop-types"
import { LocaleContext } from '@/globalContext/locale/localeProvider';
import useResponsive from '@/hooks/useResponsive';
import { useIntl } from 'react-intl';
import { useContext } from 'react';
import { Row, Col, Text, List, ListItem } from "re-usable-design-components"
import Flag from '@/components/Flag';
import { checkRtl, formatNumber } from '@/utils/helper';


function RecentSearch({ recentPredictionsValue }) {
  const intl = useIntl();
  const [localeStore] = useContext(LocaleContext);
  const isRtl = checkRtl(localeStore);
  const getResponsive = useResponsive();
  return (
    <Row
      style={{
        marginInline: getResponsive({ default: "32px", midTablet: "var(--paddingPx)" })
      }}
    >
      <Col>
        <Row align="middle" justify="space-between">
          <Col
            style={{
              background: "var(--colorBgContainer)",
              borderRadius: "var(--borderRadiusPx)"
            }}
            paddingInline={getResponsive({ default: "var(--paddingLGPx)", desktop: "var(--paddingPx)", mobile: "0px" })}
          >
            <List
              dataSource={recentPredictionsValue}
              renderItem={(item) => {
                return (
                  <ListItem
                    style={getResponsive({ default: { paddingBlock: "var(--paddingPx)" }, desktop: { paddingBlock: "var(--paddingSMPx)" }, mobile: { paddingInline: "var(--paddingPx)", paddingBlock: getResponsive({ default:  "var(--paddingPx)", mobile: "var(--paddingSMPx)" }) } })}
                  >
                    <Row
                      justify="space-between"
                      align={getResponsive({ default: "middle", mobile: "flex-start" })}
                      isFlexGrow
                      wrap={false}
                      gutter={16}
                    >
                      <Col flex="auto">
                        <Row wrap={false} gutter={16} align={getResponsive({ default: "middle", mobile: "middle" })}>
                          {
                            getResponsive({ default: "true", mobile: "false" }) === "true" &&
                            <Col flex="none">
                              <Flag
                                countryCode={item?.predictions?.[0]?.alpha_2_code}
                              />
                            </Col>
                          }

                          <Col flex="none">
                            <Text
                              color="var(--colorTextLabel)"
                            >
                              {
                                getResponsive({ default: "true", mobile: "false" }) === "true" && (
                                  <>
                                    {intl?.formatMessage({ id: "Profile Name:" })}
                                    &nbsp;
                                  </>
                                )
                              }
                              {
                                !!item?.first_name &&
                                <Text strong>{item?.first_name}&nbsp;</Text>
                              }
                              {
                                !!item?.last_name &&
                                <Text strong>{item?.last_name}</Text>
                              }
                            </Text>
                            {
                              getResponsive({ default: "true", mobile: "false" }) === "true" &&
                              <Text>
                                , <Text color="var(--colorTextLabel)">{intl?.formatMessage({ id: "Originated From:" })}</Text>
                                &nbsp;
                                <Text strong>{isRtl ? item?.predictions?.[0]?.country_name_ar : item?.predictions?.[0]?.country_name_en}</Text>
                              </Text>
                            }
                          </Col>
                        </Row>
                        
                        {
                          getResponsive({ default: "false", mobile: "true" }) === "true" &&
                          <Row
                            style={{
                              marginTop: "var(--marginXSPx)"
                            }}
                          >
                            <Col flex="none">
                              <Row wrap={false} gutter={8} align="flex-start">
                                <Col flex="none">
                                  <Flag
                                    countryCode={item?.predictions?.[0]?.alpha_2_code}
                                  />
                                </Col>

                                <Col flex="none">
                                  <Text size="sm">
                                    {intl?.formatMessage({ id: "Originated From:" })}
                                  </Text>
                                  <div>
                                    <Text size="sm" strong>{isRtl ? item?.predictions?.[0]?.country_name_ar : item?.predictions?.[0]?.country_name_en}</Text>
                                  </div>
                                </Col>
                              </Row>
                            </Col>
                          </Row>
                        }
                      </Col>

                      <Col style={{ display: "flex", justifyContent: "flex-end" }} flex={getResponsive({ default: "0 0 151px", mobile: "none" })}>
                        <Text>
                          {[undefined, null]?.includes(item?.predictions?.[0]?.probability) ? "-" : `${formatNumber(item?.predictions?.[0]?.probability * 100)}%`}
                        </Text>
                      </Col>
                    </Row>
                  </ListItem>
                )
              }}
            />
          </Col>
        </Row>
      </Col>
      <Col>
      </Col>
    </Row>
  )
}

RecentSearch.propTypes = {
  recentPredictionsValue: PropTypes.any
}

export default RecentSearch;
