import PropTypes from "prop-types"
import { Tabs, Row, Col, theme, Carousel, Button, PhosphorIcons, Skeleton } from "re-usable-design-components";
import { useRef, useState, useEffect, useContext } from "react";
import { LocaleContext } from "@/globalContext/locale/localeProvider";
import Arrow from "@/svgr/Arrow";
import useResponsive from "@/hooks/useResponsive";
import { checkRtl } from "@/utils/helper";


const { useToken } = theme;
const { CaretRight, CaretLeft } = PhosphorIcons;


function getOptionPaddingInline(isRtl, options, getResponsive, cardsToShow) {
  if (!isRtl) {
    return getResponsive({ desktop: "0px 12px", default: "0px 16px" })
  } else {
    if (cardsToShow >= options?.length) {
      return getResponsive({ desktop: "0px 12px", default: "0px 16px" })
    }
    return getResponsive({ desktop: "12px 0px", default: "16px 0px" });
  }
}


function CTabs({ optionsWrapperStyle, isPreview, isCustom, hideSelectedMarker, customCardWidth, tabStyle, activeKey, onChange, options, carouselButtonStyle = {}, customType, ...props }) {
  const [localeStore] = useContext(LocaleContext);
  const [currentSlide, setCurrentSlide] = useState(0)
  const carouselRef = useRef();
  const getResponsive = useResponsive();
  const themeVariables = useToken();
  const isRtl = checkRtl(localeStore);
  const slideRef = useRef();
  const [cardsToShow, setCardsToShow] = useState(getResponsive({ default: 7 }))
  const [isCarouselLoading, setIsCarouselLoading] = useState(true)

  useEffect(() => {
    if (isCustom && customType === "primary") {
      setIsCarouselLoading(true)
      const slideAreaWidth = slideRef?.current?.offsetWidth || 0;
      let _cards = 7
      if(slideAreaWidth){
        _cards = slideAreaWidth / getResponsive({ default: customCardWidth || 174, desktop: customCardWidth || 178, tablet: customCardWidth || 168 });
        setCardsToShow(_cards)
        setIsCarouselLoading(false)
        if (isRtl) {
          carouselRef?.current?.goTo();
          const num = options?.length - _cards;
          setTimeout(() => {
            carouselRef?.current?.goTo(num);
            setCurrentSlide(num);
          })
        }
      }  
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slideRef?.current?.offsetWidth, isCustom, customType, isRtl])

  if (isCustom && customType === "primary") {
    const _options = options;
    return (
      <Row
        ref={slideRef}
        className="customSliderWrap"
      >
        <Col
          style={{
            position: "relative",
          }}
        > 
          <div
            style={{
              borderBottom: "1px solid var(--colorSplit)",
              position: 'absolute',
              bottom: '12px',
              width: '100%',
              left: 0,
            }}
          />
          {
            ((cardsToShow < options?.length) && !isPreview) && (
              <Row style={carouselButtonStyle} gutter={4} align="middle">
                <Col flex="none">
                  <Button
                    type="default"
                    size="small"
                    disabled={isRtl ? (currentSlide + cardsToShow) >= (options?.length) : !currentSlide}
                    icon={isRtl ? <CaretRight />: <CaretLeft />}
                    onClick={() => {
                      if (isRtl) {
                        carouselRef?.current?.next();
                      } else {
                        carouselRef?.current?.prev();
                      }
                    }}
                  />
                </Col>
                <Col flex="none">
                  <Button
                    size="small"
                    type="default"
                    icon={isRtl ? <CaretLeft />: <CaretRight />}
                    disabled={isRtl ? !currentSlide : (currentSlide + cardsToShow) >= (options?.length)}
                    onClick={() => {
                      if (isRtl) {
                        carouselRef?.current?.prev();
                      } else {
                        carouselRef?.current?.next();
                      }
                    }}
                  />
                </Col>
              </Row>
            )
          }
          <div style={{ width: "100%", maxWidth: "100%", minWidth: "100%" }}>
            {
              isCarouselLoading
                ? <Skeleton paragraph={{ rows: 1 }} />
                : (
                  <Carousel
                    ref={carouselRef}
                    slidesToShow={cardsToShow}
                    infinite={false}
                    rtl={isRtl}
                    settings={{
                      rtl: isRtl
                    }}
                    className="tabCustomCarousel"
                    dots={false}
                    afterChange={(e) => {
                      setCurrentSlide(e);
                    }}
                  >
                    {
                      (_options)?.map((option, index) => {
                        return (
                          <Row
                            className="carousel-item"
                            key={option?.key}
                          >
                            <Col
                              paddingInline={getOptionPaddingInline(isRtl, options, getResponsive, cardsToShow)}
                              style={{
                                position: "relative",
                                paddingBottom: "12px",
                              }}
                            >
                              {
                                !hideSelectedMarker && option?.key === activeKey &&
                                <span
                                  style={{
                                    position: "absolute",
                                    ...isRtl  ?
                                      {
                                        right: "16px",
                                      }
                                      : {
                                        left: "16px",
                                      },
                                    bottom: "0px",
                                    zIndex: 1,
                                    color: "var(--colorPrimaryBase)"
                                  }}
                                >
                                  <Arrow />
                                </span>
                              }
                              <Row
                                style={{
                                  direction: isRtl ? "rtl" : "ltr",
                                }}
                              >
                                <Col
                                  style={{
                                    backgroundColor: option?.key === activeKey ? "var(--colorBgContainer)" : "var(--colorPrimaryBg)",
                                    borderRadius: "var(--borderRadiusPx) var(--borderRadiusPx) 0px 0px",
                                    border: option?.key === activeKey ? `1px solid ${themeVariables?.token?.Tabs?.colorPrimary}` : "1px solid var(--colorPrimaryBg)",
                                    borderBottomWidth: option?.key === activeKey ? `4px` : "0px",
                                    cursor: "pointer",
                                    ...!!option?.disabled && ({
                                      pointerEvents: "none",
                                      opacity: "0.7",
                                      cursor: "not-allowed"
                                    })
                                  }}
                                  onClick={() => {
                                    onChange(option?.key)
                                  }}
                                  paddingInline="var(--paddingSMPx)"
                                  paddingBlock={option?.key === activeKey ? option?.activePaddingBlock || "var(--paddingSMPx) var(--paddingXXSPx)" : option?.paddingBlock || "var(--paddingSMPx) var(--paddingXSPx)"}
                                >
                                  {option?.children}
                                </Col>
                              </Row>
                            </Col>
                          </Row>
                        )
                      })
                    }
                  </Carousel>
                )
            }
          </div>
        </Col>
      </Row>

    )
  } else if (customType === "secondary" && isCustom) {
    return (
      <Row style={optionsWrapperStyle || {}}>
        <Col>
          <Row
            gutter={[0, 8]}
          >
            {
              options?.map((option) => (
                <Col
                  key={option?.key}
                  style={{
                    backgroundColor: "var(--colorBgContainer)",
                    borderRadius: "var(--borderRadiusPx)",
                    border: option?.key === activeKey ? `1px solid ${themeVariables?.token?.Tabs?.colorPrimary}` : "1px solid var(--colorBorderSecondary)",
                    borderBottomWidth: option?.key === activeKey ? `4px` : "1px",
                    cursor: "pointer",
                    ...tabStyle,
                  }}
                  onClick={() => {
                    onChange(option?.key)
                  }}
                  paddingInline="var(--paddingSMPx)"
                  paddingBlock="var(--paddingSMPx)"
                >
                  {option?.children}
                </Col>
              ))
            }
          </Row>
        </Col>
      </Row>

    )
  }
  return (
    <Tabs activeKey={activeKey} onChange={onChange} options={options} {...props} />
  )
}

CTabs.propTypes = {
  activeKey: PropTypes.any,
  customCardWidth: PropTypes.any,
  carouselButtonStyle: PropTypes.object,
  customType: PropTypes.string,
  isCustom: PropTypes.any,
  onChange: PropTypes.func,
  options: PropTypes.any,
  tabStyle: PropTypes.any,
  hideSelectedMarker: PropTypes.any,
  isPreview: PropTypes.any,
  optionsWrapperStyle: PropTypes.any
}

export default CTabs;