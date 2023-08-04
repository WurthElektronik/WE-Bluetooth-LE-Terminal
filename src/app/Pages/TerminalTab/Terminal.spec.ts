import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { TerminalTab } from './TerminalTab';

describe('Tab2Page', () => {
  let component: TerminalTab;
  let fixture: ComponentFixture<TerminalTab>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [TerminalTab],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(TerminalTab);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
