import Settings from '@/views/Settings';
import Private from '@/routeGuards/PrivateRoute';
import Main from '@/layouts/Main';

const settings = () => null;

settings.View = Settings;
settings.RouteGuard = Private;
settings.Layout = Main;
settings.Name = "Settings";

export default settings;
