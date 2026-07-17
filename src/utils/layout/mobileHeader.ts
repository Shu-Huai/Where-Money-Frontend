export const MOBILE_HEADER_BREAKPOINT = 1024;

export function isMobileHorizontalHeader(showHeaderMenu: boolean, width: number): boolean {
    return showHeaderMenu && width < MOBILE_HEADER_BREAKPOINT;
}

export function getGlobalHeaderHeight(headerHeight: number, showHeaderMenu: boolean, width: number): number {
    return isMobileHorizontalHeader(showHeaderMenu, width) ? headerHeight * 2 : headerHeight;
}
