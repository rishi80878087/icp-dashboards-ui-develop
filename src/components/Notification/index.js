import { useEffect } from 'react';
import { notification } from 're-usable-design-components';

let notify = null;

function Notification() {
  const [api, contextHolder] = notification.useNotification({
    stack: false
  });

  useEffect(() => {
    notify = api;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return contextHolder;
}

export function getNotify() {
  return notify;
}

export default Notification;
