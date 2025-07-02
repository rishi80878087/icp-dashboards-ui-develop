import PropTypes from "prop-types"
import dynamic from "next/dynamic";
import { LocaleContext } from "@/globalContext/locale/localeProvider";
import { useContext } from "react";
import { checkRtl } from "@/utils/helper";
const DynamicMap = dynamic(
  () => import("@/components/Map"),
  { ssr: false }
);
  

function MapWrap({ values }) {
  const [localeStore] = useContext(LocaleContext);
  const isRtl = checkRtl(localeStore)
  return (
    <DynamicMap
      chart={{
        margin: [0, 0, 0, 0],
      }}
      values={values}
      tooltip={{
        useHTML: true, // Enable HTML in tooltip
        formatter: function () {
          return `
            <div style="font-family: var(--fontFamily); direction: ${isRtl ? "rtl" : "ltr"}">
            <div>`;
        },
        enabled: false,
        shadow: false,
        borderRadius: 6, // Add border radius here
        backgroundColor: '#000', // Change this to your desired background color
        style: {
          fontSize: '12px',
          lineHeight: '20px',
          color: '#FFF', // Optional: Change the text color
        },
      }}
    />
  )
}

MapWrap.propTypes = {
  values: PropTypes.any
}

export default MapWrap;