# Graph Report - src  (2026-07-17)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 657 nodes · 878 edges · 77 communities (60 shown, 17 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `af01bc39`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 51|Community 51]]
- [[_COMMUNITY_Community 55|Community 55]]
- [[_COMMUNITY_Community 59|Community 59]]
- [[_COMMUNITY_Community 60|Community 60]]

## God Nodes (most connected - your core abstractions)
1. `useBoolean()` - 10 edges
2. `ThemeLayoutMode` - 8 edges
3. `getColorPalette()` - 8 edges
4. `transformAuthRouteToVueRoute()` - 8 edges
5. `useAppStore` - 7 edges
6. `useBodyScroll()` - 6 edges
7. `getThemeSettings()` - 6 edges
8. `useThemeStore` - 6 edges
9. `subscribeThemeStore()` - 6 edges
10. `http` - 6 edges

## Surprising Connections (you probably didn't know these)
- `subscribeAppStore()` --calls--> `useBodyScroll()`  [EXTRACTED]
  store/subscribe/app.ts → hooks/common/useBodyScroll.ts
- `RouteState` --references--> `GlobalMenuOption`  [EXTRACTED]
  store/modules/route/index.ts → interface/system.ts
- `TabState` --references--> `GlobalTabRoute`  [EXTRACTED]
  store/modules/tab/index.ts → interface/system.ts
- `aiParseBillApi()` --calls--> `service`  [EXTRACTED]
  apis/bill.ts → utils/request.ts
- `useBasicLayout()` --calls--> `useAppStore`  [EXTRACTED]
  composables/common/layout.ts → store/modules/app/index.ts

## Import Cycles
- 1-file cycle: `settings/theme.ts -> settings/theme.ts`
- 1-file cycle: `settings/color.ts -> settings/color.ts`
- 1-file cycle: `views/asset/components/index.ts -> views/asset/components/index.ts`
- 3-file cycle: `store/index.ts -> store/subscribe/index.ts -> store/subscribe/app.ts -> store/index.ts`
- 3-file cycle: `store/index.ts -> store/subscribe/index.ts -> store/subscribe/theme.ts -> store/index.ts`
- 3-file cycle: `store/index.ts -> store/modules/index.ts -> store/modules/tab/index.ts -> store/index.ts`
- 3-file cycle: `utils/http.ts -> utils/request.ts -> utils/index.ts -> utils/http.ts`
- 3-file cycle: `interface/index.ts -> interface/schemas/index.ts -> interface/schemas/PayBill.ts -> interface/index.ts`
- 4-file cycle: `interface/index.ts -> interface/response/index.ts -> interface/response/book/index.ts -> interface/response/book/BookAllBillCategoryResponse.ts -> interface/index.ts`
- 4-file cycle: `interface/index.ts -> interface/response/index.ts -> interface/response/book/index.ts -> interface/response/book/BookGetAllBookResponse.ts -> interface/index.ts`
- 4-file cycle: `interface/index.ts -> interface/response/index.ts -> interface/response/book/index.ts -> interface/response/book/BookGetBookResponse.ts -> interface/index.ts`

## Communities (77 total, 17 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.06
Nodes (48): addColorAlpha(), ColorIndex, getColorPalette(), getHue(), getSaturation(), getValue(), EnumThemeAnimateMode, EnumThemeHorizontalMenuPosition (+40 more)

### Community 1 - "Community 1"
Cohesion: 0.06
Nodes (22): AssetDayStatistic, AssetDayStatisticTimeResponse, AssetGetAllAssetResponse, AssetGetAssetResponse, BookAllBillCategoryResponse, BookBalanceMonthResponse, BookGetAllBookResponse, BookGetBookResponse (+14 more)

### Community 2 - "Community 2"
Cohesion: 0.08
Nodes (26): AppState, useAppStore, theme, LayoutHeaderProps, useBasicLayout(), useRouterPush(), createRouterGuard(), scrollBehavior() (+18 more)

### Community 3 - "Community 3"
Cohesion: 0.09
Nodes (16): exeStrategyActions(), iconifyRender(), createDynamicRouteGuard(), createPermissionGuard(), GlobalBreadcrumb, GlobalMenuOption, RouteState, useRouteStore (+8 more)

### Community 4 - "Community 4"
Cohesion: 0.07
Nodes (8): {bool: isHover, setTrue, setFalse}, buttonStyle, isIconActive, props, {bool: isHover, setTrue, setFalse}, isActive, props, {bool: isHover, setTrue, setFalse}

