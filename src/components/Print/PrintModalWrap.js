import {
  Modal, Spin, Button,
  Row, Col, Scrollbars,
} from "re-usable-design-components"
import PropTypes from "prop-types"
import { memo } from "react";
import { useIntl } from "react-intl";
import useResponsive from "@/hooks/useResponsive";

const MemoModal = memo(Modal)


function PrintModalWrap({
  children, isLoadingExport,
  isPreviewOpen, isCreatingPdf,
  setIsPreviewOpen, setIsLoadingExport,
  printDocument, printDocumentCanvas
}) {
  const intl = useIntl();
  const getResponsive = useResponsive();

  return (
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
                      children
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
  )
}

export default PrintModalWrap;

PrintModalWrap.propTypes = {
  children: PropTypes.any,
  isLoadingExport: PropTypes.any,
  isPreviewOpen: PropTypes.any,
  isCreatingPdf: PropTypes.any,
  setIsPreviewOpen: PropTypes.any,
  setIsLoadingExport: PropTypes.any,
  printDocument: PropTypes.any,
  printDocumentCanvas: PropTypes.any
}
