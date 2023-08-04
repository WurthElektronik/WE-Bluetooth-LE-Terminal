import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { WhatsnewPage } from './whatsnew.page';

const routes: Routes = [
  {
    path: '',
    component: WhatsnewPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WhatsnewPageRoutingModule {}
