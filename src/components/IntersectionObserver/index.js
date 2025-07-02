import { useEffect, useState } from 'react';
import PropTypes from "prop-types"
import useResponsive from "@/hooks/useResponsive";


function IntersectionObserverComponent ({ children, offset = 250 }) {
  const [isInView, setIsInView] = useState(false);
  const getResponsive = useResponsive()
  const checkIfInView = (e) => {
    if (e?.target) {
      
      // Check if the element is in the viewport
      const isVisible = e?.target?.scrollTop > offset;
      setIsInView(isVisible);
    } else {
      setIsInView(true);
    }
  };

  useEffect(() => {
    checkIfInView(getResponsive({ default: { target: { scrollTop: offset + 1 } }, tablet: { target: { scrollTop: offset - 1 } } }))

    // Add scroll event listener
    const ele = document.getElementById("mainLayoutScroll");
    const scrollableDiv = ele?.firstChild;
    scrollableDiv.addEventListener('scroll', checkIfInView);

    // Cleanup function to remove the event listener
    return () => {
      scrollableDiv.removeEventListener('scroll', checkIfInView);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array to run once on mount

  if (isInView) {
    return (
      children
    );
  }

  return null;
};

IntersectionObserverComponent.propTypes = {
  children: PropTypes.any,
  offset: PropTypes.any,
}

export default IntersectionObserverComponent;