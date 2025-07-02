import PropTypes from "prop-types"
import React, { useContext } from "react";
import { Image } from "re-usable-design-components";
import { ThemeContext } from "@/globalContext/theme/themeProvider";
import { useRouter } from "next/router";
import getConfig from "next/config";

const { publicRuntimeConfig } = getConfig();
const { APP_LOGO, APP_LOGO_DARK } = publicRuntimeConfig;

const getLogoFromEnv = (_isDarkMode = false) => {
  if(APP_LOGO && !_isDarkMode) return APP_LOGO
  if(APP_LOGO_DARK && _isDarkMode) return APP_LOGO_DARK
  return false
}

function Logo({ width, height, isNavigationDisabled = false }) {
  const [store] = useContext(ThemeContext);
  const router = useRouter();
  return (
    <Image
      placeholder={false}
      style={{
        ...(!!width && { width }),
        ...(!!height && { height }),
        cursor: "pointer",
        ...(isNavigationDisabled && {
          pointerEvents: "none"
        })
      }}
      onClick={() => {
        if (!isNavigationDisabled) {
          router.push("/")
        }
      }}
      preview={false}
      src={getLogoFromEnv(store?.selectedTheme === 'dark') || (store?.selectedTheme === 'dark' ? "/icp-dark-logo.svg" : "/icp-light-logo.png")}
      alt="logo"
    />
  );
}

Logo.propTypes = {
  height: PropTypes.any,
  width: PropTypes.any,
  isNavigationDisabled: PropTypes.bool
}

export default Logo;
