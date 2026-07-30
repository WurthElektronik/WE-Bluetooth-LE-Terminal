import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SettingsTab } from './SettingsTab';

describe('SettingsTabPage', () => {
	let component: SettingsTab;
	let fixture: ComponentFixture<SettingsTab>;

	beforeEach(waitForAsync(() => {
		TestBed.configureTestingModule({
			declarations: [SettingsTab],
			imports: [IonicModule.forRoot()],
		}).compileComponents();

		fixture = TestBed.createComponent(SettingsTab);
		component = fixture.componentInstance;
		fixture.detectChanges();
	}));

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
