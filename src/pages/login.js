import Login from '@/views/Login';
import Public from '@/routeGuards/PublicRoute';

const login = () => null;

login.View = Login;
login.RouteGuard = Public;

export default login;
