import { Component, ChangeDetectorRef, NgModule } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, ActionSheetController, AlertController } from 'ionic-angular';
import { StockProvider } from '../../providers/stock/stock'
import { Storage } from '@ionic/storage';
import { FormGroup } from '@angular/forms'; 
import { Subscription } from 'rxjs';
import { DragulaService } from 'ng2-dragula';
import { TooltipsModule } from 'ionic-tooltips';

/**
 * Generated class for the StockMoveListPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'stock-move-list',
  templateUrl: 'stock-move-list.html',
})
export class StockMoveListPage {
  
  full_stock_moves: any
  ScanReader: FormGroup;
  default_warehouse: any
  move_state_filter: any
  move_status: any
  current_stock_moves: any
  owner_id: any
  users_list: any
  full_users_list: any
  filtered_users_ids: any
  current_pkg_info: any
  current_partner_pkg_list: any
  current_partner_arrival_pkgs_list: any
  current_selected_pkg: any
  current_selected_partner: any
  filtered_pkg_list: any
  filtered_arrival_pkg_list: any
  selected_partner_name: any
  selected_pkg_selected_shipping: any
  selected_pkg_delivery_carrier_id: any
  selected_pkg_selected_route_id: any
  selected_pkg_current_shipping_type: any
  passed_shipping_type: any
  passed_selected_partner: any
  passed_selected_pkg: any
  passed_current_list_shown: any
  current_list_shown: any
  selected_partner_default_shipping_type: any
  full_line_ids: any
  current_shipping_type: any
  selected_line_selected_shipping: any
  current_pkg_data: any
  multipleSelectionMain: boolean
  subs = new Subscription();
  packaging_line_ids

  constructor(public alertCtrl: AlertController, public actionSheetCtrl: ActionSheetController, public dragulaService: DragulaService,
     public navCtrl: NavController, public navParams: NavParams, public viewCtrl: ViewController, private storage: Storage,
      private stockInfo: StockProvider, private changeDetectorRef: ChangeDetectorRef) {
        this.move_state_filter = 0
        this.multipleSelectionMain = false;
        this.passed_selected_partner = this.navParams.data.current_selected_partner
        this.passed_selected_pkg = this.navParams.data.current_selected_pkg
        this.passed_shipping_type = this.navParams.data.current_shipping_type
        this.passed_current_list_shown = this.navParams.data.current_list_shown
        this.move_status = []
        this.users_list = []
        this.full_users_list = []
        this.filtered_users_ids = []
        this.current_pkg_info = []
        this.current_partner_pkg_list = []
        this.current_selected_pkg = []
        this.filtered_pkg_list = []
        this.full_line_ids = []
        this.current_selected_partner = []
        this.selected_pkg_current_shipping_type = false
        this.selected_partner_name = false
        this.selected_pkg_selected_shipping = false
        this.selected_pkg_delivery_carrier_id = false
        this.selected_pkg_selected_route_id = false
        this.current_list_shown = false
        this.selected_partner_default_shipping_type = false
        this.current_shipping_type = false
        this.current_partner_arrival_pkgs_list = []
        this.filtered_arrival_pkg_list = []
        this.selected_line_selected_shipping = []
        this.current_pkg_data = []
        this.packaging_line_ids = []
        this.move_status[0] = {
          'id': 0,
          'code': 'assigned',
          'name': 'Reservado',
          'index': 0
        }
        this.get_owner_id()

        // Dragula //

        this.subs.add(this.dragulaService.dropModel()
          .subscribe(({ el, target, source }) => {
            if (target.id == "pkgs" && source.id == "lines") {
              this.update_packages(parseInt(el.id), false, "new")
            } else if (target.id == "pkgs_info" && source.id == "lines") {
              this.update_packages(parseInt(el.id))
            } else if (target.id == "pkgs_info" && source.id == "arrival_pkgs") {
              this.add_package_content_to_package(parseInt(el.id))
            } 
          })
        );

        this.subs.add(this.dragulaService.removeModel()
          .subscribe(({ el, source }) => {
            if (source.id == "pkgs_info") {
              this.update_packages(parseInt(el.id), false, "unlink")
            } else if (source.id == "lines" || source.id == "arrival_pkgs") {
              this.reload_with_data(this.current_selected_partner, this.current_selected_pkg);
            }
          })
        );

        dragulaService.destroy("move_lines_container");

        dragulaService.createGroup("move_lines_container", {
          removeOnSpill: false,
          revertOnSpill: true,
          accepts: (el, target, source, sibling) => {
            // Para que no se puedan arrastrar otras líneas al contenedor.
            if(source.id == 'lines' && target.id == 'pkgs'){
              return true;
            } else if (source.id == 'lines' && this.current_selected_pkg && target.id == 'pkgs_info'){
              return true;
            } else if (source.id == 'arrival_pkgs' && this.current_selected_pkg && target.id == 'pkgs_info') {
              return true;
            } 
          }
        });
        
  }

  showDestroyConfirmation(package_id) {
    const confirm = this.alertCtrl.create({
      title: 'Eliminar paquete',
      message: 'Estás a punto de eliminar el paquete seleccionado, ¿deseas continuar?',
      buttons: [
        {
          text: 'Cancelar',
          handler: () => {
            this.reload_with_data(this.current_selected_partner, this.current_selected_pkg);
          }
        },
        {
          text: 'Aceptar',
          handler: () => {
            this.remove_pkg(package_id);
          }
        }
      ]
    });
    confirm.present();
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
  
  ionViewDidLoad() {
    console.log('ionViewDidLoad StockMoveListPage');
  }

  get_selected_warehouse(){
    this.storage.get('wh_output_stock_loc_id').then((val) => {
      this.default_warehouse = val
      this.get_users_list_apk()
      /* this.get_users_list() */
    })
  }

  get_owner_id(){
    this.storage.get('USER').then((val) => {
      this.owner_id = val
      this.get_selected_warehouse()
    })
  }

  get_users_list_apk() {
    this.stockInfo.get_users_list_for_apk(this.default_warehouse).then((lines:Array<{}>) => {
      this.users_list = lines
      if(this.passed_selected_partner) {
        this.get_partner_move_lines_apk(this.passed_selected_partner, this.passed_selected_pkg)
        if (this.passed_shipping_type) {
          this.current_shipping_type = this.passed_shipping_type;
        }
      }
      if(this.passed_current_list_shown) {
        this.current_list_shown = this.passed_current_list_shown;
      }
      this.changeDetectorRef.detectChanges()
      this.full_users_list = lines
      return this.users_list
    })
  }

  filter_users_list(ev: any) {

    this.users_list = this.full_users_list

    let val = ev.target.value;

    if(val && val.trim() != '') {
      this.users_list = this.users_list.filter((user) => {
        return (user['name'].toLowerCase().indexOf(val.toLowerCase()) > -1);
      })
    }

    this.changeDetectorRef.detectChanges()

  }

  filter_users_list_from_server(ev: any) {

    let val = ev.target.value;
    
    this.stockInfo.get_users_list_for_apk_from_search_box(val).then((lines:Array<{}>) => {
      this.users_list = lines;
    }).catch((mierror) => {
      this.full_stock_moves = []
      //this.stockInfo.presentAlert('Error de conexión', 'Error al recuperar los registros'+mierror + mierror)
      console.log(mierror)
    })

    this.changeDetectorRef.detectChanges()
  }

  get_user_name(partner_id) {
    let selected_partner = this.users_list.filter(x => x['id'] == partner_id)
    this.selected_partner_name = selected_partner[0]['name']
    this.selected_partner_default_shipping_type = selected_partner[0]['shipping_type'] || 'pasaran'
    this.changeDetectorRef.detectChanges()
  }

  get_partner_move_lines_apk(partner_id, current_selected_pkg=false) {
    this.current_selected_partner = partner_id
    this.current_selected_pkg = current_selected_pkg
    this.get_user_name(this.current_selected_partner)
    this.show_shipping_type('all')

    this.stockInfo.get_stock_move_lines_list_apk(partner_id, this.default_warehouse).then((lines:Array<{}>) => {
      console.log(lines)
      this.multipleSelectionMain = false;
      this.full_stock_moves = []
      this.filtered_arrival_pkg_list = []
      this.current_partner_pkg_list = []
      this.current_partner_arrival_pkgs_list = []
      this.selected_pkg_selected_shipping = false
      this.selected_pkg_delivery_carrier_id = false
      this.selected_pkg_selected_route_id = false
      this.selected_pkg_current_shipping_type = false
      this.filtered_pkg_list = []
      
      this.current_partner_pkg_list = lines['result_package_ids']
      this.full_stock_moves = lines['move_lines']
      this.current_partner_arrival_pkgs_list = lines['arrival_package_ids']
    }).catch((mierror) => {
      this.full_stock_moves = []
      //this.stockInfo.presentAlert('Error de conexión', 'Error al recuperar los registros'+mierror + mierror)
      console.log(mierror)
    })
    this.current_list_shown = 'move_list'
    if(this.current_selected_pkg != false){
      this.open_package(this.current_selected_pkg)
    }
  }

  show_partner_move_lines() {
    this.current_list_shown = 'move_list'
    this.changeDetectorRef.detectChanges()
  }

  show_partner_packages_arrivals() {
    this.current_list_shown = 'package_list'
    this.changeDetectorRef.detectChanges()
  }

  show_shipping_type(shipping_type, front=false) {
    this.current_shipping_type = shipping_type
    if (front==true) {
      this.current_selected_pkg = false
    }
    this.changeDetectorRef.detectChanges()
  }

  moves_filter_by_assigned_pkgs(value) {
    if (value == 0){
      this.current_list_shown = 'filtered_unassigned'
    } else {
      this.current_list_shown = 'filtered_assigned'
    }
    this.changeDetectorRef.detectChanges()
  }

  update_packages(move_ids, package_id=this.current_selected_pkg, action:any=false, partner_id=false){
    console.log(partner_id)

    this.stockInfo.update_object('stock.move.line', action, move_ids, false, package_id, partner_id).then((resultado:Array<{}>) => {
      if (resultado[0]) {
        this.current_selected_pkg = resultado[0] || false;
      }

      this.reload_with_data(this.current_selected_partner, this.current_selected_pkg, this.current_shipping_type)
    }).catch((mierror) => {
      this.reload_with_data(this.current_selected_partner, this.current_selected_pkg, this.current_shipping_type)
      console.log(mierror)
    })

  }

  add_package_content_to_package(package_id) {
    let action:any =false;

    if(this.current_selected_pkg == false){
      action = 'new';
    }

    this.stockInfo.update_object('stock.quant.package', action, [], package_id, this.current_selected_pkg, false).then((linea:Array<{}>) => {
      console.log(linea)
      this.reload_with_data(this.current_selected_partner, this.current_selected_pkg, this.current_shipping_type)
    }).catch((mierror) => {
      //this.stockInfo.presentAlert('Error de conexión', 'Error al recuperar los registros'+mierror);
      this.reload_with_data(this.current_selected_partner)
      console.log(mierror)
    })

    this.reload_with_data(this.current_selected_partner, this.current_selected_pkg, this.current_shipping_type)

  }

  open_package(package_id) {
    this.current_selected_pkg = package_id
    this.changeDetectorRef.detectChanges()
    this.stockInfo.get_package_lines(package_id).then((lineas:Array<{}>)=> {
      this.current_pkg_info = lineas['move_lines_info']
      this.current_pkg_data = lineas['package_info']
      this.packaging_line_ids = lineas['packaging_line_info']
      console.log(lineas['packaging_line_info'])
      console.log(this.packaging_line_ids)
    }).catch((mierror) => {
      //this.stockInfo.presentAlert('Error de conexión', 'Error al recuperar los registros'+mierror);
      this.reload_with_data(this.current_selected_partner, false, this.current_shipping_type)
      console.log(mierror)
    })
    this.stockInfo.get_package_info(package_id).then((lineas:Array<{}>) => {
      let current_shipping_selection = lineas[0]['shipping_type'] || lineas[0]['partner_default_shipping_type']
      if (current_shipping_selection == 'pasaran') {
        this.selected_pkg_current_shipping_type = "Pasarán"
      } else if(current_shipping_selection == 'urgent' && lineas[0]['delivery_carrier_id']) {
        this.selected_pkg_current_shipping_type = lineas[0]['delivery_carrier_id'][1] || false
      } else if (current_shipping_selection == 'route' && lineas[0]['selected_route']) {
        this.selected_pkg_current_shipping_type = lineas[0]['selected_route'][1] || false
      }
    }).catch((mierror) => {
      //this.stockInfo.presentAlert('Error de conexión', 'Error al recuperar los registros'+mierror);
      this.reload_with_data(this.current_selected_partner, false, this.current_shipping_type)
      console.log(mierror)
    })
    this.changeDetectorRef.detectChanges()
  }

  // Shipping type
  show_shipping_options(package_id) {
    this.stockInfo.get_package_info(package_id).then((lineas:Array<{}>) => {
      this.selected_pkg_selected_shipping = lineas[0]['shipping_type'] || false
      this.selected_pkg_delivery_carrier_id = lineas[0]['delivery_carrier_id'] || false
      this.selected_pkg_selected_route_id = lineas[0]['selected_route'] || false

      this.presentShippingSheet(package_id)
      this.changeDetectorRef.detectChanges()
    }).catch((mierror) => {
      //this.stockInfo.presentAlert('Error de conexión', 'Error al recuperar los registros'+mierror);
      this.reload_with_data(this.current_selected_partner, false, this.current_shipping_type)
      console.log(mierror)
    })
  }

  show_shipping_options_line(line_id) {
    console.log("linea: " + line_id)
    this.stockInfo.get_move_line_info(line_id).then((linea:Array<{}>)=> {
      console.log(linea)
      this.selected_line_selected_shipping = linea[0]['shipping_type']

      if (!linea[0]['result_package_id']) {
        this.presentShippingSheet(line_id, 'line')
        this.changeDetectorRef.detectChanges()
      }
    }).catch((mierror) => {
      //this.stockInfo.presentAlert('Error de conexión', 'Error al recuperar los registros'+mierror);
      this.reload_with_data(this.current_selected_partner, false, this.current_shipping_type)
      console.log(mierror)
    })
  }

  presentShippingSheet(package_id, type='pkg') {

    let buttons_list_shipping = []

    let shipping_type = this.create_shipping_type_button(package_id, 'Pasarán', 'pasaran', type)
    buttons_list_shipping.push(shipping_type)
    shipping_type = this.create_shipping_type_button(package_id, 'Urgente', 'urgent', type)
    buttons_list_shipping.push(shipping_type)
    shipping_type = this.create_shipping_type_button(package_id, 'Ruta', 'route', type)
    buttons_list_shipping.push(shipping_type)

    const actionSheet = this.actionSheetCtrl.create({
      title: 'Selecciona el método de envío',
      buttons: buttons_list_shipping,
      'cssClass': 'actionSheetContainer'
    });
    this.changeDetectorRef.detectChanges()
    actionSheet.present();
  }

  create_shipping_type_button(package_id, text, role, type) {
    
    let color = role + '-type'

    let shipping_type_button = {
      'text': text,
      'role': role,
      handler: () => {
        let valores = {
          'package': package_id,
          'shipping_type': role
        }
        this.set_shipping_type(package_id, valores, role, type)
      },
      'cssClass': 'actionSheetButton '+ color
    }

    if (this.selected_pkg_selected_shipping == role || this.selected_line_selected_shipping == role) {
      shipping_type_button['cssClass'] += ' selected'
      shipping_type_button['text'] = shipping_type_button['text']
    } 
    
    this.changeDetectorRef.detectChanges()
    return shipping_type_button

  }

  // Package

  remove_pkg(pkg_id) {
    this.stockInfo.delete_package(pkg_id).then((resultado:Array<{}>) => {
      this.reload_with_data(this.current_selected_partner, false, this.current_shipping_type)
    }).catch((mierror) => {
      //this.stockInfo.presentAlert('Error de conexión', 'Error al recuperar los registros'+mierror);
      this.reload_with_data(this.current_selected_partner, false, this.current_shipping_type)
      console.log(mierror)
    })
  }  

  // Reload

  reload_with_data(current_selected_partner, current_selected_pkg=false, current_shipping_type=false){
    let val = {'current_selected_partner': current_selected_partner, 'current_selected_pkg': current_selected_pkg, 'current_shipping_type': current_shipping_type, 'current_list_shown': this.current_list_shown}
    this.navCtrl.setRoot(StockMoveListPage, val)    
  }

  // Checkboxes selection

  multipleSelection(event) {
    let checkeableItems = this.full_stock_moves.filter(x => x)
    checkeableItems.forEach(item => {
      item.isChecked = event.checked;
    });
    this.changeDetectorRef.detectChanges()
  }

  simpleSelection(event, id) {
    let item = this.full_stock_moves.filter(x => x['id'] == id)
    item.isChecked = event.checked;
    this.changeDetectorRef.detectChanges()
  }

  add_multiple_lines_to_package(type='add') {
    let selectedItems = this.full_stock_moves.filter(x => x['isChecked'] == true);

    let move_line_ids = []
      selectedItems.forEach(item => {
        move_line_ids.push(item.id)
      });
    
    let action = "notnew"

    if(type=='add'){
      if (this.current_selected_pkg == false){
        action = "new"
      }
    } else if(type=='del'){
      this.current_selected_pkg=false;
      action='unlink'
    }
    
    this.stockInfo.update_object('stock.move.line', action, move_line_ids, false, this.current_selected_pkg, false).then((linea:Array<{}>) => {
      this.reload_with_data(this.current_selected_partner, this.current_selected_pkg, this.current_shipping_type);
    }).catch((mierror) => {
      //this.stockInfo.presentAlert('Error de conexión', 'Error al recuperar los registros'+mierror);
      this.reload_with_data(this.current_selected_partner, this.current_selected_pkg, this.current_shipping_type)
      console.log(mierror)
    })    
  }

  // Save shipping_type options

  set_shipping_type(id, values, role, type) {
    if(role == 'pasaran') {
      this.update_shipping_type(id, type, values, role);
    } else if (role == 'urgent') {
      this.show_delivery_carriers(id, type, values, role);
    } else if (role == 'route') {
      this.delivery_or_route_choice_selector(id, type, values, role);
    }
  }

  update_shipping_type(id, type, values, role) {
    if (type=='line') {
      values['move_line'] = id
      this.stockInfo.set_move_line_shipping_type(values).then((resultado:Array<{}>) => {
        this.reload_with_data(this.current_selected_partner, this.current_selected_pkg, role)
        this.changeDetectorRef.detectChanges()
      }).catch((mierror) => {
        //this.stockInfo.presentAlert('Error de conexión', 'Error al recuperar los registros'+mierror);
        this.reload_with_data(this.current_selected_partner, this.current_selected_pkg, role)
        console.log(mierror)
      })
    } else {
      console.log("valores que envío: " + values)
      this.stockInfo.set_package_shipping_type(values).then((resultado:Array<{}>) => {
        console.log("valores que envío: " + values)
        this.reload_with_data(this.current_selected_partner, id, role)
      }).catch((mierror) => {
        //this.stockInfo.presentAlert('Error de conexión', 'Error al recuperar los registros'+mierror);
        this.reload_with_data(this.current_selected_partner, this.current_selected_pkg)
        console.log(mierror)
      })
    }
  }

  delivery_or_route_choice_selector(id, type, values, role) {
    let buttons_list = []

    let carriers_button = {
      'text': 'Transportistas',
      'role': 'carriers',
      handler: () => {
        this.show_delivery_carriers(id, type, values, role);
      },
      'cssClass': 'actionSheetButton'
    }

    let routes_button = {
      'text': 'Rutas',
      'role': 'routes',
      handler: () => {
        this.show_route_options(id, type, values, role);
      },
      'cssClass': 'actionSheetButton'
    }

    buttons_list.push(carriers_button);
    buttons_list.push(routes_button);

    const actionSheet = this.actionSheetCtrl.create({
      title: 'Selecciona el método de envío',
      buttons: buttons_list,
      'cssClass': 'actionSheetContainer'
    });
    this.changeDetectorRef.detectChanges()
    actionSheet.present();
  }

  show_delivery_carriers(id, type, values, role) {
    let domain = [['active', '=', true]]
    this.stockInfo.get_delivery_carriers(domain).then((lineas:Array<{}>) => {
      this.present_delivery_sheet(id, lineas, type, values, role)
      this.changeDetectorRef.detectChanges()
    }).catch((mierror) => {
      //this.stockInfo.presentAlert('Error de conexión', 'Error al recuperar los registros'+mierror);
      this.reload_with_data(this.current_selected_partner, id)
      console.log(mierror)
    })
  }

  present_delivery_sheet(id, list, type, values, role) {

    let buttons_list = []

    list.forEach(carrier => {
        let carrier_button = {
          'text': carrier['name'],
          'role': carrier['id'],
          handler: () => {
            values['carrier_id'] = carrier['id']
            this.update_shipping_type(id, type, values, role)
          },
          'cssClass': 'actionSheetButton'
        }
        if (this.selected_pkg_delivery_carrier_id && this.selected_pkg_delivery_carrier_id[0] == carrier['id']) {
          carrier_button['cssClass'] += ' selected'
          carrier_button['text'] = '[x]' + carrier_button['text']
        }
        buttons_list.push(carrier_button)
    });

    const actionSheet = this.actionSheetCtrl.create({
      title: 'Selecciona el método de envío',
      buttons: buttons_list,
      'cssClass': 'actionSheetContainer'
    });
    this.changeDetectorRef.detectChanges()
    actionSheet.present();
  }

  show_route_options(id, type, values, role) {
    this.stockInfo.get_routes_for_apk().then((lineas:Array<{}>) => {
      this.present_routes_sheet(id, lineas, type, values, role)
      this.changeDetectorRef.detectChanges()
    }).catch((mierror) => {
      //this.stockInfo.presentAlert('Error de conexión', 'Error al recuperar los registros'+mierror);
      this.reload_with_data(this.current_selected_partner, false, this.current_shipping_type)
      console.log(mierror)
    })
  }

  present_routes_sheet(id, routes, type, values, role) {
    
    let buttons_list_routes = []

    routes.forEach(route => {
        let route_button = {
          'text': route['name'],
          'role': route['id'],
          handler: () => {
            values['delivery_route_path_id'] = route['id']
            this.update_shipping_type(id, type, values, role)
          },
          'cssClass': 'actionSheetButton'
        }
        
        if (this.selected_pkg_selected_route_id && this.selected_pkg_selected_route_id[0] == route['id']) {
          route_button['cssClass'] += ' selected'
          route_button['text'] = '[x]' + route_button['text']
        }
        buttons_list_routes.push(route_button)
        this.changeDetectorRef.detectChanges()
    });

    const actionSheet = this.actionSheetCtrl.create({
      title: 'Selecciona el método de envío',
      buttons: buttons_list_routes,
      'cssClass': 'actionSheetContainer'
    })

    this.changeDetectorRef.detectChanges()
    actionSheet.present();
  }



}