### Community 5 - "Community 5"
Cohesion: 0.07
Nodes (12): activeKey, menus, route, {routerPush}, routeStore, theme, app, routeStore (+4 more)

### Community 6 - "Community 6"
Cohesion: 0.11
Nodes (17): EnumLayoutComponentName, BasicLayout(), BlankLayout(), getLayoutComponent(), getViewComponent(), LayoutComponent, ComponentAction, hasChildren() (+9 more)

### Community 7 - "Community 7"
Cohesion: 0.14
Nodes (12): EnumStorageKey, EnumDataType, decrypto(), encrypto(), getTabRoutes(), setTabRoutes(), getLocal(), removeLocal() (+4 more)

### Community 8 - "Community 8"
Cohesion: 0.10
Nodes (10): theme, theme, theme, TraditionColor, TraditionColorDetail, traditionColors, {bool: visible, setTrue: openModal, setFalse: closeModal}, isInOther (+2 more)

### Community 9 - "Community 9"
Cohesion: 0.11
Nodes (12): activeKey, app, route, {routerPush}, routeStore, store, theme, props (+4 more)

### Community 10 - "Community 10"
Cohesion: 0.11
Nodes (17): activeChildMenus, activeParentRouteName, app, {bool: drawerVisible, setTrue: openDrawer, setFalse: hideDrawer}, firstDegreeMenus, getActiveParentRouteName(), handleMixMenu(), resetFirstDegreeMenus() (+9 more)

### Community 11 - "Community 11"
Cohesion: 0.12
Nodes (10): bookBudgetEdit, bookBudgetTotalMin, bookBudgetUsedMin, bookTotalBudget, bookUsedBudget, compactFormatter, emit, message (+2 more)

### Community 12 - "Community 12"
Cohesion: 0.31
Nodes (8): ScrollBodyStyle, useBodyScroll(), useBoolean(), useContext(), useLoading(), useLoadingEmpty(), useModalVisible(), useReload()

### Community 15 - "Community 15"
Cohesion: 0.19
Nodes (7): BillAiParseResponse, BillAiParseType, BillAllBillTimeResponse, BillBillResponse, BillCategoryStatisticTimeResponse, BillDayStatisticTimeResponse, BillMaxMinTimeResponse

### Community 16 - "Community 16"
Cohesion: 0.14
Nodes (13): GetRouteFirstParentKey, GetSingleRouteKey, KeyToPath, PathToDynamicPath, Route, RouteComponent, RouteKey, RouteMeta (+5 more)

### Community 18 - "Community 18"
Cohesion: 0.27
Nodes (6): activeComponent, dropdown, handleContextMenu(), hideDropdown(), setDropdown(), showDropdown()

### Community 21 - "Community 21"
Cohesion: 0.29
Nodes (6): app, dropdownVisible, handleDropdown(), hide(), props, tab

### Community 22 - "Community 22"
Cohesion: 0.29
Nodes (4): assetList, debt, net, total

### Community 24 - "Community 24"
Cohesion: 0.33
Nodes (4): Package, PkgJson, PkgVersionInfo, pkgWithType

### Community 26 - "Community 26"
Cohesion: 0.33
Nodes (3): ERROR_STATUS, NO_ERROR_MSG_CODE, REFRESH_TOKEN_CODE

### Community 27 - "Community 27"
Cohesion: 0.33
Nodes (4): defaultColor, fill, FillColor, props

### Community 37 - "Community 37"
Cohesion: 0.50
Nodes (3): fill, props, symbolId

### Community 38 - "Community 38"
Cohesion: 0.50
Nodes (3): bgColor, formRef, object

## Knowledge Gaps
- **164 isolated node(s):** `theme`, `props`, `darkMode`, `props`, `{bool: isHover, setTrue, setFalse}` (+159 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **17 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useBodyScroll()` connect `Community 12` to `Community 2`?**
  _High betweenness centrality (0.033) - this node is a cross-community bridge._
- **Why does `EnumStorageKey` connect `Community 7` to `Community 0`, `Community 3`, `Community 30`?**
  _High betweenness centrality (0.011) - this node is a cross-community bridge._
- **What connects `theme`, `props`, `darkMode` to the rest of the system?**
  _164 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.06384180790960452 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.05551020408163265 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.08405797101449275 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.08870967741935484 - nodes in this community are weakly interconnected._