import styled from "@emotion/styled";
import { grey, blue, pink } from "@mui/material/colors";
import { TextareaAutosize as BaseTextareaAutosize } from '@mui/base/TextareaAutosize';
import { Switch, alpha } from "@mui/material";
import { Colors } from "../../../../common/colors";


export const GreenSwitch = styled(Switch)(({ theme }:any) => ({
    '& .MuiSwitch-switchBase.Mui-checked': {
        color: Colors.tertiary[600],
        '&:hover': {
            backgroundColor: alpha(Colors.tertiary[600], theme?.palette.action.hoverOpacity),
        },
    },
    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
    },
}));