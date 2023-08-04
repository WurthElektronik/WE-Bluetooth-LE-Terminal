import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PolicyPage } from './policy.page';

const routes: Routes = [
  {
    path: '',
    component: PolicyPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PolicyPageRoutingModule {}
