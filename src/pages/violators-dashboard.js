import BorderViolations from '@/views/BorderViolations';
import Private from '@/routeGuards/PrivateRoute';
import Main from '@/layouts/Main';
import withPageLoadDelay from '@/hocs/withPageLoadDelay';

const PageWithDelayHOC = withPageLoadDelay(BorderViolations);

const activeGeneral = () => null;

activeGeneral.View = PageWithDelayHOC;
activeGeneral.RouteGuard = Private;
activeGeneral.Layout = Main;
activeGeneral.Name = "Border_Violations"

export default activeGeneral;
 