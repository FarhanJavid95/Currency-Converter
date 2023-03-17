import { TestBed } from '@angular/core/testing';

import { LocalHistoryServiceService } from './local-history-service.service';

describe('LocalHistoryServiceService', () => {
  let service: LocalHistoryServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LocalHistoryServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
