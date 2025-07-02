import ActiveResidence from '@/views/ActiveResidence';
import Private from '@/routeGuards/PrivateRoute';
import Main from '@/layouts/Main';
import withPageLoadDelay from '@/hocs/withPageLoadDelay';

const PageWithDelayHOC = withPageLoadDelay(ActiveResidence);


const originsExplorer = () => null;

originsExplorer.View = PageWithDelayHOC;
originsExplorer.RouteGuard = Private;
originsExplorer.Layout = Main;
originsExplorer.Name = "Active_Residence"

export default originsExplorer;
