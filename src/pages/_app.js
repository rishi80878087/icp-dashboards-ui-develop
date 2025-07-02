import PropTypes from "prop-types"
import React, { useContext, useEffect, useState } from 'react';
import { IntlProvider } from 'react-intl'
import getConfig from 'next/config'
import Head from 'next/head'
import App from 'next/app';
import dynamic from 'next/dynamic';
import { MatomoProvider, createInstance } from '@datapunt/matomo-tracker-react';
import "re-usable-design-components/dist/main.css";
import "@fontsource-variable/noto-kufi-arabic"; // Defaults to wght axis
import "@fontsource-variable/noto-kufi-arabic/wght.css"; // Specify axis
import { SessionProvider } from "next-auth/react";
import '../utils/router';
import '../networkInterceptor';
import 'dayjs/locale/ar';
import dayjs from 'dayjs';
import weekday from 'dayjs/plugin/weekday'; // Import the weekday plugin
import localeData from 'dayjs/plugin/localeData'; // Import the localeData plugin
import { ThemeProvider, enUS, arEG, ConfigProvider } from "re-usable-design-components";
import GlobalProvider from "./../globalContext";
const ReusableHighchartThemeProvider = dynamic(
  () => import("re-usable-highchart-components").then((mod) => mod.ThemeProvider),
  { ssr: false }
);
import '@/styles/globals.scss'
import { LocaleContext } from '@/globalContext/locale/localeProvider';
import themes from '@/themes';
import StorageService from  '../services/storageService';
import queryString from 'query-string';
import Notification from "@/components/Notification";
import useAsync from '@/hooks/useAsync';
import { setLocale as setGlobalLocale } from '@/globalContext/locale/localeActions';
import { ThemeContext } from "@/globalContext/theme/themeProvider";
import 'react-loading-skeleton/dist/skeleton.css'
import { getArabic, getEnglish } from '@/services/commonService';
import ScreenWarning from "@/components/ScreenWarning";


const { publicRuntimeConfig } = getConfig();
// Extend dayjs with the weekday plugin
dayjs.extend(weekday);
dayjs.extend(localeData);

const window = global;

const chartThemeColors = {
  chartBackgroundColor: 'transparent',
  xAxisGridLineColor: 'var(--colorBorderSecondary)',
  yAxisGridLineColor: 'var(--colorBorderSecondary)',
  axisLabelFontSize: 'var(--fontSizeSM)',
  axisLabelColor: 'var(--colorText)',
  axisLineColor: 'var(--colorSplit)',
  axisLabelFontFamily: "var(--fontFamily)"
}

const IntlWrapper = ({ children }) => {
  const [store, dispatch] = useContext(LocaleContext);
  const {
    value: en,
    status: enStatus,
  } = useAsync({
    asyncFunction: getEnglish,
    immediate: true,
  });

  const {
    value: ar,
    status: arStatus,
  } = useAsync({
    asyncFunction: getArabic,
    immediate: true,
  });

  useEffect(()=>{
    console.log("english ",en);
  },[en]);

  let projectTranslation;
  if (store) {
    projectTranslation = store?.projectTranslation;
  }
  const [locale, setLocale] = useState(projectTranslation?.language || 'en');
  const activeUrl = window.location;

  const getUrlLang = (_queryString, _url) => {
    const urlLang = _queryString.parse(_url?.search)?.lang;
    return urlLang !== 'ar' && urlLang !== 'en' ? undefined : urlLang;
  };

  useEffect(() => {
    const locallyStoredLanguage = StorageService.get('locale');
    dayjs.locale(locallyStoredLanguage || projectTranslation?.language || 'en');
    setLocale(locallyStoredLanguage || projectTranslation?.language || 'en');
  }, [projectTranslation]);

  useEffect(() => {
    const urlLang = getUrlLang(queryString, activeUrl);
    if(urlLang) {
      dispatch(setGlobalLocale(urlLang));
      StorageService.set('locale', urlLang);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeUrl]);
  
  if (['idle', 'pending']?.includes(enStatus) || ['idle', 'pending']?.includes(arStatus)) {
    return null
  }
  return (
    <IntlProvider messages={locale === "en" ? en : ar} locale={locale} defaultLocale="en">
      {children}
    </IntlProvider>
  );
};

IntlWrapper.propTypes = {
  children: PropTypes.any
}

const ThemeWrapper = ({ children }) => {
  const [store] = useContext(ThemeContext);
  const [localeStore] = useContext(LocaleContext)
  const activeTheme = { theme: store?.selectedTheme || 'base' };
  const _direction = localeStore?.projectTranslation === 'en' ? 'ltr' : 'rtl'

  if (window.document) {
    window.document.body.dir = _direction
  }

  const tokens = themes[activeTheme?.theme];
  
  if (_direction === "ltr") {
    tokens.seedTokens.fontFamily = "sf-pro-text";
  } else {
    tokens.seedTokens.fontFamily = "Noto Kufi Arabic Variable";
  }

  return (
    <ThemeProvider theme={tokens} activeTheme={activeTheme?.theme} direction={_direction}>
      <ReusableHighchartThemeProvider initialTheme={chartThemeColors}>
        <ConfigProvider locale={_direction === "ltr" ? enUS : arEG}>
          {children}
        </ConfigProvider>
      </ReusableHighchartThemeProvider>
    </ThemeProvider>
  );
}

ThemeWrapper.propTypes = {
  children: PropTypes.any
}


export default function MyApp({
  Component,
  FAVICON,
  BASE_URL, 
  MATOMO_SITE,
  MATOMO_ID,
  pageProps : { session, ...pageProps }
}) {
  const {
    View = React.Fragment, Layout = React.Fragment, RouteGuard = React.Fragment, Name: pageName,
  } = Component;

  if (typeof window === 'undefined') {
    return null;
  }
  const instance = createInstance({
    urlBase: MATOMO_SITE,
    siteId: MATOMO_ID,
    disabled: false, // optional, false by default. Makes all tracking calls no-ops if set to true.
    linkTracking: false, // optional, default value: true
    configurations: {
      disableCookies: true,
      setSecureCookie: true,
      setRequestMethod: 'POST'
    }
  })

  const basePath = `${BASE_URL}/api/auth`;
  const appEle = (
    <SessionProvider session={session} basePath={basePath}>
      <MatomoProvider value={instance}>
        <GlobalProvider>
          <IntlWrapper>
            <ScreenWarning />
            <ThemeWrapper>
              <Notification />
              <RouteGuard pageName={pageName}>
                <Layout pageName={pageName}>
                  <View {...pageProps} />
                </Layout>
              </RouteGuard>
            </ThemeWrapper>
          </IntlWrapper>
        </GlobalProvider>
      </MatomoProvider>
    </SessionProvider>
  )

  return (
    <>
      <Head>
        <link rel="shortcut icon" href={FAVICON} />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <title id="project-title">ICP</title>
      </Head>
      {appEle}
    </>
  )
}

MyApp.propTypes = {
  BASE_URL: PropTypes.any,
  Component: PropTypes.any,
  FAVICON: PropTypes.any,
  MATOMO_ID: PropTypes.any,
  MATOMO_SITE: PropTypes.any,
  pageProps: PropTypes.any
}

MyApp.getInitialProps = async (appContext) => {
  const appProps = await App.getInitialProps(appContext);
  const { FAVICON, BASE_URL, MATOMO_ID, MATOMO_SITE } = publicRuntimeConfig;

  // Merge with runtime environment variables
  return {
    ...appProps,
    FAVICON,
    BASE_URL,
    MATOMO_ID,
    MATOMO_SITE
  };
};
