import { TestBed } from '@angular/core/testing';

import { PrekeService } from './preke.service';

describe('PrekeService', () => {
  let service: PrekeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PrekeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
