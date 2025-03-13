interface Color {
    fill?: string;
}

export const LockIcon: React.FC<Color> = ({ fill = 'black' }) => {
    return (

        <svg width="14" height="16" viewBox="0 0 14 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 6V4C3 1.8125 4.78125 0 7 0C9.1875 0 11 1.8125 11 4V6H12C13.0938 6 14 6.90625 14 8V14C14 15.125 13.0938 16 12 16H2C0.875 16 0 15.125 0 14V8C0 6.90625 0.875 6 2 6H3ZM4.5 6H9.5V4C9.5 2.625 8.375 1.5 7 1.5C5.59375 1.5 4.5 2.625 4.5 4V6ZM1.5 14C1.5 14.2812 1.71875 14.5 2 14.5H12C12.25 14.5 12.5 14.2812 12.5 14V8C12.5 7.75 12.25 7.5 12 7.5H2C1.71875 7.5 1.5 7.75 1.5 8V14Z" 
            fill={fill} />
        </svg>

    );
};