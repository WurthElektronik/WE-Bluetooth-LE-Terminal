import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InfoTab } from './InfoTab';

const routes: Routes = [
  {
    path: '',
    component: InfoTab,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InfoRoutingModule {}
