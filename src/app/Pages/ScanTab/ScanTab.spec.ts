import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ScanTab } from './ScanTab';

describe('ScanTab', () => {
  let component: ScanTab;
  let fixture: ComponentFixture<ScanTab>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ScanTab],
    }).compileComponents();

    fixture = TestBed.createComponent(ScanTab);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
