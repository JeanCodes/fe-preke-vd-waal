import { TestBed } from '@angular/core/testing';

import { BybelBoekeService } from './bybel-boeke.service';

describe('BybelBoekeService', () => {
  let service: BybelBoekeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BybelBoekeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
