---
layout: post
title: Android에서 네이버 지도 SDK 사용하기
date: 2018-07-18 14:41:00 +0900
description: Template description
thumbnail: /thumbnails/android-naver-map.jpg
category: 'android'
tags:
- android
- kotlin
- naver
- map
twitter_text: template twitter_text
---

Android에서 네이버 지도 SDK 사용하기

<!-- more -->

## 목차
[1\. 앱 등록하기](#1-앱-등록하기)    
[2\. 준비하기](#2-준비하기)    
[3-1\. Activity에서 네이버 지도 사용하기](#3-1-activity에서-네이버-지도-사용하기)    
[3-2\. Fragment에서 네이버 지도 사용하기](#3-2-fragment에서-네이버-지도-사용하기)    
[4\. 지도 배율 설정하기](#4-지도-배율-설정하기)    
[5\. 지도에 마커 표시하기](#5-지도에-마커-표시하기)

---

### 1\. 앱 등록하기

![](001.jpg)

NaverMapExample 이라는 이름으로 프로젝트를 하나 만들었습니다.
minimum SDK는 19로 했습니다.

---

![](002.jpg)
[네이버 개발자 센터](https://developers.naver.com/main/)에 가서
로그인을 하고 `어플리케이션 등록`을 누릅니다.

---

![](003.jpg)
어플리케이션 이름은 실제 사용자들이 보게 될 서비스 이름입니다. 뭐 우리는 이 앱을 실제로 서비스하지 않으므로 적당히 입력합니다.    
사용 API에서 `지도(모바일)`을 선택하고 `Android` 환경을 추가한 뒤 안드로이드 앱 패키지 이름을 입력한 뒤 등록합니다.

---

![](004.jpg)
등록을 하고 나면 위와 같이 `Client ID`와 `Client Secret`을 볼 수 있습니다. `Client ID`만 쓰이므로 `Client Secret`는 신경 쓰지 말도록 합시다.

---

### 2\. 준비하기

App Level의 `build.gradle`의 `dependencies`에 아래의 내용을 추가합나디.

```gradle
implementation 'com.naver.maps.open:naver-map-api:2.1.2@aar'
```

---

`AndroidManifest.xml`의 `manifest` 태그 안에 아래의 내용을 추가합니다.

```xml
<uses-permission android:name="android.permission.INTERNET" />              <!--반드시 추가-->
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION"/>   <!--위치정보활용시 추가-->
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION"/> <!--위치정보활용시 추가-->
<uses-permission android:name="android.permission.ACCESS_WIFI_STATE"/>      <!--WIFI 상태활용시 추가-->
<uses-permission android:name="android.permission.CHANGE_WIFI_STATE"/>      <!--WIFI 상태활용시 추가-->
```

---

### 3-1\. Activity에서 네이버 지도 사용하기

NMapView : 안드로이드 ViewGroup 클래스를 상속받은 클래스로서 지도 데이터를 화면에 표시합니다.

activity_main.xml
```xml
<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical">

    <com.nhn.android.maps.NMapView
        android:id="@+id/map_view"
        android:layout_width="360dp"
        android:layout_height="360dp"/>
</LinearLayout>
```

MainActivity.kt
```kotlin
class MainActivity : NMapActivity() {
    private val clientId = "YOUR_CLIENT_ID"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        map_view.setClientId(clientId)
        map_view.isClickable = true
    }
}
```

NMapView는 clickable이 false로 초기화 되어 있으므로 지도 이동 및 확대가 전혀 되지 않습니다.
따라서 isClickable을 true로 만들어 주어야 합니다.

앱을 실행하면 아래와 같이 나옵니다.

<img src="005.jpg" width="300">

NMapActivity는 AppCompatActivity를 상속하는 것이 아니므로 툴바가 나오지 않는다는 사실을 알 수 있습니다.

---

### 3-2\. Fragment에서 네이버 지도 사용하기

Fragment에서 NMapView를 사용하려면 아래와 같이 모든 lifecycle 마다 NMapContext를 호출해야 합니다.

MainFragment.kt
```kotlin
class MainFragment : Fragment() {
    private val clientId = "YOUR_CLIENT_ID"
    private lateinit var mMapContext: NMapContext

    override fun onCreateView(inflater: LayoutInflater,
                              container: ViewGroup?,
                              savedInstanceState: Bundle?): View? {
        return inflater.inflate(R.layout.activity_main, container, false)
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        mMapContext = NMapContext(super.getActivity())
        mMapContext.onCreate()
    }

    override fun onActivityCreated(savedInstanceState: Bundle?) {
        super.onActivityCreated(savedInstanceState)
        map_view.setClientId(clientId)
        mMapContext.setupMapView(map_view)
    }

    override fun onStart() {
        super.onStart()
        mMapContext.onStart()
    }

    override fun onResume() {
        super.onResume()
        mMapContext.onResume()
    }

    override fun onPause() {
        super.onPause()
        mMapContext.onPause()
    }

    override fun onStop() {
        mMapContext.onStop()
        super.onStop()
    }

    override fun onDestroy() {
        mMapContext.onDestroy()
        super.onDestroy()
    }
}
```

---

### 4\. 지도 배율 설정하기

<img src="005.jpg" width="300">

앱 실행 화면을 보시면 너무 지도 요소들이 작은 것을 알 수 있습니다.
가져온 지도의 1픽셀을 기기 화면의 1픽셀에 대응시켜서 보여주기 때문입니다.

따라서 NMapView의 다음 메서드를 이용하여 지도를 적절히 확대시켜야 합니다.

```
boolean setScalingFactor(float scalingFactor, boolean mapHD)
```

하지만 여기서의 `scalingFactor`는 단순히 확대 시키는 비율이므로 화면의 density에 따라 적절히 정해주어야 합니다.
다음 예시를 보시면 이해가 되실것입니다.

---

1) scalingFactor를 3.0으로 했을 경우

xxhdpi (1920 x 1080)                                       | xxxhdpi (2560 * 1440)
-----------------------------------------------------------|------------------------------------------------------------
<img src="xxhdpi1.jpg" width="400"> | <img src="xxxhdpi1.jpg" width="400">

---

2) scalingFactor를 `context.resources.displayMetrics.density`로 했을 경우

xxhdpi (1920 x 1080)                                       | xxxhdpi (2560 * 1440)
-----------------------------------------------------------|------------------------------------------------------------
<img src="xxhdpi2.jpg" width="400"> | <img src="xxxhdpi2.jpg" width="400">

---

3) mapHD의 비교

mapHD = true                                               | mapHD = false
-----------------------------------------------------------|------------------------------------------------------------
<img src="xxhdpi2.jpg" width="400"> | <img src="xxxhdpi3.jpg" width="400">

---

### 5\. 지도에 마커 표시하기

`NMapResourceProvider`는 지도 위의 오버레이 객체 드로잉에 필요한 리소스 데이터를 제공하기 위한 추상 클래스입니다.
따라서 지도에 뭔가를 표시하려면 이를 상속하는 클래스를 만들어서 사용해야 합니다.
그러므로 아래 코드를 복사하여 `CustomResourceProvider`를 만듭니다.
여기 있는 메서드들은 앞으로 차차 채워나갈 것입니다.

CustomResourceProvider.kt
```kotlin
class CustomResourceProvider(context: Context): NMapResourceProvider(context) {
    override fun getLocationDot(): Array<Drawable>? {
        return null
    }

    override fun getDrawableForMarker(p0: Int, p1: Boolean, p2: NMapOverlayItem?): Drawable? {
        return null
    }

    override fun getCalloutBackground(p0: NMapOverlayItem?): Drawable? {
        return null
    }

    override fun getCalloutRightButton(p0: NMapOverlayItem?): Array<Drawable>? {
        return null
    }

    override fun getCalloutTextColors(p0: NMapOverlayItem?): IntArray? {
        return null
    }

    override fun findResourceIdForMarker(markerId: Int, focused: Boolean): Int {
        return 0
    }

    override fun getCalloutRightButtonText(p0: NMapOverlayItem?): String? {
        return null
    }

    override fun getCalloutRightAccessory(p0: NMapOverlayItem?): Array<Drawable>? {
        return null
    }

    override fun getDirectionArrow(): Drawable? {
        return null
    }
    
    override fun getParentLayoutIdForOverlappedListView(): Int {
        return 0
    }

    override fun getOverlappedListViewId(): Int {
        return 0
    }

    override fun getLayoutIdForOverlappedListView(): Int {
        return 0
    }

    override fun getListItemLayoutIdForOverlappedListView(): Int {
        return 0
    }

    override fun getListItemTextViewId(): Int {
        return 0
    }

    override fun getListItemTailTextViewId(): Int {
        return 0
    }

    override fun getListItemImageViewId(): Int {
        return 0
    }

    override fun getListItemDividerId(): Int {
        return 0
    }

    override fun setOverlappedListViewLayout(listView: ListView, itemCount: Int, width: Int, height: Int) {
        
    }

    override fun setOverlappedItemResource(poiItem: NMapPOIitem, imageView: ImageView) {
        
    }
}
```

---

![](006.jpg)
지도 위에 핀으로 쓸 이미지를 하나 가져옵니다.
저는 대충 24dp 크기 짜리 벡터 이미지를 하나 가져왔습니다.

---

`CustomResourceProvider`의 `findResourceIdForMarker`를 아래와 같이 바꿉니다.

```kotlin
override fun findResourceIdForMarker(markerId: Int, focused: Boolean): Int {
    return R.drawable.pin
}
```

---

MainActivity의 onCreate를 다음과 같이 수정합니다.

MainActivity.kt
```kotlin
override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    setContentView(R.layout.activity_main)

    map_view.setClientId(clientId)
    map_view.isClickable = true
    map_view.setScalingFactor(resources.displayMetrics.density, true)

    // 여기 부터 아래 내용 입력 시작
}
```

```kotlin
val resourceProvider = CustomResourceProvider(this)
```
지도 위의 오버레이 객체 드로잉에 필요한 리소스 데이터를 제공하는 `CustomResourceProvider`를 생성합니다.

```kotlin
val overlayManager = NMapOverlayManager(this, map_view, resourceProvider)
```
지도 위에 표시되는 오버레이 객체를 관리하는 `NMapOverlayManager`를 생성합니다.

```kotlin
val poiData = NMapPOIdata(10, resourceProvider)
```
지도 위에 표시되는 POI 아이템을 관리하는 `NMapPOIdata`를 생성합니다.
10은 전체 POI 아이템 갯수를 의미합니다.

```kotlin
poiData.beginPOIdata(2)
poiData.addPOIitem(126.977983, 37.565568, "서울광장", 123, 0)
poiData.addPOIitem(126.976715, 37.575994, "광화문", 123, 0)
poiData.endPOIdata()
```
NMapPOIdata에 데이터를 넣을 때는 꼭 beginPOIdata를 호출해야 합니다.    
beginPOIdata 파라미터는 앞으로 넣을 POIItem의 갯수입니다.    
123은 markderId이고 NMapResourceProvider에서 사용합니다.    
0은 tag이고 마커를 선택했을 때 호출되는 콜백 인터페이스에서 사용됩니다.    

```kotlin
val poiDataOverlay = overlayManager.createPOIdataOverlay(poiData, null)
```
여러 개의 오버레이 아이템을 포함할 수 있는 `NMapPOIdataOverlay`를 만듭니다.

```kotlin
Handler().postDelayed({
    poiDataOverlay.showAllPOIdata(0)
}, 400)
```
`NMapPOIdataOverlay`의 `showAllPOIdata`를 호출하여 모든 POIItem을 화면에 표시합니다.
showAllPOIdata의 파라미터는 지도의 축척을 의미 합니다.
0인 경우에는 모든 마커를 표시하는 적절한 축척을 자동으로 지정하여 보여줍니다.

그런데 이 부분을 바로 실행할 경우 아래와 같이 나와서 Handler를 사용해서 실행했습니다.
onStart나 onResume에서 실행해도 마찬가지라서 이와 같이 했습니다.
왜 이런지는 저도 잘 모르겠네요;;

Handler를 사용한 경우                                     | Handler를 사용하지 않은 경우
-------------------------------------------------------|------------------------------------------------------------
<img src="007.jpg" width="400"> | <img src="008.jpg" width="400">