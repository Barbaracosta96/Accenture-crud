import { Routes } from '@angular/router';

import { EmpresaListComponent } from './components/empresa/empresa-list/empresa-list.component';
import { EmpresaFormComponent } from './components/empresa/empresa-form/empresa-form.component';
import { FornecedorListComponent } from './components/fornecedor/fornecedor-list/fornecedor-list.component';
import { FornecedorFormComponent } from './components/fornecedor/fornecedor-form/fornecedor-form.component';

export const APP_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'empresas' },

  {
    path: 'empresas', 
    loadChildren: () => import('./components/empresa/empresa.routes').then(m => m.EMPRESA_ROUTES)
  },

  {
    path: 'fornecedores',
    loadChildren: () => import('./components/fornecedor/fornecedor.routes').then(m => m.FORNECEDOR_ROUTES)
  }

 
];

 
  { path: 'edit/:id', component: EmpresaFormComponent } 
];
*/


  { path: 'edit/:id', component: FornecedorFormComponent}
];
*/