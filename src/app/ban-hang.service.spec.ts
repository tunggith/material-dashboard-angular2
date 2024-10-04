import { TestBed } from '@angular/core/testing';

import { BanHangService } from './ban-hang.service';

describe('BanHangService', () => {
  let service: BanHangService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BanHangService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
