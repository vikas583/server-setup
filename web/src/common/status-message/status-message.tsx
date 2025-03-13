import React from 'react';
import { Typography } from '@mui/material';
import { Colors } from '../colors';
import { PencilIcon } from '../../assets/icons/pencilIcon';
import { CircleRightIcon } from '../../assets/icons/circleRightIcon';
import { Settings2Icons } from '../../assets/icons/2SettingsIcon';
import { CircleInfoIcon } from '../../assets/icons/circleInfoIcon';
import { ShareFromSquare } from '../../assets/icons/shareFromSquare';
import { FilterIcon } from '../../assets/icons/filterIcon';
import { TriangleExclamationIcon } from '../../assets/icons/triangleExclamationIcon';
import { Archive } from '../../assets/icons/dashboardIcons';

const statusStyles: Record<string, { background: string; color: string; borderColor: string; fontWeight: number; icon: React.ReactNode; text: string }> = {
    "Not Started": {
        background: Colors.neutralGrey010,
        color: Colors.naturalGrey600,
        borderColor: Colors.neutralGrey500,
        fontWeight: 600,
        icon: <PencilIcon />,
        text: 'Not Started',
    },
    "Ready for Audit": {
        background: Colors.marsianGreen010,
        color: Colors.greenDark,
        borderColor: Colors.greenMid,
        fontWeight: 600,
        icon: <CircleRightIcon fill="#158277" />,
        text: 'Ready for Audit',
    },
    "Audit Generated": {
        background: Colors.greenLight,
        color: Colors.greenDark,
        borderColor: Colors.greenMid,
        fontWeight: 600,
        icon: <CircleRightIcon fill="#158277" />,
        text: 'Audit Generated',
    },
    "Processing": {
        background: Colors.venusOrange010,
        color: Colors.midOrange,
        borderColor: Colors.venusOrange600,
        fontWeight: 600,
        icon: <Settings2Icons fill={Colors.midOrange} />,
        text: 'Processing',
    },
    "Preparing for Audit": {
        background: Colors.neutralGrey010,
        color: Colors.naturalGrey600,
        borderColor: Colors.neutralGrey500,
        fontWeight: 600,
        icon: <Settings2Icons fill={Colors.naturalGrey600} />,
        text: 'Preparing for Audit',
    },
    'Error': {
        background: Colors.CosmicRed10,
        color: Colors.cosmicRed700,
        borderColor: Colors.CosmicRed600,
        fontWeight: 600,
        icon: <CircleInfoIcon fill={Colors.cosmicRed700} />,
        text: 'Unavailable',
    },
    'Reduced Scope': {
        background: Colors.CosmicRed10,
        color: Colors.cosmicRed700,
        borderColor: Colors.CosmicRed600,
        fontWeight: 600,
        icon: <CircleInfoIcon fill={Colors.cosmicRed700} />,
        text: 'Reduced Scope',
    },
    'Archived': {
        background: Colors.CosmicRed10,
        color: Colors.cosmicRed700,
        borderColor: Colors.CosmicRed600,
        fontWeight: 600,
        icon: <Archive fill={Colors.cosmicRed700} />,
        text: 'Archived',
    },
    'Queued': {
        background: Colors.neutralGrey010,
        color: Colors.naturalGrey600,
        borderColor: Colors.neutralGrey500,
        fontWeight: 600,
        icon: <TriangleExclamationIcon fill={Colors.naturalGrey600} />,
        text: 'Queued',
    },
};

interface StatusTypographyProps {
    status: string;
    width?: string | '60%'
}

const StatusTypography: React.FC<StatusTypographyProps> = ({ status, width = '60%' }) => {
    const style = statusStyles[status] || {
        background: 'transparent',
        color: '#000',
        borderColor: '#ccc',
        fontWeight: 600,
        icon: null,
        text: status,
        minWidth: width,
        fontFamily: 'Titillium Web, sans- serif'
    };

    return (
        <Typography
            sx={{
                background: style.background,
                color: style.color,
                borderColor: style.borderColor,
                fontWeight: style.fontWeight,
                // minWidth: '55%',
                // width:width,
                fontSize:'14px',
                fontFamily: 'Titillium Web, sans- serif'
            
            }}
            className="px-2 rounded-lg border inline-flex items-center"
        >
            <span>{style.icon}</span>
            <span className="ms-2 font-semibold">{style.text}</span>
        </Typography>
    );
};
export default StatusTypography