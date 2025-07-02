import Link from 'next/link'
import React from 'react'

import { useIntl } from "react-intl";

function NotFound() {
  const intl = useIntl();

  return (
    <div className="h-100 d-flex justify-content-center align-items-center fs-25 flex-column">
      <div className="not-found-text">{intl.formatMessage({ id: "notFoundError" })}</div>
      <div>
        <Link href="/"></Link>
      </div>
    </div>
  )
}

export default NotFound
