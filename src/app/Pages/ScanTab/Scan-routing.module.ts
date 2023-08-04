import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ScanTab } from './ScanTab';

const routes: Routes = [
  {
    path: '',
    component: ScanTab,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ScanTabRoutingModule {}
