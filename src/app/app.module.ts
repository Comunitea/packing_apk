import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';
import { IonicStorageModule } from '@ionic/storage';
import { DragulaModule } from 'ng2-dragula'

import { HomePage } from '../pages/home/home';
import { TabsPage } from '../pages/tabs/tabs';
import { StockMoveListPage } from '../pages/stock-move-list/stock-move-list';

import { StatusBar } from '@ionic-native/status-bar/ngx';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StockProvider } from '../providers/stock/stock';
import { OdooProvider } from '../providers/odoo/odoo';

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    TabsPage,
    StockMoveListPage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot(),
    DragulaModule.forRoot()
    /* Para Android ~9 hay que poner poner websql para que funcione.
    
    IonicStorageModule.forRoot(
      {
        name: '__mydb',
        driverOrder: ['sqlite', 'websql', 'indexeddb']
        }
    ) 
     Si se activa siempre no funciona en navegadores de incógnito.
    */
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    TabsPage,
    StockMoveListPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    StockProvider,
    OdooProvider,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
