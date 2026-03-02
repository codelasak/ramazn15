1. Ezan api - Ramazan imsakiye-iftarti il-ilçe : Imsakiyem API, Diyanet kaynakli vakit verisini lokasyon hiyerarsisi ve periyot bazli endpointlerle sunar.

Notlar

2026-02-19 testlerinde /api/locations/countries, /api/locations/states?countryId=2, /api/locations/districts?stateId=539 ve /api/prayer-times/9541/{period} endpointleri 200 dondu. Dokumandaki eski /docs-json yolu 404; guncel Swagger arayuzu /api-docs/ altindadir.

Kullanım Senaryoları

TR odakli il-ilce secimi ile imsak/iftar vakti cekme
Gunluk/haftalik/aylik/yillik ezan vakti ekranlari olusturma
Ramazan ayi icin ilce bazli vakit listesi sunma  https://ezanvakti.imsakiyem.com/api-docs/#/


2. Free Recipe API

Thumbs Up Icon Free Recipe API Support
The API and site will always remain free at point of access.

API Icon Test API Keys
You can use the test API key "1" during development of your app or for educational use (see test links below).
However you must become a supporter if releasing publicly on an appstore.

Up Arrow Icon API Production Key Upgrade
All supporters have access to the beta version of the API which allows mutiple ingredient filters.
You also get access to adding your own meals and images. You can also list the full database rather than limited to 100 items.
Please sign up on Paypal and we will email you the upgraded API key.

Email Icon Contact
Email: thedatadb (at) gmail.com
section seperator
V1 API
Code Icon API Methods using the developer test key '1' in the URL


Search meal by name
www.themealdb.com/api/json/v1/1/search.php?s=Arrabiata

List all meals by first letter
www.themealdb.com/api/json/v1/1/search.php?f=a

Lookup full meal details by id
www.themealdb.com/api/json/v1/1/lookup.php?i=52772

Lookup a single random meal
www.themealdb.com/api/json/v1/1/random.php

Lookup a selection of 10 random meals
*Premium API Only
www.themealdb.com/api/json/v1/1/randomselection.php

List all meal categories
www.themealdb.com/api/json/v1/1/categories.php

Latest Meals
*Premium API Only
www.themealdb.com/api/json/v1/1/latest.php

List all Categories, Area, Ingredients
www.themealdb.com/api/json/v1/1/list.php?c=list
www.themealdb.com/api/json/v1/1/list.php?a=list
www.themealdb.com/api/json/v1/1/list.php?i=list

Filter by main ingredient
www.themealdb.com/api/json/v1/1/filter.php?i=chicken_breast

Filter by multi-ingredient
*Premium API Only
www.themealdb.com/api/json/v1/1/filter.php?i=chicken_breast,garlic,salt

Filter by Category
www.themealdb.com/api/json/v1/1/filter.php?c=Seafood

Filter by Area
www.themealdb.com/api/json/v1/1/filter.php?a=Canadian

Meal Thumbnail Images
Add /preview to the end of the meal image URL
/images/media/meals/llcbn01574260722.jpg/small
/images/media/meals/llcbn01574260722.jpg/medium
/images/media/meals/llcbn01574260722.jpg/large
Small meal thumbnail

Ingredient Thumbnail Images
*URL's match the ingredient name with an underscore for any spaces.

www.themealdb.com/images/ingredients/lime.png
www.themealdb.com/images/ingredients/lime-small.png
www.themealdb.com/images/ingredients/lime-medium.png
www.themealdb.com/images/ingredients/lime-large.png
Large Lime Thumbnail

3 Quran API Documentation
The following endpoints are supported by the Quran API. They all support the HTTP GET method and return JSON over the following base domains:

https://api.alquran.cloud
https://alquran.api.islamic.network
https://alquran.api.alislam.ru - This endpoint is located in Russia
All endpoints support the 'Accept-Encoding' header with either gzip or zstd. Please consider using this to compress the API responses for efficiency.

GET Edition - Available text and audio editions
GET Quran - Get a complete Quran edition
GET Juz - Get a Juz of the Quran
GET Surah - Get a Surah of the Quran
GET Ayah - Get an Ayah of the Quran
GET Search - Search the text of the Quran
GET Manzil - Get a Manzil of the Quran
GET Ruku - Get a Ruku of the Quran
GET Page - Get a Page of the Quran
GET Hizb Quarter - Get a Hizb Quarter of the Quran
GET Sajda - Get all verses requiring Sajda / Prostration in the Quran
GET Meta - Get meta data about Surahs, Pages, Hizbs and Juzs