import ActiveGeneral from '@/views/ActiveGeneral';
import Private from '@/routeGuards/PrivateRoute';
import Main from '@/layouts/Main';
import withPageLoadDelay from '@/hocs/withPageLoadDelay';

const PageWithDelayHOC = withPageLoadDelay(ActiveGeneral);

const activeGeneral = () => null;

activeGeneral.View = PageWithDelayHOC;
activeGeneral.RouteGuard = Private;
activeGeneral.Layout = Main;
activeGeneral.Name = "Active_General"

export default activeGeneral;
