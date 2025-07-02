import PropTypes from "prop-types"
import { Scrollbars, Row, Col } from "re-usable-design-components"
import React from "react";


function PageSectionsScrollWrap({ rowGutter, getResponsive, isRtl, children, themeVariables }) {
  const Component = Scrollbars;
  return (
    <Row
      isFlexGrow
      style={{
        marginTop: ![undefined]?.includes(rowGutter) ? rowGutter : getResponsive({ default: themeVariables?.token?.marginLG, desktop: themeVariables?.token?.marginSM })
      }}
    >
      <Col>
        <Component
          style={{
            width: "calc(100% + 12px)"
          }}
        >
          <Row
            style={{
              ...isRtl
                ? {
                  marginLeft: "12px"
                }
                : {
                  marginRight: "12px"
                }
            }}
          >
            
            <Col>
              <Row
                gutter={[0, ![undefined]?.includes(rowGutter) ? rowGutter : getResponsive({ default: themeVariables?.token?.marginLG, desktop: themeVariables?.token?.marginSM })]}
                style={{
                  paddingBottom: "var(--paddingLGPx)"
                }}
              >
                {children}
              </Row>
            </Col>
          </Row>
        </Component>
      </Col>
    </Row>
  );
}

PageSectionsScrollWrap.propTypes = {
  children: PropTypes.any,
  getResponsive: PropTypes.func,
  isRtl: PropTypes.any,
  rowGutter: PropTypes.any,
  themeVariables: PropTypes.any
}

export default PageSectionsScrollWrap;