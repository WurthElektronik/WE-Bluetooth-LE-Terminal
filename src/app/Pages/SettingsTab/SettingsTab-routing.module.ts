import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SettingsTab } from './SettingsTab';

const routes: Routes = [
	{
		path: '',
		component: SettingsTab,
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class SettingsTabRoutingModule {}
