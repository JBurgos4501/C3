import React from 'react';
import {
	Navigate,
	Route,
	BrowserRouter as Router,
	Routes,
	useLocation
} from 'react-router-dom';
import Home from './Home';
import Login from './auth/Login';
import Signup from './auth/Signup';
import './index.css';
import CFO from './routes/CFO';
import CapTable from './routes/CapTable';
import Updates from './routes/Updates';
import Navbar from './shared/components/Navigation/Navbar';

import UpdatePasswordPage from './auth/ResetPassword';
import ResetPasswordPage from './auth/forgot-password';
import SidebarKpi from './components/SidebarInversionista/SidebarKpi';
import CFOStartup from './routes/CFOStartup';
import CaptableStartup from './routes/CaptableStartup';
import CreateUpdates from './routes/CreateUpdates';
import InvestorList from './routes/Investors';
import Startups from './routes/Startups';
import { AuthContext } from './shared/context/auth-context';
import { useAuth } from './shared/hooks/auth-hook';

function App() {
	const { token, login, logout, userRole, expiration, userId } = useAuth();

	let routes;

	if (!token) {
		routes = (
			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/login" element={<Login />} />
				<Route path="/signup" element={<Signup />} />
				<Route path="/forgot-password" element={<ResetPasswordPage />} />
				<Route path="/reset-password" element={<UpdatePasswordPage />} />
				<Route path="*" element={<Navigate to="/" />} />
			</Routes>
		);
	} else {
		if (userRole === 'Startup') {
			routes = (
				<Routes>
					<Route path={`/cfo-Startup/${userId}`} element={<CFOStartup />} />
					<Route path="/create-updates" element={<CreateUpdates />} />
					<Route path={`/captable-startup`} element={<CaptableStartup />} />
					<Route path={'/investors-list'} element={<InvestorList />} />
					<Route path="*" element={<Navigate to={`/cfo-Startup/${userId}`} />} />
				</Routes>
			);
		} else {
			routes = (
				<Routes>
					<Route path="/cfo" element={<SidebarKpi />} />
					<Route path="/cfo/:startupId" element={<SidebarKpi />} />
					<Route path="/captable" element={<SidebarKpi />} />
					<Route path="/captable/:startupId" exact element={<SidebarKpi />} />
					<Route path="/updates" element={<Updates />} />

				<Route path="*" element={<Navigate to="/cfo" />} />

				</Routes>
			);
		}
	}

	return (
		<AuthContext.Provider
			value={{
				isLoggedIn: !!token,
				token: token,
				userRole: userRole,
				expiration: expiration,
				login: login,
				logout: logout
			}}
		>
			<Router>
				<div className="m-0 p-0 box-border font-serif">
				<Navbar />
					<main>{routes}</main>
				</div>
			</Router>
		</AuthContext.Provider>
	);
}

export default App;
