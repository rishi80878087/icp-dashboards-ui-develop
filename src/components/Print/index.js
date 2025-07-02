import React, { useState, useRef, useEffect, memo, useContext } from "react";
import html2canvas from "html2canvas";
import { toPng } from 'html-to-image';
import { isEqual } from "lodash";
import PropTypes from "prop-types";
import useResponsive from "@/hooks/useResponsive";
import Header from "../Header";
import jsPDF from "jspdf";
import { LocaleContext } from "@/globalContext/locale/localeProvider";
import { checkRtl } from "@/utils/helper";


export function usePrint(val = {}) {
  const { name = "Border-movement.pdf" } = val;
  const [isCreatingPdf, setIsCreatingPdf] = useState(false);

  const printDocumentCanvas = async () => {
    setIsCreatingPdf(true);

    const inputs = document.getElementsByClassName("export-pdf");
    const elementsArray = Array.from(inputs);

    const pdf = new jsPDF("p", "pt", "a4"); // Standard A4 size

    for (let i = 0; i < elementsArray.length; i++) {
      const input = elementsArray[i];

      // Render element to canvas
      const canvas = await html2canvas(input, {
        scrollY: -window.scrollY,
        useCORS: true,
      });

      const imgData = canvas.toDataURL("image/png");
      const imgWidth = pdf.internal.pageSize.getWidth();
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      if (i > 0) {
        pdf.addPage(); // Add a new page except for the first one
      }

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
    }

    pdf.save(name);
    setIsCreatingPdf(false);
  };
  const printDocument = async () => {
    setIsCreatingPdf(true);
  
    const inputs = document.getElementsByClassName("export-pdf");
    const elementsArray = Array.from(inputs);
  
    const pdf = new jsPDF("p", "pt", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
  
    for (let i = 0; i < elementsArray.length; i++) {
      const input = elementsArray[i];
  
      try {
        const dataUrl = await toPng(input, {
          cacheBust: true,
          backgroundColor: "#ffffff",
        });
  
        const img = new Image();
        img.src = dataUrl;
  
        await new Promise((resolve) => {
          img.onload = () => {
            const imgWidth = pageWidth;
            const imgHeight = (img.height * imgWidth) / img.width;
  
            if (i > 0) {
              pdf.addPage();
            }
  
            pdf.addImage(dataUrl, "PNG", 0, 0, imgWidth, imgHeight);
            resolve();
          };
        });
      } catch (error) {
        console.error("Failed to convert element to image:", error);
      }
    }
  
    pdf.save(name);
    setIsCreatingPdf(false);
  };
  return {
    isCreatingPdf,
    setIsCreatingPdf,
    printDocument,
    printDocumentCanvas
  }
}

const PaginateElements = ({ elements, onLoad = () => {} }) => {
  const [localeStore] = useContext(LocaleContext);
  const isRtl = checkRtl(localeStore);
  
  const pageHeight = 1754; // Height of each block/page
  const [pages, setPages] = useState([]);
  const getResponsive = useResponsive();
  const [current, setCurrent] = useState([]);
  const [processingIndex, setProcessingIndex] = useState(0)
  const hiddenContainerRef = useRef(null);
  const [tableElement, setTableElement] = useState(null);
  const [tableInProgressFlag, setTableInProgressFlag] = useState(false)

  useEffect(() => {
    let timeout = null
    if (processingIndex >= (elements?.length) && !tableInProgressFlag) {
      timeout = setTimeout(() => {
        onLoad();
      }, 1000)
      
    }
    return () => {
      if (timeout) {
        clearTimeout(timeout)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableInProgressFlag, processingIndex])

  function paginateElements() {
    const currentIndex = processingIndex;
    const elementToProcessed = elements[currentIndex];
    if (typeof elementToProcessed === "function") {
      const height = hiddenContainerRef?.current?.offsetHeight ? hiddenContainerRef.current.offsetHeight : 0;
      const space = (pageHeight - 88) - (height + 20);
      const element = elementToProcessed({
        space,
        offset: [true]?.includes(tableInProgressFlag) ? 0 : tableInProgressFlag,
        callback: ({ info }) => {
          if (info?.isNextPage) {
            setTableInProgressFlag(true);
            setPages((p) => ([...p, current?.slice(0, current?.length)]));
            setTableElement(null)
            setCurrent([])
          } else if (info?.printRows?.isAllRendered) {
            const elementToPrint = elementToProcessed({ rows: { ...info?.printRows }, isPrint: true })
            setTableInProgressFlag(false)
            setTableElement(null)
            setCurrent((c) => {
              return [...c, elementToPrint]
            })
          } else {
            setTableInProgressFlag(info?.printRows?.to);
            const elementToPrint = elementToProcessed({ rows: { ...info?.printRows, to: info?.printRows?.to }, isPrint: true })
            setTableElement(null);
            setCurrent((c) => {
              return [...c, elementToPrint]
            })
          }
        }
      })
      setTableElement(element);
    } else if (elementToProcessed) {
      setCurrent((c) => {
        return [...c, elementToProcessed]
      })
    }
  }

  useEffect(() => {
    if (elements) {
      paginateElements();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elements, processingIndex]);

  useEffect(() => {
    if (elements && (tableInProgressFlag && !current?.length)) {
      paginateElements();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current]);

  useEffect(() => {
    if (current?.length) {
      setTimeout(() => {
        if (hiddenContainerRef?.current?.offsetHeight) {
          const height = hiddenContainerRef.current.offsetHeight;
          if (height > (pageHeight - 88)) {
            setPages((p) => ([...p, current?.slice(0, current?.length - 1)]));
            setCurrent([current?.slice(current?.length - 1, current?.length)]);
          } else {
            if (tableInProgressFlag) {
              setPages((p) => ([...p, current?.slice(0, current?.length)]));
              setCurrent([]);
            }
            if (!tableInProgressFlag) {
              // all done
              if (processingIndex >= (elements?.length - 1)) {
                setPages((p) => ([...p, current]));
              }
              setProcessingIndex((i) => i + 1)
            }
          }
        }
      }, 1500)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current])

  return (
    <>
      <div
        style={
          getResponsive({ default: "false", tablet: "true" }) === "true"
            ? {
              maxWidth: "372px",
              margin: "auto",
              transform: "scale(0.3)",
              transformOrigin: isRtl ? "top right" : "top left",
              maxHeight: `${(pages?.length * 1754 * 0.3)}px`,
            }
            : {}
        }
      >
        {pages.map((page, pageIndex) => (
          <div
            key={`${pageIndex}_${pages?.length}`}
            className="export-pdf"
            style={{
              backgroundColor: "var(--colorBgLayout)",
              padding: "24px",
              paddingTop: "82px",
              position: "relative",
              minWidth: "1240px",
              maxWidth: "1240px",
              pointerEvents: "none",
              margin: "auto",
              marginBottom: '20px',
              height: `${pageHeight}px`
            }}
          >
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                margin: "auto",
                width: "100%",
                top: 0,
                // transform: `translateX(-${50 - (50 * ((window?.innerWidth - 100) / 1266))}%) scale(${(window?.innerWidth - 100) / 1266})`, /* Scale down to 80% */
                // transformOrigin: "top center",
              }}
            >
              <Header
                areActionsHidden
                isNavigationDisabled
              />
            </div>
            <div>
              {page.map((element, index) => (
                <div key={`${index}_${page?.length}`} style={{ marginBottom: '10px' }}>
                  {element}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div
        ref={hiddenContainerRef}
        style={{
          position: 'absolute',
          visibility: 'hidden',
          top: 0,
          left: 0,
          width: '100%',
          minWidth: "1240px",
          maxWidth: "1240px",
          height: 'auto',
          overflow: 'hidden',
          pointerEvents: 'none',
        }}
      >
        {current.map((c, cIndex) => {
          return (
            <div key={`${cIndex}_${c?.length}`} style={{ marginBottom: '10px' }}>
              {c}
            </div>
          )
        })}
      </div>
      <div
        style={{
          position: 'absolute',
          visibility: 'hidden',
          top: 0,
          left: 0,
          width: '100%',
          minWidth: "1240px",
          maxWidth: "1240px",
          height: 'auto',
          overflow: 'hidden',
          pointerEvents: 'none',
        }}
      >
        {tableElement}
      </div>
    </>
  );
};

PaginateElements.propTypes = {
  elements: PropTypes.any,
  onLoad: PropTypes.any
}


export function Print({ printElements, hiddenContainerRef, setIsLoading = () => {} }) {
  return (
    <PaginateElements onLoad={() => { setIsLoading(false) }} elements={printElements} hiddenContainerRef={hiddenContainerRef} />
  )
}

Print.propTypes = {
  printElements: PropTypes.any,
  hiddenContainerRef: PropTypes.any,
  setIsLoading: PropTypes.any
}

// Custom deep comparison function for React.memo
const arePropsEqual = (prevProps, nextProps) => {
  // Compare printElements (likely an array)
  if (!isEqual(prevProps.printElements, nextProps.printElements)) {
    return false;
  }

  // Compare hiddenContainerRef (React ref object)
  // Refs should be considered equal if they point to the same element
  if (prevProps.hiddenContainerRef !== nextProps.hiddenContainerRef) {
    return false;
  }

  // Compare setIsLoading (function)
  // Functions are compared by reference, so we assume it's stable
  // If it might change, you might want to skip this comparison
  return (prevProps.setIsLoading === nextProps.setIsLoading);
};

export default memo(Print, arePropsEqual);