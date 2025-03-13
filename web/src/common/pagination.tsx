import { IconButton } from '@mui/material';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import LastPageIcon from '@mui/icons-material/LastPage';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import { useTheme } from '@mui/material/styles';
import { Colors } from './colors';
interface CustomPaginationActionsProps {
    count: number;                 // Total number of items
    page: number;                  // Current page
    rowsPerPage: number;           // Rows per page
    onPageChange: (event: React.MouseEvent<HTMLButtonElement>, newPage: number) => void;
    pageName?: string
}

export default function PaginationComponent({ count, page, rowsPerPage, onPageChange, pageName = 'dashboard' }: CustomPaginationActionsProps) {
    const theme = useTheme();
    const customColor = Colors.tertiary
    const disabledColor = '#15827766!important';
    let lastPage: number
    if (pageName === 'pdf') {
        lastPage = count
    } else {
        lastPage = Math.max(0, Math.ceil(count / rowsPerPage) - 1);
    }

    const handleFirstPageButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        if (pageName === 'pdf') {
            onPageChange(event, 1);
        } else {
            onPageChange(event, 0);
        }
    };

    const handleBackButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        onPageChange(event, page - 1);
    };

    const handleNextButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        onPageChange(event, page + 1);
    };

    const handleLastPageButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        onPageChange(event, lastPage);
    };
    return (
        <div style={{ flexShrink: 0, marginLeft: theme.spacing(2.5) }}>
            <IconButton
                onClick={handleFirstPageButtonClick}
                disabled={pageName === 'pdf' ? page === 1 : page === 0}
                aria-label="first page"
                sx={{
                    color: (pageName === 'pdf' ? page === 1 : page === 0) ? disabledColor : customColor,
                }}
            >
                <FirstPageIcon />
            </IconButton>
            <IconButton
                onClick={handleBackButtonClick}
                disabled={pageName === 'pdf' ? page === 1 : page === 0}
                aria-label="previous page"
                sx={{
                    color: (pageName === 'pdf' ? page === 1 : page === 0) ? disabledColor : customColor,
                }}
            >
                {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
            </IconButton>
            <IconButton
                onClick={handleNextButtonClick}
                disabled={page >= lastPage}
                aria-label="next page"
                sx={{
                    color: page >= lastPage ? disabledColor : customColor,
                }}
            >
                {theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
            </IconButton>
            <IconButton
                onClick={handleLastPageButtonClick}
                disabled={page >= lastPage}
                sx={{
                    color: page >= lastPage ? disabledColor : customColor,
                }}
                aria-label="last page"
            >
                <LastPageIcon />
            </IconButton>
        </div>
    );

};

