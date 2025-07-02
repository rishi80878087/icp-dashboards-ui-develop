import Passenger from '@/views/OriginsExplorer';
import Private from '@/routeGuards/PrivateRoute';
import Main from '@/layouts/Main';

const originsExplorer = () => null;

originsExplorer.View = Passenger;
originsExplorer.RouteGuard = Private;
originsExplorer.Layout = Main;
originsExplorer.Name = "Name_Prediction"

export default originsExplorer;
