export enum ErrorCode {
  WrongPassword = 'wrong-password',
  BlockedAdmin = 'blocked-admin',
  AdminWithEmailNotFound = 'admin-with-email-not-found',
  AdminAlreadyExists = 'admin-already-exists',
  AdminNotFound = 'admin-not-found',
  InvalidPaginationParams = 'invalid-pagination-params',
  MaximumChunkSizeExceeded = 'maximum-chunk-size-100-exceeded',
  InvalidSortParams = 'invalid-sort-params',
  InvalidFilterParams = 'invalid-filter-params',
  FilterFieldNotAllowed = 'filter-field-not-allowed',
  FilterInvalidRule = 'filter-invalid-rule',
}
