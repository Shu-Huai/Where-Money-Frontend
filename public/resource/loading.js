/**
 * 初始化加载效果的svg格式logo
 * @param { string }id - 元素id
 */
function initSvgLogo(id) {
    const svgStr = `<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px">
    <g>
        <title>Layer 1</title>
        <text style="fill:currentColor" x="150" y="325" id="svg_1" font-size="70" font-family="'Assistant'" xml:space="preserve" font-style="italic" font-weight="bold">Where Money</text>
        <path xmlns="http://www.w3.org/2000/svg" stroke="#14b8a6" stroke-width="1%" id="svg_4" d="m150,341.90909l119,0" opacity="undefined" fill="#000" />
    </g>
</svg>
`;
    const appEl = document.querySelector(id);
    const div = document.createElement("div");
    div.innerHTML = svgStr;
    if (appEl) {
        appEl.appendChild(div);
    }
}

function addThemeColorCssVars() {
    const key = "__THEME_COLOR__";
    const themeColor = window.localStorage.getItem(key) || "#2092C6";
    document.documentElement.style.cssText = `--primary-color: ${themeColor}`;
}

initSvgLogo("#loadingLogo");

addThemeColorCssVars();
