/**
 * SVG icons
 *
 * @module src/components/lib/icon
 * @exports {Element} 
 * @author Darryl Cousins <cousinsd@proton.me>
 */
import { createElement, Fragment, Raw } from "@b9g/crank";

/**
 * Icon component - wraps svg paths
 *
 * @returns {Element} DOM component
 */
const Icon = ({ children, styleSize }) => {
  styleSize = styleSize ? styleSize : '1.2em';
  const size = 20;
  return (
    <svg
      width={`${size}px`}
      height={`${size}px`}
      class="dib"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${size + 3} ${size + 5}`}
      fillRule="evenodd"
      clipRule="evenodd"
      strokeLinejoin="round"
      strokeMiterlimit="1.414"
      style={`width: ${styleSize}; height: ${styleSize}; margin: 0; margin-top: 0.5em;`}
    >
      {children}
    </svg>
  );
};

/**
 * DarkModeIcon component, path borrowed from
 * {@link https://mui.com|Material Design}.
 *
 * @returns {Element} DOM component
 */
export const DarkModeIcon = () => (
  <Icon>
    <path d="M9.37 5.51c-.18.64-.27 1.31-.27 1.99 0 4.08 3.32 7.4 7.4 7.4.68 0 1.35-.09 1.99-.27C17.45 17.19 14.93 19 12 19c-3.86 0-7-3.14-7-7 0-2.93 1.81-5.45 4.37-6.49zM12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z"></path>
  </Icon>
);

/**
 * LightModeIcon component, path borrowed from
 * {@link https://mui.com|Material Design}.
 *
 * @returns {Element} DOM component
 */
export const LightModeIcon = () => (
  <Icon>
    <path d="M12 9c1.65 0 3 1.35 3 3s-1.35 3-3 3-3-1.35-3-3 1.35-3 3-3m0-2c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"></path>
  </Icon>
);

/**
 * DoubleArrowDownIcon component, path borrowed from
 * {@link https://mui.com|Material Design}.
 *
 * @returns {Element} DOM component
 */
export const DoubleArrowDownIcon = () => (
  <Icon>
    <path d="M18 6.41 16.59 5 12 9.58 7.41 5 6 6.41l6 6z"></path>
    <path d="m18 13-1.41-1.41L12 16.17l-4.59-4.58L6 13l6 6z"></path>
  </Icon>
);

/**
 * DoubleArrowUpIcon component, path borrowed from
 * {@link https://mui.com|Material Design}.
 *
 * @returns {Element} DOM component
 */
export const DoubleArrowUpIcon = () => (
  <Icon>
    <path d="M6 17.59 7.41 19 12 14.42 16.59 19 18 17.59l-6-6z"></path>
    <path d="m6 11 1.41 1.41L12 7.83l4.59 4.58L18 11l-6-6z"></path>
  </Icon>
);

/**
 * CopyrightIcon component, path borrowed from
 * {@link https://mui.com|Material Design}.
 *
 * @returns {Element} DOM component
 */
export const CopyrightIcon = () => (
  <Icon>
    <path d="M11.88 9.14c1.28.06 1.61 1.15 1.63 1.66h1.79c-.08-1.98-1.49-3.19-3.45-3.19C9.64 7.61 8 9 8 12.14c0 1.94.93 4.24 3.84 4.24 2.22 0 3.41-1.65 3.44-2.95h-1.79c-.03.59-.45 1.38-1.63 1.44-1.31-.04-1.86-1.06-1.86-2.73 0-2.89 1.28-2.98 1.88-3zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"></path>
  </Icon>
);

/**
 * MenuIcon component, path borrowed from
 * {@link https://mui.com|Material Design}.
 *
 * @returns {Element} DOM component
 */
export const MenuIcon = () => (
  <Icon>
    <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"></path>
  </Icon>
);

/**
 * PreviewIcon component, path borrowed from
 * {@link https://mui.com|Material Design}.
 *
 * @returns {Element} DOM component
 */
export const PreviewIcon = () => (
  <Icon>
    <path d="M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.89-2-2-2zm0 16H5V7h14v12zm-5.5-6c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5.67-1.5 1.5-1.5 1.5.67 1.5 1.5zM12 9c-2.73 0-5.06 1.66-6 4 .94 2.34 3.27 4 6 4s5.06-1.66 6-4c-.94-2.34-3.27-4-6-4zm0 6.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"></path>
  </Icon>
);

/**
 * DescriptionOutlinedIcon component, path borrowed from
 * {@link https://mui.com|Material Design}.
 * Using this an thread icon
 *
 * @returns {Element} DOM component
 */
export const DescriptionOutlinedIcon = () => (
  <Icon styleSize="2em">
    <path d="M8 16h8v2H8zm0-4h8v2H8zm6-10H6c-1.1 0-2 .9-2 2v16c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"></path>
  </Icon>
);

/**
 * ClearAllIcon component, path borrowed from
 * {@link https://mui.com|Material Design}.
 * Using this an thread icon
 *
 * @returns {Element} DOM component
 */
export const ClearAllIcon = () => (
  <Icon styleSize="2em">
    <path d="M5 13h14v-2H5v2zm-2 4h14v-2H3v2zM7 7v2h14V7H7z"></path>
  </Icon>
);
