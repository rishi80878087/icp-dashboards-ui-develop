import React, { useEffect, useState } from "react";
import { Spin, Row, Col } from "re-usable-design-components"


function withPageLoadDelay(Component) {
  return function HOC(props) {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      setTimeout(() => {
        setIsLoading(false)
      }, 200)
    }, [])

    if (isLoading) {
      return (
        <Row  isFullHeight>
          <Col style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
            <Spin />
          </Col>
        </Row>
      );
    }

    return <Component {...props} />
  }
}

export default withPageLoadDelay