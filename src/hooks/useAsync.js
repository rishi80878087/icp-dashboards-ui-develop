import STATUS from '@/constants/apiStatus';
import { useState, useCallback, useEffect, useContext } from 'react';
import { getNotify } from '@/components/Notification';
import getErrorMessage from '@/utils/errorCodes';
import { checkRtl } from '@/utils/helper';
import { LocaleContext } from '@/globalContext/locale/localeProvider';


const useAsync = ({ asyncFunction, immediate = false, paramsToPassImmediate }) => {
  const [state, setState] = useState({
    status: STATUS?.idle, value: null, error: null
  })
  const [localeStore] = useContext(LocaleContext);
  const isRtl = checkRtl(localeStore)
  // The execute function wraps asyncFunction and
  // handles setting state for pending, value, and error.
  // useCallback ensures the below useEffect is not called
  // on every render, but only if asyncFunction changes.
  const execute = useCallback((params) => {
    setState({
      status: STATUS.pending, value: null, error: null
    })
    function resolveFunction(resolve, response) {
      setTimeout(() => {
        setState({
          status: STATUS.success, value: response, error: null
        })
        resolve(response)
      }, 100);
    }
    return asyncFunction(params)
      .then((response) => {
        return new Promise((resolve)=> {
          resolveFunction(resolve, response)
        })
      })
      .catch((error) => {
        setState((_state) => ({
          ..._state, status: STATUS.error, error
        }))
        const errorDetails = error?.response?.data?.details || {};
        const message = getErrorMessage({ isRtl, errorCode: errorDetails?.code, params: errorDetails?.params  })
        const notify = getNotify();
        if (notify?.error) {
          notify.error({
            message: isRtl ? 'خطأ' : 'Error',
            description: message,
          });
        }
        // toast.error(error?.response?.data?.validations && error?.response?.data?.validations[0] ? error?.response?.data?.validations[0]?.message : error?.response?.data?.error?.errorMessage || error?.response?.data?.error || 'Something went wrong')
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [asyncFunction, isRtl]);
  // Call execute if we want to fire it right away.
  // Otherwise execute can be called later, such as
  // in an onClick handler.
  useEffect(() => {
    if (immediate) {
      execute(paramsToPassImmediate);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [execute, immediate]);

  return { setState, execute, status: state?.status, value: state?.value, error: state?.error };
};

export default useAsync;