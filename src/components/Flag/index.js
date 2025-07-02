import PropTypes from "prop-types"
import { Avatar } from "re-usable-design-components"
import Flags from 'country-flag-icons/react/1x1'

import useResponsive from "@/hooks/useResponsive";

function Empty () {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src="/All_Nationality.png" alt="alt_countries" />
}

export default function Flag({ countryCode, ...restProps }) {
  const getResponsive = useResponsive()
  const Comp = Flags[countryCode] ? Flags[countryCode] : Empty;

  return (
    <Avatar
      style={{
        border: "none",
        width: getResponsive({ default: "32px", mobile: "32px" }),
        height: getResponsive({ default: "32px", mobile: "32px" }),
      }}
      src={<Comp style={{ width: "100%", height: "100%" }} />}
      {...restProps}
    />
  );
}

Flag.propTypes = {
  countryCode: PropTypes.any
}
