import { TestBed } from '@angular/core/testing';

import { BleService } from './ble.service';

describe('BleService', () => {
  let service: BleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
