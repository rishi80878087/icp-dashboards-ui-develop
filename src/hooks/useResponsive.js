import { useMemo } from "react";
import { theme } from "re-usable-design-components";

const { useToken } = theme;


export const checkMobile = ({ themeVariables = {} }) => {
  const { screenWidth, midTablet } = themeVariables.token;
  return screenWidth < midTablet;
};

export const checkMidTablet = ({ themeVariables }) => {
  const { screenWidth, tablet } = themeVariables.token;
  return screenWidth < tablet;
};

export const checkTablet = ({ themeVariables }) => {
  const { screenWidth, bigTablet } = themeVariables.token;
  return screenWidth < bigTablet;
};

export const checkBigTablet = ({ themeVariables }) => {
  const { screenWidth, smallDesktop } = themeVariables.token;
  return screenWidth < smallDesktop;
};


export const checkDesktop = ({ themeVariables }) => {
  const { screenWidth, largeDesktop } = themeVariables.token;
  return screenWidth < largeDesktop;
};

export const checkDeviceResolution = ({ themeVariables }) => {
  const isMobile = checkMobile({ themeVariables });
  const isMidTablet = checkMidTablet({ themeVariables });
  const isBigTablet = checkBigTablet({ themeVariables });
  const isTablet = checkTablet({ themeVariables });
  const isDesktop = checkDesktop({ themeVariables });

  return {
    isMobile: isMobile,
    isMidTablet: !isMobile && isMidTablet,
    isTablet: !isMobile && !isMidTablet && isTablet,
    isBigTablet: !isMobile && !isMidTablet && !isTablet && isBigTablet,
    isDesktop: !isMobile && !isMidTablet && !isTablet && !isBigTablet && isDesktop,
  };
};

export function getStyle(themeVariables) {
  const currenResolution = checkDeviceResolution({ themeVariables });
  return function styles(stylesMap) {
    if (currenResolution?.isMobile) {
      return stylesMap?.mobile || stylesMap?.midTablet || stylesMap?.tablet || stylesMap?.bigTablet || stylesMap?.desktop || stylesMap?.default;
    }
    if (currenResolution?.isMidTablet) {
      return stylesMap?.midTablet || stylesMap?.tablet || stylesMap?.bigTablet || stylesMap?.desktop || stylesMap?.default;
    }

    if (currenResolution?.isTablet) {
      return stylesMap?.tablet || stylesMap?.bigTablet || stylesMap?.desktop || stylesMap?.default;
    }

    if (currenResolution?.isBigTablet) {
      return stylesMap?.bigTablet || stylesMap?.desktop || stylesMap?.default;
    }

    if (currenResolution?.isDesktop) {
      return stylesMap?.desktop || stylesMap?.default;
    }
    return stylesMap?.default;
  };
}

const useResponsive = () => {
  const themeVariables = useToken();
  const getResponsiveStyles = useMemo(() => {
    return getStyle(themeVariables);
  }, [themeVariables]);

  return getResponsiveStyles;
};

export default useResponsive;
