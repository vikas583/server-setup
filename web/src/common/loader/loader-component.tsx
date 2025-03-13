import React from 'react';
import SyncLoader from "react-spinners/SyncLoader"
import Backdrop from '@mui/material/Backdrop';
import { useLoading } from './loader-context'; // Import the custom hook
import { Colors } from '../colors';

const GlobalSpinner: React.FC = () => {
    const { loading } = useLoading();

    return (
        <Backdrop
            sx={{
                color: '#fff',
                zIndex: (theme) => theme.zIndex.drawer + 1,
            }}
            open={loading}
        >
            <SyncLoader size={20} color={Colors.tertiary} />
        </Backdrop>
    );
};

export default GlobalSpinner;
