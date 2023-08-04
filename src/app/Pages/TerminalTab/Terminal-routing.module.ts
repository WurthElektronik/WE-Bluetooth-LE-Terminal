import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TerminalTab } from './TerminalTab';

const routes: Routes = [
  {
    path: '',
    component: TerminalTab,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TerminalRoutingModule {}
