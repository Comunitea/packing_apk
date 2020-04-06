# APP odoo packaking_apk para iOS, Android o navegador
Aplicación para gestión de salidas de inventario.

### Requisitos
- Odoo 11+
- Ionic framework 3+
- npm
- Capacitor (para iOS)

### Instalación
- Git clone.
- npm install
- ionic serve

### Añadir plataformas
- ionic cordova platformn add (android/ios/browser)
- Instalar las dependencias que diga que falten con npm install

### Probar en navegador/generar archivos para navegador
Se puede ejecutar con ionic serve pero a veces el navegador no ejecutará cordova y fallará.
- ionic cordova platform add browser
- ionic cordova prepare browser
- ionic cordova run browser

### Npm audit
- Si existe algún problema con las dependencias se mostrará un mensaje para revisarlos con npm audit.
- Puedes instalar las versiones que te proponga de las dependencias pero revisando tras la instalación que no crean un conflicto con otras.
- Si hay conflicto tendrás que hacer npm uninstall de lo que hayas metido.

### Generar apk para Android
- Creamos la plataforma si no lo hemos hecho ya:
```
$ ionic cordova platform add android
```
- Actualizamos los archivos de la plataforma:
```
$ ionic cordova prepare android
```
- Generamos apk:
```
$ ionic cordova build --release android
```
- Generamos keystore si no tenemos:
```
$ keytool -genkey -v -keystore my-release-key.keystore -alias alias_name -keyalg RSA -keysize 2048 -validity 10000
```
- Firmamos la apk:
```
$ jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore my-release-key.keystore apkfileName.apk alias_name
```
- Comprimimos la apk:
```
$ zipalign -v 4 Myapp-release-unsigned.apk MyappName.apk
```

### Generar app para iOS
- Instalamos capacitor/ios:
```
$ npm install @capacitor/ios
```
- Instalamos pods:
```
$ sudo gem install cocoapods
```
- Creamos los iconos e imágenes de la app:
```
$ ionic cordova resources ios
```
- Ejecutamos un "ionic cordova prepare ios" para que se genere el contenido de /www
- Creamos la plataforma si no lo hemos hecho ya:
```
$ ionic capacitor add ios
```
o
```
$ npx cap add ios
```
- Copiamos los archivos de resources generados en la carpeta ios/App/App/Assets.xcassets si no ha creado los iconos correctos.
- Actualizamos el proyecto si hemos hecho cambios:
```
$ ionic capacitor copy ios
```
o

```
$ npx cap copy ios
```
- Arrancamos el proyecto en Xcode (se puede usar open o run):
```
$ ionic capacitor open ios
```
o
```
$ npx cap open ios
```
- Actualizar proyecto
```
$ npx cap update ios
```
- Copy + Update
```
$ npx cap sync ios
```

### TODO
deprecated @angular/http@7.2.16: Package no longer supported. Use @angular/common instead, see https://angular.io/guide/deprecations#angularhttp
deprecated sw-toolbox@3.6.0: Please migrate to Workbox: https://developers.google.com/web/tools/workbox/guides/migrations/migrate-from-sw
deprecated rollup-plugin-commonjs@8.2.6: This package has been deprecated and is no longer maintained. Please use @rollup/plugin-commonjs.
deprecated rollup-plugin-node-resolve@3.0.0: This package has been deprecated and is no longer maintained. Please use @rollup/plugin-node-resolve.
deprecated browserslist@2.11.3: Browserslist 2 could fail on reading Browserslist >3.0 config used in other tools.
deprecated request@2.88.2: request has been deprecated, see https://github.com/request/request/issues/3142
