import { webview } from '@kit.ArkWeb';
import { updateSystemBarContentColor } from '../systembar/SystemBar';

let currentController: webview.WebviewController | undefined;
let pageLoaded: boolean = false;
let currentSystemDark: boolean | undefined;
const HARMONY_WEB_ORIGIN = 'http://lvshuhuai.cn:5050';

function completeLocalResponse(response: WebResourceResponse, mimeType: string): WebResourceResponse {
  response.setResponseEncoding('UTF-8');
  response.setResponseMimeType(mimeType);
  response.setResponseCode(200);
  response.setReasonMessage('OK');
  response.setResponseIsReady(true);
  return response;
}

function interceptLocalPage(requestUrl: string): WebResourceResponse | null {
  const path = requestUrl.substring(HARMONY_WEB_ORIGIN.length).split('?')[0].split('#')[0];
  if (path === '' || path === '/' || path === '/index.html') {
    const response = new WebResourceResponse();
    response.setResponseData($rawfile('www/index.html'));
    return completeLocalResponse(response, 'text/html');
  }
  if (path === '/logo.png') {
    const response = new WebResourceResponse();
    response.setResponseData($rawfile('www/logo.png'));
    return completeLocalResponse(response, 'image/png');
  }
  if (path === '/resource/loading.css') {
    const response = new WebResourceResponse();
    response.setResponseData($rawfile('www/resource/loading.css'));
    return completeLocalResponse(response, 'text/css');
  }
  if (path === '/resource/loading.js') {
    const response = new WebResourceResponse();
    response.setResponseData($rawfile('www/resource/loading.js'));
    return completeLocalResponse(response, 'application/javascript');
  }
  return null;
}

class SystemBarBridge {
  setDarkMode(isDark: boolean): void {
    currentSystemDark = isDark;
    updateSystemBarContentColor(isDark);
  }
}

export function setHarmonySystemTheme(isDark: boolean): void {
  currentSystemDark = isDark;
  updateSystemBarContentColor(isDark);
  if (!currentController || !pageLoaded) {
    return;
  }
  currentController.runJavaScript(
    `window.__WHERE_MONEY_SYSTEM_DARK__ = ${isDark}; window.dispatchEvent(new CustomEvent('where-money-system-theme-change', { detail: { dark: ${isDark} } }))`
  ).catch((err: Error) => {
    console.error(`[WhereMoney] system theme sync failed: ${err.message}`);
  });
}

function getDocumentStartThemeScript(): string {
  const isDark = currentSystemDark === true;
  return `(function () {
    var dark = ${isDark};
    window.__WHERE_MONEY_SYSTEM_DARK__ = dark;
    function applyTheme() {
      if (document.documentElement) {
        document.documentElement.classList.toggle('dark', dark);
      }
    }
    applyTheme();
    document.addEventListener('DOMContentLoaded', applyTheme, { once: true });
  })();`;
}

@Entry
@Component
struct Index {
  private controller: webview.WebviewController = new webview.WebviewController();
  private systemBarBridge: SystemBarBridge = new SystemBarBridge();

  aboutToAppear(): void {
    currentController = this.controller;
  }

  build() {
    Stack() {
      Web({
        src: HARMONY_WEB_ORIGIN,
        controller: this.controller
      })
        .javaScriptOnDocumentStart([{
          script: getDocumentStartThemeScript(),
          scriptRules: ['*']
        }])
        .javaScriptAccess(true)
        .domStorageAccess(true)
        .fileAccess(true)
        .enableAutoFill(true)
        .onControllerAttached(() => {
          this.controller.registerJavaScriptProxy(
            this.systemBarBridge,
            'whereMoneySystemBar',
            ['setDarkMode']
          );
        })
        .onInterceptRequest((event: OnInterceptRequestEvent) => {
          const requestUrl = event.request.getRequestUrl();
          const response = interceptLocalPage(requestUrl);
          if (response) {
            console.info(`[WhereMoney][Web] local resource served: ${requestUrl}`);
          }
          return response;
        })
        .onPageBegin((event) => {
          pageLoaded = false;
          console.info(`[WhereMoney][Web] page begin: ${event.url}`);
        })
        .onPageEnd((event) => {
          pageLoaded = true;
          console.info(`[WhereMoney][Web] page end: ${event.url}`);
          if (currentSystemDark !== undefined) {
            setHarmonySystemTheme(currentSystemDark);
          }
        })
        .onConsole((event) => {
          const message = event.message.getMessage();
          if (message === '[WhereMoney][SystemBar] dark') {
            updateSystemBarContentColor(true);
          } else if (message === '[WhereMoney][SystemBar] light') {
            updateSystemBarContentColor(false);
          }
          console.info(`[WhereMoney][Web] ${message}`);
          return false;
        })
        .onErrorReceive((event) => {
          console.error(`[WhereMoney][Web] ${event.error.getErrorInfo()}`);
        })
        .width('100%')
        .height('100%')
    }
    .width('100%')
    .height('100%')
    .expandSafeArea([SafeAreaType.SYSTEM], [SafeAreaEdge.BOTTOM]);
  }
}
