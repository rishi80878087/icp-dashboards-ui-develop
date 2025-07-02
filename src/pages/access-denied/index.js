import AccessDenied from '@/views/AccessDenied';
import Private from '@/routeGuards/PrivateRoute';
import Main from '@/layouts/Main';

const accessDenied = () => null;

accessDenied.View = AccessDenied;
accessDenied.RouteGuard = Private;
accessDenied.Layout = Main;

export default accessDenied;
