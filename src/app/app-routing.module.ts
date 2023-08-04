import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule)
  },
  {
    path: 'policy',
    loadChildren: () => import('./Pages/policy/policy.module').then( m => m.PolicyPageModule)
  },
  {
    path: 'imprint',
    loadChildren: () => import('./Pages/imprint/imprint.module').then( m => m.ImprintPageModule)
  },  {
    path: 'whatsnew',
    loadChildren: () => import('./Pages/whatsnew/whatsnew.module').then( m => m.WhatsnewPageModule)
  }

];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
