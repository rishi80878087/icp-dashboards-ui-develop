import Passenger from '@/views/Passenger';
import Private from '@/routeGuards/PrivateRoute';
import Main from '@/layouts/Main';

const passenger = () => null;

passenger.View = Passenger;
passenger.RouteGuard = Private;
passenger.Layout = Main;
passenger.Name = "Passenger_Forecasting"

export default passenger;
