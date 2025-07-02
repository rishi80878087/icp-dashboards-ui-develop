/* eslint-disable react/display-name */
import localeProvider from './locale/localeProvider';
import themeProvider from "./theme/themeProvider";
import PropTypes from 'prop-types';

// Import other created Providers and add them here - 
const providers = [localeProvider, themeProvider];

const combineProviders = (components) => {
  return components.reduce(
    (AccumulatedComponents, CurrentComponent) => {
      const CombinedComponent = ({ children }) => {
        return (
          <AccumulatedComponents>
            <CurrentComponent>{children}</CurrentComponent>
          </AccumulatedComponents>
        );
      };

      // Define prop types for the combined component
      CombinedComponent.propTypes = {
        children: PropTypes.node.isRequired, // Validate that children are required
      };

      return CombinedComponent;
    },
    ({ children }) => <>{children}</>
  );
};

// Combining multiple providers to single provider - this will be wrapped around App.js
export default combineProviders(providers);
