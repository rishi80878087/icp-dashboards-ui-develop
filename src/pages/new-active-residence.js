import NewActiveResidence from '@/views/NewActiveResidence';
import Private from '@/routeGuards/PrivateRoute';
import Main from '@/layouts/Main';
import withPageLoadDelay from '@/hocs/withPageLoadDelay';

const PageWithDelayHOC = withPageLoadDelay(NewActiveResidence);


const originsExplorer = () => null;

originsExplorer.View = PageWithDelayHOC;
originsExplorer.RouteGuard = Private;
originsExplorer.Layout = Main;
originsExplorer.Name = "New_Active_Residence"

export default originsExplorer;