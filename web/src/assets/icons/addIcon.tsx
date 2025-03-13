interface Color {
    fill?: string; 
}

export const AddIcon: React.FC<Color> = ({ fill = '#158277' }) => { 
    return (
        <svg width="14" height="13" viewBox="0 0 14 13" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 1V5.5H12.5C13.0312 5.5 13.5 5.96875 13.5 6.5C13.5 7.0625 13.0312 7.5 12.5 7.5H8V12C8 12.5625 7.53125 13 7 13C6.4375 13 6 12.5625 6 12V7.5H1.5C0.9375 7.5 0.5 7.0625 0.5 6.5C0.5 5.96875 0.9375 5.5 1.5 5.5H6V1C6 0.46875 6.4375 0 7 0C7.53125 0 8 0.46875 8 1Z"
                fill={fill} />
        </svg>
    );
};