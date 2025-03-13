import { Box, CssBaseline } from '@mui/material';
import Sidebar from './sidebar';
import { useSidebar } from './sidebarContext';
import { Colors } from '../colors';

interface MainLayoutProps {
    children: React.ReactNode;
}

const MainLayout = ({ children }: any) => {
    const { isCollapsed } = useSidebar();

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <Sidebar />

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    marginLeft: isCollapsed ? '60px' : '200px',
                    transition: 'margin-left 0.3s ease',

                }}
            >
                {/* <Toolbar variant="dense"/> */}
                {/* <Header /> */}
                <Box sx={{ padding: '40px 48px 40px 32px', backgroundColor: Colors.backGound, minHeight:'100vh' }}>
                    {children}
                </Box>

            </Box>
        </Box>
    );
};

export default MainLayout;
