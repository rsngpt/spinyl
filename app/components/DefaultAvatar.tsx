import React from 'react';

interface DefaultAvatarProps {
    className?: string;
    style?: React.CSSProperties;
    size?: number | string;
    fill?: string;
}

export default function DefaultAvatar({ className, style, size = '100%', fill = '#e3e3e3' }: DefaultAvatarProps) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 -960 960 960"
            width={size}
            height={size}
            fill={fill}
            className={className}
            style={{ display: 'block', ...style }}
        >
            <path d="M86-86v-788h261q21-37 56-58.5t77-21.5q42 0 77 21.5t56 58.5h261v788H86Zm421.5-706.5Q518-803 518-820t-10.5-27.5Q497-858 480-858t-27.5 10.5Q442-837 442-820t10.5 27.5Q463-782 480-782t27.5-10.5ZM585-463q43-43 43-105t-43-104.5Q542-715 480-715t-105 42.5Q332-630 332-568t43 105q43 43 105 43t105-43ZM212-212h536v-68q-54-48-119.5-73T480-378q-83 0-148.5 26T212-278v66Z" />
        </svg>
    );
}
