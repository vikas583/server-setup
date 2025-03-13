import * as React from 'react';
import { Route, Routes } from 'react-router-dom'
import { lazy, Suspense } from 'react';
import { SidebarProvider } from './common/sidebar/sidebarContext';
import MainLayout from './common/sidebar/mainLayout';
import Header from './common/header';
import AuthRouteGaurd from './gaurds/AuthRouteGaurd';
import TempTokenProtectedRoute from './gaurds/TempTokenProtectedRoute';
import { UserRoles } from './types';
import RoleBasedGuard from './gaurds/RoleBasedGuard';
import ContactInfo from './pages/login-pages/contact-info/contact-info';
import BillingInfo from './pages/login-pages/billing-info/billing-info';
import GetStarted from './pages/login-pages/get-started/get-started';
import RecoveryMethod from './pages/forget-password/recovery-method/recovery-method';
import ResendEmail from './pages/forget-password/resend-email/resend-email';
import NotFound from './components/page-not-found/notFound';

// const Home = lazy(() => import('./pages/home/home'));
const Login = lazy(() => import('./pages/login-pages/login-page/login'));
const Dashboard = lazy(() => import('./pages/protected-routes/dashboard-page/dashboard'));
const ProjectDetails = lazy(() => import('./pages/protected-routes/non-sidebar-pages/project-details/projectDetails'));
const ExtraProjectDetails = lazy(() => import('./pages/protected-routes/non-sidebar-pages/extra-project-details/extra-project-detials'));
const Projects = lazy(() => import('./pages/protected-routes/projects/projects'));
const AllFiles = lazy(() => import('./pages/protected-routes/all-files/allFiles'));
const Info = lazy(() => import('./pages/login-pages/loginInfo-page/loginInfoPage'));
const MFASetup = lazy(() => import('./pages/login-pages/mfa-setup/mfa-setup'));
const ResetPassword = lazy(() => import('./pages/forget-password/reset/reset-password'));
const ResetPasswordMFA = lazy(() => import('./pages/forget-password/mfa-screen/mfa-screen'));
const ResetPasswordSet = lazy(() => import('./pages/forget-password/new-password/setNew-password'));
const InitialSetNewPassword = lazy(() => import('./pages/login-pages/initial-set-new-password/initial-set-new-password'));
const AllsetPassword = lazy(() => import('./pages/forget-password/allset-password/allset-password'));
const MFAVerification = lazy(() => import('./pages/login-pages/mfa-verification/mfa-verification'));
const AllSet = lazy(() => import('./pages/login-pages/allset-page/allset-page'));
// const Step1 = lazy(() => import('./pages/protected-routes/non-sidebar-pages/project-creation/step-1/step1'));
const Stepper = lazy(() => import('./pages/protected-routes/non-sidebar-pages/project-creation/stepper/stepper'));
const Settings = lazy(() => import('./pages/protected-routes/settings/settings'));

const AuditDetails = lazy(() => import('./pages/protected-routes/non-sidebar-pages/audits-details/audits-detials'));
const PDF = lazy(() => import('./pages/protected-routes/audits/pdf-show/pdf'));
const ArchiveProjectList = lazy(() => import('./pages/protected-routes/archive-project/archive-project-list'));




export default class Routers extends React.Component {

    render() {
        const isAuthenticated = true; // Replace with your auth logic
        return (
            <Suspense fallback={<></>}>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/" element={<Login />} />

                    {/* <Route path="/" element={<TempTokenProtectedRoute />} > */}
                    <Route element={<TempTokenProtectedRoute />}>
                        <Route path="/initial-setup" element={<GetStarted />} />
                        <Route path="/billing-setup" element={<BillingInfo />} />
                        <Route path="/set-password" element={<InitialSetNewPassword />} />
                        <Route path="/mfa-setup" element={<MFASetup />} />
                        <Route path="/mfa-verification" element={<MFAVerification />} />
                    </Route>
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/recovery-method" element={<RecoveryMethod />} />
                    <Route path="/reset-password-mfa" element={<ResetPasswordMFA />} />
                    <Route path="/reset-password-set" element={<ResetPasswordSet />} />
                    <Route path="/allset" element={<AllsetPassword />} />
                    <Route path="/contact-info" element={<ContactInfo />} />
                    <Route path="/resend-email" element={<ResendEmail />} />

                    {/* </Route> */}
                </Routes>
                <SidebarProvider>
                    <Routes>
                        <Route element={<AuthRouteGaurd />} >

                            <Route path="/thankyou" element={<AllSet />} />
                            <Route path="/info" element={<Info />} />
                            <Route element={<RoleBasedGuard allowedRoles={[UserRoles.AccountOwner, UserRoles.ProjectOwner, UserRoles.Contributor]} />}>

                                <Route path='/dashboard' element={<MainLayout><Dashboard /></MainLayout>} />
                            </Route>
                            <Route path="/project/details/:id" element={<ProjectDetails />} />
                            <Route path="/project/create" element={<div><Header pageName='Project Setup' /><Stepper /></div>} />
                            <Route path="/extra-project-details" element={<div><Header pageName='Project Details' /><ExtraProjectDetails /></div>} />
                            <Route path="/projects" element={<MainLayout><Projects /></MainLayout>} />
                            <Route path="/allfiles" element={<MainLayout>< AllFiles /></MainLayout>} />
                            <Route path="/settings" element={<MainLayout>< Settings /></MainLayout>} />
                            <Route path="/archive" element={<MainLayout>< ArchiveProjectList /></MainLayout>} />
                            {/* <Route path="/audits-details/:id" element={<div><Header pageName='Project Details' /><AuditDetails /></div>} /> */}
                            <Route path="/audit-details/:id" element={<PDF />} />

                            {/* <Route path="*" element={<NotFound />} /> */}
                        </Route>

                        {/* Add more routes as needed */}
                    </Routes>
                </SidebarProvider>

            </Suspense>
        );
    }
}