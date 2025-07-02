import BorderMovements from '@/views/BorderMovements';
import Private from '@/routeGuards/PrivateRoute';
import Main from '@/layouts/Main';
import withPageLoadDelay from '@/hocs/withPageLoadDelay';

const PageWithDelayHOC = withPageLoadDelay(BorderMovements);

const activeGeneral = () => null;

activeGeneral.View = PageWithDelayHOC;
activeGeneral.RouteGuard = Private;
activeGeneral.Layout = Main;
activeGeneral.Name = "Border_Movements"

export default activeGeneral;
